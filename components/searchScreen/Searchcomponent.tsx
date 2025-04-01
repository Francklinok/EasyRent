

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TextInput,
} from 'react-native';
import * as Location from 'expo-location';
import {
  Ionicons,
} from '@expo/vector-icons';
import { Container,SearchBar,FilterButton } from '@/components/ui';
import HousingMap from '@/components/utils/map';
import { Housing } from '@/types/HousingType';
import { SearchFilters } from '@/types/FilterType';
import renderHousingCard from '@/components/search/renderHousingcard';
import FilterModal from '@/components/search/renderFilter';


const AdvancedHousingSearch = ()=>{

  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [housings, setHousings] = useState<Housing[]>([]);
  const [filteredHousings, setFilteredHousings] = useState<Housing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    minPrice: 0,
    maxPrice: 10000,
    minSurface: 20,
    rooms: 1,
    type: null,
    country: null
  });

  // Location and Initial Data Fetch
  useEffect(() => {
    const initializeLocationAndData = async () => {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location);
        
        // Mock data fetch - replace with actual API call
        const mockHousings: Housing[] = [
          {
            id: '1',
            title: 'Modern Apartment in Paris',
            description: 'Spacious apartment in the heart of Paris',
            price: 2500,
            surface: 85,
            rooms: 3,
            bathrooms: 2,
            country: 'France',
            city: 'Paris',
            type: 'apartment',
            amenities: ['Balcony', 'Gym', 'Parking'],
            location: { 
              latitude: 48.8566, 
              longitude: 2.3522 
            },
            proximityScore: {
              transport: 4.5,
              schools: 4.2,
              healthcare: 4.7,
              shopping: 4.8
            },
            images: ['https://example.com/apartment1.jpg']
          },
          // Add more mock housing data
        ];

        setHousings(mockHousings);
        setFilteredHousings(mockHousings);
      }
    };

    initializeLocationAndData();
  }, []);

  // Advanced Search and Filter Logic
  const applyFilters = useCallback(() => {
    const results = housings.filter(housing => {
      const matchesPrice = 
        housing.price >= filters.minPrice && 
        housing.price <= filters.maxPrice;
      
      const matchesSurface = housing.surface >= filters.minSurface;
      const matchesRooms = housing.rooms >= filters.rooms;
      const matchesType = !filters.type || housing.type === filters.type;
      const matchesCountry = !filters.country || housing.country === filters.country;
      const matchesQuery = housing.title.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesPrice && 
             matchesSurface && 
             matchesRooms && 
             matchesType && 
             matchesCountry && 
             matchesQuery;
    });

    setFilteredHousings(results);
    setIsFilterModalVisible(false);
  }, [housings, filters, searchQuery]);

  return (
    <Container>
      <SearchBar>
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
          <Ionicons name="search" size={20} color="#4B5563" className="mr-2" />
          <TextInput
            placeholder="Search housing"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1"
          />
        </View>
        <FilterButton onPress={() => setIsFilterModalVisible(true)}>
          <Ionicons name="filter" size={24} color="white" />
        </FilterButton>
      </SearchBar>

      <HousingMap 
        housings={filteredHousings} 
        currentLocation={currentLocation} 
      />

      <ScrollView className="p-8">
        {filteredHousings.map(housing => renderHousingCard(housing))}
      </ScrollView>

      <FilterModal 
        isVisible={isFilterModalVisible}
        filters={filters}
        setFilters={setFilters}
        applyFilters={applyFilters}
        onClose={() => setIsFilterModalVisible(false)}
      />
    </Container>
  );
};

export default AdvancedHousingSearch;




// import React, { useState } from "react";
// import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
// import DateTimePicker from "@react-native-community/datetimepicker";

// const ReservationScreen = () => {
//   const [name, setName] = useState("");
//   const [date, setDate] = useState(new Date());
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [showTimePicker, setShowTimePicker] = useState(false);

//   const handleConfirm = () => {
//     if (!name) {
//       Alert.alert("Erreur", "Veuillez entrer votre nom");
//       return;
//     }
//     Alert.alert(
//       "Réservation confirmée",
//       `Nom: ${name}\nDate: ${date.toLocaleDateString()}\nHeure: ${date.toLocaleTimeString()}`
//     );
//   };

//   return (
//     <View className="flex-1 justify-center items-center bg-gray-100 p-4">
//       <Text className="text-2xl font-bold mb-4">Réserver une place</Text>

//       <TextInput
//         className="w-full bg-white p-3 rounded-lg border border-gray-300 mb-4"
//         placeholder="Votre nom"
//         onChangeText={setName}
//       />

//       <TouchableOpacity
//         className="w-full bg-blue-500 p-3 rounded-lg mb-4"
//         onPress={() => setShowDatePicker(true)}
//       >
//         <Text className="text-white text-center">Sélectionner une date</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         className="w-full bg-blue-500 p-3 rounded-lg mb-4"
//         onPress={() => setShowTimePicker(true)}
//       >
//         <Text className="text-white text-center">Sélectionner une heure</Text>
//       </TouchableOpacity>

//       {showDatePicker && (
//         <DateTimePicker
//           value={date}
//           mode="date"
//           display="default"
//           onChange={(event, selectedDate) => {
//             setShowDatePicker(false);
//             if (selectedDate) setDate(selectedDate);
//           }}
//         />
//       )}

//       {showTimePicker && (
//         <DateTimePicker
//           value={date}
//           mode="time"
//           display="default"
//           onChange={(event, selectedTime) => {
//             setShowTimePicker(false);
//             if (selectedTime) setDate(selectedTime);
//           }}
//         />
//       )}

//       <TouchableOpacity
//         className="w-full bg-green-500 p-3 rounded-lg mt-4"
//         onPress={handleConfirm}
//       >
//         <Text className="text-white text-center">Confirmer</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default ReservationScreen;
