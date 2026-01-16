import React from "react";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoaderProvider } from "@/context/LoaderContext";
import {AuthProvider } from "@/context/AuthContext";
import Toast from "react-native-toast-message";
import "../global.css";

const RootLayout = () => {
  return (
    <LoaderProvider>
      <AuthProvider>
        <SafeAreaView className="flex-1">
          <Slot />
          <Toast />
        </SafeAreaView>
      </AuthProvider>
    </LoaderProvider>
   
  );
};

export default RootLayout;