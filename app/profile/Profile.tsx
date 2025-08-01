import React from 'react'
import { ThemedView } from '@/components/ui/ThemedView'
import EnhancedProfileComponent from '@/components/profile/EnhancedProfileComponent'

const Profile = () => {
  return (
    <ThemedView style={{ flex: 1 }}>
      <EnhancedProfileComponent />
    </ThemedView>
  )
}

export default Profile