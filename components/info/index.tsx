import { View, Text, FlatList, Image, Dimensions, TouchableOpacity, Modal, Animated, Easing, StatusBar, Platform } from "react-native";
import { useState, useRef } from "react";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Calendar } from 'react-native-calendars';
import { router } from 'expo-router';
import { ThemedView } from "../ui/ThemedView";
import { ThemedText } from "../ui/ThemedText";
import { useTheme } from "../contexts/theme/themehook";
import { eachDayOfInterval, format } from "date-fns"; // npm install date-fns

const { width, height } = Dimensions.get("window");

// Obtenir la hauteur de la status bar
const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
const screenHeight = height + statusBarHeight;

interface ItemDataProps {
  itemData?: any;
}

// Génération des dates marquées en vert
const getMarkedDates = (start: string, end: string) => {
  const days = eachDayOfInterval({
    start: new Date(start),
    end: new Date(end),
  });

  const marked: any = {};
  days.forEach((day, index) => {
    const dateStr = format(day, "yyyy-MM-dd");

    marked[dateStr] = {
      startingDay: index === 0,
      endingDay: index === days.length - 1,
      color: "#34D399", 
      textColor: "white",
    };
  });

  return marked;
};

const ItemData = ({ itemData }: ItemDataProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(screenHeight));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const { theme } = useTheme();

  // Données par défaut
  const item = itemData;

  const descriptionComplete = item?.description || "";
  const descriptionCourte =
    descriptionComplete.length > 100
      ? descriptionComplete.slice(0, 100) + "..."
      : descriptionComplete;

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const openCalendarModal = () => {
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.bezier(0.25, 0.8, 0.25, 1),
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeCalendarModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.bezier(0.25, 0.8, 0.25, 1),
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
    });
  };

  // Animation pour le bouton de réservation
  const animateReservationButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Générer les dates disponibles (en vert)
  const markedDates = getMarkedDates(
    item.propertyAvailability.startDate,
    item.propertyAvailability.endDate
  );

  // Préparer la liste d'images
  let imageList: any[] = [];
  if (item.avatar) {
    if (Array.isArray(item.avatar)) {
      imageList = item.avatar.map((img: any) =>
        typeof img === "string" ? { uri: img } : img
      );
    } else {
      imageList = [typeof item.avatar === "string" ? { uri: item.avatar } : item.avatar];
    }
  }

  return (
    <>
      <ThemedView className="flex flex-col space-y-6 pb-16">
        {/* Carrousel d'images avec overlay gradient */}
        <ThemedView className="relative overflow-hidden rounded-3xl mx-4 shadow-lg">
          <FlatList
            ref={flatListRef}
            horizontal
            data={imageList}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item: imageItem }) => (
              <View className="relative">
                <Image
                  source={imageItem}
                  style={{ width: width - 32, height: 300 }}
                  className="rounded-3xl"
                  resizeMode="cover"
                />
                {/* Gradient overlay subtil */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)']}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 120,
                  }}
                />
              </View>
            )}
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />

          {/* Bouton Réserver avec effet glassmorphism */}
          <Animated.View 
            style={{ 
              position: 'absolute', 
              top: 20, 
              left: 20, 
              transform: [{ scale: scaleAnim }] ,
            }}
          >
            <TouchableOpacity
              disabled={item.availibility !== "available"}
              onPress={() => {
                animateReservationButton();
                if (item.availibility === "available") {
                  router.navigate({ pathname: "/booking/bookingscreen" });
                }
              }}
              className="overflow-hidden rounded-full"
              style= {{backgroundColor:theme.success}}
            >
              <BlurView intensity={10} tint="light" style={{ paddingHorizontal: 20, paddingVertical: 12, backgroundColor:item.availibility === "available" ?theme.success: theme.error}}>
                <ThemedView style= {{backgroundColor:item.availibility === "available" ?theme.success: theme.error}} className="flex-row items-center space-x-2">
                  <MaterialIcons 
                    name={item.availibility === "available" ? "event-available" : "event-busy"} 
                    size={18} 
                    color={theme.surface} 
                  />
                  <ThemedText 
                    className="font-semibold text-sm"
                    style={{ color:theme.surface }}
                  >
                    {item.availibility === "available" ? "Disponible" : "Indisponible"}
                  </ThemedText>
                </ThemedView>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>

          {/* Indicateurs de pagination améliorés */}
          <ThemedView className="absolute bottom-8 w-full flex-row justify-center space-x-2">
            {imageList.map((_, index) => (
              <Animated.View
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index ? "w-8 bg-white" : "w-2 bg-white/50"
                }`}
                style={{
                  shadowColor: '#000',
                  // shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5,}}
              />
            ))}
          </ThemedView>
        </ThemedView>

        {/* Prix et localisation avec design cards */}
        <ThemedView className="flex-row px-4 gap-4 space-x-3 py-2 ">
          <ThemedView variant="surfaceVariant" className="flex-1 flex-row items-center p-2 rounded-2xl shadow-sm">
            <MaterialIcons name="location-on" size={20} color={theme.primary} />
            <ThemedView  variant="surfaceVariant" className="ml-3 flex-1">
              <ThemedText type="caption" className="opacity-70">Location</ThemedText>
              <ThemedText intensity="strong" type="body" className="mt-1">
                {item.location || "Localisation"}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedView variant="surfaceVariant" className="flex-1 flex-row items-center p-2 rounded-2xl shadow-sm">
            <MaterialIcons name="attach-money" size={20} color={theme.success} />
            <View className="ml-3 flex-1">
              <ThemedText type="caption" className="opacity-70">Prix</ThemedText>
              <ThemedText intensity="strong" type="body" variant="primary" className="mt-1">
                {item.price || "Prix non spécifié"}
              </ThemedText>
            </View>
          </ThemedView>
        </ThemedView>

        {/* Description avec animation */}
        <ThemedView className="px-4 space-y-3 pt-2">
          <ThemedView className="flex-row  gap-2 items-center space-x-2 pb-2">
            <MaterialIcons name="description" size={20} color={theme.primary} />
            <ThemedText type = "body" className = "p-2">Description</ThemedText>
          </ThemedView>
          
          <ThemedView variant="surfaceVariant" className="p-4 rounded-2xl">
            <ThemedText className="leading-6">
              {isExpanded ? descriptionComplete : descriptionCourte}
            </ThemedText>
            <TouchableOpacity 
              onPress={() => setIsExpanded(!isExpanded)}
              className="mt-3"
            >
              <ThemedText variant="primary" className="font-medium">
                {isExpanded ? "Voir moins" : "Voir plus"}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {/* Infos générales avec icônes colorées */}
        <ThemedView className="px-4 space-y-4 pt-2">
          <ThemedView className="flex-row items-center gap-2 space-x-2 pb-2">
            <MaterialIcons name="info" size={20} color={theme.primary} />
            <ThemedText type = "body" className = "p-2">Informations générales</ThemedText>
          </ThemedView>
          
          <ThemedView  className="p-4 rounded-2xl">
            <ThemedView className="flex-row justify-between">
              <ThemedView className="items-center space-y-2 flex-1">
                <ThemedView className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: theme.primary + '20' }}>
                  <Ionicons name="bed-outline" size={24} color={theme.primary} />
                </ThemedView>
                <ThemedText type="caption" className="text-center opacity-70">Chambres</ThemedText>
                <ThemedText intensity="strong" className="text-center">
                  {item.generalInfo.bedrooms || 1}
                </ThemedText>
              </ThemedView>
              
              <ThemedView className="items-center space-y-2 flex-1">
                <ThemedView className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: theme.success + '20' }}>
                  <MaterialCommunityIcons name="shower" size={24} color={theme.surface} />
                </ThemedView>
                <ThemedText type="caption" className="text-center opacity-70">Douches</ThemedText>
                <ThemedText intensity="strong" className="text-center">
                  {item.generalInfo.bathrooms || 1}
                </ThemedText>
              </ThemedView>
              
              <ThemedView className="items-center space-y-2 flex-1">
                <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: theme.warning + '20' }}>
                  <FontAwesome6 name="restroom" size={20} color={theme.warning} />
                </View>
                <ThemedText type="caption" className="text-center opacity-70">WC</ThemedText>
                <ThemedText intensity="strong" className="text-center">
                  {item.generalInfo.restrooms || 1}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Bouton calendrier avec gradient et animation */}
        <ThemedView className="px-4 space-y-3 pt-2">
          <ThemedView className="flex-row items-center  gap-2 space-x-2 pb-2">
            <MaterialIcons name="event" size={20} color={theme.primary} />
            <ThemedText type = "body" className = "p-2" >Disponibilité</ThemedText>
          </ThemedView>
          
          <TouchableOpacity
            onPress={openCalendarModal}
            className="overflow-hidden rounded-2xl shadow-lg p-2"
            activeOpacity={0.8}
            style = {{backgroundColor:theme.success}}
          >
            <ThemedView >
              <ThemedView style = {{backgroundColor:theme.success}} className="flex-row items-center justify-center space-x-3 gap-4">
                <MaterialIcons name="calendar-today" size={24} color={theme.surface} />
                <ThemedText style = {{color:theme.surface}}>
                  Voir le calendrier
                </ThemedText>
                <MaterialIcons name="arrow-forward" size={20} color={theme.surface} />
              </ThemedView>
            </ThemedView>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Modal Bottom Sheet Ultra Moderne */}
      <Modal
        visible={modalVisible}
        transparent={false}
        animationType="none"
        onRequestClose={closeCalendarModal}
        statusBarTranslucent={true}
      >
        {/* Overlay Background avec animation */}
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            opacity: fadeAnim,
          }}
        >
          {/* Zone cliquable pour fermer */}
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={closeCalendarModal}
          />
          
          {/* Bottom Sheet Container */}
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: screenHeight * 0.75,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Contenu du Modal avec gradient subtil */}
            <ThemedView
              style={{
                flex: 1,
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30,
                paddingTop: 8,
                paddingHorizontal: 24,
                paddingBottom: Platform.OS === 'ios' ? 34 : 20,
                shadowColor: '#000',
                // shadowOffset: { width: 0, height: -10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 20,
              }}
            >
              {/* Handle Bar avec animation */}
              <ThemedView
                style={{
                  width: 50,
                  height: 5,
                  backgroundColor: theme.outline,
                  borderRadius: 3,
                  alignSelf: 'center',
                  marginBottom: 24,
                  opacity: 0.5,
                }}
              />

              {/* Header avec gradient */}
              <LinearGradient
                colors={[theme.primary + '10', 'transparent']}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 24,
                  padding: 16,
                  borderRadius: 16,
                }}
              >
                <ThemedView variant = "surfaceVariant" className="flex-row items-center space-x-1 gap-4">
                  <ThemedView 
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <MaterialIcons name="event" size={20} color="white" />
                  </ThemedView>
                  <ThemedText >
                    Calendrier de disponibilité
                  </ThemedText>
                </ThemedView>
                
                <TouchableOpacity
                  onPress={closeCalendarModal}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: theme.surfaceVariant }}
                >
                  <Ionicons name="close" size={20} color={theme.onSurface} />
                </TouchableOpacity>
              </LinearGradient>

              {/* Calendrier avec style amélioré */}
              <ThemedView className="flex-1 rounded-2xl overflow-hidden" variant="surfaceVariant">
                <Calendar
                  markedDates={markedDates}
                  markingType="period"
                  minDate={item.propertyAvailability.startDate}
                  maxDate={item.propertyAvailability.endDate}
                  theme={{
                    backgroundColor: 'transparent',
                    calendarBackground: 'transparent',
                    textSectionTitleColor: theme.onSurface,
                    selectedDayBackgroundColor: theme.primary,
                    selectedDayTextColor: theme.onSurface,
                    todayTextColor: theme.primary,
                    dayTextColor: theme.onSurface,
                    textDisabledColor: theme.outline,
                    dotColor: theme.primary,
                    selectedDotColor: theme.onSurface,
                    arrowColor: theme.primary,
                    disabledArrowColor: theme.outline,
                    monthTextColor: theme.onSurface,
                    indicatorColor: theme.primary,
                    textDayFontFamily: 'System',
                    textMonthFontFamily: 'System',
                    textDayHeaderFontFamily: 'System',
                    textDayFontWeight: '500',
                    textMonthFontWeight: '700',
                    textDayHeaderFontWeight: '600',
                    textDayFontSize: 14,
                    textMonthFontSize: 14,
                    textDayHeaderFontSize: 14,
                  }}
                  style={{
                    borderRadius: 16,
                    padding: 16,
                  }}
                />
              </ThemedView>

              {/* Légende avec design moderne */}
              <ThemedView
                variant="surfaceVariant"
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 20,
                  padding: 16,
                  borderRadius: 16,
                }}
              >
                <ThemedView variant = "surfaceVariant" className="flex-row items-center space-x-3">
                  <ThemedView
                    style={{
                      width: 16,
                      height: 16,
                      backgroundColor:theme.success,
                      borderRadius: 8,
                    }}
                  />
                  <ThemedText intensity="strong">
                    Période disponible
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
};

export default ItemData;