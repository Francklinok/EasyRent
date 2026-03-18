import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';

interface TypingIndicatorProps {
  typingUsers: string[];
  visible: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers, visible }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [dotAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible && typingUsers.length > 0) {
      // Animation d'apparition
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Animation des points
      const dotAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      dotAnimation.start();

      return () => {
        dotAnimation.stop();
      };
    } else {
      // Animation de disparition
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, typingUsers.length, fadeAnim, dotAnim]);

  if (!visible || typingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} est en train d'écrire`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} et ${typingUsers[1]} sont en train d'écrire`;
    } else {
      return `${typingUsers.slice(0, -1).join(', ')} et ${typingUsers[typingUsers.length - 1]} sont en train d'écrire`;
    }
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 12,
          color: '#6c757d',
          fontStyle: 'italic',
          flex: 1,
        }}
      >
        {getTypingText()}
      </Text>
      
      {/* Animation des points */}
      <View style={{ flexDirection: 'row', marginLeft: 4 }}>
        {[0, 1, 2].map((index) => (
          <Animated.View
            key={index}
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#6c757d',
              marginHorizontal: 1,
              opacity: dotAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
                extrapolate: 'clamp',
              }),
              transform: [
                {
                  scale: dotAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            }}
          />
        ))}
      </View>
    </Animated.View>
  );
};

export default TypingIndicator;