import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Alert, Switch, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { SettingsItem } from '@/components/ui/SettingsItems';
import { ThemedScrollView } from '@/components/ui/ScrolleView';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { useProfile, useTrustScore } from '@/hooks/useProfile';
import { useLanguage } from '@/components/contexts/language';
import { StatusBar } from 'react-native';

interface AppSettings {
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisible: boolean;
    activityTracking: boolean;
    dataCollection: boolean;
  };
  preferences: {
    language: string;
    currency: string;
    autoBackup: boolean;
    darkMode: boolean;
  };
}

const SettingsScreen = () => {
  const { theme } = useTheme();
  const { logout, user } = useAuth();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const {
    profile,
    stats: profileStats,
    loading: profileLoading,
    updatePreferences,
    exportData: exportUserData
  } = useProfile(user?.id || '');

  const [isExporting, setIsExporting] = useState(false);

  const {
    score: trustScore,
    level: trustLevel
  } = useTrustScore(user?.id || '');

  const renderHeader = () => (
    <ThemedView
      style={{
        paddingHorizontal: 20,
        paddingTop: insets.top,
        paddingBottom: 10,
      }}
    >
      <ThemedView style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'transparent',
        marginBottom: 1
      }}>
        <ThemedText type="subtitle" intensity="strong" style={{
          color: theme.text
        }}>
          {t('settingsScreen.title')}
        </ThemedText>

        <ThemedView style={{ flexDirection: 'row', gap: 12, backgroundColor: 'transparent' }}>
          <TouchableOpacity
            onPress={() => router.push('/help')}
            style={{
              backgroundColor: theme.surface,
              borderRadius: 20,
              padding: 8
            }}
          >
            <MaterialCommunityIcons name="help-circle" size={20} color={theme.text }/>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* User Card */}
      <ThemedView style={{
        borderRadius: 16,
        marginBottom: 2
      }}>
        <ThemedView style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'transparent'
        }}>
          {/* Avatar */}
          {profile?.photo ? (
            <Image
              source={{ uri: profile.photo }}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                marginRight: 15,
                borderWidth: 3,
                borderColor:theme.outline
              }}
            />
          ) : (
            <ThemedView style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: 'rgba(255,255,255,0.3)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 15
            }}>
              <MaterialCommunityIcons name="account" size={30} color={theme.text} />
            </ThemedView>
          )}

          <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', gap: 8 }}>
              <ThemedText type="subtitle" intensity="strong" style={{ color: theme.text }}>
                {profile?.firstName || user?.firstName || t('settingsScreen.defaultUser')} {profile?.lastName || user?.lastName || ''}
              </ThemedText>
              {(user as any)?.isPremium && (
                <ThemedView style={{
                  backgroundColor: '#FFD700',
                  borderRadius: 10,
                  paddingHorizontal: 8,
                  paddingVertical: 2
                }}>
                  <MaterialCommunityIcons name="crown" size={14} color={theme.text} />
                </ThemedView>
              )}
            </ThemedView>
            <ThemedText intensity ='light' style={{ color: theme.text, fontSize: 14, marginTop: 2 }}>
              {profile?.email || user?.email || 'email@example.com'}
            </ThemedText>

            {/* Trust Score */}
            {trustScore > 0 && (
              <ThemedView style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'transparent',
                marginTop: 6,
                gap: 6
              }}>
                <MaterialCommunityIcons name="shield-check" size={14} color="#4CAF50" />
                <ThemedText style={{ color:theme.text,}}>
                  {t('settingsScreen.trustScore', { score: trustScore, level: trustLevel })}
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>

          <TouchableOpacity
            onPress={() => router.push('/profile/Profile')}
            style={{
              backgroundColor: theme.surface,
              borderRadius: 12,
              padding: 10
            }}
          >
            <MaterialCommunityIcons name="pencil" size={20} color="white" />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );

  const [settings, setSettings] = useState<AppSettings>({
    notifications: {
      push: true,
      email: true,
      sms: false,
      marketing: false
    },
    privacy: {
      profileVisible: true,
      activityTracking: true,
      dataCollection: false
    },
    preferences: {
      language: 'fr',
      currency: 'EUR',
      autoBackup: true,
      darkMode: false
    }
  });

  const [appStats, setAppStats] = useState({
    storageUsed: '2.3 GB',
    cacheSize: '156 MB',
    lastBackup: '2024-03-20',
    accountAge: '6 mois'
  });

  useEffect(() => {
    if (profile?.preferences) {
      setSettings(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          language: (profile.preferences as any).app?.language || 'fr',
          currency: (profile.preferences as any).app?.currency || 'EUR'
        }
      }));
    }
  }, [profile]);

  const displayStats = {
    properties: profileStats?.propertiesCount || 0,
    transactions: profileStats?.reservationsCount || 0,
    earnings: profileStats?.totalEarnings || 0
  };

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      t('settingsScreen.logoutConfirm'),
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('auth.logout'),
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace("/Auth/Login");
            } catch (error) {
              Alert.alert(t('common.error'), t('settingsScreen.logoutError'));
            }
          }
        }
      ]
    );
  };

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof AppSettings],
        [setting]: value
      }
    }));
  };

  const exportData = async () => {
    if (!user?.id) {
      Alert.alert(t('common.error'), t('settingsScreen.exportError'));
      return;
    }

    Alert.alert(
      t('settingsScreen.exportTitle'),
      t('settingsScreen.exportMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settingsScreen.exportAction'),
          onPress: async () => {
            setIsExporting(true);
            try {
              const { downloadUrl, expiresAt } = await exportUserData();

              if (!downloadUrl) {
                throw new Error('Download URL not available');
              }

              const timestamp = new Date().toISOString().split('T')[0];
              const filename = `my-data-${timestamp}.json`;
              const fileUri = `${FileSystem.cacheDirectory}${filename}`;

              const downloadResult = await FileSystem.downloadAsync(
                downloadUrl,
                fileUri
              );

              if (downloadResult.status !== 200) {
                throw new Error('Download failed');
              }

              const isSharingAvailable = await Sharing.isAvailableAsync();

              if (isSharingAvailable) {
                Alert.alert(
                  t('settingsScreen.exportSuccess'),
                  t('settingsScreen.exportSuccessMessage', { date: new Date(expiresAt).toLocaleDateString() }),
                  [
                    {
                      text: t('settingsScreen.exportLater'),
                      style: 'cancel',
                      onPress: () => {
                        Alert.alert(
                          t('settingsScreen.fileSaved'),
                          t('settingsScreen.fileSavedMessage', { filename })
                        );
                      }
                    },
                    {
                      text: t('settingsScreen.exportShare'),
                      onPress: async () => {
                        try {
                          await Sharing.shareAsync(fileUri, {
                            mimeType: 'application/json',
                            dialogTitle: t('settingsScreen.exportTitle'),
                            UTI: 'public.json'
                          });
                        } catch (shareError) {
                          console.error('Share error:', shareError);
                          Alert.alert(
                            t('settingsScreen.fileSaved'),
                            t('settingsScreen.fileSavedShareError', { filename })
                          );
                        }
                      }
                    }
                  ]
                );
              } else {
                Alert.alert(
                  t('settingsScreen.exportSuccess'),
                  t('settingsScreen.exportDownloaded', { filename })
                );
              }
            } catch (error) {
              console.error('Export error:', error);

              try {
                const localExportData = {
                  exportDate: new Date().toISOString(),
                  user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fullName: profile?.firstName + ' ' + profile?.lastName,
                    phone: profile?.phone,
                    createdAt: (user as any).createdAt
                  },
                  profile: profile ? {
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    photo: profile.photo,
                    location: profile.location,
                    preferences: profile.preferences,
                    role: profile.role,
                    isPremium: profile.isPremium,
                    trustLevel: profile.trustLevel,
                    rating: profile.rating
                  } : null,
                  statistics: profileStats ? {
                    propertiesCount: profileStats.propertiesCount,
                    reservationsCount: profileStats.reservationsCount,
                    totalEarnings: profileStats.totalEarnings,
                    totalSpent: profileStats.totalSpent,
                    averageRating: profileStats.averageRating,
                    reviewsCount: profileStats.reviewsCount
                  } : null,
                  settings: settings,
                };

                const timestamp = new Date().toISOString().split('T')[0];
                const filename = `my-data-local-${timestamp}.json`;
                const fileUri = `${FileSystem.cacheDirectory}${filename}`;

                await FileSystem.writeAsStringAsync(
                  fileUri,
                  JSON.stringify(localExportData, null, 2),
                  { encoding: FileSystem.EncodingType.UTF8 }
                );

                const isSharingAvailable = await Sharing.isAvailableAsync();

                if (isSharingAvailable) {
                  Alert.alert(
                    t('settingsScreen.exportLocalCreated'),
                    t('settingsScreen.exportLocalMessage'),
                    [
                      { text: t('common.no'), style: 'cancel' },
                      {
                        text: t('settingsScreen.exportShare'),
                        onPress: async () => {
                          await Sharing.shareAsync(fileUri, {
                            mimeType: 'application/json',
                            dialogTitle: t('settingsScreen.exportTitle')
                          });
                        }
                      }
                    ]
                  );
                } else {
                  Alert.alert(
                    t('settingsScreen.exportLocalCreated'),
                    t('settingsScreen.exportLocalSaved', { filename })
                  );
                }
              } catch (localError) {
                console.error('Local export error:', localError);
                Alert.alert(
                  t('common.error'),
                  t('settingsScreen.exportError')
                );
              }
            } finally {
              setIsExporting(false);
            }
          }
        }
      ]
    );
  };

  const renderSettingsSection = (title: string, children: React.ReactNode) => (
    <ThemedView style={{ marginBottom: 24 }}>
      <ThemedView style={{ paddingHorizontal: 20, paddingVertical: 8, marginBottom: 8 }}>
        <ThemedText type="normaltitle" intensity="strong" style={{ fontWeight: '700'}}>
          {title}
        </ThemedText>
      </ThemedView>

      <ThemedView style={{
        backgroundColor: theme.surface,
        marginHorizontal: 12,
      }}>
        {children}
      </ThemedView>
    </ThemedView>
  );

  const renderSwitchItem = (
    label: string,
    icon: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    description?: string,
    iconColor?: string
  ) => (
    <ThemedView style={{
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.outline + '20'
    }}>
      <ThemedView style={{
        backgroundColor: (iconColor || theme.primary) + '20',
        borderRadius: 12,
        padding: 8,
        marginRight: 15
      }}>
        <MaterialCommunityIcons
          name={icon as any}
          size={20}
          color={iconColor || theme.primary}
        />
      </ThemedView>

      <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
        <ThemedText type = "normal" style={{
          fontWeight: '600',
          color: theme.text,
          marginBottom: description ? 2 : 0
        }}>
          {label}
        </ThemedText>
        {description && (
          <ThemedText type="caption" intensity="light" style={{
            color: theme.typography.caption
          }}>
            {description}
          </ThemedText>
        )}
      </ThemedView>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.outline + '40', true: theme.primary + '40' }}
        thumbColor={value ? theme.primary : theme.outline}
      />
    </ThemedView>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      {renderHeader()}
        <StatusBar 
              barStyle={theme.dark ? 'light-content' : 'dark-content'} 
            />
      <ThemedScrollView style={{ flex: 1 }}>
        {/* User Settings */}
        {renderSettingsSection(t('settingsScreen.userSettings'), (
          <>
            <SettingsItem
              showArrow="on"
              label={t('settingsScreen.myProfile')}
              description={t('settingsScreen.personalInfo')}
              icon="person"
              iconColor={theme.primary}
              onPress={() => router.push('/profile/Profile')}
            />
            <SettingsItem
              showArrow="on"
              label={t('settingsScreen.security')}
              description={t('settingsScreen.securityDesc')}
              icon="shield-checkmark"
              iconColor={theme.success}
              onPress={() => router.push('/security')}
            />
            <SettingsItem
            
              showArrow="on"
              label={t('settingsScreen.privacy')}
              description={t('settingsScreen.privacyDesc')}
              icon="eye-off"
              iconColor={theme.warning}
              onPress={() => router.push('/privacy')}
            />
          </>
        ))}
        {/* App Features */}
        {renderSettingsSection(t('settingsScreen.features'), (
          <>
            <SettingsItem
              showArrow="on"
              label="Premium"
              description={(user as any)?.isPremium ? t('settingsScreen.premiumActive') : t('settingsScreen.premiumUnlock')}
              icon="diamond"
              iconColor="#FFD700"
              onPress={() => router.push('/premium/Premium')}
              rightElement={(user as any)?.isPremium ? (
                <ThemedView style={{
                  backgroundColor: '#FFD700' + '20',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8
                }}>
                  <ThemedText style={{ color: '#FFD700', fontSize: 12, fontWeight: 'bold' }}>
                    {t('settingsScreen.active')}
                  </ThemedText>
                </ThemedView>
              ) : null}
            />
            <SettingsItem
              showArrow="on"
              label={t('settingsScreen.wallet')}
              description={t('settingsScreen.walletDesc')}
              icon="wallet"
              iconColor={theme.success}
              onPress={() => router.push('/wallet/Wallet')}
            />
            <SettingsItem
              showArrow="on"
              label={t('settingsScreen.inventory')}
              description={t('settingsScreen.inventoryDesc')}
              icon="business"
              iconColor={theme.secondary}
              onPress={() => router.push('/inventory/Inventory')}
            />
            <SettingsItem
              showArrow="on"
              label={t('settingsScreen.favorites')}
              description={t('settingsScreen.favoritesDesc')}
              icon="heart"
              iconColor={theme.star}
              onPress={() => router.push('/favoris/Favoris')}
            />
          </>
        ))}

        {/* App Settings */}
        {renderSettingsSection(t('settingsScreen.configuration'), (
          <>
            <SettingsItem
              showArrow="on"
              label={t('settingsScreen.appearance')}
              description={t('settingsScreen.appearanceDesc')}
              icon="color-palette"
              iconColor={theme.primary}
              onPress={() => router.push('/theme/Themed')}
            />
            <SettingsItem
              showArrow="on"
              label={t('settingsScreen.languageRegion')}
              description={`${settings.preferences.currency}`}
              icon="earth"
              iconColor={theme.secondary}
              onPress={() => router.push('/language')}
            />
            {renderSwitchItem(
              t('settingsScreen.autoBackup'),
              'cloud-upload',
              settings.preferences.autoBackup,
              (value) => handleSettingChange('preferences', 'autoBackup', value),
              t('settingsScreen.autoBackupDesc'),
              theme.primary
            )}
          </>
        ))}

        {/* Storage & Data */}
        {renderSettingsSection(t('settingsScreen.storageData'), (
          <>
            <SettingsItem
              showArrow="on"
              label={t('settingsScreen.storageUsed')}
              description={appStats.storageUsed}
              icon="server"
              iconColor={theme.warning}
              onPress={() => router.push('/storage')}
            />

            <SettingsItem
              showArrow={isExporting ? "off" : "on"}
              label={t('settingsScreen.exportData')}
              description={isExporting ? t('settingsScreen.exportInProgress') : t('settingsScreen.exportDesc')}
              icon="download"
              iconColor={theme.success}
              onPress={isExporting ? undefined : exportData}
              rightElement={isExporting ? (
                <ActivityIndicator size="small" color={theme.success} />
              ) : null}
            />
          </>
        ))}

        {/* Advanced */}
        {renderSettingsSection(t('settingsScreen.advanced'), (
          <>
            <SettingsItem
              showArrow="on"
              label={t('settingsScreen.aiAssistant')}
              description={t('settingsScreen.aiAssistantDesc')}
              icon="chatbubbles"
              iconColor="#9b59b6"
              onPress={() => router.push('/ai-assistant')}
            />
          </>
        ))}

        {/* Logout */}
        <ThemedView style={{
          marginHorizontal: 16,
        }}>
          <SettingsItem
            onPress={handleLogout}
            variant="surface"
            customBackgroundColor="transparent"
            label={t('settingsScreen.logout')}
            description={t('settingsScreen.logoutDesc')}
            icon="log-out"
            iconColor={theme.error}
            bordered={false}
          />
        </ThemedView>

        <ThemedView style={{ height: 80 }} />
      </ThemedScrollView>
    </ThemedView>
  );
};

export default SettingsScreen;
