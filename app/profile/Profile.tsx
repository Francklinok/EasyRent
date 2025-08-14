import React, { useState } from 'react'
import { View, ScrollView, TouchableOpacity, Image, TextInput, Animated } from 'react-native'
import { User, Mail, Phone, Camera, Settings, Eye, Activity, Heart, CreditCard, Edit3 } from 'lucide-react-native'
import { ThemedView } from '@/components/ui/ThemedView'
import { ThemedText } from '@/components/ui/ThemedText'
import { BackButton } from '@/components/ui/BackButton'
import { useTheme } from '@/components/contexts/theme/themehook'
import EnhancedProfileComponent from '@/components/profile/EnhancedProfileComponent'

const Profile = () => {
  const { theme } = useTheme()
  const [editing, setEditing] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 8900',
    profilePhoto: null
  })
  const [stats] = useState({
    totalBookings: 24,
    favoriteProperties: 12,
    reviewsGiven: 18
  })

  const handleEdit = (field, value) => {
    setEditing(field)
    setEditValue(value)
  }
  
  const saveEdit = () => {
    if (editing && editValue.trim()) {
      setUser(prev => ({ ...prev, [editing]: editValue }))
      setEditing(null)
    }
  }
  
  const cancelEdit = () => {
    setEditing(null)
    setEditValue('')
  }

  const ProfileHeader = () => (
    <ThemedView className="items-center py-6 mb-6">
      <View className="relative mb-4">
        <Image
          source={{ uri: user?.profilePhoto || 'https://via.placeholder.com/120' }}
          className="w-24 h-24 rounded-full"
        />
        <TouchableOpacity 
          className="absolute -bottom-2 -right-2 bg-blue-500 p-2 rounded-full"
          onPress={() => console.log('Change photo')}
        >
          <Camera size={16} color="white" />
        </TouchableOpacity>
      </View>
      
      <ThemedText type="title" className="mb-1">
        {user?.name || 'User Name'}
      </ThemedText>
      
      <ThemedText className="text-center mb-4 opacity-70">
        {user?.email || 'user@example.com'}
      </ThemedText>

      <View className="flex-row space-x-6">
        <View className="items-center">
          <ThemedText type="subtitle">{stats.totalBookings}</ThemedText>
          <ThemedText className="text-xs opacity-60">Bookings</ThemedText>
        </View>
        <View className="items-center">
          <ThemedText type="subtitle">{stats.favoriteProperties}</ThemedText>
          <ThemedText className="text-xs opacity-60">Favorites</ThemedText>
        </View>
        <View className="items-center">
          <ThemedText type="subtitle">{stats.reviewsGiven}</ThemedText>
          <ThemedText className="text-xs opacity-60">Reviews</ThemedText>
        </View>
      </View>
    </ThemedView>
  )

  const ProfileSection = ({ field, title, value, icon, editable = true }) => (
    <ThemedView variant="surfaceVariant" className="p-4 mb-3 rounded-xl">
      {editing === field ? (
        <View>
          <ThemedText className="text-sm mb-2 opacity-70">{title}</ThemedText>
          <TextInput 
            value={editValue} 
            onChangeText={setEditValue}
            className={`p-3 rounded-lg mb-3 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
            autoFocus
          />
          <View className="flex-row justify-end space-x-2">
            <TouchableOpacity 
              onPress={cancelEdit}
              className="px-4 py-2 rounded-lg bg-gray-500"
            >
              <ThemedText className="text-white text-sm">Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={saveEdit}
              className="px-4 py-2 rounded-lg bg-blue-500"
            >
              <ThemedText className="text-white text-sm">Save</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="mr-3">
              {icon}
            </View>
            <View className="flex-1">
              <ThemedText className="text-sm opacity-70 mb-1">{title}</ThemedText>
              <ThemedText className="font-medium">{value}</ThemedText>
            </View>
          </View>
          {editable && (
            <TouchableOpacity 
              className="p-2 rounded-full"
              onPress={() => handleEdit(field, value)}
            >
              <Edit3 size={18} color={theme.primary} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </ThemedView>
  )

  const ActionButton = ({ title, subtitle, onPress, icon }) => (
    <TouchableOpacity onPress={onPress} className="p-4 mb-2 rounded-xl">
      <ThemedView variant="surfaceVariant" className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="mr-3">
            {icon}
          </View>
          <View className="flex-1">
            <ThemedText className="font-medium">{title}</ThemedText>
            <ThemedText className="text-xs mt-1 opacity-60">{subtitle}</ThemedText>
          </View>
        </View>
      </ThemedView>
    </TouchableOpacity>
  )

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 pt-4">
        <View className="flex-row items-center mb-6">
          <BackButton />
          <ThemedText type="title" className="ml-4">Profile</ThemedText>
        </View>

        <ProfileHeader />

        <ThemedText type="subtitle" className="mb-4">Personal Information</ThemedText>
        
        <ProfileSection
          field="name"
          title="Full Name"
          value={user?.name || 'John Doe'}
          icon={<User size={20} color={theme.primary} />}
        />
        
        <ProfileSection
          field="email"
          title="Email Address"
          value={user?.email || 'john@example.com'}
          icon={<Mail size={20} color={theme.primary} />}
        />
        
        <ProfileSection
          field="phone"
          title="Phone Number"
          value={user?.phone || '+1 234 567 8900'}
          icon={<Phone size={20} color={theme.primary} />}
        />

        <ThemedText type="subtitle" className="mb-4 mt-6">Theme Settings</ThemedText>
        
        <ActionButton
          title="Dark Mode"
          subtitle="Switch between light and dark themes"
          onPress={() => console.log('Toggle theme')}
          icon={<Settings size={20} color={theme.primary} />}
        />
        
        <ActionButton
          title="Theme Preferences"
          subtitle="Customize your app appearance"
          onPress={() => console.log('Theme settings')}
          icon={<Eye size={20} color={theme.primary} />}
        />

        <ThemedText type="subtitle" className="mb-4 mt-6">Quick Actions</ThemedText>
        
        <ActionButton
          title="My Bookings"
          subtitle="View and manage your reservations"
          onPress={() => console.log('Bookings')}
          icon={<Activity size={20} color={theme.primary} />}
        />
        
        <ActionButton
          title="Favorite Properties"
          subtitle="Properties you've saved"
          onPress={() => console.log('Favorites')}
          icon={<Heart size={20} color={theme.primary} />}
        />
        
        <ActionButton
          title="Payment Methods"
          subtitle="Manage cards and payment options"
          onPress={() => console.log('Payment')}
          icon={<CreditCard size={20} color={theme.primary} />}
        />

        <View className="mb-6">
          <EnhancedProfileComponent />
        </View>
      </ScrollView>
    </ThemedView>
  )
}

export default Profile