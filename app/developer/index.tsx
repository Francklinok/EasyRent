import React, { useState } from 'react';
import { Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedScrollView } from '@/components/ui/ScrolleView';
import { useTheme } from '@/components/contexts/theme/themehook';
import { BackButton } from '@/components/ui/BackButton';

const DeveloperSettings = () => {
  const { theme } = useTheme();
  const [debugMode, setDebugMode] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [mockData, setMockData] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ThemedView style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <BackButton />
        <ThemedText type="title" style={{ fontSize: 20 }}>Développeur</ThemedText>
      </ThemedView>

      <ThemedScrollView>
        <ThemedView style={{ padding: 16 }}>
          <ThemedView style={{ backgroundColor: theme.warning + '10', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: theme.warning + '30' }}>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' }}>
              <MaterialCommunityIcons name="alert" size={20} color={theme.warning} style={{ marginRight: 8 }} />
              <ThemedText style={{ fontSize: 12, color: theme.warning, flex: 1 }}>
                Options réservées aux développeurs
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={{ backgroundColor: theme.surface, borderRadius: 12, marginBottom: 16 }}>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.outline + '20' }}>
              <ThemedView style={{ backgroundColor: theme.error + '20', borderRadius: 10, padding: 8, marginRight: 12 }}>
                <MaterialCommunityIcons name="bug" size={20} color={theme.error} />
              </ThemedView>
              <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>Mode Debug</ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>Afficher les erreurs</ThemedText>
              </ThemedView>
              <Switch
                value={debugMode}
                onValueChange={setDebugMode}
                trackColor={{ false: theme.outline + '40', true: theme.error + '40' }}
                thumbColor={debugMode ? theme.error : theme.outline}
              />
            </ThemedView>

            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.outline + '20' }}>
              <ThemedView style={{ backgroundColor: theme.primary + '20', borderRadius: 10, padding: 8, marginRight: 12 }}>
                <MaterialCommunityIcons name="console" size={20} color={theme.primary} />
              </ThemedView>
              <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>Logs console</ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>Afficher les logs</ThemedText>
              </ThemedView>
              <Switch
                value={showLogs}
                onValueChange={setShowLogs}
                trackColor={{ false: theme.outline + '40', true: theme.primary + '40' }}
                thumbColor={showLogs ? theme.primary : theme.outline}
              />
            </ThemedView>

            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
              <ThemedView style={{ backgroundColor: theme.secondary + '20', borderRadius: 10, padding: 8, marginRight: 12 }}>
                <MaterialCommunityIcons name="database-sync" size={20} color={theme.secondary} />
              </ThemedView>
              <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>Données de test</ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>Utiliser mock data</ThemedText>
              </ThemedView>
              <Switch
                value={mockData}
                onValueChange={setMockData}
                trackColor={{ false: theme.outline + '40', true: theme.secondary + '40' }}
                thumbColor={mockData ? theme.secondary : theme.outline}
              />
            </ThemedView>
          </ThemedView>

          <ThemedText style={{ fontSize: 13, fontWeight: '700', color: theme.typography.caption, marginBottom: 12 }}>
            INFORMATIONS
          </ThemedText>
          <ThemedView style={{ backgroundColor: theme.surface, borderRadius: 12, marginBottom: 16 }}>
            <ThemedView style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: theme.outline + '20' }}>
              <ThemedText style={{ fontSize: 12, color: theme.typography.caption, marginBottom: 4 }}>Version</ThemedText>
              <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>1.0.0 (Build 100)</ThemedText>
            </ThemedView>
            <ThemedView style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: theme.outline + '20' }}>
              <ThemedText style={{ fontSize: 12, color: theme.typography.caption, marginBottom: 4 }}>API Endpoint</ThemedText>
              <ThemedText style={{ fontSize: 14, fontWeight: '600' }}>https://api.renhouse.com</ThemedText>
            </ThemedView>
            <ThemedView style={{ padding: 16 }}>
              <ThemedText style={{ fontSize: 12, color: theme.typography.caption, marginBottom: 4 }}>Device ID</ThemedText>
              <ThemedText style={{ fontSize: 14, fontWeight: '600' }}>ABC123-DEF456-GHI789</ThemedText>
            </ThemedView>
          </ThemedView>

          <TouchableOpacity
            onPress={() => Alert.alert('Logs', 'Logs exportés vers le presse-papier')}
            style={{ backgroundColor: theme.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 }}
          >
            <ThemedText style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Exporter les logs</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Alert.alert('Reset', 'Toutes les données seront supprimées')}
            style={{ backgroundColor: theme.error + '10', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.error + '30' }}
          >
            <ThemedText style={{ color: theme.error, fontSize: 16, fontWeight: '600' }}>Réinitialiser l'app</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedScrollView>
    </SafeAreaView>
  );
};

export default DeveloperSettings;
