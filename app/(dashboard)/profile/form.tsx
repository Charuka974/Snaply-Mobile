import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
  Platform as RNPlatform,
} from "react-native";
import React, { useEffect, useState, useMemo } from "react";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import {
  Gender,
  subscribeToMyData,
  updateMyProfile,
  User,
} from "../../../services/userService";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const Form = () => {
  const [user, setUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null); // to track changes
  const [saving, setSaving] = useState(false);
  const [newAvatar, setNewAvatar] = useState<string | File | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Subscribe and keep original copy
    const unsubscribe = subscribeToMyData((data) => {
      setUser(data);
      setOriginalUser(data);
    });
    return () => unsubscribe();
  }, []);

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
      if (asset.file) {
        setImageError(false);
        setNewAvatar(asset.file);
      }
    } else {
      if (asset.uri) {
        setImageError(false);
        setNewAvatar(asset.uri);
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      setSaving(true);
      await updateMyProfile({
        name: user.name,
        bio: user.bio,
        gender: user.gender,
        avatarFile: newAvatar ?? undefined,
        currentProfilePicture: user.profilePicture,
      });
      Toast.show({ type: "success", text1: "Profile updated!" });
      setOriginalUser(user); // update the "original" after save
      setNewAvatar(null); // reset new avatar
    } catch {
      Toast.show({ type: "error", text1: "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  // Disable save if nothing changed
  const isChanged = useMemo(() => {
    if (!user || !originalUser) return false;
    return (
      user.name !== originalUser.name ||
      user.bio !== originalUser.bio ||
      user.gender !== originalUser.gender ||
      newAvatar !== null
    );
  }, [user, originalUser, newAvatar]);

  if (!user)
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white">Loading...</Text>
      </View>
    );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={RNPlatform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1 bg-black px-4 pt-12"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <Text className="text-white text-xl font-semibold mb-4">
          Edit Profile
        </Text>

        <TouchableOpacity onPress={pickImage} className="mb-6">
          <View className="w-24 h-24 rounded-full bg-zinc-800 items-center justify-center overflow-hidden">
            {newAvatar ? (
              <Image
                source={{
                  uri:
                    Platform.OS === "web"
                      ? URL.createObjectURL(newAvatar as File)
                      : (newAvatar as string),
                }}
                className="w-24 h-24"
              />
            ) : user.profilePicture && !imageError ? (
              <Image
                source={{ uri: user.profilePicture }}
                className="w-24 h-24"
                onError={() => setImageError(true)}
              />
            ) : (
              <MaterialIcons name="person" size={48} color="#9CA3AF" />
            )}
          </View>
        </TouchableOpacity>

        <Text className="text-white font-semibold mb-2">Name</Text>
        <TextInput
          value={user.name}
          onChangeText={(name) =>
            setUser((prev) => (prev ? { ...prev, name } : prev))
          }
          className="bg-zinc-900 p-3 rounded-xl text-white mb-4"
        />

        <Text className="text-white font-semibold mb-2">Bio</Text>
        <TextInput
          value={user.bio}
          onChangeText={(bio) =>
            setUser((prev) => (prev ? { ...prev, bio } : prev))
          }
          multiline
          className="bg-zinc-900 p-3 rounded-xl text-white mb-4"
        />

        <Text className="text-white font-semibold mb-2">Gender</Text>

        <View className="flex-row gap-3 mb-6">
          {[
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
            { label: "Prefer not to say", value: "prefer_not_to_say" },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() =>
                setUser((prev) =>
                  prev ? { ...prev, gender: option.value as Gender } : prev,
                )
              }
              className={`px-4 py-2 rounded-full border ${
                user.gender === option.value
                  ? "bg-cyan-500 border-blue-600"
                  : "border-zinc-700"
              }`}
            >
              <Text
                className={`${
                  user.gender === option.value ? "text-white" : "text-zinc-400"
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <LinearGradient
          colors={["#22d3ee", "#2563eb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 16, opacity: saving || !isChanged ? 0.6 : 1 }}
        >
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || !isChanged}
            activeOpacity={0.8}
            style={{ paddingVertical: 12 }}
          >
            <Text className="text-white text-center font-bold text-lg">
              {saving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Form;
