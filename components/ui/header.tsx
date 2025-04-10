import React from "react";
import { View, Text, TouchableOpacity, ViewStyle } from "react-native";
import { SafeAreaView, StatusBar } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import Svg, { Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import NotificationBadge from "@/components/utils/Notification";
import ThemeToggle from "../ui/ThemeToggle";
import { ReactNode } from "react";

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
  // Default logo element with gradient text
  const defaultLeftElement  = (
    <Svg height="50" width="200">
      <Defs>
        <SvgLinearGradient id="textGradient" x1="0" y1="1" x2="1" y2="0">
          <Stop offset="0" stopColor="#88B4DB" stopOpacity="1" />
          <Stop offset="1" stopColor="green" stopOpacity="0.5" />
        </SvgLinearGradient>
      </Defs>
      <SvgText
        x="15"
        y="30"
        fontSize="32"
        fontWeight="bold"
        fill="url(#textGradient)"
      >
        EasyRent
      </SvgText>
    </Svg>
  );

  const  defaultMainElement = (
    <View>
      <ThemeToggle />
    </View>
  );

  // Default right element with notification icon
    // Default left element with theme toggle

  const defaultRightElement = (
    <View className="flex">
      <TouchableOpacity>
        <Ionicons name="notifications-outline" size={32} color="black" />
      </TouchableOpacity>
      <View className="absolute top-3 right-3">
        <NotificationBadge count={1} />
      </View>
    </View>
  );

 

  return (
    <SafeAreaView style={{ backgroundColor: "white", paddingTop: StatusBar.currentHeight }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View 
        className="w-full h-20 px-4 rounded-[14px] overflow-hidden relative" 
        style={style}
      >
        <View className="flex-row items-center justify-between z-10">
          {leftElement || defaultLeftElement}
          {mainElement || defaultMainElement}
          {rightElement || defaultRightElement}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Header;