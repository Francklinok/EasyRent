
import React from "react";
import { View,Text,SafeAreaView, StatusBar, TouchableOpacity } from "react-native";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from '@expo/vector-icons/Ionicons';
import Svg, { Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import NotificationBadge from "@/utils/Notification";


const Header = () => {
  return (
    <SafeAreaView style={{ backgroundColor: "white", paddingTop: StatusBar.currentHeight }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View className="w-full h-20 px-4 rounded-[14px] overflow-hidden relative">
        {/* <LinearGradient
          colors={["rgba(255, 255, 255, 0.9)", "rgba(8, 121, 250, 0.9)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="absolute inset-0 rounded-[14px]"
        /> */}

        {/* Contenu du header */}
        <View className="flex-row items-center justify-between z-10">
          {/* Texte avec couleur en dégradé BLEU-VERT */}
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
              font- 
              fill="url(#textGradient)"
            >
              EasyRent
            </SvgText>
          </Svg>

          {/* Icône de recherche */}
          <View className = "">
          <TouchableOpacity>
          <Ionicons name="notifications-outline" size={32} color="black" />
          </TouchableOpacity>
          <View className = "absolute top-3 right-3">
          <NotificationBadge count = {1}/>

          </View>
          </View>
         

        </View>
      </View>
    </SafeAreaView>
  );
};

export default Header;
