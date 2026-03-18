

import { View, Text, TouchableOpacity, Dimensions, Image, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import Header from '@/components/ui/header';
import RenHouseAcceuil from '@/components/acceuill/RenHouseAcceuil';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useLanguage } from '@/components/contexts/language';
interface ComponentProps {
  itemId: string | string[];
}

// Définition des catégories avec icônes et clés de traduction
const categories = [
  {
    key: "RentHouse",
    labelKey: "homeScreen.rent" as const,
    descKey: "homeScreen.rentDesc" as const,
    icon: "home"
  },
  {
    key: "SelleHouse",
    labelKey: "homeScreen.buy" as const,
    descKey: "homeScreen.buyDesc" as const,
    icon: "business-outline"
  },
  {
    key: "SelleLand",
    labelKey: "homeScreen.lands" as const,
    descKey: "homeScreen.landsDesc" as const,
    icon: "map-outline"
  }
];

const { width } = Dimensions.get('window');

const Home = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params;
  const [activeComponent, setActiveComponent] = useState<string>("RentHouse");
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories[0].key);
  
  const componentMap: { [key: string]: React.ComponentType<ComponentProps> } = {
    "RentHouse": RenHouseAcceuil,
  };
  
  const ActiveComponent = componentMap[activeComponent];
  const {theme} = useTheme()
  const { t } = useLanguage();
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  const handleSetActiveComponent = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveComponent(key);
    setSelectedCategory(key);
  };

  return (
   
      <ThemedView>           
          {ActiveComponent ? (
            <ActiveComponent itemId={id} />
          ) : (
            <ThemedView className="p-12 items-center justify-center">
              <ThemedView className=" p-4 rounded-full mb-3">
                <Ionicons name="alert-circle-outline" size={36} color="#0866f1" />
              </ThemedView>
              <ThemedText className=" font-medium text-base mb-2 text-center">
                {t('homeScreen.noResults')}
              </ThemedText>
              <ThemedText className="text-sm text-center">
                {t('homeScreen.noDataForCategory')}
              </ThemedText>
              <TouchableOpacity
                className="mt-4  py-2 px-4 rounded-full"
                onPress={() => handleSetActiveComponent("RentHouse")}
              >
                <Text className=" text-sm font-medium">{t('common.back')}</Text>
              </TouchableOpacity>
            </ThemedView>
          )}
      </ThemedView>
  );
};

export default Home;