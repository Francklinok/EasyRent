import React from "react";
import { View, Text, FlatList, Image, TouchableOpacity, Dimensions } from "react-native";
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
// import Header from "@/components/head/HeadFile";
import data from "@/assets/data/data";
import { ItemType } from "@/types/ItemType";


const { width } = Dimensions.get('window');

const RenHouseAcceuil= () => {
  const router = useRouter();
  
  const navigateToInfo = (item: ItemType) => {
    router.push({
      pathname: "/info/[infoId]",
      params: { 
        id: item.id
      }
    }); 
  };

  const renderItem = ({ item }: { item: ItemType }) => (
    <View className="mb-4 px-0">
      <View className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Image Section with Overlay */}
        <View className="relative">
          <Image 
            source={item.avatar} 
            className="w-full h-80" 
            resizeMode="cover" 
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            className="absolute bottom-0 left-0 right-0 h-1/2"
          />
          <View className="absolute top-4 left-4 right-4 flex-row justify-between">
            <View className={`px-3 py-1 rounded-full ${item.availibility ? "bg-green-500/80" : "bg-red-500/80"}`}>
              <Text className="text-white font-semibold">
                {item.availibility ? "Available" : "Unavailable"}
              </Text>
            </View>
            <TouchableOpacity className="bg-white/30 p-2 rounded-full">
              <Ionicons name="heart" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Section */}
        <View className=" flex gap-2 p-4 space-y-2 bg-white">
          {/* Location and Rating */}
          <View className="flex-row  justify-between items-center">
            <View className="flex-row items-center space-x-2">
              <MaterialIcons name="location-on" size={24} color="#374151" />
              <Text className="text-base font-semibold text-gray-700">{item.location}</Text>
            </View>
            <View className="flex-row items-center space-x-1">
              <FontAwesome5 name="star" size={18} color="#FFD700" />
              <Text className="text-lg font-bold text-yellow-500">{item.stars}</Text>
            </View>
            <View className="bg-purple-500/20 px-3 py-1 rounded-full">
              <Text className="text-purple-700 font-semibold">Proximity Services</Text>
            </View>
            <View className="flex-row items-center bg-blue-500 px-4 py-2 rounded-full space-x-2">
              <FontAwesome5 name="dollar-sign" size={16} color="white" />
              <Text className="text-white font-bold">{item.price}</Text>
            </View>
          </View>

          {/* Price and Service */}
          <View className="flex-row justify-between items-center">
          
{/*           
            <View className="bg-purple-500/20 px-3 py-1 rounded-full">
              <Text className="text-purple-700 font-semibold">Resrevation</Text>
            </View> */}
          </View>

          {/* Review */}
          <Text className="text-gray-600 text-base leading-relaxed mb-4">
            {item.review}
          </Text>

          {/* Action Button */}
          {/* <TouchableOpacity 
            onPress={() => navigateToInfo(item)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 py-4 rounded-xl shadow-lg"
          >
            <Text className="text-white text-center text-lg font-bold">
              Learn More
            </Text>
          </TouchableOpacity> */}
          <TouchableOpacity
              onPress={() => navigateToInfo(item)}
              className="rounded-xl shadow-lg overflow-hidden"
            >
              <LinearGradient
                colors={['#3882F6', '#8B5CF6']} // Bleu à Violet
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-4 items-center"
              >
                <Text className="text-white text-center text-lg font-bold">
                  Learn More
                </Text>
              </LinearGradient>
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex bg-gray-50">
      {/* <Header /> */}
      <LinearGradient
        colors={["rgba(240,240,240,0.3)", "rgba(255,255,255,0.5)"]}
        className="flex"
      >
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 20 }}
        />
      </LinearGradient>
    </View>
  );
};

export default RenHouseAcceuil;


