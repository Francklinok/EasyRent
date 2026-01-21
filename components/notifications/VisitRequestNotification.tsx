import React, { useState } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/components/contexts/theme/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { getBookingService } from '@/services/api/bookingService';
import { router } from 'expo-router';
interface VisitRequestNotificationProps {
  visitId: string;
  propertyTitle: string;
  propertyId?: string;
  clientName: string;
  clientId?: string;
  visitDate: string;
  visitTime: string;
  message?: string;
  isOwner: boolean; 
  onResponse?: (accepted: boolean) => void;
}

export const VisitRequestNotification: React.FC<VisitRequestNotificationProps> = ({
  visitId,
  propertyTitle,
  propertyId,
  clientName,
  clientId,
  visitDate,
  visitTime,
  message,
  isOwner,
  onResponse
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [responded, setResponded] = useState(false);
  const [responseType, setResponseType] = useState<'accepted' | 'rejected' | null>(null);
  const bookingService = getBookingService();

  const handleResponse = async (accept: boolean) => {
    console.log('🔵 handleResponse called:', { accept, visitId, userId: user?.id });

    if (!user?.id) {
      Alert.alert('Erreur', 'Vous devez être connecté');
      return;
    }

    try {
      setLoading(true);
      console.log('🔵 Calling respondToVisitRequest...');

      const result = await bookingService.respondToVisitRequest(
        visitId,
        user.id,
        accept,
        accept ? undefined : 'Créneau non disponible'
      );

      console.log('✅ Response result:', result);

      setResponded(true);
      setResponseType(accept ? 'accepted' : 'rejected');
      onResponse?.(accept);

      Alert.alert(
        accept ? 'Visite acceptée !' : 'Visite refusée',
        accept
          ? 'Le client a été notifié de votre acceptation. Vous pouvez discuter des détails dans le chat.'
          : 'Le client a été notifié. Vous pouvez lui proposer un autre créneau.',
        [
          {
            text: 'OK',
            style: 'default'
          },
          {
            text: 'Voir le chat',
            onPress: () => {
              if (clientId) {
                router.push({
                  pathname: '/chat/[chatId]',
                  params: {
                    chatId: `conv_${user.id}_${clientId}`,
                    name: clientName,
                  }
                });
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la réponse:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer la réponse');
    } finally {
      setLoading(false);
    }
  };

  const navigateToChat = () => {
    if (clientId && user?.id) {
      router.push({
        pathname: '/chat/[chatId]',
        params: {
          chatId: `conv_${user.id}_${clientId}`,
          name: clientName,
        }
      });
    }
  };

  if (responded) {
    return (
      <ThemedView style={{
        backgroundColor: responseType === 'accepted' ? theme.success + '15' : theme.error + '15',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: responseType === 'accepted' ? theme.success + '30' : theme.error + '30'
      }}>
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <MaterialCommunityIcons
            name={responseType === 'accepted' ? "check-circle" : "close-circle"}
            size={24}
            color={responseType === 'accepted' ? theme.success : theme.error}
          />
          <ThemedText style={{
            marginLeft: 12,
            color: responseType === 'accepted' ? theme.success : theme.error,
            fontWeight: '600'
          }}>
            {responseType === 'accepted' ? 'Visite acceptée !' : 'Visite refusée'}
          </ThemedText>
        </ThemedView>

        <TouchableOpacity
          onPress={navigateToChat}
          style={{
            backgroundColor: theme.primary,
            borderRadius: 8,
            padding: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <MaterialCommunityIcons name="message-text" size={16} color="white" />
          <ThemedText style={{ color: 'white', fontWeight: '600', marginLeft: 6 }}>
            Discuter avec le client
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{
      backgroundColor: theme.surfaceVariant,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.outline + '30'
    }}>
      <ThemedView style={{ marginBottom: 12 }}>
        <ThemedText style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
          Nouvelle demande de visite
        </ThemedText>
        <ThemedText style={{ fontSize: 14, color: theme.onSurface + '80' }}>
          {propertyTitle}
        </ThemedText>
      </ThemedView>

      <ThemedView style={{ marginBottom: 12 }}>
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <MaterialCommunityIcons name="account" size={16} color={theme.onSurface} />
          <ThemedText style={{ marginLeft: 8, fontSize: 13 }}>
            {clientName}
          </ThemedText>
        </ThemedView>
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: message ? 6 : 0 }}>
          <MaterialCommunityIcons name="calendar-clock" size={16} color={theme.onSurface} />
          <ThemedText style={{ marginLeft: 8, fontSize: 13 }}>
            {new Date(visitDate).toLocaleDateString('fr-FR')} à {visitTime}
          </ThemedText>
        </ThemedView>
        {message && (
          <ThemedView style={{
            backgroundColor: theme.surface,
            borderRadius: 8,
            padding: 10,
            marginTop: 8,
            borderLeftWidth: 3,
            borderLeftColor: theme.primary
          }}>
            <ThemedText style={{ fontSize: 12, color: theme.onSurface + '90', fontStyle: 'italic' }}>
              💬 "{message}"
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {isOwner && (
        <ThemedView style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          <TouchableOpacity
            onPress={() => handleResponse(true)}
            disabled={loading}
            style={{
              flex: 1,
              backgroundColor: theme.success,
              borderRadius: 8,
              padding: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              opacity: loading ? 0.6 : 1
            }}
          >
            <MaterialCommunityIcons name="check" size={16} color="white" />
            <ThemedText style={{ color: 'white', fontWeight: '600', marginLeft: 4 }}>
              Accepter
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleResponse(false)}
            disabled={loading}
            style={{
              flex: 1,
              backgroundColor: theme.error,
              borderRadius: 8,
              padding: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              opacity: loading ? 0.6 : 1
            }}
          >
            <MaterialCommunityIcons name="close" size={16} color="white" />
            <ThemedText style={{ color: 'white', fontWeight: '600', marginLeft: 4 }}>
              Refuser
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}

      {!isOwner && (
        <View style={{
          backgroundColor: theme.warning + '15',
          borderRadius: 8,
          padding: 12,
          alignItems: 'center',
          marginBottom: 8
        }}>
          <ThemedText style={{
            color: theme.warning,
            fontSize: 13,
            fontWeight: '600',
            textAlign: 'center'
          }}>
            ⏳ En attente de la réponse du propriétaire
          </ThemedText>
        </View>
      )}

      <TouchableOpacity
        onPress={navigateToChat}
        style={{
          backgroundColor: theme.surface,
          borderRadius: 8,
          padding: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: theme.outline + '30'
        }}
      >
        <MaterialCommunityIcons name="message-text" size={14} color={theme.primary} />
        <ThemedText style={{ color: theme.primary, fontSize: 12, marginLeft: 6 }}>
          {isOwner ? 'Discuter d\'abord' : 'Discuter avec le propriétaire'}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};
