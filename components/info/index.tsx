import { FlatList, Image, Dimensions, TouchableOpacity, ScrollView, StatusBar, Platform, StyleSheet } from "react-native";
import { useState, useRef, useEffect } from "react";
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { router } from 'expo-router';
import { useTheme } from "../contexts/theme/themehook";
import { getBookingService } from "@/services/api/bookingService";
import { eachDayOfInterval, format } from "date-fns";
import { ThemedView } from "../ui/ThemedView";
import {ThemedText} from "../ui/ThemedText";
// Import components
import Criteria from "./criteriaFile";
import Services from "./servicesFiles";

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
}

type BookingScreenRoute =
  | "/booking/VisitScreen"
  | "/booking/Bookingscreen"
  | "/booking/HotelBookingScreen"
  | "/payment/PaymentScreen";

const HOTEL_TYPES = ['Hôtel', 'Hotel', 'Auberge', 'Motel', 'Resort', 'Chambre d\'hôte', 'Guesthouse'];

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

const ItemData = ({ itemData }: ItemDataProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const [activeTab, setActiveTab] = useState<'Description' | 'Criteria' | 'Services'>('Description');
  const [existentservice, setExistentservice] = useState<any[]>([]);
  const [loadingService, setLoadingService] = useState(true);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const { theme } = useTheme();

  useEffect(() => {
    const loadPropertyActivityService = async () => {
      if (!itemData?.id) {
        setLoadingService(false);
        return;
      }

      try {
        const bookingService = getBookingService();
        const result = await bookingService.getPropertyActivityService(itemData.id);
        setExistentservice(result || []);
      } catch (error) {
        console.error('Error loading activity service:', error);
        setExistentservice([]);
      } finally {
        setLoadingService(false);
      }
    };

    loadPropertyActivityService();
  }, [itemData?.id]);

  const item = itemData;

  if (!item) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText type="body" style={styles.emptyText}>Aucune donnée disponible</ThemedText>
      </ThemedView>
    );
  }

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  let imageList: any[] = [];
  if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    imageList = item.images.map((img: string) => ({ uri: img }));
  } else {
    imageList = [{ uri: 'https://via.placeholder.com/400x300?text=No+Image' }];
  }

  const link = (rel: BookingScreenRoute, additionalParams?: any) => {
    router.push({
      pathname: rel,
      params: { property: item.id, ...additionalParams }
    });
  };

  const isHotel = HOTEL_TYPES.some(hotelType =>
    (item?.type || '').toLowerCase().includes(hotelType.toLowerCase())
  );

  const handleNavigate = () => {
    if (isHotel) {
      link("/booking/HotelBookingScreen");
      return;
    }

    if (!existentservice || existentservice.length === 0) {
      link("/booking/VisitScreen");
      return;
    }

    const lastActivity = existentservice[existentservice.length - 1];
    if (!lastActivity) {
      link("/booking/VisitScreen");
      return;
    }

    const { reservationStatus, visiteStatus } = lastActivity;

    if (reservationStatus) {
      if (reservationStatus === "ACCEPTED") {
        link("/payment/PaymentScreen", { reservationId: lastActivity.id, propertyId: item.id })
        return;
      }

      if (
        reservationStatus === "PENDING" ||
        reservationStatus === "DRAFT" ||
        reservationStatus === "REFUSED"
      ) {
        link("/booking/Bookingscreen");
        return;
      }
    }

    if (visiteStatus) {
      if (visiteStatus === "ACCEPTED") {
        link("/booking/Bookingscreen");
        return;
      }

      if (visiteStatus === "PENDING" || visiteStatus === "DRAFT") {
        link("/booking/VisitScreen");
        return;
      }
    }

    link("/booking/VisitScreen");
  };

  const isDisabled = item.availibility === "SOLD" || item.availibility === "RENTED" || item.availibility === "DELETED";

  const photosCount = imageList.length;
  const reviewsCount = item.reviewsCount || item.services?.length || 0;
  const rating = item.rating || 4.8;

  // Generate available dates (displayed in green)
  const markedDates = item?.propertyAvailability?.startDate && item?.propertyAvailability?.endDate
    ? getMarkedDates(
      item.propertyAvailability.startDate,
      item.propertyAvailability.endDate
    )
    : {};

  // Equipment list
  const equipments = item?.equipments?.map((eq: any, index: number) => {
    const IconLib = eq.lib === "MaterialCommunityIcons" ? MaterialCommunityIcons : FontAwesome5;
    return {
      id: eq.id ?? index.toString(),
      icon: eq.icon,
      text: eq.name,
      lib: IconLib
    };
  }) || [];

  // Property features/assets
  const getAtoutsData = () => {
    if (item.atouts && Array.isArray(item.atouts)) {
      return item.atouts;
    }
    if (item.features && Array.isArray(item.features)) {
      return item.features;
    }
    return [];
  };
  const atoutsData = getAtoutsData();

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
                  source={imageItem}
                  style={styles.carouselImage}
                  resizeMode="cover"
                  onError={() => handleImageError(index)}
                />
              )}
            </ThemedView>
          )}
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />

        {/* Top navigation bar */}
        <ThemedView variant = "surfaceVariant" style={styles.topNav}>
          <TouchableOpacity style={styles.navButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="white" />
          </TouchableOpacity>
        </ThemedView>

        {/* Image pagination dots */}
        <ThemedView variant = "surfaceVariant" style={styles.paginationContainer}>
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
        <ThemedText type="title" style={styles.propertyTitle}>{item.title || item.name || ""}</ThemedText>

        {/* Property location */}
        <ThemedView style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <ThemedText type="caption" style={styles.locationText}>{item.location || item.address || "Non spécifié"}</ThemedText>
        </ThemedView>

        {/* Rating and reviews */}
        <ThemedView style={styles.ratingRow}>
          <FontAwesome name="star-o" size={14} color="#6B7280" />
          <ThemedText type="caption" style={styles.ratingText}>{rating} Rating</ThemedText>
          <ThemedText type="caption" style={styles.reviewsLink}>({reviewsCount} Reviews)</ThemedText>
        </ThemedView>

        {/* Navigation tabs */}
        <ThemedView style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Description' && styles.tabActive]}
            onPress={() => setActiveTab('Description')}
          >
            <ThemedText type="normal" style={[styles.tabText, activeTab === 'Description' && styles.tabTextActive]}>Description</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Criteria' && styles.tabActive]}
            onPress={() => setActiveTab('Criteria')}
          >
            <ThemedText type="normal" style={[styles.tabText, activeTab === 'Criteria' && styles.tabTextActive]}>Criteria</ThemedText>

          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Services' && styles.tabActive]}
            onPress={() => setActiveTab('Services')}
          >
            <ThemedText type="normal" style={[styles.tabText, activeTab === 'Services' && styles.tabTextActive]}>Sevices</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Tab content - scrollable area */}
        <ThemedView style={styles.tabContentContainer}>
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
            nestedScrollEnabled={true}
          >
          {activeTab === 'Description' && (
            <>
              {/* Owner information section */}
              <ThemedView style={styles.ownerSection}>
                <Image
                  source={{ uri: item.owner?.avatar || item.ownerAvatar || 'https://via.placeholder.com/50' }}
                  style={styles.ownerAvatar}
                />
                <ThemedText type="subtitle" style={styles.ownerName}>{item.owner?.name || item.ownerName || "PT. Pencari Cinta Sejati"}</ThemedText>
              </ThemedView>

              {/* Property description */}
              <ThemedView style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>Description</ThemedText>
                <ThemedText type="body" style={styles.descriptionText}>
                              {item.description || ""}
                </ThemedText>
              </ThemedView>

              {/* Property facilities */}
              <ThemedView style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>Facilities</ThemedText>
                <ThemedView style={styles.facilitiesGrid}>
                  <ThemedView style={styles.facilityItem}>
                    <Ionicons name="bed-outline" size={20} color="#6B7280" />
                    <ThemedText type="normal" style={styles.facilityText}>{item.generalInfo?.bedrooms || 3} Beds</ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.facilityItem}>
                    <MaterialCommunityIcons name="shower" size={20} color="#6B7280" />
                    <ThemedText type="normal" style={styles.facilityText}>{item.generalInfo?.bathrooms || 2} Baths</ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.facilityItem}>
                    <MaterialCommunityIcons name="ruler-square" size={20} color="#6B7280" />
                    <ThemedText type="normal" style={styles.facilityText}>{item.details?.surface || '120'} m²</ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.facilityItem}>
                    <Ionicons name="car-outline" size={20} color="#6B7280" />
                    <ThemedText type="normal" style={styles.facilityText}>Parking</ThemedText>
                  </ThemedView>
                </ThemedView>
              </ThemedView>

              {/* Equipment section */}
              {equipments.length > 0 && (
                <ThemedView style={styles.section}>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>Équipements</ThemedText>
                  <ThemedView style={styles.equipmentsGrid}>
                    {equipments.map((eq: any) => (
                      <ThemedView key={eq.id} style={styles.equipmentItem}>
                        <eq.lib name={eq.icon} size={18} color="#6B7280"  />
                        <ThemedText type="normal" style={styles.equipmentText}>{eq.text}</ThemedText>
                      </ThemedView>
                    ))}
                  </ThemedView>
                </ThemedView>
              )}

              {/* Property features/highlights */}
              {atoutsData.length > 0 && (
                <ThemedView style={styles.section}>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>Atouts</ThemedText>
                  <ThemedView style={styles.atoutsGrid}>
                    {atoutsData.map((atout: any, index: number) => (
                      <ThemedView key={atout.id || index} style={styles.atoutItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#6B7280" />
                        <ThemedText type="normal" style={styles.atoutText}>{atout.text || atout.name}</ThemedText>
                      </ThemedView>
                    ))}
                  </ThemedView>
                </ThemedView>
              )}

              {/* Availability calendar */}
              <ThemedView style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>Disponibilités</ThemedText>
                <ThemedView style={styles.calendarWrapper}>
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
              <Criteria itemData={item} />
            </ThemedView>
          )}

          {activeTab === 'Services' && (
            <ThemedView style={styles.servicesContainer}>
              <Services itemData={item} />
            </ThemedView>
          )}
          </ScrollView>
        </ThemedView>

        {/* Bottom bar with price and booking button */}
        <ThemedView variant="surface" style={styles.bottomBar}>
          <ThemedView>
            <ThemedText type="caption" style={styles.priceLabel}>Total Price</ThemedText>
            <ThemedText type="title" style={styles.priceValue}>${item.price || 150}<ThemedText type="normal" style={styles.priceUnit}></ThemedText></ThemedText>
          </ThemedView>
          <TouchableOpacity
            style={[styles.bookButton, isDisabled && styles.bookButtonDisabled]}
            onPress={handleNavigate}
            disabled={isDisabled}
          >
            <ThemedText type="normal" color="white" style={styles.bookButtonText}>{isDisabled ? 'Non disponible' : 'Book Now'}</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
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
    backgroundColor: '#FFFFFF',
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
    fontWeight: '700',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    color: '#6B7280',
    fontSize: 14,
    marginLeft: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    color: '#6B7280',
    fontSize: 14,
    marginLeft: 6,
  },
  reviewsLink: {
    color: '#F59E0B',
    fontSize: 14,
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
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  tabActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  tabText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 6,
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
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  descriptionText: {
    color: '#6B7280',
    fontSize: 14,
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
    backgroundColor: '#F9FAFB',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  facilityText: {
    color: '#6B7280',
    fontSize: 12,
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
    backgroundColor: '#F9FAFB',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  equipmentText: {
    color: '#374151',
    fontSize: 12,
    marginLeft: 8,
  },
  atoutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  atoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  atoutText: {
    fontSize: 12,
    marginLeft: 4,
  },
  calendarWrapper: {
    backgroundColor: '#F9FAFB',
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
    backgroundColor: '#FFFFFF',
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
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 4,
  },
  priceValue: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
  priceUnit: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '400',
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
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ItemData;
