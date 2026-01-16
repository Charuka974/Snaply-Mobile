import React from "react";
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import SnaplyLogo from "@/assets/images/logos/snaply.png";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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
      <View className="flex-1 justify-center items-center px-8 py-4">
        {/* Logo & Branding */}
        <View className="items-center mb-6">
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
        <View className="w-full space-y-3 mb-8">
          <View className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 items-center mb-2">
            <MaterialIcons name="camera-alt" size={22} color="white" />
            <Text className="text-white text-base font-semibold mt-2">
              Instant Capture
            </Text>
            <Text className="text-zinc-400 text-sm text-center mt-1">
              Share your moments in real-time
            </Text>
          </View>

          <View className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 items-center mb-2">
            <MaterialIcons name="group" size={22} color="white" />
            <Text className="text-white text-base font-semibold mt-2">
              Stay Connected
            </Text>
            <Text className="text-zinc-400 text-sm text-center mt-1">
              Keep up with what matters most
            </Text>
          </View>

          <View className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 items-center mb-2">
            <MaterialIcons name="lock" size={22} color="white" />
            <Text className="text-white text-base font-semibold mt-2">
              Safe & Secure
            </Text>
            <Text className="text-zinc-400 text-sm text-center mt-1">
              Your privacy comes first
            </Text>
          </View>
        </View>

        {/* Get Started Button */}
        <View className="w-full">
          <LinearGradient
            colors={["#22d3ee", "#2563eb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 16 }}
          >
            <TouchableOpacity
              onPress={handleGetStarted}
              activeOpacity={0.8}
              style={{ paddingVertical: 12 }}
            >
              <Text className="text-white text-center font-bold text-lg">
                Get Started
              </Text>
            </TouchableOpacity>
          </LinearGradient>

          <View className="flex-row justify-center items-center mt-6">
            <Text className="text-zinc-500 text-base">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text className="text-blue-400 font-bold text-base">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Welcome;
