import React, { useState } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { getBookingService } from '@/services/api/bookingService';

interface VisitRequestActionsProps {
  visitId: string;
  propertyId: string;
  clientId: string;
  ownerId?: string;
  currentUserId: string;
  visitDate?: string;
  visitTime?: string;
  propertyTitle: string;
  isReservation?: boolean;
  status?: 'pending' | 'accepted' | 'rejected' | 'confirmed' | 'cancelled';
  onAccept?: () => void;
  onReject?: () => void;
}

const VisitRequestActions: React.FC<VisitRequestActionsProps> = ({
  visitId,
  currentUserId,
  isReservation = false,
  status = 'pending',
  onAccept,
  onReject
}) => {
  const { theme } = useTheme();
  const bookingService = getBookingService();
  const [loading, setLoading] = useState(false);
  const [actionTaken, setActionTaken] = useState<'accepted' | 'rejected' | null>(null);
  const [hasDisplayed, setHasDisplayed] = useState(true);

  if (status !== 'pending' || actionTaken) {
    return null;
  }

  const typeLabel = isReservation ? 'reservation' : 'visite';

  const handleAccept = async () => {
    try {
      setLoading(true);
      if (isReservation) {
        await bookingService.acceptReservation(visitId);
      } else {
        await bookingService.respondToVisitRequest(visitId, currentUserId, true);
      }
      setActionTaken('accepted');
      setHasDisplayed(false);
      onAccept?.();
    } catch (error) {
      console.error(`Erreur acceptation ${typeLabel}:`, error);
      Alert.alert('Erreur', `Impossible d'accepter la ${typeLabel}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    Alert.alert(
      `Refuser la ${typeLabel}`,
      `Voulez-vous refuser cette demande ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              if (isReservation) {
                await bookingService.rejectReservation(visitId, 'Demande refusee');
              } else {
                await bookingService.respondToVisitRequest(visitId, currentUserId, false, 'Creneau non disponible');
              }
              setActionTaken('rejected');
              onReject?.();
              setHasDisplayed(false)
            } catch (error) {
              console.error(`Erreur refus ${typeLabel}:`, error);
              Alert.alert('Erreur', `Impossible de refuser la ${typeLabel}`);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ThemedView style={{
      borderRadius: 12,
      padding: 8,
      marginTop: 4
    }}>
      

      <ThemedView style={{ flexDirection: 'row', gap: 4 }}>
        <TouchableOpacity
          onPress={handleAccept}
          disabled={loading}
          style={{
            flex: 1,
            backgroundColor: theme.success,
            borderRadius: 8,
            padding: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: loading ? 0.6 : 1
          }}
        >
          <MaterialCommunityIcons name="check" size={16} color="white" />
          <ThemedText style={{
            color: 'white',
            fontSize: 13,
            fontWeight: '600',
            marginLeft: 4
          }}>
            Accepter
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleReject}
          disabled={loading}
          style={{
            flex: 1,
            backgroundColor: theme.error,
            borderRadius: 8,
            padding: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: loading ? 0.6 : 1
          }}
        >
          <MaterialCommunityIcons name="close" size={16} color="white" />
          <ThemedText style={{
            color: 'white',
            fontSize: 13,
            fontWeight: '600',
            marginLeft: 4
          }}>
            Refuser
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
};

export default VisitRequestActions;
