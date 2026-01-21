import { Stack } from "expo-router";

const ChatLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#0a0e14" },
      }}
    >
      {/* Chat List */}
      <Stack.Screen name="index" />

      {/* Individual Chat */}
      <Stack.Screen name="[chatId]" />
    </Stack>
  );
};

export default ChatLayout;
