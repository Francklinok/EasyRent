import React from 'react';
import {Platform } from 'react-native';
import { ThemedView } from './ThemedView';
import { useTheme } from '../contexts/theme/themehook';

export default function TabBarBackground() {
  // const {theme} = useTheme()
  return (
    <ThemedView
      style={{
        flex: 1,
        // backgroundColor: Platform.OS === 'ios' ? theme.surface : 'transparent',
      }}
    />
  );
}
