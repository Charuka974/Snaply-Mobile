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
      <View className="flex-row justify-between items-center px-4 pt-8 pb-3 border-b border-cyan-500/20">
        <View className="flex-row items-center">
          <Image
            source={SnaplyLogo}
            style={{ width: 32, height: 32 }}
            resizeMode="contain"
          />
          <Text className="text-cyan-400 text-2xl font-bold ml-2">Snaply</Text>
        </View>

        <View className="flex-row">
          <Feather name="heart" size={24} color="#22d3ee" className="mr-4" />
          <Feather name="send" size={24} color="#22d3ee" />
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
              <View className="w-16 h-16 rounded-full border-2 border-cyan-400 bg-zinc-800" />
              <Text className="text-white text-xs mt-1">{story.name}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Feed */}
        {posts.map((post) => (
          <View key={post.id} className="mb-6">
            {/* Post Header */}
            <View className="flex-row items-center justify-between px-4 mb-2">
              <View className="flex-row items-center">
                {/* Profile image as perfect circle */}
                <View
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                  className="bg-cyan-900 mr-3"
                />
                <Text className="text-white font-semibold">{post.user}</Text>
              </View>
              <Feather name="more-vertical" size={20} color="#22d3ee" />
            </View>

            {/* Post Image */}
            <View className="w-full h-80 bg-cyan-900/20" />

            {/* Actions */}
            <View className="flex-row justify-between px-4 py-3">
              <View className="flex-row">
                <Feather
                  name="heart"
                  size={24}
                  color="#22d3ee"
                  className="mr-4"
                />
                <Feather
                  name="message-circle"
                  size={24}
                  color="#22d3ee"
                  className="mr-4"
                />
                <Feather name="send" size={24} color="#22d3ee" />
              </View>
              <Feather name="bookmark" size={24} color="#22d3ee" />
            </View>

            {/* Likes & Caption */}
            <View className="px-4">
              <Text className="text-cyan-400 font-semibold mb-1">
                {post.likes} likes
              </Text>
              <Text className="text-white">
                <Text className="font-semibold text-cyan-400">
                  {post.user}{" "}
                </Text>
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
