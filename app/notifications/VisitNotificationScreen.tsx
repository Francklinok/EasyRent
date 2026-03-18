import React, { useState, useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { getBookingService } from '@/services/api/bookingService';
import { CustomButton } from '@/components/ui';

interface VisitNotification {
  id: string;
  propertyTitle: string;
  clientName: string;
  visitDate: string;
  visitTime: string;
  message?: string;
}

const VisitNotificationScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<VisitNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const bookingService = getBookingService();

  const loadNotifications = async () => {
    // TODO: Charger depuis le backend
    setNotifications([]);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleResponse = async (visitId: string, accept: boolean) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      await bookingService.respondToVisitRequest(visitId, user.id, accept);
      
      // Retirer de la liste
      setNotifications(prev => prev.filter(n => n.id !== visitId));
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <ThemedText type="title" style={{ fontSize: 24, marginBottom: 16 }}>
          Demandes de visite
        </ThemedText>

        {notifications.map((notif) => (
          <ThemedView
            key={notif.id}
            style={{
              backgroundColor: theme.surfaceVariant,
              borderRadius: 12,
              padding: 16,
              marginBottom: 12
            }}
          >
            <ThemedText style={{ fontWeight: '600', marginBottom: 8 }}>
              {notif.propertyTitle}
            </ThemedText>
            <ThemedText style={{ fontSize: 14, marginBottom: 4 }}>
              {notif.clientName}
            </ThemedText>
            <ThemedText style={{ fontSize: 13, color: theme.onSurface + '70' }}>
              {new Date(notif.visitDate).toLocaleDateString('fr-FR')} à {notif.visitTime}
            </ThemedText>

            {notif.message && (
              <ThemedText style={{ fontSize: 13, marginTop: 8, fontStyle: 'italic' }}>
                "{notif.message}"
              </ThemedText>
            )}

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <CustomButton
                title="Accepter"
                onPress={() => handleResponse(notif.id, true)}
                type="primary"
                loading={loading}
                style={{ flex: 1 }}
              />
              <CustomButton
                title="Refuser"
                onPress={() => handleResponse(notif.id, false)}
                type="outline"
                loading={loading}
                style={{ flex: 1 }}
              />
            </View>
          </ThemedView>
        ))}

        {notifications.length === 0 && (
          <ThemedView style={{ alignItems: 'center', paddingVertical: 40 }}>
            <MaterialCommunityIcons name="bell-off" size={48} color={theme.onSurface + '40'} />
            <ThemedText style={{ marginTop: 12, color: theme.onSurface + '60' }}>
              Aucune demande en attente
            </ThemedText>
          </ThemedView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default VisitNotificationScreen;
