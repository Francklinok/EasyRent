
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface HousingCardProps {
  children?: React.ReactNode;
  title: string;
  price: number;
  onPress?: () => void;
  className?: string; 
}

export const HousingCard: React.FC<HousingCardProps> = ({ title, price, onPress, className, children }) => (
  <TouchableOpacity 
    className={`bg-white p-4 rounded-xl shadow-md flex-row items-center ${className}`} 
    onPress={onPress}
  >
    <View className="flex-1">
      <Text className="text-lg font-bold">{title}</Text>
      <Text className="text-green-600 text-base">{price} €/month</Text>
      {children}
    </View>
  </TouchableOpacity>
);
