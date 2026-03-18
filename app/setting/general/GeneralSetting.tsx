import React, { useState, useCallback } from 'react';
import { TouchableOpacity, Switch, Alert, ActivityIndicator, View, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedScrollView } from '@/components/ui/ScrolleView';
import { useTheme } from '@/hooks/themehook';
import { useLanguage } from '@/components/contexts/language';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { BackButton } from '@/components/ui/BackButton';
import { useGeneralSettings } from '@/hooks/useSettings';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

export default function GeneralSetting() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t, isRTL, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const userId = user?.id || '';

  const {
    settings,
    loading,
    saving,
    updateSettings,
  } = useGeneralSettings(userId);

  const backgroundColor = Array.isArray(theme.background) ? theme.background[0] : theme.background;

  // Modal states
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);
  const [showDateFormatModal, setShowDateFormatModal] = useState(false);
  const insets = useSafeAreaInsets();

  // Available options
  const languages: SelectOption[] = [
    { value: 'fr', label: 'Français', icon: '🇫🇷' },
    { value: 'en', label: 'English', icon: '🇬🇧' },
    { value: 'es', label: 'Español', icon: '🇪🇸' },
    { value: 'de', label: 'Deutsch', icon: '🇩🇪' },
    { value: 'ar', label: 'العربية', icon: '🇸🇦' },
  ];

  const currencies: SelectOption[] = [
    { value: 'EUR', label: 'Euro (€)', icon: '€' },
    { value: 'USD', label: 'US Dollar ($)', icon: '$' },
    { value: 'GBP', label: 'British Pound (£)', icon: '£' },
    { value: 'XOF', label: 'CFA Franc (FCFA)', icon: 'F' },
    { value: 'MAD', label: 'Dirham marocain (DH)', icon: 'DH' },
  ];

  const timezones: SelectOption[] = [
    { value: 'Europe/Paris', label: 'Paris (UTC+1)' },
    { value: 'Europe/London', label: 'Londres (UTC+0)' },
    { value: 'America/New_York', label: 'New York (UTC-5)' },
    { value: 'Africa/Casablanca', label: 'Casablanca (UTC+0)' },
    { value: 'Africa/Dakar', label: 'Dakar (UTC+0)' },
  ];

  const dateFormats: SelectOption[] = [
    { value: 'DD/MM/YYYY', label: '31/12/2024' },
    { value: 'MM/DD/YYYY', label: '12/31/2024' },
    { value: 'YYYY-MM-DD', label: '2024-12-31' },
  ];

  const themeOptions: SelectOption[] = [
    { value: 'light', label: 'Clair', icon: 'weather-sunny' },
    { value: 'dark', label: 'Sombre', icon: 'weather-night' },
    { value: 'system', label: 'Système', icon: 'cellphone' },
  ];

  const handleLanguageChange = useCallback(async (langCode: string) => {
    await setLanguage(langCode as any);
    await updateSettings({ language: langCode });
    setShowLanguageModal(false);
  }, [setLanguage, updateSettings]);

  const handleCurrencyChange = useCallback(async (currency: string) => {
    const success = await updateSettings({ currency });
    if (!success) {
      Alert.alert(t('common.error'), t('errors.general'));
    }
    setShowCurrencyModal(false);
  }, [updateSettings, t]);

  const handleTimezoneChange = useCallback(async (timezone: string) => {
    const success = await updateSettings({ timezone });
    if (!success) {
      Alert.alert(t('common.error'), t('errors.general'));
    }
    setShowTimezoneModal(false);
  }, [updateSettings, t]);

  const handleDateFormatChange = useCallback(async (dateFormat: string) => {
    const success = await updateSettings({ dateFormat });
    if (!success) {
      Alert.alert(t('common.error'), t('errors.general'));
    }
    setShowDateFormatModal(false);
  }, [updateSettings, t]);

  const handleThemeChange = useCallback(async (themeValue: string) => {
    if (themeValue === 'light' && isDark) {
      toggleTheme();
    } else if (themeValue === 'dark' && !isDark) {
      toggleTheme();
    }
    await updateSettings({ theme: themeValue as 'light' | 'dark' | 'system' });
  }, [isDark, toggleTheme, updateSettings]);

  const handleNotificationToggle = useCallback(async (key: string, value: boolean) => {
    const currentNotifications = settings?.notifications || {
      email: true,
      push: true,
      sms: false,
      marketing: false
    };
    const success = await updateSettings({
      notifications: {
        email: currentNotifications.email,
        push: currentNotifications.push,
        sms: currentNotifications.sms,
        marketing: currentNotifications.marketing,
        [key]: value
      }
    });
    if (!success) {
      Alert.alert(t('common.error'), t('errors.general'));
    }
  }, [settings, updateSettings, t]);

  const renderSelectModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    options: SelectOption[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor }}>
        <ThemedView style={{
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.outline + '20'
        }}>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={{ flex: 1, textAlign: 'center', fontSize: 18 }}>
            {title}
          </ThemedText>
          <ThemedView style={{ width: 24 }} />
        </ThemedView>

        <FlatList
          data={options}
          keyExtractor={(item) => item.value}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onSelect(item.value)}
              style={{
                backgroundColor: theme.surface,
                borderRadius: 12,
                padding: 16,
                marginBottom: 8,
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: selectedValue === item.value ? theme.primary : 'transparent'
              }}
            >
              {item.icon && (
                <ThemedText style={{ fontSize: 24, marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }}>
                  {item.icon.length <= 2 ? item.icon : null}
                </ThemedText>
              )}
              {item.icon && item.icon.length > 2 && (
                <ThemedView style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.primary + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: isRTL ? 0 : 12,
                  marginLeft: isRTL ? 12 : 0
                }}>
                  <MaterialCommunityIcons name={item.icon as any} size={20} color={theme.primary} />
                </ThemedView>
              )}
              <ThemedText style={{ flex: 1, fontSize: 16, fontWeight: '500' }}>{item.label}</ThemedText>
              {selectedValue === item.value && (
                <MaterialCommunityIcons name="check-circle" size={24} color={theme.primary} />
              )}
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText style={{ marginTop: 12 }}>{t('common.loading')}</ThemedText>
      </SafeAreaView>
    );
  }

  const currentLang = languages.find(l => l.value === (settings?.language || language));
  const currentCurrency = currencies.find(c => c.value === settings?.currency);
  const currentTimezone = timezones.find(tz => tz.value === settings?.timezone);
  const currentDateFormat = dateFormats.find(df => df.value === settings?.dateFormat);

  return (
    <ThemedView   style={{ flex: 1, backgroundColor,paddingTop: insets.top   }}>
      {/* Header */}
      <ThemedView
        style={{ paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
      >
        <ThemedView style={{
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
          padding: 16,
          gap: 12,
          backgroundColor: 'transparent'
        }}>
          <BackButton />
          <ThemedText type="subtitle" style={{color: '#FFFFFF' }}>
            Paramètres généraux
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* DEV TOOLS — accès rapide simulation paiement */}
      <TouchableOpacity
        onPress={() => router.push('/dev/SimulatePaymentScreen' as any)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginHorizontal: 16,
          marginTop: 8,
          marginBottom: 4,
          padding: 14,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: '#FF9800',
          backgroundColor: '#FF980015',
        }}
      >
        <MaterialCommunityIcons name="play-circle-outline" size={20} color="#FF9800" />
        <ThemedText style={{ color: '#FF9800', fontWeight: '700', fontSize: 14, marginLeft: 8 }}>
          Dev — Simuler un paiement
        </ThemedText>
      </TouchableOpacity>

      <ThemedScrollView style={{ flex: 1 }}>
        <ThemedView style={{ padding: 16 }}>
          {/* Language & Region Section */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 100 }}
          >
            <ThemedText style={{
              fontSize: 13,
              fontWeight: '700',
              color: theme.typography.caption,
              marginBottom: 12,
              textAlign: isRTL ? 'right' : 'left'
            }}>
              LANGUE ET RÉGION
            </ThemedText>

            <ThemedView style={{
              backgroundColor: theme.surface,
              borderRadius: 16,
              marginBottom: 20,
              overflow: 'hidden'
            }}>
              {/* Language */}
              <TouchableOpacity
                onPress={() => setShowLanguageModal(true)}
                style={{
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.outline + '20'
                }}
              >
                <ThemedView style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme.primary + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: isRTL ? 0 : 12,
                  marginLeft: isRTL ? 12 : 0
                }}>
                  <MaterialCommunityIcons name="translate" size={22} color={theme.primary} />
                </ThemedView>
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
                    {t('languageSettings.title')}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>
                    {currentLang?.icon} {currentLang?.label}
                  </ThemedText>
                </ThemedView>
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.typography.caption} />
              </TouchableOpacity>

              {/* Currency */}
              <TouchableOpacity
                onPress={() => setShowCurrencyModal(true)}
                style={{
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.outline + '20'
                }}
              >
                <ThemedView style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme.success + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: isRTL ? 0 : 12,
                  marginLeft: isRTL ? 12 : 0
                }}>
                  <MaterialCommunityIcons name="currency-eur" size={22} color={theme.success} />
                </ThemedView>
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>Devise</ThemedText>
                  <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>
                    {currentCurrency?.label || 'EUR'}
                  </ThemedText>
                </ThemedView>
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.typography.caption} />
              </TouchableOpacity>

              {/* Timezone */}
              <TouchableOpacity
                onPress={() => setShowTimezoneModal(true)}
                style={{
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.outline + '20'
                }}
              >
                <ThemedView style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme.secondary + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: isRTL ? 0 : 12,
                  marginLeft: isRTL ? 12 : 0
                }}>
                  <MaterialCommunityIcons name="clock-outline" size={22} color={theme.secondary} />
                </ThemedView>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>Fuseau horaire</ThemedText>
                  <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>
                    {currentTimezone?.label || 'Europe/Paris'}
                  </ThemedText>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.typography.caption} />
              </TouchableOpacity>

              {/* Date Format */}
              <TouchableOpacity
                onPress={() => setShowDateFormatModal(true)}
                style={{
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  padding: 16
                }}
              >
                <ThemedView style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme.warning + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: isRTL ? 0 : 12,
                  marginLeft: isRTL ? 12 : 0
                }}>
                  <MaterialCommunityIcons name="calendar" size={22} color={theme.warning} />
                </ThemedView>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>Format de date</ThemedText>
                  <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>
                    {currentDateFormat?.label || 'DD/MM/YYYY'}
                  </ThemedText>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.typography.caption} />
              </TouchableOpacity>
            </ThemedView>
          </MotiView>

          {/* Appearance Section */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
          >
            <ThemedText style={{
              fontSize: 13,
              fontWeight: '700',
              color: theme.typography.caption,
              marginBottom: 12,
              textAlign: isRTL ? 'right' : 'left'
            }}>
              APPARENCE
            </ThemedText>

            <ThemedView style={{
              backgroundColor: theme.surface,
              borderRadius: 16,
              marginBottom: 20,
              overflow: 'hidden'
            }}>
              {themeOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleThemeChange(option.value)}
                  style={{
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    padding: 16,
                    borderBottomWidth: index < themeOptions.length - 1 ? 1 : 0,
                    borderBottomColor: theme.outline + '20',
                    backgroundColor: (settings?.theme === option.value || (!settings?.theme && option.value === (isDark ? 'dark' : 'light'))) ? theme.primary + '10' : 'transparent'
                  }}
                >
                  <ThemedView style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: (option.value === 'light' ? '#FFB74D' : option.value === 'dark' ? '#5C6BC0' : theme.primary) + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: isRTL ? 0 : 12,
                    marginLeft: isRTL ? 12 : 0
                  }}>
                    <MaterialCommunityIcons
                      name={option.icon as any}
                      size={22}
                      color={option.value === 'light' ? '#FFB74D' : option.value === 'dark' ? '#5C6BC0' : theme.primary}
                    />
                  </ThemedView>
                  <ThemedView style={{ flex: 1 }}>
                    <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>{option.label}</ThemedText>
                    <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>
                      {option.value === 'light' ? 'Toujours clair' : option.value === 'dark' ? 'Toujours sombre' : 'Suivre les paramètres système'}
                    </ThemedText>
                  </ThemedView>
                  {(settings?.theme === option.value || (!settings?.theme && option.value === (isDark ? 'dark' : 'light'))) && (
                    <MaterialCommunityIcons name="check-circle" size={24} color={theme.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ThemedView>
          </MotiView>

          {/* Notifications Section */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300 }}
          >
            <ThemedText style={{
              fontSize: 13,
              fontWeight: '700',
              color: theme.typography.caption,
              marginBottom: 12,
              textAlign: isRTL ? 'right' : 'left'
            }}>
              NOTIFICATIONS
            </ThemedText>

            <ThemedView style={{
              backgroundColor: theme.surface,
              borderRadius: 16,
              marginBottom: 20,
              overflow: 'hidden'
            }}>
              {[
                { key: 'push', icon: 'bell', label: 'Notifications push', desc: 'Recevoir des alertes sur l\'appareil', color: theme.primary },
                { key: 'email', icon: 'email', label: 'Notifications par email', desc: 'Recevoir des emails de l\'application', color: theme.secondary },
                { key: 'sms', icon: 'message-text', label: 'Notifications SMS', desc: 'Recevoir des SMS pour les alertes urgentes', color: theme.success },
                { key: 'marketing', icon: 'bullhorn', label: 'Communications marketing', desc: 'Offres et nouveautés', color: theme.warning },
              ].map((item, index) => (
                <ThemedView
                  key={item.key}
                  style={{
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    padding: 16,
                    borderBottomWidth: index < 3 ? 1 : 0,
                    borderBottomColor: theme.outline + '20'
                  }}
                >
                  <ThemedView style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: item.color + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: isRTL ? 0 : 12,
                    marginLeft: isRTL ? 12 : 0
                  }}>
                    <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
                  </ThemedView>
                  <ThemedView style={{ flex: 1 }}>
                    <ThemedText style={{ fontSize: 16, fontWeight: '500' }}>{item.label}</ThemedText>
                    <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>{item.desc}</ThemedText>
                  </ThemedView>
                  <Switch
                    value={(settings?.notifications as any)?.[item.key] || false}
                    onValueChange={(value) => handleNotificationToggle(item.key, value)}
                    disabled={saving}
                    trackColor={{ false: theme.outline + '40', true: item.color + '40' }}
                    thumbColor={(settings?.notifications as any)?.[item.key] ? item.color : theme.outline}
                  />
                </ThemedView>
              ))}
            </ThemedView>
          </MotiView>

          {/* About Section */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400 }}
          >
            <ThemedText style={{
              fontSize: 13,
              fontWeight: '700',
              color: theme.typography.caption,
              marginBottom: 12,
              textAlign: isRTL ? 'right' : 'left'
            }}>
              À PROPOS
            </ThemedText>

            <ThemedView style={{
              backgroundColor: theme.surface,
              borderRadius: 16,
              overflow: 'hidden'
            }}>
              <TouchableOpacity
                onPress={() => Alert.alert('Version', 'EasyRent v1.0.0')}
                style={{
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.outline + '20'
                }}
              >
                <ThemedView style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme.primary + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: isRTL ? 0 : 12,
                  marginLeft: isRTL ? 12 : 0
                }}>
                  <MaterialCommunityIcons name="information" size={22} color={theme.primary} />
                </ThemedView>
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>Version de l'application</ThemedText>
                  <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>1.0.0</ThemedText>
                </ThemedView>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {/* Open terms */}}
                style={{
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.outline + '20'
                }}
              >
                <ThemedView style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme.secondary + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: isRTL ? 0 : 12,
                  marginLeft: isRTL ? 12 : 0
                }}>
                  <MaterialCommunityIcons name="file-document" size={22} color={theme.secondary} />
                </ThemedView>
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: 10, fontWeight: '600' }}>Conditions d'utilisation</ThemedText>
                </ThemedView>
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.typography.caption} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {/* Open privacy */}}
                style={{
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  padding: 16
                }}
              >
                <ThemedView style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme.success + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: isRTL ? 0 : 12,
                  marginLeft: isRTL ? 12 : 0
                }}>
                  <MaterialCommunityIcons name="shield-check" size={22} color={theme.success} />
                </ThemedView>
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>Politique de confidentialité</ThemedText>
                </ThemedView>
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.typography.caption} />
              </TouchableOpacity>
            </ThemedView>
          </MotiView>

          {/* DEV TOOLS */}
          <TouchableOpacity
            onPress={() => router.push('/dev/SimulatePaymentScreen' as any)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 24,
              marginBottom: 16,
              padding: 16,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: '#FF9800',
              backgroundColor: '#FF980015',
            }}
          >
            <MaterialCommunityIcons name="play-circle-outline" size={20} color="#FF9800" />
            <ThemedText style={{ color: '#FF9800', fontWeight: '700', fontSize: 14, marginLeft: 8 }}>
              Dev — Simuler un paiement
            </ThemedText>
          </TouchableOpacity>

        </ThemedView>
      </ThemedScrollView>

      {/* Modals */}
      {renderSelectModal(
        showLanguageModal,
        () => setShowLanguageModal(false),
        t('languageSettings.title'),
        languages,
        settings?.language || language,
        handleLanguageChange
      )}

      {renderSelectModal(
        showCurrencyModal,
        () => setShowCurrencyModal(false),
        'Devise',
        currencies,
        settings?.currency || 'EUR',
        handleCurrencyChange
      )}

      {renderSelectModal(
        showTimezoneModal,
        () => setShowTimezoneModal(false),
        'Fuseau horaire',
        timezones,
        settings?.timezone || 'Europe/Paris',
        handleTimezoneChange
      )}

      {renderSelectModal(
        showDateFormatModal,
        () => setShowDateFormatModal(false),
        'Format de date',
        dateFormats,
        settings?.dateFormat || 'DD/MM/YYYY',
        handleDateFormatChange
      )}

      {/* Saving indicator */}
      {saving && (
        <ThemedView style={{
          position: 'absolute',
          top: 100,
          left: 0,
          right: 0,
          alignItems: 'center'
        }}>
          <ThemedView style={{
            backgroundColor: theme.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8
          }}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <ThemedText style={{ color: '#FFFFFF', fontSize: 12 }}>Enregistrement...</ThemedText>
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
}
