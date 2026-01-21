import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { getUserById, User } from "@/services/userService";
import { getUserPosts, PostWithUser } from "@/services/postService";
import { ProfilePost } from "@/components/ProfilePostComp";

const tabs = ["Posts", "Reels", "Photos", "Tagged"] as const;

export const unstable_settings = {
  tabBarStyle: { display: "none" },
};

const UserProfileView = () => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Posts");
  const [user, setUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<PostWithUser[]>([]);
  const [imageError, setImageError] = useState(false);

  const searchParams = useLocalSearchParams() as Record<
    string,
    string | undefined
  >;
  const userId = searchParams.userId;

  const genderLabelMap = { male: "Male", female: "Female" } as const;

  useEffect(() => {
    if (!userId) return;

    const loadUserAndPosts = async () => {
      try {
        const userData = await getUserById(userId);
        setUser(userData);

        if (userData) {
          const postsData = await getUserPosts(userId);
          setUserPosts(postsData);
        }
      } catch (err) {
        console.error("Failed to load user/profile:", err);
      }
    };

    loadUserAndPosts();
  }, [userId]);

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
              .filter((post) => post.media.length > 0)
              .map((post) => (
                <ProfilePost
                  key={post.id}
                  post={post}
                  userName={user?.name}
                  userProfilePicture={user?.profilePicture}
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

  return (
    <View className="flex-1 bg-black pt-12">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 mb-4">
          <Text className="text-white text-xl font-semibold">{user.name}</Text>
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
          <View className="px-3 py-1 mt-2 self-start bg-blue-500 rounded-full ml-4">
            <Text className="text-white text-sm font-semibold">
              {genderLabelMap[user.gender]}
            </Text>
          </View>
        )}

        {/* Tabs */}
        <View className="flex-row mt-6 border-t border-zinc-800">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 items-center py-3 ${activeTab === tab ? "border-t-2 border-white" : ""}`}
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

export default UserProfileView;
