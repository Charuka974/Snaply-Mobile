import { View, Text, TextInput, ScrollView, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { Feather } from "@expo/vector-icons";

const mockPosts = Array.from({ length: 21 }, (_, i) => ({
  id: i.toString(),
}));

const Search = () => {
  const [query, setQuery] = useState("");

  return (
    <View className="flex-1 bg-black pt-12">
      {/* Search Bar */}
      <View className="px-4 mb-3">
        <View className="flex-row items-center bg-zinc-900 rounded-xl px-3 py-2">
          <Feather name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            className="ml-2 text-white flex-1"
          />
        </View>
      </View>

      {/* Explore Grid */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap">
          {mockPosts.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              className="w-1/3 aspect-square border border-black"
              activeOpacity={0.9}
            >
              {/* Image Placeholder */}
              <View
                className={`flex-1 ${
                  index % 7 === 0 ? "bg-zinc-700" : "bg-zinc-800"
                }`}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default Search;
