// Fichier: components/CustomButton.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

type ButtonType = 'primary' | 'secondary' | 'outline' | 'danger';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  type?: ButtonType;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  loading = false,
  disabled = false,
  className = '',
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

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`py-3 px-4 rounded-lg items-center justify-center ${getButtonStyle()} ${
        disabled ? 'opacity-50' : 'opacity-100'
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={type === 'outline' ? '#3B82F6' : '#FFFFFF'} />
      ) : (
        <Text className={`font-medium ${getTextStyle()}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;