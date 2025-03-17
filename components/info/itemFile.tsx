
import { View, Text, FlatList, Image, Dimensions } from "react-native";
import { FontAwesome, MaterialIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useRef } from "react";

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

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <View className="flex flex-col gap-10 bg-white/90 rounded-3xl shadow-2xl  p-1 overflow-hidden">
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
      <View className="flex flex-row justify-between p-5 ">
        {/* Localisation & Prix */}
          <View className="flex-row items-center">
            <MaterialIcons name="location-on" size={24} color="#374151" />
            <Text className="text-base font-medium text-gray-800 ml-1">Location</Text>
          </View>
          <View>
            <Feather name="message-circle" size={24} color="black" />
          </View>

          <View className="flex-row items-center">
            <FontAwesome name="star" size={20} color="#FFD700" />
            <Text className="text-lg font-semibold text-yellow-500 ml-2">{item.stars}</Text>
          </View>

          <View className="flex-row items-center bg-blue-500 px-3 py-1 rounded-full">
            <FontAwesome name="dollar" size={16} color="white" />
            <Text className="text-white font-semibold ml-1">{item.price}</Text>
          </View>
        
      </View>
    </View>
  );
};

export default ItemData;
