
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { ReactNode } from 'react';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useTheme } from '../contexts/theme/themehook';



type ButtonType = 'primary' | 'secondary' | 'outline' | 'danger';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  type?: ButtonType;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode; // Icône optionnelle
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  loading = false,
  disabled = false,
  className = '',
  icon,
}) => {
  // Détermine les styles en fonction du type de bouton
  const getButtonStyle = () => {
    switch (type) {
      case 'primary':
        return 'bg-blue-500';
      case 'secondary':
        return 'bg-gray-500';
      case 'outline':
        return 'bg-transparent border border-blue-500';
      case 'danger':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  // Détermine le style du texte en fonction du type de bouton
  const getTextStyle = () => {
    switch (type) {
      case 'outline':
        return 'text-blue-500';
      default:
        return 'text-white';
    }
  };
  const   {theme} = useTheme()

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`py-3 px-4 rounded-lg flex-row items-center justify-center ${getButtonStyle()} ${
        disabled ? 'opacity-50' : 'opacity-100'
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={type === 'outline' ? '#3B82F6' : '#FFFFFF'} />
      ) : (
        <View  className="flex-row items-center">
          {icon && <View className="mr-2">{icon}</View>}
          <ThemedText style ={{color:theme.surface}} >{title}</ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
