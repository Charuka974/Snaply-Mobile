import {
  View,
  Text,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { VideoPlayer, VideoView, useVideoPlayer } from "expo-video";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { ReelPost } from "@/services/ReelsService";
import { subscribeToComments } from "@/services/CommentService";
import {
  isPostLikedByUser,
  likePost,
  subscribeToLikes,
  unlikePost,
} from "@/services/LikeService";

export const ReelItem = ({
  item,
  isActive,
}: {
  item: ReelPost;
  isActive: boolean;
}) => {
  const { height: screenHeight, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const videoHeight = screenHeight - insets.top - insets.bottom;
  const router = useRouter();

  // Each ReelItem creates & owns its own player
  const player = useVideoPlayer(item.video.uri, (p) => {
    p.loop = true;
    p.muted = false; // or true if you want mute by default
    // p.play();              // ← do NOT auto-play here – control from below
  });

  // const isReleased = useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      if (isActive) {
        player.play();
      } else {
        player.pause();
      }
      return () => {
        player.pause();
      };
    }, [isActive, player]),
  );

  // Optional: extra safety (but useFocusEffect usually enough)
  useEffect(() => {
    // if (isReleased.current) return;
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  // Load comments count
  const [commentCount, setCommentCount] = useState(0);
  // Subscribe to comments for this reel
  useEffect(() => {
    const unsubscribe = subscribeToComments(item.id, (comments) => {
      setCommentCount(comments.length);
    });
    return () => unsubscribe();
  }, [item.id]);

  // Likes
  /* ---------------- Likes ---------------- */
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const heartIcon = liked ? "heart" : "hearto";

  // Initial liked state
  useEffect(() => {
    isPostLikedByUser(item.id).then(setLiked);
  }, [item.id]);
  // Real-time like count
  useEffect(() => {
    const unsubscribe = subscribeToLikes(item.id, (likes) => {
      setLikeCount(likes.length);
    });
    return unsubscribe;
  }, [item.id]);
  const toggleLike = async () => {
    try {
      if (liked) {
        await unlikePost(item.id);
        setLiked(false);
      } else {
        await likePost(item.id);
        setLiked(true);
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  return (
    <View style={{ height: videoHeight, width }} className="bg-black">
      <VideoView
        player={player}
        style={{ height: videoHeight, width }}
        contentFit="contain"
      />

      {/* Right Actions */}
      <View className="absolute right-4 bottom-24 items-center gap-4">
        <TouchableOpacity onPress={toggleLike} className="items-center">
          <MaterialIcons
            name={liked ? "favorite" : "favorite-border"}
            size={30}
            color={liked ? "#ef4444" : "white"}
          />
          <Text className="text-white text-xs mt-1">{likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push(`/reels/comments?postId=${item.id}`)}
          className="items-center"
        >
          <Feather name="message-circle" size={26} color="white" />
          <Text className="text-white text-xs mt-1">
            {commentCount} {commentCount === 1 ? "Comment" : "Comments"}
          </Text>
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
