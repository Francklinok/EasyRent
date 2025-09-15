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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { useUser } from '@/components/contexts/user/UserContext';


const AccountPanel = ({ onClose }) => {
  const { theme } = useTheme();
  const  insets = useSafeAreaInsets()
  const  {logout,  setupTwoFactor,disableTwoFactor} = useAuth()
  const {deleteAccount} = useUser();

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

  // const handleEdit = (field, value) => {
  //   setEditing(field);
  //   setEditValue(value);
  // };
  
  // const saveEdit = async () => {
  //   if (editing && editValue.trim()) {
  //     try {
  //       await updateUser({ [editing]: editValue });
  //       setEditing(null);
  //       Alert.alert('Success', 'Profile updated successfully');
  //     } catch (error) {
  //       Alert.alert('Error', 'Failed to update profile');
  //     }
  //   };
  // }
  
  // const cancelEdit = () => {
  //   setEditing(null);
  //   setEditValue('');
  // };

  // const handleLogout = () => {
  //   setShowLogoutModal(true);
  // };

  // const confirmLogout = async () => {
  //   try {
  //     await logout();
  //     setShowLogoutModal(false);
  //   } catch (error) {
  //     Alert.alert('Error', 'Failed to logout');
  //   }
  // };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

 const confirmDeleteAccount = () => {
  Alert.alert(
    'Delete Account',
    'This action cannot be undone. All your data will be permanently deleted.',
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => { // 👈 rendre async ici
          try {
            const success = await deleteAccount();
            if (success) {
              console.log('Account deleted');
            } else {
              console.log('Account has not been deleted');
            }
          } catch (error) {
            console.error('Error deleting account:', error);
          }
        } 
      }
    ]
  );
  setShowDeleteModal(false);
};


  const toggleNotification = (key:any) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  
  const togglePrivacy = (key:any) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const  handleTwoFactorConfiguration = () =>{
   Alert.alert(
    "Two Factor  Authentification",  "Do you  want to   activate  two  factor  authentificate?",
    [
      {
        text:"Disable",
        // style:"Cancel",
        onPress:async () =>{
          try{
            const result = await disableTwoFactor('')
            if(result.success){
              Alert.alert(("two   factor  authentification disable"))
            }
          }catch (error) {
            console.error("Error disabling two-factor:", error);
            Alert.alert("Error", "An error occurred while disabling.");
          }
        }
      },
      {
        text:"Enable",
        onPress: async () =>{
          try{
            const result = await setupTwoFactor()
            if(result  && result.qrCode){
              Alert.alert(( "two factor  authentification enable"))
            }
          }catch (error) {
            console.error("Error enabling two-factor:", error);
            Alert.alert("Error", "An error occurred while enabling.");
          }
        }
      }
    ]
   )
  }

  const SettingItem = ({ title, subtitle, value, onToggle, icon, showSwitch = true }) => (
    <ThemedView variant="surfaceVariant" className="p-4 mb-2 rounded-xl">
      <ThemedView  variant="surfaceVariant" className="flex-row items-center justify-between">
        <ThemedView  variant="surfaceVariant" className="flex-row items-center flex-1">
          <ThemedView variant="surfaceVariant" className="pr-4">
            {icon}
          </ThemedView>
          <ThemedView  variant="surfaceVariant" className="flex-1">
            <ThemedText className="font-medium">{title}</ThemedText>
            {subtitle && (
              <ThemedText className="text-xs mt-1 opacity-60">{subtitle}</ThemedText>
            )}
          </ThemedView>
        </ThemedView>
        {showSwitch && (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: theme.outline, true: theme.primary }}
            thumbColor={value ? theme.surface : theme.background}
          />
        )}
      </ThemedView>
    </ThemedView>
  );

  const ActionButton = ({ title, subtitle, onPress, icon, danger = false }) => (
    <TouchableOpacity 
      onPress={onPress}
      className={`p-4 mb-2 rounded-xl `}
    >
      <ThemedView className="flex-row items-center justify-between">
        <ThemedView className="flex-row items-center flex-1">
          <ThemedView className="mr-4">
            {icon}
          </ThemedView>
          <ThemedView className="flex-1">
            <ThemedText type = "body">
              {title}
            </ThemedText>
            {subtitle && (
              <ThemedText className='mt-1'>
                {subtitle}
              </ThemedText>
            )}
          </ThemedView>
        </ThemedView>
        <ChevronRight size={20} color={theme.primary} />
      </ThemedView>
    </TouchableOpacity>
  );

  const MainMenu = () => (
    <ThemedView className = "px-2 pt-4">
      <ThemedView className="flex-row items-center mb-6">
        <BackButton />
        <ThemedText type="subtitle" className="ml-4">Account Settings</ThemedText>
      </ThemedView>

      <ThemedText className="mb-4 opacity-70">
        Manage your account preferences and settings
      </ThemedText>

      <ActionButton
        title="Notifications"
        subtitle="Manage your notification preferences"
        onPress={() => setActiveSection('notifications')}
        icon={<Bell size={20} color={theme.star} />}
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
        icon={<Shield size={20} color={theme.error} />}
      />
      
      <ActionButton
        title="Help & Support"
        subtitle="Get help and contact our support team"
        onPress={() => setActiveSection('help')}
        icon={<HelpCircle size={20} color={theme.success} />}
      />
    </ThemedView>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'main':
        return <MainMenu />;


      case 'notifications':
        return (
          <ThemedView className='px-2'>
            <ThemedView className="flex-row items-center mb-4">
              <TouchableOpacity onPress={() => setActiveSection('main')} className="p-2 -ml-2">
              <TouchableOpacity onPress={() => setActiveSection('main')} className="p-2 -ml-2">
                <ChevronRight size={24} color={theme.primary} style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>              </TouchableOpacity>
              <ThemedText type="subtitle" className="ml-2">Notifications</ThemedText>
            </ThemedView>
            
            <ThemedText className="mb-3 opacity-70">
              Manage your notification preferences
            </ThemedText>
            
            <ThemedText type="body" className="mb-4">General Notifications</ThemedText>
            
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

            <ThemedText type="body" className="mb-3 mt-2">Sound & Vibration</ThemedText>
            
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
          </ThemedView>
        );

      case 'privacy':
        return (
          <ThemedView className='px-2'>
            <ThemedView className="flex-row items-center mb-4">
              <TouchableOpacity onPress={() => setActiveSection('main')} className="p-2 -ml-2">
                <ChevronRight size={24} color={theme.primary} style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
              <ThemedText type="subtitle" className="ml-2">Privacy</ThemedText>
            </ThemedView>
            
            <ThemedText className="mb-3 opacity-70">
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
          </ThemedView>
        );

      case 'security':
        return (
          <ThemedView className='px-2'>
            <ThemedView className="flex-row items-center mb-1">
              <TouchableOpacity onPress={() => setActiveSection('main')} className="p-2 -ml-2">
                <ChevronRight size={24} color={theme.primary} style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
              <ThemedText type="subtitle" className="ml-2">Security</ThemedText>
            </ThemedView>
            
            <ThemedText className="mb-3 opacity-70">
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
              onPress={() => handleTwoFactorConfiguration()}
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
              title="Delete Account"
              subtitle="Permanently delete your account and data"
              onPress={handleDeleteAccount}
              icon={<Trash2 size={20} color="#ef4444" />}
              danger
            />
          </ThemedView>
        );

      case 'help':
        return (
          <ThemedView className='px-2'>
            <ThemedView className="flex-row items-center mb-4">
              <TouchableOpacity onPress={() => setActiveSection('main')} className="p-2 -ml-2">
                <ChevronRight size={24} color={theme.primary} style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
              <ThemedText type="subtitle" className="ml-2">Help & Support</ThemedText>
            </ThemedView>
            
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
          </ThemedView>
        );

      default:
        return null;
    }
  };

  return (
    <ThemedView style = {{paddingTop: insets.top + 4}}>
      <ThemedView className = "h-full">
        <ScrollView 
          showsVerticalScrollIndicator={false}
          className="flex-1 px-4 pt-4"
        >
          {renderContent()}
          <ThemedView className="h-20" />
        </ScrollView>

        {/* Delete Account Confirmation Modal */}
        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}>
          <ThemedView className="flex-1 bg-black/50 justify-center items-center px-6">
            <ThemedView className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm">
              <ThemedText type="subtitle" className="mb-4 text-center text-red-600">
                Delete Account
              </ThemedText>
              <ThemedText className="text-center mb-6 opacity-70">
                This action cannot be undone. All your data will be permanently deleted.
              </ThemedText>
              <ThemedView className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => setShowDeleteModal(false)}
                  className="flex-1 p-3 rounded-xl bg-gray-200 dark:bg-gray-700">
                  <ThemedText className="text-center font-medium">Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmDeleteAccount}
                  className="flex-1 p-3 rounded-xl bg-red-500">
                  <Text className="text-center font-medium text-white">Delete</Text>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </Modal>
      </ThemedView>
    </ThemedView>
  );
};

export default AccountPanel;