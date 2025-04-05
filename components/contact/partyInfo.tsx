import React from 'react';
import { View, Text } from 'react-native';
import {User } from '@/types/type';


interface PartyInfoSectionProps {
  landlord: User | null;
  tenant: User | null;
}

 const PartyInfoSection: React.FC<PartyInfoSectionProps> = ({ landlord, tenant }) => {
  if (!landlord || !tenant) return null;

  return (
    <View className="flex-row justify-between mb-6">
      <View className="bg-gray-50 p-4 rounded-lg flex-1 mr-2">
        <Text className="text-lg font-semibold mb-2">Propriétaire</Text>
        <Text className="font-medium">{landlord.fullName}</Text>
        <Text className="text-gray-500 text-sm">{landlord.email}</Text>
        <Text className="text-gray-500 text-sm">{landlord.phone}</Text>
        {landlord.address && (
          <Text className="text-gray-500 text-sm mt-1">{landlord.address}</Text>
        )}
        {landlord.idNumber && (
          <View className="mt-2 pt-2 border-t border-gray-200">
            <Text className="text-xs text-gray-400">ID vérifié</Text>
          </View>
        )}
      </View>
      
      <View className="bg-gray-50 p-4 rounded-lg flex-1 ml-2">
        <Text className="text-lg font-semibold mb-2">Locataire</Text>
        <Text className="font-medium">{tenant.fullName}</Text>
        <Text className="text-gray-500 text-sm">{tenant.email}</Text>
        <Text className="text-gray-500 text-sm">{tenant.phone}</Text>
        {tenant.address && (
          <Text className="text-gray-500 text-sm mt-1">{tenant.address}</Text>
        )}
        {tenant.idNumber && (
          <View className="mt-2 pt-2 border-t border-gray-200">
            <Text className="text-xs text-gray-400">ID vérifié</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default PartyInfoSection;