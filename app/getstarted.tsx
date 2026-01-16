import React from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import SnaplyLogo from "@/assets/images/logos/snaply.png";
import { MaterialIcons } from "@expo/vector-icons";

const Welcome = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.replace("/register");
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className="flex-1 bg-zinc-950"
    >
      <View className="flex-1 justify-center items-center px-8">
        {/* Logo & Branding */}
        <View className="items-center mb-12">
          <Image
            source={SnaplyLogo}
            style={{ width: 120, height: 120, marginBottom: 24 }}
            resizeMode="contain"
          />
          <Text className="text-5xl font-extrabold text-white text-center mb-4">
            Snaply
          </Text>
          <Text className="text-zinc-400 text-xl text-center leading-7 max-w-sm">
            Capture moments, share memories, and connect with the world
          </Text>
        </View>

        {/* Feature Highlights */}
        <View className="w-full space-y-4 mb-12">
          <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <MaterialIcons name="camera-alt" size={28} color="white" />
            <Text className="text-white text-lg font-bold mb-2">
               Instant Capture
            </Text>
            <Text className="text-zinc-400 text-base">
              Share your moments with friends and family in real-time
            </Text>
          </View>

          <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <MaterialIcons name="group" size={28} color="white" />
            <Text className="text-white text-lg font-bold mb-2">
               Stay Connected
            </Text>
            <Text className="text-zinc-400 text-base">
              Keep up with what matters most to you
            </Text>
          </View>

          <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <MaterialIcons name="lock" size={28} color="white" />
            <Text className="text-white text-lg font-bold mb-2">
               Safe & Secure
            </Text>
            <Text className="text-zinc-400 text-base">
              Your privacy and security are our top priorities
            </Text>
          </View>
        </View>

        {/* Get Started Button */}
        <View className="w-full">
          <TouchableOpacity onPress={handleGetStarted} activeOpacity={0.8}>
            <Text className="text-white text-center font-bold text-xl">
              Get Started
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center items-center mt-6">
            <Text className="text-zinc-500 text-base">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text className="text-blue-400 font-bold text-base">
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Welcome;