import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { buildUser, PostWithUser } from "./postService";

// -------------------- Types --------------------
export type Like = {
  userId: string;
  likedAt: Date;
};

// -------------------- Likes --------------------

// Like a post
export const likePost = async (postId: string) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not authenticated");

  const postLikeRef = doc(db, "posts", postId, "likes", currentUser.uid);
  const userLikeRef = doc(db, "users", currentUser.uid, "likedPosts", postId);

  await Promise.all([
    setDoc(postLikeRef, { likedAt: serverTimestamp() }),
    setDoc(userLikeRef, { likedAt: serverTimestamp() }),
  ]);
};

// Unlike a post
export const unlikePost = async (postId: string) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not authenticated");

  await Promise.all([
    deleteDoc(doc(db, "posts", postId, "likes", currentUser.uid)),
    deleteDoc(doc(db, "users", currentUser.uid, "likedPosts", postId)),
  ]);
};

// Check if user liked a post
export const isPostLikedByUser = async (postId: string): Promise<boolean> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return false;

  const snap = await getDoc(doc(db, "posts", postId, "likes", currentUser.uid));
  return snap.exists();
};

// Subscribe to likes in real-time
export const subscribeToLikes = (
  postId: string,
  callback: (likes: Like[]) => void
) => {
  const likesCol = collection(db, "posts", postId, "likes");
  const unsubscribe = onSnapshot(likesCol, (snapshot) => {
    const likes: Like[] = snapshot.docs.map((docSnap) => ({
      userId: docSnap.id,
      likedAt: docSnap.data().likedAt?.toDate?.() ?? new Date(),
    }));
    callback(likes);
  });
  return unsubscribe;
};

// Get current user's liked posts
export const getMyLikedPosts = async (): Promise<PostWithUser[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];

  const q = query(
    collection(db, "users", currentUser.uid, "likedPosts"),
    orderBy("likedAt", "desc")
  );

  const snap = await getDocs(q);

  const posts = await Promise.all(
    snap.docs.map(async (docSnap) => {
      const postSnap = await getDoc(doc(db, "posts", docSnap.id));
      if (!postSnap.exists()) return null;

      const data = postSnap.data();
      const userSnap = await getDoc(doc(db, "users", data.userId));

      return {
        id: postSnap.id,
        userId: data.userId,
        user: buildUser(data.userId, userSnap.data()),
        media: data.media ?? [],
        caption: data.caption ?? "",
        tags: data.tags ?? [],
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
      };
    })
  );

  return posts.filter(Boolean) as PostWithUser[];
};

// -------------------- Bookmarks --------------------

// Bookmark a post
export const bookmarkPost = async (postId: string) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not authenticated");

  await setDoc(doc(db, "users", currentUser.uid, "bookmarkedPosts", postId), {
    savedAt: serverTimestamp(),
  });
};

// Remove bookmark
export const unbookmarkPost = async (postId: string) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not authenticated");

  await deleteDoc(doc(db, "users", currentUser.uid, "bookmarkedPosts", postId));
};

// Check if post is bookmarked
export const isPostBookmarkedByUser = async (postId: string): Promise<boolean> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return false;

  const snap = await getDoc(doc(db, "users", currentUser.uid, "bookmarkedPosts", postId));
  return snap.exists();
};

// Subscribe to bookmarks in real-time
export const subscribeToBookmarks = (
  postId: string,
  callback: (bookmarked: boolean) => void
) => {
  const docRef = doc(db, "users", auth.currentUser!.uid, "bookmarkedPosts", postId);
  const unsubscribe = onSnapshot(docRef, (snap) => {
    callback(snap.exists());
  });
  return unsubscribe;
};

// Get current user's bookmarked posts
export const getMyBookmarkedPosts = async (): Promise<PostWithUser[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];

  const q = query(
    collection(db, "users", currentUser.uid, "bookmarkedPosts"),
    orderBy("savedAt", "desc")
  );

  const snap = await getDocs(q);

  const posts = await Promise.all(
    snap.docs.map(async (docSnap) => {
      const postSnap = await getDoc(doc(db, "posts", docSnap.id));
      if (!postSnap.exists()) return null;

      const data = postSnap.data();
      const userSnap = await getDoc(doc(db, "users", data.userId));

      return {
        id: postSnap.id,
        userId: data.userId,
        user: buildUser(data.userId, userSnap.data()),
        media: data.media ?? [],
        caption: data.caption ?? "",
        tags: data.tags ?? [],
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
      };
    })
  );

  return posts.filter(Boolean) as PostWithUser[];
};
