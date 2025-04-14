

import React from "react";
import { View, Text, TouchableOpacity, ViewStyle, Platform, StatusBar as RNStatusBar } from "react-native";
import { SafeAreaView, StatusBar } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import Svg, { Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import NotificationBadge from "@/components/utils/Notification";
import ThemeToggle from "../ui/ThemeToggle";
import { ReactNode } from "react";
import { ThemedView } from "./ThemedView";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type HeaderProps = {
  leftElement?: ReactNode;
  mainElement?: ReactNode;
  rightElement?: ReactNode;
  hasBackButton?: boolean;
  style?: ViewStyle;
};

const Header = ({
  leftElement,
  mainElement,
  rightElement,
  hasBackButton = false,
  style = {},
}: HeaderProps) => {
  const insets = useSafeAreaInsets();
  
  // Pour Android, obtenir la hauteur de StatusBar de manière sécurisée
  const statusBarHeight = Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0;
  
  // Default logo element with gradient text
  const defaultLeftElement = (
    <Svg height="40" width="150">
      <Defs>
        <SvgLinearGradient id="textGradient" x1="0" y1="1" x2="1" y2="0">
          <Stop offset="0" stopColor="#88B4DB" stopOpacity="1" />
          <Stop offset="1" stopColor="green" stopOpacity="0.5" />
        </SvgLinearGradient>
      </Defs>
      <SvgText
        x="10"
        y="30"
        fontSize="30"
        fontWeight="bold"
        fill="url(#textGradient)"
      >
        EasyRent
      </SvgText>
    </Svg>
  );
  
  const defaultMainElement = (
    <ThemedView>
      <ThemeToggle />
    </ThemedView>
  );
  
  // Default right element with notification icon
  const defaultRightElement = (
    <ThemedView className="flex">
      <TouchableOpacity>
        <Ionicons name="notifications-outline" size={26} color="black" />
      </TouchableOpacity>
      <ThemedView className="absolute top-3 right-3">
        <NotificationBadge count={1} />
      </ThemedView>
    </ThemedView>
  );

  return (
    <SafeAreaView 
      style={{ 
        backgroundColor: "white", 
        // Utiliser statusBarHeight pour gérer correctement l'espace en haut de l'écran
        paddingTop: Platform.OS === 'android' ? statusBarHeight : 70,
        zIndex: 1000, // S'assurer que le header est au-dessus des autres éléments
      }}
    >
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent={Platform.OS === 'android'} 
      />
      <ThemedView
        className="w-full  px-3 overflow-visible"
        style={[
          { 
            paddingTop: insets.top > 0 ? 0 : 8, // Ajouter un padding si nécessaire
            height: Platform.OS === 'android' ? 70 : 60, // Ajuster la hauteur selon la plateforme
          }, 
          style
        ]}
      >
        <ThemedView className="flex-row items-center justify-between z-10 h-40">
          {leftElement || defaultLeftElement}
          {mainElement || defaultMainElement}
          {rightElement || defaultRightElement}
        </ThemedView>

        {/* <ThemedView className="flex-row items-center justify-between z-10 h-40">
          {leftElement || defaultLeftElement}ss
          {mainElement || defaultMainElement}
          {rightElement || defaultRightElement}
        </ThemedView> */}
      </ThemedView> 
    </SafeAreaView>
  );
};

export default Header;