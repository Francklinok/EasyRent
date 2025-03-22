
// import React from "react";
// import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
// import { FontAwesome, MaterialIcons,Feather } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import data from "@/assets/data/data";
// import { ItemType } from "@/types/ItemType";

// const Accueill = () => {
//   return (
//     <LinearGradient
//       colors={["rgba(242,242,242,0.25)", "rgba(255,255,255,0.28)"]}
//       start={{ x: -0.1, y: 0.2 }}
//       end={{ x: 1, y: 1 }}
//       className="flex"
//     >
//       <FlatList
//         data={data}
//         keyExtractor={(item, index) => index.toString()}
//         showsVerticalScrollIndicator={false}
//         renderItem={({ item }: { item: ItemType }) => (
          
//           <View className="bg-white/90 rounded-3xl shadow-2xl mb-6 mt-6 p-1 overflow-hidden">
//             {/* Image avec Effet Instagram */}
//             <View className="relative">
//               <Image source={item.avatar} className="w-full h-80 rounded-t-3xl" resizeMode="cover" />
//               <LinearGradient
//                 colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.4)"]}
//                 className="absolute bottom-0 w-full h-36 rounded-t-3xl"
//               />
//                 <Text 
//                   className={`absolute right-3 border p-2 mt-2 rounded-[20px] text-base font-medium 
//                   ${item.availibility ? "text-green-600" : "text-red-500"} 
//                   bg-[rgba(173,216,230,0.3)] border-blue-200`}>
//                   {item.availibility ? "Disponible" : "Indisponible"}
//                 </Text>

//             </View>
                

//             {/* Contenu */}
//             <View className="p-5">
//               {/* Localisation & Prix */}
//               <View className="flex-row justify-between items-center mb-2">
//                 <View className="flex-row items-center">
//                   <MaterialIcons name="location-on" size={24} color="#374151" />
//                   <Text className="text-base font-medium text-gray-800 ml-1">{item.location}</Text>
//                 </View>
//                 <View className="flex-row items-center bg-gray-400 px-3 py-1 rounded-full">
//                   <Text className="text-white font-semibold ml-1">Proximity Services</Text>
//                 </View>
//                 <View>
//                 <View className={`mb-1 text-base font-medium ${item.availibility ? "text-green-500" : "text-red-500"}`}>
//                  {/* <MaterialIcons name="message-circle" size={24} color="#1E40AF" /> */}
//                  <Feather name="message-circle" size={24} color="black" />
//                 </View>
//               </View>
//               <View className="flex-row items-center mb-3">
//                 <FontAwesome name="star" size={20} color="#FFD700" />
//                 <Text className="text-lg font-semibold text-yellow-500 ml-2">{item.stars}</Text>
//               </View>

//                 <View className="flex-row items-center bg-blue-500 px-3 py-1 rounded-full">
//                   <FontAwesome name="dollar" size={16} color="white" />
//                   <Text className="text-white font-semibold ml-1">{item.price}</Text>
//                 </View>
            
//               </View>
           
//               <View>                
//                 <Text className=" w-95 p-2  text-[16px] text-gray-800">{item.review} </Text>
//               </View>


//               {/* Bouton Voir Plus */}
//               <TouchableOpacity className="bg-blue-400 from-purple-500 to-pink-500 py-3 rounded-xl items-center active:opacity-90 shadow-lg">
//                 <Text className="text-white font-bold text-lg">Voir Plus</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//       />
//     </LinearGradient>
//   );
// };

// export default Accueill;
