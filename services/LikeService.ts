import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "./firebase";

// Like type
export type Like = {
  userId: string;
  likedAt: Date;
};

// Like a post
export const likePost = async (postId: string) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not authenticated");

  const likeRef = doc(db, "posts", postId, "likes", currentUser.uid);
  await setDoc(likeRef, {
    likedAt: serverTimestamp(),
  });
};

// Unlike a post
export const unlikePost = async (postId: string) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not authenticated");

  await deleteDoc(doc(db, "posts", postId, "likes", currentUser.uid));
};

// Check if the current user liked the post
export const isPostLikedByUser = async (postId: string): Promise<boolean> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return false;

  const likeSnap = await getDoc(doc(db, "posts", postId, "likes", currentUser.uid));
  return likeSnap.exists();
};

// Subscribe to likes in real-time
export const subscribeToLikes = (
  postId: string,
  callback: (likes: Like[]) => void
) => {
  const likesCol = collection(db, "posts", postId, "likes");

  const unsubscribe = onSnapshot(likesCol, (snapshot) => {
    const likes: Like[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        userId: docSnap.id,
        likedAt: data.likedAt?.toDate?.() ?? new Date(),
      };
    });

    callback(likes);
  });

  return unsubscribe;
};
