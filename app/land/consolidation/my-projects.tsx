/**
 * land/consolidation/my-projects.tsx — parcel consolidation projects an
 * owner is involved in, either as initiator or as a contributing parcel
 * owner.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { getLandClient, ParcelConsolidationProject } from '@/services/api/landClient';

const STATUS_META: Record<ParcelConsolidationProject['status'], { label: string; color: string }> = {
  proposed: { label: 'Proposé', color: '#3B82F6' },
  voting: { label: 'Vote en cours', color: '#F59E0B' },
  consolidated: { label: 'Consolidé', color: '#10B981' },
  dissolved: { label: 'Dissous', color: '#6B7280' },
};

export default function MyConsolidationProjectsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [projects, setProjects] = useState<ParcelConsolidationProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showRefresh = false) => {
    if (!user?.id) { setLoading(false); return; }
    if (showRefresh) setRefreshing(true); else setLoading(true);
    try {
      const data = await getLandClient().getConsolidationProjectsByOwner(user.id);
      setProjects(data);
    } catch (err) {
      console.error('[MyConsolidationProjects] load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={theme.primary} />}
        contentContainerStyle={{ padding: 16, gap: 12 }}
      >
        <TouchableOpacity
          style={[styles.smallCta, { backgroundColor: theme.primary, alignSelf: 'flex-start', paddingHorizontal: 16 }]}
          onPress={() => router.push('/land/consolidation/create' as any)}
        >
          <Ionicons name="add" size={16} color="#fff" />
          <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Nouveau projet</ThemedText>
        </TouchableOpacity>

        {projects.length === 0 ? (
          <ThemedView style={{ alignItems: 'center', paddingVertical: 50 }}>
            <MaterialCommunityIcons name="vector-combine" size={48} color={theme.onSurface + '30'} />
            <ThemedText style={{ marginTop: 12, opacity: 0.5, textAlign: 'center' }}>
              Aucun projet de consolidation pour le moment.
            </ThemedText>
          </ThemedView>
        ) : (
          <View style={{ gap: 12 }}>
            {projects.map((p) => {
              const meta = STATUS_META[p.status];
              const committedCount = p.contributions.filter((c) => c.status === 'committed').length;
              return (
                <TouchableOpacity
                  key={p.project_id}
                  onPress={() => router.push({ pathname: '/land/consolidation/[projectId]', params: { projectId: p.project_id } } as any)}
                  style={[styles.card, { borderColor: meta.color + '30', borderLeftColor: meta.color, borderLeftWidth: 4 }]}
                >
                  <ThemedText style={styles.projectName} numberOfLines={1}>{p.project_name}</ThemedText>
                  <ThemedText style={styles.metaText}>
                    {committedCount} parcelle{committedCount > 1 ? 's' : ''} engagée{committedCount > 1 ? 's' : ''}
                  </ThemedText>
                  <ThemedText style={[styles.statusText, { color: meta.color }]}>{meta.label}</ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  smallCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: 20 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 4 },
  projectName: { fontSize: 15, fontWeight: '700' },
  metaText: { fontSize: 12, opacity: 0.6 },
  statusText: { fontSize: 12, fontWeight: '700', marginTop: 4 },
});
