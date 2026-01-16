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
  Extrapolation,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type MaterialIconName = "home" | "search" | "add-circle" | "movie" | "person";
type TabName = "home" | "search" | "create" | "reels" | "profile";

interface TabBarIconProps {
  name: TabName;
  icon: MaterialIconName;
  focused: boolean;
  color: string;
  size: number;
}

function TabBarIcon({ name, icon, focused, color, size }: TabBarIconProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (focused) {
      scale.value = withSequence(
        withSpring(1.1, { damping: 15, stiffness: 180 }),
        withSpring(1, { damping: 12, stiffness: 150 })
      );

      if (name === "create") {
        rotation.value = withSequence(
          withSpring(-8, { damping: 14 }),
          withSpring(8, { damping: 14 }),
          withSpring(0, { damping: 12 })
        );
      }
    } else {
      scale.value = withSpring(1, { damping: 16 });
      rotation.value = withSpring(0);
    }
  }, [focused, name]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const isCreate = name === "create";

  return (
    <View 
      style={{
        alignItems: "center",
        justifyContent: isCreate ? "flex-start" : "center",
        position: "relative",
        flex: 1,
        height: "100%",
      }}
    >
      {/* Icon container */}
      <Animated.View style={[iconStyle, { marginTop: isCreate ? -28 : 0 }]}>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 999,
            ...(isCreate
              ? {
                  width: 64,
                  height: 64,
                  backgroundColor: "#06b6d4",
                  shadowColor: "#06b6d4",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }
              : {}),
          }}
        >
          <MaterialIcons
            name={icon}
            size={isCreate ? 36 : focused ? 28 : 24}
            color={
              isCreate
                ? "#ffffff"
                : focused
                ? "#22d3ee"
                : color
            }
            style={{ opacity: 1 }}
          />
        </View>
      </Animated.View>

      {/* Simple indicator dot for non-create tabs */}
      {focused && !isCreate && (
        <View
          style={{
            position: "absolute",
            bottom: -6,
            width: 4,
            height: 4,
            backgroundColor: "#22d3ee",
            borderRadius: 999,
            marginTop: 4,
          }}
        />
      )}
    </View>
  );
}

export default function DashboardLayout() {
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
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: "#0a0e14",
          borderTopWidth: 1,
          borderTopColor: "rgba(34, 211, 238, 0.08)",
          height: Platform.select({ ios: 88, android: 70, web: 75 }),
          paddingBottom: Platform.select({ ios: 24, android: 12, web: 12 }),
          paddingTop: 8,
          paddingHorizontal: 8,
          ...Platform.select({
            web: {
              boxShadow: "0 -4px 16px rgba(0, 0, 0, 0.3)",
            },
            default: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 12,
            },
          }),
        },
        tabBarActiveTintColor: "#22d3ee",
        tabBarInactiveTintColor: "#64748b",
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
}