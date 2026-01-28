import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import SnaplyLogo from "@/assets/images/logos/snaply.png";
import { useLoader } from "@/hooks/useLoader";
import { resetPassword } from "@/services/authService";

const ForgotPassword = () => {
  const router = useRouter();
  const { showLoader, hideLoader, isLoading } = useLoader();

  const [email, setEmail] = useState("");

  const handleReset = async () => {
    if (!email) {
      Alert.alert("Please enter your email");
      return;
    }

    try {
      showLoader();
      const result = await resetPassword(email);

      if (result.success) {
        Alert.alert(
          "Reset Email Sent",
          "Check your inbox for the password reset link."
        );
        router.replace("/login"); // go back to login
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to send reset email.");
    } finally {
      hideLoader();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-zinc-950"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-8">
          {/* Logo & Header */}
          <View className="items-center mb-6">
            <Image
              source={SnaplyLogo}
              style={{ width: 80, height: 80, marginBottom: 16 }}
              resizeMode="contain"
            />
            <Text className="text-4xl font-extrabold text-white text-center">
              Forgot Password
            </Text>
            <Text className="text-zinc-400 mt-2 text-lg text-center">
              Enter your email to reset password
            </Text>
          </View>

          {/* Email Input */}
          <View className="space-y-4">
            <View>
              <Text className="text-zinc-300 mb-2 ml-1 font-medium">
                Email Address
              </Text>
              <TextInput
                placeholder="email@example.com"
                placeholderTextColor="#71717a"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-zinc-900 text-white px-5 py-4 rounded-2xl border border-zinc-800 focus:border-blue-500"
              />
            </View>
          </View>

          {/* Reset Button */}
          <View className="mt-10 space-y-4">
            <LinearGradient
              colors={["#22d3ee", "#2563eb"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 16 }}
            >
              <TouchableOpacity
                onPress={handleReset}
                activeOpacity={0.8}
                style={{ paddingVertical: 12 }}
                disabled={isLoading}
              >
                <Text className="text-white text-center font-bold text-lg">
                  Send Reset Link
                </Text>
              </TouchableOpacity>
            </LinearGradient>

            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-zinc-500">Remembered your password? </Text>
              <TouchableOpacity onPress={() => router.replace("/login")}>
                <Text className="text-blue-400 font-bold">Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPassword;
