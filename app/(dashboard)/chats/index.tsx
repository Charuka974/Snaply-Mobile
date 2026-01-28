import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FeedUser, loadFeedUsers, loadMyData } from "@/services/userService";
import { getOrCreateChat } from "@/services/messageService";

export default function ChatList() {
  const router = useRouter();

  const [users, setUsers] = useState<FeedUser[]>([]);
  const [currentUser, setCurrentUser] = useState<FeedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const me = await loadMyData();
        const feedUsers = await loadFeedUsers();

        if (!me) {
          setUsers(feedUsers);
          return;
        }

        setCurrentUser(me);
        setUsers(feedUsers.filter((u) => u.id !== me.id));
      } catch (err) {
        console.error("Failed to load chats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#22d3ee" />
      </View>
    );
  }

  const openChat = async (
    otherUserId: string,
    otherUserName: string,
    otherUserPhoto: string | null,
  ) => {
    try {
      const chatId = await getOrCreateChat(otherUserId);

      router.push({
        pathname: "/(dashboard)/chats/[chatId]",
        params: {
          chatId,
          name: otherUserName,
          photo: otherUserPhoto ?? "",
        },
      });
    } catch (err) {
      console.error("Failed to open chat:", err);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="px-4 py-4 border-b border-cyan-500/20">
        <Text className="text-cyan-400 text-2xl font-bold">Chats</Text>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openChat(item.id, item.name, item.profilePicture || null)}
            className="flex-row items-center px-4 py-4 border-b border-cyan-500/10"
          >
            <Image
              source={{
                uri: item.profilePicture || "https://via.placeholder.com/150",
              }}
              className="w-12 h-12 rounded-full bg-cyan-900 mr-3"
            />
            <View>
              <Text className="text-white font-semibold">{item.name}</Text>
              <Text className="text-zinc-400 text-sm">
                Tap to start chatting
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
