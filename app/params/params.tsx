import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { SettingsItem } from '@/components/ui/SettingsItems';
import { ThemedScrollView } from '@/components/ui/ScrolleView';

const ParamsScreen = () => {
  const navigation = useNavigation();
  
  return (
    <ThemedView className="h-full py-8">
      {/* User Header - Discord Style */}
      <ThemedView  className="flex-row items-center p-4 border-b border-[#2C2F33]">
        <ThemedView className="relative">
          <Image 
            source={{ uri: 'https://i.pravatar.cc/150' }} 
            className="w-14 h-14 rounded-full mr-3"
          />
          <View className="absolute right-3 bottom-0 w-4 h-4 rounded-full bg-[#3BA55D] border-[3px] border-[#36393F]" />
        </ThemedView>
        <ThemedView className="flex-1">
          <ThemedText className="text-lg font-bold text-white">SilverJ</ThemedText>
          <ThemedText className="text-sm text-[#B9BBBE] mt-0.5">Propriétaire</ThemedText>
        </ThemedView>
      </ThemedView>
      
      {/* Settings Sections - Discord Style */}
      <ThemedScrollView className="flex-1">
        {/* User Settings */}
        <ThemedView className="px-4 pt-4 pb-2">
          <ThemedText className="text-xs font-bold text-[#B9BBBE] tracking-wide">PARAMÈTRES UTILISATEUR</ThemedText>
        </ThemedView>
        <ThemedView variant = "surface" bordered className="mx-1 p-2 rounded-lg overflow-hidden">
          <SettingsItem showArrow='on'
            label="Mon Profil" 
            icon="person" 
            iconColor="#5865F2"
            onPress={() => router.navigate('/profile/Profile')}
          />
          <SettingsItem showArrow='on'
            label="Apparence" 
            icon="color-palette-outline"
            iconColor="#3BA55D"
            onPress={() => router.navigate('/theme/Themed')}
          />
          <SettingsItem showArrow='on'
            label="Favoris" 
            icon="star"
            iconColor="#FAA81A"
            onPress={() => router.navigate('/profile/Favorites')}
          />
        </ThemedView>
        
        {/* Billing Settings */}
        <ThemedView className="px-4 pt-4 pb-2">
          <ThemedText className="text-xs font-bold text-[#B9BBBE] tracking-wide">FACTURATION</ThemedText>
        </ThemedView>
        <ThemedView variant = "surface" bordered className="mx-1 p-2 mb-4 rounded-lg overflow-hidden">
          <SettingsItem showArrow='on'
            label="Premium" 
            description="Améliorez votre expérience"
            icon ="diamond"
            iconColor="#FF73FA"
            onPress={() => router.navigate('/profile/Premium')}
          />
          <SettingsItem showArrow='on'
            label="Portefeuille" 
            icon="wallet-outline"
            iconColor="#ED4245"
            onPress={() => router.navigate('/profile/Wallet')}
          />
          <SettingsItem showArrow='on'
            label="Inventaire" 
            icon="toolbox"
            iconColor="#5865F2"
            onPress={() => router.navigate('/profile/Listings')}
          />
        </ThemedView>
        
        {/* App Settings */}
        <ThemedView className="px-4 pt-4 pb-2">
          <ThemedText className="text-xs font-bold text-[#B9BBBE] tracking-wide">PARAMÈTRES DE L'APP</ThemedText>
        </ThemedView>
        <ThemedView variant = 'surface' bordered className="mx-1 p-2 mb-4 bg-[#2F3136] rounded-lg overflow-hidden">
          <SettingsItem showArrow='on'
            label="Paramètres" 
            icon="settings"
            iconColor="#B9BBBE"
            onPress={() => navigation.navigate('GeneralSettings')}
          />
          <SettingsItem showArrow='on'
            label="Compte" 
            icon="shield"
            iconColor="#B9BBBE"
            onPress={() => navigation.navigate('AccountSettings')}
          />
          <SettingsItem showArrow='on'
            label="IA Assistant" 
            icon="brain"
            iconColor="#5865F2"
            onPress={() => router.navigate('/profile/AssistantAI')}
          />
          <SettingsItem showArrow='on'
            label="Scanner" 
            icon="qrcode-scan"
            iconColor="#3BA55D"
            onPress={() => router.navigate('/ar/Scanner')}
          />
          <SettingsItem showArrow='on'
            label="Expérience Immersive" 
            icon="	view-dashboard-variant"
            iconColor="#FAA81A"
            onPress={() => router.navigate('/immersive/Experience')}
          />
        </ThemedView>
        
        {/* Logout button - Discord style */}

        
        <ThemedView  className="mx-1 p-2 mb-4   rounded-lg overflow-hidden">

        <SettingsItem bordered variant = 'surface' customBackgroundColor="#ED4245"
            label="Se deconnecter " 
            icon="log-out"
            iconColor="white"
            onPress={() => router.navigate('/immersive/Experience')}
          />
        </ThemedView>
      </ThemedScrollView>
    </ThemedView>
  );
};

export default ParamsScreen;
