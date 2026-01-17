import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter } from "expo-router";

const mockComments = [
  { id: "1", user: "alex_dev", text: "This is fire 🔥", time: "2h" },
  { id: "2", user: "liya.design", text: "Clean vibes ✨", time: "5h" },
  {
    id: "3",
    user: "john.mp4",
    text: "Late night coding hits different",
    time: "12h",
  },
];

const INPUT_HEIGHT = 48;

export default function CommentsScreen() {
  const router = useRouter();
  const [comment, setComment] = useState("");

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#0a0e14]" behavior="padding">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-cyan-500/10">
        <Text className="text-white font-semibold text-base">Comments</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 items-center justify-center rounded-full bg-cyan-500/10"
        >
          <Feather name="x" size={20} color="#22d3ee" />
        </TouchableOpacity>
      </View>

      {/* Comments list */}
      <FlatList
        data={mockComments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View className="mb-5 p-3.5 rounded-xl border-l-4 border-cyan-500 bg-slate-900/30">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-cyan-500 font-semibold text-sm">
                @{item.user}
              </Text>
              <Text className="text-zinc-400 text-xs">{item.time}</Text>
            </View>
            <Text className="text-slate-200 text-[15px] leading-5">
              {item.text}
            </Text>
          </View>
        )}
      />

      {/* Input */}
      <View className="flex-row items-center px-4 pt-2 pb-4 border-t border-cyan-500/10 bg-[#0f1419]">
        <View
          style={{ height: INPUT_HEIGHT }}
          className={`flex-1 flex-row items-center bg-slate-900/40 rounded-full px-4 border mb-5 ${
            comment.trim() ? "border-cyan-500/30" : "border-zinc-500/20"
          }`}
        >
          <Feather
            name="message-circle"
            size={18}
            color={comment.trim() ? "#22d3ee" : "#64748b"}
            className="mr-2"
          />
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Add a comment..."
            placeholderTextColor="#64748b"
            className="flex-1 h-full text-white text-[15px]"
          />
        </View>

        <TouchableOpacity
          disabled={!comment.trim()}
          style={{ height: INPUT_HEIGHT }}
          className={`ml-3 px-5 rounded-full items-center justify-center mb-5 ${
            comment.trim() ? "bg-cyan-400" : "bg-zinc-500/20"
          }`}
        >
          <Text
            className={`font-semibold text-[15px] ${comment.trim() ? "text-[#0a0e14]" : "text-zinc-400"}`}
          >
            Post
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
