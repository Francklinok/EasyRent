import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { ReactNode } from 'react';
import { ThemedText } from './ThemedText';
import { useTheme } from '../../hooks/themehook';

type ButtonType = 'primary' | 'secondary' | 'outline' | 'danger' | 'success';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  type?: ButtonType;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
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

  const {theme} = useTheme();

  const getTextColor = () => {
    switch (type) {
      case 'outline':
        return theme.primary;
      default:
        return '#FFFFFF';
    }
  };

  const getButtonStyle = () => {
    switch (type) {
      case 'primary':
        return { backgroundColor: theme.primary };
      case 'secondary':
        return { backgroundColor: theme.secondary };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.primary };
      case 'danger':
        return { backgroundColor: theme.error };
      case 'success':
        return { backgroundColor: theme.success };
      default:
        return { backgroundColor: theme.primary };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
        },
        getButtonStyle(),
      ]}
      className={className}
    >
      {loading ? (
        <ActivityIndicator size="small" color={type === 'outline' ? theme.primary : '#FFFFFF'} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
          <ThemedText type="normal" intensity="strong" style={{ color: getTextColor() }}>{title}</ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
