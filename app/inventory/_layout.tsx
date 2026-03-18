import React, { useState, useEffect } from 'react';
import { Slot } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/BackButton';
import { getPropertyService } from '@/services/api/propertyService';

export default function InventoryLayout() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets().top;
  const [stats, setStats] = useState({ total: 0, totalRevenue: 0 });

  useEffect(() => {
    if (!user?.id) return;
    const loadStats = async () => {
      try {
        const result = await getPropertyService().getPropertiesByOwner(user.id);
        const properties = result?.edges?.map((e: any) => e.node) || [];
        setStats({
          total: result?.totalCount || properties.length,
          totalRevenue: properties.reduce((acc: number, p: any) => acc + (p.ownerCriteria?.monthlyRent || 0), 0),
        });
      } catch (error) {
        console.error('Error loading inventory stats:', error);
      }
    };
    loadStats();
  }, [user?.id]);

  const renderHeader = () => (
    <ThemedView
      style={{
        paddingHorizontal: 10,
        paddingTop: insets + 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.outline + '80',
      
      }}
    >
      <ThemedView style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'transparent',
        marginBottom: 10
      }}>
        <BackButton />
        <ThemedText type="subtitle" intensity="strong" style={{ color:theme.text }}>
          Mon Inventaire
        </ThemedText>
        <TouchableOpacity
          onPress={() => router.push('/property/create' as any)}
          style={{
            borderRadius: 12,
            padding: 1
          }}
        >
          <MaterialCommunityIcons name="plus" size={22} color= {theme.text} />
        </TouchableOpacity>
      </ThemedView>

      {/* <ThemedView style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 6,
        borderWidth: 1,
        borderColor:theme.outline + '20',
        borderRadius: 12,
        paddingHorizontal: 45,
        justifyContent:"space-between",
        // backgroundColor: theme.surfaceVariant,

      }}>
        <ThemedView style={{
          display: "flex",
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          padding: 2,

        }}>
          <ThemedText type="normal" intensity ="light"  style={{ color:theme.text, fontWeight:700 }}>Total propriétés:</ThemedText>
          <ThemedText type="normal" intensity ="light"  style={{ color: theme.text, fontWeight:700}}>{stats.total}</ThemedText>
        </ThemedView>

        <ThemedView style={{
          display: "flex",
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: "transparent",
        }}>
          <ThemedText type="normal" intensity ="light"  style={{ color:theme.text, fontWeight:700 }}>Revenus:</ThemedText>
          <ThemedText type="normal" intensity ="light"  style={{ color:theme.text, fontWeight:700 }}>{stats.totalRevenue.toLocaleString()}</ThemedText>
        </ThemedView>
      </ThemedView> */}
    </ThemedView>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      {renderHeader()}
      <Slot />
    </ThemedView>
  );
}
