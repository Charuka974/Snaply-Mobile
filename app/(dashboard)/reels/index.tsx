import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { Feather, AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { height } = Dimensions.get("window");

const reels = [
  {
    id: "1",
    user: "alex_dev",
    likes: "12.4K",
    caption: "Late night coding 🌙",
  },
  { id: "2", user: "liya.design", likes: "8.1K", caption: "Minimal vibes ✨" },
  { id: "3", user: "john.mp4", likes: "21K", caption: "Coffee & code ☕️" },
];

export default function ReelsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-black">
      <FlatList
        data={reels}
        keyExtractor={(item) => item.id}
        pagingEnabled
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={{ height }} className="w-full">
            {/* Video Placeholder */}
            <View className="flex-1 bg-zinc-900" />

            {/* Right Actions */}
            <View className="absolute right-4 bottom-24 items-center space-y-6 gap-4">
              <TouchableOpacity className="items-center">
                <AntDesign name="heart" size={28} color="white" />
                <Text className="text-white text-xs mt-1">{item.likes}</Text>
              </TouchableOpacity>

              {/* COMMENT BUTTON — fixed below */}
              <TouchableOpacity
                className="items-center"
                onPress={() => router.push("/reels/comments")}
              >
                <Feather name="message-circle" size={26} color="white" />
                <Text className="text-white text-xs mt-1">Comment</Text>
              </TouchableOpacity>

              <TouchableOpacity className="items-center">
                <Feather name="send" size={26} color="white" />
                <Text className="text-white text-xs mt-1">Share</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Info */}
            <View className="absolute bottom-20 left-4 right-20 pb-5">
              <Text className="text-white font-semibold mb-1">
                @{item.user}
              </Text>
              <Text className="text-white">{item.caption}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
