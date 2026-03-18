import { FlatList, Image, Dimensions, TouchableOpacity, ScrollView, StatusBar, Platform, StyleSheet } from "react-native";
import { useState, useEffect, useMemo, useRef } from "react";
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { router } from 'expo-router';
import { useTheme } from "../../hooks/themehook";
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures";
import { useLanguage } from "@/components/contexts/language";
import { premiumService } from "@/services/api/premiumService";
import { useOwnerPrivacy, filterOwnerByPrivacy } from "@/hooks/useOwnerPrivacy";
import { eachDayOfInterval, format } from "date-fns";
import { ThemedView } from "../ui/ThemedView";
import {ThemedText} from "../ui/ThemedText";
// Import components
import Criteria from "./criteriaFile";
import Services from "./servicesFiles";
import { getDetailFacilities, getPropertyDisplayConfig, FacilityItem, filterEquipmentsByType, filterAtoutsByType, isLandProperty } from "@/components/utils/propertyDisplayConfig";
// Import advanced booking flow config
import {
  PropertyType,
  ActionType,
  normalizePropertyType,
  normalizeActionType,
  getBookingFlowMessage,
  canSkipVisit,
  isInstantBookingAllowed,
  getPropertyConfig
} from "@/constants/propertyTypeConfigs";
import { usePropertyActivity } from "@/hooks/usePropertyActivity";
import { useAuthUser } from "@/components/contexts/authContext/AuthContext";

const { width, height } = Dimensions.get("window");

// Configure calendar locale for French language
LocaleConfig.locales['fr'] = {
  monthNames: [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ],
  monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
  today: "Aujourd'hui"
};
LocaleConfig.defaultLocale = 'fr';

interface ItemDataProps {
  itemData?: any;
  onClick?:() => void;

}

type BookingScreenRoute =
  | "/booking/VisitScreen"
  | "/booking/Bookingscreen"
  | "/booking/HotelBookingScreen"
  | "/payment/PaymentScreen";

type AllBookingRoutes = BookingScreenRoute | "/bookingReview/bookingReview" | "/wallet/Wallet";

// Hotel types are now imported from propertyTypeConfigs

// Composant pour afficher l'accès aux services (eau, électricité, route) pour les terrains
const AccessChipDisplay = ({ icon, label, available }: { icon: React.ReactNode; label: string; available?: boolean }) => (
  <ThemedView
    variant={available ? "surfaceVariant" : "surface"}
    style={[
      styles.accessChip,
      !available && styles.accessChipUnavailable
    ]}
  >
    {icon}
    <ThemedText
      type="caption"
      intensity={available ? "strong" : "light"}
      style={!available ? styles.accessTextUnavailable : undefined}
    >
      {label}
    </ThemedText>
    {available !== undefined && (
      <Ionicons
        name={available ? "checkmark-circle" : "close-circle"}
        size={14}
        color={available ? "#10B981" : "#9CA3AF"}
      />
    )}
  </ThemedView>
);

// Composant pour afficher les facilités dynamiquement selon le type de propriété
const DynamicFacilities = ({ item }: { item: any }) => {
  const facilities = getDetailFacilities(item.type, item.generalInfo);

  const renderIcon = (facility: FacilityItem) => {
    const iconColor = "#6B7280";
    if (facility.lib === 'Ionicons') {
      return <Ionicons name={facility.icon as any} size={20} color={iconColor} />;
    }
    if (facility.lib === 'FontAwesome5') {
      return <FontAwesome5 name={facility.icon as any} size={20} color={iconColor} />;
    }
    return <MaterialCommunityIcons name={facility.icon as any} size={20} color={iconColor} />;
  };

  const formatValue = (facility: FacilityItem) => {
    const value = facility.getValue(item.generalInfo);
    if (typeof value === 'boolean') {
      return facility.label;
    }
    if (facility.key === 'surface') {
      return `${value || item.details?.surface || '0'} m²`;
    }
    return `${value} ${facility.label}`;
  };

  // Si aucune facilité configurée, afficher un message ou la surface par défaut
  if (facilities.length === 0) {
    const surface = item.generalInfo?.surface || item.details?.surface;
    if (surface) {
      return (
        <ThemedView variant="surfaceVariant" style={styles.facilityItem}>
          <MaterialCommunityIcons name="ruler-square" size={20} color="#6B7280" />
          <ThemedText type="caption" style={styles.facilityText}>{surface} m²</ThemedText>
        </ThemedView>
      );
    }
    return null;
  }

  return (
    <>
      {facilities.map((facility) => (
        <ThemedView key={facility.key} variant="surfaceVariant" style={styles.facilityItem}>
          {renderIcon(facility)}
          <ThemedText type="caption" style={styles.facilityText}>{formatValue(facility)}</ThemedText>
        </ThemedView>
      ))}
    </>
  );
};

const getMarkedDates = (start: string, end: string) => {
  if (!start || !end) return {};

  try {
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
  } catch (error) {
    console.error("Error generating marked dates:", error);
    return {};
  }
};

const ItemData = ({ itemData, onClick }: ItemDataProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const [activeTab, setActiveTab] = useState<'Description' | 'Criteria' | 'Services'>('Description');
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const [selectedUnitIndex, setSelectedUnitIndex] = useState<number | null>(null);
  const [selectedHotelRoom, setSelectedHotelRoom] = useState<{ roomTypeId: string; roomId: string; roomName: string; pricePerNight: number; roomTypeName: string } | null>(null);
  const { theme } = useTheme();
  const { isPremium, hasPriorityContact, hasOwnerInfo, isClientRole, hasVerifiedOwnerBadge, isOwnerRole } = usePremiumFeatures();
  const { t } = useLanguage();
  const user = useAuthUser();

  // Compute property type + action type early (needed by the activity hook below)
  const propertyType: PropertyType = useMemo(
    () => normalizePropertyType(itemData?.type || itemData?.propertyType || 'apartment'),
    [itemData?.type, itemData?.propertyType]
  );
  const actionType: ActionType = useMemo(
    () => normalizeActionType(itemData?.actionType || itemData?.listType || 'rent'),
    [itemData?.actionType, itemData?.listType]
  );

  // Central hook: fetches this user's activity for the property and derives navigation
  const {
    isLoading: activityLoading,
    navigation: bookingNavigation,
    refresh: refreshActivity,
  } = usePropertyActivity({
    propertyId: itemData?.id,
    userId: user?.id,
    propertyType,
    actionType,
  });

  // Get owner privacy settings to determine what info to show
  const ownerPrivacy = useOwnerPrivacy({
    ownerId: itemData?.owner?.id || itemData?.ownerId,
    enabled: !!itemData
  });

  // Filter owner data based on privacy settings
  const filteredOwner = useMemo(() => {
    if (!itemData?.owner) return null;
    return filterOwnerByPrivacy(itemData.owner, ownerPrivacy);
  }, [itemData?.owner, ownerPrivacy]);

  // Track property view (silent)
  useEffect(() => {
    if (itemData?.id) {
      premiumService.trackView(itemData.id, 'direct').catch(() => {});
    }
  }, [itemData?.id]);

  const item = itemData;

  if (!item) {
    return (
      <ThemedView variant="surface" style={styles.emptyContainer}>
        <ThemedText type="body">Aucune donnée disponible</ThemedText>
      </ThemedView>
    );
  }

  // --- Rental strategy & unit management ---
  const rentalStrategy: string = item.rentalStrategy || 'global';
  const isHotelProperty = (item.type || '').toLowerCase() === 'hotel' || (item.type || '').toLowerCase() === 'hôtel';
  const hasPropertyRooms = item.propertyRooms && Array.isArray(item.propertyRooms) && item.propertyRooms.length > 0;
  const hasUnits = !isHotelProperty && hasPropertyRooms;
  const isPerUnit = rentalStrategy === 'per_unit';
  const isBothMode = rentalStrategy === 'both';
  const isPerUnitOrBoth = isPerUnit || isBothMode;
  const actionTypeRaw = item.actionType || item.listType || 'rent';
  const isSale = actionTypeRaw === 'sell' || actionTypeRaw === 'sale';
  // Show room section for any property with rooms (all modes)
  const showRoomSection = hasUnits;
  // Rooms are clickable only for per_unit and both rental modes (not global, not sell)
  const roomsAreClickable = isPerUnitOrBoth && !isSale;

  // Get the selected unit data
  const selectedUnit = useMemo(() => {
    if (selectedUnitIndex === null || !item.propertyRooms) return null;
    return item.propertyRooms[selectedUnitIndex] || null;
  }, [selectedUnitIndex, item.propertyRooms]);

  // Build unit images when a unit is selected
  const selectedUnitImages = useMemo(() => {
    if (!selectedUnit) return [];
    const imgs: Array<{ uri: string }> = [];
    if (selectedUnit.images && selectedUnit.images.length > 0) {
      for (const img of selectedUnit.images) {
        const uri = img.variants?.medium || img.variants?.large || img.originalUrl;
        if (uri) imgs.push({ uri });
      }
    }
    return imgs;
  }, [selectedUnit]);

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  // Build imageList from all sources: general images, propertyRooms, hotelRoomTypes rooms
  let imageList: Array<{ uri: string; roomName?: string }> = [];

  // 1. General property images
  if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    imageList = item.images.map((img: string) => ({ uri: img }));
  }

  // 2. PropertyRooms images (non-hotel properties with multiple rooms) - only if no unit selected
  if (!selectedUnit && item.propertyRooms && Array.isArray(item.propertyRooms) && item.propertyRooms.length > 0) {
    for (const room of item.propertyRooms) {
      if (room.images && room.images.length > 0) {
        for (const img of room.images) {
          const uri = img.variants?.medium || img.variants?.large || img.originalUrl;
          if (uri) {
            imageList.push({ uri, roomName: room.roomName });
          }
        }
      }
    }
  }

  // 3. HotelRoomTypes rooms images
  if (item.hotelRoomTypes && Array.isArray(item.hotelRoomTypes) && item.hotelRoomTypes.length > 0) {
    for (const roomType of item.hotelRoomTypes) {
      if (roomType.rooms && roomType.rooms.length > 0) {
        for (const room of roomType.rooms) {
          if (room.images && room.images.length > 0) {
            for (const img of room.images) {
              const uri = img.variants?.medium || img.variants?.large || img.originalUrl;
              if (uri) {
                imageList.push({ uri, roomName: room.roomName });
              }
            }
          }
        }
      }
    }
  }

  // 4. If a unit is selected, prepend its images to the carousel
  if (selectedUnit && selectedUnitImages.length > 0) {
    imageList = [...selectedUnitImages, ...imageList];
  }

  // Fallback if no images found
  if (imageList.length === 0) {
    imageList = [{ uri: 'https://via.placeholder.com/400x300?text=No+Image' }];
  }

  const link = (rel: AllBookingRoutes, additionalParams?: any) => {
    // Pass complete item data to avoid network requests in booking screens
    const propertyData = {
      ...item,
      // Include normalized types for instant use
      _normalizedPropertyType: propertyType,
      _normalizedActionType: actionType,
      // Include selected unit info for booking (non-hotel)
      _selectedUnit: selectedUnit ? {
        roomId: selectedUnit.roomId,
        roomName: selectedUnit.roomName,
        price: selectedUnit.price,
        currency: selectedUnit.currency,
        capacity: selectedUnit.capacity,
      } : null,
      // Include selected hotel room info for booking
      _selectedHotelRoom: selectedHotelRoom || null,
      // Flag to indicate data is pre-loaded
      _dataPreloaded: true
    };
    router.push({
      pathname: rel as any,
      params: { property: JSON.stringify(propertyData), ...additionalParams }
    });
  };

  // Get property config for display purposes (propertyType + actionType computed at top)
  const propertyConfig = useMemo(() => {
    return getPropertyConfig(propertyType, actionType);
  }, [propertyType, actionType]);

  // Check if direct booking is allowed (skip visit)
  const allowsDirectBooking = useMemo(() => {
    return canSkipVisit(propertyType, actionType);
  }, [propertyType, actionType]);

  // Check if instant booking is available
  const hasInstantBooking = useMemo(() => {
    return isInstantBookingAllowed(propertyType, actionType);
  }, [propertyType, actionType]);

  // Get booking flow message
  const bookingMessage = useMemo(() => {
    return getBookingFlowMessage(propertyType, actionType);
  }, [propertyType, actionType]);

  const handleNavigate = () => {
    // Guard: do not navigate while activity is loading
    if (activityLoading || !bookingNavigation) return;

    const { route, params } = bookingNavigation;

    if (route === '/contrat/ContratScreen') {
      router.push({
        pathname: '/contrat/ContratScreen',
        params: {
          activityId: params?.activityId || '',
          paymentStatus: params?.paymentStatus || 'completed',
        },
      } as any);
    } else if (route === '/bookingReview/bookingReview') {
      link(route, {
        reservationId: params?.reservationId || '',
        propertyId: item.id,
      });
    } else if (route === '/wallet/Wallet') {
      router.push('/wallet/Wallet');
    } else {
      link(route as BookingScreenRoute);
    }
  };

  // Allow the paying client to access their contract even if property is unavailable
  const hasContract = bookingNavigation?.route === '/contrat/ContratScreen';
  const isDisabled = !hasContract && item.availibility === "not available";

  const photosCount = imageList.length;
  const reviewsCount = item.reviewsCount || item.services?.length || 0;
  const rating = item.rating || 0.0;

  // Generate available dates (displayed in green)
  const markedDates = item?.propertyAvailability?.startDate && item?.propertyAvailability?.endDate
    ? getMarkedDates(
      item.propertyAvailability.startDate,
      item.propertyAvailability.endDate
    )
    : {};

  // Determine if the property is a land property based on its type
  const isLand = isLandProperty(item.type);

  // Property equipments
  const rawEquipments = item?.equipments?.map((eq: any, index: number) => {
    const IconLib = eq.lib === "MaterialCommunityIcons" ? MaterialCommunityIcons : FontAwesome5;
    return {
      id: eq.id ?? index.toString(),
      icon: eq.icon,
      text: eq.name,
      name: eq.name,
      lib: IconLib
    };
  }) || [];

  // Filtrer les équipements selon le type de propriété
  const equipments = filterEquipmentsByType(rawEquipments, item.type);

  // Property features/assets - filtré par type de propriété
  const getAtoutsData = () => {
    let atouts: any[] = [];
    if (item.atouts && Array.isArray(item.atouts)) {
      atouts = item.atouts;
    } else if (item.features && Array.isArray(item.features)) {
      atouts = item.features;
    }
    // Filtrer les atouts selon le type de propriété
    return filterAtoutsByType(atouts, item.type);
  };
  const atoutsData = getAtoutsData();


  const getStatusBadge = (status:string) =>{
    switch(status){
      case 'verified':
        return {color: '#10B981', text: 'Verified', icon:'check-circle'};
      case "pending":
      return {color: '#FBBF24', text: 'Pending', icon:'clock-outline'};
      case "unverified":
        return {color: '#EF4444', text: 'Unverified', icon:'close-circle'};
      case"rejected": 
        return {color: '#EF4444', text: 'Rejected', icon:'close-octagon'};
      default:
        return {color: '#EF4444', text: 'Unverified', icon:'help-circle'}

  }}
  const badge = getStatusBadge(item.status);

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ThemedView style={styles.imageContainer}>
        <FlatList
          ref={flatListRef}
          horizontal
          data={imageList}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item: imageItem, index }) => (
            <ThemedView>
              {imageErrors[index] ? (
                <ThemedView style={styles.errorImage}>
                  <MaterialCommunityIcons name="image-off" size={60} color="#999" />
                </ThemedView>
              ) : (
                <Image
                  source={{ uri: imageItem.uri }}
                  style={styles.carouselImage}
                  resizeMode="cover"
                  onError={() => handleImageError(index)}
                />
              )}
              {imageItem.roomName && (
                <ThemedView style={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 6,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <MaterialCommunityIcons name="door-open" size={14} color="white" />
                  <ThemedText style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>
                    {imageItem.roomName}
                  </ThemedText>
                  <ThemedText style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
                    {index + 1}/{imageList.length}
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          )}
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />

        {/* Top navigation bar */}
        <ThemedView backgroundColor = "transparent" style={styles.topNav}>
          <TouchableOpacity style={styles.navButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="white" />
          </TouchableOpacity>
        </ThemedView>

        {/* Image pagination dots */}
        <ThemedView backgroundColor = "transparent" style={styles.paginationContainer}>
          {imageList.map((_, index) => (
            <ThemedView 
              key={index}
              style={[
                styles.paginationDot,
                currentIndex === index && styles.paginationDotActive
              ]}
            />
          ))}
        </ThemedView>
      </ThemedView>

      {/* White card overlay container */}
      <ThemedView style={styles.whiteCard}>
        {/* Property title */}
          <ThemedView style= {{ flexDirection: 'row', alignItems: 'center', gap:8, paddingBottom:8}}>
          <ThemedText type="subtitle" intensity ="light"
              style={{
            lineHeight: 18,
            letterSpacing: -0.2,
            fontWeight:800
          }} numberOfLines={1}
            > {item.type} -</ThemedText>

            <ThemedText type="subtitle" intensity ="light" style={{
            lineHeight: 18,
            letterSpacing: -0.2,
            fontWeight:800
          }} numberOfLines={1}>
            {item.title || 'Property'}
          </ThemedText>

            </ThemedView>


        <ThemedView className = "flex  flex-row justify-between mb-1">
          {/* Property location */}
          <ThemedView style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color="#6B7280" />
            <ThemedText type="caption" style={styles.locationText}>{item.location || item.address || "Non spécifié"}</ThemedText>
          </ThemedView>

          {/* Rating and reviews */}
          <ThemedView style={styles.ratingRow}>
            <FontAwesome name="star-o" size={14} color="#6B7280" />
            <ThemedText type="caption"  style={styles.ratingText}>{rating} Rating</ThemedText>
            <ThemedText type="caption" variant="accent" style={styles.reviewsLink}>({reviewsCount} Reviews)</ThemedText>
          </ThemedView>
      </ThemedView>
       <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
            nestedScrollEnabled={true}
          >
        {/* Room section - visible for all modes with rooms, clickable only for per_unit/both */}
        {showRoomSection && item.propertyRooms && item.propertyRooms.length > 0 && (
          <ThemedView style={{ marginBottom: 12 }}>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialCommunityIcons name="door-open" size={18} color={theme.primary as string} />
                <ThemedText type="normaltitle" style={{ fontWeight: '700' }}>
                  {isPerUnit ? 'Sélectionner une chambre' : isBothMode ? 'Chambres disponibles' : 'Chambres'}
                </ThemedText>
              </ThemedView>
              {roomsAreClickable && selectedUnitIndex !== null && (
                <TouchableOpacity onPress={() => setSelectedUnitIndex(null)}>
                  <ThemedText type="caption" style={{ color: theme.primary as string, fontWeight: '600' }}>
                    {isBothMode ? 'Propriété entière' : 'Tout voir'}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </ThemedView>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={item.propertyRooms}
              keyExtractor={(room: any) => room.roomId}
              contentContainerStyle={{ gap: 10 }}
              renderItem={({ item: room, index }: any) => {
                const isSelected = selectedUnitIndex === index;
                const roomThumb = room.images?.[0]?.variants?.small || room.images?.[0]?.variants?.thumbnail || room.images?.[0]?.originalUrl;
                const isRoomAvailable = room.isAvailable !== false;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      if (!roomsAreClickable) return;
                      if (!isRoomAvailable) return;
                      setSelectedUnitIndex(isSelected ? null : index);
                    }}
                    disabled={!roomsAreClickable || !isRoomAvailable}
                    activeOpacity={roomsAreClickable ? 0.7 : 1}
                    style={{
                      width: 150,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: isSelected ? (theme.primary as string) : (theme.outline as string) + '30',
                      backgroundColor: isSelected ? (theme.primary as string) + '08' : 'transparent',
                      overflow: 'hidden',
                      opacity: !roomsAreClickable ? 1 : (isRoomAvailable ? 1 : 0.5),
                    }}
                  >
                    {/* Image container with overlays */}
                    <ThemedView style={{ position: 'relative', width: '100%', height: 100 }}>
                      {roomThumb ? (
                        <Image
                          source={{ uri: roomThumb }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      ) : (
                        <ThemedView style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: (theme.outline as string) + '15' }}>
                          <MaterialCommunityIcons name="door-open" size={32} color={theme.outline as string} />
                        </ThemedView>
                      )}
                      {/* Availability badge - only for per_unit/both */}
                      {roomsAreClickable && (
                        <ThemedView style={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          backgroundColor: isRoomAvailable ? '#10b98130' : '#ef444430',
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 6,
                        }}>
                          <ThemedText style={{
                            fontSize: 9,
                            fontWeight: '700',
                            color: isRoomAvailable ? '#10b981' : '#ef4444',
                          }}>
                            {isRoomAvailable ? 'Disponible' : 'Réservée'}
                          </ThemedText>
                        </ThemedView>
                      )}
                      {/* Price overlay on photo - only for per_unit/both */}
                      {roomsAreClickable && room.price > 0 && (
                        <ThemedView style={{
                          position: 'absolute',
                          bottom: 8,
                          left: 4,
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 8,
                        }}>
                          <ThemedText style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>
                            {room.price?.toLocaleString()} {room.currency || item.ownerCriteria?.currency || 'XAF'}
                          </ThemedText>
                        </ThemedView>
                      )}
                      {/* Selection indicator on photo */}
                      {isSelected && (
                        <ThemedView style={{
                          position: 'absolute',
                          top: 6,
                          left: 6,
                          backgroundColor: (theme.primary as string) + 'CC',
                          borderRadius: 12,
                          padding: 2,
                        }}>
                          <Ionicons name="checkmark-circle" size={18} color="#fff" />
                        </ThemedView>
                      )}
                    </ThemedView>
                    <ThemedView style={{ padding: 8, gap: 3, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <ThemedText type="caption" style={{ fontWeight: '700' }} numberOfLines={1}>
                        {room.roomName}
                      </ThemedText>
                      {room.capacity && (
                        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                          <Ionicons name="people-outline" size={11} color={theme.onSurfaceVariant as string} />
                          <ThemedText style={{ fontSize: 10, color: theme.onSurfaceVariant as string }}>
                            {room.capacity} pers.
                          </ThemedText>
                        </ThemedView>
                      )}
                    </ThemedView>
                  </TouchableOpacity>
                );
              }}
            />
          </ThemedView>
        )}

        {/* Hotel rooms section - classified by type, horizontally scrollable */}
        {isHotelProperty && item.hotelRoomTypes && item.hotelRoomTypes.length > 0 && (
          <ThemedView style={{ marginBottom: 12 }}>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialCommunityIcons name="bed-outline" size={18} color={theme.primary as string} />
                <ThemedText type="normaltitle" style={{ fontWeight: '700' }}>
                  Sélectionner une chambre
                </ThemedText>
              </ThemedView>
              {selectedHotelRoom && (
                <TouchableOpacity onPress={() => setSelectedHotelRoom(null)}>
                  <ThemedText type="caption" style={{ color: theme.primary as string, fontWeight: '600' }}>
                    Désélectionner
                  </ThemedText>
                </TouchableOpacity>
              )}
            </ThemedView>

            {item.hotelRoomTypes.map((roomType: any) => {
              const availableCount = roomType.rooms?.filter((r: any) => r.isAvailable !== false).length ?? roomType.available ?? 0;
              const totalCount = roomType.rooms?.length ?? roomType.available ?? 0;
              return (
              <ThemedView key={roomType.roomTypeId} style={{ marginBottom: 14 }}>
                {/* Compact type header: name | capacity | availability | price - single row */}
                <ThemedView style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  backgroundColor: (theme.outline as string) + '10',
                  borderRadius: 10,
                }}>
                  <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <MaterialCommunityIcons name="door" size={16} color={theme.primary as string} />
                    <ThemedView>
                      <ThemedText style={{ fontWeight: '700', fontSize: 13 }}>
                        {roomType.name}
                      </ThemedText>
                      <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 1 }}>
                        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                          <Ionicons name="people-outline" size={10} color={theme.onSurfaceVariant as string} />
                          <ThemedText style={{ fontSize: 10, color: theme.onSurfaceVariant as string }}>{roomType.capacity} pers.</ThemedText>
                        </ThemedView>
                        <ThemedView style={{
                          flexDirection: 'row', alignItems: 'center', gap: 3,
                          backgroundColor: availableCount === 0 ? '#ef444415' : availableCount < totalCount ? '#F59E0B15' : '#10b98115',
                          paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4,
                        }}>
                          <ThemedView style={{
                            width: 5, height: 5, borderRadius: 3,
                            backgroundColor: availableCount === 0 ? '#ef4444' : availableCount < totalCount ? '#F59E0B' : '#10b981',
                          }} />
                          <ThemedText style={{
                            fontSize: 9, fontWeight: '700',
                            color: availableCount === 0 ? '#ef4444' : availableCount < totalCount ? '#F59E0B' : '#10b981',
                          }}>
                            {availableCount}/{totalCount} dispo.
                          </ThemedText>
                        </ThemedView>
                      </ThemedView>
                    </ThemedView>
                  </ThemedView>
                  <ThemedView style={{ backgroundColor: (theme.primary as string) + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                    <ThemedText style={{ color: theme.primary as string, fontWeight: '800', fontSize: 12 }}>
                      {roomType.pricePerNight?.toLocaleString()} {item.ownerCriteria?.currency || 'XAF'}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>

                {/* Rooms horizontal scroll */}
                {roomType.rooms && roomType.rooms.length > 0 && (
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={roomType.rooms}
                    keyExtractor={(room: any) => room.roomId}
                    contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}
                    renderItem={({ item: room }: any) => {
                      const isHotelRoomSelected = selectedHotelRoom?.roomId === room.roomId;
                      const roomThumb = room.images?.[0]?.variants?.small || room.images?.[0]?.variants?.thumbnail || room.images?.[0]?.originalUrl;
                      const isRoomAvailable = room.isAvailable !== false;
                      return (
                        <TouchableOpacity
                          onPress={() => {
                            if (!isRoomAvailable) return;
                            if (isHotelRoomSelected) {
                              setSelectedHotelRoom(null);
                            } else {
                              setSelectedHotelRoom({
                                roomTypeId: roomType.roomTypeId,
                                roomId: room.roomId,
                                roomName: room.roomName,
                                pricePerNight: roomType.pricePerNight,
                                roomTypeName: roomType.name,
                              });
                            }
                          }}
                          disabled={!isRoomAvailable}
                          activeOpacity={0.7}
                          style={{
                            width: 130,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: isHotelRoomSelected ? (theme.primary as string) : (theme.outline as string) + '20',
                            backgroundColor: isHotelRoomSelected ? (theme.primary as string) + '08' : 'transparent',
                            overflow: 'hidden',
                            opacity: isRoomAvailable ? 1 : 0.45,
                          }}
                        > 
                          {/* Image with overlays */}
                          <ThemedView style={{ position: 'relative', width: '100%', height: 85 }}>
                            {roomThumb ? (
                              <Image
                                source={{ uri: roomThumb }}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="cover"
                              />
                            ) : (
                              <ThemedView style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: (theme.outline as string) + '15' }}>
                                <MaterialCommunityIcons name="bed-outline" size={28} color={theme.outline as string} />
                              </ThemedView>
                            )}
                            {/* Availability badge */}
                            <ThemedView style={{
                              position: 'absolute', top: 4, right: 4,
                              backgroundColor: isRoomAvailable ? '#10b98130' : '#ef444430',
                              paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5,
                            }}>
                              <ThemedText style={{ fontSize: 8, fontWeight: '700', color: isRoomAvailable ? '#10b981' : '#ef4444' }}>
                                {isRoomAvailable ? 'Dispo' : 'Réservée'}
                              </ThemedText>
                            </ThemedView>
                            {/* Selection indicator */}
                            {isHotelRoomSelected && (
                              <ThemedView style={{
                                position: 'absolute', top: 4, left: 4,
                                backgroundColor: (theme.primary as string) + 'CC',
                                borderRadius: 10, padding: 1,
                              }}>
                                <Ionicons name="checkmark-circle" size={16} color="#fff" />
                              </ThemedView>
                            )}
                          </ThemedView>
                          {/* Room name */}
                          <ThemedView style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
                            <ThemedText style={{ fontSize: 10, fontWeight: '600' }} numberOfLines={1}>
                              {room.roomName}
                            </ThemedText>
                          </ThemedView>
                        </TouchableOpacity>
                      );
                    }}
                  />
                )}
              </ThemedView>
              );
            })}
          </ThemedView>
        )}

        {/* Navigation tabs */}
        <ThemedView style={styles.tabsContainer}>
          <TouchableOpacity
            style={{...styles.tab,borderColor:theme.outline + "70", backgroundColor: activeTab === 'Description'? theme.primary: theme.surfaceVariant + "80"}}
            onPress={() => setActiveTab('Description')}
          >
            <ThemedText type="normal" intensity="light" color={activeTab === 'Description' ? '#FFFFFF' : undefined} style={{fontWeight:800}}>Description</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={{...styles.tab,borderColor:theme.outline + "70", backgroundColor: activeTab === 'Criteria'? theme.primary: theme.surfaceVariant + "80"}}
            onPress={() => setActiveTab('Criteria')}
          >
            <ThemedText type="normal" intensity="light" color={activeTab === 'Criteria' ? '#FFFFFF' : undefined} style={{fontWeight:800}}>Criteria</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={{...styles.tab,borderColor:theme.outline + "70", backgroundColor: activeTab === 'Services'? theme.primary: theme.surfaceVariant + "80"}}
            onPress={() => setActiveTab('Services')}
          >
            <ThemedText type="normal" intensity="light" color={activeTab === 'Services' ? '#FFFFFF' : undefined} style={{fontWeight:800}}>Services</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Tab content - scrollable area */}
        <ThemedView style={styles.tabContentContainer}>
         
          {activeTab === 'Description' && (
            <>
              {/* Owner information section - respects owner privacy settings */}
              <ThemedView className="flex flex-row justify-between">
                <TouchableOpacity onPress={onClick}>
                  <ThemedView style={styles.ownerSection}>
                    <Image
                      source={{ uri: filteredOwner?.avatar || item.owner?.avatar || item.ownerAvatar || 'https://via.placeholder.com/50' }}
                      style={styles.ownerAvatar}
                    />
                    {/* Show name based on privacy settings */}
                    <ThemedText type="normaltitle" intensity ="light"  style={{
                        lineHeight: 18,
                        letterSpacing: -0.2,
                        fontWeight:800
                      }} numberOfLines={1}>
                      {ownerPrivacy.canShowName
                        ? (filteredOwner?.name || item.owner?.name || item.ownerName)
                        : (filteredOwner?.name || item.owner?.name || item.ownerName || 'Propriétaire')
                      }
                    </ThemedText>
                    {isPremium && isOwnerRole && hasVerifiedOwnerBadge && (
                      <ThemedView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#6C5CE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 }}>
                        <Ionicons name="shield-checkmark" size={10} color="white" />
                        <ThemedText style={{ color: 'white', fontSize: 9, fontWeight: '600', marginLeft: 2 }}>{t('premium.verifiedOwner')}</ThemedText>
                      </ThemedView>
                    )}
                  </ThemedView>
                </TouchableOpacity>

                {/* Owner contact details - respects both premium status AND owner privacy settings */}
                {isPremium && isClientRole && hasOwnerInfo && (
                  <ThemedView style={{ paddingHorizontal: 16, paddingVertical: 8, marginTop: 4, backgroundColor: '#FFD70010', borderRadius: 8, borderWidth: 1, borderColor: '#FFD70030' }}>
                    {/* Show phone only if owner allows it */}
                    {ownerPrivacy.canShowPhone && filteredOwner?.phone && (
                      <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Ionicons name="call" size={14} color="#FFD700" />
                        <ThemedText type="caption" style={{ marginLeft: 6 }}>{filteredOwner.phone}</ThemedText>
                      </ThemedView>
                    )}
                    {/* Show email only if owner allows it */}
                    {ownerPrivacy.canShowEmail && filteredOwner?.email && (
                      <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Ionicons name="mail" size={14} color="#FFD700" />
                        <ThemedText type="caption" style={{ marginLeft: 6 }}>{filteredOwner.email}</ThemedText>
                      </ThemedView>
                    )}
                    {/* Show address only if owner allows it */}
                    {ownerPrivacy.canShowAddress && filteredOwner?.address && (
                      <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="location" size={14} color="#FFD700" />
                        <ThemedText type="caption" style={{ marginLeft: 6 }}>{filteredOwner.address}</ThemedText>
                      </ThemedView>
                    )}
                    {/* Show message if owner has hidden all contact info */}
                    {!ownerPrivacy.canShowPhone && !ownerPrivacy.canShowEmail && !ownerPrivacy.canShowAddress && (
                      <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="lock-closed" size={14} color="#FFD700" />
                        <ThemedText type="caption" style={{ marginLeft: 6, fontStyle: 'italic' }}>Contact masqué par le propriétaire</ThemedText>
                      </ThemedView>
                    )}
                    <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <Ionicons name="star" size={10} color="#FFD700" />
                      <ThemedText type="caption" style={{ marginLeft: 4, color: '#FFD700', fontSize: 10, fontWeight: '600' }}>{t('premium.premiumBadge')}</ThemedText>
                    </ThemedView>
                  </ThemedView>
                )}

                <ThemedView style={{ paddingHorizontal: 6, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: badge.color + '20', borderWidth: 1, borderColor: badge.color + "10", height: 35 }}>
                  <MaterialCommunityIcons
                    name={badge.icon as any}
                    size={16}
                    color={badge.color}
                  />
                  <ThemedText type="caption" intensity = 'strong' style={{ color: badge.color }}> {badge.text} </ThemedText>
                </ThemedView>
              </ThemedView>

              {/* Property description */}
              <ThemedView style={styles.section}>
                <ThemedText type="normaltitle"  style={styles.sectionTitle}>Description</ThemedText>
                <ThemedText type="body" >
                  {item.description || ""}
                </ThemedText>
                {/* Room-specific description when a unit is selected */}
                {selectedUnit?.description && (
                  <ThemedView style={{ marginTop: 12, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: (theme.primary as string) + '20', backgroundColor: (theme.primary as string) + '05' }}>
                    <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <MaterialCommunityIcons name="door-open" size={16} color={theme.primary as string} />
                      <ThemedText type="caption" intensity="strong" style={{ color: theme.primary as string }}>
                        {selectedUnit.roomName}
                      </ThemedText>
                    </ThemedView>
                    <ThemedText type="body" style={{ lineHeight: 20 }}>
                      {selectedUnit.description}
                    </ThemedText>
                  </ThemedView>
                )}
              </ThemedView>

              {/* Property facilities - Dynamic based on property type */}
              <ThemedView style={styles.section}>
                <ThemedText type="normaltitle" style={styles.sectionTitle}>
                  {getPropertyDisplayConfig(item.type).category === 'land' ? 'Caractéristiques du terrain' : 'Facilities'}
                </ThemedText>
                <ThemedView style={styles.facilitiesGrid}>
                  <DynamicFacilities item={item} />
                </ThemedView>
              </ThemedView>

              {isLand && (
                <ThemedView style={styles.section}>
                  <ThemedText type="normaltitle" style={styles.sectionTitle}>Accès et viabilisation</ThemedText>
                  <ThemedView style={styles.accessGrid}>
                    <AccessChipDisplay
                      icon={<MaterialCommunityIcons name="water" size={18} color={item.generalInfo?.waterAccess ? "#3B82F6" : "#9CA3AF"} />}
                      label="Eau"
                      available={item.generalInfo?.waterAccess}
                    />
                    <AccessChipDisplay
                      icon={<MaterialCommunityIcons name="flash" size={18} color={item.generalInfo?.electricityAccess ? "#F59E0B" : "#9CA3AF"} />}
                      label="Électricité"
                      available={item.generalInfo?.electricityAccess}
                    />
                    <AccessChipDisplay
                      icon={<MaterialCommunityIcons name="road-variant" size={18} color={item.generalInfo?.roadAccess ? "#10B981" : "#9CA3AF"} />}
                      label="Route"
                      available={item.generalInfo?.roadAccess}
                    />
                  </ThemedView>
                </ThemedView>
              )}

              {equipments.length > 0 && !isLand && (
                <ThemedView style={styles.section}>
                  <ThemedText type="normaltitle"  style={styles.sectionTitle}>Équipements</ThemedText>
                  <ThemedView style={styles.equipmentsGrid}>
                    {equipments.map((eq: any) => {
                      const IconComponent = eq.lib;
                      return (
                        <ThemedView variant="surfaceVariant" key={eq.id} style={styles.equipmentItem}>
                          <IconComponent name={eq.icon as any} size={18} color="#6B7280" />
                          <ThemedText type="caption" style={styles.equipmentText}>{eq.text}</ThemedText>
                        </ThemedView>
                      );
                    })}
                  </ThemedView>
                </ThemedView>
              )}

              {/* Room-specific amenities when a unit is selected */}
              {selectedUnit?.amenities && selectedUnit.amenities.length > 0 && (
                <ThemedView style={styles.section}>
                  <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <MaterialCommunityIcons name="door-open" size={18} color={theme.primary as string} />
                    <ThemedText type="normaltitle" style={styles.sectionTitle}>
                      Commodités — {selectedUnit.roomName}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {selectedUnit.amenities.map((amenity: string, idx: number) => (
                      <ThemedView key={idx} variant="surfaceVariant" style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, gap: 6, borderWidth: 1, borderColor: (theme.primary as string) + '20' }}>
                        <Ionicons name="checkmark-circle" size={14} color={theme.primary as string} />
                        <ThemedText type="caption">{amenity}</ThemedText>
                      </ThemedView>
                    ))}
                  </ThemedView>
                </ThemedView>
              )}

              {/* Room-specific capacity & price summary */}
              {selectedUnit && (
                <ThemedView style={[styles.section, { backgroundColor: (theme.primary as string) + '05', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: (theme.primary as string) + '20' }]}>
                  <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <MaterialCommunityIcons name="door-open" size={20} color={theme.primary as string} />
                    <ThemedText type="normaltitle" intensity="strong">{selectedUnit.roomName}</ThemedText>
                  </ThemedView>
                  <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    {selectedUnit.capacity && (
                      <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="people-outline" size={16} color={theme.onSurfaceVariant as string} />
                        <ThemedText type="caption" intensity="strong">{selectedUnit.capacity} pers. max</ThemedText>
                      </ThemedView>
                    )}
                    {isPerUnitOrBoth && selectedUnit.price > 0 && (
                      <ThemedView style={{ backgroundColor: (theme.primary as string) + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
                        <ThemedText type="normal" style={{ color: theme.primary as string, fontWeight: '700' }}>
                          {selectedUnit.price?.toLocaleString()} {selectedUnit.currency || item.ownerCriteria?.currency || 'XAF'}/mois
                        </ThemedText>
                      </ThemedView>
                    )}
                  </ThemedView>
                </ThemedView>
              )}

              {/* Property features/highlights */}
              {atoutsData.length > 0 && (
                <ThemedView style={styles.section}>
                  <ThemedText type="normaltitle"  style={styles.sectionTitle}>Atouts</ThemedText>
                  <ThemedView style={styles.atoutsGrid}>
                    {atoutsData.map((atout: any, index: number) => (
                      <ThemedView variant="surfaceVariant" key={atout.id || index} style={styles.atoutItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#6B7280" />
                        <ThemedText type="caption">{atout.text || atout.name}</ThemedText>
                      </ThemedView>
                    ))}
                  </ThemedView>
                </ThemedView>
              )}

              {/* Availability calendar */}
              <ThemedView style={styles.section}>
                <ThemedText type="normaltitle" style={styles.sectionTitle}>Disponibilités</ThemedText>
                <ThemedView variant="surfaceVariant" style={styles.calendarWrapper}>
                  <Calendar
                    markedDates={markedDates}
                    markingType="period"
                    minDate={item.propertyAvailability?.startDate || new Date().toISOString()}
                    maxDate={item.propertyAvailability?.endDate}
                    enableSwipeMonths={true}
                    theme={{
                      backgroundColor: 'transparent',
                      calendarBackground: 'transparent',
                      textSectionTitleColor: '#9CA3AF',
                      selectedDayBackgroundColor: theme.primary as string,
                      selectedDayTextColor: '#ffffff',
                      todayTextColor: theme.primary as string,
                      dayTextColor: '#1F2937',
                      textDisabledColor: '#D1D5DB',
                      dotColor: theme.primary as string,
                      selectedDotColor: '#ffffff',
                      arrowColor: theme.primary as string,
                      monthTextColor: '#111827',
                      textDayFontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
                      textMonthFontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
                      textDayHeaderFontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
                      textDayFontWeight: '400',
                      textMonthFontWeight: '700',
                      textDayHeaderFontWeight: '600',
                      textDayFontSize: 15,
                      textMonthFontSize: 16,
                      textDayHeaderFontSize: 13,
                    }}
                  />
                </ThemedView>
              </ThemedView>

            </>
          )}

          {activeTab === 'Criteria' && (
            <ThemedView style={styles.criteriaContainer}>
              <Criteria itemData={selectedUnit ? {
                ...item,
                ownerCriteria: {
                  ...item.ownerCriteria,
                  monthlyRent: selectedUnit.price || item.ownerCriteria?.monthlyRent,
                },
                _selectedUnit: selectedUnit,
              } : item} />
            </ThemedView>
          )}

          {activeTab === 'Services' && (
            <ThemedView style={styles.servicesContainer}>
              <Services itemData={selectedUnit ? {
                ...item,
                _selectedUnit: selectedUnit,
              } : item} />
            </ThemedView>
          )}
        </ThemedView>
       </ScrollView>
        {/* Bottom bar with price and booking button */}
        <ThemedView  style={styles.bottomBar}>
          <ThemedView>
            <ThemedText type="caption" >
              {selectedHotelRoom
                ? selectedHotelRoom.roomName
                : selectedUnit && isPerUnitOrBoth
                  ? selectedUnit.roomName
                  : 'Total Price'}
            </ThemedText>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <ThemedText type="title" intensity="strong">
                {selectedHotelRoom
                  ? selectedHotelRoom.pricePerNight?.toLocaleString()
                  : selectedUnit && isPerUnitOrBoth && selectedUnit.price > 0
                    ? selectedUnit.price?.toLocaleString()
                    : (item.price || 150)}
              </ThemedText>
              <ThemedText type="caption" style={{ marginLeft: 4 }}>
                {(selectedUnit?.currency || item.ownerCriteria?.currency || item.currency || 'XAF')}
                {selectedHotelRoom ? '/nuit' : ''}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={styles.bookingActions}>
            {/* Show premium priority contact badge */}
            {isPremium && hasPriorityContact && (
              <ThemedView style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: '#FFD700', paddingHorizontal: 6,
                paddingVertical: 2, borderRadius: 4, marginBottom: 4,
              }}>
                <Ionicons name="star" size={10} color="white" />
                <ThemedText style={{ color: 'white', fontSize: 9, fontWeight: '600', marginLeft: 3 }}>
                  {t('premium.priorityContact')}
                </ThemedText>
              </ThemedView>
            )}
            {/* Require unit selection for per_unit properties (not both — both allows global booking) */}
            {isPerUnit && hasUnits && selectedUnitIndex === null && !isDisabled && (
              <ThemedText type="caption" style={{ color: '#F59E0B', fontSize: 10, fontWeight: '600', marginBottom: 2 }}>
                Sélectionnez une chambre
              </ThemedText>
            )}
            {/* Require hotel room selection */}
            {isHotelProperty && item.hotelRoomTypes && item.hotelRoomTypes.length > 0 && !selectedHotelRoom && !isDisabled && (
              <ThemedText type="caption" style={{ color: '#F59E0B', fontSize: 10, fontWeight: '600', marginBottom: 2 }}>
                Sélectionnez une chambre
              </ThemedText>
            )}
            {/* Show instant booking badge if available */}
            {hasInstantBooking && !isDisabled && (
              <ThemedView style={styles.instantBadge}>
                <Ionicons name="flash" size={12} color="#F59E0B" />
                <ThemedText type="caption" style={styles.instantBadgeText}>Instant</ThemedText>
              </ThemedView>
            )}
            <TouchableOpacity
              style={[
                styles.bookButton,
                (isDisabled
                  || activityLoading
                  || (isPerUnit && hasUnits && selectedUnitIndex === null)
                  || (isHotelProperty && item.hotelRoomTypes?.length > 0 && !selectedHotelRoom)
                ) && styles.bookButtonDisabled
              ]}
              onPress={handleNavigate}
              disabled={
                isDisabled
                || activityLoading
                || (isPerUnit && hasUnits && selectedUnitIndex === null)
                || (isHotelProperty && item.hotelRoomTypes?.length > 0 && !selectedHotelRoom)
              }
            >
              <ThemedText type="normal" intensity="strong" color="white">
                {activityLoading
                  ? '...'
                  : isDisabled
                    ? 'Non disponible'
                    : (isPerUnit && hasUnits && selectedUnitIndex === null)
                      || (isHotelProperty && item.hotelRoomTypes?.length > 0 && !selectedHotelRoom)
                      ? 'Choisir une chambre'
                      : isBothMode && hasUnits && selectedUnitIndex === null
                        ? 'Réserver (propriété entière)'
                        : bookingNavigation?.route === '/contrat/ContratScreen'
                          ? 'Télécharger le contrat'
                          : bookingNavigation?.route === '/bookingReview/bookingReview'
                            ? 'Procéder au paiement'
                            : bookingNavigation?.route === '/wallet/Wallet'
                              ? 'Voir le paiement'
                              : bookingNavigation?.route === '/booking/Bookingscreen' || bookingNavigation?.route === '/booking/HotelBookingScreen'
                                ? (allowsDirectBooking ? propertyConfig.bookingText.submitButton : 'Planifier une réservation')
                                : 'Planifier une visite'
                }
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
  },
  imageContainer: {
    height: height * 0.40,
    position: 'relative',
  },
  carouselImage: {
    width: width,
    height: height * 0.35,
  },
  errorImage: {
    width: width,
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  topNav: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  navButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: 'white',
    width: 24,
  },
  whiteCard: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -50,
    paddingTop: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  propertyTitle: {
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    marginLeft: 6,
  },
  reviewsLink: {
    marginLeft: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
  },
 

  tabBadgeActive: {
    backgroundColor: '#374151',
  },
  tabBadgeText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  tabBadgeTextActive: {
    color: '#FFFFFF',
  },
  tabContentContainer: {
    flex: 1,
    marginBottom:2
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 120,
  },
  ownerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ownerName: {
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  descriptionText: {
    lineHeight: 22,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  facilityText: {
    marginLeft: 8,
  },
  equipmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    
  },
  equipmentText: {
    marginLeft: 8,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  amenityText: {
    marginLeft: 2,
  },
  atoutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  atoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  atoutText: {
    marginLeft: 4,
  },
  calendarWrapper: {
    borderRadius: 20,
    padding: 6,
  },
  criteriaContainer: {
    flex: 1,
    marginHorizontal: -20,
  },
  servicesContainer: {
    flex: 1,
    marginHorizontal: -20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 50,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  priceLabel: {
    marginBottom: 4,
  },
  priceValue: {
  },
  priceUnit: {
  },
  bookingActions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  instantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  instantBadgeText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  bookButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  bookButtonText: {
  },
  // Styles pour les terrains - accès et viabilisation
  accessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  accessChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  accessChipUnavailable: {
    opacity: 0.6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  accessTextUnavailable: {
    textDecorationLine: 'line-through',
  },
});

export default ItemData;
