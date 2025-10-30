import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useTheme } from '../contexts/theme/themehook';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import { useRecentActivities } from '../../hooks/useActivity';

interface ActivityTrackerProps {
  userId: string;
  onPress?: () => void;
  position?: 'fixed' | 'relative';
  style?: any;
}

const ActivityTracker: React.FC<ActivityTrackerProps> = ({
  userId,
  onPress,
  position = 'fixed',
  style
}) => {
  const { theme } = useTheme();
  const { activities, pendingCount, refresh } = useRecentActivities(userId, 5);
  const [pan] = useState(new Animated.ValueXY());
  const [isExpanded, setIsExpanded] = useState(false);

  // Create pan responder for drag functionality
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      pan.setOffset({
        x: (pan.x as any)._value,
        y: (pan.y as any)._value,
      });
    },
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x, dy: pan.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: () => {
      pan.flattenOffset();
    },
  });

  // Auto refresh activities every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [refresh]);

  const getUrgencyColor = () => {
    if (pendingCount === 0) return theme.success;
    if (pendingCount <= 2) return theme.warning;
    return theme.error;
  };

  const getActivityStatus = () => {
    if (pendingCount === 0) return 'Tout est à jour';
    if (pendingCount === 1) return '1 activité en attente';
    return `${pendingCount} activités en attente`;
  };

  const recentActivity = activities[0];

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const renderCollapsedTracker = () => (
    <MotiView
      from={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 15 }}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          overflow: 'hidden',
          shadowColor: theme.onSurface,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <LinearGradient
          colors={[getUrgencyColor(), getUrgencyColor() + '80']}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <MaterialCommunityIcons
            name="timeline"
            size={24}
            color="white"
          />

          {pendingCount > 0 && (
            <ThemedView style={{
              position: 'absolute',
              top: -2,
              right: -2,
              backgroundColor: theme.error,
              borderRadius: 10,
              width: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: 'white'
            }}>
              <ThemedText style={{
                color: 'white',
                fontSize: 10,
                fontWeight: '700'
              }}>
                {pendingCount > 9 ? '9+' : pendingCount}
              </ThemedText>
            </ThemedView>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </MotiView>
  );

  const renderExpandedTracker = () => (
    <MotiView
      from={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 15 }}
      style={{
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 16,
        minWidth: 280,
        maxWidth: 320,
        shadowColor: theme.onSurface,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12,
      }}
    >
      {/* Header */}
      <ThemedView style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
      }}>
        <ThemedView style={{
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <ThemedView style={{
            backgroundColor: getUrgencyColor() + '20',
            borderRadius: 8,
            padding: 6,
            marginRight: 8
          }}>
            <MaterialCommunityIcons
              name="timeline"
              size={16}
              color={getUrgencyColor()}
            />
          </ThemedView>
          <ThemedText style={{
            fontSize: 14,
            fontWeight: '600',
            color: theme.onSurface
          }}>
            Activités
          </ThemedText>
        </ThemedView>

        <TouchableOpacity
          onPress={() => setIsExpanded(false)}
          style={{
            backgroundColor: theme.surfaceVariant,
            borderRadius: 12,
            padding: 4
          }}
        >
          <MaterialCommunityIcons
            name="close"
            size={16}
            color={theme.onSurface + '80'}
          />
        </TouchableOpacity>
      </ThemedView>

      {/* Status */}
      <ThemedText style={{
        fontSize: 12,
        color: getUrgencyColor(),
        fontWeight: '500',
        marginBottom: 12
      }}>
        {getActivityStatus()}
      </ThemedText>

      {/* Recent Activity */}
      {recentActivity && (
        <ThemedView style={{
          backgroundColor: theme.surfaceVariant + '50',
          borderRadius: 12,
          padding: 12,
          marginBottom: 12
        }}>
          <ThemedText style={{
            fontSize: 12,
            fontWeight: '600',
            color: theme.onSurface,
            marginBottom: 4
          }}>
            Dernière activité
          </ThemedText>
          <ThemedText style={{
            fontSize: 11,
            color: theme.onSurface + '80',
            lineHeight: 14
          }} numberOfLines={2}>
            {recentActivity.message}
          </ThemedText>
        </ThemedView>
      )}

      {/* Action Buttons */}
      <ThemedView style={{
        flexDirection: 'row',
        gap: 8
      }}>
        <TouchableOpacity
          onPress={refresh}
          style={{
            flex: 1,
            backgroundColor: theme.primary + '15',
            borderRadius: 8,
            padding: 8,
            alignItems: 'center'
          }}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={14}
            color={theme.primary}
          />
          <ThemedText style={{
            fontSize: 10,
            color: theme.primary,
            fontWeight: '600',
            marginTop: 2
          }}>
            Actualiser
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPress}
          style={{
            flex: 1,
            backgroundColor: theme.success + '15',
            borderRadius: 8,
            padding: 8,
            alignItems: 'center'
          }}
        >
          <MaterialCommunityIcons
            name="eye"
            size={14}
            color={theme.success}
          />
          <ThemedText style={{
            fontSize: 10,
            color: theme.success,
            fontWeight: '600',
            marginTop: 2
          }}>
            Voir tout
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </MotiView>
  );

  if (position === 'fixed') {
    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 100,
            right: 20,
            zIndex: 1000,
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
          },
          style
        ]}
        {...panResponder.panHandlers}
      >
        {isExpanded ? renderExpandedTracker() : renderCollapsedTracker()}
      </Animated.View>
    );
  }

  return (
    <View style={style}>
      {isExpanded ? renderExpandedTracker() : renderCollapsedTracker()}
    </View>
  );
};

export default ActivityTracker;