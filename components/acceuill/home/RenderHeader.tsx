import React from "react";
import { TouchableOpacity,  Animated} from "react-native";
import { MaterialIcons, Ionicons} from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { ThemedView } from "@/components/ui/ThemedView";
import { MotiText } from "moti";
import { useTheme } from "@/components/contexts/theme/themehook";


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
      outputRange: [0, -20],
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
        intensity={ 40 }
        tint={ "dark"}
        className="px-4 pt-4 pb-2"
      >
        <ThemedView className="flex-row justify-between items-center">
          <ThemedView className="flex-1">
            <MotiText
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: 200, type: 'timing' }}
              className="text-2xl font-bold "
            >
              RenHouse
            </MotiText>
            <MotiText
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: 300, type: 'timing' }}
              className="text-base  text-blue-300"
            >
              Trouvez votre logement idéal
            </MotiText>
          </ThemedView>
          
          <ThemedView className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => {
                setViewType(viewType === "list" ? "grid" : "list");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className={`p-2.5 rounded-full border ${
               "border-white/20 bg-white/10" 
              }`}
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
              className='p-2.5 rounded-full border'
              
            >
              <Ionicons name="filter" size={22} color={theme.text} />
            </TouchableOpacity>
    
          </ThemedView>
        </ThemedView>
      </BlurView>
    </Animated.View>
  )};
export  default RenderHeader;