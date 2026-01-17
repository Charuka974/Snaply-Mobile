import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { User, subscribeToMyData } from "../../../services/userService";
import { auth } from "@/services/firebase";

const tabs = ["Posts", "Reels", "Photos", "Tagged"] as const;

const ProfileIndex = () => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Posts");
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const genderLabelMap = {
    male: "Male",
    female: "Female",
  } as const;

  useEffect(() => {
    // Subscribe to user data updates
    const unsubscribe = subscribeToMyData((data) => {
      setUser(data);
    });

    return () => unsubscribe(); // cleanup on unmount
  }, []);

  const renderGrid = () => {
    let data: { id: number; color: string }[] = [];
    let itemStyle = "w-1/3 aspect-square";

    switch (activeTab) {
      case "Posts":
        data = Array.from({ length: 21 }, (_, i) => ({
          id: i,
          color: "#374151",
        }));
        break;
      case "Reels":
        data = Array.from({ length: 12 }, (_, i) => ({
          id: i,
          color: "#4B5563",
        }));
        itemStyle = "w-1/2 aspect-video";
        break;
      case "Photos":
        data = Array.from({ length: 12 }, (_, i) => ({
          id: i,
          color: "#4B5563",
        }));
        break;
      case "Tagged":
        data = Array.from({ length: 6 }, (_, i) => ({
          id: i,
          color: "#6B7280",
        }));
        break;
    }

    return data.map((item) => (
      <View
        key={item.id}
        className={`${itemStyle} border border-black`}
        style={{ backgroundColor: item.color }}
      />
    ));
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
        <View className="flex-row items-center justify-between px-4 mb-4">
          <Text className="text-white text-xl font-semibold">{user.name}</Text>
          <MaterialIcons name="menu" size={24} color="white" />
        </View>

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
              <Text className="text-white font-semibold text-lg">21</Text>
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

        <TouchableOpacity
          className="mx-4 mt-4 py-2 rounded-lg bg-zinc-900 items-center"
          onPress={() => router.push("/profile/form")}
        >
          <Text className="text-white font-semibold">Edit Profile</Text>
        </TouchableOpacity>

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

        <View className="flex-row flex-wrap">{renderGrid()}</View>
      </ScrollView>
    </View>
  );
};

export default ProfileIndex;
