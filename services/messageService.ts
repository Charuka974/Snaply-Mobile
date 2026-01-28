import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";

/* =======================
   TYPES
======================= */

export type Chat = {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
};

export type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt: Date;
  readBy: string[];
  deletedFor: string[];         
  deletedForEveryone?: boolean;  
};

/* =======================
   HELPERS
======================= */

export const getChatId = (uid1: string, uid2: string) =>
  [uid1, uid2].sort().join("_");

/* =======================
   CHAT CREATION
======================= */

export const getOrCreateChat = async (
  otherUserId: string
): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  const chatId = getChatId(currentUser.uid, otherUserId);
  const chatRef = doc(db, "chats", chatId);

  const snap = await getDoc(chatRef);

  if (!snap.exists()) {
    await setDoc(chatRef, {
      participants: [currentUser.uid, otherUserId],
      createdAt: serverTimestamp(),
      lastMessage: "",
      lastMessageAt: serverTimestamp(),
    });
  }

  return chatId;
};

/* =======================
   SEND MESSAGE
======================= */

export const sendMessage = async (
  chatId: string,
  text: string
) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  const messagesRef = collection(db, "chats", chatId, "messages");

  await addDoc(messagesRef, {
    senderId: currentUser.uid,
    text,
    createdAt: serverTimestamp(),
    readBy: [currentUser.uid],
  });

  await updateDoc(doc(db, "chats", chatId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
  });
};


/* =======================
   USER CHAT LIST
======================= */

export const subscribeToMyChats = (
  cb: (chats: Chat[]) => void
) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return () => {};

  const chatsRef = collection(db, "chats");

  const q = query(
    chatsRef,
    orderBy("lastMessageAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const chats: Chat[] = snapshot.docs
      .map((docSnap) => {
        const d = docSnap.data();

        if (!d.participants.includes(currentUser.uid)) return null;

        return {
          id: docSnap.id,
          participants: d.participants,
          lastMessage: d.lastMessage,
          lastMessageAt: d.lastMessageAt?.toDate?.(),
          createdAt: d.createdAt?.toDate?.() ?? new Date(),
        };
      })
      .filter(Boolean) as Chat[];

    cb(chats);
  });
};

/* =====================================
   DELETE MESSAGE – FOR ME
   ===================================== */
export const deleteMessageForMe = async (
  chatId: string,
  messageId: string
) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  const messageRef = doc(db, "chats", chatId, "messages", messageId);

  await updateDoc(messageRef, {
    deletedFor: arrayUnion(currentUser.uid),  
  });
};

/* =====================================
   DELETE MESSAGE – FOR EVERYONE
   ===================================== */
export const deleteMessageForEveryone = async (
  chatId: string,
  messageId: string
) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  const messageRef = doc(db, "chats", chatId, "messages", messageId);
  const snap = await getDoc(messageRef);

  if (!snap.exists()) throw new Error("Message not found");

  const data = snap.data();
  if (data?.senderId !== currentUser.uid) {
    throw new Error("Only the sender can delete for everyone");
  }

  await updateDoc(messageRef, {
    text: "",                         // clear text
    deletedForEveryone: true,         // main flag
    
  });
};

/* =====================================
   Real-time subscription 
   ===================================== */
export const subscribeToMessages = (
  chatId: string,
  cb: (messages: Message[]) => void
) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return () => {};

  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = snapshot.docs
      .map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          senderId: d.senderId,
          text: d.text ?? "",
          createdAt: d.createdAt?.toDate?.() ?? new Date(),
          readBy: d.readBy ?? [],
          deletedFor: d.deletedFor ?? [],
          deletedForEveryone: !!d.deletedForEveryone,
        };
      })
      .filter(
        (msg) =>
          !msg.deletedFor.includes(currentUser.uid) &&
          !msg.deletedForEveryone
      );

    cb(messages);
  });
};