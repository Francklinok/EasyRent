import React, { useEffect, useRef, useState } from "react";
import { ScrollView, TouchableOpacity, Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";
import { useTheme } from "@/components/contexts/theme/themehook";
import Svg, { Path, Rect, Circle } from "react-native-svg";


type PropertyType =
  | "All"
  | "Villa"
  | "Appartement"
  | "Hôtel"
  | "Maison"
  | "Penthouse"
  | "Studio"
  | "Loft"
  | "Bureau"
  | "Chalet";

interface ThemeType {
  text: string;
  inputBackground?: string;
  [key: string]: any; // Si d'autres propriétés sont présentes
}

interface PropertyIconProps {
  type: PropertyType;
  isSelected: boolean;
  size?: number;
  theme: ThemeType;
}

interface CategoryData {
  [key in PropertyType]: {
    colors: [string, string];
    name: string;
  };
}

const PropertyIcon:React.FC<PropertyIconProps> =  ({ type, isSelected, size = 24, theme }) => {
  const iconColor = isSelected ? '#FFFFFF' : theme.text;
  const iconSize = size;

  const icons:Record<PropertyType, JSX.Element> = {
    All: (
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <Path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" 
              stroke={iconColor} strokeWidth="2" fill={isSelected ? iconColor : 'none'} />
      </Svg>
    ),
    Villa: (
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <Path d="M3 21h18M4 21V10l8-6 8 6v11M9 21v-8h6v8" 
              stroke={iconColor} strokeWidth="2" fill="none" />
        <Path d="M12 4l-8 6h16l-8-6z" fill={isSelected ? iconColor : 'none'} stroke={iconColor} />
      </Svg>
    ),
    Appartement: (
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="3" width="18" height="18" rx="2" 
              stroke={iconColor} strokeWidth="2" fill={isSelected ? iconColor : 'none'}/>
        <Path d="M9 9h6M9 13h6M9 17h6" 
              stroke={isSelected ? '#FFFFFF' : iconColor} strokeWidth="1.5" />
      </Svg>
    ),
    Hôtel: (
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="6" width="18" height="15" rx="2" 
              stroke={iconColor} strokeWidth="2" fill={isSelected ? iconColor : 'none'}/>
        <Path d="M7 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" 
              stroke={iconColor} strokeWidth="2" fill="none"/>
        <Path d="M8 11h1M11 11h1M14 11h1M8 15h1M11 15h1M14 15h1" 
              stroke={isSelected ? '#FFFFFF' : iconColor} strokeWidth="1.5"/>
        <Circle cx="12" cy="3" r="1" fill="#fbbf24"/>
      </Svg>
    ),
    Maison: (
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <Path d="M3 21h18M5 21V7l7-4 7 4v14M10 21V15h4v6" 
              stroke={iconColor} strokeWidth="2" fill="none" />
        <Circle cx="12" cy="11" r="2" stroke={iconColor} strokeWidth="1.5" 
                fill={isSelected ? iconColor : 'none'}/>
      </Svg>
    ),
    Penthouse: (
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <Path d="M2 20h20M4 20V8l8-6 8 6v12" stroke={iconColor} strokeWidth="2" fill="none"/>
        <Path d="M12 2l-8 6h16l-8-6z" fill={isSelected ? iconColor : 'none'} stroke={iconColor}/>
        <Rect x="9" y="13" width="6" height="7" stroke={iconColor} strokeWidth="1.5" 
              fill={isSelected ? iconColor : 'none'}/>
        <Circle cx="12" cy="6" r="1" fill="#fbbf24"/>
      </Svg>
    ),
    Studio: (
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <Rect x="4" y="4" width="16" height="16" rx="2" 
              stroke={iconColor} strokeWidth="2" fill={isSelected ? iconColor : 'none'}/>
        <Path d="M8 8h8M8 12h8M8 16h4" 
              stroke={isSelected ? '#FFFFFF' : iconColor} strokeWidth="1.5" />
        <Circle cx="16" cy="16" r="1" fill={isSelected ? '#FFFFFF' : iconColor}/>
      </Svg>
    ),
    Loft: (
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="8" width="18" height="13" 
              stroke={iconColor} strokeWidth="2" fill={isSelected ? iconColor : 'none'}/>
        <Path d="M3 8l9-5 9 5" stroke={iconColor} strokeWidth="2" fill="none" />
        <Rect x="7" y="13" width="3" height="5" 
              stroke={isSelected ? '#FFFFFF' : iconColor} strokeWidth="1" fill="none"/>
        <Rect x="14" y="13" width="3" height="5" 
              stroke={isSelected ? '#FFFFFF' : iconColor} strokeWidth="1" fill="none"/>
      </Svg>
    ),
    Bureau: (
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="4" width="18" height="16" rx="2" 
              stroke={iconColor} strokeWidth="2" fill={isSelected ? iconColor : 'none'}/>
        <Path d="M3 10h18M9 4v16M15 4v16" 
              stroke={isSelected ? '#FFFFFF' : iconColor} strokeWidth="1.5"/>
        <Circle cx="6" cy="7" r="1" fill={isSelected ? '#FFFFFF' : iconColor}/>
        <Circle cx="12" cy="7" r="1" fill={isSelected ? '#FFFFFF' : iconColor}/>
        <Circle cx="18" cy="7" r="1" fill={isSelected ? '#FFFFFF' : iconColor}/>
      </Svg>
    ),
    Chalet: (
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <Path d="M3 20h18M4 20V12l8-8 8 8v8" stroke={iconColor} strokeWidth="2" fill="none"/>
        <Path d="M12 4L4 12h16L12 4z" fill={isSelected ? iconColor : 'none'} stroke={iconColor}/>
        <Rect x="9" y="14" width="6" height="6" stroke={iconColor} strokeWidth="1.5" fill="none"/>
        <Path d="M7 12l5-3 5 3" stroke={iconColor} strokeWidth="1" fill="none"/>
      </Svg>
    )
  };

  return icons[type] || icons.All;
};

const categoryData:CategoryData = {
  All: { 
    colors: ['#64778b', '#575560'],
    name: 'Tous'
  },
  Villa: { 
    colors: ['#10b981', '#0d9488'],
    name: 'Villa'
  },
  Appartement: { 
    colors: ['#3b82f6', '#4f46e5'],
    name: 'Appartement'
  },
  Hôtel: { 
    colors: ['#8b5cf6', '#7c3aed'],
    name: 'Hôtel'
  },
  Maison: { 
    colors: ['#f97316', '#dc2626'],
    name: 'Maison'
  },
  Penthouse: { 
    colors: ['#eab308', '#d97706'],
    name: 'Penthouse'
  },
  Studio: { 
    colors: ['#ec4899', '#e11d48'],
    name: 'Studio'
  },
  Loft: { 
    colors: ['#06b6d4', '#3b82f6'],
    name: 'Loft'
  },
  Bureau: { 
    colors: ['#6b7280', '#4b5563'],
    name: 'Bureau'
  },
  Chalet: { 
    colors: ['#22c55e', '#10b981'],
    name: 'Chalet'
  },
};


// ... (PropertyIcon et categoryData identiques)

const RenderCategoryTabs = () => {
  const { theme } = useTheme();
  const categories = Object.keys(categoryData);
  const [selectedCategory, setSelectedCategory] = useState<PropertyType>("All");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const index = categories.indexOf(selectedCategory);
    if (scrollRef.current && index !== -1) {
      scrollRef.current.scrollTo({ x: index * 45 - 40, animated: true });
    }
  }, [selectedCategory]);

  const handleCategorySelect = (category:PropertyType) => {
    setSelectedCategory(category);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <Animated.View
      // className="relative px-2"
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [10, -10],
            }),
          },
        ],
      }}
    >
      {/* Gradient ou effet de fond */}
      {/* <ThemedView className="absolute inset-0 rounded-2xl opacity-30" /> */}

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-1 px-1 "
      >
        {categories.map((category, index) => {
          const isSelected = selectedCategory === category;
          const info = categoryData[category];

          return (
            <MotiView
              key={category}
              from={{ opacity: 0, scale: 0.8, rotateY: "45deg" }}
              animate={{
                opacity: 1,
                // scale: isSelected ? 1.1 : 1,
                rotateY: "0deg",
              }}
              transition={{
                delay: index * 60,
                type: "spring",
                damping: 12,
                stiffness: 120,
              }}
              className="items-center "
            >
              <TouchableOpacity
                onPress={() => handleCategorySelect(category)}
                activeOpacity={0.9}
                // className={`items-center justify-center px-3 py-2 rounded-xl relative ${
                //   isSelected ? "" : "bg-white/80 dark:bg-black/20"
                // }`}
                // style={{
                //   // backgroundColor: isSelected
                //   //   ? info.colors[0]
                //   //   : theme.cardBackground,
                //   // shadowColor: isSelected ? info.colors[0] : "#000",
                //   shadowOpacity: isSelected ? 0.3 : 0.05,
                // }}
              >
                {/* Effet glow */}
                {isSelected && (
                  <MotiView
                    from={{ opacity: 0, scale: 0.8}}
                    animate={{ opacity: 0.25, scale: 1.3 }}
                    transition={{
                      loop: true,
                      duration: 2000,
                      repeatReverse: true,
                    }}
                    style={{ backgroundColor: info.colors[0] }}
                  />
                )}

                {/* Icône + texte */}
                <ThemedView className="items-center">
                  <ThemedView  className="border border-teal-50 rounded-full p-3  "
                    style={{
                      backgroundColor: isSelected
                        ? info.colors[1]
                        : theme.inputBackground,

                    }}
                  >
                    <PropertyIcon
                      type={category}
                      isSelected={isSelected}
                      size={30}
                      theme={theme}
                    />
                  </ThemedView>

                  <ThemedText
                    type="normal" variant = "accent" intensity="strong"
                    className=" text-center font-medium"
                    style={{
                      color: isSelected ? info.colors[1] : theme.text,
                    }}
                  >
                    {info.name}
                  </ThemedText>
                </ThemedView>

                {/* Sélection : cercle et ligne */}
                {isSelected && (
                  <>
                    <MotiView
                      from={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 200, type: "spring" }}
                      className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white"
                    />
                    <MotiView
                      from={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 300, duration: 400 }}
                      className="absolute bottom-0 left-1/4 right-1/4 h-1 rounded-full bg-white"
                    />
                  </>
                )}
              </TouchableOpacity>
            </MotiView>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
};

export default RenderCategoryTabs;
