import { View, Text } from 'react-native'
import React from 'react'
import { ThemedView } from '@/components/ui/ThemedView'
import ProfileFile from '@/components/profile/ProfileComponent'
const Profile = () => {
  return (
    <ThemedView>
        <ProfileFile/>
        
    </ThemedView>
  )
}

export default Profile