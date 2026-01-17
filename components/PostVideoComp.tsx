import {
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { Feather } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";

export const SCREEN_WIDTH = Dimensions.get("window").width;
export const VIDEO_HEIGHT = 360;


export type PostVideoProps = {
  uri: string;
  isActive: boolean; // auto-play when active
};

export const PostVideo: React.FC<PostVideoProps> = ({ uri, isActive }) => {
  const [muted, setMuted] = useState(false);

  const player = useVideoPlayer(uri);
  player.loop = true;
  player.muted = muted;

  useEffect(() => {
    if (isActive) player.play();
    else player.pause();
  }, [isActive]);

  const toggleMute = () => setMuted((m) => !m);

  return (
    <View style={{ width: SCREEN_WIDTH, height: VIDEO_HEIGHT }}>
      <VideoView player={player} style={{ width: SCREEN_WIDTH, height: VIDEO_HEIGHT }} />

      {/* Mute/unmute button */}
      <TouchableOpacity
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          backgroundColor: "rgba(0,0,0,0.4)",
          padding: 6,
          borderRadius: 20,
          zIndex: 10,
        }}
        onPress={toggleMute}
      >
        <Feather name={muted ? "volume-x" : "volume-2"} size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
};