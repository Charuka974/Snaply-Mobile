import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import React from "react";

const chats = [
  { id: "1", name: "Alex", lastMessage: "Hey, what's up?", time: "2h" },
  { id: "2", name: "Liya", lastMessage: "Loved your post!", time: "5h" },
  { id: "3", name: "John", lastMessage: "Let's catch up soon", time: "12h" },
];

export default function ChatList() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="px-4 py-4 border-b border-cyan-500/20">
        <Text className="text-cyan-400 text-2xl font-bold">Chats</Text>
      </View>

      {/* Chat List */}
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/chats/${item.id}`)}
            className="flex-row items-center justify-between px-4 py-4 border-b border-cyan-500/10"
          >
            <View className="flex-row items-center space-x-3">
              <View className="w-12 h-12 rounded-full bg-cyan-900" />
              <View>
                <Text className="text-white font-semibold">{item.name}</Text>
                <Text className="text-zinc-400 text-sm">{item.lastMessage}</Text>
              </View>
            </View>
            <Text className="text-zinc-500 text-xs">{item.time}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
