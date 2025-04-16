import React from 'react'
import { ThemedView } from '@/components/ui/ThemedView'
import { ThemedText } from '@/components/ui/ThemedText'
import { useNavigation, useRoute } from '@react-navigation/native'
import { SettingsItem } from '@/components/ui/SettingsItems'
import { router } from 'expo-router'

const ParamsScreen = () => {
  const navigation = useNavigation()
  

  return (
    <ThemedView className = 'flex' style={{ padding: 30 }}>
      <ThemedText type="title" style={{ marginBottom: 20 }}>Paramètres</ThemedText>

      <SettingsItem
        icon="person-circle-outline"
        label="Profil"
        onPress={() => router.navigate('/profile/Profile')}
      />

      <SettingsItem
        icon="settings-outline"
        label="Paramètres Généraux"
        onPress={() => navigation.navigate('GeneralSettings')}
      />

      <SettingsItem
        icon="lock-closed-outline"
        label="Mon Compte"
        onPress={() => navigation.navigate('AccountSettings')}
      />
    </ThemedView>
  )
}

export default ParamsScreen
