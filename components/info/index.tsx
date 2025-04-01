
import { View, Text, FlatList, Image, Dimensions, TouchableOpacity, Modal, Animated, Easing } from "react-native";
import { useState, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useRoute } from "@react-navigation/native";


const { width } = Dimensions.get("window");

const data = [
  {
    id: "2",
    avatar: [
      require("@/assets/images/1.jpg"),
      require("@/assets/images/2.jpg"),
      require("@/assets/images/3.jpg"),
      require("@/assets/images/4.jpg"),
    ],
    price: "780.22$",
    availibility: true,
    stars: 5,
    location: "Texas",
    availableDates: { "2024-04-10": { selected: true, marked: true, selectedColor: "blue" } },
  },
];


interface Item {
  id: string;
  avatar: any[];
  price: string;
  availibility: boolean;
  stars: number;
  location: string;
  availableDates: any;
}

const ItemData = () => (
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

const ItemCard = ({ item }:{ item: Item }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [animation] = useState(new Animated.Value(0)); // Animation value for the modal
  const navigation = useNavigation();

  const descriptionCourte = "Studio de 14 m² Meublé • 6ème étage ...";
  const descriptionComplete = "Ce beau petit studio de 14 m² au total dont 11 m² Carrez...";

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  // Animation to slide up the modal from bottom to top
  const openCalendarModal = () => {
    setModalVisible(true);
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  };

  const closeCalendarModal = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start(() => setModalVisible(false));
  };

  return (
    <View className="flex flex-col gap-10 bg-white/90 rounded-3xl shadow-2xl p-1 overflow-hidden h-full">
      {/* Réservation Bouton */}
      <TouchableOpacity
        onPress={() => router.navigate({
          pathname:"/booking/bookingscreen"
        })}
        className="bg-blue-500 p-4 rounded-full absolute top-5 left-5 z-10"
      >
        <Text className="text-white text-center text-lg font-bold">Réserver maintenant</Text>
      </TouchableOpacity>

      {/* Carrousel d'images */}
      <View className="relative">
        <FlatList
          ref={flatListRef}
          horizontal
          data={item.avatar}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <Image source={item} style={{ width, height: 300 }} resizeMode="cover" />
          )}
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
        <View className="absolute bottom-2 w-full flex-row justify-center">
          {item.avatar.map((_, index) => (
            <View
              key={index}
              className={`h-2 w-2 mx-1 rounded-full ${currentIndex === index ? "bg-blue-500" : "bg-gray-400"}`}
            />
          ))}
        </View>
      </View>

      {/* Description */}
      <View className="flex flex-row justify-between p-4">
        <View>
          <Text className="text-[20px] font-bold">Description</Text>
          <Text className="text-gray-800">{isExpanded ? descriptionComplete : descriptionCourte}</Text>
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
            <Text className="text-blue-500 font-semibold">
              {isExpanded ? "Voir moins" : "Voir plus"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Informations générales */}
      <View className="flex flex-col gap-8 pl-4">
        <Text>Information générale</Text>
        <View className="flex flex-row gap-10">
          <View className="flex flex-row gap-4">
            <Ionicons name="person-outline" size={24} color="black" />
            <Text>1 Chambre</Text>
          </View>
          <View className="flex flex-row gap-4">
            <MaterialCommunityIcons name="shower" size={24} color="black" />
            <Text>1 Shower</Text>
          </View>
          <View className="flex flex-row gap-4">
            <FontAwesome6 name="restroom" size={24} color="black" />
            <Text>1 restroom</Text>
          </View>
        </View>
      </View>

      {/* Calendrier de disponibilité */}
      <View className="p-5">
        <Text className="text-[20px] font-bold">Disponibilité</Text>
        <TouchableOpacity
          onPress={openCalendarModal}
          className="bg-blue-500 p-4 rounded-full mt-5"
        >
          <Text className="text-white text-center text-lg font-bold">calendrier de disponibiliter</Text>
        </TouchableOpacity>
      </View>

      {/* Modal calendrier */}
      <Modal
        visible={modalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={closeCalendarModal}
      >
        <Animated.View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            transform: [{ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [300, 0] }) }],
          }}
        >
          <View className="bg-white rounded-t-3xl p-4">
            <Calendar markedDates={item.availableDates} />
            <TouchableOpacity
              onPress={closeCalendarModal}
              className="bg-red-500 p-3 rounded-full mt-4"
            >
              <Text className="text-white text-center text-lg font-bold">Fermer</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
};

export default ItemData;
