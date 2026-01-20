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
  RefreshControl,
  LayoutRectangle,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { Feather } from "@expo/vector-icons";
import SnaplyLogo from "@/assets/images/logos/snaply.png";
import {
  loadPosts,
  loadRefreshPosts,
  PostWithUser,
} from "@/services/postService";
import { VideoView, useVideoPlayer } from "expo-video";
import { PostVideo } from "@/components/PostVideoComp";
import { FeedUser, loadFeedUsers } from "@/services/userService";

const SCREEN_WIDTH = Dimensions.get("window").width;
const VIDEO_HEIGHT = 360;

// --- Main Home Component ---
const Home = () => {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<FeedUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Refs to each video view
  const videoRefs = useRef<Record<string, View | null>>({});
  // State to track which videos are active
  const [videoActiveState, setVideoActiveState] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    loadPosts()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await loadFeedUsers();
        setUsers(allUsers);
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#22d3ee" />
      </View>
    );
  }

  // Refresh logic
  const refreshPosts = async () => {
    if (refreshing) return;

    setRefreshing(true);
    try {
      const since = posts.length > 0 ? posts[0].createdAt : undefined;
      const latestPosts = await loadRefreshPosts({ since });
      if (!latestPosts || latestPosts.length === 0) return;

      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const uniqueNewPosts = latestPosts.filter(
          (p) => !existingIds.has(p.id),
        );
        if (uniqueNewPosts.length === 0) return prev;
        return [...uniqueNewPosts, ...prev];
      });
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  // Measure videos on scroll to determine visibility
  const handleScroll = () => {
    Object.entries(videoRefs.current).forEach(([key, ref]) => {
      if (!ref) return;

      ref.measureInWindow((x, y, width, height) => {
        const screenHeight = Dimensions.get("window").height;
        const visibleHeight =
          Math.min(y + height, screenHeight) - Math.max(y, 0);
        const isActive = visibleHeight / height > 0.5;

        setVideoActiveState((prev) => {
          if (prev[key] === isActive) return prev; // no change
          return { ...prev, [key]: isActive };
        });
      });
    });
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshPosts}
            tintColor="#22d3ee"
          />
        }
      >
        {/* Stories / Users */}
        {usersLoading ? (
          <ActivityIndicator color="#22d3ee" style={{ marginVertical: 20 }} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingBottom: 12,
            }}
          >
            {users.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={{ alignItems: "center", marginRight: 16 }}
                onPress={() => console.log("Open user profile", user.name)}
              >
                <Image
                  source={{
                    uri:
                      user.profilePicture || "https://via.placeholder.com/150",
                  }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    borderWidth: 2,
                    borderColor: "#22d3ee",
                  }}
                />
                <Text
                  style={{
                    color: "white",
                    fontSize: 12,
                    marginTop: 4,
                    maxWidth: 60,
                    textAlign: "center",
                  }}
                  numberOfLines={1}
                >
                  {user.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Posts */}
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
                <Text className="text-white font-semibold">
                  {post.user.name}
                </Text>
              </View>

              {/* Media */}
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const index = Math.round(
                    e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
                  );
                  setActiveIndex((p) => ({ ...p, [post.id]: index }));
                  handleScroll(); // update video active state while horizontal scroll
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
                      ref={(ref) => {
                        videoRefs.current[`${post.id}-${index}`] = ref;
                      }}
                      style={{ width: SCREEN_WIDTH, height: VIDEO_HEIGHT }}
                    >
                      <PostVideo
                        uri={m.uri}
                        isActive={!!videoActiveState[`${post.id}-${index}`]}
                      />
                    </View>
                  ),
                )}
              </ScrollView>

              {/* Media counter */}
              {mediaCount > 1 && (
                <View className="absolute top-3 right-3 bg-white/40 px-3 py-1 rounded-full">
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
                  <Feather
                    name="send"
                    size={24}
                    color="#22d3ee"
                    className="ml-4"
                  />
                </View>
                <Feather name="bookmark" size={24} color="#22d3ee" />
              </View>

              {/* Caption */}
              <View className="px-4">
                <Text className="text-white">
                  <Text className="font-semibold text-cyan-400">
                    {post.user.name}{" "}
                  </Text>
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
