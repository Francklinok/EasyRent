import React, {useState, useRef} from "react";
import { TouchableOpacity,  Animated} from "react-native";
import { MaterialIcons, Ionicons} from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";
import { useThemeColors } from "@/components/contexts/theme/themehook";
import { MotiText } from "moti";
import { useTheme } from "@/components/contexts/theme/themehook";
import { useDarkMode } from "@/components/contexts/theme/themehook";
import { useThemeControls } from "@/components/contexts/theme/themehook";
import { ThemedScrollView } from "@/components/ui/ScrolleView";
import  RenderCategoryTabs from  "@/components/acceuill/home/renderCategory"
interface Props {
  viewType: "grid" | "list";
  setViewType: React.Dispatch<React.SetStateAction<"grid" | "list">>;
  setFilterModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  scrollY: Animated.Value;


}

  const RenderHeader:React.FC<Props> = ({viewType,setViewType,setFilterModalVisible, scrollY}) => {
     
        
    const  {theme} = useTheme()
     
    const headerTranslate = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [10, -20],
      extrapolate: 'clamp'
    });
  
  // Header opacity animation
  const headerOpacity = scrollY.interpolate({
      inputRange: [0, 100, 200],
      outputRange: [0, 0.8, 1],
      extrapolate: 'clamp'
    });
    
    
    return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        opacity: headerOpacity,
        transform: [{ translateY: headerTranslate }]
      }}
    >
      <BlurView
        intensity={ 10 }
        tint={ "dark"}
        className="px-2 pb-1"
      >
        <ThemedView className="flex-row justify-between items-center">
          <ThemedView className="flex-1 ">
            <MotiText
              from={{ opacity: 0, translateX: -10 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: 300, type: 'timing' }}
              className="text-base  text-blue-300 w-80"
            >
               <RenderCategoryTabs/>
:          </MotiText>
          </ThemedView>
          
          <ThemedView className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => {
                setViewType(viewType === "list" ? "grid" : "list");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className={`p-2.5 `}
            >
              <MaterialIcons
                name={viewType === "list" ? "grid-view" : "view-list"}
                size={22}
                color={theme.text}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                setFilterModalVisible(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              className='p-1.5 '
              
            >
              <Ionicons name="filter" size={20} color={theme.text} />
            </TouchableOpacity>
    
          </ThemedView>
        </ThemedView>
      </BlurView>
    </Animated.View>
  )};
export  default RenderHeader;