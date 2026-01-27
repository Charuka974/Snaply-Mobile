import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { deletePost, editPost, Post } from "@/services/postService";
import { VideoView, useVideoPlayer } from "expo-video";
import { PostActions } from "@/components/PostActionsComp";
import VideoPostThumbnail from "./VideoPostThumbnail";
import { auth } from "@/services/firebase";

const SCREEN_WIDTH = Dimensions.get("window").width;
const VIDEO_HEIGHT = 360;

interface ProfilePostProps {
  post: Post;
  userName?: string;
  userProfilePicture?: string;
  onPostUpdated?: () => void;
}

export const ProfilePost: React.FC<ProfilePostProps> = ({
  post,
  userName,
  userProfilePicture,
  onPostUpdated,
}) => {
  const [openVideoUri, setOpenVideoUri] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [caption, setCaption] = useState(post.caption);
  const [tags, setTags] = useState(post.tags.join(", "));

  if (!post) return null;

  // --- Handle Edit Save ---
  const handleSaveEdit = async () => {
    try {
      await editPost(post.id, {
        caption,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setEditModalVisible(false);
      onPostUpdated?.();
    } catch (err) {
      console.error("Failed to edit post:", err);
      Alert.alert("Error", "Failed to edit post");
    }
  };

  // --- Handle Delete ---
  const handleDeletePost = async () => {
    try {
      await deletePost(post.id);
      setDeleteModalVisible(false);
      onPostUpdated?.();
    } catch (err) {
      console.error("Failed to delete post:", err);
      Alert.alert("Error", "Failed to delete post");
    }
  };

  return (
    <View className="pb-8 pt-2 border-b border-t border-zinc-800">
      {/* ---------- User Header ---------- */}
      <View className="flex-row items-center px-4 mb-2 justify-between">
        {/* Left: User info */}
        <View className="flex-row items-center">
          {userProfilePicture ? (
            <Image
              source={{ uri: userProfilePicture }}
              className="w-10 h-10 rounded-full bg-zinc-700 mr-3"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-zinc-700 mr-3" />
          )}
          <Text className="text-cyan-400 font-semibold">
            {userName ?? "Unknown"}
          </Text>
        </View>

        {/* Right: Edit / Delete buttons */}
        {auth.currentUser?.uid === post.userId && (
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => setEditModalVisible(true)}
              className="mr-4"
            >
              <Feather name="edit" size={20} color="#22d3ee" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeleteModalVisible(true)}>
              <Feather name="trash" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ---------- Caption ---------- */}
      {post.caption && (
        <View className="px-4 mt-3">
          <Text className="text-white leading-5">{post.caption}</Text>
        </View>
      )}

      {/* ---------- Tags ---------- */}
      {post.tags?.length > 0 && (
        <View className="px-4 mt-2 flex-row flex-wrap">
          {post.tags.map((tag) => (
            <Text key={tag} className="text-cyan-400 text-sm mr-3 mb-1">
              #{tag}
            </Text>
          ))}
        </View>
      )}

      {/* ---------- Media ---------- */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
          );
          setActiveIndex(index);
        }}
        scrollEventThrottle={16}
      >
        {post.media.map((m, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => m.type === "video" && setOpenVideoUri(m.uri)}
            activeOpacity={0.9}
            style={{ width: SCREEN_WIDTH, height: VIDEO_HEIGHT }}
          >
            {m.type === "image" ? (
              <Image
                source={{ uri: m.uri }}
                style={{ width: SCREEN_WIDTH, height: VIDEO_HEIGHT }}
                resizeMode="cover"
              />
            ) : (
              <VideoPostThumbnail
                media={m}
                style={{ width: SCREEN_WIDTH, height: VIDEO_HEIGHT }}
              />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ---------- Media Counter ---------- */}
      {post.media.length > 1 && (
        <View
          style={{
            position: "absolute",
            top: VIDEO_HEIGHT - 250, // 10px above the bottom of video
            right: 10,
            backgroundColor: "rgba(55, 65, 81, 0.6)",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 999,
          }}
        >
          <Text style={{ color: "white", fontSize: 12 }}>
            {activeIndex + 1}/{post.media.length}
          </Text>
        </View>
      )}

      {/* ---------- Actions (likes / comments) ---------- */}
      <PostActions postId={post.id} />

      {/* ---------- Fullscreen Video Modal ---------- */}
      {openVideoUri && (
        <Modal visible animationType="slide">
          <View className="flex-1 bg-black items-center justify-center">
            <Text className="text-white text-lg mb-5">
              Video playback placeholder
            </Text>
            <TouchableOpacity
              onPress={() => setOpenVideoUri(null)}
              className="absolute top-10 right-5"
            >
              <Text className="text-white text-3xl">✕</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {/* ---------- Edit Post Modal ---------- */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/80 justify-center px-6">
          <View className="bg-zinc-900 rounded-2xl p-6">
            <Text className="text-white font-semibold text-lg mb-3">
              Edit Post
            </Text>

            <Text className="text-gray-300 mb-1">Caption</Text>
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="Write something..."
              placeholderTextColor="#6b7280"
              className="bg-zinc-800 text-white rounded-md p-3 mb-4"
              multiline
            />

            <Text className="text-gray-300 mb-1">Tags (comma separated)</Text>
            <TextInput
              value={tags}
              onChangeText={setTags}
              placeholder="tag1, tag2"
              placeholderTextColor="#6b7280"
              className="bg-zinc-800 text-white rounded-md p-3 mb-6"
            />

            <View className="flex-row justify-end">
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                className="mr-4"
              >
                <Text className="text-gray-400 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveEdit}>
                <Text className="text-cyan-400 font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ---------- Delete Confirmation Modal ---------- */}
      <Modal visible={deleteModalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/80 justify-center px-6">
          <View className="bg-zinc-900 rounded-2xl p-6">
            <Text className="text-white font-semibold text-lg mb-4">
              Delete Post
            </Text>
            <Text className="text-gray-300 mb-6">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </Text>
            <View className="flex-row justify-end">
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(false)}
                className="mr-4"
              >
                <Text className="text-gray-400 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeletePost}>
                <Text className="text-red-500 font-semibold">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
