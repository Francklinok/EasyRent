import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Reservation } from '@/types/type'
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';


interface ContractStatusSectionProps {
  contractFileUri: string | null;
  reservation: Reservation | null;
}

const ContractStatusSection: React.FC<ContractStatusSectionProps> = ({ 
  contractFileUri, 
  reservation 
}) => {
  // Déterminer le statut et l'icône en fonction de l'état du contrat
  const getStatusInfo = () => {
    if (!contractFileUri) {
      return {
        icon: "time-outline",
        color: "#F59E0B",
        text: "En attente de génération"
      };
    }
    
    if (reservation?.status === 'contract_signed') {
      return {
        icon: "shield-checkmark",
        color: "#10B981",
        text: "Contrat signé le " + new Date(reservation.signatureDate || Date.now()).toLocaleDateString('fr-FR')
      };
    }
    
    return {
      icon: "checkmark-circle",
      color: "#10B981",
      text: "Contrat généré le " + new Date(reservation?.contractGenerationDate || Date.now()).toLocaleDateString('fr-FR')
    };
  };

  const { icon, color, text } = getStatusInfo();

  return (
    <ThemedView className="bg-gray-50 p-4 rounded-lg mb-6">
      <ThemedText className="text-lg font-semibold mb-2">Statut du contrat</ThemedText>
      <ThemedView className="flex-row items-center">
        <Ionicons name={icon} size={24} color={color} />
        <ThemedText className="ml-2">{text}</ThemedText>
      </ThemedView>
      
      {reservation?.status === 'contract_generated' && !reservation?.status.includes('signed') && (
        <ThemedView className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
          <ThemedText className="text-yellow-800 text-sm">
            Le contrat est en attente de signature par les deux parties.
          </ThemedText>
        </ThemedView>
      )}
      
      {reservation?.status === 'contract_signed' && (
        <ThemedView className="mt-3 p-2 bg-green-50 rounded border border-green-200">
          <ThemedText className="text-green-800 text-sm">
            Le contrat a été signé électroniquement et est désormais légalement contraignant.
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
};

export default ContractStatusSection;