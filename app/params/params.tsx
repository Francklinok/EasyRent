import { View, Text } from 'react-native'
import React from 'react'
import { ThemedView } from '@/components/ui/ThemedView'
import { ThemedText } from '@/components/ui/ThemedText'


const params = () => {
  return (
    <ThemedView>
      <ThemedView>
        <ThemedText>Profile</ThemedText>
      </ThemedView>
      <ThemedView>
        <ThemedText>Parametre</ThemedText>
      </ThemedView>
      <ThemedView>
        <ThemedText>Mon compte</ThemedText>
      </ThemedView>
    </ThemedView>
  )
}

export default params