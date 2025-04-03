import React from 'react';
import { View, Text } from 'react-native';
import { Property,Reservation} from '@/types/type';


interface ContractSummaryProps {
  property: Property | null;
  reservation: Reservation | null;
  formatDate: (date: any) => Date;
}

export const ContractSummary: React.FC<ContractSummaryProps> = ({ property, reservation, formatDate }) => {
  if (!property || !reservation) return null;
  
  // Calculer la durée du contrat en mois
  const startDate = formatDate(reservation.startDate);
  const endDate = formatDate(reservation.endDate);
  const durationMonths = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.5));
  
  // Calculer le montant total du contrat
  const totalContractValue = reservation.monthlyRent * durationMonths;
  
  return (
    <View className="bg-gray-50 p-4 rounded-lg mb-6">
      <Text className="text-lg font-semibold mb-2">Résumé de la location</Text>
      
      <View className="flex-row justify-between mb-1">
        <Text>Propriété:</Text>
        <Text className="font-medium">{property.title}</Text>
      </View>
      
      <View className="flex-row justify-between mb-1">
        <Text>Adresse:</Text>
        <Text className="font-medium">{property.address}</Text>
      </View>
      
      <View className="flex-row justify-between mb-1">
        <Text>Type:</Text>
        <Text className="font-medium">{property.type}</Text>
      </View>
      
      <View className="flex-row justify-between mb-1">
        <Text>Surface:</Text>
        <Text className="font-medium">{property.surface} m²</Text>
      </View>
      
      <View className="flex-row justify-between mb-1">
        <Text>Nombre de pièces:</Text>
        <Text className="font-medium">{property.rooms}</Text>
      </View>
      
      <View className="flex-row justify-between mb-1">
        <Text>Loyer mensuel:</Text>
        <Text className="font-medium">{reservation.monthlyRent} €</Text>
      </View>
      
      <View className="flex-row justify-between mb-1">
        <Text>Dépôt de garantie:</Text>
        <Text className="font-medium">{property.depositAmount} €</Text>
      </View>
      
      <View className="flex-row justify-between mb-1">
        <Text>Date de début:</Text>
        <Text className="font-medium">
          {formatDate(reservation.startDate).toLocaleDateString('fr-FR')}
        </Text>
      </View>
      
      <View className="flex-row justify-between mb-1">
        <Text>Date de fin:</Text>
        <Text className="font-medium">
          {formatDate(reservation.endDate).toLocaleDateString('fr-FR')}
        </Text>
      </View>
      
      <View className="flex-row justify-between mb-1">
        <Text>Durée du contrat:</Text>
        <Text className="font-medium">{durationMonths} mois</Text>
      </View>
      
      <View className="flex-row justify-between pt-2 mt-2 border-t border-gray-200">
        <Text className="font-semibold">Valeur totale du contrat:</Text>
        <Text className="font-semibold text-indigo-700">{totalContractValue} €</Text>
      </View>
    </View>
  );
};