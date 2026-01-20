import { collection, doc, setDoc, serverTimestamp, orderBy, query, getDocs, getDoc, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "./firebase";
import { MediaType } from "./uploadService";
import { User } from "./userService";


// Type for media
export type PostMedia = {
  uri: string;
  type: MediaType;
};

// Type for a post
export type Post = {
  id: string;
  userId: string;
  media: PostMedia[];
  caption: string;
  tags: string[];
  createdAt: Date;
};

// Type for a post with user
export type PostWithUser = {
  id: string;
  user: User;        
  media: PostMedia[];
  caption: string;
  tags: string[];
  createdAt: Date;
};

// Firestore collection
const postsCollection = collection(db, "posts");

/**
 * Create a new post in Firestore
 */
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

  await setDoc(postRef, {
    ...newPost,
    createdAt: serverTimestamp(),
  });

  return { id: postRef.id, ...newPost };
};

export const loadPosts = async () => {
  const postsCol = collection(db, "posts");
  const q = query(postsCol, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  const posts: {
    id: string;
    user: User;
    media: PostMedia[];
    caption: string;
    tags: string[];
    createdAt: Date;
  }[] = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    // Load user info
    const userSnap = await getDoc(doc(db, "users", data.userId));
    const userData = userSnap.exists() ? userSnap.data() : null;

    posts.push({
      id: docSnap.id,
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
      media: data.media,
      caption: data.caption,
      tags: data.tags || [],
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    });
  }

  return posts;
};


export const loadRefreshPosts = async (options?: { since?: Date }) => {
  const postsCol = collection(db, "posts");

  let q;
  if (options?.since) {
    q = query(
      postsCol,
      where("createdAt", ">", options.since),
      orderBy("createdAt", "desc"),
      // optional: limit(20)
    );
  } else {
    q = query(postsCol, orderBy("createdAt", "desc"));
  }

  const snapshot = await getDocs(q);

  // Parallel user fetching
  const posts = await Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      const userSnap = await getDoc(doc(db, "users", data.userId));
      const userData = userSnap.exists() ? userSnap.data() : null;

      return {
        id: docSnap.id,
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
        media: data.media || [],
        caption: data.caption || "",
        tags: data.tags || [],
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
      };
    })
  );

  return posts;
};




// Get user specific posts
/**
 * Get posts created by the currently authenticated user
 */
export const getUserPosts = async (): Promise<Post[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not authenticated");

  const postsCol = collection(db, "posts");
  const q = query(
    postsCol,
    where("userId", "==", currentUser.uid),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();

    return {
      id: docSnap.id,
      userId: data.userId,
      media: data.media || [],
      caption: data.caption || "",
      tags: data.tags || [],
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    };
  });
};

/**
 * Get posts created by the currently authenticated user (with user info)
 */
export const getUserPostsWithUser = async (): Promise<PostWithUser[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not authenticated");

  const postsCol = collection(db, "posts");
  const q = query(
    postsCol,
    where("userId", "==", currentUser.uid),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  // Fetch user once
  const userSnap = await getDoc(doc(db, "users", currentUser.uid));
  const userData = userSnap.exists() ? userSnap.data() : null;

  const user: User = {
    id: currentUser.uid,
    name: userData?.name || "Unknown",
    email: userData?.email || "",
    bio: userData?.bio || "",
    gender: userData?.gender ?? "prefer_not_to_say",
    role: userData?.role ?? "user",
    createdAt: userData?.createdAt?.toDate?.() ?? new Date(),
    profilePicture: userData?.profilePicture,
    followers: userData?.followers ?? [],
    following: userData?.following ?? [],
  };

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();

    return {
      id: docSnap.id,
      user,
      media: data.media || [],
      caption: data.caption || "",
      tags: data.tags || [],
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    };
  });
};


export const subscribeToUserPosts = (
  userId: string,
  callback: (posts: Post[]) => void
) => {
  const q = query(
    collection(db, "posts"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const posts: Post[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId as string,
        media: (data.media as PostMedia[]) || [],
        caption: data.caption || "",
        tags: (data.tags as string[]) || [],
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
      };
    });

    callback(posts);
  });

  return unsubscribe;
};