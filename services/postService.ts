import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  orderBy,
  query,
  getDocs,
  getDoc,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { MediaType } from "./uploadService";
import { User } from "./userService";

// --- Types ---
export type PostMedia = {
  uri: string;
  type: MediaType;
};

export type Post = {
  id: string;
  userId: string;
  media: PostMedia[];
  caption: string;
  tags: string[];
  createdAt: Date;
};

export type PostWithUser = {
  id: string;
  userId: string;
  user: User;
  media: PostMedia[];
  caption: string;
  tags: string[];
  createdAt: Date;
};

// --- Collection Reference ---
const postsCollection = collection(db, "posts");

// --- Create Post ---
export const createPost = async ({
  media,
  caption,
  tags,
}: {
  media: PostMedia[];
  caption: string;
  tags: string[];
}): Promise<Post> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not authenticated");

  const postRef = doc(postsCollection);

  const newPost: Omit<Post, "id"> = {
    userId: currentUser.uid,
    media,
    caption,
    tags,
    createdAt: new Date(),
  };

  await setDoc(postRef, { ...newPost, createdAt: serverTimestamp() });

  return { id: postRef.id, ...newPost };
};

// --- Helper: Build User Object ---
const buildUser = (userId: string, userData: any): User => ({
  id: userId,
  name: userData?.name || "Unknown",
  email: userData?.email || "",
  bio: userData?.bio || "",
  gender: userData?.gender ?? "prefer_not_to_say",
  role: userData?.role ?? "user",
  createdAt: userData?.createdAt?.toDate?.() ?? new Date(),
  profilePicture: userData?.profilePicture,
  followers: userData?.followers ?? [],
  following: userData?.following ?? [],
});

// --- Load Posts (All) ---
export const loadPosts = async (): Promise<PostWithUser[]> => {
  const q = query(postsCollection, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  const posts: PostWithUser[] = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (!data?.userId) continue;

    const userSnap = await getDoc(doc(db, "users", data.userId));
    const userData = userSnap.exists() ? userSnap.data() : null;

    posts.push({
      id: docSnap.id,
      userId: data.userId,
      user: buildUser(data.userId, userData),
      media: Array.isArray(data.media) ? data.media : [],
      caption: typeof data.caption === "string" ? data.caption : "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    });
  }

  return posts;
};

// --- Load New Posts Since Date ---
export const loadRefreshPosts = async (options?: { since?: Date }): Promise<PostWithUser[]> => {
  let q;
  if (options?.since) {
    q = query(
      postsCollection,
      where("createdAt", ">", options.since),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(postsCollection, orderBy("createdAt", "desc"));
  }

  const snapshot = await getDocs(q);

  return await Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      if (!data?.userId) return null;

      const userSnap = await getDoc(doc(db, "users", data.userId));
      const userData = userSnap.exists() ? userSnap.data() : null;

      return {
        id: docSnap.id,
        userId: data.userId,
        user: buildUser(data.userId, userData),
        media: Array.isArray(data.media) ? data.media : [],
        caption: typeof data.caption === "string" ? data.caption : "",
        tags: Array.isArray(data.tags) ? data.tags : [],
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
      } as PostWithUser;
    })
  ).then((results) => results.filter(Boolean) as PostWithUser[]);
};

// --- Get My Posts (Post Only) ---
export const getMyPosts = async (): Promise<Post[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not authenticated");

  const q = query(
    postsCollection,
    where("userId", "==", currentUser.uid),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId: data?.userId ?? currentUser.uid,
      media: Array.isArray(data?.media) ? data.media : [],
      caption: typeof data?.caption === "string" ? data.caption : "",
      tags: Array.isArray(data?.tags) ? data.tags : [],
      createdAt: data?.createdAt?.toDate?.() ?? new Date(),
    };
  });
};

// --- Get My Posts With User ---
export const getMyPostsWithUser = async (): Promise<PostWithUser[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not authenticated");

  const q = query(postsCollection, where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  const userSnap = await getDoc(doc(db, "users", currentUser.uid));
  const userData = userSnap.exists() ? userSnap.data() : null;

  const user = buildUser(currentUser.uid, userData);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId: data?.userId ?? currentUser.uid,
      user,
      media: Array.isArray(data?.media) ? data.media : [],
      caption: typeof data?.caption === "string" ? data.caption : "",
      tags: Array.isArray(data?.tags) ? data.tags : [],
      createdAt: data?.createdAt?.toDate?.() ?? new Date(),
    };
  });
};

// --- Subscribe To User Posts ---
export const subscribeToUserPosts = (
  userId: string,
  callback: (posts: PostWithUser[]) => void
) => {
  const q = query(postsCollection, where("userId", "==", userId), orderBy("createdAt", "desc"));

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const userSnap = await getDoc(doc(db, "users", userId));
    const userData = userSnap.exists() ? userSnap.data() : null;
    const user = buildUser(userId, userData);

    const posts: PostWithUser[] = snapshot.docs
      .map((docSnap) => {
        const data = docSnap.data();
        if (!data?.userId) return null;

        return {
          id: docSnap.id,
          userId: data.userId,
          user,
          media: Array.isArray(data.media) ? data.media : [],
          caption: typeof data.caption === "string" ? data.caption : "",
          tags: Array.isArray(data.tags) ? data.tags : [],
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
        };
      })
      .filter(Boolean) as PostWithUser[];

    callback(posts);
  });

  return unsubscribe;
};

// --- Get Posts For Any User ---
export const getUserPosts = async (userId: string): Promise<PostWithUser[]> => {
  const q = query(postsCollection, where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  const userSnap = await getDoc(doc(db, "users", userId));
  const userData = userSnap.exists() ? userSnap.data() : null;
  const user = buildUser(userId, userData);

  return snapshot.docs
    .map((docSnap) => {
      const data = docSnap.data();
      if (!data?.userId) return null;

      return {
        id: docSnap.id,
        userId: data.userId,
        user,
        media: Array.isArray(data.media) ? data.media : [],
        caption: typeof data.caption === "string" ? data.caption : "",
        tags: Array.isArray(data.tags) ? data.tags : [],
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
      };
    })
    .filter(Boolean) as PostWithUser[];
};







// import { collection, doc, setDoc, serverTimestamp, orderBy, query, getDocs, getDoc, where, onSnapshot } from "firebase/firestore";
// import { db, auth } from "./firebase";
// import { MediaType } from "./uploadService";
// import { User } from "./userService";


// // Type for media
// export type PostMedia = {
//   uri: string;
//   type: MediaType;
// };

// // Type for a post
// export type Post = {
//   id: string;
//   userId: string;
//   media: PostMedia[];
//   caption: string;
//   tags: string[];
//   createdAt: Date;
// };

// // Type for a post with user
// export type PostWithUser = {
//   id: string;
//   user: User;        
//   media: PostMedia[];
//   caption: string;
//   tags: string[];
//   createdAt: Date;
// };

// // Firestore collection
// const postsCollection = collection(db, "posts");

// /**
//  * Create a new post in Firestore
//  */
// export const createPost = async ({
//   media,
//   caption,
//   tags,
// }: {
//   media: PostMedia[];
//   caption: string;
//   tags: string[];
// }): Promise<Post> => {
//   const currentUser = auth.currentUser;
//   if (!currentUser) throw new Error("User not authenticated");

//   const postRef = doc(postsCollection);
//   const newPost: Omit<Post, "id"> = {
//     userId: currentUser.uid,
//     media,
//     caption,
//     tags,
//     createdAt: new Date(),
//   };

//   await setDoc(postRef, {
//     ...newPost,
//     createdAt: serverTimestamp(),
//   });

//   return { id: postRef.id, ...newPost };
// };

// export const loadPosts = async () => {
//   const postsCol = collection(db, "posts");
//   const q = query(postsCol, orderBy("createdAt", "desc"));
//   const snapshot = await getDocs(q);

//   const posts: {
//     id: string;
//     user: User;
//     media: PostMedia[];
//     caption: string;
//     tags: string[];
//     createdAt: Date;
//   }[] = [];

//   for (const docSnap of snapshot.docs) {
//     const data = docSnap.data();
//     // Load user info
//     const userSnap = await getDoc(doc(db, "users", data.userId));
//     const userData = userSnap.exists() ? userSnap.data() : null;

//     posts.push({
//       id: docSnap.id,
//       user: {
//         id: data.userId,
//         name: userData?.name || "Unknown",
//         email: userData?.email || "",
//         bio: userData?.bio || "",
//         gender: userData?.gender ?? "prefer_not_to_say",
//         role: userData?.role ?? "user",
//         createdAt: userData?.createdAt?.toDate?.() ?? new Date(),
//         profilePicture: userData?.profilePicture,
//         followers: userData?.followers ?? [],
//         following: userData?.following ?? [],
//       },
//       media: data.media,
//       caption: data.caption,
//       tags: data.tags || [],
//       createdAt: data.createdAt?.toDate?.() ?? new Date(),
//     });
//   }

//   return posts;
// };


// export const loadRefreshPosts = async (options?: { since?: Date }) => {
//   const postsCol = collection(db, "posts");

//   let q;
//   if (options?.since) {
//     q = query(
//       postsCol,
//       where("createdAt", ">", options.since),
//       orderBy("createdAt", "desc"),
//       // optional: limit(20)
//     );
//   } else {
//     q = query(postsCol, orderBy("createdAt", "desc"));
//   }

//   const snapshot = await getDocs(q);

//   // Parallel user fetching
//   const posts = await Promise.all(
//     snapshot.docs.map(async (docSnap) => {
//       const data = docSnap.data();
//       const userSnap = await getDoc(doc(db, "users", data.userId));
//       const userData = userSnap.exists() ? userSnap.data() : null;

//       return {
//         id: docSnap.id,
//         user: {
//           id: data.userId,
//           name: userData?.name || "Unknown",
//           email: userData?.email || "",
//           bio: userData?.bio || "",
//           gender: userData?.gender ?? "prefer_not_to_say",
//           role: userData?.role ?? "user",
//           createdAt: userData?.createdAt?.toDate?.() ?? new Date(),
//           profilePicture: userData?.profilePicture,
//           followers: userData?.followers ?? [],
//           following: userData?.following ?? [],
//         },
//         media: data.media || [],
//         caption: data.caption || "",
//         tags: data.tags || [],
//         createdAt: data.createdAt?.toDate?.() ?? new Date(),
//       };
//     })
//   );

//   return posts;
// };




// // Get user specific posts
// /**
//  * Get posts created by the currently authenticated user
//  */
// export const getUserPosts = async (): Promise<Post[]> => {
//   const currentUser = auth.currentUser;
//   if (!currentUser) throw new Error("User not authenticated");

//   const postsCol = collection(db, "posts");
//   const q = query(
//     postsCol,
//     where("userId", "==", currentUser.uid),
//     orderBy("createdAt", "desc")
//   );

//   const snapshot = await getDocs(q);

//   return snapshot.docs.map((docSnap) => {
//     const data = docSnap.data();

//     return {
//       id: docSnap.id,
//       userId: data.userId,
//       media: data.media || [],
//       caption: data.caption || "",
//       tags: data.tags || [],
//       createdAt: data.createdAt?.toDate?.() ?? new Date(),
//     };
//   });
// };

// /**
//  * Get posts created by the currently authenticated user (with user info)
//  */
// export const getUserPostsWithUser = async (): Promise<PostWithUser[]> => {
//   const currentUser = auth.currentUser;
//   if (!currentUser) throw new Error("User not authenticated");

//   const postsCol = collection(db, "posts");
//   const q = query(
//     postsCol,
//     where("userId", "==", currentUser.uid),
//     orderBy("createdAt", "desc")
//   );

//   const snapshot = await getDocs(q);

//   // Fetch user once
//   const userSnap = await getDoc(doc(db, "users", currentUser.uid));
//   const userData = userSnap.exists() ? userSnap.data() : null;

//   const user: User = {
//     id: currentUser.uid,
//     name: userData?.name || "Unknown",
//     email: userData?.email || "",
//     bio: userData?.bio || "",
//     gender: userData?.gender ?? "prefer_not_to_say",
//     role: userData?.role ?? "user",
//     createdAt: userData?.createdAt?.toDate?.() ?? new Date(),
//     profilePicture: userData?.profilePicture,
//     followers: userData?.followers ?? [],
//     following: userData?.following ?? [],
//   };

//   return snapshot.docs.map((docSnap) => {
//     const data = docSnap.data();

//     return {
//       id: docSnap.id,
//       user,
//       media: data.media || [],
//       caption: data.caption || "",
//       tags: data.tags || [],
//       createdAt: data.createdAt?.toDate?.() ?? new Date(),
//     };
//   });
// };


// export const subscribeToUserPosts = (
//   userId: string,
//   callback: (posts: Post[]) => void
// ) => {
//   const q = query(
//     collection(db, "posts"),
//     where("userId", "==", userId),
//     orderBy("createdAt", "desc")
//   );

//   const unsubscribe = onSnapshot(q, (snapshot) => {
//     const posts: Post[] = snapshot.docs.map((doc) => {
//       const data = doc.data();
//       return {
//         id: doc.id,
//         userId: data.userId as string,
//         media: (data.media as PostMedia[]) || [],
//         caption: data.caption || "",
//         tags: (data.tags as string[]) || [],
//         createdAt: data.createdAt?.toDate?.() ?? new Date(),
//       };
//     });

//     callback(posts);
//   });

//   return unsubscribe;
// };

