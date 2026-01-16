import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Platform } from "react-native";
import React, { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { subscribeToMyData, updateMyProfile, User } from "../../../services/userService";

const Form = () => {
  const [user, setUser] = useState<User | null>(null);
  const [avatar, setAvatar] = useState<string | File | null>(null);
  const [saving, setSaving] = useState(false);
  const [newAvatar, setNewAvatar] = useState<string | File | null>(null);


  useEffect(() => subscribeToMyData(setUser), []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return;

    const asset = result.assets[0];

    if (Platform.OS === "web") {
      if (asset.file) setNewAvatar(asset.file); // File object
    } else {
      if (asset.uri) setNewAvatar(asset.uri); // URI string
    }
  };


  const handleSave = async () => {
    if (!user) return;
    try {
      setSaving(true);
      await updateMyProfile({
        name: user.name,
        bio: user.bio,
        avatarFile: newAvatar ?? undefined, // undefined if no new avatar
        currentProfilePicture: user.profilePicture,
      });
      Toast.show({ type: "success", text1: "Profile updated!" });
    } catch {
      Toast.show({ type: "error", text1: "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <View className="flex-1 justify-center items-center bg-black"><Text className="text-white">Loading...</Text></View>;

  return (
    <ScrollView className="flex-1 bg-black px-4 pt-12">
      <Text className="text-white text-xl font-semibold mb-4">Edit Profile</Text>

      <TouchableOpacity onPress={pickImage} className="mb-6">
        <Image
          source={{
            uri: newAvatar
              ? Platform.OS === "web"
                ? URL.createObjectURL(newAvatar as File)
                : (newAvatar as string)
              : user.profilePicture || "https://i.pravatar.cc/150",
          }}
          className="w-24 h-24 rounded-full"
        />
      </TouchableOpacity>

      <TextInput
        value={user.name}
        onChangeText={(name) => setUser({ ...user, name })}
        className="bg-zinc-900 p-3 rounded-xl text-white mb-4"
      />

      <TextInput
        value={user.bio}
        onChangeText={(bio) => setUser({ ...user, bio })}
        multiline
        className="bg-zinc-900 p-3 rounded-xl text-white"
      />

      <TouchableOpacity
        onPress={handleSave}
        disabled={saving}
        className="bg-blue-600 py-3 rounded-xl mt-6 items-center"
      >
        <Text className="text-white font-semibold">{saving ? "Saving..." : "Save"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Form;
