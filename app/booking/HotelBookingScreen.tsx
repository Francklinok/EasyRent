import React, { useState, useMemo } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/hooks/themehook";
import { getBookingService } from "@/services/api/bookingService";
import { useAuth } from "@/components/contexts/authContext/AuthContext";
import { useProperty } from "@/hooks/useProperties";
import { format, differenceInDays, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const { width } = Dimensions.get("window");

// --- TYPES ---
interface GuestCount {
  adults: number;
  children: number;
  infants: number;
}

interface RoomImage {
  publicId: string;
  originalUrl: string;
  variants: {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
    original: string;
  };
}

interface IndividualRoom {
  roomId: string;
  roomName: string;
  images: RoomImage[];
  isAvailable: boolean;
}

interface RoomType {
  id: string;
  name: string;
  category: string;
  price: number;
  capacity: number;
  amenities: string[];
  available: number;
  description?: string;
  rooms: IndividualRoom[];
}

// --- ROOM CATEGORY CONFIG ---
const ROOM_CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
  classic: { label: "Standard", icon: "bed", color: "#6366F1" },
  family: { label: "Famille", icon: "account-group", color: "#10B981" },
  premium: { label: "Premium", icon: "star-circle", color: "#F59E0B" },
  accessible: { label: "Accessible", icon: "wheelchair-accessibility", color: "#3B82F6" },
  other: { label: "Chambre", icon: "door", color: "#6B7280" },
};

export default function HotelBookingScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // Parse property data from JSON params (same pattern as VisitScreen)
  const parsedProperty = useMemo<any>(() => {
    try {
      if (!params.property) return null;
      if (typeof params.property === "object") return params.property as any;
      const trimmed = (params.property as string).trim();
      if (!trimmed.startsWith("{")) return null;
      const parsed = JSON.parse(trimmed);
      return { ...parsed, id: parsed.id || parsed._id };
    } catch {
      return null;
    }
  }, [params.property]);

  // Fallback: fetch fresh data if parsed property has no hotelRoomTypes
  const propertyId = parsedProperty?.id || parsedProperty?._id || "";
  const needsFetch = !!propertyId && !parsedProperty?.hotelRoomTypes?.length;
  const { property: fetchedProperty, loading: fetchLoading } = useProperty(needsFetch ? propertyId : "");

  // Merge: use fetched hotelRoomTypes if parsed data doesn't have them
  const property = useMemo(() => {
    if (!parsedProperty) return null;
    if (parsedProperty.hotelRoomTypes?.length) return parsedProperty;
    if (fetchedProperty?.hotelRoomTypes?.length) {
      return { ...parsedProperty, hotelRoomTypes: fetchedProperty.hotelRoomTypes };
    }
    return parsedProperty;
  }, [parsedProperty, fetchedProperty]);

  // States
  const [checkInDate, setCheckInDate] = useState<string>("");
  const [checkOutDate, setCheckOutDate] = useState<string>("");
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);
  const [guests, setGuests] = useState<GuestCount>({
    adults: 1,
    children: 0,
    infants: 0,
  });
  const [selectedRoomType, setSelectedRoomType] = useState<string>("");
  const [roomCount, setRoomCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Currency from property
  const currency = property?.ownerCriteria?.currency || property?.currency || "XAF";

  // Hotel first image
  const hotelImage = useMemo(() => {
    if (!property?.images?.length) return null;
    const img = property.images[0];
    return typeof img === "string" ? img : img?.url;
  }, [property]);

  // Room types from property data (including individual rooms)
  const roomTypes: RoomType[] = useMemo(() => {
    if (!property?.hotelRoomTypes?.length) return [];
    return property.hotelRoomTypes.map((rt: any) => ({
      id: rt.roomTypeId,
      name: rt.name,
      category: rt.category || "classic",
      price: rt.pricePerNight,
      capacity: rt.capacity,
      amenities: rt.amenities || [],
      available: rt.available,
      description: rt.description,
      rooms: rt.rooms || [],
    }));
  }, [property]);

  const [selectedRoomId, setSelectedRoomId] = useState<string>("");

  // Calculate nights and total
  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    return differenceInDays(new Date(checkOutDate), new Date(checkInDate));
  }, [checkInDate, checkOutDate]);

  const selectedRoom = roomTypes.find((r) => r.id === selectedRoomType);

  const totalPrice = useMemo(() => {
    if (!selectedRoom || nights === 0) return 0;
    return selectedRoom.price * nights * roomCount;
  }, [selectedRoom, nights, roomCount]);

  // Calendar marked dates
  const markedDates = useMemo(() => {
    const marks: any = {};
    const primaryColor = theme.primary as string;

    if (checkInDate) {
      marks[checkInDate] = {
        startingDay: true,
        color: primaryColor,
        textColor: "white",
      };
    }

    if (checkOutDate) {
      marks[checkOutDate] = {
        endingDay: true,
        color: primaryColor,
        textColor: "white",
      };
    }

    if (checkInDate && checkOutDate) {
      let currentDate = addDays(new Date(checkInDate), 1);
      const endDate = new Date(checkOutDate);

      while (currentDate < endDate) {
        const dateStr = format(currentDate, "yyyy-MM-dd");
        marks[dateStr] = {
          color: primaryColor + "30",
          textColor: primaryColor,
        };
        currentDate = addDays(currentDate, 1);
      }
    }

    return marks;
  }, [checkInDate, checkOutDate, theme.primary]);

  // Handlers
  const handleDayPress = (day: DateData) => {
    if (!selectingCheckOut || !checkInDate) {
      setCheckInDate(day.dateString);
      setCheckOutDate("");
      setSelectingCheckOut(true);
    } else {
      if (new Date(day.dateString) > new Date(checkInDate)) {
        setCheckOutDate(day.dateString);
        setSelectingCheckOut(false);
      } else {
        setCheckInDate(day.dateString);
        setCheckOutDate("");
      }
    }
  };

  const adjustGuests = (type: keyof GuestCount, increment: boolean) => {
    setGuests((prev) => {
      const newValue = increment ? prev[type] + 1 : prev[type] - 1;
      if (type === "adults" && newValue < 1) return prev;
      if (newValue < 0) return prev;
      return { ...prev, [type]: newValue };
    });
  };

  const handleSubmitBooking = async () => {
    if (!checkInDate || !checkOutDate) {
      Alert.alert("Dates requises", "Veuillez sélectionner vos dates d'arrivée et de départ.");
      return;
    }

    if (!selectedRoomType) {
      Alert.alert("Chambre requise", "Veuillez sélectionner un type de chambre.");
      return;
    }

    // If room type has individual rooms, require one to be selected
    if (selectedRoom && selectedRoom.rooms.length > 0 && !selectedRoomId) {
      Alert.alert("Chambre requise", "Veuillez choisir une chambre spécifique.");
      return;
    }

    try {
      setIsSubmitting(true);

      const bookingService = getBookingService();
      const room = roomTypes.find((r) => r.id === selectedRoomType);
      const catLabel = ROOM_CATEGORIES[room?.category || "other"]?.label || "Chambre";
      const indivRoom = room?.rooms?.find((r) => r.roomId === selectedRoomId);

      await bookingService.createBooking(
        {
          propertyId: property?.id || "",
          clientId: user?.id || "",
          startDate: checkInDate,
          endDate: checkOutDate,
          numberOfOccupants: guests.adults + guests.children,
          hasGuarantor: false,
          currentSituation: [
            room ? `Chambre: ${room.name} (${catLabel})` : "",
            indivRoom ? `N°: ${indivRoom.roomName}` : `${roomCount} chambre(s)`,
            `${guests.adults} adulte(s)`,
            guests.children > 0 ? `${guests.children} enfant(s)` : "",
            guests.infants > 0 ? `${guests.infants} bébé(s)` : "",
            specialRequests ? `Demandes: ${specialRequests}` : "",
          ]
            .filter(Boolean)
            .join(" | "),
        },
        property?.title,
        user?.fullName || undefined,
        "rent"
      );

      Alert.alert(
        "Réservation envoyée !",
        `Votre demande au ${property?.title || "l'hôtel"} pour ${nights} nuit(s) a été envoyée.\n\n${room?.name} × ${roomCount} chambre(s)\nTotal : ${totalPrice.toLocaleString()} ${currency}`,
        [{ text: "Payer maintenant", onPress: () => router.push('/wallet/Wallet') }]
      );
    } catch (error: any) {
      console.error("Booking error:", error);
      const msg = error?.message || "";
      if (msg.includes("own property")) {
        Alert.alert("Action impossible", "Vous ne pouvez pas réserver votre propre propriété.");
      } else {
        Alert.alert("Erreur", "Impossible de créer la réservation. Veuillez réessayer.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- ERROR STATE ---
  if (!property) {
    return (
      <ThemedView style={[styles.container, { justifyContent: "center", alignItems: "center", padding: 24 }]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color={theme.error as string} />
        <ThemedText type="subtitle" style={{ marginTop: 16, textAlign: "center" }}>
          Données introuvables
        </ThemedText>
        <ThemedText type="body" intensity="light" style={{ marginTop: 8, textAlign: "center" }}>
          Impossible de charger les informations de l'hôtel.
        </ThemedText>
        <TouchableOpacity
          style={{ marginTop: 24, backgroundColor: theme.primary as string, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12 }}
          onPress={() => router.back()}
        >
          <ThemedText type="normal" color="white">Retour</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hotel Header */}
        <ThemedView style={[styles.section, { borderWidth: 1, borderColor: theme.outline as string }]}>
          <ThemedView style={styles.hotelHeaderContent}>
            {hotelImage && (
              <Image source={{ uri: hotelImage }} style={styles.hotelThumbnail} />
            )}
            <ThemedView style={styles.hotelHeaderInfo}>
              <ThemedText type="normaltitle" intensity="strong" numberOfLines={2}>
                {property.title || "Hôtel"}
              </ThemedText>
              {(property.location || property.address) && (
                <ThemedView style={styles.hotelLocationRow}>
                  <Ionicons name="location-outline" size={14} color={theme.onSurface as string} />
                  <ThemedText type="caption" intensity="light" numberOfLines={1} style={{ marginLeft: 4, flex: 1 }}>
                    {property.location || property.address}
                  </ThemedText>
                </ThemedView>
              )}
              {property.owner?.name && (
                <ThemedView style={styles.hotelOwnerRow}>
                  {property.owner?.avatar && (
                    <Image source={{ uri: property.owner.avatar }} style={styles.ownerMiniAvatar} />
                  )}
                  <ThemedText type="caption" intensity="light" numberOfLines={1}>
                    {property.owner.name}
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          </ThemedView>

          {/* Property-level amenities */}
          {property.amenities?.length > 0 && (
            <ThemedView style={styles.propertyAmenities}>
              {property.amenities.map((amenity: string, idx: number) => (
                <ThemedView key={idx} style={[styles.amenityChip, { backgroundColor: (theme.primary as string) + "12" }]}>
                  <Ionicons name="checkmark-circle" size={12} color={theme.primary as string} style={{ marginRight: 4 }} />
                  <ThemedText type="caption" style={{ color: theme.primary as string }}>{amenity}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          )}
        </ThemedView>

        {/* Date Selection */}
        <ThemedView style={[styles.section, { borderWidth: 1, borderColor: theme.outline as string }]}>
          <ThemedView style={styles.sectionHeader}>
            <MaterialIcons name="date-range" size={22} color={theme.primary as string} />
            <ThemedText type="normaltitle" intensity="strong">Dates de séjour</ThemedText>
          </ThemedView>

          <ThemedView style={styles.dateSelectionRow}>
            <TouchableOpacity
              style={[
                styles.dateBox,
                { backgroundColor: theme.surface as string },
                !selectingCheckOut && checkInDate === "" && { borderColor: theme.primary as string, backgroundColor: (theme.primary as string) + "10" },
              ]}
              onPress={() => setSelectingCheckOut(false)}
            >
              <ThemedText type="caption" intensity="light">Arrivée</ThemedText>
              <ThemedText type="normal" intensity="strong">
                {checkInDate
                  ? format(new Date(checkInDate), "dd MMM yyyy", { locale: fr })
                  : "Sélectionner"}
              </ThemedText>
            </TouchableOpacity>

            <ThemedView style={styles.dateArrow}>
              <Ionicons name="arrow-forward" size={20} color={theme.onSurface as string} />
            </ThemedView>

            <TouchableOpacity
              style={[
                styles.dateBox,
                { backgroundColor: theme.surface as string },
                selectingCheckOut && { borderColor: theme.primary as string, backgroundColor: (theme.primary as string) + "10" },
              ]}
              onPress={() => checkInDate && setSelectingCheckOut(true)}
            >
              <ThemedText type="caption" intensity="light">Départ</ThemedText>
              <ThemedText type="normal" intensity="strong">
                {checkOutDate
                  ? format(new Date(checkOutDate), "dd MMM yyyy", { locale: fr })
                  : "Sélectionner"}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {nights > 0 && (
            <ThemedView style={[styles.nightsBadge, { backgroundColor: (theme.primary as string) + "15" }]}>
              <Ionicons name="moon" size={16} color={theme.primary as string} />
              <ThemedText type="caption" style={{ color: theme.primary as string, fontWeight: "600" }}>
                {nights} nuit{nights > 1 ? "s" : ""}
              </ThemedText>
            </ThemedView>
          )}

          <Calendar
            onDayPress={handleDayPress}
            markedDates={markedDates}
            markingType="period"
            minDate={format(new Date(), "yyyy-MM-dd")}
            theme={{
              backgroundColor: "transparent",
              calendarBackground: "transparent",
              selectedDayBackgroundColor: theme.primary as string,
              todayTextColor: theme.primary as string,
              arrowColor: theme.primary as string,
              monthTextColor: theme.onSurface as string,
              dayTextColor: theme.onSurface as string,
              textDisabledColor: (theme.onSurface as string) + "30",
              textDayFontWeight: "500",
              textMonthFontWeight: "700",
              textDayHeaderFontWeight: "600",
            }}
          />
        </ThemedView>

        {/* Room Type Selection */}
        <ThemedView style={[styles.section, { borderWidth: 1, borderColor: theme.outline as string }]}>
          <ThemedView style={styles.sectionHeader}>
            <MaterialCommunityIcons name="door" size={22} color={theme.primary as string} />
            <ThemedText type="normaltitle" intensity="strong">Choisir une chambre</ThemedText>
          </ThemedView>

          {roomTypes.length > 0 ? (
            <ThemedView style={{ gap: 10 }}>
              {roomTypes.map((room) => {
                const cat = ROOM_CATEGORIES[room.category] || ROOM_CATEGORIES.other;
                const isSelected = selectedRoomType === room.id;
                return (
                  <TouchableOpacity
                    key={room.id}
                    onPress={() => {
                      setSelectedRoomType(room.id);
                      setSelectedRoomId("");
                      setRoomCount(1);
                    }}
                    style={[
                      styles.roomCard,
                      {
                        borderColor: isSelected ? (theme.primary as string) : (theme.outline as string) + "40",
                        backgroundColor: isSelected ? (theme.primary as string) + "08" : "transparent",
                      },
                    ]}
                  >
                    <ThemedView style={[styles.categoryBadge, { backgroundColor: cat.color + "15" }]}>
                      <MaterialCommunityIcons name={cat.icon as any} size={14} color={cat.color} />
                      <ThemedText type="caption" style={{ color: cat.color, fontWeight: "600", marginLeft: 4 }}>
                        {cat.label}
                      </ThemedText>
                    </ThemedView>

                    <ThemedView style={styles.roomHeader}>
                      <ThemedView style={{ flex: 1, marginRight: 12 }}>
                        <ThemedText type="normal" intensity="strong" style={{ fontSize: 16 }}>
                          {room.name}
                        </ThemedText>
                        <ThemedView style={styles.capacityRow}>
                          <Ionicons name="people-outline" size={14} color={theme.onSurface as string} />
                          <ThemedText type="caption" intensity="light" style={{ marginLeft: 4 }}>
                            {room.capacity} pers. max - {room.available} dispo.
                          </ThemedText>
                        </ThemedView>
                      </ThemedView>
                      <ThemedView style={styles.roomPriceBox}>
                        <ThemedText type="subtitle" style={{ color: theme.primary as string, fontWeight: "700" }}>
                          {room.price.toLocaleString()}
                        </ThemedText>
                        <ThemedText type="caption" intensity="light">{currency}/nuit</ThemedText>
                      </ThemedView>
                    </ThemedView>

                    {room.description && (
                      <ThemedText type="body" intensity="light" numberOfLines={2} style={{ marginBottom: 6 }}>
                        {room.description}
                      </ThemedText>
                    )}

                    {room.amenities.length > 0 && (
                      <ThemedView style={styles.roomAmenities}>
                        {room.amenities.slice(0, 4).map((amenity, idx) => (
                          <ThemedView key={idx} style={[styles.amenityChip, { backgroundColor: (theme.outline as string) + "30" }]}>
                            <ThemedText type="caption" intensity="light">{amenity}</ThemedText>
                          </ThemedView>
                        ))}
                        {room.amenities.length > 4 && (
                          <ThemedView style={[styles.amenityChip, { backgroundColor: (theme.primary as string) + "10" }]}>
                            <ThemedText type="caption" style={{ color: theme.primary as string }}>
                              +{room.amenities.length - 4}
                            </ThemedText>
                          </ThemedView>
                        )}
                      </ThemedView>
                    )}

                    {isSelected && (
                      <ThemedView style={styles.roomFooter}>
                        <ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
                          <MaterialCommunityIcons name="check-circle" size={14} color={theme.success as string} />
                          <ThemedText type="caption" style={{ color: theme.success as string, marginLeft: 4 }}>
                            Sélectionné
                          </ThemedText>
                        </ThemedView>
                        <Ionicons name="checkmark-circle" size={22} color={theme.success as string} />
                      </ThemedView>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ThemedView>
          ) : (
            <ThemedView style={[styles.emptyRooms, { backgroundColor: (theme.outline as string) + "20" }]}>
              <MaterialCommunityIcons name="bed-empty" size={40} color={theme.onSurface as string} />
              <ThemedText type="body" intensity="light" style={{ marginTop: 12, textAlign: "center" }}>
                Aucun type de chambre configuré pour cet établissement.
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {/* Individual Room Selection (when room type has rooms) */}
        {selectedRoom && selectedRoom.rooms.length > 0 && (
          <ThemedView style={[styles.section, { borderWidth: 1, borderColor: theme.outline as string }]}>
            <ThemedView style={styles.sectionHeader}>
              <MaterialCommunityIcons name="bed" size={22} color={theme.primary as string} />
              <ThemedText type="normaltitle" intensity="strong">Choisir votre chambre</ThemedText>
            </ThemedView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {selectedRoom.rooms.filter((r) => r.isAvailable).map((indivRoom) => {
                const isRoomSelected = selectedRoomId === indivRoom.roomId;
                const roomThumb = indivRoom.images?.[0]?.variants?.small || indivRoom.images?.[0]?.originalUrl;
                return (
                  <TouchableOpacity
                    key={indivRoom.roomId}
                    onPress={() => setSelectedRoomId(indivRoom.roomId)}
                    style={{
                      width: 130,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: isRoomSelected ? (theme.primary as string) : (theme.outline as string) + "30",
                      backgroundColor: isRoomSelected ? (theme.primary as string) + "08" : "transparent",
                      overflow: "hidden",
                    }}
                  >
                    {roomThumb ? (
                      <Image source={{ uri: roomThumb }} style={{ width: "100%", height: 90 }} resizeMode="cover" />
                    ) : (
                      <ThemedView style={{ width: "100%", height: 90, alignItems: "center", justifyContent: "center", backgroundColor: (theme.outline as string) + "15" }}>
                        <MaterialCommunityIcons name="bed-outline" size={28} color={theme.outline as string} />
                      </ThemedView>
                    )}
                    <ThemedView style={{ padding: 8, alignItems: "center", gap: 4 }}>
                      <ThemedText type="caption" style={{ fontWeight: "600", textAlign: "center" }}>
                        {indivRoom.roomName}
                      </ThemedText>
                      {isRoomSelected && (
                        <Ionicons name="checkmark-circle" size={18} color={theme.primary as string} />
                      )}
                    </ThemedView>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </ThemedView>
        )}

        {/* Room Count (when no individual rooms, or as additional option) */}
        {selectedRoom && selectedRoom.rooms.length === 0 && (
          <ThemedView style={[styles.section, { borderWidth: 1, borderColor: theme.outline as string }]}>
            <ThemedView style={[styles.roomCountRow, { borderTopWidth: 0 }]}>
              <ThemedView>
                <ThemedText type="normal" intensity="strong">Nombre de chambres</ThemedText>
                <ThemedText type="caption" intensity="light">
                  Capacité : {(selectedRoom.capacity || 2) * roomCount} pers. max
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.guestCounter}>
                <TouchableOpacity
                  style={[styles.counterButton, { borderColor: theme.outline as string }]}
                  onPress={() => setRoomCount((prev) => Math.max(1, prev - 1))}
                >
                  <Ionicons name="remove" size={20} color={theme.onSurface as string} />
                </TouchableOpacity>
                <ThemedText type="normal" intensity="strong" style={styles.counterValue}>{roomCount}</ThemedText>
                <TouchableOpacity
                  style={[styles.counterButton, { borderColor: theme.outline as string }]}
                  onPress={() => setRoomCount((prev) => Math.min(selectedRoom.available || 5, prev + 1))}
                >
                  <Ionicons name="add" size={20} color={theme.onSurface as string} />
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}

        {/* Occupants */}
        <ThemedView style={[styles.section, { borderWidth: 1, borderColor: theme.outline as string }]}>
          <ThemedView style={styles.sectionHeader}>
            <Ionicons name="people" size={22} color={theme.primary as string} />
            <ThemedText type="normaltitle" intensity="strong">Occupants</ThemedText>
          </ThemedView>

          <ThemedView style={[styles.guestRow, { borderBottomColor: theme.outline as string }]}>
            <ThemedView style={styles.guestInfo}>
              <ThemedText type="normal" intensity="strong">Adultes</ThemedText>
              <ThemedText type="caption" intensity="light">13 ans et plus</ThemedText>
            </ThemedView>
            <ThemedView style={styles.guestCounter}>
              <TouchableOpacity style={[styles.counterButton, { borderColor: theme.outline as string }]} onPress={() => adjustGuests("adults", false)}>
                <Ionicons name="remove" size={20} color={theme.onSurface as string} />
              </TouchableOpacity>
              <ThemedText type="normal" intensity="strong" style={styles.counterValue}>{guests.adults}</ThemedText>
              <TouchableOpacity style={[styles.counterButton, { borderColor: theme.outline as string }]} onPress={() => adjustGuests("adults", true)}>
                <Ionicons name="add" size={20} color={theme.onSurface as string} />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          <ThemedView style={[styles.guestRow, { borderBottomColor: theme.outline as string }]}>
            <ThemedView style={styles.guestInfo}>
              <ThemedText type="normal" intensity="strong">Enfants</ThemedText>
              <ThemedText type="caption" intensity="light">2 - 12 ans</ThemedText>
            </ThemedView>
            <ThemedView style={styles.guestCounter}>
              <TouchableOpacity style={[styles.counterButton, { borderColor: theme.outline as string }]} onPress={() => adjustGuests("children", false)}>
                <Ionicons name="remove" size={20} color={theme.onSurface as string} />
              </TouchableOpacity>
              <ThemedText type="normal" intensity="strong" style={styles.counterValue}>{guests.children}</ThemedText>
              <TouchableOpacity style={[styles.counterButton, { borderColor: theme.outline as string }]} onPress={() => adjustGuests("children", true)}>
                <Ionicons name="add" size={20} color={theme.onSurface as string} />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.guestRow}>
            <ThemedView style={styles.guestInfo}>
              <ThemedText type="normal" intensity="strong">Bébés</ThemedText>
              <ThemedText type="caption" intensity="light">Moins de 2 ans</ThemedText>
            </ThemedView>
            <ThemedView style={styles.guestCounter}>
              <TouchableOpacity style={[styles.counterButton, { borderColor: theme.outline as string }]} onPress={() => adjustGuests("infants", false)}>
                <Ionicons name="remove" size={20} color={theme.onSurface as string} />
              </TouchableOpacity>
              <ThemedText type="normal" intensity="strong" style={styles.counterValue}>{guests.infants}</ThemedText>
              <TouchableOpacity style={[styles.counterButton, { borderColor: theme.outline as string }]} onPress={() => adjustGuests("infants", true)}>
                <Ionicons name="add" size={20} color={theme.onSurface as string} />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Special Requests */}
        <ThemedView style={[styles.section, { borderWidth: 1, borderColor: theme.outline as string }]}>
          <ThemedView style={styles.sectionHeader}>
            <MaterialIcons name="note-add" size={22} color={theme.primary as string} />
            <ThemedText type="normaltitle" intensity="strong">Demandes spéciales</ThemedText>
          </ThemedView>
          <ThemedText type="caption" intensity="light" style={{ marginBottom: 10 }}>
            Nous ferons de notre mieux pour répondre à vos demandes (non garanti).
          </ThemedText>
          <TextInput
            style={[styles.textInput, { backgroundColor: theme.surface as string, color: theme.onSurface as string, borderColor: theme.outline as string }]}
            placeholder="Lit bébé, étage élevé, vue sur piscine, chambre non-fumeur..."
            placeholderTextColor={(theme.onSurface as string) + "50"}
            multiline
            numberOfLines={3}
            value={specialRequests}
            onChangeText={setSpecialRequests}
          />
        </ThemedView>

        {/* Price Summary */}
        {nights > 0 && selectedRoom && (
          <ThemedView style={[styles.summaryCard, { borderColor: (theme.primary as string) + "30" }]}>
            <ThemedView style={styles.sectionHeader}>
              <MaterialCommunityIcons name="receipt" size={22} color={theme.primary as string} />
              <ThemedText type="normaltitle" intensity="strong">Récapitulatif</ThemedText>
            </ThemedView>

            <ThemedView style={styles.summaryRow}>
              <ThemedView style={{ flex: 1 }}>
                <ThemedText type="body">
                  {selectedRoom.name}
                  {selectedRoomId && selectedRoom.rooms.length > 0
                    ? ` - ${selectedRoom.rooms.find((r) => r.roomId === selectedRoomId)?.roomName || ""}`
                    : ""}
                </ThemedText>
                <ThemedText type="caption" intensity="light">
                  {selectedRoom.rooms.length > 0 && selectedRoomId ? "1 chambre" : `${roomCount} chambre${roomCount > 1 ? "s" : ""}`} x {nights} nuit{nights > 1 ? "s" : ""}
                </ThemedText>
              </ThemedView>
              <ThemedText type="normal" intensity="strong">
                {(selectedRoom.price * roomCount).toLocaleString()} {currency}/nuit
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.summaryRow}>
              <ThemedText type="body">
                {guests.adults + guests.children} occupant{guests.adults + guests.children > 1 ? "s" : ""}
                {guests.infants > 0 ? ` + ${guests.infants} bébé${guests.infants > 1 ? "s" : ""}` : ""}
              </ThemedText>
              <ThemedText type="caption" intensity="light">inclus</ThemedText>
            </ThemedView>

            <ThemedView style={styles.summaryRow}>
              <ThemedText type="body">
                {format(new Date(checkInDate), "dd MMM", { locale: fr })} - {format(new Date(checkOutDate), "dd MMM yyyy", { locale: fr })}
              </ThemedText>
            </ThemedView>

            <ThemedView style={[styles.summaryDivider, { backgroundColor: theme.outline as string }]} />

            <ThemedView style={styles.summaryRow}>
              <ThemedText type="subtitle" intensity="strong">Total</ThemedText>
              <ThemedText type="subtitle" style={{ color: theme.primary as string, fontWeight: "700" }}>
                {totalPrice.toLocaleString()} {currency}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        )}

        <ThemedView style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <ThemedView variant="surface" style={{...styles.bottomContainer,borderTopWidth:1,  borderTopColor: theme.outline as string, paddingBottom:insets.bottom }}>
        <ThemedView style={styles.bottomPriceContainer}>
          <ThemedText type="caption" intensity="light">Total</ThemedText>
          <ThemedText type="subtitle" intensity="strong">
            {totalPrice > 0 ? `${totalPrice.toLocaleString()} ${currency}` : "-"}
          </ThemedText>
          {nights > 0 && selectedRoom && (
            <ThemedText type="caption" intensity="light">
              {roomCount} ch. x {nights} nuit{nights > 1 ? "s" : ""}
            </ThemedText>
          )}
        </ThemedView>
        <TouchableOpacity
          style={[
            styles.bookButton,
            { backgroundColor: theme.primary as string },
            (!checkInDate || !checkOutDate || !selectedRoomType || isSubmitting) && styles.bookButtonDisabled,
          ]}
          onPress={handleSubmitBooking}
          disabled={!checkInDate || !checkOutDate || !selectedRoomType || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <ThemedText type="normal" color="white" style={{ fontWeight: "700" }}>Réserver</ThemedText>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Hotel Header
  hotelHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  hotelThumbnail: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginRight: 14,
  },
  hotelHeaderInfo: {
    flex: 1,
  },
  hotelLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  hotelOwnerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  ownerMiniAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 6,
  },
  propertyAmenities: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },

  // Sections
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },

  // Date Selection
  dateSelectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dateBox: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  dateArrow: {
    paddingHorizontal: 12,
  },
  nightsBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 16,
    gap: 6,
  },

  // Room Cards
  emptyRooms: {
    padding: 24,
    alignItems: "center",
    borderRadius: 12,
  },
  roomCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  capacityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  roomPriceBox: {
    alignItems: "flex-end",
  },
  roomAmenities: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  amenityChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  roomFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roomCountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
  },

  // Guest counters
  guestRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  guestInfo: {
    flex: 1,
  },
  guestCounter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  counterValue: {
    minWidth: 24,
    textAlign: "center",
  },

  // Special requests
  textInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
    borderWidth: 1,
  },

  // Summary
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryDivider: {
    height: 1,
    marginVertical: 12,
  },

  // Bottom bar
  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  bottomPriceContainer: {
    flex: 1,
  },
  bookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    gap: 8,
  },
  bookButtonDisabled: {
    opacity: 0.5,
  },
});
