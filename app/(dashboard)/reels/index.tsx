import { View, FlatList, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { ReelItem } from "@/components/ReelVidComponent";
import { loadReels, ReelPost } from "@/services/ReelsService";

const { height } = Dimensions.get("window");

export default function ReelsScreen() {
  const [reels, setReels] = useState<ReelPost[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    loadReels().then(setReels).catch(console.error);
  }, []);

  return (
    <View className="flex-1 bg-black">
      <FlatList
        data={reels}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        windowSize={3}              // keep low – only ~3 items rendered
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        removeClippedSubviews={false} // ← usually keep false with video
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.y / height);
          setActiveIndex(index);
        }}
        renderItem={({ item, index }) => (
          <ReelItem
            item={item}
            isActive={index === activeIndex}
          />
        )}
      />
    </View>
  );
}