import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Post } from "@/services/postService";
import { VideoView, useVideoPlayer } from "expo-video";
import { useFocusEffect } from "expo-router";

interface ProfilePostProps {
  post: Post;
  userName?: string;
  userProfilePicture?: string;
  showVideos?: boolean;
  screenWidth?: number;
  videoHeight?: number;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const VIDEO_HEIGHT = 360;

export const ProfilePost: React.FC<ProfilePostProps> = ({
  post,
  userName,
  userProfilePicture,
  showVideos = true,
  screenWidth = SCREEN_WIDTH,
  videoHeight = VIDEO_HEIGHT,
}) => {
  if (!post) return null;

  const [openVideoUri, setOpenVideoUri] = useState<string | null>(null);

  const PostVideoItem: React.FC<{ uri: string; isActive: boolean }> = ({
    uri,
    isActive,
  }) => {
    const [muted, setMuted] = useState(false);
    const player = useVideoPlayer(uri);
    const isMounted = useRef(true);

    useEffect(() => {
      isMounted.current = true;
      player.loop = true;
      player.muted = muted;

      return () => {
        isMounted.current = false;
        try {
          player.pause();
          player.release?.();
        } catch (e) {
          console.log("Video already released, skipping cleanup", e);
        }
      };
    }, []);

    useEffect(() => {
      if (!isMounted.current) return;
      try {
        player.muted = muted;
      } catch {}
    }, [muted]);

    useEffect(() => {
      if (!isMounted.current) return;
      try {
        if (isActive) player.play();
        else player.pause();
      } catch {}
    }, [isActive]);

    useFocusEffect(
      React.useCallback(() => {
        if (!isMounted.current) return;
        try {
          if (isActive) player.play();
        } catch {}
        return () => {
          try {
            player.pause();
          } catch {}
        };
      }, [isActive]),
    );

    const toggleMute = () => setMuted((m) => !m);

    return (
      <View style={{ width: screenWidth, height: videoHeight }}>
        <VideoView
          player={player}
          style={{ width: screenWidth, height: videoHeight }}
          contentFit="contain"
        />
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            backgroundColor: "rgba(0,0,0,0.4)",
            padding: 6,
            borderRadius: 20,
          }}
          onPress={toggleMute}
        >
          <Feather
            name={muted ? "volume-x" : "volume-2"}
            size={20}
            color="white"
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ marginBottom: 32 }}>
      {/* User Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          marginBottom: 8,
        }}
      >
        {userProfilePicture ? (
          <Image
            source={{ uri: userProfilePicture }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        ) : (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#555",
            }}
          />
        )}
        <Text style={{ color: "white", fontWeight: "600", marginLeft: 8 }}>
          {userName || "Unknown"}
        </Text>
      </View>

      {/* Media Carousel */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      >
        {post.media.map((m, index) => {
          if (m.type === "image") {
            return (
              <Image
                key={index}
                source={{ uri: m.uri }}
                style={{ width: screenWidth, height: videoHeight }}
                resizeMode="cover"
              />
            );
          }
          if (m.type === "video" && showVideos) {
            // Feed: show thumbnail (first frame) using paused VideoView
            return (
              <TouchableOpacity
                key={index}
                onPress={() => setOpenVideoUri(m.uri)}
                style={{ width: screenWidth, height: videoHeight }}
              >
                {/* Create player for thumbnail */}
                {(() => {
                  const thumbPlayer = useVideoPlayer(m.uri);
                  useEffect(() => {
                    try {
                      thumbPlayer.pause(); // immediately pause to show first frame
                    } catch {}
                  }, []);
                  return (
                    <VideoView
                      player={thumbPlayer}
                      style={{ width: screenWidth, height: videoHeight }}
                      contentFit="contain"
                    />
                  );
                })()}

                <View
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Feather name="play-circle" size={64} color="white" />
                </View>
              </TouchableOpacity>
            );
          }
          return null;
        })}
      </ScrollView>

      {/* Caption */}
      {post.caption && (
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <Text style={{ color: "white" }}>
            <Text style={{ fontWeight: "600", color: "#22d3ee" }}>
              {userName || "Unknown"}{" "}
            </Text>
            {post.caption}
          </Text>
        </View>
      )}

      {/* Full-screen Video Modal */}
      {openVideoUri && (
        <Modal animationType="slide" transparent={false} visible={true}>
          <View style={{ flex: 1, backgroundColor: "black" }}>
            <PostVideoItem uri={openVideoUri} isActive={true} />
            <TouchableOpacity
              onPress={() => setOpenVideoUri(null)}
              style={{ position: "absolute", top: 40, right: 20 }}
            >
              <Text style={{ color: "white", fontSize: 32 }}>✕</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};
