import React from 'react';
import { View, Text } from 'react-native';
import { Property,Reservation} from '@/types/type';
import { ThemedView } from '../ui/ThemedView';
import  { ThemedText } from '../ui/ThemedText';

interface ContractSummaryProps {
  property: Property | null;
  reservation: Reservation | null;
  formatDate: (date: any) => Date;
}

const ContractSummary: React.FC<ContractSummaryProps> = ({ property, reservation, formatDate }) => {
  if (!property || !reservation) return null;
  
  const startDate = formatDate(reservation.startDate);
  const endDate = formatDate(reservation.endDate);
  const durationMonths = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.5));
  
  // Calculer le montant total du contrat
  const totalContractValue = reservation.monthlyRent * durationMonths;
  
  return (
    <ThemedView className="bg-gray-50 p-4 rounded-lg mb-6">
      <ThemedText className="text-lg font-semibold mb-2">Résumé de la location</ThemedText>
      
      <ThemedView className="flex-row justify-between mb-1">
        <ThemedText>Propriété:</ThemedText>
        <ThemedText className="font-medium">{property.title}</ThemedText>
      </ThemedView>
      
      <ThemedView className="flex-row justify-between mb-1">
        <ThemedText>Adresse:</ThemedText>
        <ThemedText className="font-medium">{property.address}</ThemedText>
      </ThemedView>
      
      <ThemedView className="flex-row justify-between mb-1">
        <ThemedText>Type:</ThemedText>
        <ThemedText className="font-medium">{property.type}</ThemedText>
      </ThemedView>
      
      <ThemedView className="flex-row justify-between mb-1">
        <ThemedText>Surface:</ThemedText>
        <ThemedText className="font-medium">{property.surface} m²</ThemedText>
      </ThemedView>
      
      <ThemedView className="flex-row justify-between mb-1">
        <ThemedText>Nombre de pièces:</ThemedText>
        <ThemedText className="font-medium">{property.rooms}</ThemedText>
      </ThemedView>
      
      <ThemedView className="flex-row justify-between mb-1">
        <ThemedText>Loyer mensuel:</ThemedText>
        <ThemedText className="font-medium">{reservation.monthlyRent} €</ThemedText>
      </ThemedView>
      
      <ThemedView className="flex-row justify-between mb-1">
        <ThemedText>Dépôt de garantie:</ThemedText>
        <ThemedText className="font-medium">{property.depositAmount} €</ThemedText>
      </ThemedView>
      
      <ThemedView className="flex-row justify-between mb-1">
        <ThemedText>Date de début:</ThemedText>
        <ThemedText className="font-medium">
          {formatDate(reservation.startDate).toLocaleDateString('fr-FR')}
        </ThemedText>
      </ThemedView>
      
      <ThemedView className="flex-row justify-between mb-1">
        <ThemedText>Date de fin:</ThemedText>
        <ThemedText className="font-medium">
          {formatDate(reservation.endDate).toLocaleDateString('fr-FR')}
        </ThemedText>
      </ThemedView>
      
      <ThemedView className="flex-row justify-between mb-1">
        <ThemedText>Durée du contrat:</ThemedText>
        <ThemedText className="font-medium">{durationMonths} mois</ThemedText>
      </ThemedView>
      
      <ThemedView className="flex-row justify-between pt-2 mt-2 border-t border-gray-200">
        <ThemedText className="font-semibold">Valeur totale du contrat:</ThemedText>
        <ThemedText className="font-semibold text-indigo-700">{totalContractValue} €</ThemedText>
      </ThemedView>
    </ThemedView>
  );
};

export default ContractSummary;