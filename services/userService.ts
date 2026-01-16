import {
  doc,
  setDoc,
  updateDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { uploadUserAvatar } from "./uploadService";

export type User = {
  id: string;
  name: string;
  email: string;
  bio: string;
  role: "user" | "admin";
  createdAt: Date;
  profilePicture?: string;
  followers?: string[];
  following?: string[];
};

const usersCollection = collection(db, "users");

export const createUser = async (
  name: string,
  email: string,
  bio = "Just another Snaply user sharing moments.",
  role: "user" | "admin" = "user",
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
    createdAt: d.createdAt?.toDate?.() ?? new Date(),
    profilePicture: d.profilePicture,
    followers: d.followers ?? [],
    following: d.following ?? [],
  };
};

export const updateMyProfile = async ({
  name,
  bio,
  avatarFile,
  currentProfilePicture, // pass the current profile picture URL
}: {
  name: string;
  bio: string;
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
      createdAt: d.createdAt?.toDate?.() ?? new Date(),
      profilePicture: d.profilePicture,
      followers: d.followers ?? [],
      following: d.following ?? [],
    });
  });
};
