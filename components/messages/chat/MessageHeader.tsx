import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { MotiView, AnimatePresence } from 'moti';
import { RootStackParamList } from '@/components/navigator/RouteType';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/hooks/themehook';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { usePrivacy } from '@/components/contexts/privacy/PrivacyContext';
import { StatusBar } from 'react-native';
export default function ChatHeader() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const { theme, isDark } = useTheme();
  const { canShowOnlineStatus } = usePrivacy();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { name, image, status = 'Online', chatId } = route.params;

  const [showMenu, setShowMenu] = useState(false);
  const [isOnline] = useState(true);
  const [currentStatus] = useState(status);

  const getStatusColor = () => {
    if (!canShowOnlineStatus()) return '#6B7280';
    return isOnline ? '#22C55E' : '#6B7280';
  };

  const handleOpenContactInfo = () => {
    router.push({
      pathname: '/contactinfo',
      params: {
        name,
        image,
        status: currentStatus,
        chatId,
      },
    });
  };

  const handleAudioCall = () => {
    Alert.alert(
      'Audio call',
      `Call ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            Alert.alert('Calling...', `Audio call to ${name}`);
          }
        }
      ]
    );
  };

  const handleMenuAction = (action: string) => {
    setShowMenu(false);

    switch (action) {
      case 'view_contact':
        handleOpenContactInfo();
        break;
      case 'media':
        Alert.alert('Media', 'View shared media, links and documents');
        break;
      case 'search':
        Alert.alert('Search', 'Search in conversation');
        break;
      case 'mute':
        Alert.alert(
          'Notifications',
          'Disable notifications for this conversation?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Disable', onPress: () => Alert.alert('Notifications disabled') }
          ]
        );
        break;
      case 'wallpaper':
        Alert.alert('Wallpaper', 'Change chat wallpaper');
        break;
      case 'export':
        Alert.alert(
          'Export chat',
          'Choose export format',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'PDF', onPress: () => Alert.alert('Exporting to PDF...') },
            { text: 'TXT', onPress: () => Alert.alert('Exporting to TXT...') }
          ]
        );
        break;
      case 'clear':
        Alert.alert(
          'Clear conversation',
          'This will delete all messages. Continue?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Clear',
              style: 'destructive',
              onPress: () => Alert.alert('Conversation cleared')
            }
          ]
        );
        break;
      case 'block':
        Alert.alert(
          'Block contact',
          `Block ${name}? You will no longer receive messages from this contact.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Block',
              style: 'destructive',
              onPress: () => {
                Alert.alert('Contact blocked');
                navigation.goBack();
              }
            }
          ]
        );
        break;
      case 'report':
        Alert.alert(
          'Report',
          'Report this contact for inappropriate content?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Report', style: 'destructive', onPress: () => Alert.alert('Contact reported') }
          ]
        );
        break;
      default:
        break;
    }
  };

  const menuItems = [
    { id: 'view_contact', icon: 'person-outline', label: 'View contact', color: theme.onSurface },
    { id: 'media', icon: 'images-outline', label: 'Media, links, docs', color: theme.onSurface },
    { id: 'search', icon: 'search-outline', label: 'Search', color: theme.onSurface },
    { id: 'mute', icon: 'notifications-off-outline', label: 'Mute', color: theme.onSurface },
    { id: 'wallpaper', icon: 'color-palette-outline', label: 'Wallpaper', color: theme.onSurface },
    { id: 'export', icon: 'download-outline', label: 'Export chat', color: theme.onSurface },
    { id: 'clear', icon: 'trash-outline', label: 'Clear conversation', color: theme.error },
    { id: 'block', icon: 'ban-outline', label: 'Block', color: theme.error },
    { id: 'report', icon: 'flag-outline', label: 'Report', color: theme.error },
  ];

  return (
    <ThemedView style={{
      paddingTop: insets.top,
      borderBottomWidth: 1,
      borderBottomColor: theme.outline + '80',
    }}>
      <StatusBar 
          barStyle={isDark ? 'light-content' : 'dark-content'} 
                  />
      <ThemedView
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          minHeight: 60,
        }}
      >
        {/* Back button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginRight: 12 }}
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color= {theme.text}
          />
        </TouchableOpacity>

        {/* User section */}
        <TouchableOpacity
          // onPress={handleOpenContactInfo}
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
          accessibilityLabel={`View ${name}'s info`}
        >
          {/* Avatar */}
          <ThemedView style={{ position: 'relative', marginRight: 12, borderWidth:1, borderColor: theme.outline, borderRadius: 24 }}>
            <Image
              source={{ uri: image || `https://i.pravatar.cc/150?u=${name}` }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
              }}
              resizeMode="cover"
            />
          </ThemedView>

          {/* User info */}
          <ThemedView style={{ flex: 1 }}>
            <ThemedText type ="normaltitle" intensity = "light"
              style={{
                fontWeight: '800',
                color:  theme.text,
                marginBottom: 2,
              }}
            >
              {name}
            </ThemedText>

            {canShowOnlineStatus() && (
              <ThemedText type ="body"
                style={{
                  color: getStatusColor(),
                  fontWeight: '400',
                }}
              >
                {currentStatus}
              </ThemedText>
            )}
          </ThemedView>
        </TouchableOpacity>

        {/* Actions */}
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Audio call */}
          <TouchableOpacity
            onPress={handleAudioCall}
            style={{ padding: 8 }}
            accessibilityLabel="Audio call"
          >
            <Ionicons
              name="call-outline"
              size={24}
              color= {theme.text}
            />
          </TouchableOpacity>

          {/* Menu */}
          <TouchableOpacity
            onPress={() => setShowMenu(!showMenu)}
            style={{ padding: 8 }}
            accessibilityLabel="More options"
          >
            <Feather
              name="more-vertical"
              size={22}
              color={theme.text}
            />
          </TouchableOpacity>
        </ThemedView>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {showMenu && (
            <MotiView
              from={{ opacity: 0, scale: 0.8, translateY: -10 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, translateY: -10 }}
              transition={{ type: 'timing', duration: 200 }}
              style={{
                position: 'absolute',
                top: 60,
                right: 16,
                zIndex: 1000,
                backgroundColor: theme.surface,
                borderRadius: 12,
                shadowColor: '#000',
                shadowOpacity: 0.15,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 8,
                elevation: 8,
                minWidth: 220,
                maxHeight: 400,
              }}
            >
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleMenuAction(item.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomWidth: index < menuItems.length - 1 ? 0.5 : 0,
                    borderBottomColor: theme.text,
                  }}
                >
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={18}
                    color={item.color}
                    style={{ marginRight: 12 }}
                  />
                  <ThemedText type ="normal"
                    style={{flex: 1, color: item.color }}
                  >
                    {item.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </MotiView>
          )}
        </AnimatePresence>
      </ThemedView>

      {/* Overlay to close menu */}
      {showMenu && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onPress={() => setShowMenu(false)}
          activeOpacity={1}
        />
      )}
    </ThemedView>
  );
}
