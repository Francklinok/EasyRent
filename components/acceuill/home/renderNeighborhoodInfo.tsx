// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { ThemedView } from "@/components/ui/ThemedView";
// import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";
// import { ThemedText } from "@/components/ui/ThemedText";
// import { ItemType, FeatureIcon } from "@/types/ItemType";
// import { useTheme } from "@/components/contexts/theme/themehook";
// import { LinearGradient } from 'expo-linear-gradient';

// interface ExtendedItemType extends ItemType {
//   features: FeatureIcon[];
//   energyScore: number;
//   virtualTourAvailable: boolean;
//   distanceToAmenities?: {
//     schools: number;
//     healthcare: number;
//     shopping: number;
//     transport: number;
//   };
//   aiRecommendation: string;
// }

// const RenderNeighborhoodInfo = (item: ExtendedItemType) => {
//   const { theme } = useTheme();
  
//   const amenities = [
//     {
//       icon: 'school',
//       iconSet: 'MaterialIcons',
//       label: 'Écoles',
//       distance: item.distanceToAmenities?.schools ?? 0,
//       color: '#4F46E5',
//       gradient: ['#4F46E5', '#7C3AED']
//     },
//     {
//       icon: 'medical-services',
//       iconSet: 'MaterialIcons',
//       label: 'Santé',
//       distance: item.distanceToAmenities?.healthcare ?? 0,
//       color: '#EF4444',
//       gradient: ['#EF4444', '#F97316']
//     },
//     {
//       icon: 'shopping-bag',
//       iconSet: 'FontAwesome5',
//       label: 'Shopping',
//       distance: item.distanceToAmenities?.shopping ?? 0,
//       color: '#10B981',
//       gradient: ['#10B981', '#059669']
//     },
//     {
//       icon: 'train',
//       iconSet: 'FontAwesome5',
//       label: 'Transport',
//       distance: item.distanceToAmenities?.transport ?? 0,
//       color: '#8B5CF6',
//       gradient: ['#8B5CF6', '#A855F7']
//     }
//   ];

//   const getEnergyColor = (score: number) => {
//     if (score >= 80) return ['#10B981', '#059669'];
//     if (score >= 60) return ['#F59E0B', '#D97706'];
//     if (score >= 40) return ['#F97316', '#EA580C'];
//     return ['#EF4444', '#DC2626'];
//   };

//   const getEnergyLabel = (score: number) => {
//     if (score >= 80) return 'Excellente';
//     if (score >= 60) return 'Bonne';
//     if (score >= 40) return 'Moyenne';
//     return 'À améliorer';
//   };

//   const isDark = theme.dark;

//   return (
//     <ThemedView style={[
//       styles.container,
//       { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }
//     ]}>
//       {/* Header avec score énergétique */}
//       <View style={styles.header}>
//         <View style={styles.energySection}>
//           <LinearGradient
//             colors={getEnergyColor(item.energyScore)}
//             style={styles.energyBadge}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//           >
//             <Ionicons 
//               name="flash" 
//               size={16} 
//               color="white" 
//             />
//             <Text style={styles.energyScore}>{item.energyScore}</Text>
//           </LinearGradient>
//           <Text style={[
//             styles.energyLabel,
//             { color: isDark ? '#E5E7EB' : '#6B7280' }
//           ]}>
//             {getEnergyLabel(item.energyScore)}
//           </Text>
//         </View>

//         {item.virtualTourAvailable && (
//           <View style={styles.virtualTourBadge}>
//             <LinearGradient
//               colors={['#6366F1', '#8B5CF6']}
//               style={styles.virtualTourGradient}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 1 }}
//             >
//               <MaterialIcons name="360" size={14} color="white" />
//               <Text style={styles.virtualTourText}>Visite 360°</Text>
//             </LinearGradient>
//           </View>
//         )}
//       </View>

//       {/* Titre de section */}
//       <View style={styles.sectionHeader}>
//         <View style={[
//           styles.sectionIndicator,
//           { backgroundColor: isDark ? '#4F46E5' : '#6366F1' }
//         ]} />
//         <ThemedText style={[
//           styles.sectionTitle,
//           { color: isDark ? '#F9FAFB' : '#111827' }
//         ]}>
//           Proximité des services
//         </ThemedText>
//       </View>

//       {/* Grille des commodités */}
//       <View style={styles.amenitiesGrid}>
//         {amenities.map((amenity, index) => (
//           <View key={index} style={[
//             styles.amenityCard,
//             { 
//               backgroundColor: isDark ? '#374151' : '#F9FAFB',
//               shadowColor: isDark ? '#000000' : '#6B7280'
//             }
//           ]}>
//             <LinearGradient
//               colors={amenity.gradient}
//               style={styles.amenityIconContainer}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 1 }}
//             >
//               {amenity.iconSet === 'FontAwesome5' ? (
//                 <FontAwesome5 
//                   name={amenity.icon} 
//                   size={16} 
//                   color="white" 
//                 />
//               ) : (
//                 <MaterialIcons 
//                   name={amenity.icon} 
//                   size={18} 
//                   color="white" 
//                 />
//               )}
//             </LinearGradient>
            
//             <View style={styles.amenityInfo}>
//               <Text style={[
//                 styles.amenityLabel,
//                 { color: isDark ? '#E5E7EB' : '#374151' }
//               ]}>
//                 {amenity.label}
//               </Text>
//               <Text style={[
//                 styles.amenityDistance,
//                 { color: isDark ? '#9CA3AF' : '#6B7280' }
//               ]}>
//                 {amenity.distance > 0 ? `${amenity.distance} km` : 'N/A'}
//               </Text>
//             </View>
//           </View>
//         ))}
//       </View>

//       {/* Recommandation IA */}
//       {item.aiRecommendation && (
//         <View style={[
//           styles.aiRecommendation,
//           { 
//             backgroundColor: isDark ? '#1E293B' : '#F0F9FF',
//             borderColor: isDark ? '#3B82F6' : '#0EA5E9' 
//           }
//         ]}>
//           <View style={styles.aiHeader}>
//             <LinearGradient
//               colors={['#0EA5E9', '#3B82F6']}
//               style={styles.aiIcon}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 1 }}
//             >
//               <MaterialIcons name="auto-awesome" size={14} color="white" />
//             </LinearGradient>
//             <Text style={[
//               styles.aiTitle,
//               { color: isDark ? '#60A5FA' : '#0369A1' }
//             ]}>
//               Recommandation IA
//             </Text>
//           </View>
//           <Text style={[
//             styles.aiText,
//             { color: isDark ? '#CBD5E1' : '#475569' }
//           ]}>
//             {item.aiRecommendation}
//           </Text>
//         </View>
//       )}
//     </ThemedView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     borderRadius: 20,
//     padding: 20,
//     marginVertical: 8,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 5,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   energySection: {
//     alignItems: 'center',
//   },
//   energyBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     gap: 4,
//   },
//   energyScore: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '700',
//   },
//   energyLabel: {
//     fontSize: 12,
//     marginTop: 4,
//     fontWeight: '500',
//   },
//   virtualTourBadge: {
//     borderRadius: 16,
//     overflow: 'hidden',
//   },
//   virtualTourGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     gap: 4,
//   },
//   virtualTourText: {
//     color: 'white',
//     fontSize: 11,
//     fontWeight: '600',
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//     gap: 10,
//   },
//   sectionIndicator: {
//     width: 4,
//     height: 20,
//     borderRadius: 2,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   amenitiesGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 12,
//     marginBottom: 20,
//   },
//   amenityCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//     minWidth: '45%',
//     padding: 12,
//     borderRadius: 16,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   amenityIconContainer: {
//     width: 32,
//     height: 32,
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 10,
//   },
//   amenityInfo: {
//     flex: 1,
//   },
//   amenityLabel: {
//     fontSize: 13,
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   amenityDistance: {
//     fontSize: 11,
//     fontWeight: '500',
//   },
//   aiRecommendation: {
//     borderRadius: 16,
//     padding: 16,
//     borderWidth: 1,
//   },
//   aiHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//     gap: 8,
//   },
//   aiIcon: {
//     width: 24,
//     height: 24,
//     borderRadius: 6,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   aiTitle: {
//     fontSize: 14,
//     fontWeight: '700',
//   },
//   aiText: {
//     fontSize: 13,
//     lineHeight: 18,
//     fontWeight: '400',
//   },
// });

// export default RenderNeighborhoodInfo;
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedView } from "@/components/ui/ThemedView";
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ui/ThemedText";
import { ItemType, FeatureIcon } from "@/types/ItemType";
import { useTheme } from "@/components/contexts/theme/themehook";
import { LinearGradient } from 'expo-linear-gradient';

interface ExtendedItemType extends ItemType {
  features: FeatureIcon[];
  energyScore: number;
  virtualTourAvailable: boolean;
  distanceToAmenities?: {
    schools: number;
    healthcare: number;
    shopping: number;
    transport: number;
  };
  aiRecommendation: string;
}

const RenderNeighborhoodInfo = (item: ExtendedItemType) => {
  const { theme } = useTheme();
  
  const amenities = [
    {
      icon: 'school',
      iconSet: 'MaterialIcons',
      distance: item.distanceToAmenities?.schools ?? 0,
      color: '#4F46E5',
    },
    {
      icon: 'medical-services',
      iconSet: 'MaterialIcons',
      distance: item.distanceToAmenities?.healthcare ?? 0,
      color: '#EF4444',
    },
    {
      icon: 'shopping-bag',
      iconSet: 'FontAwesome5',
      distance: item.distanceToAmenities?.shopping ?? 0,
      color: '#10B981',
    },
    {
      icon: 'train',
      iconSet: 'FontAwesome5',
      distance: item.distanceToAmenities?.transport ?? 0,
      color: '#8B5CF6',
    }
  ];

  const getEnergyColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    if (score >= 40) return '#F97316';
    return '#EF4444';
  };

  const isDark = theme.dark;

  return (
    <View style={styles.compactContainer}>
      {/* Ligne compacte avec score énergétique et commodités */}
      <View style={styles.compactRow}>
        {/* Score énergétique compact */}
        <View style={[
          styles.compactEnergyBadge,
          { backgroundColor: getEnergyColor(item.energyScore) }
        ]}>
          <Ionicons name="flash" size={10} color="white" />
          <Text style={styles.compactEnergyText}>{item.energyScore}</Text>
        </View>

        {/* Commodités en ligne */}
        <View style={styles.compactAmenities}>
          {amenities.slice(0, 4).map((amenity, index) => (
            <View key={index} style={[
              styles.compactAmenityItem,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
            ]}>
              {amenity.iconSet === 'FontAwesome5' ? (
                <FontAwesome5 
                  name={amenity.icon} 
                  size={10} 
                  color={amenity.color} 
                />
              ) : (
                <MaterialIcons 
                  name={amenity.icon} 
                  size={12} 
                  color={amenity.color} 
                />
              )}
              <Text style={[
                styles.compactDistance,
                { color: isDark ? '#9CA3AF' : '#6B7280' }
              ]}>
                {amenity.distance > 0 ? `${amenity.distance}km` : '-'}
              </Text>
            </View>
          ))}
        </View>

        {/* Badge visite virtuelle compact */}
        {item.virtualTourAvailable && (
          <View style={styles.compactVRBadge}>
            <MaterialIcons name="360" size={12} color="#6366F1" />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    marginVertical: 4,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  compactEnergyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 8,
    gap: 2,
  },
  compactEnergyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  compactAmenities: {
    flexDirection: 'row',
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  compactAmenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
    minWidth: 40,
  },
  compactDistance: {
    fontSize: 9,
    fontWeight: '600',
  },
  compactVRBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default RenderNeighborhoodInfo;