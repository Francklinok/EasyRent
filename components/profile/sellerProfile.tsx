import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity, Image, Dimensions, RefreshControl, Alert
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import { ThemedScrollView } from '../ui/ScrolleView';
import { useTheme } from '../contexts/theme/themehook';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '../ui/BackButton';
import { useUser } from '../contexts/user/UserContext';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

const SellerProfileFile = () => {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleEditProfile = () => {
    router.push('/profile/editProfile');
  };

  const handleViewProperties = () => {
    router.push('/profile/myProperties');
  };

  const handleSettings = () => {
    router.push('/profile/settings');
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <LinearGradient
          colors={isDark ? ['#1f2937', '#374151'] : ['#3b82f6', '#1d4ed8']}
          style={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: insets.top + 20 }}
        >
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, backgroundColor: 'transparent' }}>
            <BackButton />
            <ThemedText style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
              Profil Vendeur
            </ThemedText>
            <TouchableOpacity onPress={handleSettings}>
              <Ionicons name="settings-outline" size={24} color="white" />
            </TouchableOpacity>
          </ThemedView>

          {/* Profile Picture and Info */}
          <ThemedView style={{ alignItems: 'center', backgroundColor: 'transparent' }}>
            <MotiView
              from={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'timing', duration: 800 }}
            >
              <Image
                source={{
                  uri: user?.profilePicture || 'https://via.placeholder.com/120'
                }}
                style={{ width: 128, height: 128, borderRadius: 64, borderWidth: 4, borderColor: 'white' }}
              />
            </MotiView>

            <ThemedText style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 16 }}>
              {user?.fullName || 'Nom du vendeur'}
            </ThemedText>

            <ThemedText style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginTop: 4 }}>
              Vendeur professionnel
            </ThemedText>

            <ThemedView style={{ flexDirection: 'row', marginTop: 16, gap: 24, backgroundColor: 'transparent' }}>
              <ThemedView style={{ alignItems: 'center', backgroundColor: 'transparent' }}>
                <ThemedText style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                  12
                </ThemedText>
                <ThemedText style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                  Propriétés
                </ThemedText>
              </ThemedView>

              <ThemedView style={{ alignItems: 'center', backgroundColor: 'transparent' }}>
                <ThemedText style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                  4.8
                </ThemedText>
                <ThemedText style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                  Note
                </ThemedText>
              </ThemedView>

              <ThemedView style={{ alignItems: 'center', backgroundColor: 'transparent' }}>
                <ThemedText style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                  156
                </ThemedText>
                <ThemedText style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                  Ventes
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </LinearGradient>

        {/* Action Buttons */}
        <ThemedView style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
          <ThemedView style={{ gap: 16 }}>
            <TouchableOpacity
              onPress={handleViewProperties}
              style={{ backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' }}>
                <MaterialCommunityIcons name="home-outline" size={24} color="white" />
                <ThemedText style={{ color: 'white', fontSize: 18, fontWeight: '600', marginLeft: 12 }}>
                  Mes Propriétés
                </ThemedText>
              </ThemedView>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleEditProfile}
              style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' }}>
                <MaterialCommunityIcons
                  name="account-edit"
                  size={24}
                  color={isDark ? 'white' : 'black'}
                />
                <ThemedText style={{ fontSize: 18, fontWeight: '600', marginLeft: 12 }}>
                  Modifier le profil
                </ThemedText>
              </ThemedView>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? 'white' : 'black'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' }}>
                <MaterialCommunityIcons
                  name="chart-line"
                  size={24}
                  color={isDark ? 'white' : 'black'}
                />
                <ThemedText style={{ fontSize: 18, fontWeight: '600', marginLeft: 12 }}>
                  Statistiques
                </ThemedText>
              </ThemedView>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? 'white' : 'black'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' }}>
                <MaterialCommunityIcons
                  name="message-outline"
                  size={24}
                  color={isDark ? 'white' : 'black'}
                />
                <ThemedText style={{ fontSize: 18, fontWeight: '600', marginLeft: 12 }}>
                  Messages
                </ThemedText>
              </ThemedView>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? 'white' : 'black'}
              />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {/* Recent Activity */}
        <ThemedView style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
          <ThemedText style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
            Activité récente
          </ThemedText>

          <ThemedView style={{ backgroundColor: isDark ? '#1f2937' : 'white', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
            <ThemedText style={{ fontSize: 16, marginBottom: 8 }}>
              Nouvelle visite programmée
            </ThemedText>
            <ThemedText style={{ color: '#6b7280', fontSize: 14 }}>
              Villa moderne - Aujourd'hui à 14h30
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedScrollView>
    </ThemedView>
  );
};

export default SellerProfileFile;