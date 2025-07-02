import React, { ReactNode } from 'react';
import { ViewProps, StyleSheet } from 'react-native';
import { ThemedView } from './ThemedView';
interface CustomViewProps extends ViewProps {
  children?: ReactNode;
}

const Container: React.FC<CustomViewProps> = ({ children, style, ...props }) => (
  <ThemedView style={[styles.container, style]} {...props}>
    {children}
  </ThemedView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  }
});

export default Container;