import React, { ReactNode } from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';

interface CustomViewProps extends ViewProps {
  children?: ReactNode;
}

export const Container: React.FC<CustomViewProps> = ({ children, style, ...props }) => (
  <View style={[styles.container, style]} {...props}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: '#f9fafb'
  }
});
