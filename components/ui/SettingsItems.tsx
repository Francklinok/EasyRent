import React from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ThemedText } from './ThemedText'

interface SettingsItemProps {
  icon: string
  label: string
  onPress: () => void
}

export const SettingsItem: React.FC<SettingsItemProps> = ({ icon, label, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Ionicons name={icon} size={24} style={styles.icon} />
      <ThemedText style={styles.label}>{label}</ThemedText>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 16,
  },
})
