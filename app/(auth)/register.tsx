import GoogleButton from "@/components/GoogleButton";
import { useLoader } from "@/hooks/useLoader";
import { registerUser } from "@/services/authService";
import { useGoogleAuth } from "@/services/googleAuth";
import { useRouter } from "expo-router";
import React, { useState } from "react";

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
import { navigate } from "expo-router/build/global-state/routing";

const Register = () => {
  const router = useRouter();
  // const [form, setForm] = useState({
  //   name: "",
  //   email: "",
  //   password: "",
  // });

  const { showLoader, hideLoader, isLoading } = useLoader();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signInWithGoogle } = useGoogleAuth();

  const handleRegister = async () => {
    if (isLoading) {
      return;
    }

    if (!name || !email || !password) {
      Alert.alert("Please fill all the fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }

    try {
      showLoader();
      await registerUser(name, email, password);
      hideLoader();
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert("Registration Failed");
    } finally {
      hideLoader();
    }
  };

  const handleGoogleRegister = async () => {
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
    Alert.alert("Google Sign-In failed", error?.message || "Please try again");
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
        <View className="flex-1 justify-center px-8 py-12">
          {/* Logo & Header */}
          <View className="items-center mb-6">
            <Image
              source={SnaplyLogo}
              style={{ width: 80, height: 80, marginBottom: 16 }}
              resizeMode="contain"
            />
            <Text className="text-4xl font-extrabold text-white text-center">
              Create Your Account
            </Text>
            <Text className="text-zinc-400 mt-2 text-lg text-center">
              Join Snaply and start sharing your moments
            </Text>
          </View>

          {/* Input Fields */}
          <View className="space-y-4">
            {/* Full Name */}
            <View>
              <Text className="text-zinc-300 mb-2 ml-1 font-medium">
                Full Name
              </Text>
              <TextInput
                placeholder="John Doe"
                placeholderTextColor="#71717a"
                value={name}
                onChangeText={(val) => setName(val)}
                className="bg-zinc-900 text-white px-5 py-4 rounded-2xl border border-zinc-800 focus:border-blue-500"
              />
            </View>

            {/* Email Address */}
            <View>
              <Text className="text-zinc-300 mb-2 ml-1 font-medium">
                Email Address
              </Text>
              <TextInput
                placeholder="email@example.com"
                placeholderTextColor="#71717a"
                value={email}
                onChangeText={(val) => setEmail(val)}
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-zinc-900 text-white px-5 py-4 rounded-2xl border border-zinc-800 focus:border-blue-500"
              />
            </View>

            {/* Password */}
            <View>
              <Text className="text-zinc-300 mb-2 ml-1 font-medium">
                Password
              </Text>
              <TextInput
                placeholder="Minimum 8 characters"
                placeholderTextColor="#71717a"
                value={password}
                onChangeText={(val) => setPassword(val)}
                secureTextEntry
                className="bg-zinc-900 text-white px-5 py-4 rounded-2xl border border-zinc-800 focus:border-blue-500"
              />
            </View>

            <View>
              <Text className="text-zinc-300 mb-2 ml-1 font-medium">
                Confirm Password
              </Text>
              <TextInput
                placeholder="Minimum 8 characters"
                placeholderTextColor="#71717a"
                value={confirmPassword}
                onChangeText={(val) => setConfirmPassword(val)}
                secureTextEntry
                className="bg-zinc-900 text-white px-5 py-4 rounded-2xl border border-zinc-800 focus:border-blue-500"
              />
            </View>
          </View>

          {/* Terms text */}
          <Text className="text-zinc-500 text-xs mt-4 px-1">
            By signing up, you agree to our{" "}
            <Text className="text-blue-400">Terms of Service</Text> and{" "}
            <Text className="text-blue-400">Privacy Policy</Text>.
          </Text>

          {/* Action Buttons */}
          <View className="mt-10 space-y-4">
            <TouchableOpacity onPress={handleRegister} activeOpacity={0.8}>
              <Text className="text-white text-center font-bold text-lg">
                Register
              </Text>
            </TouchableOpacity>


            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-zinc-500">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace("/login")}>
                <Text className="text-blue-400 font-bold">Login</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View className="mt-4">
            <GoogleButton onPress={handleGoogleRegister} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Register;
