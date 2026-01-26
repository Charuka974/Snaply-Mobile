import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth } from "@/services/firebase";
import { getMyPosts, Post, subscribeToUserPosts } from "@/services/postService";
import {
  subscribeToMyData,
  subscribeToUser,
  User,
} from "@/services/userService";
import { ProfilePost } from "@/components/ProfilePostComp";
import { logout } from "@/services/authService";
import Toast from "react-native-toast-message";

const tabs = ["Posts", "Reels", "Photos", "Tagged"] as const;

const ProfileIndex = () => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Posts");
  const [user, setUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  const currentUserId = auth.currentUser?.uid;

  const genderLabelMap = { male: "Male", female: "Female" } as const;

  // Subscribe to current user live (followers/following updates)
  useEffect(() => {
    if (!currentUserId) return;

    const unsubscribe = subscribeToUser(currentUserId, (userData) => {
      setUser(userData); // triggers re-render whenever followers/following change
    });

    return () => unsubscribe();
  }, [currentUserId]); // add dependency

  // Load my posts once
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const posts = await getMyPosts();
        setUserPosts(posts);
      } catch (err) {
        console.error(err);
      }
    };
    loadPosts();
  }, []);

  // Subscribe to posts live
  useEffect(() => {
    if (!currentUserId) return;

    const unsubscribe = subscribeToUserPosts(currentUserId, setUserPosts);
    return () => unsubscribe();
  }, []);

  const renderTabContent = () => {
    if (!userPosts || userPosts.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <Text className="text-white">No posts yet</Text>
        </View>
      );
    }

    switch (activeTab) {
      case "Posts":
        return (
          <View className="flex-row flex-wrap">
            {userPosts.map((post) => (
              <ProfilePost
                key={post.id}
                post={post}
                userName={user?.name}
                userProfilePicture={user?.profilePicture}
                // showVideos={true} // images + videos
              />
            ))}
          </View>
        );

      case "Reels":
        return (
          <View>
            {userPosts
              .map((post) => ({
                ...post,
                media: post.media.filter((m) => m.type === "video"),
              }))
              .filter((post) => post.media.length > 0) // only posts with video
              .map((post) => (
                <ProfilePost
                  key={post.id}
                  post={post}
                  userName={user?.name}
                  userProfilePicture={user?.profilePicture}
                  // showVideos={true} // only videos
                />
              ))}
          </View>
        );

      case "Photos":
        return (
          <View>
            {userPosts
              .map((post) => ({
                ...post,
                media: post.media.filter((m) => m.type === "image"),
              }))
              .filter((post) => post.media.length > 0)
              .map((post) => (
                <ProfilePost
                  key={post.id}
                  post={post}
                  userName={user?.name}
                  userProfilePicture={user?.profilePicture}
                  // showVideos={false} // images only
                />
              ))}
          </View>
        );

      case "Tagged":
        return (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-white">No tagged posts yet</Text>
          </View>
        );
    }
  };

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white">Loading profile...</Text>
      </View>
    );
  }

  // Handle logout
  const confirmLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await logout();
              router.replace("/login");
            } catch (err) {
              console.error(err);
              Toast.show({ type: "error", text1: "Logout failed" });
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View className="flex-1 bg-black pt-12">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 mb-4">
          <Text className="text-white text-xl font-semibold">{user.name}</Text>
          <TouchableOpacity onPress={confirmLogout}>
            <Feather name="log-out" size={24} color="#22d3ee" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View className="flex-row items-center px-4">
          <View className="w-24 h-24 rounded-full bg-zinc-800 items-center justify-center">
            {!user.profilePicture || imageError ? (
              <MaterialIcons name="person" size={48} color="#9CA3AF" />
            ) : (
              <Image
                source={{ uri: user.profilePicture }}
                className="w-24 h-24 rounded-full"
                onError={() => setImageError(true)}
              />
            )}
          </View>

          <View className="flex-row flex-1 justify-around ml-4">
            <View className="items-center">
              <Text className="text-white font-semibold text-lg">
                {userPosts.length}
              </Text>
              <Text className="text-zinc-400 text-sm">Posts</Text>
            </View>
            <View className="items-center">
              <Text className="text-white font-semibold text-lg">
                {user.followers?.length || 0}
              </Text>
              <Text className="text-zinc-400 text-sm">Followers</Text>
            </View>
            <View className="items-center">
              <Text className="text-white font-semibold text-lg">
                {user.following?.length || 0}
              </Text>
              <Text className="text-zinc-400 text-sm">Following</Text>
            </View>
          </View>
        </View>

        {/* Bio */}
        <View className="px-4 mt-3">
          <Text className="text-white font-semibold pb-2">{user.name}</Text>
          <Text className="text-zinc-400">{user.bio}</Text>
        </View>

        {(user.gender === "male" || user.gender === "female") && (
          <View className="px-3 py-1 mt-2 self-start bg-gray-500 rounded-full ml-4">
            <Text className="text-white text-sm font-semibold">
              {genderLabelMap[user.gender]}
            </Text>
          </View>
        )}

        <TouchableOpacity
          className="mx-4 mt-4 py-2 rounded-lg bg-zinc-900 items-center"
          onPress={() => router.push("/profile/form")}
        >
          <Text className="text-white font-semibold">Edit Profile</Text>
        </TouchableOpacity>

        {/* Tabs */}
        <View className="flex-row mt-6 border-t border-zinc-800">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 items-center py-3 ${
                activeTab === tab ? "border-t-2 border-white" : ""
              }`}
            >
              <Text
                className={`${activeTab === tab ? "text-white" : "text-zinc-500"}`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View className="flex-1 bg-black pt-4">{renderTabContent()}</View>
      </ScrollView>
    </View>
  );
};

export default ProfileIndex;
