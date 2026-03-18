import React, { useState, useCallback } from 'react';
import { Switch, TouchableOpacity, Alert, ActivityIndicator, View, FlatList, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedScrollView } from '@/components/ui/ScrolleView';
import { useTheme } from '@/hooks/themehook';
import { useLanguage } from '@/components/contexts/language';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { usePrivacySettings } from '@/hooks/useSettings';
import { BlockedUser } from '@/services/api/settingsService';
import { usePrivacy } from '@/components/contexts/privacy/PrivacyContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PrivacySettings = () => {
  const { theme } = useTheme();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const userId = user?.id || '';
  const insets = useSafeAreaInsets();

  const {
    settings,
    blockedUsers,
    loading,
    saving,
    updateSettings: updatePrivacySettings,
    unblockUser,
  } = usePrivacySettings(userId);
  const { refresh: refreshPrivacyContext } = usePrivacy();

  const updateSettings = useCallback(async (data: any) => {
    const success = await updatePrivacySettings(data);
    if (success) refreshPrivacyContext();
    return success;
  }, [updatePrivacySettings, refreshPrivacyContext]);

  const backgroundColor = Array.isArray(theme.background) ? theme.background[0] : theme.background;
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const handleToggle = useCallback(async (key: string, value: boolean) => {
    if (!settings) return;
    let updateData: any = {};
    if (key.startsWith('dataSharing.')) {
      const subKey = key.replace('dataSharing.', '');
      updateData = { dataSharing: { ...settings.dataSharing, [subKey]: value } };
    } else {
      updateData = { [key]: value };
    }
    const success = await updateSettings(updateData);
    if (!success) Alert.alert(t('common.error'), t('errors.general'));
  }, [settings, updateSettings, t]);

  const handleUnblockUser = useCallback(async (targetUserId: string) => {
    Alert.alert(
      'Débloquer',
      'Voulez-vous débloquer cet utilisateur ?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Débloquer',
          onPress: async () => {
            const success = await unblockUser(targetUserId);
            if (!success) Alert.alert(t('common.error'), t('errors.general'));
          }
        }
      ]
    );
  }, [unblockUser, t]);

  // Section label 
  const SectionLabel = ({ label }: { label: string }) => (
    <ThemedView style={{ paddingHorizontal: 8, paddingVertical: 8, marginBottom: 0, marginTop: 8 }}>
      <ThemedText type="normaltitle" intensity="light" style={{
        textAlign: isRTL ? 'right' : 'left', fontWeight: '700'
      }}>
        {label}
      </ThemedText>
    </ThemedView>
  );

  // Row item 
  const RowItem = ({
    icon,
    iconColor,
    label,
    caption,
    right,
    onPress,
    noBorder = false,
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
          paddingVertical: 6,
          paddingHorizontal: 16,
          borderBottomWidth: noBorder ? 0 : 1,
          borderBottomColor: theme.outline + '18',
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
            <ThemedText type="caption" intensity="light" style={{ color: theme.typography.caption }}>
              {caption}
            </ThemedText>
          )}
        </ThemedView>
        {right}
      </Wrapper>
    );
  };

  const renderBlockedUser = useCallback(({ item }: { item: BlockedUser }) => (
    <ThemedView
      style={{
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        padding: 14,
        marginBottom: 8,
        borderRadius: 14,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.outline + '15',
      }}
    >
      <ThemedView style={{
        backgroundColor: theme.primary + '20',
        borderRadius: 12,
        padding: 8,
        marginRight: isRTL ? 0 : 15,
        marginLeft: isRTL ? 15 : 0
      }}>
        <MaterialCommunityIcons name="account" size={22} color={theme.primary} />
      </ThemedView>
      <ThemedView style={{ flex: 1 }}>
        <ThemedText style={{ fontSize: 16, fontWeight: '600', color: theme.typography.body }}>
          {item.username}
        </ThemedText>
        <ThemedText type="caption" intensity="light" style={{ color: theme.typography.caption, marginTop: 2 }}>
          Bloqué le {new Date(item.blockedAt).toLocaleDateString()}
        </ThemedText>
      </ThemedView>
      <TouchableOpacity
        onPress={() => handleUnblockUser(item.id)}
        style={{
          backgroundColor: theme.error + '15',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: theme.error + '25'
        }}
      >
        <ThemedText style={{ color: theme.error, fontSize: 13, fontWeight: '600' }}>
          Débloquer
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  ), [theme, isRTL, handleUnblockUser]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <ThemedView style={{ paddingHorizontal: 16 }}>

          {/* Contact Info Visibility */}
          <SectionLabel label="Informations de contact" />
          <ThemedView
            style={{ borderRadius: 16, overflow: 'hidden',borderWidth: 1, borderColor: theme.outline + '25' }}
          >
            {[
              { key: 'showEmail', icon: 'email', label: "Afficher l'email", color: theme.primary },
              { key: 'showPhone', icon: 'phone', label: 'Afficher le téléphone', color: theme.secondary },
              { key: 'showAddress', icon: 'map-marker', label: "Afficher l'adresse", color: theme.warning },
              { key: 'showOnlineStatus', icon: 'circle', label: 'Statut en ligne', color: theme.green500 },
            ].map((item, index, arr) => (
              <RowItem
                key={item.key}
                icon={item.icon}
                iconColor={item.color}
                label={item.label}
                noBorder={index === arr.length - 1}
                right={
                  <Switch
                    value={(settings as any)?.[item.key] || false}
                    onValueChange={(value) => handleToggle(item.key, value)}
                    disabled={saving}
                    trackColor={{ false: theme.outline + '40', true: item.color + '60' }}
                    thumbColor={(settings as any)?.[item.key] ? item.color : theme.outline}
                  />
                }
              />
            ))}
          </ThemedView>

          {/* Data & Analytics */}
          <SectionLabel label="Données & Analytics" />
          <ThemedView
            style={{ borderRadius: 16, overflow: 'hidden',borderWidth: 1, borderColor: theme.outline + '25' }}
          >
            {[
              // { key: 'activityTracking', icon: 'chart-line', label: "Suivi d'activité", desc: 'Améliorer votre expérience', color: theme.success },
              { key: 'locationSharing', icon: 'map-marker', label: 'Partage de localisation', desc: 'Pour les recherches à proximité', color: theme.secondary },
              { key: 'dataSharing.analytics', icon: 'google-analytics', label: 'Analytics', desc: 'Statistiques anonymisées', color: '#9b59b6' },
              { key: 'dataSharing.marketing', icon: 'bullhorn', label: 'Communications marketing', desc: 'Offres et promotions', color: theme.warning },
              // { key: 'dataSharing.personalization', icon: 'account-cog', label: 'Personnalisation', desc: 'Recommandations personnalisées', color: theme.primary },
            ].map((item, index, arr) => (
              <RowItem
                key={item.key}
                icon={item.icon}
                iconColor={item.color}
                label={item.label}
                caption={item.desc}
                noBorder={index === arr.length - 1}
                right={
                  <Switch
                    value={item.key.includes('.')
                      ? (settings?.dataSharing as any)?.[item.key.split('.')[1]]
                      : (settings as any)?.[item.key] || false}
                    onValueChange={(value) => handleToggle(item.key, value)}
                    disabled={saving}
                    trackColor={{ false: theme.outline + '40', true: item.color + '60' }}
                    thumbColor={
                      (item.key.includes('.')
                        ? (settings?.dataSharing as any)?.[item.key.split('.')[1]]
                        : (settings as any)?.[item.key])
                        ? item.color : theme.outline
                    }
                  />
                }
              />
            ))}
          </ThemedView>

          {/* Blocked Users */}
          <SectionLabel label="Utilisateurs bloqués" />
          <ThemedView
            style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.outline + '15' }}
          >
            <RowItem
              icon="account-cancel"
              iconColor={theme.error}
              label="Liste des bloqués"
              caption={`${blockedUsers.length} utilisateur(s) bloqué(s)`}
              noBorder
              right={<MaterialCommunityIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={theme.typography.caption} />}
              onPress={() => setShowBlockedModal(true)}
            />
          </ThemedView>

        </ThemedView>
      </ThemedScrollView>

      {/* Blocked Users Modal */}
      <Modal
        visible={showBlockedModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBlockedModal(false)}
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
              onPress={() => setShowBlockedModal(false)}
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
              Utilisateurs bloqués
            </ThemedText>
            <ThemedView style={{ width: 36 }} />
          </ThemedView>

          {blockedUsers.length === 0 ? (
            <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
              <MaterialCommunityIcons name="account-check" size={56} color={theme.typography.caption} />
              <ThemedText type="caption" intensity="light" style={{ marginTop: 14, textAlign: 'center', color: theme.typography.caption }}>
                Aucun utilisateur bloqué
              </ThemedText>
            </ThemedView>
          ) : (
            <FlatList
              data={blockedUsers}
              keyExtractor={(item) => item.id}
              renderItem={renderBlockedUser}
              contentContainerStyle={{ padding: 16 }}
            />
          )}
        </ThemedView>
      </Modal>

      {/* Saving toast */}
      {saving && (
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
            <ThemedText style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>Enregistrement...</ThemedText>
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
};

export default PrivacySettings;
