import { View, TouchableOpacity, Dimensions } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { Feather } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";
import { useFocusEffect } from "expo-router";

export const SCREEN_WIDTH = Dimensions.get("window").width;
export const VIDEO_HEIGHT = 360;

export type PostVideoProps = {
  uri: string;
  isActive: boolean;
};

export const PostVideo: React.FC<PostVideoProps> = ({ uri, isActive }) => {
  const [muted, setMuted] = useState(false);
  const player = useVideoPlayer(uri);

  // Track if player has been released
  const isReleased = useRef(false);

  // Configure player ONCE
  useEffect(() => {
    player.loop = true;
    player.muted = muted;

    return () => {
      try {
        if (!isReleased.current) {
          player.pause();
          player.release?.();
          isReleased.current = true; // mark as released
        }
      } catch (e) {
        console.log("Video already released, skipping cleanup", e);
      }
    };
  }, []);

  // Update mute dynamically
  useEffect(() => {
    try {
      if (!isReleased.current) player.muted = muted;
    } catch {}
  }, [muted]);

  // Play / Pause based on visibility
  useEffect(() => {
    try {
      if (!isReleased.current) {
        if (isActive) player.play();
        else player.pause();
      }
    } catch {}
  }, [isActive]);

  // Pause when leaving Home screen
  useFocusEffect(
    React.useCallback(() => {
      try {
        if (!isReleased.current && isActive) player.play();
      } catch {}

      return () => {
        try {
          if (!isReleased.current) player.pause();
        } catch {}
      };
    }, [isActive]),
  );

  const toggleMute = () => setMuted((m) => !m);

  return (
    <View style={{ width: SCREEN_WIDTH, height: VIDEO_HEIGHT }}>
      <VideoView
        player={player}
        style={{ height: VIDEO_HEIGHT, width: SCREEN_WIDTH }}
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
