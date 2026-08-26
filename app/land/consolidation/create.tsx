/**
 * land/consolidation/create.tsx — start a parcel consolidation project.
 * Large projects are often blocked because the needed land belongs to
 * several small owners — this creates the pooling project that owners will
 * later be invited to join.
 */
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { getLandClient } from '@/services/api/landClient';

export default function CreateConsolidationProjectScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [approvalThresholdPct, setApprovalThresholdPct] = useState('80');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!user?.id) { setError('Utilisateur non authentifié.'); return; }
    const thresholdVal = parseFloat(approvalThresholdPct);
    if (!projectName.trim() || !description.trim() || !thresholdVal || thresholdVal <= 0 || thresholdVal > 100) {
      setError('Merci de renseigner le nom, la description, et un seuil de consensus valide (0-100%).');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const project = await getLandClient().createConsolidationProject({
        projectName: projectName.trim(),
        description: description.trim(),
        initiatedBy: user.id,
        approvalThresholdPct: thresholdVal,
      });
      router.replace({ pathname: '/land/consolidation/[projectId]', params: { projectId: project.project_id } } as any);
    } catch (err: any) {
      setError(err?.message || 'Impossible de créer le projet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      <StatusBar barStyle="light-content" />
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>Consolidation de parcelles</ThemedText>
        </ThemedView>
      </ThemedView>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <ThemedView style={[s.infoBox, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
          <MaterialCommunityIcons name="vector-combine" size={16} color={theme.primary} />
          <ThemedText style={{ fontSize: 12, color: theme.onSurface + '75', flex: 1, lineHeight: 18 }}>
            Regroupez plusieurs petites parcelles adjacentes pour débloquer un projet impossible
            individuellement. Chaque propriétaire garde le droit de se retirer si le consensus n'est pas
            atteint — jamais de fusion forcée.
          </ThemedText>
        </ThemedView>

        <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
          <ThemedText style={[s.label, { color: theme.text }]}>Nom du projet</ThemedText>
          <TextInput value={projectName} onChangeText={setProjectName} style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]} />

          <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Description</ThemedText>
          <TextInput
            value={description} onChangeText={setDescription} multiline
            style={[s.input, { color: theme.text, borderColor: theme.outline + '30', minHeight: 70, paddingTop: 10 }]}
          />

          <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Seuil de consensus requis (%)</ThemedText>
          <ThemedText style={{ fontSize: 11, color: theme.onSurface + '50', marginBottom: 4 }}>
            % d'approbation nécessaire parmi les propriétaires engagés pour finaliser
          </ThemedText>
          <TextInput
            value={approvalThresholdPct} onChangeText={setApprovalThresholdPct} keyboardType="decimal-pad"
            style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
          />
        </ThemedView>

        {error !== '' && (
          <ThemedView style={[s.box, { backgroundColor: '#ef444415', borderColor: '#ef444430' }]}>
            <MaterialCommunityIcons name="alert-circle" size={16} color={theme.error} />
            <ThemedText style={{ color: theme.error, flex: 1, fontSize: 13 }}>{error}</ThemedText>
          </ThemedView>
        )}

        <TouchableOpacity
          style={[s.cta, { backgroundColor: loading ? theme.outline : theme.primary }]}
          onPress={handleSubmit} disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <MaterialCommunityIcons name="vector-combine" size={18} color="#fff" />
              <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Créer le projet</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 12, borderWidth: 1, padding: 14 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14 },
  label: { fontWeight: '800', fontSize: 14 },
  input: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 14 },
  box: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, borderWidth: 1, padding: 12 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 26 },
});
