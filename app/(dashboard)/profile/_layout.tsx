import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { View, Platform } from "react-native";

const ProfileLayout = () => {
  const tabs = [
    { name: "index", title: "Posts", icon: "grid-on" },
    { name: "form", title: "Edit", icon: "edit" },
  ] as const;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#000",
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 60 : 50,
          paddingBottom: Platform.OS === "ios" ? 6 : 4,
          paddingTop: 4,
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#6B7280",
      }}
    >
      {tabs.map(({ name, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <View className="items-center justify-center">
                <MaterialIcons
                  name={icon as any}
                  size={focused ? size + 2 : size}
                  color={color}
                />
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
};

export default ProfileLayout;











// import { Tabs } from "expo-router";
// import { MaterialIcons } from "@expo/vector-icons";
// import { View, Platform } from "react-native";

// const ProfileLayout = () => {
//   const tabs = [
//     { name: "index", title: "Posts", icon: "grid-on" }, 
//     { name: "form", title: "Edit", icon: "edit" },
//   ] as const;

//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarShowLabel: false,
//         tabBarStyle: {
//           backgroundColor: "#000",
//           borderTopWidth: 0,
//           height: Platform.OS === "ios" ? 85 : 65,
//           paddingBottom: Platform.OS === "ios" ? 20 : 8,
//         },
//         tabBarActiveTintColor: "#fff",
//         tabBarInactiveTintColor: "#6B7280",
//       }}
//     >
//       {tabs.map(({ name, icon }) => (
//         <Tabs.Screen
//           key={name}
//           name={name}
//           options={{
//             tabBarIcon: ({ color, size, focused }) => (
//               <View className="items-center justify-center">
//                 <MaterialIcons
//                   name={icon as any}
//                   size={focused ? size + 2 : size}
//                   color={color}
//                 />
//               </View>
//             ),
//           }}
//         />
//       ))}
//     </Tabs>
//   );
// };

// export default ProfileLayout;
