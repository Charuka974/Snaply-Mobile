import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import { Feather, AntDesign } from "@expo/vector-icons";
import SnaplyLogo from "@/assets/images/logos/snaply.png";

const stories = [
  { id: 1, name: "You" },
  { id: 2, name: "Alex" },
  { id: 3, name: "Sam" },
  { id: 4, name: "Liya" },
  { id: 5, name: "John" },
];

const posts = [
  {
    id: 1,
    user: "alex_dev",
    caption: "Late night coding 🌙💻",
    likes: 128,
  },
  {
    id: 2,
    user: "liya.design",
    caption: "Minimal vibes ✨",
    likes: 342,
  },
];

const Home = () => {
  return (
    <View className="flex-1 bg-black">
      {/* Top Bar */}
      <View className="flex-row justify-between items-center px-4 pt-8 pb-3 border-b border-zinc-800">
        <View className="flex-row items-center space-x-2">
          <Image
            source={SnaplyLogo}
            style={{ width: 32, height: 32 }}
            resizeMode="contain"
          />
          <Text className="text-white text-2xl font-bold">Snaply</Text>
        </View>

        <View className="flex-row space-x-4">
          <Feather name="heart" size={24} color="white" />
          <Feather name="send" size={24} color="white" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 py-4"
        >
          {stories.map((story) => (
            <View key={story.id} className="items-center mr-4">
              <View className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-cyan-500" />
              <Text className="text-white text-xs mt-1">
                {story.name}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Feed */}
        {posts.map((post) => (
          <View key={post.id} className="mb-6">
            {/* Post Header */}
            <View className="flex-row items-center justify-between px-4 mb-2">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-zinc-700 mr-3" />
                <Text className="text-white font-semibold">
                  {post.user}
                </Text>
              </View>
              <Feather name="more-vertical" size={20} color="white" />
            </View>

            {/* Post Image */}
            <View className="w-full h-80 bg-zinc-800" />

            {/* Actions */}
            <View className="flex-row justify-between px-4 py-3">
              <View className="flex-row space-x-4">
                <Feather name="heart" size={24} color="white" />
                <Feather name="message-circle" size={24} color="white" />
                <Feather name="send" size={24} color="white" />
              </View>
              <Feather name="bookmark" size={24} color="white" />
            </View>

            {/* Likes & Caption */}
            <View className="px-4">
              <Text className="text-white font-semibold mb-1">
                {post.likes} likes
              </Text>
              <Text className="text-white">
                <Text className="font-semibold">{post.user} </Text>
                {post.caption}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default Home;
