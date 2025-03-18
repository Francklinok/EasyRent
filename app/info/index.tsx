
// import { View, Text, FlatList, Image, Dimensions } from "react-native";
// import { FontAwesome, MaterialIcons, Feather } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { useState, useRef } from "react";

// const { width } = Dimensions.get("window");

// interface Item {
//   id: string;
//   avatar: any[]; // Changez cela en `ImageSourcePropType[]` si possible
//   price: string;
//   availibility: boolean;
//   stars: number;
//   location: string;
// }

// const data: Item[] = [
//   {
//     id: "2",
//     avatar: [
//       require("@/assets/images/1.jpg"),
//       require("@/assets/images/2.jpg"),
//       require("@/assets/images/3.jpg"),
//       require("@/assets/images/4.jpg"),
//     ],
//     price: "780.22$",
//     availibility: false,
//     stars: 5,
//     location: "Texas",
//   },
// ];

// const ItemData = () => {
//   return (
//     <LinearGradient
//       colors={["rgba(242,242,242,0.25)", "rgba(255,255,255,0.28)"]}
//       start={{ x: -0.1, y: 0.2 }}
//       end={{ x: 1, y: 1 }}
//       className="flex"
//     >
//       <FlatList
//         data={data}
//         keyExtractor={(item) => item.id}
//         showsVerticalScrollIndicator={false}
//         renderItem={({ item }) => <ItemCard item={item} />}
//       />
//     </LinearGradient>
//   );
// };

// const ItemCard = ({ item }: { item: Item }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const flatListRef = useRef<FlatList<any>>(null);

//   const handleScroll = (event: any) => {
//     const index = Math.round(event.nativeEvent.contentOffset.x / width);
//     setCurrentIndex(index);
//   };

//   return (
//     <View className="flex flex-col gap-10 bg-white/90 rounded-3xl shadow-2xl  p-1 overflow-hidden">
//       {/* Carrousel d'images */}
//       <View className="relative">
//         <FlatList
//           ref={flatListRef}
//           horizontal
//           data={item.avatar}
//           keyExtractor={(_, index) => index.toString()}
//           renderItem={({ item }) => (
//             <Image source={item} style={{ width: width, height: 300 }} resizeMode="cover" />
//           )}
//           showsHorizontalScrollIndicator={false}
//           pagingEnabled
//           onScroll={handleScroll}
//           scrollEventThrottle={16}
//           snapToAlignment="center"
//           snapToInterval={width} 
//           decelerationRate="fast"
//         />
//         {/* Indicateur de pagination */}
//         <View className="absolute bottom-2 w-full flex-row justify-center">
//           {item.avatar.map((_, index) => (
//             <View
//               key={index}
//               className={`h-2 w-2 mx-1 rounded-full ${
//                 currentIndex === index ? "bg-blue-500" : "bg-gray-400"
//               }`}
//             />
//           ))}
//         </View>
//       </View>

//       {/* Contenu */}
//       <View className="flex flex-row justify-between p-5 ">
//         {/* Localisation & Prix */}
//           {/* <View className="flex-row items-center">
//             <MaterialIcons name="location-on" size={24} color="#374151" />
//             <Text className="text-base font-medium text-gray-800 ml-1">Location</Text>
//           </View>
//           <View>
//              <Feather name="message-circle" size={24} color="black" /> 
//           </View> */}
// {/* 
//           <View className="flex-row items-center">
//             <FontAwesome name="star" size={20} color="#FFD700" />
//             <Text className="text-lg font-semibold text-yellow-500 ml-2">{item.stars}</Text>
//           </View>

//           <View className="flex-row items-center bg-blue-500 px-3 py-1 rounded-full">
//             <FontAwesome name="dollar" size={16} color="white" />
//             <Text className="text-white font-semibold ml-1">{item.price}</Text>
//           </View> */}

//           <View>
//             <Text className = "text-[20px] text-bold">Description</Text>
//             <View className = " flex flex-col gap-2">
//             <Text>
//             Ce beau petit studio de 14 m² au total dont 11 m² Carrez, est situé au 6ème étage avec ascenseur jusqu'au 5ème étage, d'un immeuble parisien très sécurisé par 2 codes d'accès et surveillé par un couple de gardiens qui
//              vit dans la loge à l'entrée du HALL de la copropriété. Il se compose d'un espace séjour/cuisine, d'une salle de douche avec WC. Il est complètement meublé , aménagé et équipé avec une TV+WIFI, une machine à laver à la disposition. 
//              Idéal pour étudiants, stagiaires, jeunes travailleurs en mission à PARIS...
//              <Text>
              
//             Frais de ménage de 49 Euros demandé en fin de séjour .

//             Le locataire s'engage à régler au gestionnaire - après signature du bail des frais de gestion & administration de 6% du Loyer total Charges Comprises (TVA incluse)
//             Frais état des lieux: 33 Euros TTC

//              </Text>
//              <Text>
//              Bail de résidence non principale du locataire à signer pour une durée de 8 mois maximum. Merci de me communiquer votre candidature en précisant le motif de votre séjour. 

//              </Text>
//              </Text>

//             </View>
            
//           </View>
        
//       </View>
//     </View>
//   );
// };

// export default ItemData;


import { View, Text, FlatList, Image, Dimensions, TouchableOpacity } from "react-native";
import { useState, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get("window");

interface Item {
  id: string;
  avatar: any[]; // Changez cela en `ImageSourcePropType[]` si possible
  price: string;
  availibility: boolean;
  stars: number;
  location: string;
}

const data: Item[] = [
  {
    id: "2",
    avatar: [
      require("@/assets/images/1.jpg"),
      require("@/assets/images/2.jpg"),
      require("@/assets/images/3.jpg"),
      require("@/assets/images/4.jpg"),
    ],
    price: "780.22$",
    availibility: false,
    stars: 5,
    location: "Texas",
  },
];

const ItemData = () => {
  return (
    <LinearGradient
      colors={["rgba(242,242,242,0.25)", "rgba(255,255,255,0.28)"]}
      start={{ x: -0.1, y: 0.2 }}
      end={{ x: 1, y: 1 }}
      className="flex"
    >
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <ItemCard item={item} />}
      />
    </LinearGradient>
  );
};

const ItemCard = ({ item }: { item: Item }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<any>>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const descriptionCourte = " Studio de 14 m² Meublé • 6ème étage ...";
  const descriptionComplete = `Ce beau petit studio de 14 m² au total dont 11 m² Carrez, est situé au 6ème étage avec ascenseur jusqu'au 5ème étage, d'un immeuble parisien très sécurisé par 2 codes d'accès et surveillé par un couple de gardiens qui vit dans la loge à l'entrée du HALL de la copropriété. Il se compose d'un espace séjour/cuisine, d'une salle de douche avec WC. Il est complètement meublé, aménagé et équipé avec une TV+WIFI, une machine à laver à la disposition. Idéal pour étudiants, stagiaires, jeunes travailleurs en mission à PARIS...

Frais de ménage de 49 Euros demandé en fin de séjour.

Le locataire s'engage à régler au gestionnaire - après signature .33 Euros TTC.

Bail de résidence.`;

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <View className="flex flex-col gap-10 bg-white/90 rounded-3xl shadow-2xl p-1 overflow-hidden">
      {/* Carrousel d'images */}
      <View className="relative">
        <FlatList
          ref={flatListRef}
          horizontal
          data={item.avatar}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <Image source={item} style={{ width: width, height: 300 }} resizeMode="cover" />
          )}
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onScroll={handleScroll}
          scrollEventThrottle={16}
          snapToAlignment="center"
          snapToInterval={width}
          decelerationRate="fast"
        />
        {/* Indicateur de pagination */}
        <View className="absolute bottom-2 w-full flex-row justify-center">
          {item.avatar.map((_, index) => (
            <View
              key={index}
              className={`h-2 w-2 mx-1 rounded-full ${
                currentIndex === index ? "bg-blue-500" : "bg-gray-400"
              }`}
            />
          ))}
        </View>
      </View>

      {/* Contenu */}
      <View className="flex flex-row justify-between p-4">
        <View>
          <Text className="text-[20px] font-bold">Description</Text>
          <View className="flex flex-col gap-2">
            <Text className="text-gray-800">
              {isExpanded ? descriptionComplete : descriptionCourte}
            </Text>
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
              <Text className="text-blue-500 font-semibold">
                {isExpanded ? "Voir moins" : "Voir plus"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      
      </View>
      <View className = " flex flex-col gap-8 pl-4">
          <Text> Information generale</Text>
          <View className="flex flex-row gap-10">
            <View className = "flex flex-row gap-4 ">
            <Ionicons name="person-outline" size={24} color="black" />
            <Text>1 Chambre</Text>
            </View>
            <View className = "flex flex-row gap-4">
            <MaterialCommunityIcons name="shower" size={24} color="black" />
            <Text>1 Shower</Text>
            </View>

          </View>
          
        </View>
        <View className = "flex flex-col p-5">
          <Text>Quartier</Text>
          <View>
            <Text>Add map here</Text>
          </View>
        </View>
    </View>
  );
};

export default ItemData;

// import React, { useState, useRef } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   Dimensions,
//   TouchableOpacity,
//   SafeAreaView,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";

// // Récupération de la largeur de l'écran
// const { width } = Dimensions.get("window");

// // Import des images (remplace les chemins par ceux valides)
// import image1 from "@/assets/images/1.jpg";
// import image2 from "@/assets/images/2.jpg";
// import image3 from "@/assets/images/3.jpg";
// import image4 from "@/assets/images/4.jpg";

// // Interface du type de données
// interface Item {
//   id: string;
//   avatar: any[]; // Changez en `ImageSourcePropType[]` si nécessaire
//   price: string;
//   availibility: boolean;
//   stars: number;
//   location: string;
// }

// // Données statiques
// const data: Item[] = [
//   {
//     id: "1",
//     avatar: [image1, image2, image3, image4],
//     price: "780.22$",
//     availibility: false,
//     stars: 5,
//     location: "Texas",
//   },
// ];

// const ItemData = () => {
//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <LinearGradient
//         colors={["rgba(242,242,242,0.25)", "rgba(255,255,255,0.28)"]}
//         start={{ x: -0.1, y: 0.2 }}
//         end={{ x: 1, y: 1 }}
//         style={{ flex: 1 }} // Ajouté pour éviter les bugs d'affichage
//       >
//         <FlatList
//           data={data}
//           keyExtractor={(item) => item.id}
//           showsVerticalScrollIndicator={false}
//           renderItem={({ item }) => <ItemCard item={item} />}
//           contentContainerStyle={{ paddingBottom: 20 }} // Ajout d'un padding bas pour éviter les problèmes de scroll
//         />
//       </LinearGradient>
//     </SafeAreaView>
//   );
// };

// const ItemCard = ({ item }: { item: Item }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const flatListRef = useRef<FlatList<any>>(null);
//   const [isExpanded, setIsExpanded] = useState(false);

//   const descriptionCourte =
//     "Ce beau petit studio de 14 m² au total dont 11 m² Carrez...";
//   const descriptionComplete = `Ce beau petit studio de 14 m² au total dont 11 m² Carrez, est situé au 6ème étage avec ascenseur jusqu'au 5ème étage, d'un immeuble parisien sécurisé par 2 codes d'accès et surveillé par un couple de gardiens. Il se compose d'un espace séjour/cuisine, d'une salle de douche avec WC. Il est meublé et équipé avec une TV+WIFI, une machine à laver. Idéal pour étudiants, stagiaires, jeunes travailleurs en mission à PARIS...`;

//   const handleScroll = (event: any) => {
//     const index = Math.round(event.nativeEvent.contentOffset.x / width);
//     setCurrentIndex(index);
//   };

//   return (
//     <View className="flex flex-col bg-white/90 rounded-3xl shadow-2xl p-1 overflow-hidden m-4">
//       {/* Carrousel d'images */}
//       <View className="relative">
//         <FlatList
//           ref={flatListRef}
//           horizontal
//           data={item.avatar}
//           keyExtractor={(_, index) => index.toString()}
//           renderItem={({ item }) => (
//             <Image
//               source={item}
//               style={{ width: width - 40, height: 300, borderRadius: 15 }}
//               resizeMode="cover"
//             />
//           )}
//           showsHorizontalScrollIndicator={false}
//           pagingEnabled
//           onScroll={handleScroll}
//           scrollEventThrottle={16}
//           snapToAlignment="center"
//           snapToInterval={width - 40}
//           decelerationRate="fast"
//           style={{ flexGrow: 0 }} // Ajouté pour éviter un bug d'affichage
//         />
//         {/* Indicateur de pagination */}
//         <View className="absolute bottom-2 w-full flex-row justify-center">
//           {item.avatar.map((_, index) => (
//             <View
//               key={index}
//               className={`h-2 w-2 mx-1 rounded-full ${
//                 currentIndex === index ? "bg-blue-500" : "bg-gray-400"
//               }`}
//             />
//           ))}
//         </View>
//       </View>

//       {/* Détails du produit */}
//       <View className="p-5">
//         <Text className="text-[20px] font-bold">Description</Text>
//         <Text className="text-gray-800">
//           {isExpanded ? descriptionComplete : descriptionCourte}
//         </Text>
//         <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
//           <Text className="text-blue-500 font-semibold">
//             {isExpanded ? "Voir moins" : "Voir plus"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default ItemData;
