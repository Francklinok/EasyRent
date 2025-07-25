import React from "react";
import { View, Text, FlatList } from "react-native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedView } from "../ui/ThemedView";
import { ThemedText } from "../ui/ThemedText";
import { useTheme } from "../contexts/theme/themehook";


interface EquipmentProps {
  itemData?: any;
}

const Equipment = ({ itemData }: EquipmentProps) => {
  const  {theme} = useTheme()
  const   item = itemData
  if(!item ||  ! item.equipments){
    return   (
      <ThemedView>
        <ThemedText className = "pt-10 text-center">
          Pas d equipement  disponible  
        </ThemedText>
      </ThemedView>
    )
  }
  const equipments = item?.equipments?.map((eq: any, index: number) => {
  const IconLib = eq.lib === "MaterialCommunityIcons" ? MaterialCommunityIcons : FontAwesome5;
  return {
    id: eq.id ?? index.toString(),
    icon: eq.icon,
    text: eq.name,
    lib: IconLib
  };
});


  return (
    <ThemedView className="p-5 rounded-xl">
      <ThemedText type="subtitle" className="mb-4 text-center">
        🏡 Équipements {item?.type ? `- ${item.type}` : 'de la maison'}
      </ThemedText>
      
      {item?.location && (
        <ThemedText className="text-center pb-4" >
          📍 {item.location}
        </ThemedText>
      )}
      
      <FlatList
        data={equipments}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <ThemedView variant = "surfaceVariant" className="flex-row items-center p-2 gap-4 rounded-lg shadow-sm m-1 w-[48%]" >
            <item.lib name={item.icon} size={20} color= {theme.primary} />
            <ThemedText>{item.text}</ThemedText>
          </ThemedView>
        )}
      />
      
      {item?.price && (
        <ThemedView className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
          <ThemedText className = "text-center" >
            💰 Prix: {item.price}
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
};

export default Equipment;