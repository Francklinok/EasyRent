import React, { useState } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { getBookingService } from '@/services/api/bookingService';
import { router } from 'expo-router';

interface BookingRequestNotificationProps {
  bookingId: string;
  propertyTitle: string;
  propertyId?: string;
  propertyPrice?: number;
  listType?: 'rent' | 'sale';
  clientName: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  numberOfOccupants?: number;
  budget?: number;
  financingType?: string;
  message?: string;
  isOwner: boolean;
  onResponse?: (accepted: boolean) => void;
}

export const BookingRequestNotification: React.FC<BookingRequestNotificationProps> = ({
  bookingId,
  propertyTitle,
  propertyId,
  propertyPrice,
  listType = 'rent',
  clientName,
  clientId,
  startDate,
  endDate,
  numberOfOccupants,
  budget,
  financingType,
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

  const isForSale = listType === 'sale';

  const handleResponse = async (accept: boolean) => {
    console.log('🔵 handleResponse called:', { accept, bookingId, userId: user?.id });

    if (!user?.id) {
      Alert.alert('Erreur', 'Vous devez être connecté');
      return;
    }

    try {
      setLoading(true);
      console.log('🔵 Calling respondToBookingRequest...');

      const result = await bookingService.respondToBookingRequest(
        bookingId,
        user.id,
        accept,
        accept ? undefined : 'Conditions non remplies'
      );

      console.log('✅ Response result:', result);

      setResponded(true);
      setResponseType(accept ? 'accepted' : 'rejected');
      onResponse?.(accept);

      Alert.alert(
        accept ? (isForSale ? 'Intérêt accepté !' : 'Réservation acceptée !') : (isForSale ? 'Intérêt refusé' : 'Réservation refusée'),
        accept
          ? `Le client a été notifié de votre acceptation. ${isForSale ? 'Vous pouvez discuter des détails de la vente dans le chat.' : 'Vous pouvez finaliser les détails dans le chat.'}`
          : 'Le client a été notifié. Vous pouvez lui proposer d\'autres options.',
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

  const formatDate = (date?: string) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return date;
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
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
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
            {responseType === 'accepted'
              ? (isForSale ? 'Intérêt accepté !' : 'Réservation acceptée !')
              : (isForSale ? 'Intérêt refusé' : 'Réservation refusée')}
          </ThemedText>
        </View>

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
      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <MaterialCommunityIcons
            name={isForSale ? "hand-heart" : "home-account"}
            size={20}
            color={theme.primary}
          />
          <ThemedText style={{ fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
            {isForSale ? 'Nouvelle manifestation d\'intérêt' : 'Nouvelle demande de réservation'}
          </ThemedText>
        </View>
        <ThemedText style={{ fontSize: 14, color: theme.onSurface + '80', fontWeight: '600' }}>
          {propertyTitle}
        </ThemedText>
        {propertyPrice && (
          <ThemedText style={{ fontSize: 13, color: theme.primary, fontWeight: '600', marginTop: 4 }}>
            {propertyPrice.toLocaleString()} € {isForSale ? '' : '/ mois'}
          </ThemedText>
        )}
      </View>

      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <MaterialCommunityIcons name="account" size={16} color={theme.onSurface} />
          <ThemedText style={{ marginLeft: 8, fontSize: 13, fontWeight: '600' }}>
            {clientName}
          </ThemedText>
        </View>

        {/* Détails pour location */}
        {!isForSale && startDate && endDate && (
          <View style={{
            backgroundColor: theme.surface,
            borderRadius: 8,
            padding: 10,
            marginBottom: 8,
            borderLeftWidth: 3,
            borderLeftColor: theme.success
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <MaterialCommunityIcons name="calendar-range" size={14} color={theme.onSurface} />
              <ThemedText style={{ marginLeft: 6, fontSize: 12 }}>
                {formatDate(startDate)} → {formatDate(endDate)}
              </ThemedText>
            </View>
            {numberOfOccupants && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="account-group" size={14} color={theme.onSurface} />
                <ThemedText style={{ marginLeft: 6, fontSize: 12 }}>
                  {numberOfOccupants} {numberOfOccupants > 1 ? 'occupants' : 'occupant'}
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {isForSale && budget && (
          <View style={{
            backgroundColor: theme.surface,
            borderRadius: 8,
            padding: 10,
            marginBottom: 8,
            borderLeftWidth: 3,
            borderLeftColor: theme.warning
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <MaterialCommunityIcons name="cash" size={14} color={theme.onSurface} />
              <ThemedText style={{ marginLeft: 6, fontSize: 12 }}>
                Budget: {budget.toLocaleString()} €
              </ThemedText>
            </View>
            {financingType && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="bank" size={14} color={theme.onSurface} />
                <ThemedText style={{ marginLeft: 6, fontSize: 12 }}>
                  {financingType}
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {message && (
          <View style={{
            backgroundColor: theme.surface,
            borderRadius: 8,
            padding: 10,
            marginTop: 8,
            borderLeftWidth: 3,
            borderLeftColor: theme.primary
          }}>
            <ThemedText style={{ fontSize: 11, color: theme.onSurface + '60', marginBottom: 4, fontWeight: '600' }}>
              MESSAGE DU CLIENT
            </ThemedText>
            <ThemedText style={{ fontSize: 12, color: theme.onSurface + '90', fontStyle: 'italic' }}>
              "{message}"
            </ThemedText>
          </View>
        )}
      </View>

      {isOwner && (
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
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
        </View>
      )}

      {/* Message pour le client (non propriétaire) */}
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
