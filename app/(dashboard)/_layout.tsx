import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { View, Platform, Pressable } from "react-native";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  interpolate,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Strict types for MaterialIcons used
type MaterialIconName = "home" | "search" | "add-circle" | "movie" | "person";

// Strict tab names
type TabName = "home" | "search" | "create" | "reels" | "profile";

interface TabBarIconProps {
  name: TabName;
  icon: MaterialIconName;
  focused: boolean;
  color: string;
  size: number;
}

const TabBarIcon = ({ name, icon, focused, color, size }: TabBarIconProps) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (focused) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 8, stiffness: 200 })
      );

      if (name === "create") {
        rotation.value = withSequence(
          withSpring(180, { damping: 10 }),
          withSpring(0, { damping: 10 })
        );
      }
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scale.value, [1, 1.2], [0, 0.6]),
    transform: [{ scale: scale.value * 1.5 }],
  }));

  return (
    <View className="items-center justify-center relative">
      {/* Glow behind icon */}
      {focused && (
        <Animated.View
          style={[glowStyle]}
          className="absolute w-12 h-12 rounded-full bg-blue-500 blur-xl"
        />
      )}

      <Animated.View style={animatedStyle}>
        <View
          className={`items-center justify-center ${
            name === "create"
              ? "bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-2"
              : ""
          }`}
          style={
            name === "create" && focused
              ? {
                  shadowColor: "#3b82f6", // blue shadow
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.5,
                  shadowRadius: 8,
                  elevation: 8,
                }
              : {}
          }
        >
          <MaterialIcons
            name={icon}
            size={name === "create" ? size + 4 : focused ? size + 2 : size}
            color={name === "create" ? "#fff" : color}
          />
        </View>
      </Animated.View>

      {/* Active tab indicator for non-create tabs */}
      {focused && name !== "create" && (
        <View className="absolute -bottom-2 w-1 h-1 bg-blue-500 rounded-full" />
      )}
    </View>
  );
};

const DashboardLayout = () => {
  const tabs: { name: TabName; icon: MaterialIconName }[] = [
    { name: "home", icon: "home" },
    { name: "search", icon: "search" },
    { name: "create", icon: "add-circle" },
    { name: "reels", icon: "movie" },
    { name: "profile", icon: "person" },
  ];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#0a0a0a",
          borderTopWidth: 1,
          borderTopColor: "#1a1a1a",
          height: Platform.OS === "ios" ? 85 : 65,
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
          paddingTop: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        },
        tabBarActiveTintColor: "#3b82f6", // bright blue
        tabBarInactiveTintColor: "#6b7280", // gray
      }}
    >
      {tabs.map(({ name, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <TabBarIcon
                name={name}
                icon={icon}
                focused={focused}
                color={color}
                size={size}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
};

export default DashboardLayout;
