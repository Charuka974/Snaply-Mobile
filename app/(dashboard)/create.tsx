import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  MediaType,
  uploadPostImage,
  uploadPostVideo,
} from "@/services/uploadService";
import { createPost, PostMedia } from "@/services/postService";
import Toast from "react-native-toast-message";
import { useLoader } from "@/context/LoaderContext";

type Media = {
  uri: string;
  type: MediaType;
};

const Create = () => {
  const [media, setMedia] = useState<Media[]>([]);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const { showLoader, hideLoader } = useLoader();
  const hasVideo = media.some((m) => m.type === MediaType.VIDEO);
  const hasImages = media.some((m) => m.type === MediaType.IMAGE);

  /* ---------------- Permissions & Camera ---------------- */
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Toast.show({ type: "error", text1: "Camera permission is required" });
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets) {
      const photo = result.assets[0];
      setMedia([...media, { uri: photo.uri, type: MediaType.IMAGE }]);
    }
  };

  const recordVideo = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      videoMaxDuration: 60,
    });

    if (!result.canceled && result.assets) {
      const video = result.assets[0];
      setMedia([...media, { uri: video.uri, type: MediaType.VIDEO }]);
    }
  };

  /* ---------------- Media Picker ---------------- */
  const pickMedia = async (type: "image" | "video") => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    if (type === "image") {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
      });
      if (result.canceled || !result.assets) return;

      const selected = result.assets.map((asset) => ({
        uri: asset.uri,
        type: MediaType.IMAGE,
      }));
      setMedia(selected);
    } else if (type === "video") {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        videoMaxDuration: 60,
      });
      if (result.canceled || !result.assets) return;

      const video = result.assets[0];
      setMedia([{ uri: video.uri, type: MediaType.VIDEO }]);
    }
  };

  const removeMedia = (uri: string) =>
    setMedia(media.filter((m) => m.uri !== uri));

  /* ---------------- Tags ---------------- */
  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) setTags([...tags, tag]);
  };
  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  /* ---------------- Submit Post ---------------- */
  const handleSubmitPost = async () => {
    if (media.length === 0) return;

    try {
      showLoader("Uploading media...");

      const uploadedMedia: PostMedia[] = [];
      for (const m of media) {
        const url =
          m.type === MediaType.IMAGE
            ? await uploadPostImage(m.uri)
            : await uploadPostVideo(m.uri);
        uploadedMedia.push({ uri: url, type: m.type });
      }

      showLoader("Saving post...");
      await createPost({ media: uploadedMedia, caption, tags });

      Toast.show({ type: "success", text1: "Post created!" });

      // Reset form
      setMedia([]);
      setCaption("");
      setTags([]);
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: "Failed to create post" });
    } finally {
      hideLoader();
    }
  };

  return (
    <View className="flex-1 bg-black pt-4">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 mb-4">
        <Text className="text-white text-xl font-bold">Post Something</Text>

        {/* Post Button */}
        <LinearGradient
          colors={["#22d3ee", "#2563eb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 16, opacity: media.length ? 1 : 0.5 }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={media.length === 0}
            style={{ paddingVertical: 10, paddingHorizontal: 20 }}
            onPress={handleSubmitPost}
          >
            <Text className="text-white text-center font-bold text-lg">
              Post
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        {/* Media Picker Buttons */}
        {/* Media Picker Buttons */}
        <View style={{ flexDirection: "row", marginBottom: 12 }}>
          <TouchableOpacity
            onPress={() => pickMedia("image")}
            disabled={hasVideo}
            style={{
              flex: 1,
              backgroundColor: "#18181b",
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 16,
              marginRight: 12,
              opacity: hasVideo ? 0.5 : 1,
            }}
          >
            <MaterialIcons name="image" size={32} color="#6B7280" />
            <Text style={{ color: "#9CA3AF", marginTop: 8 }}>Add Image(s)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => pickMedia("video")}
            disabled={hasImages || hasVideo}
            style={{
              flex: 1,
              backgroundColor: "#18181b",
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 16,
              opacity: hasImages || hasVideo ? 0.5 : 1,
            }}
          >
            <MaterialIcons name="videocam" size={32} color="#6B7280" />
            <Text style={{ color: "#9CA3AF", marginTop: 8 }}>
              Add a Short Video
            </Text>
          </TouchableOpacity>
        </View>

        {/* Camera Buttons */}
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={takePhoto}
            disabled={hasVideo}
            style={{
              flex: 1,
              backgroundColor: "#18181b",
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 16,
              marginRight: 12,
              opacity: hasVideo ? 0.5 : 1,
            }}
          >
            <MaterialIcons name="camera-alt" size={32} color="#6B7280" />
            <Text style={{ color: "#9CA3AF", marginTop: 8 }}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={recordVideo}
            disabled={hasImages || hasVideo}
            style={{
              flex: 1,
              backgroundColor: "#18181b",
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 16,
              opacity: hasImages || hasVideo ? 0.5 : 1,
            }}
          >
            <MaterialIcons name="videocam" size={32} color="#6B7280" />
            <Text style={{ color: "#9CA3AF", marginTop: 8 }}>Record Video</Text>
          </TouchableOpacity>
        </View>

        {/* Media Preview */}
        <FlatList
          horizontal
          data={media}
          keyExtractor={(item) => item.uri}
          className="px-4 mb-6"
          renderItem={({ item }) => (
            <View className="mr-2 w-32 h-32 rounded-xl overflow-hidden bg-zinc-800">
              <Image
                source={{ uri: item.uri }}
                className="w-full h-full"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => removeMedia(item.uri)}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  borderRadius: 12,
                  padding: 2,
                }}
              >
                <MaterialIcons name="close" size={16} color="white" />
              </TouchableOpacity>
              {item.type === "video" && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 4,
                    left: 4,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    borderRadius: 4,
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                  }}
                >
                  <Text style={{ color: "white", fontSize: 10 }}>Video</Text>
                </View>
              )}
            </View>
          )}
        />

        {/* Caption Input */}
        <View className="px-4 mb-4">
          <Text className="text-zinc-400 mb-2">Caption</Text>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Write a caption..."
            placeholderTextColor="#9CA3AF"
            multiline
            className="bg-zinc-900 p-3 rounded-xl text-white"
          />
        </View>

        {/* Tags Input */}
        <View className="px-4 mb-6">
          <Text className="text-zinc-400 mb-2">Tags</Text>
          <View className="flex-row flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <View
                key={tag}
                className="flex-row items-center bg-blue-600 px-3 py-1 rounded-full"
              >
                <Text className="text-white text-sm">#{tag}</Text>
                <TouchableOpacity
                  onPress={() => removeTag(tag)}
                  className="ml-1"
                >
                  <MaterialIcons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TextInput
            value={tagInput}
            onChangeText={setTagInput}
            placeholder="Add tags..."
            placeholderTextColor="#9CA3AF"
            className="bg-zinc-900 p-3 rounded-xl text-white"
            onSubmitEditing={() => {
              if (!tagInput.trim()) return;
              addTag(tagInput.trim());
              setTagInput("");
            }}
            returnKeyType="done"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Create;
