import { View, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import React from "react";

type Media = {
  type: "image" | "video";
  uri: string;
  thumbnail?: string; // optional pre-generated thumbnail
};

type Props = {
  media: Media;
  onPress?: () => void;
  style?: any; // optional extra styles
};

export default function VideoPostThumbnail({ media, onPress, style }: Props) {
  // Loading spinner (optional)
  const [loading, setLoading] = React.useState(false);

  // Get thumbnail URL for video
  const getThumbnailUrl = (media: Media) => {
    if (media.type === "image") return media.uri;

    if (media.thumbnail) return media.thumbnail;

    // If Cloudinary video, generate thumbnail URL
    if (media.uri.includes("res.cloudinary.com")) {
      // Transform video URL into image thumbnail
      // c_thumb = crop to thumbnail
      // w_400,h_400 = dimensions (adjust as needed)
      return media.uri
        .replace("/upload/", "/upload/c_thumb,w_400,h_400/")
        .replace(/\.(mp4|mov|webm)$/, ".jpg"); // ensure extension is jpg
    }

    // Fallback placeholder
    return "https://via.placeholder.com/400x400/111/eee?text=Video";
  };

  const sourceUri = getThumbnailUrl(media);

  const content = (
    <>
      <Image
        source={{ uri: sourceUri }}
        style={[{ width: "100%", height: style?.height || 200 }, style]}
        resizeMode="cover"
      />

      {media.type === "video" && (
        <TouchableOpacity
          activeOpacity={0.7}
          className="absolute inset-0 items-center justify-center"
          onPress={onPress} // Optional: if you want tapping the icon to trigger something
        >
          {/* Circular background with subtle blur/glass effect */}
          <View
            className="
              w-20 h-20 
              bg-black/40 
              backdrop-blur-md        
              rounded-full 
              items-center justify-center
              shadow-2xl               
              border border-white/20
            "
            style={{
              // Fallback shadow if tailwind shadow not enough
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.5,
              shadowRadius: 12,
              elevation: 12, // Android shadow
            }}
          >
            {/* Icon with slight scale & glow */}
            <Feather
              name="play-circle"
              size={40} // bigger & bolder
              color="#e0e0e0"
              style={{
                // Optional subtle outer glow (via text shadow)
                textShadowColor: "rgba(255, 255, 255, 0.6)",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 8,
              }}
            />
          </View>
        </TouchableOpacity>
      )}

      {loading && media.type === "video" && !media.thumbnail && (
        <View
          style={{
            position: "absolute",
            inset: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <ActivityIndicator color="#fff" />
        </View>
      )}
    </>
  );

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        {
          width: "100%",
          height: style?.height || 200,
          overflow: "hidden",
          backgroundColor: "#111",
        },
        style,
      ]}
    >
      {content}
    </Wrapper>
  );
}
