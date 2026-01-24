import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Post } from "@/services/postService";
import { VideoView, useVideoPlayer } from "expo-video";
import { PostActions } from "@/components/PostActionsComp";
import VideoPostThumbnail from "./VideoPostThumbnail";

const SCREEN_WIDTH = Dimensions.get("window").width;
const VIDEO_HEIGHT = 360;

interface ProfilePostProps {
  post: Post;
  userName?: string;
  userProfilePicture?: string;
}

export const ProfilePost: React.FC<ProfilePostProps> = ({
  post,
  userName,
  userProfilePicture,
}) => {
  const [openVideoUri, setOpenVideoUri] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!post) return null;

  return (
    <View className="pb-8 pt-2 border-b border-t border-zinc-800">
      {/* ---------- User Header ---------- */}
      <View className="flex-row items-center px-4 mb-2">
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

      {/* ---------- Caption ---------- */}
      {post.caption && (
        <View className="px-4 mt-3">
          <Text className="text-white leading-5">
            {post.caption}
          </Text>
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
            e.nativeEvent.contentOffset.x / SCREEN_WIDTH
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
        <View className="absolute top-3 right-3 bg-white/40 px-3 py-1 rounded-full">
          <Text className="text-white text-xs">
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
    </View>
  );
};
