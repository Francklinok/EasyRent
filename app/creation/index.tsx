import React from 'react';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useLanguage } from '@/components/contexts/language';

const CreationSelector = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const options = [
    {
      id: 'property',
      title: t('creation.createProperty'),
      description: t('creation.createPropertyDesc'),
      icon: 'home-city',
      color: theme.primary,
      onPress: () => router.push('/creation/property')
    },
    {
      id: 'service',
      title: t('creation.createService'),
      description: t('creation.createServiceDesc'),
      icon: 'tools',
      color: theme.secondary,
      onPress: () => router.push('/creation/service')
    }
  ];

  return (
    <ThemedView className = "h-full ">
      <ThemedView style={{ flex: 1,padding: 16, paddingTop:10  }}>
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <ThemedText type="normaltitle">
              {t('creation.whatToCreate')}
            </ThemedText>
          </ThemedView>

          <ThemedView style={{ gap: 16 }}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={option.onPress}
                style={{
                  backgroundColor: theme.surface,
                  borderRadius: 16,
                  padding: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: theme.shadowColor || '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 14,
                  elevation: 1,
                  borderWidth:1,
                  borderColor: theme.outline || '#000',
                }}
              >
                <ThemedView
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: option.color + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16
                  }}
                >
                  <MaterialCommunityIcons name={option.icon as any} size={28} color={option.color} />
                </ThemedView>

                <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                  <ThemedText type ="normaltitle" intensity ="strong" style={{ marginBottom: 4 }}>
                    {option.title}
                  </ThemedText>
                  <ThemedText type ="normal" intensity ="light">
                    {option.description}
                  </ThemedText>
                </ThemedView>

                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.typography.caption} />
              </TouchableOpacity>
            ))}
          </ThemedView>
      </ThemedView>
    </ThemedView>
    );
};

export default CreationSelector;
