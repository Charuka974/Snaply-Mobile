import GoogleButton from "@/components/GoogleButton";
import { useLoader } from "@/hooks/useLoader";
import { login } from "@/services/authService";
import { useGoogleAuth } from "@/services/googleAuth";
import { useRouter } from "expo-router";
import { navigate } from "expo-router/build/global-state/routing";
import React, { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import SnaplyLogo from "@/assets/images/logos/snaply.png";

const Login = () => {
  const { showLoader, hideLoader, isLoading } = useLoader();

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signInWithGoogle } = useGoogleAuth();

  const handleLogin = async () => {
    if (isLoading) return;

    if (!email || !password) {
      console.log("Please fill all the fields");
      Alert.alert("Please fill all the fields");
      return;
    }
    try {
      showLoader();
      await login(email, password);
      navigate("/home");
    } catch (error) {
      Alert.alert("Error Login user");
    } finally {
      hideLoader();
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return;

    try {
      showLoader();

      // Attempt Google sign-in
      const user = await signInWithGoogle(); // Make this return user info on success

      if (!user) {
        // Failed login
        Alert.alert("Google Sign-In failed", "Please try again.");
        return;
      }

      // Only navigate on success
      navigate("/home");
    } catch (error: any) {
      console.log("Google Login Error:", error);
      Alert.alert(
        "Google Sign-In failed",
        error?.message || "Please try again"
      );
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
              Welcome Back
            </Text>
            <Text className="text-zinc-400 mt-2 text-lg text-center">
              Sign in to Snaply
            </Text>
          </View>

          {/* Input Fields */}
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

            <View>
              <Text className="text-zinc-300 mb-2 ml-1 font-medium">
                Password
              </Text>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#71717a"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="bg-zinc-900 text-white px-5 py-4 rounded-2xl border border-zinc-800 focus:border-blue-500"
              />
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity className="mt-4 items-end"
            onPress={() => router.replace("/(auth)/forgotPassword")}>
            <Text className="text-blue-400 font-medium">Forgot Password?</Text>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View className="mt-10 space-y-4">
            <LinearGradient
              colors={["#22d3ee", "#2563eb"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 16 }}
            >
              <TouchableOpacity
                onPress={handleLogin}
                activeOpacity={0.8}
                style={{ paddingVertical: 12 }}
              >
                <Text className="text-white text-center font-bold text-lg">
                  Login
                </Text>
              </TouchableOpacity>
            </LinearGradient>

            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-zinc-500">Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.replace("/register")}>
                <Text className="text-blue-400 font-bold">Register</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mt-4">
            <GoogleButton onPress={handleGoogleLogin} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
