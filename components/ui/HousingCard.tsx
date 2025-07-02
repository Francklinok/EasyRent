
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
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
    <ThemedView className="flex-1">
      <ThemedText className="text-lg font-bold">{title}</ThemedText>
      <ThemedText className="text-green-600 text-base">{price} €/month</ThemedText>
      {children}
    </ThemedView>
  </TouchableOpacity>
);
export default HousingCard;