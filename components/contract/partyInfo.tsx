import React from 'react';
import { View, Text } from 'react-native';
import {User } from '@/types/type';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';

interface PartyInfoSectionProps {
  landlord: User | null;
  tenant: User | null;
}

 const PartyInfoSection: React.FC<PartyInfoSectionProps> = ({ landlord, tenant }) => {
  if (!landlord || !tenant) return null;

  return (
    <ThemedView className="flex-row justify-between mb-6">
      <ThemedView className="bg-gray-50 p-4 rounded-lg flex-1 mr-2">
        <ThemedText className="text-lg font-semibold mb-2">Propriétaire</ThemedText>
        <ThemedText className="font-medium">{landlord.fullName}</ThemedText>
        <ThemedText className="text-gray-500 text-sm">{landlord.email}</ThemedText>
        <ThemedText className="text-gray-500 text-sm">{landlord.phone}</ThemedText>
        {landlord.address && (
          <ThemedText className="text-gray-500 text-sm mt-1">{landlord.address}</ThemedText>
        )}
        {landlord.idNumber && (
          <ThemedView className="mt-2 pt-2 border-t border-gray-200">
            <ThemedText className="text-xs text-gray-400">ID vérifié</ThemedText>
          </ThemedView>
        )}
      </ThemedView>
      
      <ThemedView className="bg-gray-50 p-4 rounded-lg flex-1 ml-2">
        <ThemedText className="text-lg font-semibold mb-2">Locataire</ThemedText>
        <ThemedText className="font-medium">{tenant.fullName}</ThemedText>
        <ThemedText className="text-gray-500 text-sm">{tenant.email}</ThemedText>
        <ThemedText className="text-gray-500 text-sm">{tenant.phone}</ThemedText>
        {tenant.address && (
          <Text className="text-gray-500 text-sm mt-1">{tenant.address}</Text>
        )}
        {tenant.idNumber && (
          <ThemedView className="mt-2 pt-2 border-t border-gray-200">
            <ThemedText className="text-xs text-gray-400">ID vérifié</ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </ThemedView>
  );
};

export default PartyInfoSection;