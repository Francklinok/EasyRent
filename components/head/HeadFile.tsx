
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { LinearGradient } from "expo-linear-gradient"; // Ajoute LinearGradient si tu veux un fond dégradé

const Header = () => {
  return (
    <View className="w-full h-20 p-4 rounded-[14px] overflow-hidden mt-14">
      {/* Dégradé de fond */}
      <LinearGradient
        colors={["#6EE7B7", "#3B82F6"]} // Dégradé du vert au bleu
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className=" absolute top-0 left-0 right-0 bottom-0 rounded-[14px]"
      />

      {/* Contenu du header */}
      <View className="flex-row  items-center justify-between relative z-10">
        <Text className="text-white text-4xl font-bold">Discover</Text>
        
        {/* Icône de recherche */}
        <TouchableOpacity>
          <EvilIcons name="search" size={40} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
