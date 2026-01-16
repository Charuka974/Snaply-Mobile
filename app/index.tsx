import React from "react";
import { Redirect } from "expo-router";
import "../global.css";
import { useAuth } from "@/hooks/useAuth";
import { ActivityIndicator, View } from "react-native";

const Index = () => {

  const {user, loading} = useAuth()
  
  if (loading) {
    return (
      <View className= "flex-1 justify-center items-center bg-gray-50">
          <ActivityIndicator size="large" color="#4ade80" />
      </View>
    )
  }
  if (user) {
    return <Redirect href={"/home"} />;
  }else{
    return <Redirect href={"/getstarted"} />;
  }

};

export default Index;