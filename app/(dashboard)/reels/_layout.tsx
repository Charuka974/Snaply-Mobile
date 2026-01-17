import { Stack } from "expo-router";
import { View } from "react-native";

const ReelsLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: {
          backgroundColor: "#000",
        },
      }}
    >
      {/* Reels feed */}
      <Stack.Screen
        name="index"
        options={{
          contentStyle: { backgroundColor: "#000" },
        }}
      />

      {/* Comments screen */}
      <Stack.Screen
        name="comments"
        options={{
          presentation: "modal",
          contentStyle: { backgroundColor: "#0a0e14" },
        }}
      />
    </Stack>
  );
};

export default ReelsLayout;
