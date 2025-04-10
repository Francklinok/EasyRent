
import React, { useEffect } from 'react';
import { TouchableOpacity, Animated, Easing, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/theme/themehook';

const ThemeToggle = () => {
  const { toggleTheme, isDark } = useTheme();
  const spinValue = new Animated.Value(0);
  const scaleValue = new Animated.Value(1);

  useEffect(() => {
    // Animation de rotation
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 500,
      easing: Easing.elastic(1),
      useNativeDriver: true,
    }).start(() => spinValue.setValue(0));

    // Animation de pulse
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 200,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
    ]).start();
  }, [isDark]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity 
      onPress={toggleTheme}
      activeOpacity={0.7}
      style={styles.container}
    >
      <Animated.View style={[
        styles.iconContainer,
        { 
          transform: [{ rotate: spin }, { scale: scaleValue }],
        }
      ]}>
        {isDark ? (
          <MaterialCommunityIcons 
            name="weather-sunny" 
            size={28} 
            color="#FFD700" 
          />
        ) : (
          <MaterialCommunityIcons 
            name="moon-waning-crescent" 
            size={28} 
            color="#A5B4FC" 
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ThemeToggle;