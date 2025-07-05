import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { SettingsItem } from '@/components/ui/SettingsItems';
import { ThemedScrollView } from '@/components/ui/ScrolleView';
import { useTheme } from '@/components/contexts/theme/themehook';

const ParamsScreen = () => {
  const insets = useSafeAreaInsets();
  const {theme} = useTheme()

  return (
    <ThemedView className="h-full" style={{ paddingTop: insets.top + 4 }}>
      {/* Header utilisateur */}
      <ThemedView className="flex-row items-center p-4 px-6"
      style = {{borderBottomWidth:1, borderColor:theme.outline}}>
        <ThemedView className="relative">
          <Image
            source={{ uri: 'https://i.pravatar.cc/150' }}
            className="w-14 h-14 rounded-full mr-3"
          />
          <ThemedView style = {{backgroundColor:theme.success}} className="absolute right-3 bottom-0 w-3 h-3 rounded-full" />
        </ThemedView>
        <ThemedView className="flex-1">
          <ThemedText type='normal' intensity='strong'>SilverJ</ThemedText>
          <ThemedText type='normal' intensity='light'>Propriétaire</ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedScrollView className="flex-1  px-2">
        {/* PARAMÈTRES UTILISATEUR */}
        <ThemedView className="px-4 pt-4 pb-2">
          <ThemedText type = "caption"   className="tracking-wide">PARAMÈTRES UTILISATEUR</ThemedText>
        </ThemedView>
        <ThemedView variant="surface"  bordered  className="mx-1 p-2 rounded-lg overflow-hidden">
          <SettingsItem  showArrow="on" label="Mon Profil" icon="person" iconColor= {theme.primary} onPress={() => router.navigate('/profile/Profile')} />
          <SettingsItem showArrow="on" label="Apparence" icon="color-palette-outline" iconColor={theme.success} onPress={() => router.navigate('/theme/Themed')} />
          <SettingsItem showArrow="on" label="Favoris" icon="star" iconColor={theme.star} onPress={() => router.navigate('/favoris/Favoris')} />
        </ThemedView>

        {/* FACTURATION */}
        <ThemedView className="px-4 pt-4 pb-2">
          <ThemedText type = "caption" className="text-xs font-bold text-[#B9BBBE] tracking-wide">FACTURATION</ThemedText>
        </ThemedView>
        <ThemedView variant="surface" bordered className="mx-1 p-2 mb-4 rounded-lg overflow-hidden">
          <SettingsItem showArrow="on" label="Premium" description="Améliorez votre expérience" icon="diamond" iconColor="#FF73FA" onPress={() => router.navigate('/premium/Premium')} />
          <SettingsItem showArrow="on" label="Portefeuille" icon="wallet-outline" iconColor="#ED4245" onPress={() => router.navigate('/wallet/Wallet')} />
          <SettingsItem showArrow="on" label="Inventaire" icon="toolbox" iconColor="#5865F2" onPress={() => router.navigate('/inventory/Inventory')} />
        </ThemedView>

        {/* PARAMÈTRES APP */}
        <ThemedView className="px-4 pt-4 pb-2">
          <ThemedText type = "caption" className="text-xs font-bold text-[#B9BBBE] tracking-wide">PARAMÈTRES DE L'APP</ThemedText>
        </ThemedView>
        <ThemedView variant="surface" bordered className="mx-1 p-2 mb-4 rounded-lg overflow-hidden">
          <SettingsItem showArrow="on" label="Paramètres" icon="settings" iconColor="#B9BBBE" onPress={() => router.navigate('/parameters/PConfidentiality')} />
          <SettingsItem showArrow="on" label="Compte" icon="shield" iconColor="#B9BBBE" onPress={() => router.navigate('/account/Account')} />
          <SettingsItem showArrow="on" label="IA Assistant" icon="brain" iconColor="#5865F2" onPress={() => router.navigate('/profile/AssistantAI')} />
          <SettingsItem showArrow="on" label="Scanner" icon="qrcode-scan" iconColor="#3BA55D" onPress={() => router.navigate('/ar/Scanner')} />
          <SettingsItem showArrow="on" label="Expérience Immersive" icon="view-dashboard-outline" iconColor="#FAA81A" onPress={() => router.navigate('/immersive/Experience')} />
        </ThemedView>

        {/* DECONNEXION */}
        <ThemedView className="mx-1 p-2 mb-4 rounded-lg overflow-hidden">
          <SettingsItem
            bordered
            variant="surface"
            customBackgroundColor="#ED4245"
            label="Se déconnecter"
            icon="log-out"
            iconColor="white"
            onPress={() => {
              // log out or confirm
              router.replace('/auth/Login');
            }}
          />
        </ThemedView>
      </ThemedScrollView>
    </ThemedView>
  );
};

export default ParamsScreen;
