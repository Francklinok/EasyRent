import React, { useState } from 'react';
import { TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '../../ui/ThemedView';
import { ThemedText } from '../../ui/ThemedText';
import { useTheme } from '../../contexts/theme/themehook';
import { MotiView } from 'moti';
import { getBookingService } from '@/services/api/bookingService';
import { useAuth } from '../../contexts/authContext/AuthContext';

interface VisitRequestData {
  visitId: string;
  visitDate: string;
  visitTime: string;
  visitType: 'physical' | 'virtual' | 'self-guided';
  numberOfVisitors?: number;
  propertyTitle?: string;
  status?: 'pending' | 'accepted' | 'rejected';
}

interface VisitRequestChatMessageProps {
  messageId: string;
  content: string;
  visitData: VisitRequestData;
  isOwner: boolean; // Le propriétaire peut accepter/refuser
  onStatusChange?: (newStatus: 'accepted' | 'rejected') => void;
}

const VisitRequestChatMessage: React.FC<VisitRequestChatMessageProps> = ({
  messageId,
  content,
  visitData,
  isOwner,
  onStatusChange
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const bookingService = getBookingService();

  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected'>(
    visitData.status || 'pending'
  );
  const [loading, setLoading] = useState(false);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getVisitTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      physical: 'Visite physique',
      virtual: 'Visite virtuelle',
      'self-guided': 'Visite autonome'
    };
    return labels[type] || type;
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          color: theme.warning || '#F59E0B',
          icon: 'clock-outline' as const,
          label: 'En attente de réponse',
          bgColor: (theme.warning || '#F59E0B') + '15'
        };
      case 'accepted':
        return {
          color: theme.success || '#10B981',
          icon: 'check-circle' as const,
          label: 'Visite confirmée',
          bgColor: (theme.success || '#10B981') + '15'
        };
      case 'rejected':
        return {
          color: theme.error || '#EF4444',
          icon: 'close-circle' as const,
          label: 'Visite refusée',
          bgColor: (theme.error || '#EF4444') + '15'
        };
    }
  };

  const handleAccept = async () => {
    if (!user?.id) return;

    Alert.alert(
      'Confirmer la visite',
      `Voulez-vous accepter cette demande de ${getVisitTypeLabel(visitData.visitType).toLowerCase()} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Accepter',
          onPress: async () => {
            try {
              setLoading(true);

              await bookingService.respondToVisitRequest(
                visitData.visitId,
                user.id,
                true // accepted
              );

              setStatus('accepted');
              onStatusChange?.('accepted');

              Alert.alert(
                '✅ Visite confirmée',
                'Le client a été notifié de votre acceptation.',
                [{ text: 'OK' }]
              );
            } catch (error: any) {
              console.error('Error accepting visit:', error);
              Alert.alert(
                'Erreur',
                error.message || 'Impossible de confirmer la visite'
              );
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleReject = async () => {
    if (!user?.id) return;

    Alert.prompt(
      'Refuser la visite',
      'Voulez-vous indiquer une raison (optionnel) ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: async (reason) => {
            try {
              setLoading(true);

              await bookingService.respondToVisitRequest(
                visitData.visitId,
                user.id,
                false, // rejected
                reason || undefined
              );

              setStatus('rejected');
              onStatusChange?.('rejected');

              Alert.alert(
                'Visite refusée',
                'Le client a été notifié de votre refus.',
                [{ text: 'OK' }]
              );
            } catch (error: any) {
              console.error('Error rejecting visit:', error);
              Alert.alert(
                'Erreur',
                error.message || 'Impossible de refuser la visite'
              );
            } finally {
              setLoading(false);
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const statusConfig = getStatusConfig();

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 15 }}
    >
      <ThemedView
        style={{
          backgroundColor: theme.surfaceVariant,
          borderRadius: 16,
          padding: 16,
          marginVertical: 8,
          borderWidth: 2,
          borderColor: statusConfig.color + '30',
          shadowColor: theme.shadowColor || '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }}
      >
        {/* Header avec icône et type de visite */}
        <ThemedView
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
            backgroundColor: 'transparent'
          }}
        >
          <ThemedView
            style={{
              backgroundColor: theme.primary + '20',
              borderRadius: 24,
              padding: 10,
              marginRight: 12
            }}
          >
            <MaterialCommunityIcons
              name={
                visitData.visitType === 'physical'
                  ? 'home-city'
                  : visitData.visitType === 'virtual'
                    ? 'video'
                    : 'key'
              }
              size={24}
              color={theme.primary}
            />
          </ThemedView>

          <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
            <ThemedText
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: theme.onSurface
              }}
            >
              {getVisitTypeLabel(visitData.visitType)}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 12,
                color: theme.onSurface + '70',
                marginTop: 2
              }}
            >
              {visitData.propertyTitle || 'Demande de visite'}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Contenu du message */}
        <ThemedView
          style={{
            backgroundColor: theme.surface,
            borderRadius: 12,
            padding: 12,
            marginBottom: 12
          }}
        >
          <ThemedText
            style={{
              fontSize: 14,
              color: theme.onSurface,
              lineHeight: 20
            }}
          >
            {content}
          </ThemedText>
        </ThemedView>

        {/* Détails de la visite */}
        <ThemedView
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 12,
            backgroundColor: 'transparent'
          }}
        >
          <ThemedView
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'transparent'
            }}
          >
            <MaterialCommunityIcons
              name="calendar"
              size={16}
              color={theme.onSurface + '70'}
            />
            <ThemedText
              style={{
                fontSize: 13,
                color: theme.onSurface,
                marginLeft: 6,
                fontWeight: '500'
              }}
            >
              {formatDate(visitData.visitDate)}
            </ThemedText>
          </ThemedView>

          <ThemedView
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'transparent'
            }}
          >
            <MaterialCommunityIcons
              name="clock"
              size={16}
              color={theme.onSurface + '70'}
            />
            <ThemedText
              style={{
                fontSize: 13,
                color: theme.onSurface,
                marginLeft: 6,
                fontWeight: '500'
              }}
            >
              {visitData.visitTime}
            </ThemedText>
          </ThemedView>

          {visitData.numberOfVisitors && visitData.numberOfVisitors > 1 && (
            <ThemedView
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'transparent'
              }}
            >
              <MaterialCommunityIcons
                name="account-group"
                size={16}
                color={theme.onSurface + '70'}
              />
              <ThemedText
                style={{
                  fontSize: 13,
                  color: theme.onSurface,
                  marginLeft: 6,
                  fontWeight: '500'
                }}
              >
                {visitData.numberOfVisitors}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {/* Badge de statut */}
        <ThemedView
          style={{
            backgroundColor: statusConfig.bgColor,
            borderRadius: 8,
            padding: 10,
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: status === 'pending' && isOwner ? 12 : 0
          }}
        >
          <MaterialCommunityIcons
            name={statusConfig.icon}
            size={18}
            color={statusConfig.color}
          />
          <ThemedText
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: statusConfig.color,
              marginLeft: 8
            }}
          >
            {statusConfig.label}
          </ThemedText>
        </ThemedView>

        {/* Boutons d'action pour le propriétaire (seulement si pending) */}
        {isOwner && status === 'pending' && (
          <ThemedView
            style={{
              flexDirection: 'row',
              gap: 8,
              backgroundColor: 'transparent'
            }}
          >
            <TouchableOpacity
              onPress={handleReject}
              disabled={loading}
              style={{
                backgroundColor: theme.error,
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 10,
                flex: 1,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialCommunityIcons name="close" size={18} color="white" />
                  <ThemedText
                    style={{
                      color: 'white',
                      fontWeight: '600',
                      fontSize: 14,
                      marginLeft: 6
                    }}
                  >
                    Refuser
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAccept}
              disabled={loading}
              style={{
                backgroundColor: theme.success,
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 10,
                flex: 1,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check" size={18} color="white" />
                  <ThemedText
                    style={{
                      color: 'white',
                      fontWeight: '600',
                      fontSize: 14,
                      marginLeft: 6
                    }}
                  >
                    Accepter
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </ThemedView>
        )}

        {/* Message de statut pour le client */}
        {!isOwner && status !== 'pending' && (
          <ThemedView
            style={{
              backgroundColor: statusConfig.bgColor,
              borderRadius: 10,
              padding: 12,
              alignItems: 'center',
              marginTop: 12
            }}
          >
            <ThemedText
              style={{
                color: statusConfig.color,
                fontSize: 14,
                fontWeight: '600',
                textAlign: 'center'
              }}
            >
              {status === 'accepted' &&
                '✓ Le propriétaire a confirmé cette visite'}
              {status === 'rejected' &&
                '✗ Le propriétaire a refusé cette demande'}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </MotiView>
  );
};

export default VisitRequestChatMessage;
