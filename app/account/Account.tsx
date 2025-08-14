import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, SafeAreaView, Image, Modal, Switch, Alert, Animated } from 'react-native';
import { 
  User, Mail, Phone, Lock, Shield, Trash2, LogOut, 
  ChevronRight, Camera, Zap, X, ChevronDown, Bell, 
  Eye, EyeOff, HelpCircle, FileText, MessageCircle,
  Settings, Globe, Database, Download, Share2, Edit3,
  CreditCard, Star, Activity, Bookmark, Heart
} from 'lucide-react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { BackButton } from '@/components/ui/BackButton';
import { useTheme } from '@/components/contexts/theme/themehook';
const AccountPanel = ({ onClose }) => {
  const { theme } = useTheme();
  
  // Safe context usage with fallbacks
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 8900',
    profilePhoto: null
  });
  
  const updateUser = async (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };
  
  const logout = async () => {
    console.log('Logout functionality');
  };
  
  const [activeSection, setActiveSection] = useState('main');
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    soundEnabled: true,
    vibrationEnabled: true,
    messageNotifications: true,
    friendRequestNotifications: true,
    systemNotifications: true
  });
  
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showOnlineStatus: true,
    showLastSeen: true,
    allowDirectMessages: true,
    allowFriendRequests: true,
    dataCollection: true,
    analyticsEnabled: true
  });

  const [stats] = useState({
    totalBookings: 24,
    favoriteProperties: 12,
    reviewsGiven: 18,
    accountAge: '2 years'
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleEdit = (field, value) => {
    setEditing(field);
    setEditValue(value);
  };
  
  const saveEdit = async () => {
    if (editing && editValue.trim()) {
      try {
        await updateUser({ [editing]: editValue });
        setEditing(null);
        Alert.alert('Success', 'Profile updated successfully');
      } catch (error) {
        Alert.alert('Error', 'Failed to update profile');
      }
    }
  };
  
  const cancelEdit = () => {
    setEditing(null);
    setEditValue('');
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await logout();
      setShowLogoutModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => console.log('Account deleted') }
      ]
    );
    setShowDeleteModal(false);
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const togglePrivacy = (key) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };





  const SettingItem = ({ title, subtitle, value, onToggle, icon, showSwitch = true }) => (
    <ThemedView variant="surfaceVariant" className="p-4 mb-2 rounded-xl">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="mr-3">
            {icon}
          </View>
          <View className="flex-1">
            <ThemedText className="font-medium">{title}</ThemedText>
            {subtitle && (
              <ThemedText className="text-xs mt-1 opacity-60">{subtitle}</ThemedText>
            )}
          </View>
        </View>
        {showSwitch && (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: theme.accent, true: theme.primary }}
            thumbColor={value ? theme.surface : theme.background}
          />
        )}
      </View>
    </ThemedView>
  );

  const ActionButton = ({ title, subtitle, onPress, icon, danger = false }) => (
    <TouchableOpacity 
      onPress={onPress}
      className={`p-4 mb-2 rounded-xl ${danger ? 'bg-red-50 dark:bg-red-900/20' : ''}`}
    >
      <ThemedView variant={danger ? "surface" : "surfaceVariant"} className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="mr-3">
            {icon}
          </View>
          <View className="flex-1">
            <ThemedText className={`font-medium ${danger ? 'text-red-600 dark:text-red-400' : ''}`}>
              {title}
            </ThemedText>
            {subtitle && (
              <ThemedText className={`text-xs mt-1 ${danger ? 'text-red-500 dark:text-red-300' : 'opacity-60'}`}>
                {subtitle}
              </ThemedText>
            )}
          </View>
        </View>
        <ChevronRight size={20} color={danger ? '#ef4444' : theme.primary} />
      </ThemedView>
    </TouchableOpacity>
  );

  const renderNavigationTabs = () => (
    <ThemedView className="border-t border-gray-200 dark:border-gray-700">
      <View className="flex-row">
        {[
          { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
          { id: 'privacy', label: 'Privacy', icon: <Eye size={18} /> },
          { id: 'security', label: 'Security', icon: <Shield size={18} /> },
          { id: 'help', label: 'Help', icon: <HelpCircle size={18} /> }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveSection(tab.id)}
            className={`flex-1 px-2 py-3 items-center ${
              activeSection === tab.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
          >
            <View className={`mb-1 ${
              activeSection === tab.id ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {React.cloneElement(tab.icon, { 
                color: activeSection === tab.id ? theme.primary : theme.text + '80'
              })}
            </View>
            <ThemedText className={`text-xs ${
              activeSection === tab.id ? 'text-blue-600 font-medium' : 'opacity-60'
            }`}>
              {tab.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </ThemedView>
  );

  const MainMenu = () => (
    <View>
      <View className="flex-row items-center mb-6">
        <BackButton />
        <ThemedText type="title" className="ml-4">Account Settings</ThemedText>
      </View>

      <ThemedText className="mb-6 opacity-70">
        Manage your account preferences and settings
      </ThemedText>

      <ActionButton
        title="Notifications"
        subtitle="Manage your notification preferences"
        onPress={() => setActiveSection('notifications')}
        icon={<Bell size={20} color={theme.primary} />}
      />
      
      <ActionButton
        title="Privacy"
        subtitle="Control who can see your information"
        onPress={() => setActiveSection('privacy')}
        icon={<Eye size={20} color={theme.primary} />}
      />
      
      <ActionButton
        title="Security"
        subtitle="Protect your account with security measures"
        onPress={() => setActiveSection('security')}
        icon={<Shield size={20} color={theme.primary} />}
      />
      
      <ActionButton
        title="Help & Support"
        subtitle="Get help and contact our support team"
        onPress={() => setActiveSection('help')}
        icon={<HelpCircle size={20} color={theme.primary} />}
      />
    </View>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'main':
        return <MainMenu />;


      case 'notifications':
        return (
          <View>
            <View className="flex-row items-center mb-6">
              <TouchableOpacity onPress={() => setActiveSection('main')} className="p-2 -ml-2">
                <ChevronRight size={24} color={theme.primary} style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
              <ThemedText type="title" className="ml-2">Notifications</ThemedText>
            </View>
            
            <ThemedText className="mb-6 opacity-70">
              Manage your notification preferences
            </ThemedText>
            
            <ThemedText type="subtitle" className="mb-4">General Notifications</ThemedText>
            
            <SettingItem
              title="Push Notifications"
              subtitle="Receive notifications on your device"
              value={notifications.pushNotifications}
              onToggle={() => toggleNotification('pushNotifications')}
              icon={<Bell size={20} color={theme.primary} />}
            />
            
            <SettingItem
              title="Email Notifications"
              subtitle="Receive notifications via email"
              value={notifications.emailNotifications}
              onToggle={() => toggleNotification('emailNotifications')}
              icon={<Mail size={20} color={theme.primary} />}
            />
            
            <SettingItem
              title="SMS Notifications"
              subtitle="Receive notifications via SMS"
              value={notifications.smsNotifications}
              onToggle={() => toggleNotification('smsNotifications')}
              icon={<Phone size={20} color={theme.primary} />}
            />

            <ThemedText type="subtitle" className="mb-4 mt-6">Sound & Vibration</ThemedText>
            
            <SettingItem
              title="Sound"
              subtitle="Play sound for notifications"
              value={notifications.soundEnabled}
              onToggle={() => toggleNotification('soundEnabled')}
              icon={<Zap size={20} color={theme.primary} />}
            />
            
            <SettingItem
              title="Vibration"
              subtitle="Vibrate for notifications"
              value={notifications.vibrationEnabled}
              onToggle={() => toggleNotification('vibrationEnabled')}
              icon={<Settings size={20} color={theme.primary} />}
            />
          </View>
        );

      case 'privacy':
        return (
          <View>
            <View className="flex-row items-center mb-6">
              <TouchableOpacity onPress={() => setActiveSection('main')} className="p-2 -ml-2">
                <ChevronRight size={24} color={theme.primary} style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
              <ThemedText type="title" className="ml-2">Privacy</ThemedText>
            </View>
            
            <ThemedText className="mb-6 opacity-70">
              Control who can see your information
            </ThemedText>
            
            <SettingItem
              title="Show Online Status"
              subtitle="Let others see when you're online"
              value={privacy.showOnlineStatus}
              onToggle={() => togglePrivacy('showOnlineStatus')}
              icon={<Globe size={20} color={theme.primary} />}
            />
            
            <SettingItem
              title="Show Last Seen"
              subtitle="Let others see your last activity"
              value={privacy.showLastSeen}
              onToggle={() => togglePrivacy('showLastSeen')}
              icon={<Eye size={20} color={theme.primary} />}
            />
            
            <SettingItem
              title="Allow Direct Messages"
              subtitle="Let others send you private messages"
              value={privacy.allowDirectMessages}
              onToggle={() => togglePrivacy('allowDirectMessages')}
              icon={<MessageCircle size={20} color={theme.primary} />}
            />
            
            <SettingItem
              title="Data Collection"
              subtitle="Allow data collection to improve service"
              value={privacy.dataCollection}
              onToggle={() => togglePrivacy('dataCollection')}
              icon={<Database size={20} color={theme.primary} />}
            />
          </View>
        );

      case 'security':
        return (
          <View>
            <View className="flex-row items-center mb-6">
              <TouchableOpacity onPress={() => setActiveSection('main')} className="p-2 -ml-2">
                <ChevronRight size={24} color={theme.primary} style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
              <ThemedText type="title" className="ml-2">Security</ThemedText>
            </View>
            
            <ThemedText className="mb-6 opacity-70">
              Protect your account with security measures
            </ThemedText>
            
            <ActionButton
              title="Change Password"
              subtitle="Update your account password"
              onPress={() => console.log('Change password')}
              icon={<Lock size={20} color={theme.primary} />}
            />
            
            <ActionButton
              title="Two-Factor Authentication"
              subtitle="Add an extra layer of security"
              onPress={() => console.log('2FA')}
              icon={<Shield size={20} color={theme.primary} />}
            />
            
            <ActionButton
              title="Active Sessions"
              subtitle="Manage your active sessions"
              onPress={() => console.log('Sessions')}
              icon={<Globe size={20} color={theme.primary} />}
            />

            <ThemedText type="subtitle" className="mb-4 mt-6 text-red-600">Danger Zone</ThemedText>
            
            <ActionButton
              title="Logout from All Devices"
              subtitle="End all active sessions"
              onPress={handleLogout}
              icon={<LogOut size={20} color="#ef4444" />}
              danger
            />
            
            <ActionButton
              title="Delete Account"
              subtitle="Permanently delete your account and data"
              onPress={handleDeleteAccount}
              icon={<Trash2 size={20} color="#ef4444" />}
              danger
            />
          </View>
        );

      case 'help':
        return (
          <View>
            <View className="flex-row items-center mb-6">
              <TouchableOpacity onPress={() => setActiveSection('main')} className="p-2 -ml-2">
                <ChevronRight size={24} color={theme.primary} style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
              <ThemedText type="title" className="ml-2">Help & Support</ThemedText>
            </View>
            
            <ActionButton
              title="FAQ"
              subtitle="Frequently asked questions"
              onPress={() => console.log('FAQ')}
              icon={<HelpCircle size={20} color={theme.primary} />}
            />
            
            <ActionButton
              title="Contact Support"
              subtitle="Get help from our team"
              onPress={() => console.log('Support')}
              icon={<MessageCircle size={20} color={theme.primary} />}
            />
            
            <ActionButton
              title="Privacy Policy"
              subtitle="Read our privacy policy"
              onPress={() => console.log('Privacy')}
              icon={<Shield size={20} color={theme.primary} />}
            />
            
            <ActionButton
              title="Terms of Service"
              subtitle="Read our terms of service"
              onPress={() => console.log('Terms')}
              icon={<FileText size={20} color={theme.primary} />}
            />
            
            <ActionButton
              title="Share App"
              subtitle="Invite friends to join"
              onPress={() => console.log('Share')}
              icon={<Share2 size={20} color={theme.primary} />}
            />

            <ThemedView variant="surfaceVariant" className="p-4 mt-6 rounded-xl items-center">
              <ThemedText className="font-medium">Version 2.1.0</ThemedText>
              <ThemedText className="text-xs opacity-60 mt-1">
                Last updated: July 15, 2025
              </ThemedText>
            </ThemedView>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView 
          showsVerticalScrollIndicator={false}
          className="flex-1 px-4 pt-4"
        >
          {renderContent()}
          <View className="h-20" />
        </ScrollView>



        {/* Logout Confirmation Modal */}
        <Modal
          visible={showLogoutModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLogoutModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <ThemedView className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm">
              <ThemedText type="subtitle" className="mb-4 text-center">
                Logout Confirmation
              </ThemedText>
              <ThemedText className="text-center mb-6 opacity-70">
                Are you sure you want to logout from all devices?
              </ThemedText>
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => setShowLogoutModal(false)}
                  className="flex-1 p-3 rounded-xl bg-gray-200 dark:bg-gray-700"
                >
                  <ThemedText className="text-center font-medium">Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmLogout}
                  className="flex-1 p-3 rounded-xl bg-red-500"
                >
                  <Text className="text-center font-medium text-white">Logout</Text>
                </TouchableOpacity>
              </View>
            </ThemedView>
          </View>
        </Modal>

        {/* Delete Account Confirmation Modal */}
        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <ThemedView className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm">
              <ThemedText type="subtitle" className="mb-4 text-center text-red-600">
                Delete Account
              </ThemedText>
              <ThemedText className="text-center mb-6 opacity-70">
                This action cannot be undone. All your data will be permanently deleted.
              </ThemedText>
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => setShowDeleteModal(false)}
                  className="flex-1 p-3 rounded-xl bg-gray-200 dark:bg-gray-700"
                >
                  <ThemedText className="text-center font-medium">Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmDeleteAccount}
                  className="flex-1 p-3 rounded-xl bg-red-500"
                >
                  <Text className="text-center font-medium text-white">Delete</Text>
                </TouchableOpacity>
              </View>
            </ThemedView>
          </View>
        </Modal>
      </ThemedView>
    </SafeAreaView>
  );
};

export default AccountPanel;