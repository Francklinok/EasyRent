import React from "react";
import { View, Text, FlatList } from "react-native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedView } from "../ui/ThemedView";
import { ThemedText } from "../ui/ThemedText";

const defaultEquipments = [
  { id: "1", icon: "bed", text: "Lits confortables", lib: FontAwesome5 },
  { id: "2", icon: "tv", text: "Télévision écran plat", lib: FontAwesome5 },
  { id: "3", icon: "wifi", text: "Wi-Fi haut débit", lib: FontAwesome5 },
  { id: "4", icon: "fan", text: "Climatisation", lib: FontAwesome5 },
  { id: "5", icon: "heater", text: "Chauffage", lib: MaterialCommunityIcons },
  { id: "6", icon: "fireplace", text: "Cheminée", lib: MaterialCommunityIcons },
  { id: "7", icon: "fridge", text: "Réfrigérateur", lib: MaterialCommunityIcons },
  { id: "8", icon: "microwave", text: "Micro-ondes", lib: MaterialCommunityIcons },
  { id: "9", icon: "silverware-fork-knife", text: "Ustensiles", lib: MaterialCommunityIcons },
  { id: "10", icon: "washing-machine", text: "Lave-linge", lib: MaterialCommunityIcons },
  { id: "11", icon: "tumble-dryer", text: "Sèche-linge", lib: MaterialCommunityIcons },
  { id: "12", icon: "dishwasher", text: "Lave-vaisselle", lib: MaterialCommunityIcons },
  { id: "13", icon: "shower", text: "Douche", lib: FontAwesome5 },
  { id: "14", icon: "bathtub", text: "Baignoire", lib: FontAwesome5 },
  { id: "15", icon: "toilet", text: "Toilettes", lib: FontAwesome5 },
  { id: "16", icon: "hanger", text: "Penderie", lib: MaterialCommunityIcons },
  { id: "17", icon: "iron", text: "Fer à repasser", lib: MaterialCommunityIcons },
  { id: "18", icon: "smoke-detector", text: "Détecteur fumée", lib: MaterialCommunityIcons },
  { id: "19", icon: "shield-home", text: "Alarme sécurité", lib: MaterialCommunityIcons },
  { id: "20", icon: "pool", text: "Piscine", lib: MaterialCommunityIcons },
  { id: "21", icon: "dumbbell", text: "Salle de sport", lib: MaterialCommunityIcons },
  { id: "22", icon: "car", text: "Parking", lib: FontAwesome5 },
  { id: "23", icon: "paw", text: "Animaux acceptés", lib: FontAwesome5 },
  { id: "24", icon: "baby-carriage", text: "Lit bébé", lib: MaterialCommunityIcons },
];

interface EquipmentProps {
  itemData?: any;
}

const Equipment = ({ itemData }: EquipmentProps) => {
  // Utiliser les équipements de l'item s'ils existent, sinon utiliser les équipements par défaut
  const equipments = itemData?.equipments?.map((eq: string, index: number) => ({
    id: index.toString(),
    icon: "check-circle",
    text: eq,
    lib: FontAwesome5
  })) || defaultEquipments;

  return (
    <ThemedView className="p-5 rounded-xl shadow-lg">
      <ThemedText type="title" className="mb-4">
        🏡 Équipements {itemData?.type ? `- ${itemData.type}` : 'de la maison'}
      </ThemedText>
      
      {itemData?.location && (
        <ThemedText className="mb-4 text-gray-600">
          📍 {itemData.location}
        </ThemedText>
      )}
      
      <FlatList
        data={equipments}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <ThemedView className="flex-row items-center p-3 rounded-lg shadow-sm m-1 w-[48%]" 
                     style={{ backgroundColor: 'rgba(74, 144, 226, 0.1)' }}>
            <item.lib name={item.icon} size={24} color="#4A90E2" />
            <ThemedText className="ml-2 flex-1 text-base">{item.text}</ThemedText>
          </ThemedView>
        )}
      />
      
      {itemData?.price && (
        <ThemedView className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
          <ThemedText type="subtitle" variant="primary">
            💰 Prix: {itemData.price}
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
};

export default Equipment;