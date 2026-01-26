// app/(dashboard)/playlist.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { auth } from "@/services/firebase";
import { Post } from "@/services/postService";
import { ProfilePost } from "@/components/ProfilePostComp";

const tabs = ["Liked", "Bookmarked"] as const;

const Playlist = () => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Liked");
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  const router = useRouter();
  const currentUserId = auth.currentUser?.uid;

  // Load liked posts
  useEffect(() => {
    if (!currentUserId) return;
    const loadLiked = async () => {
      try {
        // const posts = await getLikedPosts(currentUserId);
        // setLikedPosts(posts);
      } catch (err) {
        console.error("Failed to load liked posts:", err);
      }
    };
    loadLiked();
  }, []);

  // Load bookmarked posts
  useEffect(() => {
    if (!currentUserId) return;
    const loadBookmarked = async () => {
      try {
        // const posts = await getBookmarkedPosts(currentUserId);
        // setBookmarkedPosts(posts);
      } catch (err) {
        console.error("Failed to load bookmarked posts:", err);
      }
    };
    loadBookmarked();
  }, []);

  const renderTabContent = () => {
    const posts = activeTab === "Liked" ? likedPosts : bookmarkedPosts;

    if (!posts || posts.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <Text className="text-white">No posts here yet</Text>
        </View>
      );
    }

    return (
      <View className="flex-row flex-wrap">
        {/* {posts.map((post) => (
          <ProfilePost
            key={post.id}
            post={post}
            userName={post.user?.name}
            userProfilePicture={post.user?.profilePicture}
          />
        ))} */}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-black pt-12">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 mb-4">
        <Text className="text-white text-xl font-semibold">My Playlist</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-500">Back</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row border-t border-zinc-800">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 items-center py-3 ${
              activeTab === tab ? "border-t-2 border-white" : ""
            }`}
          >
            <Text className={`${activeTab === tab ? "text-white" : "text-zinc-500"}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView showsVerticalScrollIndicator={false} className="pt-4 px-2">
        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

export default Playlist;
