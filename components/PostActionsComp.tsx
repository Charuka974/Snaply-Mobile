import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import {
  isPostLikedByUser,
  likePost,
  unlikePost,
  subscribeToLikes,
} from "@/services/LikeService";
import { addComment, subscribeToComments } from "@/services/CommentService";

type Props = {
  postId: string;
};

export const PostActions = ({ postId }: Props) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comment, setComment] = useState("");

  const [commentCount, setCommentCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [expanded, setExpanded] = useState(false);

  /* ---------------- Likes ---------------- */
  useEffect(() => {
    isPostLikedByUser(postId).then(setLiked);
  }, [postId]);

  useEffect(() => {
    const unsub = subscribeToLikes(postId, (likes) => {
      setLikeCount(likes.length);
    });
    return unsub;
  }, [postId]);

  const toggleLike = async () => {
    if (liked) {
      await unlikePost(postId);
      setLiked(false);
    } else {
      await likePost(postId);
      setLiked(true);
    }
  };

  /* ---------------- Comments ---------------- */
  useEffect(() => {
    const unsub = subscribeToComments(postId, (data) => {
      setComments(data);
      setCommentCount(data.length);
    });
    return unsub;
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
    <View className="px-4">
      {/* Action row */}
      <View className="flex-row justify-between py-3">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={toggleLike}>
            <MaterialIcons
              name={liked ? "favorite" : "favorite-border"}
              size={26}
              color={liked ? "white" : "white"}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setExpanded((p) => !p)}>
            <Feather name="message-circle" size={24} color="#22d3ee" />
          </TouchableOpacity>

          <Feather name="send" size={24} color="#22d3ee" />
        </View>

        <Feather name="bookmark" size={24} color="#22d3ee" />
      </View>

      {/* Counts */}
      <TouchableOpacity onPress={() => setExpanded((p) => !p)}>
        <Text className="text-zinc-400 text-sm mb-2">
          {likeCount} likes {commentCount} comments
        </Text>
      </TouchableOpacity>

      {/* Expandable comments */}
      {expanded && (
        <View className="bg-zinc-900 rounded-lg p-3 mb-3">
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View className="flex-row mb-3 px-2">
                {/* Avatar */}
                {item.avatar ? (
                  <Image
                    source={{ uri: item.avatar }}
                    style={{ width: 32, height: 32, borderRadius: 16 }}
                    className="bg-zinc-700 mr-3"
                  />
                ) : (
                  <View
                    style={{ width: 32, height: 32, borderRadius: 16 }}
                    className="bg-zinc-700 mr-3"
                  />
                )}

                {/* Username + Comment */}
                <View className="flex-1">
                  <Text className="font-semibold text-cyan-400 text-sm">
                    @{item.username ?? "unknown"}
                  </Text>
                  <Text className="text-white text-sm mt-0.5">{item.text}</Text>
                </View>
              </View>
            )}
          />

          {/* Optional input (wire to createComment service) */}
          <View className="flex-row items-center mt-2">
            <View
              style={{ height: 40 }}
              className={`flex-1 flex-row items-center bg-slate-900/40 rounded-full px-4 border ${
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
              style={{ height: 40 }}
              className={`ml-3 px-5 rounded-full items-center justify-center ${
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
        </View>
      )}
    </View>
  );
};
