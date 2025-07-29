import React from 'react';
import { View, Image, TouchableOpacity, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  const statusColor = isTyping ? '#22C55E' : '#10B981';

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
    <ThemedView variant='surfaceVariant' style={{ paddingTop: insets.top }}>
      <LinearGradient
        colors={theme.priceGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <ThemedView variant='surfaceVariant'
          className="flex-row items-center px-4 py-3"
          style={{ minHeight: 78 }}
        >
          {/* Bouton Retour - Style WhatsApp */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
            style={{
              padding: 8,
              borderRadius: 20,
            }}
            accessibilityLabel="Revenir à la liste"
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={theme.typography.body || '#374151'} 
            />
          </TouchableOpacity>

          {/* Section Utilisateur - Layout WhatsApp */}
          <TouchableOpacity
            onPress={handleOpenContactInfo}
            className="flex-row items-center flex-1"
            accessibilityLabel={`Voir les infos de ${name}`}
          >
            {/* Avatar */}
            <ThemedView variant = "surfaceVariant" className="relative mr-3">
              <Image
                source={{ uri: image || `https://i.pravatar.cc/150?u=${name}` }}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                }}
                resizeMode="cover"
              />
              
              {/* Indicateur de statut */}
              <ThemedView
                style={{
                  position: 'absolute',
                  right: -2,
                  bottom: -2,
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: statusColor,
                  borderWidth: 2,
                  borderColor: '#FFFFFF',
                }}
              />
            </ThemedView>

            {/* Informations utilisateur */}
            <View className="flex-1">
              <ThemedText 
                className="font-semibold text-lg"
                style={{ 
                  color: theme.typography.heading || '#111827',
                  marginBottom: 2,
                }}
              >
                {name}
              </ThemedText>
              
              <ThemedText 
                className="text-sm"
                style={{ 
                  color: statusColor,
                  fontWeight: '500',
                }}
              >
                {status}
              </ThemedText>
            </View>
          </TouchableOpacity>

          {/* Actions - Style épuré */}
          <ThemedView variant = "surfaceVariant" className="flex-row items-center ml-2">
            <TouchableOpacity
              style={{
                padding: 10,
                marginRight: 4,
                borderRadius: 20,
              }}
              accessibilityLabel="Appel audio"
            >
              <Ionicons 
                name="call" 
                size={22} 
                color={theme.typography.body || '#6B7280'} 
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                padding: 10,
                marginRight: 4,
                borderRadius: 20,
              }}
              accessibilityLabel="Appel vidéo"
            >
              <Ionicons 
                name="videocam" 
                size={24} 
                color={theme.typography.body || '#6B7280'} 
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                padding: 10,
                borderRadius: 20,
              }}
              accessibilityLabel="Plus d'options"
            >
              <Feather 
                name="more-vertical" 
                size={20} 
                color={theme.typography.body || '#6B7280'} 
              />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {/* Ligne de séparation subtile */}
        <ThemedView 
        />
      </LinearGradient>
    </ThemedView>
  );
}