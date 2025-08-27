import React from 'react'
import { View, ScrollView } from 'react-native'
import { ThemedView } from '@/components/ui/ThemedView'
import ProfileComponent from '@/components/profile/ProfileComponent'

const Profile = () => {
  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 ">
        <View className="mb-6">
          <ProfileComponent />
        </View>
      </ScrollView>
    </ThemedView>
  )
}

export default Profile