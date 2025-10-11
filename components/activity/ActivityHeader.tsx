import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useTheme } from '@/components/contexts/theme/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useRecentActivities } from '@/hooks/useActivity';
import ActivityNotificationCenter from './ActivityNotificationCenter';
import { Activity } from '@/services/api/activityService';

interface ActivityHeaderProps {
  userId: string;
  onActivityPress?: (activity: Activity) => void;
  style?: any;
  showLabel?: boolean;
}

const { width } = Dimensions.get('window');

const ActivityHeader: React.FC<ActivityHeaderProps> = ({
  userId,
  onActivityPress,
  style,
  showLabel = false
}) => {
  const { theme } = useTheme();
  const { pendingCount, refresh } = useRecentActivities(userId, 5);
  const [isNotificationCenterVisible, setIsNotificationCenterVisible] = useState(false);
  const [pulseAnimation] = useState(new Animated.Value(1));

  // Animation for notification badge
  useEffect(() => {
    if (pendingCount > 0) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    }
  }, [pendingCount, pulseAnimation]);

  const handleNotificationPress = () => {
    setIsNotificationCenterVisible(true);
  };

  const handleCloseNotificationCenter = () => {
    setIsNotificationCenterVisible(false);
    refresh(); // Refresh activities when closing
  };

  const getBadgeColor = () => {
    if (pendingCount === 0) return theme.success;
    if (pendingCount <= 3) return theme.warning;
    return theme.error;
  };

  const getIconAnimation = () => {
    if (pendingCount > 0) {
      return {
        from: { rotate: '0deg', scale: 1 },
        animate: { rotate: '15deg', scale: 1.1 },
        transition: {
          type: 'spring',
          loop: true,
          duration: 1000,
          repeatReverse: true
        }
      };
    }
    return {
      from: { rotate: '0deg', scale: 1 },
      animate: { rotate: '0deg', scale: 1 }
    };
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleNotificationPress}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 8,
            borderRadius: 20,
            backgroundColor: theme.surface,
            shadowColor: theme.onSurface,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          },
          style
        ]}
        activeOpacity={0.7}
      >
        {/* Activity Icon with Animation */}
        <MotiView {...getIconAnimation()}>
          <ThemedView style={{
            backgroundColor: theme.primary + '15',
            borderRadius: 16,
            padding: 8,
            position: 'relative'
          }}>
            <MaterialCommunityIcons
              name="bell"
              size={20}
              color={theme.primary}
            />
          </ThemedView>
        </MotiView>

        {/* Notification Badge */}
        {pendingCount > 0 && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 2,
              right: showLabel ? (width * 0.15) : 2,
              transform: [{ scale: pulseAnimation }],
            }}
          >
            <LinearGradient
              colors={[getBadgeColor(), getBadgeColor() + '80']}
              style={{
                borderRadius: 12,
                minWidth: 24,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 6,
                borderWidth: 2,
                borderColor: theme.surface
              }}
            >
              <ThemedText style={{
                color: 'white',
                fontSize: 11,
                fontWeight: '700',
                textAlign: 'center'
              }}>
                {pendingCount > 99 ? '99+' : pendingCount}
              </ThemedText>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Label (optional) */}
        {showLabel && (
          <ThemedView style={{ marginLeft: 8 }}>
            <ThemedText style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.onSurface
            }}>
              Activités
            </ThemedText>
            {pendingCount > 0 && (
              <ThemedText style={{
                fontSize: 11,
                color: getBadgeColor(),
                fontWeight: '500'
              }}>
                {pendingCount} en attente
              </ThemedText>
            )}
          </ThemedView>
        )}

        {/* Status Indicator */}
        <ThemedView style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: pendingCount > 0 ? getBadgeColor() : theme.success,
          marginLeft: showLabel ? 8 : 4,
          opacity: 0.8
        }} />
      </TouchableOpacity>

      {/* Activity Notification Center Modal */}
      <Modal
        visible={isNotificationCenterVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseNotificationCenter}
      >
        <ActivityNotificationCenter
          userId={userId}
          onActivityPress={(activity) => {
            handleCloseNotificationCenter();
            onActivityPress?.(activity);
          }}
          onClose={handleCloseNotificationCenter}
          isVisible={isNotificationCenterVisible}
        />
      </Modal>
    </>
  );
};

export default ActivityHeader;