import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { loadPosts, PostWithUser } from "@/services/postService";
import { FeedUser, loadFeedUsers } from "@/services/userService";
import { useRouter } from "expo-router";
import VideoPostThumbnail from "@/components/VideoPostThumbnail";

const Search = () => {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [users, setUsers] = useState<FeedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allPosts, allUsers] = await Promise.all([
          loadPosts(),
          loadFeedUsers(),
        ]);
        setPosts(allPosts);
        setUsers(allUsers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const q = query.toLowerCase();

  const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(q));
  const filteredPosts = posts.filter(
    (p) =>
      p.caption?.toLowerCase().includes(q) ||
      p.tags?.some((t) => t.toLowerCase().includes(q)),
  );

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator color="#22d3ee" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black pt-12">
      {/* Search Bar */}
      <View className="px-4 mb-3">
        <View className="flex-row items-center bg-zinc-900 rounded-xl px-3 py-2">
          <Feather name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search users or posts"
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            className="ml-2 text-white flex-1"
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* USERS */}
        {query.length > 0 && filteredUsers.length > 0 && (
          <View className="mb-4">
            <Text className="text-gray-400 text-lg px-4 mb-2 font-bold">
              Users
            </Text>

            {filteredUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                className="flex-row items-center px-4 py-3"
                onPress={() =>
                  router.push({
                    pathname: "/users/[userId]",
                    params: { userId: user.id },
                  })
                }
              >
                <Image
                  source={{
                    uri:
                      user.profilePicture || "https://via.placeholder.com/150",
                  }}
                  className="w-10 h-10 rounded-full bg-zinc-700 mr-3"
                />
                <Text className="text-white font-medium">{user.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* POSTS GRID */}
        <View className="mb-4">
          <Text className="text-gray-400 text-lg px-4 mb-2 font-bold">
            Posts
          </Text>
          <View className="flex-row flex-wrap px-1">
            {(query ? filteredPosts : posts).map((post) => {
              const media = post.media?.[0];
              if (!media) return null;

              // Taller height for videos (like Reels), square-ish for images
              const isVideo = media.type === "video";
              const height = isVideo ? 300 : 180; // adjust as needed

              return (
                <TouchableOpacity
                  key={post.id}
                  className="w-1/2 p-1"
                  activeOpacity={0.9}
                >
                  <View className="border border-gray-300 rounded-xl overflow-hidden bg-black">
                    {media.type === "image" ? (
                      <Image
                        source={{ uri: media.uri }}
                        className="w-full"
                        style={{ height }}
                        resizeMode="cover"
                      />
                    ) : (
                      <VideoPostThumbnail
                        media={media}
                        style={{ width: "100%", height: 200 }} // explicit height
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* EMPTY STATE */}
        {query.length > 0 &&
          filteredUsers.length === 0 &&
          filteredPosts.length === 0 && (
            <Text className="text-gray-400 text-center mt-20">
              No results found
            </Text>
          )}
      </ScrollView>
    </View>
  );
};

export default Search;
