import React from 'react';
import { ScrollView } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import ProfileComponent from '@/components/profile/ProfileComponent';
const Profile = () => {

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <ProfileComponent />
        </ScrollView>
      </ThemedView>
    </ThemedView>
  );
};

export default Profile;