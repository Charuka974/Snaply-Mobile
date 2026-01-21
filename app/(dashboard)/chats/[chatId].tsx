import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router"; // <-- changed here
import { Feather } from "@expo/vector-icons";

const mockMessages = [
  { id: "1", fromMe: false, text: "Hey, how are you?" },
  { id: "2", fromMe: true, text: "I'm good! Working on a new project." },
  { id: "3", fromMe: false, text: "That's awesome 😎" },
];

const INPUT_HEIGHT = 48;

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); // <-- use this instead of useSearchParams
  const chatId = params.chatId as string; // convert to string
  const [message, setMessage] = useState("");

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#0a0e14]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-cyan-500/20">
        <Text className="text-cyan-400 text-lg font-semibold">Chat</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 items-center justify-center rounded-full bg-cyan-500/10"
        >
          <Feather name="x" size={20} color="#22d3ee" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        data={mockMessages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        renderItem={({ item }) => (
          <View
            className={`mb-3 p-3 rounded-xl ${
              item.fromMe
                ? "bg-cyan-500/30 self-end"
                : "bg-zinc-900/40 self-start"
            } max-w-3/4`}
          >
            <Text className={`${item.fromMe ? "text-black" : "text-white"}`}>
              {item.text}
            </Text>
          </View>
        )}
      />

      {/* Input */}
      <View className="flex-row items-center px-4 pt-2 pb-4 border-t border-cyan-500/10 bg-[#0f1419]">
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
            className="mr-2"
          />
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor="#64748b"
            className="flex-1 h-full text-white text-[15px]"
          />
        </View>

        <TouchableOpacity
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
    </KeyboardAvoidingView>
  );
}
