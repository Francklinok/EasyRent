
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { ThemedView } from './ThemedView';
import { useTheme } from '../contexts/theme/themehook';
interface HousingCardProps {
  children?: React.ReactNode;
  onPress?: () => void;
  className?: string; 
}

// const  {theme} = useTheme();

export const HousingCard: React.FC<HousingCardProps> = ({ onPress, className, children }) => (
  
  <TouchableOpacity 
    className={`p-1 rounded-xl  flex-row items-center border${className}`} 
    // style = {{borderColor:theme.cardBorder}}
    onPress={onPress}
  >
    <ThemedView className="flex-1">
      {children}
    </ThemedView>
  </TouchableOpacity>
);
export default HousingCard;