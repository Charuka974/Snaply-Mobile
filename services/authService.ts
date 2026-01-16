import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  await updateProfile(userCred.user, {
    displayName: name,
  });

  await setDoc(doc(db, "users", userCred.user.uid), {
    name,
    email,
    role: "user",
    bio: "Just another Snaply user sharing moments.",
    createdAt: serverTimestamp(),
  });

  return userCred.user;
};

export const logout = async () => {
  await signOut(auth);
  await AsyncStorage.clear();
};
