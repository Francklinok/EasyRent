import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { MotiView } from 'moti';

interface RateLimitIndicatorProps {
  requestsInWindow: number;
  maxRequests: number;
  show?: boolean;
}

export const RateLimitIndicator: React.FC<RateLimitIndicatorProps> = ({
  requestsInWindow,
  maxRequests,
  show = true
}) => {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (requestsInWindow > maxRequests * 0.7) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [requestsInWindow, maxRequests]);

  if (!visible) return null;

  const percentage = (requestsInWindow / maxRequests) * 100;
  const isWarning = percentage > 70;
  const isCritical = percentage > 90;

  const getColor = () => {
    if (isCritical) return theme.error;
    if (isWarning) return theme.warning;
    return theme.success;
  };

  const getIcon = () => {
    if (isCritical) return 'alert-circle';
    if (isWarning) return 'alert';
    return 'information';
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -10 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <ThemedView
        style={{
          backgroundColor: getColor() + '15',
          borderRadius: 8,
          padding: 12,
          marginVertical: 8,
          borderWidth: 1,
          borderColor: getColor() + '30',
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        <MaterialCommunityIcons
          name={getIcon()}
          size={20}
          color={getColor()}
          style={{ marginRight: 8 }}
        />
        <View style={{ flex: 1 }}>
          <ThemedText
            style={{
              fontSize: 12,
              color: theme.onSurface,
              marginBottom: 4
            }}
          >
            {isCritical
              ? 'Limite de requêtes presque atteinte'
              : isWarning
              ? 'Ralentissez un peu...'
              : 'Limite de requêtes normale'}
          </ThemedText>
          <View
            style={{
              height: 4,
              backgroundColor: theme.outline + '20',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${percentage}%`,
                backgroundColor: getColor()
              }}
            />
          </View>
          <ThemedText
            style={{
              fontSize: 10,
              color: theme.onSurface + '70',
              marginTop: 4
            }}
          >
            {requestsInWindow} / {maxRequests} requêtes
          </ThemedText>
        </View>
      </ThemedView>
    </MotiView>
  );
};
