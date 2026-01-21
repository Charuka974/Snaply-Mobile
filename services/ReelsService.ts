import { collection, doc, setDoc, serverTimestamp, orderBy, query, getDocs, getDoc, where } from "firebase/firestore";
import { db, auth } from "./firebase";
import { User } from "./userService";
import { PostMedia } from "./postService";

// export enum MediaType {
//   IMAGE = "image",
//   VIDEO = "video",
// }

// Type for a reel post
export type ReelPost = {
  id: string;
  user: User;
  video: PostMedia;
  caption: string;
  tags: string[];
  createdAt: Date;
};

export const loadReels = async (): Promise<ReelPost[]> => {
  const postsCol = collection(db, "posts");
  const q = query(postsCol, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  const reels: ReelPost[] = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();

    // Find first video in media array
    const video = data.media?.find((m: PostMedia) => m.type === "video");
    if (!video) continue; // skip non-video posts

    const userSnap = await getDocs(
      query(collection(db, "users"))
    );

    const userDoc = await getDocs(
      query(collection(db, "users"))
    );

    const userRef = await import("firebase/firestore").then(({ doc, getDoc }) =>
      getDoc(doc(db, "users", data.userId))
    );

    const userData = userRef.exists() ? userRef.data() : null;

    reels.push({
      id: docSnap.id,
      video,
      caption: data.caption || "",
      tags: data.tags || [],
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
      user: {
        id: data.userId,
        name: userData?.name || "Unknown",
        email: userData?.email || "",
        bio: userData?.bio || "",
        gender: userData?.gender ?? "prefer_not_to_say",
        role: userData?.role ?? "user",
        createdAt: userData?.createdAt?.toDate?.() ?? new Date(),
        profilePicture: userData?.profilePicture,
        followers: userData?.followers ?? [],
        following: userData?.following ?? [],
      },
    });
  }

  return reels;
};