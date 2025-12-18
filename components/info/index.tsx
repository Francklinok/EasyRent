import { View, Text, FlatList, Image, Dimensions, TouchableOpacity, Modal, StatusBar, Platform } from "react-native";
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
import { getBookingService } from "@/services/api/bookingService";
import { ro } from "date-fns/locale";

const { width, height } = Dimensions.get("window");

// Obtenir la hauteur de la status bar
const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
const screenHeight = height + statusBarHeight;

interface ItemDataProps {
  itemData?: any;
}

type BookingScreenRoute = 
  | "VisitScreen"
  | "ReservationScreen"
  | "PaymentScreen";

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

const ItemData = async ({ itemData }: ItemDataProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();
  const  bookingService = getBookingService()
  const  existentservice = await bookingService.getPropertyActivityService(itemData.id)

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
  };

  const closeCalendarModal = () => {
    setModalVisible(false);
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

const link = (rel:BookingScreenRoute) => {
  router.push({
    pathname: `/booking/${rel}`,
    params: { property: JSON.stringify(item) }
  });
};
const handleNavigate = () => {
  // Aucune activité → première visite
  if (!existentservice || existentservice.length === 0) {
    link("VisitScreen");
    return;
  }

  const lastActivity = existentservice[existentservice.length - 1];
  if (!lastActivity) {
    link("VisitScreen");
    return;
  }

  const { reservationStatus, visiteStatus } = lastActivity;

  // 🔴 PRIORITÉ 1 : réservation EXISTE → jamais revenir à la visite
  if (reservationStatus) {
    if (reservationStatus === "ACCEPTED") {
      link("PaymentScreen");
      return;
    }

    if (
      reservationStatus === "PENDING" ||
      reservationStatus === "DRAFT" ||
      reservationStatus === "REFUSED"
    ) {
      link("ReservationScreen");
      return;
    }
  }

  // 🟠 PRIORITÉ 2 : visite existe mais pas de réservation
  if (visiteStatus) {
    if (visiteStatus === "ACCEPTED") {
      link("ReservationScreen");
      return;
    }

    if (visiteStatus === "PENDING" || visiteStatus === "DRAFT") {
      link("VisitScreen");
      return;
    }
  }

  // 🟢 Cas par défaut
  link("VisitScreen");
};

const getColor = () => {
  const availability = item.availability;
  if (availability === "AVAILABLE") return theme.success;
  if (["RENTED", "SOLD", "DELETED"].includes(availability)) return theme.warning;
  if (["PENDING", "RESERVED"].includes(availability)) return theme.info;

  return theme.background; 
};



  return (
    <>
      <ThemedView className="flex flex-col space-y-5 pb-16">
        {/* Carrousel d'images avec overlay gradient */}
        <ThemedView className="relative overflow-hidden rounded-3xl mx-1 shadow-lg">
          <FlatList
            ref={flatListRef}
            horizontal
            data={imageList}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item: imageItem }) => (
              <View className="relative">
                <Image
                  source={imageItem}
                  style={{ width: width - 8, height: 300 }}
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
          <View
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
            }}
          >
            <TouchableOpacity
              disabled={item.availibility === "SOLD" || item.availibility === "RENTED" || item.availibility === "DELETED"}
              onPress={handleNavigate}
              className="overflow-hidden rounded-full"
              style= {{backgroundColor:theme.success}}
            >
              <BlurView intensity={10} tint="light" style={{ 
                paddingHorizontal: 20, 
                paddingVertical: 12, 
                backgroundColor: getColor()
              }}>
                <ThemedView style={{
                  backgroundColor:getColor()
                }} className="flex-row items-center space-x-2">
                  <MaterialIcons
                    name={(item.availibility === "SOLD" || item.availibility === "RENTED" || item.availibility === "DELETED") ? "event-busy" : "event-available"}
                    size={18}
                    color={theme.surface}
                  />
                  <ThemedText
                    className="font-semibold text-sm"
                    style={{ color: theme.surface }}
                  >
                    {item.availibility.lowercase()}
                  </ThemedText>
                </ThemedView>
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Indicateurs de pagination améliorés */}
          <ThemedView className="absolute bottom-8 w-full flex-row justify-center space-x-2">
            {imageList.map((_, index) => (
              <View
                key={index}
                style={{
                  height: 8,
                  width: currentIndex === index ? 32 : 8,
                  borderRadius: 4,
                  backgroundColor: currentIndex === index ? 'white' : 'rgba(255, 255, 255, 0.5)',
                  shadowColor: '#000',
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5,
                }}
              />
            ))}
          </ThemedView>
        </ThemedView>

        {/* Prix et localisation compacts */}
        <ThemedView className="flex-row px-4 gap-3 mt-2">
          <ThemedView variant="surfaceVariant" className="flex-1 flex-row items-center p-3 rounded-xl">
            <MaterialIcons name="location-on" size={18} color={theme.primary} />
            <ThemedView variant="surfaceVariant" className="ml-2 flex-1">
              <ThemedText type="caption" style={{ fontSize: 10, opacity: 0.7 }}>Location</ThemedText>
              <ThemedText intensity="strong" style={{ fontSize: 13 }} numberOfLines={1}>
                {item.location || "Localisation"}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedView variant="surfaceVariant" className="flex-1 flex-row items-center p-3 rounded-xl">
            <MaterialIcons name="attach-money" size={18} color={theme.success} />
            <View className="ml-2 flex-1">
              <ThemedText type="caption" style={{ fontSize: 10, opacity: 0.7 }}>Prix</ThemedText>
              <ThemedText intensity="strong" variant="primary" style={{ fontSize: 13 }} numberOfLines={1}>
                {item.price || "Prix non spécifié"}
              </ThemedText>
            </View>
          </ThemedView>
        </ThemedView>

        {/* Description compacte */}
        <ThemedView className="px-4 mt-1">
          <ThemedView className="flex-row items-center gap-2 mb-2">
            <MaterialIcons name="description" size={18} color={theme.primary} />
            <ThemedText style={{ fontSize: 14, fontWeight: '600' }}>Description</ThemedText>
          </ThemedView>
          
          <ThemedView variant="surfaceVariant" className="p-3 rounded-xl">
            <ThemedText type = "normal" style={{ lineHeight: 18 }}>
              {isExpanded ? descriptionComplete : descriptionCourte}
            </ThemedText>
            {descriptionComplete.length > 100 && (
              <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} className="mt-2">
                <ThemedText variant="primary" style={{ fontSize: 12, fontWeight: '600' }}>
                  {isExpanded ? "Voir moins" : "Voir plus"}
                </ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
        </ThemedView>

        {/* Infos générales compactes */}
        <ThemedView className="px-4 mt-1">
          <ThemedView className="flex-row items-center gap-2 mb-2">
            <MaterialIcons name="info" size={18} color={theme.primary} />
            <ThemedText style={{ fontSize: 14, fontWeight: '600' }}>Informations</ThemedText>
          </ThemedView>
          
          <ThemedView variant="surfaceVariant" className="p-3 rounded-xl">
            <ThemedView className="flex-row justify-around">
              <ThemedView className="items-center flex-1">
                <ThemedView className="w-10 h-10 rounded-full items-center justify-center mb-1" style={{ backgroundColor: theme.primary + '15' }}>
                  <Ionicons name="bed-outline" size={20} color={theme.primary} />
                </ThemedView>
                <ThemedText type="caption" style={{ fontSize: 10, opacity: 0.7 }}>Chambres</ThemedText>
                <ThemedText intensity="strong" style={{ fontSize: 14 }}>
                  {item.generalInfo.bedrooms || 1}
                </ThemedText>
              </ThemedView>
              
              <ThemedView className="items-center flex-1">
                <ThemedView className="w-10 h-10 rounded-full items-center justify-center mb-1" style={{ backgroundColor: theme.info + '15' }}>
                  <MaterialCommunityIcons name="shower" size={20} color={theme.info} />
                </ThemedView>
                <ThemedText type="caption" style={{ fontSize: 10, opacity: 0.7 }}>Douches</ThemedText>
                <ThemedText intensity="strong" style={{ fontSize: 14 }}>
                  {item.generalInfo.bathrooms || 1}
                </ThemedText>
              </ThemedView>
              
              <ThemedView className="items-center flex-1">
                <View className="w-10 h-10 rounded-full items-center justify-center mb-1" style={{ backgroundColor: theme.warning + '15' }}>
                  <FontAwesome6 name="restroom" size={18} color={theme.warning} />
                </View>
                <ThemedText type="caption" style={{ fontSize: 10, opacity: 0.7 }}>WC</ThemedText>
                <ThemedText intensity="strong" style={{ fontSize: 14 }}>
                  {item.generalInfo.restrooms || 1}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Bouton calendrier compact */}
        <ThemedView className="px-4 mt-1">
          <ThemedView className="flex-row items-center gap-2 mb-2">
            <MaterialIcons name="event" size={18} color={theme.primary} />
            <ThemedText style={{ fontSize: 14, fontWeight: '600' }}>Disponibilité</ThemedText>
          </ThemedView>
          
          <TouchableOpacity
            onPress={openCalendarModal}
            className="overflow-hidden rounded-xl"
            activeOpacity={0.8}
            style={{ backgroundColor: theme.success }}
          >
            <ThemedView style={{ backgroundColor: theme.success, paddingVertical: 12, paddingHorizontal: 16 }}>
              <ThemedView style={{ backgroundColor: theme.success }} className="flex-row items-center justify-center gap-3">
                <MaterialIcons name="calendar-today" size={20} color={theme.surface} />
                <ThemedText style={{ color: theme.surface, fontSize: 14, fontWeight: '600' }}>
                  Voir le calendrier
                </ThemedText>
                <MaterialIcons name="arrow-forward" size={18} color={theme.surface} />
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
        {/* Overlay Background */}
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          }}
        >
          {/* Zone cliquable pour fermer */}
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={closeCalendarModal}
          />

          {/* Bottom Sheet Container */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: screenHeight * 0.75,
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
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ItemData;