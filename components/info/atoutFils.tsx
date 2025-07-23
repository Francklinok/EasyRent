import React from "react";
import { View, Text, FlatList } from "react-native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedView } from "../ui/ThemedView";
import { ThemedText } from "../ui/ThemedText";

const defaultFeatures = [
  { id: "1", icon: "map-marker-alt", text: "Emplacement idéal", lib: FontAwesome5 },
  { id: "2", icon: "city", text: "Quartier calme et sécurisé", lib: FontAwesome5 },
  { id: "3", icon: "weather-sunny", text: "Luminosité optimale", lib: MaterialCommunityIcons },
  { id: "4", icon: "fridge-outline", text: "Cuisine équipée", lib: MaterialCommunityIcons },
  { id: "5", icon: "sofa", text: "Salon spacieux", lib: MaterialCommunityIcons },
  { id: "6", icon: "bed", text: "Chambres avec rangements", lib: FontAwesome5 },
  { id: "7", icon: "shower", text: "Salle de bain moderne", lib: FontAwesome5 },
  { id: "8", icon: "wardrobe-outline", text: "Dressing intégré", lib: MaterialCommunityIcons },
  { id: "9", icon: "snowflake", text: "Climatisation et chauffage", lib: FontAwesome5 },
  { id: "10", icon: "wifi", text: "Internet fibre optique", lib: FontAwesome5 },
  { id: "11", icon: "tree", text: "Jardin ou terrasse", lib: FontAwesome5 },
  { id: "12", icon: "swim", text: "Piscine privée", lib: MaterialCommunityIcons },
  { id: "13", icon: "car", text: "Parking privé", lib: FontAwesome5 },
  { id: "14", icon: "shield-home", text: "Sécurité renforcée", lib: MaterialCommunityIcons },
  { id: "15", icon: "solar-power", text: "Énergie solaire", lib: MaterialCommunityIcons },
];

interface AtoutProps {
  itemData?: any;
}

const Atout = ({ itemData }: AtoutProps) => {
  // Utiliser les atouts de l'item s'ils existent, sinon utiliser les atouts par défaut
  const features = itemData?.features?.map((feature: string, index: number) => ({
    id: index.toString(),
    icon: "star",
    text: feature,
    lib: FontAwesome5
  })) || defaultFeatures;

  return (
    <ThemedView className="p-4 rounded-xl shadow-md h-full">
      <ThemedText type="title" className="mb-4">
        ✨ Atouts du logement
      </ThemedText>
      
      {/* Informations sur le logement */}
      {itemData && (
        <ThemedView className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
          <ThemedText type="subtitle" className="mb-2">
            {itemData.type} - {itemData.location}
          </ThemedText>
          {itemData.price && (
            <ThemedText variant="primary" className="font-bold">
              💰 {itemData.price}
            </ThemedText>
          )}
          {itemData.stars && (
            <ThemedText className="mt-1">
              ⭐ {itemData.stars}/5 étoiles
            </ThemedText>
          )}
          {itemData.surface && (
            <ThemedText className="mt-1">
              📏 Surface: {itemData.surface}m²
            </ThemedText>
          )}
        </ThemedView>
      )}
      
      <FlatList
        key={"2-columns"}
        data={features}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <ThemedView className="flex-row gap-4 items-center space-x-3 mb-4 w-[42%] p-2"> 
            <item.lib name={item.icon} size={24} color="#4A90E2" />
            <ThemedText className="text-base">{item.text}</ThemedText>
          </ThemedView>
        )}
      />
      
      {itemData?.availibility !== undefined && (
        <ThemedView className="mt-4 p-3 rounded-lg" 
                   style={{ backgroundColor: itemData.availibility ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
          <ThemedText variant={itemData.availibility ? "primary" : "destructive"}>
            {itemData.availibility ? "✅ Disponible" : "❌ Non disponible"}
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
};

export default Atout;