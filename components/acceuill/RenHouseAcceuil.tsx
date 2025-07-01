import React, { useState, useEffect, useRef, useCallback } from "react";
import { TouchableOpacity, Dimensions, Animated, StatusBar } from "react-native";
import {  MaterialIcons} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import data from "@/assets/data/data";
import { ItemType, FeatureIcon } from "@/types/ItemType";
import { useTheme } from "../contexts/theme/themehook";
import { ThemedText } from "../ui/ThemedText";
import { ThemedView } from "../ui/ThemedView";
import RenderHeader from "./home/RenderHeader";
import RenderFilterModal from "./home/renderFilterModal";
import RenderItem from "./home/renderItem";
import RenderGridItem from "./home/renderGridItem";
import enrichItems from "../utils/homeUtils/extendData";


const { width, height } = Dimensions.get('window');

const RenHouseAcceuil = () => {
  const router = useRouter();
  // const [selectedCategory, setSelectedCategory] = useState("All");
  const [scrollY] = useState(new Animated.Value(0));
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewType, setViewType] = useState<"grid" | "list">("list");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(true);
  const [animatingElement, setAnimatingElement] = useState<string | null>(null);
  
  // Animations refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef(null);
  

  const  {theme} = useTheme()  
  // Animation for pulsation effect
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const pulsate = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.5,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      })
    ]).start(() => pulsate());
  }, [pulseAnim]);
  
  useEffect(() => {
    pulsate();
    
    // Fade in the component
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();
    
    if (lottieRef.current) {
      setTimeout(() => {
        lottieRef.current?.play();
      }, 500);
    }
    
    return () => {
      pulseAnim.setValue(1);
      fadeAnim.setValue(0);
    };
  }, [pulsate, fadeAnim]);
  
const extendedData =  enrichItems(data)

  return (
    <ThemedView variant="default" className="flex">
      <StatusBar barStyle={ "light-content"} />
      <LinearGradient
        colors={theme.background}
        className="flex"
      >
        {/* Header Component */}
        
        <RenderHeader
        viewType = {viewType}
        setViewType = {setViewType}
        setFilterModalVisible = {setFilterModalVisible}
        scrollY={scrollY}
        />
        
        {/* Main Content */}
        <Animated.View 
          style={{ 
            // flex: 1,
            opacity: fadeAnim,
          }}
        >
          {viewType === "list" ? (
            <Animated.FlatList
              data={extendedData}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <RenderItem
                  item={item}
                  index={index}
                  lottieRef={lottieRef}
                  favorites={favorites}
                  animatingElement={animatingElement}
                  setAnimatingElement={setAnimatingElement}
                />)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 1, paddingBottom: 30 }}
              ListHeaderComponent={
                <>
                                  
              
                  {/* <RenderAIRecommendation
                  showAIRecommendations= {showAIRecommendations}
                  setShowAIRecommendations = {setShowAIRecommendations}
                  /> */}

                </>
              }
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true }
              )}
            />
          ) : (
            <Animated.FlatList
              data={extendedData}
              keyExtractor={(item) => item.id}
              renderItem = { ({item, index}) =>(
              <RenderGridItem
                item={item}
                index={index}
                width={width}
                lottieRef={lottieRef}
                setAnimatingElement={setAnimatingElement}
                favorites={favorites}
                setFavorites={setFavorites}
              />)
              }
              showsVerticalScrollIndicator={false}
              numColumns={2}
              contentContainerStyle={{ paddingTop: 120, paddingBottom: 30 }}
              ListHeaderComponent={
                <>
                  {/* <RenderCategoryTabs
                  /> */}
                  
                  {/* <RenderAIRecommendation
                  showAIRecommendations= {showAIRecommendations}
                  setShowAIRecommendations = {setShowAIRecommendations}
                  /> */}
                
                </>
              }
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true }
              )}
            />
          )}
        </Animated.View>

        <RenderFilterModal
        fadeAnim = {fadeAnim}
        filterModalVisible = {filterModalVisible}
        setFilterModalVisible = {setFilterModalVisible}
        />
        
        {/* Bottom Navigation Bar */}
        <BlurView
          intensity={ 40 }
          tint={ "dark" }
          className="absolute bottom-0 left-0 right-0 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <ThemedView className="flex-row justify-around py-4" style={{ backgroundColor: 'transparent' }}>
            <TouchableOpacity className="items-center">
              <MaterialIcons name="home" size={24} color={ '#3b82f6'} />
              <ThemedText style={{ fontSize: 12, color:'#3b82f6', marginTop: 2 }}>Accueil</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity className="items-center">
              <MaterialIcons name="search" size={24} color={theme.subtext} />
              <ThemedText style={{ fontSize: 12, color: theme.subtext, marginTop: 2 }}>Recherche</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity className="items-center">
              <MaterialIcons name="favorite-border" size={24} color={theme.subtext} />
              <ThemedText style={{ fontSize: 12, color: theme.subtext, marginTop: 2 }}>Favoris</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity className="items-center">
              <MaterialIcons name="person-outline" size={24} color={theme.subtext} />
              <ThemedText style={{ fontSize: 12, color: theme.subtext, marginTop: 2 }}>Profil</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </BlurView>
      </LinearGradient>
    </ThemedView>
  );
};

export default RenHouseAcceuil;