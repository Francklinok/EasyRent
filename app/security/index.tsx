import React, { useState } from 'react';
import { TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedScrollView } from '@/components/ui/ScrolleView';
import { useTheme } from '@/components/contexts/theme/themehook';
import { BackButton } from '@/components/ui/BackButton';

const SecuritySettings = () => {
  const { theme } = useTheme();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);

  const handleChangePassword = () => {
    Alert.alert('Changer le mot de passe', 'Un email de réinitialisation vous sera envoyé');
  };

  const handleEnable2FA = (value: boolean) => {
    if (value) {
      Alert.alert('Activer 2FA', 'Vous recevrez un code par SMS à chaque connexion');
    }
    setTwoFactorEnabled(value);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ThemedView style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <BackButton />
        <ThemedText type="title" style={{ fontSize: 20 }}>Sécurité</ThemedText>
      </ThemedView>

      <ThemedScrollView>
        <ThemedView style={{ padding: 16 }}>
          <ThemedView style={{ backgroundColor: theme.surface, borderRadius: 12, marginBottom: 16 }}>
            <TouchableOpacity
              onPress={handleChangePassword}
              style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.outline + '20' }}
            >
              <ThemedView style={{ backgroundColor: theme.primary + '20', borderRadius: 10, padding: 8, marginRight: 12 }}>
                <MaterialCommunityIcons name="lock-reset" size={20} color={theme.primary} />
              </ThemedView>
              <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>Changer le mot de passe</ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>Dernière modification il y a 3 mois</ThemedText>
              </ThemedView>
              <MaterialCommunityIcons name="chevron-right" size={20} color={theme.typography.caption} />
            </TouchableOpacity>

            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.outline + '20' }}>
              <ThemedView style={{ backgroundColor: theme.success + '20', borderRadius: 10, padding: 8, marginRight: 12 }}>
                <MaterialCommunityIcons name="two-factor-authentication" size={20} color={theme.success} />
              </ThemedView>
              <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>Authentification à 2 facteurs</ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>Sécurité renforcée</ThemedText>
              </ThemedView>
              <Switch
                value={twoFactorEnabled}
                onValueChange={handleEnable2FA}
                trackColor={{ false: theme.outline + '40', true: theme.success + '40' }}
                thumbColor={twoFactorEnabled ? theme.success : theme.outline}
              />
            </ThemedView>

            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.outline + '20' }}>
              <ThemedView style={{ backgroundColor: theme.secondary + '20', borderRadius: 10, padding: 8, marginRight: 12 }}>
                <MaterialCommunityIcons name="fingerprint" size={20} color={theme.secondary} />
              </ThemedView>
              <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>Biométrie</ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>Empreinte digitale / Face ID</ThemedText>
              </ThemedView>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: theme.outline + '40', true: theme.secondary + '40' }}
                thumbColor={biometricEnabled ? theme.secondary : theme.outline}
              />
            </ThemedView>

            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
              <ThemedView style={{ backgroundColor: theme.warning + '20', borderRadius: 10, padding: 8, marginRight: 12 }}>
                <MaterialCommunityIcons name="alert-circle" size={20} color={theme.warning} />
              </ThemedView>
              <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>Alertes de connexion</ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>Notification à chaque connexion</ThemedText>
              </ThemedView>
              <Switch
                value={loginAlerts}
                onValueChange={setLoginAlerts}
                trackColor={{ false: theme.outline + '40', true: theme.warning + '40' }}
                thumbColor={loginAlerts ? theme.warning : theme.outline}
              />
            </ThemedView>
          </ThemedView>

          <ThemedView style={{ backgroundColor: theme.surface, borderRadius: 12, padding: 16 }}>
            <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Sessions actives</ThemedText>
            <ThemedText style={{ fontSize: 12, color: theme.typography.caption, marginBottom: 12 }}>
              Vous êtes connecté sur 2 appareils
            </ThemedText>
            <TouchableOpacity
              onPress={() => Alert.alert('Déconnexion', 'Déconnecter tous les autres appareils ?')}
              style={{ backgroundColor: theme.error + '10', padding: 12, borderRadius: 8, alignItems: 'center' }}
            >
              <ThemedText style={{ color: theme.error, fontWeight: '600' }}>Déconnecter tous les appareils</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedScrollView>
    </SafeAreaView>
  );
};

export default SecuritySettings;
