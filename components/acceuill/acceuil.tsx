
import React from "react";
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons"; // Import des icônes
import data from "@/assets/data/data";
import { ItemType } from "@/types/ItemType";


const Accueill = () => {
  return (
    <View className="flex p-0 mt-2">
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }: { item: ItemType }) => (
          <View className="bg-white rounded-3xl shadow-lg mb-6 overflow-hidden">
            {/* Image */}
            <Image source={item.avatar} className="w-full h-56" resizeMode="cover" />

            {/* Contenu */}
            <View className="p-5">
              {/* Localisation et Prix */}
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  <MaterialIcons name="location-on" size={22} color="#374151" />
                  <Text className="text-lg font-semibold text-gray-800 ml-1">{item.location}</Text>
                </View>
                <View className="flex-row items-center">
                  <FontAwesome name="dollar" size={20} color="#1E40AF" />
                  <Text className="text-lg font-bold text-blue-600 ml-1">{item.price}</Text>
                </View>
              </View>

              {/* Disponibilité */}
              <Text className="text-gray-600 mb-2">{item.availibility}</Text>

              {/* Avis et Note */}
              <View className="flex-row items-center mb-4">
                <FontAwesome name="star" size={20} color="#FACC15" />
                <Text className="text-yellow-500 text-lg font-semibold ml-2">{item.stars}</Text>
                <Text className="ml-2 text-gray-500">({item.review} avis)</Text>
              </View>

              {/* Bouton Voir Plus */}
              <TouchableOpacity
                className="bg-blue-600 p-3 rounded-xl flex items-center"
                activeOpacity={0.7} // Effet tactile
              >
                <Text className="text-white font-semibold text-lg">Voir plus</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default Accueill;

