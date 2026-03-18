import React, { useState, useCallback, useEffect } from 'react';
import { TouchableOpacity, Switch, Alert, ActivityIndicator, View, Modal, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedScrollView } from '@/components/ui/ScrolleView';
import { useTheme } from '@/hooks/themehook';
import { useLanguage } from '@/components/contexts/language';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { BackButton } from '@/components/ui/BackButton';
import { useSecuritySettings } from '@/hooks/useSettings';
import { ActiveSession } from '@/services/api/settingsService';
import { getGraphQLService } from '@/services/api/graphqlService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SecuritySettings = () => {
  const { theme } = useTheme();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const userId = user?.id || '';

  const {
    settings,
    sessions,
    loading,
    actionLoading,
    error,
    twoFactorSetup,
    updateSettings,
    setup2FA,
    verify2FA,
    disable2FA,
    changePassword,
    revokeSession,
    revokeAllSessions,
    refresh
  } = useSecuritySettings(userId);

  const backgroundColor = Array.isArray(theme.background) ? theme.background[0] : theme.background;

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [selected2FAMethod, setSelected2FAMethod] = useState<'sms' | 'email' | 'authenticator'>('authenticator');
  const insets = useSafeAreaInsets();

  const [notifPrefs, setNotifPrefs] = useState({ push: true, email: true, sms: false });
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const loadNotifPrefs = async () => {
      try {
        const graphql = getGraphQLService();
        const res = await graphql.query<{ notificationPreferences: any }>(
          `query { notificationPreferences { preferences { general { push email sms } } } }`,
          {}
        );
        const general = res.notificationPreferences?.preferences?.general;
        if (general) {
          setNotifPrefs({ push: general.push, email: general.email, sms: general.sms });
        }
      } catch (e) {}
    };
    loadNotifPrefs();
  }, [userId]);

  const updateNotifPref = useCallback(async (key: 'push' | 'email' | 'sms', value: boolean) => {
    const prev = { ...notifPrefs };
    setNotifPrefs(p => ({ ...p, [key]: value }));
    setNotifLoading(true);
    try {
      const graphql = getGraphQLService();
      await graphql.query(
        `mutation UpdateNotifPrefs($input: UpdateNotificationPreferencesInput!) {
          updateNotificationPreferences(input: $input) { id }
        }`,
        { input: { general: { ...notifPrefs, [key]: value } } }
      );
    } catch (e) {
      setNotifPrefs(prev);
      Alert.alert('Erreur', 'Impossible de mettre à jour les préférences de notification');
    } finally {
      setNotifLoading(false);
    }
  }, [notifPrefs]);

  const getPasswordAge = () => {
    if (!settings?.lastPasswordChange) return 'Jamais modifié';
    const lastChange = new Date(settings.lastPasswordChange);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 30) return `Il y a ${diffDays} jours`;
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
    return `Il y a ${Math.floor(diffDays / 365)} an(s)`;
  };

  // Compute security score
  const getSecurityScore = () => {
    let score = 0;
    if (settings?.twoFactorEnabled) score += 40;
    if (settings?.biometricEnabled) score += 20;
    if (settings?.loginNotifications) score += 20;
    if (settings?.lastPasswordChange) {
      const days = Math.floor((Date.now() - new Date(settings.lastPasswordChange).getTime()) / (1000 * 60 * 60 * 24));
      if (days < 90) score += 20;
    }
    return score;
  };

  // const securityScore = getSecurityScore();
  // const scoreColor = securityScore >= 80 ? theme.success : securityScore >= 50 ? theme.warning : theme.error;
  // const scoreLabel = securityScore >= 80 ? 'Excellent' : securityScore >= 50 ? 'Moyen' : 'Faible';

  const handleChangePassword = useCallback(async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('common.error'), 'Veuillez remplir tous les champs');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('errors.passwordMismatch'));
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert(t('common.error'), t('errors.passwordTooShort'));
      return;
    }
    const result = await changePassword(currentPassword, newPassword);
    if (result.success) {
      Alert.alert(t('common.success'), 'Mot de passe modifié avec succès');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      Alert.alert(t('common.error'), result.message);
    }
  }, [currentPassword, newPassword, confirmPassword, changePassword, t]);

  const handleSetup2FA = useCallback(async () => {
    const result = await setup2FA(selected2FAMethod);
    if (result) {
      setShow2FAModal(false);
      setShowVerifyModal(true);
    } else {
      Alert.alert(t('common.error'), 'Échec de la configuration 2FA');
    }
  }, [selected2FAMethod, setup2FA, t]);

  const handleVerify2FA = useCallback(async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert(t('common.error'), 'Veuillez entrer un code à 6 chiffres');
      return;
    }
    const result = await verify2FA(verificationCode);
    if (result.success) {
      Alert.alert(t('common.success'), 'Authentification à deux facteurs activée');
      setShowVerifyModal(false);
      setVerificationCode('');
    } else {
      Alert.alert(t('common.error'), result.message);
    }
  }, [verificationCode, verify2FA, t]);

  const handleDisable2FA = useCallback(async () => {
    if (!disablePassword) {
      Alert.alert(t('common.error'), 'Veuillez entrer votre mot de passe');
      return;
    }
    const result = await disable2FA(disablePassword);
    if (result.success) {
      Alert.alert(t('common.success'), 'Authentification à deux facteurs désactivée');
      setShowDisable2FAModal(false);
      setDisablePassword('');
    } else {
      Alert.alert(t('common.error'), result.message);
    }
  }, [disablePassword, disable2FA, t]);

  const handleRevokeSession = useCallback(async (sessionId: string) => {
    Alert.alert(
      "Déconnecter l'appareil",
      'Voulez-vous déconnecter cet appareil ?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            const success = await revokeSession(sessionId);
            if (!success) Alert.alert(t('common.error'), t('errors.general'));
          }
        }
      ]
    );
  }, [revokeSession, t]);

  const handleRevokeAllSessions = useCallback(async () => {
    Alert.alert(
      'Déconnecter tous les appareils',
      'Vous serez déconnecté de tous les autres appareils. Continuer ?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Déconnecter tout',
          style: 'destructive',
          onPress: async () => {
            const result = await revokeAllSessions(true);
            if (result.success) {
              Alert.alert(t('common.success'), `${result.revokedCount} session(s) déconnectée(s)`);
            } else {
              Alert.alert(t('common.error'), t('errors.general'));
            }
          }
        }
      ]
    );
  }, [revokeAllSessions, t]);

  const renderSession = useCallback(({ item }: { item: ActiveSession }) => (
    <ThemedView
      style={{
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        padding: 14,
        marginBottom: 8,
        borderRadius: 14,
        backgroundColor: item.isCurrent ? theme.primary + '12' : theme.surface,
        borderWidth: 1,
        borderColor: item.isCurrent ? theme.primary + '30' : theme.outline + '15',
      }}
    >
      <ThemedView style={{
        backgroundColor: (item.deviceType === 'mobile' ? theme.primary : theme.secondary) + '20',
        borderRadius: 12,
        padding: 8,
        marginRight: isRTL ? 0 : 15,
        marginLeft: isRTL ? 15 : 0
      }}>
        <MaterialCommunityIcons
          name={item.deviceType === 'mobile' ? 'cellphone' : item.deviceType === 'tablet' ? 'tablet' : 'laptop'}
          size={22}
          color={item.deviceType === 'mobile' ? theme.primary : theme.secondary}
        />
      </ThemedView>
      <ThemedView style={{ flex: 1 }}>
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ThemedText style={{ fontSize: 16, fontWeight: '600', color: theme.typography.body }}>{item.deviceName}</ThemedText>
          {item.isCurrent && (
            <ThemedView style={{
              backgroundColor: theme.success,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 10
            }}>
              <ThemedText style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>Actuel</ThemedText>
            </ThemedView>
          )}
        </ThemedView>
        <ThemedText type="caption" intensity="light" style={{ color: theme.typography.caption, marginTop: 2 }}>
          {item.location} • {item.ipAddress}
        </ThemedText>
        <ThemedText type="caption" intensity="light" style={{ color: theme.typography.caption, marginTop: 1 }}>
          Dernière activité: {new Date(item.lastActive).toLocaleString()}
        </ThemedText>
      </ThemedView>
      {!item.isCurrent && (
        <TouchableOpacity
          onPress={() => handleRevokeSession(item.id)}
          style={{
            backgroundColor: theme.error + '15',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 10
          }}
        >
          <MaterialCommunityIcons name="logout" size={18} color={theme.error} />
        </TouchableOpacity>
      )}
    </ThemedView>
  ), [theme, isRTL, handleRevokeSession]);

  const SectionLabel = ({ label }: { label: string }) => (
    <ThemedView style={{ paddingHorizontal: 8, paddingVertical: 8, marginBottom: 0, marginTop: 10 }}>
      <ThemedText type="normaltitle" intensity="light" style={{
        textAlign: isRTL ? 'right' : 'left', fontWeight: '700'
      }}>
        {label}
      </ThemedText>
    </ThemedView>
  );

  // Reusable row item inside a card
  const RowItem = ({
    icon,
    iconColor,
    label,
    caption,
    right,
    onPress,
    noBorder = false
  }: {
    icon: string;
    iconColor: string;
    label: string;
    caption?: string;
    right?: React.ReactNode;
    onPress?: () => void;
    noBorder?: boolean;
  }) => {
    const Wrapper: any = onPress ? TouchableOpacity : View;
    return (
      <Wrapper
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderBottomWidth: noBorder ? 0 : 1,
          borderBottomColor: theme.outline + '18',
          backgroundColor: "transparent"

        }}
      >
        <ThemedView style={{
          backgroundColor: iconColor + '20',
          borderRadius: 12,
          padding: 8,
          marginRight: isRTL ? 0 : 15,
          marginLeft: isRTL ? 15 : 0
        }}>
          <MaterialCommunityIcons name={icon as any} size={20} color={iconColor} />
        </ThemedView>
        <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
          <ThemedText type = "normal" style={{
            fontWeight: '600',
            marginBottom: caption ? 2 : 0
          }}>
            {label}
          </ThemedText>
          {caption && (
            <ThemedText type="caption" intensity="light" >
              {caption}
            </ThemedText>
          )}
        </ThemedView>
        {right}
      </Wrapper>
    );
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <ThemedView style={{ paddingHorizontal: 16 }}>

          {/* Password Section */}
          <SectionLabel label="Mot de passe" />
          <ThemedView
            style={{ borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.outline + '35' }}
          >
            <RowItem
              icon="lock-reset"
              iconColor={theme.primary}
              label={t('profile.changePassword')}
              caption={getPasswordAge()}
              right={<MaterialCommunityIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={theme.typography.caption} />}
              onPress={() => setShowPasswordModal(true)}
              noBorder
            />
          </ThemedView>

          {/* 2FA & Security */}
          <SectionLabel label="Authentification & Accès" />
          <ThemedView
            style={{ borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.outline + '25' }}
          >
            <RowItem
              icon="two-factor-authentication"
              iconColor={theme.secondary}
              label="Double authentification"
              caption={settings?.twoFactorEnabled
                ? `Activé via ${settings.twoFactorMethod === 'sms' ? 'SMS' : settings.twoFactorMethod === 'email' ? 'Email' : 'Authenticator'}`
                : 'Protection supplémentaire'}
              right={
                <Switch
                  value={settings?.twoFactorEnabled || false}
                  onValueChange={(value) => {
                    if (value) setShow2FAModal(true);
                    else setShowDisable2FAModal(true);
                  }}
                  disabled={actionLoading}
                  trackColor={{ false: theme.outline + '40', true: theme.secondary + '60' }}
                  thumbColor={settings?.twoFactorEnabled ? theme.secondary : theme.outline}
                />
              }
            />
            <RowItem
              icon="fingerprint"
              iconColor={theme.green800}
              label="Biométrie"
              caption="Empreinte digitale / Face ID"
              right={
                <Switch
                  value={settings?.biometricEnabled || false}
                  onValueChange={async (value) => {
                    const success = await updateSettings({ biometricEnabled: value });
                    if (!success) Alert.alert(t('common.error'), t('errors.general'));
                  }}
                  disabled={actionLoading}
                  trackColor={{ false: theme.outline + '40', true: theme.green500 + '60' }}
                  thumbColor={settings?.biometricEnabled ? theme.green500 : theme.outline}
                />
              }
            />
            <RowItem
              icon="bell-alert"
              iconColor={theme.star}
              label="Alertes de connexion"
              caption="Notification à chaque nouvelle connexion"
              noBorder
              right={
                <Switch
                  value={settings?.loginNotifications || false}
                  onValueChange={async (value) => {
                    const success = await updateSettings({ loginNotifications: value });
                    if (!success) Alert.alert(t('common.error'), t('errors.general'));
                  }}
                  disabled={actionLoading}
                  trackColor={{ false: theme.outline + '40', true: theme.star + '60' }}
                  thumbColor={settings?.loginNotifications ? theme.star : theme.outline}
                />
              }
            />
          </ThemedView>

          {/* Active Sessions */}
          <SectionLabel label="Sessions actives" />
          <ThemedView
            style={{ borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.outline + '25' }}
          >
            <RowItem
              icon="devices"
              iconColor={theme.primary}
              label={`${sessions.length} appareil(s) connecté(s)`}
              caption={`Maximum: ${settings?.maxActiveSessions || 5} sessions`}
              right={<MaterialCommunityIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={theme.typography.caption} />}
              onPress={() => setShowSessionsModal(true)}
            />
            <ThemedView style={{ paddingHorizontal: 14, paddingBottom: 14, paddingTop: 4 }}>
              <TouchableOpacity
                onPress={handleRevokeAllSessions}
                disabled={actionLoading || sessions.length <= 1}
                style={{
                  backgroundColor: sessions.length > 1 ? theme.error + '12' : theme.outline + '10',
                  paddingVertical: 11,
                  borderRadius: 12,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: sessions.length > 1 ? theme.error + '25' : 'transparent'
                }}
              >
                <ThemedText style={{
                  color: sessions.length > 1 ? theme.error : theme.typography.caption,
                  fontWeight: '600',
                  fontSize: 13
                }}>
                  Déconnecter tous les autres appareils
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          <SectionLabel label="Notifications" />
          <ThemedView
            style={{ borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.outline + '25' }}
          >
            <RowItem
              icon="bell-ring"
              iconColor={theme.secondary}
              label="Notifications push"
              caption="Recevoir des notifications sur votre appareil"
              right={
                <Switch
                  value={notifPrefs.push}
                  onValueChange={(value) => updateNotifPref('push', value)}
                  disabled={notifLoading}
                  trackColor={{ false: theme.outline + '40', true: theme.secondary + '60' }}
                  thumbColor={notifPrefs.push ? theme.secondary : theme.outline}
                />
              }
            />
            <RowItem
              icon="email"
              iconColor={theme.warning}
              label="Notifications email"
              caption="Recevoir des notifications par email"
              right={
                <Switch
                  value={notifPrefs.email}
                  onValueChange={(value) => updateNotifPref('email', value)}
                  disabled={notifLoading}
                  trackColor={{ false: theme.outline + '40', true: theme.warning + '60' }}
                  thumbColor={notifPrefs.email ? theme.warning : theme.outline}
                />
              }
            />
            <RowItem
              icon="message-text"
              iconColor={theme.green800}
              label="Notifications SMS"
              caption="Recevoir des notifications par SMS"
              noBorder
              right={
                <Switch
                  value={notifPrefs.sms}
                  onValueChange={(value) => updateNotifPref('sms', value)}
                  disabled={notifLoading}
                  trackColor={{ false: theme.outline + '40', true: theme.green800 + '60' }}
                  thumbColor={notifPrefs.sms ? theme.green800 : theme.outline}
                />
              }
            />
          </ThemedView>

          {/* Security Tip */}
          <ThemedView
            style={{
              marginTop: 20,
              borderRadius: 16,
              backgroundColor: theme.warning + '10',
              borderWidth: 1,
              borderColor: theme.warning + '30',
              padding: 16,
              flexDirection: isRTL ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: 12
            }}
          >
            <ThemedView style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: theme.warning + '20',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <MaterialCommunityIcons name="lightbulb-on" size={20} color={theme.warning} />
            </ThemedView>
            <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
              <ThemedText style={{ fontWeight: '700', fontSize: 13, marginBottom: 4 }}>
                Conseil de sécurité
              </ThemedText>
              <ThemedText style={{ color: theme.typography.caption, lineHeight: 18, fontSize: 12 }}>
                {!settings?.twoFactorEnabled
                  ? "Activez l'authentification à deux facteurs pour une sécurité renforcée."
                  : 'Votre compte est bien protégé. Pensez à changer régulièrement votre mot de passe.'}
              </ThemedText>
            </ThemedView>
          </ThemedView>

        </ThemedView>
      </ThemedScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <ThemedView style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <ThemedView style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.outline + '20'
          }}>
            <TouchableOpacity
              onPress={() => setShowPasswordModal(false)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: theme.surface,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.outline + '20'
              }}
            >
              <MaterialCommunityIcons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
            <ThemedText type="subtitle" intensity="strong" style={{ flex: 1, textAlign: 'center' }}>
              Changer le mot de passe
            </ThemedText>
            <ThemedView style={{ width: 36 }} />
          </ThemedView>

          <ThemedScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
            <ThemedView style={{ gap: 16 }}>
              {[
                { label: 'Mot de passe actuel', value: currentPassword, onChange: setCurrentPassword, placeholder: 'Entrez votre mot de passe actuel' },
                { label: 'Nouveau mot de passe', value: newPassword, onChange: setNewPassword, placeholder: 'Minimum 8 caractères' },
                { label: 'Confirmer le nouveau mot de passe', value: confirmPassword, onChange: setConfirmPassword, placeholder: 'Répétez le nouveau mot de passe' },
              ].map((field) => (
                <ThemedView key={field.label}>
                  <ThemedText type="normal" intensity="strong" style={{ marginBottom: 6, color: theme.typography.caption, letterSpacing: 0.3 }}>
                    {field.label}
                  </ThemedText>
                  <TextInput
                    placeholder={field.placeholder}
                    placeholderTextColor={theme.typography.caption}
                    secureTextEntry
                    value={field.value}
                    onChangeText={field.onChange}
                    style={{
                      backgroundColor: theme.surfaceVariant,
                      borderRadius: 12,
                      padding: 14,
                      color: theme.text,
                      fontSize: 14,
                      borderWidth: 1,
                      borderColor: theme.outline + '20'
                    }}
                  />
                </ThemedView>
              ))}

              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={actionLoading}
                style={{
                  backgroundColor: theme.secondary,
                  padding: 16,
                  borderRadius: 14,
                  alignItems: 'center',
                  marginTop: 8,
                  shadowColor: theme.secondary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 4
                }}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
                    Changer le mot de passe
                  </ThemedText>
                )}
              </TouchableOpacity>
            </ThemedView>
          </ThemedScrollView>
        </ThemedView>
      </Modal>

      {/* 2FA Setup Modal */}
      <Modal
        visible={show2FAModal}
        animationType="slide"
        onRequestClose={() => setShow2FAModal(false)}
      >
        <ThemedView style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <ThemedView style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.outline + '20'
          }}>
            <TouchableOpacity
              onPress={() => setShow2FAModal(false)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: theme.surface,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.outline + '20'
              }}
            >
              <MaterialCommunityIcons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
            <ThemedText type="subtitle" intensity="strong" style={{ flex: 1, textAlign: 'center' }}>
              Configurer 2FA
            </ThemedText>
            <ThemedView style={{ width: 36 }} />
          </ThemedView>

          <ThemedScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
            <ThemedText style={{ color: theme.typography.caption, marginBottom: 20, textAlign: 'center', fontSize: 13 }}>
              Choisissez une méthode pour recevoir vos codes de vérification
            </ThemedText>

            {([
              { method: 'authenticator' as const, icon: 'cellphone-key', label: 'Application Authenticator', desc: 'Google Authenticator, Authy, etc.' },
              { method: 'sms' as const, icon: 'message-text', label: 'SMS', desc: 'Recevoir un code par SMS' },
              { method: 'email' as const, icon: 'email', label: 'Email', desc: 'Recevoir un code par email' },
            ]).map((item) => (
              <TouchableOpacity
                key={item.method}
                onPress={() => setSelected2FAMethod(item.method)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: selected2FAMethod === item.method ? theme.secondary + '12' : theme.surface,
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 10,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  borderWidth: 1.5,
                  borderColor: selected2FAMethod === item.method ? theme.secondary : theme.outline + '20'
                }}
              >
                <ThemedView style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  backgroundColor: (selected2FAMethod === item.method ? theme.secondary : theme.outline) + '15',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: isRTL ? 0 : 12,
                  marginLeft: isRTL ? 12 : 0
                }}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={22}
                    color={selected2FAMethod === item.method ? theme.secondary : theme.typography.caption}
                  />
                </ThemedView>
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText style={{ fontWeight: '600', fontSize: 14 }}>{item.label}</ThemedText>
                  <ThemedText style={{ color: theme.typography.caption, fontSize: 12, marginTop: 2 }}>{item.desc}</ThemedText>
                </ThemedView>
                <ThemedView style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  borderWidth: 2,
                  borderColor: selected2FAMethod === item.method ? theme.secondary : theme.outline + '50',
                  backgroundColor: selected2FAMethod === item.method ? theme.secondary : 'transparent',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {selected2FAMethod === item.method && (
                    <MaterialCommunityIcons name="check" size={13} color="#FFFFFF" />
                  )}
                </ThemedView>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={handleSetup2FA}
              disabled={actionLoading}
              style={{
                backgroundColor: theme.secondary,
                padding: 16,
                borderRadius: 14,
                alignItems: 'center',
                marginTop: 8,
                shadowColor: theme.secondary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 4
              }}
            >
              {actionLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
                  Continuer
                </ThemedText>
              )}
            </TouchableOpacity>
          </ThemedScrollView>
        </ThemedView>
      </Modal>

      {/* Verify 2FA Modal */}
      <Modal
        visible={showVerifyModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowVerifyModal(false)}
      >
        <ThemedView style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24
        }}>
          <ThemedView
            style={{
              backgroundColor: theme.surface,
              borderRadius: 24,
              padding: 24,
              width: '100%',
              maxWidth: 400
            }}
          >
            <ThemedView style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: theme.primary + '18',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              marginBottom: 16
            }}>
              <MaterialCommunityIcons name="shield-key" size={32} color={theme.primary} />
            </ThemedView>

            <ThemedText type="subtitle" intensity="strong" style={{ textAlign: 'center', marginBottom: 6 }}>
              Vérification
            </ThemedText>
            <ThemedText type="caption" intensity="light" style={{ textAlign: 'center', color: theme.typography.caption, marginBottom: 20 }}>
              {selected2FAMethod === 'authenticator'
                ? 'Scannez le QR code avec votre application et entrez le code'
                : `Un code a été envoyé à votre ${selected2FAMethod === 'sms' ? 'téléphone' : 'email'}`}
            </ThemedText>

            {twoFactorSetup?.qrCode && selected2FAMethod === 'authenticator' && (
              <ThemedView style={{ alignItems: 'center', marginBottom: 20 }}>
                <ThemedView style={{
                  width: 150,
                  height: 150,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: theme.outline + '20'
                }}>
                  <MaterialCommunityIcons name="qrcode" size={100} color="#000000" />
                </ThemedView>
              </ThemedView>
            )}

            <TextInput
              placeholder="• • • • • •"
              placeholderTextColor={theme.typography.caption}
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              maxLength={6}
              style={{
                backgroundColor: backgroundColor,
                borderRadius: 14,
                padding: 16,
                color: theme.text,
                fontSize: 28,
                textAlign: 'center',
                letterSpacing: 10,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: theme.outline + '25'
              }}
            />

            <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => { setShowVerifyModal(false); setVerificationCode(''); }}
                style={{
                  flex: 1,
                  backgroundColor: theme.outline + '18',
                  padding: 14,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
              >
                <ThemedText style={{ fontWeight: '600', fontSize: 14 }}>{t('common.cancel')}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleVerify2FA}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  backgroundColor: theme.primary,
                  padding: 14,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText style={{ fontWeight: '700', color: '#FFFFFF', fontSize: 14 }}>Vérifier</ThemedText>
                )}
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>

      {/* Disable 2FA Modal */}
      <Modal
        visible={showDisable2FAModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowDisable2FAModal(false)}
      >
        <ThemedView style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24
        }}>
          <ThemedView
            style={{
              backgroundColor: theme.surface,
              borderRadius: 24,
              padding: 24,
              width: '100%',
              maxWidth: 400
            }}
          >
            <ThemedView style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: theme.warning + '18',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              marginBottom: 16
            }}>
              <MaterialCommunityIcons name="shield-off" size={32} color={theme.warning} />
            </ThemedView>

            <ThemedText type="subtitle" intensity="strong" style={{ textAlign: 'center', marginBottom: 6 }}>
              Désactiver 2FA
            </ThemedText>
            <ThemedText type="caption" intensity="light" style={{ textAlign: 'center', color: theme.typography.caption, marginBottom: 20 }}>
              Entrez votre mot de passe pour désactiver l'authentification à deux facteurs
            </ThemedText>

            <TextInput
              placeholder="Mot de passe"
              placeholderTextColor={theme.typography.caption}
              secureTextEntry
              value={disablePassword}
              onChangeText={setDisablePassword}
              style={{
                backgroundColor: backgroundColor,
                borderRadius: 14,
                padding: 14,
                color: theme.text,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: theme.outline + '25',
                fontSize: 14
              }}
            />

            <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => { setShowDisable2FAModal(false); setDisablePassword(''); }}
                style={{
                  flex: 1,
                  backgroundColor: theme.outline + '18',
                  padding: 14,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
              >
                <ThemedText style={{ fontWeight: '600', fontSize: 14 }}>{t('common.cancel')}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDisable2FA}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  backgroundColor: theme.warning,
                  padding: 14,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText style={{ fontWeight: '700', color: '#FFFFFF', fontSize: 14 }}>Désactiver</ThemedText>
                )}
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>

      {/* Sessions Modal */}
      <Modal
        visible={showSessionsModal}
        animationType="slide"
        onRequestClose={() => setShowSessionsModal(false)}
      >
        <ThemedView style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <ThemedView style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.outline + '20'
          }}>
            <TouchableOpacity
              onPress={() => setShowSessionsModal(false)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: theme.surface,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.outline + '20'
              }}
            >
              <MaterialCommunityIcons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
            <ThemedText type="subtitle" intensity="strong" style={{ flex: 1, textAlign: 'center' }}>
              Sessions actives
            </ThemedText>
            <ThemedView style={{ width: 36 }} />
          </ThemedView>

          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            renderItem={renderSession}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                <MaterialCommunityIcons name="devices" size={56} color={theme.typography.caption} />
                <ThemedText type="caption" intensity="light" style={{ marginTop: 14, textAlign: 'center', color: theme.typography.caption }}>
                  Aucune session active
                </ThemedText>
              </View>
            }
          />
        </ThemedView>
      </Modal>

      {/* Loading toast */}
      {actionLoading && (
        <ThemedView style={{
          position: 'absolute',
          top: 100,
          left: 0,
          right: 0,
          alignItems: 'center',
          pointerEvents: 'none'
        }}>
          <ThemedView
            style={{
              backgroundColor: theme.primary,
              paddingHorizontal: 18,
              paddingVertical: 10,
              borderRadius: 22,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6
            }}
          >
            <ActivityIndicator size="small" color="#FFFFFF" />
            <ThemedText style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>Chargement...</ThemedText>
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
};

export default SecuritySettings;
