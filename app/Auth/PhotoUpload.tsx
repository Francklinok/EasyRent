import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { launchImageLibraryWithFallback } from '@/components/utils/imagePickerUtils';
import { buildApiUrl } from '@/components/utils/networkUtils';
import { useThemeColors } from '@/hooks/themehook';

const PhotoUpload: React.FC = () => {
  const colors   = useThemeColors();
  const router   = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [photoUri,    setPhotoUri]    = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [loading,     setLoading]     = useState(false);

  const BTN      = colors.primary + '80';
  const TEXT     = colors.text;
  const GRAY     = colors.input.placeholder;
  const INPUT_BG = colors.surfaceVariant;
  const BORDER   = colors.input.border;
  const BG       = colors.primary + '15';
  const PRIMARY  = colors.primary;

  // ── Ouvrir galerie ───────────────────────────────────────────────────────────
  const pickImage = async () => {
    const result = await launchImageLibraryWithFallback({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      allowsMultipleSelection: false,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setPhotoUri(asset.uri);

      try {
        let base64Data: string;

        if (asset.base64) {
          base64Data = asset.base64;
          console.log('✅ Base64 fourni directement par le picker');
        } else {
          console.log('🔄 Conversion en base64 via FileSystem...');
          base64Data = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: 'base64' as any,
          });
          console.log(`✅ Converti avec succès, longueur: ${base64Data.length}`);
        }

        const mimeType = asset.mimeType ||
          (asset.uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');
        const dataUrl = `data:${mimeType};base64,${base64Data}`;
        setPhotoBase64(dataUrl);
      } catch (err) {
        console.error('❌ Erreur conversion base64:', err);
        Alert.alert('Erreur', 'Impossible de traiter la photo sélectionnée');
        setPhotoUri(null);
        setPhotoBase64(null);
      }
    }
  };

  // ── Upload ───────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!photoUri || !photoBase64) {
      Alert.alert('Aucune photo', 'Sélectionnez d\'abord une photo');
      return;
    }
    setLoading(true);
    try {
      const url = buildApiUrl('/api/v1/auth/upload-profile-photo', '3000');
      console.log('Upload URL:', url);
      console.log('Email:', email);
      console.log('Base64 length:', photoBase64.length);

      const formData = new FormData();
      formData.append('email', email as string);
      formData.append('photo', {
        uri:  photoUri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      } as any);

      const res  = await fetch(url, {
        method: 'POST',
        body:   formData,
      });

      const text = await res.text();
      console.log('Upload response:', res.status, text);

      let data: any = {};
      try { data = JSON.parse(text); } catch {}

      if (!res.ok) throw new Error(data.message || `Erreur ${res.status}: ${text}`);

      Alert.alert('Succès', 'Photo enregistrée !', [
        { text: 'Se connecter', onPress: () => router.replace('/Auth/Login') },
      ]);
    } catch (err: any) {
      console.error('Upload error:', err);
      Alert.alert('Erreur upload', err?.message || 'Upload échoué');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: BG }]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Titre ─────────────────────────────────────────────────────────── */}
        <Text style={[styles.title, { color: TEXT }]}>Photo de profil</Text>
        <Text style={[styles.subtitle, { color: GRAY }]}>
          Ajoutez une photo pour personnaliser votre profil
        </Text>

        {/* ── Aperçu photo ──────────────────────────────────────────────────── */}
        <View style={[styles.photoBox, { backgroundColor: INPUT_BG, borderColor: BORDER }]}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="person-circle-outline" size={90} color={GRAY} />
            </View>
          )}
        </View>

        {/* ── Bouton choisir ────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.pickBtn, { borderColor: PRIMARY }]}
          onPress={pickImage}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Ionicons name="image-outline" size={20} color={PRIMARY} style={{ marginRight: 8 }} />
          <Text style={[styles.pickBtnText, { color: PRIMARY }]}>
            {photoUri ? 'Changer la photo' : 'Choisir une photo'}
          </Text>
        </TouchableOpacity>

        {/* ── Statut ────────────────────────────────────────────────────────── */}
        {photoUri && (
          <View style={[styles.statusBox, { backgroundColor: PRIMARY + '15', borderColor: PRIMARY + '40' }]}>
            <Ionicons name="checkmark-circle" size={18} color={PRIMARY} />
            <Text style={[styles.statusText, { color: PRIMARY }]}>Photo prête à uploader</Text>
          </View>
        )}

        {/* ── Bouton upload ─────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[
            styles.uploadBtn,
            { backgroundColor: photoUri && !loading ? BTN : BORDER },
          ]}
          onPress={handleUpload}
          disabled={!photoUri || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.uploadBtnText}>Uploader la photo</Text>
            </>
          )}
        </TouchableOpacity>

        {/* ── Passer ─ */}
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => router.replace('/Auth/Login')}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={[styles.skipText, { color: GRAY }]}>Passer cette étape →</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // ── Texte ────────────────────────────────────────────────────────────────────
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 36,
  },

  // ── Photo ────────────────────────────────────────────────────────────────────
  photoBox: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    marginBottom: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: 160,
    height: 160,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Bouton choisir ───────────────────────────────────────────────────────────
  pickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  pickBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Statut ───────────────────────────────────────────────────────────────────
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
    width: '100%',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // ── Bouton upload ─────────────────────────────────────────────────────────────
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    height: 54,
    width: '100%',
    marginBottom: 16,
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // ── Passer ───────────────────────────────────────────────────────────────────
  skipBtn: {
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default PhotoUpload;
