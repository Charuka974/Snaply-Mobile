import {
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
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

  // Configure player ONCE
  useEffect(() => {
    player.loop = true;
    player.muted = muted;

    return () => {
      player.pause();
      player.release?.(); // clean up
    };
  }, []);

  // Update mute dynamically
  useEffect(() => {
    player.muted = muted;
  }, [muted]);

  // Play / Pause based on visibility
  useEffect(() => {
    if (isActive) player.play();
    else player.pause();
  }, [isActive]);

  // Pause when leaving Home screen
  useFocusEffect(
    React.useCallback(() => {
      if (isActive) {
        player.play();
      }

      return () => {
        player.pause(); // stops background playback
      };
    }, [isActive])
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
