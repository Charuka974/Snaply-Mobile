import { TouchableOpacity, Text, Image, View } from "react-native";
import React from "react";
import GoogleLogo from "@/assets/images/logos/Google_Favicon_2025.svg.png";

type Props = {
  onPress: () => void;
};

const GoogleButton = ({ onPress }: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-row items-center justify-center bg-black border border-zinc-800 rounded-full py-3 px-4 shadow-md"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5, // Android shadow
      }}
    >
      {/* Google Logo (Local PNG) */}
      <View style={{ marginRight: 12 }}>
        <Image
          source={GoogleLogo}
          style={{ width: 24, height: 24 }} // <- Fix size here
          resizeMode="contain"
        />
      </View>

      <Text className="text-white font-semibold text-base">
        Continue with Google
      </Text>
    </TouchableOpacity>
  );
};

export default GoogleButton;
