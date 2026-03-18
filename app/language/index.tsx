import React, { useState, useCallback } from 'react';
import { TouchableOpacity, ScrollView, ActivityIndicator, Alert, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useLanguage } from '@/components/contexts/language';
import { LanguageCode } from '@/i18n/translations';

const LanguageSettings = () => {
  const { theme, isDark } = useTheme();
  const {
    language,
    availableLanguages,
    setLanguage,
    t,
    isLoading,
    isRTL
  } = useLanguage();

  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [changingLanguage, setChangingLanguage] = useState(false);

  const handleLanguageChange = useCallback(async (code: LanguageCode) => {
    if (code === language) return;

    setChangingLanguage(true);
    try {
      await setLanguage(code);
      // Show success feedback
      Alert.alert(
        t('common.success'),
        t('languageSettings.languageChanged'),
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert(
        t('common.error'),
        t('errors.general'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setChangingLanguage(false);
    }
  }, [language, setLanguage, t]);

  // Get background color as string
  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <ThemedView style={{ padding: 16, paddingTop:0}}>
         
          <ThemedView style={{
            borderRadius: 16,
  
          }}>
            {availableLanguages.map((lang, index) => (
            
                <TouchableOpacity
                  onPress={() => handleLanguageChange(lang.code)}
                  disabled={changingLanguage}
                  style={{
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    padding: 10,
                    borderBottomWidth: index < availableLanguages.length - 1 ? 1 : 0,
                    borderBottomColor: theme.outline + '20',
                    backgroundColor: 'transparent',
                  }}
                >
                  <ThemedText type ="title" style={{  marginHorizontal: 10 }}>
                    {lang.flag}
                  </ThemedText>
                  <ThemedView style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    alignItems: isRTL ? 'flex-end' : 'flex-start'
                  }}>
                    <ThemedText type ="normal" style={{
                      fontWeight: language === lang.code ? '700' : '500',
                      color: language === lang.code ? theme.primary : theme.text
                    }}>
                      {lang.nativeName}
                    </ThemedText>
                    <ThemedText style={{
                      color: theme.typography.caption
                    }}>
                      {lang.name}
                    </ThemedText>
                  </ThemedView>

                  {/* RTL indicator for Arabic */}
                  {lang.rtl && (
                    <ThemedView style={{
                      backgroundColor: theme.accent + '20',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                      marginHorizontal: 8
                    }}>
                      <ThemedText style={{ fontSize: 10, color: theme.accent, fontWeight: '600' }}>
                        RTL
                      </ThemedText>
                    </ThemedView>
                  )}

                  {language === lang.code ? (
                   
                      <ThemedView style={{
                        width: 20,
                        height: 20,
                        borderRadius: 14,
                        backgroundColor: theme.success + "80",
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
                      </ThemedView>
                  ) : (
                    <ThemedView style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      borderWidth: 2,
                      borderColor: theme.outline + '40'
                    }} />
                  )}
                </TouchableOpacity>
            ))}
          </ThemedView>

          {/* Info note */}
         
            <ThemedView style={{
              flexDirection: isRTL ? 'row-reverse' : 'row',
              alignItems: 'center',
              padding: 16,
              borderRadius: 12,
              marginTop: 2,
              gap: 12,
              marginBottom:30

            }}>
              <MaterialCommunityIcons
                name="information-outline"
                size={24}
                color={theme.primary}
              />
              <ThemedText type ="caption" intensity = "light" style={{
                flex: 1,
                textAlign: isRTL ? 'right' : 'left',
                lineHeight: 20
              }}>
                {language === 'fr' && 'Le changement de langue s\'applique immédiatement à toute l\'application.'}
                {language === 'en' && 'Language changes are applied immediately throughout the app.'}
                {language === 'es' && 'Los cambios de idioma se aplican inmediatamente en toda la aplicación.'}
                {language === 'de' && 'Sprachänderungen werden sofort in der gesamten App übernommen.'}
                {language === 'ar' && 'يتم تطبيق تغييرات اللغة على الفور في جميع أنحاء التطبيق.'}
              </ThemedText>
            </ThemedView>
        </ThemedView>
      </ScrollView>

      {/* Loading overlay */}
      {changingLanguage && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: theme.surface,
            padding: 24,
            borderRadius: 16,
            alignItems: 'center',
            gap: 12
          }}>
            <ActivityIndicator size="large" color={theme.primary} />
            <ThemedText i18nKey="common.loading" />
          </View>
        </View>
      )}
    </ThemedView>
  );
};

export default LanguageSettings;
