import React, { useState } from 'react';
import { Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedScrollView } from '@/components/ui/ScrolleView';
import { useTheme } from '@/components/contexts/theme/themehook';
import { BackButton } from '@/components/ui/BackButton';

const PrivacySettings = () => {
  const { theme } = useTheme();
  const [profileVisible, setProfileVisible] = useState(true);
  const [activityTracking, setActivityTracking] = useState(true);
  const [dataCollection, setDataCollection] = useState(false);
  const [shareAnalytics, setShareAnalytics] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => {} }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ThemedView style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <BackButton />
        <ThemedText type="title" style={{ fontSize: 20 }}>Confidentialité</ThemedText>
      </ThemedView>

      <ThemedScrollView>
        <ThemedView style={{ padding: 16 }}>
          <ThemedText style={{ fontSize: 13, fontWeight: '700', color: theme.typography.caption, marginBottom: 12 }}>
            VISIBILITÉ
          </ThemedText>
          <ThemedView style={{ backgroundColor: theme.surface, borderRadius: 12, marginBottom: 16 }}>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.outline + '20' }}>
              <ThemedView style={{ backgroundColor: theme.primary + '20', borderRadius: 10, padding: 8, marginRight: 12 }}>
                <MaterialCommunityIcons name="account-eye" size={20} color={theme.primary} />
              </ThemedView>
              <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>Profil public</ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>Visible par tous les utilisateurs</ThemedText>
              </ThemedView>
              <Switch
                value={profileVisible}
                onValueChange={setProfileVisible}
                trackColor={{ false: theme.outline + '40', true: theme.primary + '40' }}
                thumbColor={profileVisible ? theme.primary : theme.outline}
              />
            </ThemedView>

            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
              <ThemedView style={{ backgroundColor: theme.secondary + '20', borderRadius: 10, padding: 8, marginRight: 12 }}>
                <MaterialCommunityIcons name="map-marker" size={20} color={theme.secondary} />
              </ThemedView>
              <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>Localisation</ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>Partager ma position</ThemedText>
              </ThemedView>
              <Switch
                value={locationTracking}
                onValueChange={setLocationTracking}
                trackColor={{ false: theme.outline + '40', true: theme.secondary + '40' }}
                thumbColor={locationTracking ? theme.secondary : theme.outline}
              />
            </ThemedView>
          </ThemedView>

          <ThemedText style={{ fontSize: 13, fontWeight: '700', color: theme.typography.caption, marginBottom: 12 }}>
            DONNÉES
          </ThemedText>
          <ThemedView style={{ backgroundColor: theme.surface, borderRadius: 12, marginBottom: 16 }}>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.outline + '20' }}>
              <ThemedView style={{ backgroundColor: theme.success + '20', borderRadius: 10, padding: 8, marginRight: 12 }}>
                <MaterialCommunityIcons name="chart-line" size={20} color={theme.success} />
              </ThemedView>
              <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>Suivi d'activité</ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>Améliorer l'expérience</ThemedText>
              </ThemedView>
              <Switch
                value={activityTracking}
                onValueChange={setActivityTracking}
                trackColor={{ false: theme.outline + '40', true: theme.success + '40' }}
                thumbColor={activityTracking ? theme.success : theme.outline}
              />
            </ThemedView>

            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.outline + '20' }}>
              <ThemedView style={{ backgroundColor: theme.warning + '20', borderRadius: 10, padding: 8, marginRight: 12 }}>
                <MaterialCommunityIcons name="database" size={20} color={theme.warning} />
              </ThemedView>
              <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>Collecte de données</ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>Données anonymisées</ThemedText>
              </ThemedView>
              <Switch
                value={dataCollection}
                onValueChange={setDataCollection}
                trackColor={{ false: theme.outline + '40', true: theme.warning + '40' }}
                thumbColor={dataCollection ? theme.warning : theme.outline}
              />
            </ThemedView>

            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
              <ThemedView style={{ backgroundColor: '#9b59b6' + '20', borderRadius: 10, padding: 8, marginRight: 12 }}>
                <MaterialCommunityIcons name="google-analytics" size={20} color="#9b59b6" />
              </ThemedView>
              <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>Analytics</ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>Statistiques d'utilisation</ThemedText>
              </ThemedView>
              <Switch
                value={shareAnalytics}
                onValueChange={setShareAnalytics}
                trackColor={{ false: theme.outline + '40', true: '#9b59b6' + '40' }}
                thumbColor={shareAnalytics ? '#9b59b6' : theme.outline}
              />
            </ThemedView>
          </ThemedView>

          <ThemedText style={{ fontSize: 13, fontWeight: '700', color: theme.typography.caption, marginBottom: 12 }}>
            ZONE DANGEREUSE
          </ThemedText>
          <ThemedView style={{ backgroundColor: theme.surface, borderRadius: 12 }}>
            <TouchableOpacity
              onPress={handleDeleteAccount}
              style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
            >
              <ThemedView style={{ backgroundColor: theme.error + '20', borderRadius: 10, padding: 8, marginRight: 12 }}>
                <MaterialCommunityIcons name="delete-forever" size={20} color={theme.error} />
              </ThemedView>
              <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                <ThemedText style={{ fontSize: 16, fontWeight: '600', color: theme.error }}>Supprimer mon compte</ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>Action irréversible</ThemedText>
              </ThemedView>
              <MaterialCommunityIcons name="chevron-right" size={20} color={theme.error} />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedScrollView>
    </SafeAreaView>
  );
};

export default PrivacySettings;
