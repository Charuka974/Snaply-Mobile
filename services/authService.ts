import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
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


// Reset password function
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email); // pass auth
    return { success: true };
  } catch (error: any) {
    console.error("Password reset error:", error);
    let message = "Failed to send reset email";
    if (error.code === "auth/user-not-found") {
      message = "No user found with this email";
    } else if (error.code === "auth/invalid-email") {
      message = "Invalid email address";
    }
    return { success: false, message };
  }
};


