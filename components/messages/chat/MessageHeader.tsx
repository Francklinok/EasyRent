import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { RootStackParamList } from '@/components/navigator/RouteType';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/components/contexts/theme/themehook';
import { useRouter } from 'expo-router';

export default function ChatHeader() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();


  const { name, image, status = 'En ligne', chatId } = route.params;

  const isTyping = /écrit|typing|train/i.test(status.toLowerCase());
  const statusColor = isTyping ? theme.warning : theme.success;

  const handleOpenContactInfo = () => {
    router.push({
      pathname: '/contactinfo',
      params: {
        name,
        image,
        status,
        chatId,
      },
    });
  };

  return (
    <ThemedView
      bordered= {true}
      className="flex-row items-center justify-between w-full px-3 py-4 h-28 rounded-3xl"
      style={{ paddingTop: insets.top }}
    >
      {/* ⬅️ Retour */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="p-1 mr-2"
        accessibilityLabel="Revenir à la liste"
      >
        <Ionicons name="arrow-back" size={22} color={theme.typography.caption} />
      </TouchableOpacity>

      {/* 👤 Avatar + Nom + Statut */}
      <TouchableOpacity
        onPress={handleOpenContactInfo}
        className="flex-row items-center flex-1"
        accessibilityLabel={`Voir les infos de ${name}`}
      >
        <ThemedView backgroundColor="onSurface" className="relative mr-3">
          <Image
            source={{ uri: image || `https://i.pravatar.cc/150?u=${name}` }}
            className="w-10 h-10 rounded-full"
            resizeMode="cover"
          />
          <ThemedView
            className="absolute right-0 bottom-0 w-3 h-3 rounded-full border-2 border-[#36393F]"
            style={{ backgroundColor: statusColor }}
          />
        </ThemedView>

        <ThemedView backgroundColor="onSurface">
          <ThemedText className="font-bold text-white text-base">{name}</ThemedText>
          <ThemedText className="text-xs" style={{ color: statusColor }}>
            {status}
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>

      {/* 📞 📹 ☰ Actions */}
      <ThemedView backgroundColor="onSurface" className="flex-row items-center">
        <TouchableOpacity className="p-2" accessibilityLabel="Appel audio">
          <Ionicons name="call-sharp" size={20} color={theme.typography.caption} />
        </TouchableOpacity>

        <TouchableOpacity className="p-2" accessibilityLabel="Appel vidéo">
          <MaterialIcons name="video-call" size={22} color={theme.typography.caption} />
        </TouchableOpacity>

        <TouchableOpacity className="p-2" accessibilityLabel="Plus d’options">
          <Feather name="more-vertical" size={20} color={theme.typography.caption} />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}
