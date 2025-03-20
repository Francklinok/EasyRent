// import React from "react";
// import { View, Text, FlatList } from "react-native";
// import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";

// const features = [
//   { id: "1", icon: "map-marker-alt", text: "Emplacement idéal", lib: FontAwesome5 },
//   { id: "2", icon: "city", text: "Quartier calme et sécurisé", lib: FontAwesome5 },
//   { id: "3", icon: "weather-sunny", text: "Luminosité optimale", lib: MaterialCommunityIcons },
//   { id: "4", icon: "fridge-outline", text: "Cuisine équipée", lib: MaterialCommunityIcons },
//   { id: "5", icon: "sofa", text: "Salon spacieux", lib: MaterialCommunityIcons },
//   { id: "6", icon: "bed", text: "Chambres avec rangements", lib: FontAwesome5 },
//   { id: "7", icon: "shower", text: "Salle de bain moderne", lib: FontAwesome5 },
//   { id: "8", icon: "wardrobe-outline", text: "Dressing intégré", lib: MaterialCommunityIcons },
//   { id: "9", icon: "snowflake", text: "Climatisation et chauffage", lib: FontAwesome5 },
//   { id: "10", icon: "wifi", text: "Internet fibre optique", lib: FontAwesome5 },
//   { id: "11", icon: "tree", text: "Jardin ou terrasse", lib: FontAwesome5 },
//   { id: "12", icon: "swim", text: "Piscine privée", lib: MaterialCommunityIcons },
//   { id: "13", icon: "car", text: "Parking privé", lib: FontAwesome5 },
//   { id: "14", icon: "shield-home", text: "Sécurité renforcée", lib: MaterialCommunityIcons },
//   { id: "15", icon: "solar-power", text: "Énergie solaire", lib: MaterialCommunityIcons },
// ];

// const Atout = () => {
//   return (
//     <View className="bg-white p-5 rounded-xl shadow-lg m-4">
//       <Text className="text-xl font-bold text-gray-800 mb-4">🏡 Atouts du logement</Text>
//       <FlatList
//         data={features}
//         keyExtractor={(item) => item.id}
//         numColumns={2}
//         columnWrapperStyle={{ justifyContent: "space-between" }}
//         renderItem={({ item }) => (
//           <View className="flex-row items-center bg-gray-100 p-3 rounded-lg shadow-sm m-1 w-[48%]">
//             <item.lib name={item.icon} size={24} color="#4A90E2" />
//             <Text className="text-gray-700 text-base ml-2 flex-1">{item.text}</Text>
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// export default Atout;
import React from "react";
import { View, Text, FlatList } from "react-native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";

const features = [
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

const Atout = () => {
  return (
    <View className="bg-white p-4 rounded-xl shadow-md h-full">
      <Text className="text-xl font-bold mb-4 text-gray-800">Atouts du logement</Text>
      <FlatList
        key={"2-columns"} // Force un re-render
        data={features}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }} // Espace entre les colonnes
        renderItem={({ item }) => (
          <View className="flex-row items-center space-x-3 mb-4 w-[48%]"> 
            <item.lib name={item.icon} size={24} color="#4A90E2" />
            <Text className="text-gray-700 text-base">{item.text}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default Atout;
