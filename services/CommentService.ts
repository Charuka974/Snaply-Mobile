import { collection, doc, setDoc, serverTimestamp, orderBy, query, getDocs, getDoc, where, onSnapshot, deleteDoc } from "firebase/firestore";
import { db, auth } from "./firebase";

// Comment type
export type Comment = {
  id: string;
  userId: string;
  text: string;
  createdAt: Date;
};

// Extended comment with user info
export type CommentWithUser = Comment & {
  username: string;
  avatar?: string;
};

// Add a comment to a post
export const addComment = async (postId: string, text: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not authenticated");

  const commentRef = doc(collection(db, "posts", postId, "comments"));
  await setDoc(commentRef, {
    userId: currentUser.uid,
    text,
    createdAt: serverTimestamp(),
  });
};

// Fetch comments for a post and populate username/avatar
export const getCommentsWithUser = async (postId: string): Promise<CommentWithUser[]> => {
  const q = query(
    collection(db, "posts", postId, "comments"),
    orderBy("createdAt", "asc")
  );

  const snapshot = await getDocs(q);

  return Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      let username = "Unknown";
      let avatar: string | undefined;

      try {
        const userRef = doc(db, "users", data.userId);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : null;
        username = userData?.name || username;
        avatar = userData?.profilePicture;
      } catch {
        // fallback already set
      }

      return {
        id: docSnap.id,
        userId: data.userId,
        text: data.text,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        username,
        avatar,
      };
    })
  );
};

// Subscribe to comments in real-time
export const subscribeToComments = (
  postId: string,
  callback: (comments: CommentWithUser[]) => void
) => {
  const q = query(
    collection(db, "posts", postId, "comments"),
    orderBy("createdAt", "asc")
  );

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const commentsWithUser: CommentWithUser[] = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        let username = "Unknown";
        let avatar: string | undefined;

        try {
          const userRef = doc(db, "users", data.userId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists() ? userSnap.data() : null;
          username = userData?.name || username;
          avatar = userData?.profilePicture;
        } catch {}

        return {
          id: docSnap.id,
          userId: data.userId,
          text: data.text,
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
          username,
          avatar,
        };
      })
    );

    callback(commentsWithUser);
  });

  return unsubscribe;
};


export const deleteComment = async (postId: string, commentId: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not authenticated");

  const commentRef = doc(db, "posts", postId, "comments", commentId);

  // Verify ownership
  const commentSnap = await getDoc(commentRef);
  if (!commentSnap.exists()) throw new Error("Comment not found");

  const commentData = commentSnap.data();
  if (commentData.userId !== currentUser.uid) {
    throw new Error("You can only delete your own comments");
  }

  // Delete comment
  await deleteDoc(commentRef);
};