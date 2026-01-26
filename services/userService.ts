import {
  doc,
  setDoc,
  updateDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  getDoc,
  getDocs,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { uploadUserAvatar } from "./uploadService";

export type User = {
  id: string;
  name: string;
  email: string;
  bio: string;
  gender: Gender;
  role: "user" | "admin";
  createdAt: Date;
  profilePicture?: string;
  followers?: string[];
  following?: string[];
};

export type FeedUser = {
  id: string;
  name: string;
  email: string;
  bio: string;
  gender: "male" | "female" | "prefer_not_to_say";
  role: "user" | "admin";
  createdAt: Date;
  profilePicture?: string;
  followers?: string[];
  following?: string[];
};

export type Gender =
  | "male"
  | "female"
  | "prefer_not_to_say";


const usersCollection = collection(db, "users");

export const createUser = async (
  name: string,
  email: string,
  bio = "Just another Snaply user sharing moments.",
  role: "user" | "admin" = "user",
  gender: Gender = "prefer_not_to_say",
  profilePicture = ""
): Promise<User> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not authenticated");

  const ref = doc(db, "users", currentUser.uid);
  await setDoc(ref, {
    name,
    email,
    bio,
    role,
    gender,
    profilePicture,
    createdAt: serverTimestamp(),
    followers: [],
    following: [],
  });

  return {
    id: currentUser.uid,
    name,
    email,
    bio,
    role,
    gender,
    createdAt: new Date(),
    profilePicture,
    followers: [],
    following: [],
  };
};

export const loadMyData = async (): Promise<User | null> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const snap = await getDoc(doc(db, "users", currentUser.uid));
  if (!snap.exists()) return null;

  const d = snap.data();
  return {
    id: snap.id,
    name: d.name,
    email: d.email,
    bio: d.bio,
    role: d.role,
    gender: d.gender ?? "prefer_not_to_say",
    createdAt: d.createdAt?.toDate?.() ?? new Date(),
    profilePicture: d.profilePicture,
    followers: d.followers ?? [],
    following: d.following ?? [],
  };
};

export const updateMyProfile = async ({
  name,
  bio,
  gender,
  avatarFile,
  currentProfilePicture, // pass the current profile picture URL
}: {
  name: string;
  bio: string;
  gender?: Gender;
  avatarFile?: string | File;
  currentProfilePicture?: string;
}) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not authenticated");

  let profilePicture: string | undefined;

  // Only upload if the avatar is new
  if (avatarFile) {
    // For web: File object, for native: URI string
    const isNewAvatar =
      (typeof avatarFile === "string" && avatarFile !== currentProfilePicture) ||
      (avatarFile instanceof File);

    if (isNewAvatar) {
      profilePicture = await uploadUserAvatar(avatarFile);
    }
  }

  await updateDoc(doc(db, "users", currentUser.uid), {
    name,
    bio,
    gender,
    ...(profilePicture && { profilePicture }),
  });
};


export const subscribeToMyData = (cb: (u: User | null) => void) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return () => {};

  return onSnapshot(doc(db, "users", currentUser.uid), (snap) => {
    if (!snap.exists()) return cb(null);
    const d = snap.data();
    cb({
      id: snap.id,
      name: d.name,
      email: d.email,
      bio: d.bio,
      role: d.role,
      gender: d.gender ?? "prefer_not_to_say",
      createdAt: d.createdAt?.toDate?.() ?? new Date(),
      profilePicture: d.profilePicture,
      followers: d.followers ?? [],
      following: d.following ?? [],
    });
  });
};


export const loadFeedUsers = async (): Promise<User[]> => {
  const usersCol = collection(db, "users");
  const snapshot = await getDocs(usersCol);

  const users: User[] = snapshot.docs.map((docSnap) => {
    const d = docSnap.data();
    return {
      id: docSnap.id,
      name: d.name,
      email: d.email,
      bio: d.bio,
      role: d.role,
      gender: d.gender ?? "prefer_not_to_say",
      createdAt: d.createdAt?.toDate?.() ?? new Date(),
      profilePicture: d.profilePicture,
      followers: d.followers ?? [],
      following: d.following ?? [],
    };
  });

  return users;
};


export const getUserById = async (uid: string): Promise<User | null> => {
  if (!uid) return null;

  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;

  const d = snap.data();
  return {
    id: snap.id,
    name: d.name,
    email: d.email,
    bio: d.bio,
    role: d.role,
    gender: (d.gender ?? "prefer_not_to_say") as Gender,
    createdAt: d.createdAt?.toDate?.() ?? new Date(),
    profilePicture: d.profilePicture,
    followers: d.followers ?? [],
    following: d.following ?? [],
  };
};


// Follow a user
export const followUser = async (currentUid: string, targetUid: string) => {
  if (currentUid === targetUid) return; // cannot follow yourself

  const currentUserRef = doc(db, "users", currentUid);
  const targetUserRef = doc(db, "users", targetUid);

  try {
    // Add current user to target's followers
    await updateDoc(targetUserRef, {
      followers: arrayUnion(currentUid),
    });

    // Add target user to current user's following
    await updateDoc(currentUserRef, {
      following: arrayUnion(targetUid),
    });
  } catch (err) {
    console.error("Failed to follow user:", err);
    throw err;
  }
};

// Unfollow a user
export const unfollowUser = async (currentUid: string, targetUid: string) => {
  if (currentUid === targetUid) return; // cannot unfollow yourself

  const currentUserRef = doc(db, "users", currentUid);
  const targetUserRef = doc(db, "users", targetUid);

  try {
    // Remove current user from target's followers
    await updateDoc(targetUserRef, {
      followers: arrayRemove(currentUid),
    });

    // Remove target user from current user's following
    await updateDoc(currentUserRef, {
      following: arrayRemove(targetUid),
    });
  } catch (err) {
    console.error("Failed to unfollow user:", err);
    throw err;
  }
};


export const subscribeToUser = (uid: string, cb: (user: User | null) => void) => {
  const userRef = doc(db, "users", uid);

  return onSnapshot(userRef, (snap) => {
    if (!snap.exists()) return cb(null);
    const d = snap.data();
    cb({
      id: snap.id,
      name: d.name,
      email: d.email,
      bio: d.bio,
      role: d.role,
      gender: d.gender ?? "prefer_not_to_say",
      createdAt: d.createdAt?.toDate?.() ?? new Date(),
      profilePicture: d.profilePicture,
      followers: d.followers ?? [],
      following: d.following ?? [],
    });
  });
};
