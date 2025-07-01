// import React, { useEffect, useRef, useState } from "react";
// import { ScrollView, TouchableOpacity, Animated } from "react-native";
// import * as Haptics from "expo-haptics";
// import { MotiView } from "moti";
// import { ThemedView } from "@/components/ui/ThemedView";
// import { ThemedText } from "@/components/ui/ThemedText";
// import { useTheme } from "@/components/contexts/theme/themehook";
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// <MaterialCommunityIcons name="bed" size={26} color="blue" />

// type PropertyType =
//   | "All"
//   | "Villa"
//   | "Appartement"
//   | "Maison"
//   | "Penthouse"
//   | "Studio"
//   | "Loft"
//   | "Bureau"
//   | "Chalet"
//   | "Hôtel"
// ;

// const propertyLabels: Record<PropertyType, string> = {
//   All: "Tous",
//   Villa: "Villa",
//   Appartement: "Appartement",
//   Maison: "Maison",
//   Penthouse: "Penthouse",
//   Studio: "Studio",
//   Loft: "Loft",
//   Bureau: "Bureau",
//   Chalet: "Chalet",
//   Hôtel: "Hôtel",

// };

// const getIcon = (type: PropertyType, isSelected: boolean, color: string) => {
//   const size = 28;
//   const iconColor = color;

//   switch (type) {
//     case "All":
//       return <MaterialCommunityIcons name="apps" size={size} color={iconColor} />;
//     case "Villa":
//       return <MaterialCommunityIcons name="home-city" size={size} color={iconColor} />;
//     case "Maison":
//       return <MaterialCommunityIcons name="home" size={size} color={iconColor} />;
//     case "Appartement":
//       return <MaterialCommunityIcons name="office-building" size={size} color={iconColor} />;
//     case "Penthouse":
//       return <MaterialCommunityIcons name="home-modern" size={size} color={iconColor} />;
//     case "Studio":
//       return <MaterialCommunityIcons name="home-floor-1" size={size} color={iconColor} />;
//     case "Loft":
//       return <MaterialCommunityIcons name="home-variant" size={size} color={iconColor} />;
//     case "Bureau":
//       return <MaterialCommunityIcons name="domain" size={size} color={iconColor} />;
//     case "Chalet":
//       return <MaterialCommunityIcons name="home-group" size={size} color={iconColor} />;
//     default:
//       return <MaterialCommunityIcons name="home-outline" size={size} color={iconColor} />;
//     case "Hôtel":
//       return <MaterialCommunityIcons name="bed" size={size} color={iconColor} />;
//   }
  
// };


// const RenderCategoryTabs = () => {
//   const { theme } = useTheme();
//   const [selectedCategory, setSelectedCategory] = useState<PropertyType>("All");
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const scrollRef = useRef<ScrollView | null>(null);

//   useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 700,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   useEffect(() => {
//     const index = Object.keys(propertyLabels).indexOf(selectedCategory);
//     if (scrollRef.current && index !== -1) {
//       scrollRef.current.scrollTo({ x: index * 45 - 40, animated: true });
//     }
//   }, [selectedCategory]);

//   const handleCategorySelect = (category: PropertyType) => {
//     setSelectedCategory(category);
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//   };

//   return (
//     <Animated.View
//       style={{
//         opacity: fadeAnim,
//         transform: [
//           {
//             translateY: fadeAnim.interpolate({
//               inputRange: [0, 1],
//               outputRange: [10, -10],
//             }),
//           },
//         ],
//       }}
//     >
//       <ScrollView
//         ref={scrollRef}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}
//       >
//         {Object.entries(propertyLabels).map(([key, label], index) => {
//           const category = key as PropertyType;
//           const isSelected = selectedCategory === category;
//           const color = isSelected ?theme.input.focus  : theme.typography.caption;
//           const bg = isSelected?theme.input.focus  : theme.text

//           return (
//             <MotiView
//               key={category}
//               from={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: index * 50, type: "spring" }}
//               className="items-center"
//             >
//               <TouchableOpacity onPress={() => handleCategorySelect(category)} activeOpacity={0.8}>
//                 <ThemedView className="items-center p-1">
//                   <ThemedView className="rounded-full p-1" style={{ borderColor: color }}>
//                     {getIcon(category, isSelected, color)}
//                   </ThemedView>
//                   <ThemedText type = "caption" variant='secondary' intensity="normal" style={{ color, marginTop: 1, textAlign: "center" }}>
//                     {label}
//                   </ThemedText>
//                 </ThemedView>
//               </TouchableOpacity>
//             </MotiView>
//           );
//         })}
//       </ScrollView>
//     </Animated.View>
//   );
// };

// export default RenderCategoryTabs;



// import React, { useEffect, useRef, useState } from "react";
// import {
//   ScrollView,
//   TouchableOpacity,
//   Animated,
//   Dimensions,
// } from "react-native";
// import * as Haptics from "expo-haptics";
// import { MotiView } from "moti";
// import { ThemedView } from "@/components/ui/ThemedView";
// import { ThemedText } from "@/components/ui/ThemedText";
// import { useTheme } from "@/components/contexts/theme/themehook";
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// type TransactionType = "VENTE" | "LOCATION";
// const displayModes = ["grid", "list"] as const;

// type DisplayMode = typeof displayModes[number];

// type PropertyType =
//   | "All"
//   | "Villa"
//   | "Appartement"
//   | "Maison"
//   | "Penthouse"
//   | "Studio"
//   | "Loft"
//   | "Bureau"
//   | "Chalet"
//   | "Hôtel"
//   | "Terrain"
//   | "Commercial";

// const transactionLabels: Record<TransactionType, string> = {
//   LOCATION: "Location",
//   VENTE: "Vente",

// };

// const propertyLabels: Record<PropertyType, string> = {
//   All: "Tous",
//   Villa: "Villa",
//   Appartement: "Appartement",
//   Maison: "Maison",
//   Penthouse: "Penthouse",
//   Studio: "Studio",
//   Loft: "Loft",
//   Bureau: "Bureau",
//   Chalet: "Chalet",
//   Hôtel: "Hôtel",
//   Terrain: "Terrain",
//   Commercial: "Commercial",
// };

// const getPropertyIcon = (type: PropertyType) => {
//   const size = 14;
//   switch (type) {
//     case "All": return <MaterialCommunityIcons name="apps" size={size} />;
//     case "Villa": return <MaterialCommunityIcons name="home-city-outline" size={size} />;
//     case "Maison": return <MaterialCommunityIcons name="home-outline" size={size} />;
//     case "Appartement": return <MaterialCommunityIcons name="office-building-outline" size={size} />;
//     case "Penthouse": return <MaterialCommunityIcons name="home-modern" size={size} />;
//     case "Studio": return <MaterialCommunityIcons name="home-floor-1" size={size} />;
//     case "Loft": return <MaterialCommunityIcons name="home-variant-outline" size={size} />;
//     case "Bureau": return <MaterialCommunityIcons name="domain" size={size} />;
//     case "Chalet": return <MaterialCommunityIcons name="home-group" size={size} />;
//     case "Hôtel": return <MaterialCommunityIcons name="bed-outline" size={size} />;
//     case "Terrain": return <MaterialCommunityIcons name="pine-tree" size={size} />;
//     case "Commercial": return <MaterialCommunityIcons name="store-outline" size={size} />;
//     default: return <MaterialCommunityIcons name="home-outline" size={size} />;
//   }
// };

// const RenderCategoryTabs = () => {
//   const { theme } = useTheme();
//   const [selectedTransaction, setSelectedTransaction] = useState<TransactionType>("VENTE");
//   const [selectedProperty, setSelectedProperty] = useState<PropertyType>("All");
//   const [viewMode, setViewMode] = useState<DisplayMode>("grid");

//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const scrollRef = useRef<ScrollView>(null);

//   useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 600,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   const handleTransactionSelect = (transaction: TransactionType) => {
//     setSelectedTransaction(transaction);
//     setSelectedProperty("All");
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//   };

//   const handlePropertySelect = (property: PropertyType) => {
//     setSelectedProperty(property);
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     const properties = Object.keys(propertyLabels) as PropertyType[];
//     const index = properties.indexOf(property);
//     if (scrollRef.current && index !== -1) {
//       scrollRef.current.scrollTo({ x: index * 85 - SCREEN_WIDTH / 2 + 42.5, animated: true });
//     }
//   };

//   const toggleViewMode = () => setViewMode((prev) => (prev === "grid" ? "list" : "grid"));

//   return (
//     <Animated.View style={{ opacity: fadeAnim }}>
//       {/* Transaction & View Mode Aligned */}
//       <ThemedView className="px-2 mb-2">
//         <ThemedView className="flex-row items-center justify-between">
//           <ThemedView className="flex-row gap-3">
//             {Object.entries(transactionLabels).map(([key, label]) => {
//               const transaction = key as TransactionType;
//               const isSelected = selectedTransaction === transaction;
//               return (
//                 <TouchableOpacity
//                   key={transaction}
//                   onPress={() => handleTransactionSelect(transaction)}
//                   activeOpacity={0.8}
//                 >
//                   <ThemedView
//                     className="flex-row items-center px-10 py-2 rounded-2xl"
//                     style={{
//                       backgroundColor: isSelected ? theme.input.disabled : theme.surfaceVariant,
//                     }}
//                   >
//                     <MaterialCommunityIcons
//                       name={transaction === "VENTE" ? "currency-usd" : "key-outline"}
//                       size={18}
//                       color={isSelected ? theme.onSurface : theme.typography.body}
//                       style={{ marginRight: 6, }}
//                     />
//                     <ThemedText
//                       type="body"
//                       style={{ color: isSelected ? theme.onSurface  : theme.typography.body }}
//                     >
//                       {label}
//                     </ThemedText>
//                   </ThemedView>
//                 </TouchableOpacity>
//               );
//             })}
//           </ThemedView>
//           <TouchableOpacity onPress={toggleViewMode}   style={{
//               marginLeft: 1,
//               backgroundColor: theme.surface,
//               padding: 4,
//               justifyContent: "center",
//               alignItems: "center",
//             }}>
//             <MaterialCommunityIcons
//               name={viewMode === "grid" ? "view-grid-outline" : "view-list"}
//               size={26}
//               color={theme.typography.body}          
//             />
//           </TouchableOpacity>
//         </ThemedView>
//       </ThemedView>

//       {/* Property type selection */}
//       <ThemedView className="mb-1">
//         <ScrollView
//           ref={scrollRef}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           className="px-2 "
//           contentContainerStyle={{ gap: 8 }}
//         >
//           {Object.entries(propertyLabels).map(([key, label], index) => {
//             const property = key as PropertyType;
//             const isSelected = selectedProperty === property;
//             return (
//               <MotiView
//                 key={property}
//                 from={{ opacity: 0, translateY: 20 }}
//                 animate={{ opacity: 1, translateY: 0 }}
//                 transition={{ delay: index * 30, type: "timing", duration: 400 }}
//                 style = {{backgroundColor:theme.surfaceVariant}}
//               >
//                 <TouchableOpacity onPress={() => handlePropertySelect(property)} activeOpacity={0.8}>
//                   <ThemedView
//                     className="px-2 py-1 rounded-2xl flex-row items-center justify-center"
//                     style={{
//                       // backgroundColor: isSelected ? theme.input.focus : theme.surfaceVariant,
//                     }}
//                   >
//                     <ThemedView className="mr-1">
//                       {React.cloneElement(getPropertyIcon(property), {
//                         color: isSelected ? theme.input.focus: theme.typography.body,
//                       })}
//                     </ThemedView>
//                     <ThemedText
//                       type="caption"
//                       intensity="normal"
//                       variant={isSelected ? "primary" : "secondary"}
//                       style={{ color: isSelected ? theme.input.focus : theme.typography.body }}
//                     >
//                       {label}
//                     </ThemedText>
//                   </ThemedView>
//                 </TouchableOpacity>
//               </MotiView>
//             );
//           })}
//         </ScrollView>
//       </ThemedView>
//     </Animated.View>
//   );
// };

// export default RenderCategoryTabs;
import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet, // Added for more complex styling
} from "react-native";
import * as Haptics from "expo-haptics";
import { MotiView, useAnimationState } from "moti"; // Imported useAnimationState for more control
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";
import { useTheme } from "@/components/contexts/theme/themehook";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TransactionType = "VENTE" | "LOCATION";
const displayModes = ["grid", "list"] as const;

type DisplayMode = typeof displayModes[number];

type PropertyType =
  | "All"
  | "Villa"
  | "Appartement"
  | "Maison"
  | "Penthouse"
  | "Studio"
  | "Loft"
  | "Bureau"
  | "Chalet"
  | "Hôtel"
  | "Terrain"
  | "Commercial";

const transactionLabels: Record<TransactionType, string> = {
  LOCATION: "Location",
  VENTE: "Vente",
};

const propertyLabels: Record<PropertyType, string> = {
  All: "Tous",
  Villa: "Villa",
  Appartement: "Appartement",
  Maison: "Maison",
  Penthouse: "Penthouse",
  Studio: "Studio",
  Loft: "Loft",
  Bureau: "Bureau",
  Chalet: "Chalet",
  Hôtel: "Hôtel",
  Terrain: "Terrain",
  Commercial: "Commercial",
};

const getPropertyIcon = (type: PropertyType) => {
  const size = 16; // Slightly increased size for better visibility
  switch (type) {
    case "All": return <MaterialCommunityIcons name="apps" size={size} />;
    case "Villa": return <MaterialCommunityIcons name="home-city-outline" size={size} />;
    case "Maison": return <MaterialCommunityIcons name="home-outline" size={size} />;
    case "Appartement": return <MaterialCommunityIcons name="office-building-outline" size={size} />;
    case "Penthouse": return <MaterialCommunityIcons name="home-modern" size={size} />;
    case "Studio": return <MaterialCommunityIcons name="home-floor-1" size={size} />;
    case "Loft": return <MaterialCommunityIcons name="home-variant-outline" size={size} />;
    case "Bureau": return <MaterialCommunityIcons name="domain" size={size} />;
    case "Chalet": return <MaterialCommunityIcons name="home-group" size={size} />;
    case "Hôtel": return <MaterialCommunityIcons name="bed-outline" size={size} />;
    case "Terrain": return <MaterialCommunityIcons name="pine-tree" size={size} />;
    case "Commercial": return <MaterialCommunityIcons name="store-outline" size={size} />;
    default: return <MaterialCommunityIcons name="home-outline" size={size} />;
  }
};

const RenderCategoryTabs = () => {
  const { theme } = useTheme();
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionType>("VENTE");
  const [selectedProperty, setSelectedProperty] = useState<PropertyType>("All");
  const [viewMode, setViewMode] = useState<DisplayMode>("grid");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  // Animation state for property type selection underline
  const propertyUnderlineAnimation = useAnimationState({
    active: { opacity: 1, scaleX: 1 },
    inactive: { opacity: 0, scaleX: 0.8 },
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleTransactionSelect = (transaction: TransactionType) => {
    setSelectedTransaction(transaction);
    setSelectedProperty("All"); // Reset property type when transaction changes
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePropertySelect = (property: PropertyType) => {
    setSelectedProperty(property);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const properties = Object.keys(propertyLabels) as PropertyType[];
    const index = properties.indexOf(property);
    // Scroll to center the selected property, with a slight offset for padding
    if (scrollRef.current && index !== -1) {
      // Calculate item width (approximate, adjust based on actual content and padding)
      const itemWidth = 100; // Average width of a property tab, you might need to fine-tune this
      const scrollPosition = (index * itemWidth) - (SCREEN_WIDTH / 2) + (itemWidth / 2);
      scrollRef.current.scrollTo({ x: scrollPosition, animated: true });
    }
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {/* Transaction & View Mode Aligned */}
      <ThemedView className="px-4 mb-2"> {/* Increased horizontal padding and margin-bottom */}
        <ThemedView className="flex-row items-center justify-between">
          <ThemedView className="flex-row gap-4"> {/* Increased gap for better visual separation */}
            {Object.entries(transactionLabels).map(([key, label]) => {
              const transaction = key as TransactionType;
              const isSelected = selectedTransaction === transaction;
              return (
                <TouchableOpacity
                  key={transaction}
                  onPress={() => handleTransactionSelect(transaction)}
                  activeOpacity={0.7} 
                  style={{
                    borderRadius: 25, 
                    paddingVertical: 2,
                    paddingHorizontal: 10,
                    backgroundColor: isSelected ? theme.surface : theme.surface, 
                  }}
                >
                  <ThemedView
                    className="flex-row items-center"
                    style={{ backgroundColor: 'transparent' }} // Ensure background is transparent to show parent TouchableOpacity's background
                  >
                    <MaterialCommunityIcons
                      name={transaction === "VENTE" ? "currency-usd" : "key-outline"}
                      size={20} 
                      color={isSelected ? theme.primary : theme.typography.body} // White for selected, body for unselected
                      style={{ marginRight: 4,   marginLeft:14 }} // Increased margin
                    />
                    <ThemedText
                      type="subtitle"
                      intensity={isSelected? "strong":'light'}
                      scaleFactor={0.005}
                      style={{ color: isSelected ? theme.primary: theme.typography.body }} 
                    >
                      {label}
                    </ThemedText>
                  </ThemedView>
                </TouchableOpacity>
              );
            })}
          </ThemedView>
          <TouchableOpacity
            onPress={toggleViewMode}
            activeOpacity={0.7}
            style={{
              backgroundColor: theme.surface,
              padding: 8, // Increased padding
              borderRadius: 15, // Rounded edges
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name={viewMode === "grid" ? "view-grid-outline" : "view-list"}
              size={28} // Larger icon
              color={theme.typography.body}
            />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Property type selection */}
      <ThemedView className="mb-4"> {/* Increased margin-bottom */}
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4" // Increased horizontal padding
          contentContainerStyle={{ gap: 10 }} // Increased gap between items
        >
          {Object.entries(propertyLabels).map(([key, label], index) => {
            const property = key as PropertyType;
            const isSelected = selectedProperty === property;
            return (
              <MotiView
                key={property}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 40, type: "timing", duration: 400 }} // Slightly increased delay for a smoother staggered animation
                // Add MotiView animation for press feedback on the inner TouchableOpacity instead
              >
                <TouchableOpacity
                  onPress={() => handlePropertySelect(property)}
                  activeOpacity={0.8}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 20, // More rounded pills
                    backgroundColor: theme.surfaceVariant, // Consistent background
                    // No direct background change here, let the inner MotiView handle visual feedback
                  }}
                >
                  <MotiView
                    from={{ scale: 1 }}
                    animate={{ scale: isSelected ? 1.05 : 1 }} // Slight scale up when selected
                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ThemedView className="mr-2" style={{ backgroundColor: 'transparent' }}> {/* Increased margin */}
                      {React.cloneElement(getPropertyIcon(property), {
                        color: isSelected ? theme.primary : theme.typography.body, // Primary color for selected icon
                      })}
                    </ThemedView>
                    <ThemedText
                      type="caption"
                      intensity="normal"
                      style={{ color: isSelected ? theme.primary : theme.typography.body, fontWeight: isSelected ? 'bold' : 'normal' }} // Bold text for selected
                    >
                      {label}
                    </ThemedText>
                  </MotiView>
                  {isSelected && (
                    <MotiView
                      from={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                      style={{
                        height: 2,
                        backgroundColor: theme.primary, // Underline color
                        position: 'absolute',
                        bottom: 0,
                        left: '10%', // Adjust to center under the text/icon
                        right: '10%', // Adjust to center under the text/icon
                        borderRadius: 1,
                      }}
                    />
                  )}
                </TouchableOpacity>
              </MotiView>
            );
          })}
        </ScrollView>
      </ThemedView>
    </Animated.View>
  );
};

export default RenderCategoryTabs;