import { View, Text, TouchableOpacity, Image, useWindowDimensions } from "react-native";
import React, { useEffect, useRef } from "react";
import { Feather, AntDesign } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";
import { ReelPost } from "@/services/postService";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";

export const ReelItem = ({ item, isActive }: { item: ReelPost; isActive: boolean }) => {
  const { height: screenHeight, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const videoHeight = screenHeight - insets.top - insets.bottom;

  const player = useVideoPlayer(item.video.uri);
  const isReleased = useRef(false);
  const router = useRouter();

  // Video settings
  player.loop = true;
  player.muted = false;

  // Play/pause based on isActive and navigation focus
  useFocusEffect(
    React.useCallback(() => {
      if (isReleased.current) return;

      if (isActive) player.play();
      else player.pause();

      return () => {
        player.pause();
      };
    }, [isActive])
  );

  // React to scrolling visibility changes
  useEffect(() => {
    if (isReleased.current) return;

    if (isActive) player.play();
    else player.pause();
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isReleased.current = true;
      player.release?.();
    };
  }, []);

  return (
    <View style={{ height: videoHeight, width }} className="bg-black">
      <VideoView player={player} style={{ height: videoHeight, width }} contentFit="contain" />

      {/* Right Actions */}
      <View className="absolute right-4 bottom-24 items-center gap-4">
        <TouchableOpacity className="items-center">
          <AntDesign name="heart" size={28} color="white" />
          <Text className="text-white text-xs mt-1">Like</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push("/reels/comments")}
          className="items-center">
          <Feather name="message-circle" size={26} color="white" />
          <Text className="text-white text-xs mt-1">Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <Feather name="send" size={26} color="white" />
          <Text className="text-white text-xs mt-1">Share</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Info with Avatar */}
      <View className="absolute bottom-20 left-4 flex-row items-center gap-3 pb-2">
        {item.user.profilePicture && (
          <Image
            source={{ uri: item.user.profilePicture }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        )}
        <View>
          <Text className="text-white font-semibold">@{item.user.name}</Text>
          <Text className="text-white">{item.caption}</Text>
        </View>
      </View>
    </View>
  );
};
