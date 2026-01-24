import { View, FlatList, Dimensions } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { ReelItem } from "@/components/ReelVidComponent";
import { loadReels, ReelPost } from "@/services/ReelsService";

const { height } = Dimensions.get("window");

export default function ReelsScreen() {
  const [reels, setReels] = useState<ReelPost[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const listRef = useRef<FlatList<ReelPost>>(null);

  useEffect(() => {
    loadReels().then(setReels).catch(console.error);
  }, []);

  const refreshReels = async () => {
    if (refreshing) return;

    setRefreshing(true);
    try {
      const latest = await loadReels();
      setReels(latest);
      setActiveIndex(0);

      // scroll back to top AFTER data is updated
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({
          offset: 0,
          animated: false,
        });
      });
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <FlatList
        ref={listRef}
        data={reels}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}

        windowSize={5} // keeps ~5 items mounted
        initialNumToRender={3} // render first 3 immediately
        maxToRenderPerBatch={2} // render 2 per batch
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={false}
        
        refreshing={refreshing}
        onRefresh={refreshReels}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.y / height);
          setActiveIndex(index);
        }}
        renderItem={({ item, index }) => (
          <ReelItem item={item} isActive={index === activeIndex} />
        )}
      />
    </View>
  );
}
