import React, { useState } from 'react';
import { TouchableOpacity, Alert, ActivityIndicator, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '../../ui/ThemedView';
import { ThemedText } from '../../ui/ThemedText';
import { useTheme } from '../../../hooks/themehook';
import { MotiView } from 'moti';
import { getBookingService } from '@/services/api/bookingService';

interface BookingRequestMessageProps {
  bookingData?: {
    id: string;
    startDate: Date | string;
    endDate: Date | string;
    numberOfOccupants: number;
    monthlyIncome?: number;
    hasGuarantor?: boolean;
    budget?: number;
    financingType?: string;
    timeframe?: string;
    status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  };
  propertyData?: {
    title: string;
    address?: string;
    price?: number;
    listType?: 'rent' | 'sale';
  };
  sender?: {
    name: string;
    avatar?: string;
  };
  messageContent?: string;
  isOwner: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  loading?: boolean;
}

const BookingRequestMessage: React.FC<BookingRequestMessageProps> = ({
  bookingData,
  propertyData,
  sender,
  messageContent,
  isOwner,
  onAccept,
  onReject,
  loading = false
}) => {
  const { theme } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);

  // Valeurs par défaut
  const defaultBookingData = {
    id: 'unknown',
    startDate: new Date(),
    endDate: new Date(),
    numberOfOccupants: 1,
    status: 'pending' as const
  };

  const defaultPropertyData = {
    title: 'Propriété inconnue',
    address: 'Adresse non spécifiée',
    listType: 'rent' as const
  };

  const booking = bookingData || defaultBookingData;
  const property = propertyData || defaultPropertyData;
  const isForSale = property.listType === 'sale';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return theme.primary;
      case 'confirmed': return theme.success;
      case 'rejected': return theme.error;
      case 'cancelled': return theme.error;
      default: return theme.onSurface;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'rejected': return 'Refusée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const handleAccept = () => {
    if (loading || isProcessing) return;
    onAccept?.();
  };

  const handleReject = () => {
    if (loading || isProcessing) return;
    onReject?.();
  };

  const formatDate = (date: Date | string) => {
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return String(date);
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 15 }}
      style={{
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
        borderWidth: 2,
        borderColor: getStatusColor(booking.status) + '30',
        shadowColor: theme.shadowColor || '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      {/* Header */}
      <ThemedView style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: 'transparent'
      }}>
        <ThemedView style={{
          backgroundColor: theme.primary + '20',
          borderRadius: 20,
          padding: 8,
          marginRight: 12
        }}>
          <MaterialCommunityIcons
            name={isForSale ? "hand-heart" : "home-account"}
            size={20}
            color={theme.primary}
          />
        </ThemedView>

        <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
          <ThemedText style={{
            fontSize: 16,
            fontWeight: '700',
            color: theme.onSurface
          }}>
            {isForSale ? 'Manifestation d\'intérêt' : 'Demande de réservation'}
          </ThemedText>
          <ThemedView style={{
            backgroundColor: getStatusColor(booking.status) + '20',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 12,
            alignSelf: 'flex-start',
            marginTop: 4
          }}>
            <ThemedText style={{
              fontSize: 10,
              fontWeight: '600',
              color: getStatusColor(booking.status)
            }}>
              {getStatusText(booking.status).toUpperCase()}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Property Info */}
      <ThemedView style={{
        backgroundColor: theme.surfaceVariant + '50',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12
      }}>
        <ThemedText style={{
          fontSize: 14,
          fontWeight: '600',
          color: theme.onSurface,
          marginBottom: 4
        }}>
          {property.title}
        </ThemedText>
        {property.address && (
          <ThemedText style={{
            fontSize: 12,
            color: theme.onSurface + '70'
          }}>
            {property.address}
          </ThemedText>
        )}
        {property.price && (
          <ThemedText style={{
            fontSize: 13,
            fontWeight: '600',
            color: theme.primary,
            marginTop: 6
          }}>
            {property.price.toLocaleString()} € {isForSale ? '' : '/ mois'}
          </ThemedText>
        )}
      </ThemedView>

      {/* Requester Info */}
      {sender && (
        <ThemedView style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.surface + '50',
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: theme.primary + '20'
        }}>
          <ThemedView style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.primary + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12
          }}>
            {sender.avatar ? (
              <ThemedText style={{ fontSize: 20 }}>
                {sender.name.charAt(0).toUpperCase()}
              </ThemedText>
            ) : (
              <MaterialCommunityIcons
                name="account"
                size={24}
                color={theme.primary}
              />
            )}
          </ThemedView>
          <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
            <ThemedText style={{
              fontSize: 13,
              color: theme.onSurface + '70',
              marginBottom: 2
            }}>
              {isForSale ? 'Acheteur potentiel' : 'Locataire potentiel'}
            </ThemedText>
            <ThemedText style={{
              fontSize: 15,
              fontWeight: '600',
              color: theme.onSurface
            }}>
              {sender.name}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      )}

      {/* Booking Details */}
      <ThemedView style={{
        backgroundColor: theme.background,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: isForSale ? theme.warning : theme.success
      }}>
        <ThemedText style={{
          fontSize: 12,
          color: theme.onSurface + '70',
          marginBottom: 8,
          fontWeight: '600'
        }}>
          DÉTAILS {isForSale ? 'DE L\'INTÉRÊT' : 'DE LA RÉSERVATION'}
        </ThemedText>

        {isForSale ? (
          // Pour vente
          <>
            {booking.budget && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <ThemedText style={{ fontSize: 13, color: theme.onSurface + '80' }}>
                  Budget
                </ThemedText>
                <ThemedText style={{ fontSize: 13, fontWeight: '600', color: theme.onSurface }}>
                  {booking.budget.toLocaleString()} €
                </ThemedText>
              </View>
            )}
            {booking.financingType && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <ThemedText style={{ fontSize: 13, color: theme.onSurface + '80' }}>
                  Financement
                </ThemedText>
                <ThemedText style={{ fontSize: 13, fontWeight: '600', color: theme.onSurface }}>
                  {booking.financingType}
                </ThemedText>
              </View>
            )}
            {booking.timeframe && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <ThemedText style={{ fontSize: 13, color: theme.onSurface + '80' }}>
                  Délai d'achat
                </ThemedText>
                <ThemedText style={{ fontSize: 13, fontWeight: '600', color: theme.onSurface }}>
                  {booking.timeframe}
                </ThemedText>
              </View>
            )}
          </>
        ) : (
          // Pour location
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <ThemedText style={{ fontSize: 13, color: theme.onSurface + '80' }}>
                Période
              </ThemedText>
              <ThemedText style={{ fontSize: 13, fontWeight: '600', color: theme.onSurface }}>
                {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
              </ThemedText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <ThemedText style={{ fontSize: 13, color: theme.onSurface + '80' }}>
                Occupants
              </ThemedText>
              <ThemedText style={{ fontSize: 13, fontWeight: '600', color: theme.onSurface }}>
                {booking.numberOfOccupants} {booking.numberOfOccupants > 1 ? 'personnes' : 'personne'}
              </ThemedText>
            </View>
            {booking.monthlyIncome && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <ThemedText style={{ fontSize: 13, color: theme.onSurface + '80' }}>
                  Revenu mensuel
                </ThemedText>
                <ThemedText style={{ fontSize: 13, fontWeight: '600', color: theme.onSurface }}>
                  {booking.monthlyIncome.toLocaleString()} €
                </ThemedText>
              </View>
            )}
            {booking.hasGuarantor !== undefined && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <ThemedText style={{ fontSize: 13, color: theme.onSurface + '80' }}>
                  Garant
                </ThemedText>
                <ThemedText style={{ fontSize: 13, fontWeight: '600', color: theme.onSurface }}>
                  {booking.hasGuarantor ? 'Oui' : 'Non'}
                </ThemedText>
              </View>
            )}
          </>
        )}
      </ThemedView>

      {/* Message Content */}
      {messageContent && (
        <ThemedView style={{
          backgroundColor: theme.background,
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
          borderLeftWidth: 4,
          borderLeftColor: theme.primary
        }}>
          <ThemedText style={{
            fontSize: 12,
            color: theme.onSurface + '70',
            marginBottom: 6,
            fontWeight: '600'
          }}>
            MESSAGE DU CLIENT
          </ThemedText>
          <ThemedText style={{
            fontSize: 14,
            color: theme.onSurface,
            lineHeight: 20
          }}>
            {messageContent}
          </ThemedText>
        </ThemedView>
      )}

      {/* Action Buttons for Owner */}
      {isOwner && booking.status === 'pending' && (
        <ThemedView style={{
          flexDirection: 'row',
          gap: 8,
          backgroundColor: 'transparent'
        }}>
          <TouchableOpacity
            onPress={handleReject}
            disabled={loading || isProcessing}
            style={{
              backgroundColor: theme.error,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 8,
              flex: 1,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              opacity: loading || isProcessing ? 0.5 : 1
            }}
          >
            {loading || isProcessing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <MaterialCommunityIcons name="close" size={16} color="white" />
                <ThemedText style={{
                  color: 'white',
                  fontWeight: '600',
                  fontSize: 14,
                  marginLeft: 4
                }}>
                  Refuser
                </ThemedText>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAccept}
            disabled={loading || isProcessing}
            style={{
              backgroundColor: theme.success,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 8,
              flex: 1,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              opacity: loading || isProcessing ? 0.5 : 1
            }}
          >
            {loading || isProcessing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <MaterialCommunityIcons name="check" size={16} color="white" />
                <ThemedText style={{
                  color: 'white',
                  fontWeight: '600',
                  fontSize: 14,
                  marginLeft: 4
                }}>
                  Accepter
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        </ThemedView>
      )}

      {/* Status Message for Client */}
      {!isOwner && booking.status !== 'pending' && (
        <ThemedView style={{
          backgroundColor: getStatusColor(booking.status) + '10',
          borderRadius: 8,
          padding: 12,
          alignItems: 'center'
        }}>
          <ThemedText style={{
            color: getStatusColor(booking.status),
            fontSize: 14,
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {booking.status === 'confirmed' && `✓ ${isForSale ? 'Intérêt accepté' : 'Réservation confirmée'} par le propriétaire`}
            {booking.status === 'rejected' && `✗ ${isForSale ? 'Intérêt refusé' : 'Réservation refusée'}`}
            {booking.status === 'cancelled' && '✗ Annulée'}
          </ThemedText>
        </ThemedView>
      )}
    </MotiView>
  );
};

export default BookingRequestMessage;
