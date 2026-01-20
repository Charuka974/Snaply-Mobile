import {
  View,
  FlatList,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { loadReels, ReelPost } from "@/services/postService";
import { ReelItem } from "@/components/ReelVidComponent";

const { height } = Dimensions.get("window");

export default function ReelsScreen() {
  const router = useRouter();
  const [reels, setReels] = useState<ReelPost[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    loadReels()
      .then(setReels)
      .catch(console.error);
  }, []);

  return (
    <View className="flex-1 bg-black">
      <FlatList
        data={reels}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.y / height
          );
          setActiveIndex(index);
        }}
        renderItem={({ item, index }) => (
          <ReelItem item={item} isActive={index === activeIndex} />
        )}
      />
    </View>
  );
}
