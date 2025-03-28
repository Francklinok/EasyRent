
// import React, { useState, useRef, useEffect, useMemo } from 'react';
// import {
//   View,
//   Text,
//   Dimensions,
//   TouchableOpacity,
//   Animated,
//   Modal,
//   StyleSheet,
//   Platform
// } from 'react-native';
// import MapView, { 
//   Marker, 
//   Heatmap, 
//   Polygon, 
//   Overlay, 
//   Circle, 
//   CalloutSubview 
// } from 'react-native-maps';
// import * as Location from 'expo-location';
// import { 
//   MaterialIcons, 
//   MaterialCommunityIcons, 
//   Ionicons 
// } from '@expo/vector-icons';
// import Slider from '@react-native-community/slider';
// import { Housing } from '@/types/HousingType';

// // Définition des types avancés
// interface AdvancedHousing extends Housing {
//   energyEfficiency?: number;
//   smartHomeScore?: number;
//   neighborhoodRating?: number;
//   futuristicFeatures?: string[];
// }

// interface MapFilter {
//   priceRange?: [number, number];
//   energyEfficiency?: number;
//   smartHomeScore?: number;
// }

// const AdvancedHousingMap: React.FC<{
//   housings: AdvancedHousing[];
//   currentLocation: Location.LocationObject | null;
// }> = ({ housings, currentLocation }) => {
//   // États avancés
//   const [selectedHousing, setSelectedHousing] = useState<AdvancedHousing | null>(null);
//   const [mapMode, setMapMode] = useState<'normal' | 'heatmap' | 'polygon' | 'ai-overlay'>('normal');
//   const [filters, setFilters] = useState<MapFilter>({});
//   const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
//   const [isAIDetailsModalVisible, setIsAIDetailsModalVisible] = useState(false);
  
//   const mapRef = useRef<MapView>(null);
//   const mapModeAnimation = useRef(new Animated.Value(0)).current;

//   // Filtrage avancé des logements
//   const filteredHousings = useMemo(() => {
//     return housings.filter(housing => {
//       if (filters.priceRange) {
//         const [min, max] = filters.priceRange;
//         if (housing.price < min || housing.price > max) return false;
//       }
//       if (filters.energyEfficiency !== undefined && 
//           housing.energyEfficiency !== undefined) {
//         if (housing.energyEfficiency < filters.energyEfficiency) return false;
//       }
//       return true;
//     });
//   }, [housings, filters]);

//   // Génération de données de heatmap
//   const heatmapData = useMemo(() => 
//     filteredHousings.map(housing => ({
//       latitude: housing.location.latitude,
//       longitude: housing.location.longitude,
//       weight: housing.price / 1000 // Poids basé sur le prix
//     })), 
//     [filteredHousings]
//   );

//   // Animation de transition entre modes de carte
//   const animateMapMode = (newMode: string) => {
//     Animated.timing(mapModeAnimation, {
//       toValue: newMode === 'ai-overlay' ? 1 : 0,
//       duration: 500,
//       useNativeDriver: true
//     }).start();
//   };

//   // Fonctions de rendu avancées
//   const renderMarkerContent = (housing: AdvancedHousing) => {
//     const iconColor = housing.smartHomeScore && housing.smartHomeScore > 7 
//       ? 'green' 
//       : housing.smartHomeScore && housing.smartHomeScore > 4 
//         ? 'orange' 
//         : 'red';

//     return (
//       <View style={styles.markerContainer}>
//         <MaterialCommunityIcons 
//           name="home-smart" 
//           size={24} 
//           color={iconColor} 
//         />
//         <Text style={styles.markerPrice}>{housing.price}€</Text>
//       </View>
//     );
//   };

//   const renderAIOverlay = () => {
//     const opacity = mapModeAnimation.interpolate({
//       inputRange: [0, 1],
//       outputRange: [0, 0.7]
//     });

//     return (
//       <Animated.View 
//         style={[
//           styles.aiOverlay, 
//           { opacity }
//         ]}
//       >
//         <Text style={styles.aiOverlayText}>
//           AI Housing Insights Active
//         </Text>
//       </Animated.View>
//     );
//   };

//   // Rendu des détails avancés
//   const renderAdvancedHousingDetails = () => {
//     if (!selectedHousing) return null;

//     return (
//       <Modal 
//         visible={isAIDetailsModalVisible}
//         transparent={true}
//         animationType="slide"
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>
//               {selectedHousing.title} - Analyse Avancée
//             </Text>
//             <View style={styles.featureContainer}>
//               <MaterialCommunityIcons 
//                 name="solar-panel" 
//                 size={24} 
//                 color="green" 
//               />
//               <Text>
//                 Efficacité Énergétique: {selectedHousing.energyEfficiency}/10
//               </Text>
//             </View>
//             <View style={styles.featureContainer}>
//               <Ionicons 
//                 name="hardware-chip" 
//                 size={24} 
//                 color="blue" 
//               />
//               <Text>
//                 Score Maison Intelligente: {selectedHousing.smartHomeScore}/10
//               </Text>
//             </View>
//             {selectedHousing.futuristicFeatures && (
//               <View>
//                 <Text style={styles.futuristicFeaturesTitle}>
//                   Caractéristiques Futuristes:
//                 </Text>
//                 {selectedHousing.futuristicFeatures.map((feature, index) => (
//                   <Text key={index} style={styles.futuristicFeature}>
//                     • {feature}
//                   </Text>
//                 ))}
//               </View>
//             )}
//             <TouchableOpacity 
//               style={styles.closeButton}
//               onPress={() => setIsAIDetailsModalVisible(false)}
//             >
//               <Text style={styles.closeButtonText}>Fermer</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     );
//   };

//   // Rendu du modal de filtres
//   const renderFilterModal = () => {
//     return (
//       <Modal 
//         visible={isFilterModalVisible}
//         transparent={true}
//         animationType="slide"
//       >
//         <View style={styles.filterModalContainer}>
//           <View style={styles.filterModalContent}>
//             <Text style={styles.filterTitle}>Filtres Avancés</Text>
            
//             <View style={styles.filterSection}>
//               <Text>Prix Minimum: {filters.priceRange?.[0] || 0}€</Text>
//               <Slider
//                 minimumValue={0}
//                 maximumValue={5000}
//                 step={100}
//                 value={filters.priceRange?.[0] || 0}
//                 onValueChange={(value) => setFilters(prev => ({
//                   ...prev,
//                   priceRange: [value, prev.priceRange?.[1] || 5000]
//                 }))}
//               />
//             </View>

//             <View style={styles.filterSection}>
//               <Text>Prix Maximum: {filters.priceRange?.[1] || 5000}€</Text>
//               <Slider
//                 minimumValue={0}
//                 maximumValue={5000}
//                 step={100}
//                 value={filters.priceRange?.[1] || 5000}
//                 onValueChange={(value) => setFilters(prev => ({
//                   ...prev,
//                   priceRange: [prev.priceRange?.[0] || 0, value]
//                 }))}
//               />
//             </View>

//             <TouchableOpacity 
//               style={styles.applyFilterButton}
//               onPress={() => setIsFilterModalVisible(false)}
//             >
//               <Text style={styles.applyFilterButtonText}>Appliquer</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         style={styles.map}
//         initialRegion={currentLocation ? {
//           latitude: currentLocation.coords.latitude,
//           longitude: currentLocation.coords.longitude,
//           latitudeDelta: 0.1,
//           longitudeDelta: 0.1,
//         } : undefined}
//       >
//         {mapMode === 'heatmap' && (
//           <Heatmap 
//             points={heatmapData}
//             radius={50}
//             gradient={{
//               colors: ['transparent', 'blue', 'green', 'yellow', 'red'],
//               startPoints: [0.1, 0.4, 0.6, 0.8, 1],
//               colorMapSize: 256
//             }}
//           />
//         )}

//         {filteredHousings.map(housing => (
//           <Marker
//             key={housing.id}
//             coordinate={housing.location}
//             onPress={() => {
//               setSelectedHousing(housing);
//               setIsAIDetailsModalVisible(true);
//             }}
//           >
//             {renderMarkerContent(housing)}
//           </Marker>
//         ))}
//       </MapView>

//       {renderAIOverlay()}

//       <View style={styles.controlsContainer}>
//         <TouchableOpacity 
//           style={styles.modeButton}
//           onPress={() => {
//             const modes = ['normal', 'heatmap', 'ai-overlay'];
//             const currentIndex = modes.indexOf(mapMode);
//             const nextMode = modes[(currentIndex + 1) % modes.length];
//             setMapMode(nextMode as any);
//             animateMapMode(nextMode);
//           }}
//         >
//           <MaterialIcons name="layers" size={24} color="white" />
//         </TouchableOpacity>

//         <TouchableOpacity 
//           style={styles.filterButton}
//           onPress={() => setIsFilterModalVisible(true)}
//         >
//           <MaterialIcons name="filter-list" size={24} color="white" />
//         </TouchableOpacity>
//       </View>

//       {renderAdvancedHousingDetails()}
//       {renderFilterModal()}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   // Styles détaillés pour chaque élément
//   container: { flex: 1 },
//   map: { 
//     width: Dimensions.get('window').width, 
//     height: 500 
//   },
//   markerContainer: {
//     backgroundColor: 'white',
//     padding: 5,
//     borderRadius: 10,
//     flexDirection: 'row',
//     alignItems: 'center'
//   },
//   markerPrice: {
//     marginLeft: 5,
//     fontWeight: 'bold'
//   },
//   controlsContainer: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     flexDirection: 'column'
//   },
//   modeButton: {
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     padding: 10,
//     borderRadius: 5,
//     marginBottom: 10
//   },
//   filterButton: {
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     padding: 10,
//     borderRadius: 5
//   },
//   // Autres styles... (modal, overlay, etc.)
// });

// export default AdvancedHousingMap;


import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Animated,
  Modal,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle
} from 'react-native';
import MapView, { 
  Marker, 
  Heatmap, 
  Region
} from 'react-native-maps';
import * as Location from 'expo-location';
import { 
  MaterialIcons, 
  MaterialCommunityIcons, 
  Ionicons 
} from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

// Définition des types
interface Location {
  latitude: number;
  longitude: number;
}

interface AdvancedHousing {
  id: string | number;
  title: string;
  price: number;
  location: Location;
  energyEfficiency?: number;
  smartHomeScore?: number;
  neighborhoodRating?: number;
  futuristicFeatures?: string[];
  images?: string[];
}

interface MapFilter {
  priceRange?: [number, number];
  energyEfficiency?: number;
}

// Définition complète des styles avec types TypeScript
const createStyles = () => {
  return StyleSheet.create({
    container: { 
      flex: 1 
    } as ViewStyle,
    map: { 
      width: Dimensions.get('window').width, 
      height: 500 
    } as ViewStyle,
    markerContainer: {
      backgroundColor: 'white',
      padding: 5,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center'
    } as ViewStyle,
    markerPrice: {
      marginLeft: 5,
      fontWeight: 'bold'
    } as TextStyle,
    controlsContainer: {
      position: 'absolute',
      top: 10,
      right: 10,
      flexDirection: 'column'
    } as ViewStyle,
    modeButton: {
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: 10,
      borderRadius: 5,
      marginBottom: 10
    } as ViewStyle,
    filterButton: {
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: 10,
      borderRadius: 5
    } as ViewStyle,
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)'
    } as ViewStyle,
    modalContent: {
      width: '90%',
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
      alignItems: 'center'
    } as ViewStyle,
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15
    } as TextStyle,
    featureContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 5
    } as ViewStyle,
    futuristicFeaturesTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 10
    } as TextStyle,
    futuristicFeature: {
      marginLeft: 10
    } as TextStyle,
    closeButton: {
      marginTop: 15,
      backgroundColor: 'blue',
      padding: 10,
      borderRadius: 5
    } as ViewStyle,
    closeButtonText: {
      color: 'white',
      textAlign: 'center'
    } as TextStyle,
    filterModalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)'
    } as ViewStyle,
    filterModalContent: {
      width: '90%',
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20
    } as ViewStyle,
    filterTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15
    } as TextStyle,
    filterSection: {
      marginVertical: 10
    } as ViewStyle,
    applyFilterButton: {
      backgroundColor: 'blue',
      padding: 10,
      borderRadius: 5,
      marginTop: 15
    } as ViewStyle,
    applyFilterButtonText: {
      color: 'white',
      textAlign: 'center'
    } as TextStyle,
    aiOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'blue',
      justifyContent: 'center',
      alignItems: 'center'
    } as ViewStyle,
    aiOverlayText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold'
    } as TextStyle
  });
};

const AdvancedHousingMap: React.FC<{
  housings: AdvancedHousing[];
  currentLocation: Location.LocationObject | null;
}> = ({ housings, currentLocation }) => {
  // États
  const [selectedHousing, setSelectedHousing] = useState<AdvancedHousing | null>(null);
  const [mapMode, setMapMode] = useState<'normal' | 'heatmap' | 'ai-overlay'>('normal');
  const [filters, setFilters] = useState<MapFilter>({});
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isAIDetailsModalVisible, setIsAIDetailsModalVisible] = useState(false);
  
  // Référence de la carte
  const mapRef = useRef<MapView>(null);
  const mapModeAnimation = useRef(new Animated.Value(0)).current;

  // Styles
  const styles = createStyles();

  // Filtrage des logements
  const filteredHousings = useMemo(() => {
    return housings.filter(housing => {
      if (filters.priceRange) {
        const [min, max] = filters.priceRange;
        if (housing.price < min || housing.price > max) return false;
      }
      if (filters.energyEfficiency !== undefined && 
          housing.energyEfficiency !== undefined) {
        if (housing.energyEfficiency < filters.energyEfficiency) return false;
      }
      return true;
    });
  }, [housings, filters]);

  // Données de heatmap
  const heatmapData = useMemo(() => 
    filteredHousings.map(housing => ({
      latitude: housing.location.latitude,
      longitude: housing.location.longitude,
      weight: housing.price / 1000
    })), 
    [filteredHousings]
  );

  // Fonction principale de rendu
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={currentLocation ? {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        } : undefined}
      >
        {mapMode === 'heatmap' && (
          <Heatmap 
            points={heatmapData}
            radius={50}
            gradient={{
              colors: ['transparent', 'blue', 'green', 'yellow', 'red'],
              startPoints: [0.1, 0.4, 0.6, 0.8, 1],
              colorMapSize: 256
            }}
          />
        )}

        {filteredHousings.map(housing => (
          <Marker
            key={housing.id.toString()}
            coordinate={housing.location}
            onPress={() => {
              setSelectedHousing(housing);
              setIsAIDetailsModalVisible(true);
            }}
          >
            <View style={styles.markerContainer}>
              <MaterialCommunityIcons 
                name="home-smart" 
                size={24} 
                color={housing.smartHomeScore && housing.smartHomeScore > 7 
                  ? 'green' 
                  : housing.smartHomeScore && housing.smartHomeScore > 4 
                    ? 'orange' 
                    : 'red'} 
              />
              <Text style={styles.markerPrice}>{housing.price}€</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Modals et autres composants à implémenter de manière similaire */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={styles.modeButton}
          onPress={() => {
            const modes: Array<'normal' | 'heatmap' | 'ai-overlay'> = ['normal', 'heatmap', 'ai-overlay'];
            const currentIndex = modes.indexOf(mapMode);
            const nextMode = modes[(currentIndex + 1) % modes.length];
            setMapMode(nextMode);
          }}
        >
          <MaterialIcons name="layers" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <MaterialIcons name="filter-list" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Modals à implémenter avec les styles correspondants */}
    </View>
  );
};

export default AdvancedHousingMap;