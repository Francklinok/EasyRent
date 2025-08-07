import React, { useState } from 'react';
import { TouchableOpacity, Switch } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
import Header from '@/components/ui/header';

export default function ChatSettings() {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);

  const settingsItems = [
    {
      title: 'Notifications',
      subtitle: 'Recevoir les notifications de messages',
      icon: 'bell',
      type: 'switch',
      value: notifications,
      onToggle: setNotifications
    },
    {
      title: 'Accusés de réception',
      subtitle: 'Afficher les accusés de lecture',
      icon: 'check-all',
      type: 'switch',
      value: readReceipts,
      onToggle: setReadReceipts
    },
    {
      title: 'Statut en ligne',
      subtitle: 'Afficher votre statut aux autres',
      icon: 'account-circle',
      type: 'switch',
      value: onlineStatus,
      onToggle: setOnlineStatus
    },
    {
      title: 'Téléchargement auto',
      subtitle: 'Télécharger automatiquement les médias',
      icon: 'download',
      type: 'switch',
      value: autoDownload,
      onToggle: setAutoDownload
    },
    {
      title: 'Stockage et données',
      subtitle: 'Gérer l\'utilisation des données',
      icon: 'database',
      type: 'navigation'
    },
    {
      title: 'Confidentialité',
      subtitle: 'Paramètres de confidentialité',
      icon: 'shield-account',
      type: 'navigation'
    },
    {
      title: 'Sauvegardes',
      subtitle: 'Sauvegarder vos conversations',
      icon: 'backup-restore',
      type: 'navigation'
    }
  ];

 

  return (
    <ThemedView style={{ flex: 1 }}>
      
      <ThemedView style={{ flex: 1, padding: 16 }}>
        {settingsItems.map((item, index) => (
          <MotiView
            key={item.title}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 100, type: 'spring' }}
            style={{ marginBottom: 16 }}
          >
            <ThemedView style={{
              backgroundColor: theme.surface,
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: theme.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}>
              <ThemedView style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.primary + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16
              }}>
                <MaterialCommunityIcons name={item.icon} size={20} color={theme.primary} />
              </ThemedView>
              
              <ThemedView style={{ flex: 1 }}>
                <ThemedText style={{ fontSize: 16, fontWeight: '600', color: theme.onSurface }}>
                  {item.title}
                </ThemedText>
                <ThemedText style={{ fontSize: 14, color: theme.onSurface + '80', marginTop: 2 }}>
                  {item.subtitle}
                </ThemedText>
              </ThemedView>
              
              {item.type === 'switch' ? (
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{ false: theme.outline, true: theme.primary + '40' }}
                  thumbColor={item.value ? theme.primary : theme.surface}
                />
              ) : (
                <MaterialCommunityIcons name="chevron-right" size={20} color={theme.onSurface + '60'} />
              )}
            </ThemedView>
          </MotiView>
        ))}
      </ThemedView>
    </ThemedView>
  );
}