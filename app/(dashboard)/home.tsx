import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { Feather } from "@expo/vector-icons";
import SnaplyLogo from "@/assets/images/logos/snaply.png";
import { loadPosts, PostWithUser } from "@/services/postService";
import { VideoView, useVideoPlayer } from "expo-video";
import { PostVideo } from "@/components/PostVideoComp";

const SCREEN_WIDTH = Dimensions.get("window").width;
const VIDEO_HEIGHT = 360;

// --- Main Home Component ---
const Home = () => {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<Record<string, number>>({});
  const [scrollOffset, setScrollOffset] = useState(0);

  const videoRefs = useRef<Record<string, number>>({}); // store each video's Y position

  useEffect(() => {
    loadPosts()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#22d3ee" />
      </View>
    );
  }

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollOffset(e.nativeEvent.contentOffset.y);
  };

  const isVideoActive = (key: string, layoutY: number) => {
    const screenCenter = scrollOffset + VIDEO_HEIGHT / 2;
    return layoutY < screenCenter && layoutY + VIDEO_HEIGHT > scrollOffset;
  };

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 pt-8 pb-3 border-b border-cyan-500/20">
        <View className="flex-row items-center">
          <Image source={SnaplyLogo} style={{ width: 32, height: 32 }} />
          <Text className="text-cyan-400 text-2xl font-bold ml-2">Snaply</Text>
        </View>
        <View className="flex-row">
          <Feather name="heart" size={24} color="#22d3ee" />
          <Feather name="send" size={24} color="#22d3ee" className="ml-4" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={{ paddingTop: 20 }}
      >
        {posts.map((post) => {
          const currentIndex = activeIndex[post.id] ?? 0;
          const mediaCount = post.media.length;

          return (
            <View key={post.id} className="mb-8">
              {/* User Header */}
              <View className="flex-row items-center px-4 mb-2">
                <Image
                  source={{ uri: post.user.profilePicture }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                  className="bg-zinc-700 mr-3"
                />
                <Text className="text-white font-semibold">{post.user.name}</Text>
              </View>

              {/* Media */}
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const index = Math.round(
                    e.nativeEvent.contentOffset.x / SCREEN_WIDTH
                  );
                  setActiveIndex((p) => ({ ...p, [post.id]: index }));
                }}
                scrollEventThrottle={16}
              >
                {post.media.map((m, index) =>
                  m.type === "image" ? (
                    <View
                      key={index}
                      style={{ width: SCREEN_WIDTH, height: VIDEO_HEIGHT }}
                    >
                      <Image
                        source={{ uri: m.uri }}
                        style={{ width: SCREEN_WIDTH, height: VIDEO_HEIGHT }}
                        resizeMode="cover"
                      />
                      
                    </View>
                  ) : (
                    <View
                      key={index}
                      onLayout={(e) => {
                        videoRefs.current[`${post.id}-${index}`] = e.nativeEvent.layout.y;
                      }}
                    >
                      <PostVideo
                        uri={m.uri}
                        isActive={isVideoActive(`${post.id}-${index}`, videoRefs.current[`${post.id}-${index}`] ?? 0)}
                      />
                    </View>
                  )
                )}
              </ScrollView>

              {/* Media counter */}
              {mediaCount > 1 && (
                <View className="absolute top-3 right-3 bg-black/60 px-3 py-1 rounded-full">
                  <Text className="text-white text-xs">
                    {currentIndex + 1}/{mediaCount}
                  </Text>
                </View>
              )}

              {/* Pagination dots */}
              {mediaCount > 1 && (
                <View className="flex-row justify-center mt-2">
                  {post.media.map((_, i) => (
                    <View
                      key={i}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        marginHorizontal: 4,
                        backgroundColor:
                          i === currentIndex ? "#22d3ee" : "#52525b",
                      }}
                    />
                  ))}
                </View>
              )}

              {/* Actions */}
              <View className="flex-row justify-between px-4 py-3">
                <View className="flex-row">
                  <Feather name="heart" size={24} color="#22d3ee" />
                  <Feather
                    name="message-circle"
                    size={24}
                    color="#22d3ee"
                    className="ml-4"
                  />
                  <Feather name="send" size={24} color="#22d3ee" className="ml-4" />
                </View>
                <Feather name="bookmark" size={24} color="#22d3ee" />
              </View>

              {/* Caption */}
              <View className="px-4">
                <Text className="text-white">
                  <Text className="font-semibold text-cyan-400">{post.user.name} </Text>
                  {post.caption}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default Home;
