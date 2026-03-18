import React, { useState } from 'react';
import { Slot } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/BackButton';
import { useFavorites, usePriceAlerts } from '@/hooks/useFavorites';

export default function FavorisLayout() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets().top;
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const { favorites, stats } = useFavorites(user?.id || '');
  const { alerts } = usePriceAlerts(user?.id || '');

  const activeAlerts = alerts.filter(a => a.isActive).length;

  const renderHeader = () => (
    <ThemedView
      style={{
        paddingHorizontal: 16,
        paddingTop: insets + 8,
        paddingBottom: 2,
        borderBottomWidth: 1,
        borderBottomColor: theme.outline + '20',
      }}
    >
      {/* Top row: back + title + action */}
      <ThemedView style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'transparent',
      }}>
        <BackButton style={{ padding: 4, backgroundColor: theme.text }} />

        {/* Center title block */}
        <ThemedView style={{ alignItems: 'center', backgroundColor: 'transparent', padding:4 }}>
          <ThemedText type = "subtitle" style={{ fontWeight: '700', letterSpacing: 0.2 }}>
            My Favorites
          </ThemedText>
          {favorites.length > 0 && (
            <ThemedText type ="caption" style={{color: theme.text + '60', marginTop: 4 }}>
              {favorites.length} saved {favorites.length === 1 ? 'property' : 'properties'}
            </ThemedText>
          )}
        </ThemedView>

        {/* Selection toggle button */}
        <TouchableOpacity
          onPress={() => {
            if (isSelectionMode) {
              setIsSelectionMode(false);
              setSelectedItems([]);
            } else {
              setIsSelectionMode(true);
            }
          }}
          style={{
            backgroundColor: isSelectionMode ? theme.error + '15' : theme.surfaceVariant,
            borderRadius: 10,
            padding: 8,
          }}
        >
          <MaterialCommunityIcons
            name={isSelectionMode ? 'close' : 'select-all'}
            size={18}
            color={isSelectionMode ? theme.error : theme.text}
          />
        </TouchableOpacity>
      </ThemedView>

      {/* Stats strip — only shown when there is data */}
      {/* {(favorites.length > 0 || activeAlerts > 0) && (
        <ThemedView style={{
          flexDirection: 'row',
          gap: 10,
          marginTop: 14,
          backgroundColor: 'transparent',
        }}>
          <ThemedView style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: theme.error + '10',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}>
            <MaterialCommunityIcons name="heart" size={13} color={theme.error} />
            <ThemedText style={{ fontSize: 12, color: theme.error, fontWeight: '600' }}>
              {stats?.totalFavorites ?? favorites.length} saved
            </ThemedText>
          </ThemedView>

          {activeAlerts > 0 && (
            <ThemedView style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              backgroundColor: theme.warning + '12',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
            }}>
              <MaterialCommunityIcons name="bell-ring" size={13} color={theme.warning} />
              <ThemedText style={{ fontSize: 12, color: theme.warning, fontWeight: '600' }}>
                {activeAlerts} {activeAlerts === 1 ? 'alert' : 'alerts'} active
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      )} */}
    </ThemedView>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      {renderHeader()}
      <Slot />
    </ThemedView>
  );
}
