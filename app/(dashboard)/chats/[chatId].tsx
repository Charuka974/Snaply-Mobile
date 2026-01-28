import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { auth } from "@/services/firebase";
import {
  Message,
  sendMessage,
  subscribeToMessages,
  deleteMessageForMe,
  deleteMessageForEveryone,
} from "@/services/messageService";

const INPUT_HEIGHT = 48;

// ... existing imports ...

export default function ChatScreen() {
  const router = useRouter();
  const { chatId, name, photo } = useLocalSearchParams<{
    chatId: string;
    name?: string;
    photo?: string;
  }>();

  const [chatName, setChatName] = useState(name ?? "Chat");
  const [chatPhoto, setChatPhoto] = useState(photo ?? null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const currentUid = auth.currentUser?.uid ?? "";

  useEffect(() => {
    if (!chatId) return;
    const unsubscribe = subscribeToMessages(chatId, setMessages);
    return unsubscribe;
  }, [chatId]);

  const handleSend = async () => {
    if (!message.trim() || !chatId) return;
    try {
      await sendMessage(chatId, message.trim());
      setMessage("");
    } catch (err) {
      console.error("Send message failed:", err);
    }
  };

  const openDeleteModal = (msg: Message) => {
    setSelectedMessage(msg);
    setModalVisible(true);
  };

  const handleDeleteForMe = async () => {
    if (!chatId || !selectedMessage) return;
    try {
      await deleteMessageForMe(chatId, selectedMessage.id);
    } catch (err) {
      console.error("Delete for me failed:", err);
    } finally {
      setModalVisible(false);
      setSelectedMessage(null);
    }
  };

  const handleDeleteForEveryone = async () => {
    if (!chatId || !selectedMessage) return;
    try {
      await deleteMessageForEveryone(chatId, selectedMessage.id);
    } catch (err: any) {
      console.error("Delete for everyone failed:", err);
      alert(err.message || "Cannot delete this message");
    } finally {
      setModalVisible(false);
      setSelectedMessage(null);
    }
  };

  const isMessageDeleted = (msg: Message) =>
    msg.deletedForEveryone || msg.deletedFor.includes(currentUid);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#0a0e14" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 60}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-cyan-500/20">
        <View className="flex-row items-center space-x-3">
          {chatPhoto ? (
            <Image
              source={{ uri: chatPhoto }}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <View className="w-8 h-8 rounded-full bg-gray-500" />
          )}
          <Text className="text-cyan-400 text-lg font-semibold ml-2">
            {chatName}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 items-center justify-center rounded-full bg-cyan-500/10"
        >
          <Feather name="x" size={20} color="#22d3ee" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        initialNumToRender={12}
        contentContainerStyle={{ padding: 16, paddingBottom: 100, flexGrow: 1 }}
        renderItem={({ item }) => {
          const fromMe = item.senderId === currentUid;
          const deleted =
            item.deletedForEveryone || item.deletedFor.includes(currentUid);

          return (
            <View
              className="mb-4"
              style={{
                alignSelf: fromMe ? "flex-end" : "flex-start",
                maxWidth: "80%",
              }}
            >
              {/* Message Bubble */}
              <TouchableOpacity
                onLongPress={() => !deleted && openDeleteModal(item)}
                className={`rounded-xl p-3`}
                style={{
                  backgroundColor: deleted
                    ? "transparent"
                    : fromMe
                      ? "rgba(34, 211, 238, 0.8)"
                      : "rgba(63, 63, 70, 0.7)",
                }}
              >
                <Text
                  style={{
                    color: deleted ? "#a1a1aa" : fromMe ? "black" : "white",
                    fontStyle: deleted ? "italic" : "normal",
                    fontSize: 15,
                  }}
                >
                  {deleted ? "This message was deleted" : item.text}
                </Text>
              </TouchableOpacity>

              {/* Timestamp */}
              <Text
                style={{
                  fontSize: 11,
                  color: "#64748b",
                  marginTop: 2,
                  alignSelf: fromMe ? "flex-end" : "flex-start",
                }}
              >
                {item.createdAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          );
        }}
      />

      {/* Input area – unchanged */}
      <View className="flex-row items-center px-4 pt-2 pb-2 border-t border-cyan-500/10">
        <View
          className={`flex-1 flex-row items-center bg-slate-900/40 rounded-full px-4 border ${
            message.trim() ? "border-cyan-500/30" : "border-zinc-500/20"
          }`}
          style={{ height: INPUT_HEIGHT }}
        >
          <Feather
            name="message-circle"
            size={18}
            color={message.trim() ? "#22d3ee" : "#64748b"}
          />
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor="#64748b"
            className="flex-1 h-full text-white text-[15px] ml-2"
          />
        </View>

        <TouchableOpacity
          onPress={handleSend}
          disabled={!message.trim()}
          className={`ml-3 px-5 rounded-full items-center justify-center ${
            message.trim() ? "bg-cyan-400" : "bg-zinc-500/20"
          }`}
          style={{ height: INPUT_HEIGHT }}
        >
          <Text
            className={`font-semibold text-[15px] ${
              message.trim() ? "text-[#0a0e14]" : "text-zinc-400"
            }`}
          >
            Send
          </Text>
        </TouchableOpacity>
      </View>

      {/* Delete Modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/60">
          <View className="bg-[#1a1f27] rounded-xl p-4 w-11/12">
            <Text className="text-white text-lg font-semibold mb-4">
              Delete message
            </Text>
            <Text className="text-zinc-400 mb-6">
              {selectedMessage?.senderId === currentUid
                ? "Delete for yourself or everyone?"
                : "Delete for yourself?"}
            </Text>

            <View className="flex-row gap-3 justify-end">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="min-w-[80px] px-4 py-2 rounded-lg bg-zinc-700"
              >
                <Text className="text-white font-medium text-center">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeleteForMe}
                className="min-w-[80px] px-4 py-2 rounded-lg bg-cyan-600"
              >
                <Text className="text-white font-medium text-center">
                  For Me
                </Text>
              </TouchableOpacity>

              {selectedMessage?.senderId === currentUid && (
                <TouchableOpacity
                  onPress={handleDeleteForEveryone}
                  className="min-w-[80px] px-4 py-2 rounded-lg bg-red-600"
                >
                  <Text className="text-white font-medium text-center">
                    Everyone
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
