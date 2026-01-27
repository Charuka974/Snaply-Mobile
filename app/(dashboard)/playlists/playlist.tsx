import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { auth } from "@/services/firebase";
import { PostWithUser } from "@/services/postService";
import { PostVideo } from "@/components/PostVideoComp";
import { PostActions } from "@/components/PostActionsComp";
import {
  getMyBookmarkedPosts,
  getMyLikedPosts,
  subscribeToBookmarks,
  subscribeToLikes,
} from "@/services/LikeService";

const tabs = ["Liked", "Bookmarked"] as const;
const SCREEN_WIDTH = Dimensions.get("window").width;
const VIDEO_HEIGHT = 360;

const Playlist = () => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Liked");
  const [likedPosts, setLikedPosts] = useState<PostWithUser[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [bookmarksMap, setBookmarksMap] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<Record<string, View | null>>({});
  const [videoActiveState, setVideoActiveState] = useState<
    Record<string, boolean>
  >({});
  const router = useRouter();

  // Load liked/bookmarked posts
  const loadData = useCallback(async () => {
    try {
      const [liked, bookmarked] = await Promise.all([
        getMyLikedPosts(),
        getMyBookmarkedPosts(),
      ]);
      setLikedPosts(liked);
      setBookmarkedPosts(bookmarked);
    } catch (err) {
      console.error("Failed to load playlist:", err);
    }
  }, []);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      setLoading(true);
      await loadData();
      setLoading(false);
    });
    return unsub;
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Track which videos are visible for auto-play
  const handleScroll = () => {
    Object.entries(videoRefs.current).forEach(([key, ref]) => {
      if (!ref) return;
      ref.measureInWindow((x, y, width, height) => {
        const screenHeight = Dimensions.get("window").height;
        const visibleHeight =
          Math.min(y + height, screenHeight) - Math.max(y, 0);
        const isActive = visibleHeight / height > 0.5;
        setVideoActiveState((prev) => {
          if (prev[key] === isActive) return prev;
          return { ...prev, [key]: isActive };
        });
      });
    });
  };

  const posts = activeTab === "Liked" ? likedPosts : bookmarkedPosts;

  // Subscribe to real-time likes and bookmarks
  useEffect(() => {
    const likeUnsubs: (() => void)[] = [];
    const bookmarkUnsubs: (() => void)[] = [];

    posts.forEach((post) => {
      // Likes
      const unsubLikes = subscribeToLikes(post.id, (likes) => {
        setLikesMap((prev) => ({ ...prev, [post.id]: likes.length }));
      });
      likeUnsubs.push(unsubLikes);

      // Bookmarks
      const unsubBookmarks = subscribeToBookmarks(post.id, (bookmarked) => {
        setBookmarksMap((prev) => ({ ...prev, [post.id]: bookmarked }));
      });
      bookmarkUnsubs.push(unsubBookmarks);
    });

    return () => {
      likeUnsubs.forEach((unsub) => unsub());
      bookmarkUnsubs.forEach((unsub) => unsub());
    };
  }, [posts]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#22d3ee" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black pt-6">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 mb-4">
        <Text className="text-white text-xl font-bold">My Playlists</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-cyan-400 font-bold">Back</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row border-t border-zinc-800">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 items-center py-3 ${
              activeTab === tab ? "border-t-2 border-cyan-400" : ""
            }`}
          >
            <Text
              className={`${
                activeTab === tab ? "text-white font-semibold" : "text-zinc-500"
              }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Posts */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#22d3ee"
          />
        }
      >
        {posts.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-zinc-400">
              No {activeTab.toLowerCase()} posts yet
            </Text>
          </View>
        ) : (
          posts.map((post) => (
            <View key={post.id} className="mb-8 border-b border-cyan-500/20">
              {/* Post Header */}
              <View className="flex-row items-center px-4 mb-2">
                <Image
                  source={{ uri: post.user.profilePicture }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                  className="bg-zinc-700 mr-3"
                />
                <Text className="text-cyan-400 font-semibold">
                  {post.user.name}
                </Text>
              </View>

              {/* Caption */}
              <View className="px-4 mb-2">
                <Text className="text-white">{post.caption}</Text>
              </View>

              {/* Media */}
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
              >
                {post.media.map((m, index) =>
                  m.type === "image" ? (
                    <Image
                      key={index}
                      source={{ uri: m.uri }}
                      style={{ width: SCREEN_WIDTH, height: VIDEO_HEIGHT }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      key={index}
                      ref={(ref) => {
                        if (ref) videoRefs.current[`${post.id}-${index}`] = ref;
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

              {/* Actions */}
              <PostActions postId={post.id} />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default Playlist;
