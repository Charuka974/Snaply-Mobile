import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  CommentWithUser,
  addComment,
  deleteComment,
  subscribeToComments,
} from "@/services/CommentService";
import { auth } from "@/services/firebase";

export default function CommentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const postId = params.postId as string;

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<CommentWithUser[]>([]);

  // Subscribe to comments in real-time
  useEffect(() => {
    if (!postId) return;

    const unsubscribe = subscribeToComments(postId, setComments);
    return () => unsubscribe();
  }, [postId]);

  const handleAddComment = async () => {
    if (!comment.trim() || !postId) return;

    try {
      await addComment(postId, comment.trim());
      setComment(""); // clear input after posting
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

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
        data={comments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const isMyComment = auth.currentUser?.uid === item.userId;

          return (
            <View className="mb-5 p-3.5 rounded-xl border-l-4 border-cyan-500 bg-slate-900/30 flex-row gap-3">
              {/* Avatar */}
              {item.avatar ? (
                <Image
                  source={{ uri: item.avatar }}
                  style={{ width: 36, height: 36, borderRadius: 18 }}
                />
              ) : (
                <View
                  className="w-9 h-9 rounded-full bg-zinc-700"
                  style={{ width: 36, height: 36, borderRadius: 18 }}
                />
              )}

              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-cyan-500 font-semibold text-sm">
                    @{item.username}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-zinc-400 text-xs">
                      {item.createdAt.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>

                    {isMyComment && (
                      <TouchableOpacity
                        onPress={async () => {
                          try {
                            await deleteComment(postId, item.id);
                          } catch (err) {
                            console.error("Failed to delete comment:", err);
                          }
                        }}
                      >
                        <Feather name="trash-2" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <Text className="text-slate-200 text-[15px] leading-5">
                  {item.text}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* Input */}
      <View className="flex-row items-center px-4 pt-2 pb-4 border-t border-cyan-500/10 bg-[#0f1419]">
        <View
          style={{ height: 48 }}
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
          style={{ height: 48 }}
          className={`ml-3 px-5 rounded-full items-center justify-center mb-5 ${
            comment.trim() ? "bg-cyan-400" : "bg-zinc-500/20"
          }`}
          onPress={handleAddComment}
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
