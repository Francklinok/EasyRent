import React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '../../ui/ThemedView';
import { ThemedText } from '../../ui/ThemedText';
import { useTheme } from '../../contexts/theme/themehook';
import { MotiView } from 'moti';

interface VisitRequestMessageProps {
  visitData: {
    id: string;
    date: Date;
    time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  };
  propertyData: {
    title: string;
    address?: string;
  };
  isOwner: boolean;
  onAccept?: () => void;
  onReject?: () => void;
}

const VisitRequestMessage: React.FC<VisitRequestMessageProps> = ({
  visitData,
  propertyData,
  isOwner,
  onAccept,
  onReject
}) => {
  const { theme } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return theme.primary;
      case 'confirmed': return theme.success;
      case 'completed': return theme.success;
      case 'cancelled': return theme.error;
      default: return theme.onSurface;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const handleAccept = () => {
    Alert.alert(
      'Confirmer la visite',
      'Voulez-vous accepter cette demande de visite ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Accepter', 
          onPress: () => {
            onAccept?.();
            Alert.alert('Visite confirmée', 'La visite a été confirmée. Le client recevra une notification.');
          }
        }
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      'Refuser la visite',
      'Voulez-vous refuser cette demande de visite ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Refuser', 
          style: 'destructive',
          onPress: () => {
            onReject?.();
            Alert.alert('Visite refusée', 'La demande de visite a été refusée.');
          }
        }
      ]
    );
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
        borderColor: getStatusColor(visitData.status) + '30',
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
            name="calendar-clock" 
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
            Demande de visite
          </ThemedText>
          <ThemedView style={{
            backgroundColor: getStatusColor(visitData.status) + '20',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 12,
            alignSelf: 'flex-start',
            marginTop: 4
          }}>
            <ThemedText style={{ 
              fontSize: 10, 
              fontWeight: '600',
              color: getStatusColor(visitData.status)
            }}>
              {getStatusText(visitData.status).toUpperCase()}
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
          {propertyData.title}
        </ThemedText>
        {propertyData.address && (
          <ThemedText style={{ 
            fontSize: 12, 
            color: theme.onSurface + '70'
          }}>
            {propertyData.address}
          </ThemedText>
        )}
      </ThemedView>

      {/* Visit Details */}
      <ThemedView style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        marginBottom: 16,
        backgroundColor: 'transparent'
      }}>
        <ThemedView style={{ 
          flexDirection: 'row', 
          alignItems: 'center',
          backgroundColor: 'transparent'
        }}>
          <MaterialCommunityIcons 
            name="calendar" 
            size={16} 
            color={theme.onSurface + '70'} 
          />
          <ThemedText style={{ 
            fontSize: 14, 
            color: theme.onSurface,
            marginLeft: 8,
            fontWeight: '500'
          }}>
            {visitData.date.toLocaleDateString('fr-FR')}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={{ 
          flexDirection: 'row', 
          alignItems: 'center',
          backgroundColor: 'transparent'
        }}>
          <MaterialCommunityIcons 
            name="clock" 
            size={16} 
            color={theme.onSurface + '70'} 
          />
          <ThemedText style={{ 
            fontSize: 14, 
            color: theme.onSurface,
            marginLeft: 8,
            fontWeight: '500'
          }}>
            {visitData.time}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Action Buttons for Owner */}
      {isOwner && visitData.status === 'pending' && (
        <ThemedView style={{ 
          flexDirection: 'row', 
          gap: 8,
          backgroundColor: 'transparent'
        }}>
          <TouchableOpacity
            onPress={handleReject}
            style={{
              backgroundColor: theme.error,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 8,
              flex: 1,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center'
            }}
          >
            <MaterialCommunityIcons name="close" size={16} color="white" />
            <ThemedText style={{ 
              color: 'white', 
              fontWeight: '600',
              fontSize: 14,
              marginLeft: 4
            }}>
              Refuser
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleAccept}
            style={{
              backgroundColor: theme.success,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 8,
              flex: 1,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center'
            }}
          >
            <MaterialCommunityIcons name="check" size={16} color="white" />
            <ThemedText style={{ 
              color: 'white', 
              fontWeight: '600',
              fontSize: 14,
              marginLeft: 4
            }}>
              Accepter
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}

      {/* Status Message for Client */}
      {!isOwner && visitData.status !== 'pending' && (
        <ThemedView style={{
          backgroundColor: getStatusColor(visitData.status) + '10',
          borderRadius: 8,
          padding: 12,
          alignItems: 'center'
        }}>
          <ThemedText style={{ 
            color: getStatusColor(visitData.status),
            fontSize: 14,
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {visitData.status === 'confirmed' && '✓ Visite confirmée par le propriétaire'}
            {visitData.status === 'completed' && '✓ Visite terminée'}
            {visitData.status === 'cancelled' && '✗ Visite annulée'}
          </ThemedText>
        </ThemedView>
      )}
    </MotiView>
  );
};

export default VisitRequestMessage;