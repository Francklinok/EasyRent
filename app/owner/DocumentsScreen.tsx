
import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView, RefreshControl, TouchableOpacity, Alert,
  ActivityIndicator, StyleSheet, View, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { getBookingService } from '@/services/api/bookingService';

interface DocEntry {
  id:       string;
  name:     string;
  type:     'contract' | 'receipt' | 'dossier' | 'identity' | 'other';
  url:      string;
  uploadedAt: string;
  sizeKb?:  number;
}

const DOC_ICONS: Record<DocEntry['type'], { icon: string; color: string; label: string }> = {
  contract: { icon: 'file-sign',        color: '#6366F1', label: 'Contrat'   },
  receipt:  { icon: 'receipt',          color: '#10B981', label: 'Quittance' },
  dossier:  { icon: 'folder-account',   color: '#F59E0B', label: 'Dossier'   },
  identity: { icon: 'card-account-details', color: '#3B82F6', label: 'Identité' },
  other:    { icon: 'file-document',    color: '#6B7280', label: 'Document'  },
};

function inferDocType(fileName: string): DocEntry['type'] {
  const n = fileName.toLowerCase();
  if (n.includes('contrat') || n.includes('bail')) return 'contract';
  if (n.includes('quittance') || n.includes('recu')) return 'receipt';
  if (n.includes('dossier')) return 'dossier';
  if (n.includes('cni') || n.includes('passport') || n.includes('id')) return 'identity';
  return 'other';
}

export default function DocumentsScreen() {
  const { theme }      = useTheme();
  const { activityId, propertyId } = useLocalSearchParams<{ activityId?: string; propertyId?: string }>();

  const [docs,       setDocs]       = useState<DocEntry[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading,  setUploading]  = useState(false);

  const bookingService = getBookingService();

  const load = useCallback(async (showRefresh = false) => {
    if (!activityId) { setLoading(false); return; }
    if (showRefresh) setRefreshing(true); else setLoading(true);
    try {
      const data = await bookingService.getActivityById(activityId);
      const entries: DocEntry[] = [];

      // Contrat généré
      if (data?.contractUrl) {
        entries.push({
          id: 'contract',
          name: 'Contrat de location.pdf',
          type: 'contract',
          url:  data.contractUrl,
          uploadedAt: data.contractGeneratedAt ?? data.updatedAt ?? new Date().toISOString(),
        });
      }

      // Fichiers uploadés (dossier locataire)
      if (data?.uploadedFiles?.length) {
        data.uploadedFiles.forEach((f: any, idx: number) => {
          entries.push({
            id:         `uploaded_${idx}`,
            name:       f.fileName,
            type:       inferDocType(f.fileName),
            url:        f.fileUrl,
            uploadedAt: f.uploadedAt ?? new Date().toISOString(),
          });
        });
      }

      setDocs(entries);
    } catch (err) {
      console.error('[DocumentsScreen] load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activityId]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: false,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setUploading(true);

      Alert.alert('Upload', `${file.name} sélectionné.\nFonctionnalité d'upload disponible via l'API.`);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de sélectionner le document.');
    } finally {
      setUploading(false);
    }
  };

  const handleOpen = (doc: DocEntry) => {
    Linking.openURL(doc.url).catch(() => {
      Alert.alert('Erreur', 'Impossible d\'ouvrir ce document.');
    });
  };

  if (loading) return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={theme.primary} />
    </ThemedView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={theme.primary} />}
      >
        <ThemedView style={{ padding: 16, gap: 16 }}>

          {/* Header actions */}
          <ThemedView style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleUpload}
              disabled={uploading}
              style={[styles.uploadBtn, { backgroundColor: theme.primary }]}
            >
              {uploading
                ? <ActivityIndicator size="small" color="#fff" />
                : <MaterialCommunityIcons name="upload" size={18} color="#fff" />}
              <ThemedText style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Ajouter un document</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/premium/RentReceipt' as any)}
              style={[styles.receiptBtn, { borderColor: '#10B981' + '60', backgroundColor: '#10B981' + '12' }]}
            >
              <MaterialCommunityIcons name="receipt" size={18} color="#10B981" />
              <ThemedText style={{ color: '#10B981', fontWeight: '600', fontSize: 13 }}>Générer quittance</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* Liste documents */}
          {docs.length === 0 ? (
            <ThemedView style={styles.empty}>
              <MaterialCommunityIcons name="folder-open-outline" size={56} color={theme.onSurface + '30'} />
              <ThemedText style={{ marginTop: 12, opacity: 0.5, textAlign: 'center' }}>
                Aucun document pour cette location.{'\n'}Uploadez le contrat ou les pièces du dossier.
              </ThemedText>
            </ThemedView>
          ) : (
            <ThemedView style={{ gap: 10 }}>
              {docs.map(doc => {
                const cfg = DOC_ICONS[doc.type];
                return (
                  <TouchableOpacity
                    key={doc.id}
                    onPress={() => handleOpen(doc)}
                    style={[styles.docCard, { borderColor: cfg.color + '25' }]}
                  >
                    <ThemedView style={[styles.docIconWrap, { backgroundColor: cfg.color + '18' }]}>
                      <MaterialCommunityIcons name={cfg.icon as any} size={24} color={cfg.color} />
                    </ThemedView>
                    <ThemedView style={{ flex: 1, gap: 3 }}>
                      <ThemedText style={styles.docName} numberOfLines={1}>{doc.name}</ThemedText>
                      <ThemedView style={styles.docMeta}>
                        <ThemedView style={[styles.docTypeBadge, { backgroundColor: cfg.color + '18' }]}>
                          <ThemedText style={[styles.docTypeBadgeText, { color: cfg.color }]}>{cfg.label}</ThemedText>
                        </ThemedView>
                        <ThemedText style={styles.docDate}>
                          {new Date(doc.uploadedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </ThemedText>
                      </ThemedView>
                    </ThemedView>
                    <MaterialCommunityIcons name="open-in-new" size={18} color={theme.onSurface + '50'} />
                  </TouchableOpacity>
                );
              })}
            </ThemedView>
          )}

          {/* Info */}
          <ThemedView style={[styles.infoBox, { backgroundColor: theme.primary + '08', borderColor: theme.primary + '20' }]}>
            <MaterialCommunityIcons name="information-outline" size={18} color={theme.primary} />
            <ThemedText style={[styles.infoText, { color: theme.onSurface + '70' }]}>
              Les contrats sont générés automatiquement après paiement. Les quittances sont disponibles via la section Premium.
            </ThemedText>
          </ThemedView>

        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  uploadBtn:     { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  receiptBtn:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },

  empty:         { alignItems: 'center', paddingVertical: 50 },

  docCard:       { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  docIconWrap:   { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  docName:       { fontSize: 14, fontWeight: '600' },
  docMeta:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  docTypeBadge:  { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  docTypeBadgeText:{ fontSize: 10, fontWeight: '700' },
  docDate:       { fontSize: 11, opacity: 0.55 },

  infoBox:       { flexDirection: 'row', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'flex-start' },
  infoText:      { flex: 1, fontSize: 12, lineHeight: 18 },
});
