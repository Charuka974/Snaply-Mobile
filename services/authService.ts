import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Gender } from "./userService";

export const login = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const userCred = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const DEFAULT_GENDER: Gender = "prefer_not_to_say";

  await updateProfile(userCred.user, {
    displayName: name,
  });

  await setDoc(doc(db, "users", userCred.user.uid), {
    name,
    email,
    role: "user",
    bio: "Just another Snaply user sharing moments.",
    gender: DEFAULT_GENDER,
    createdAt: serverTimestamp(),
  });

  return userCred.user;
};

export const logout = async () => {
  await signOut(auth);
  await AsyncStorage.clear();
};
