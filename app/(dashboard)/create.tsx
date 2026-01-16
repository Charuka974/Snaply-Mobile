import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { Feather, MaterialIcons } from "@expo/vector-icons";

const Create = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <View className="flex-1 bg-black pt-12">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 mb-4">
        <Text className="text-white text-xl font-semibold">New Post</Text>
        <TouchableOpacity disabled={!selectedImage}>
          <Text
            className={`text-base font-semibold ${
              selectedImage ? "text-blue-500" : "text-zinc-600"
            }`}
          >
            Share
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Image Preview */}
        <TouchableOpacity
          activeOpacity={0.9}
          className="w-full aspect-square bg-zinc-900 items-center justify-center"
          onPress={() => {
            // TODO: Open Image Picker
          }}
        >
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-full"
            />
          ) : (
            <View className="items-center">
              <MaterialIcons
                name="add-photo-alternate"
                size={64}
                color="#6B7280"
              />
              <Text className="text-zinc-500 mt-2">
                Tap to select a photo
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Caption */}
        <View className="px-4 mt-4">
          <Text className="text-zinc-400 mb-2">Caption</Text>
          <View className="bg-zinc-900 rounded-xl p-3">
            <Text className="text-white">
              Write a caption...
            </Text>
          </View>
        </View>

        {/* Options */}
        <View className="mt-6 border-t border-zinc-800">
          {[
            { label: "Tag people", icon: "user-plus" },
            { label: "Add location", icon: "map-pin" },
            { label: "Accessibility", icon: "eye" },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              className="flex-row items-center px-4 py-4 border-b border-zinc-800"
            >
              <Feather name={item.icon as any} size={20} color="white" />
              <Text className="text-white ml-4">{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default Create;
