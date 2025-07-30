import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, Animated, Alert, Linking } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';
import { RootStackParamList } from '@/components/navigator/RouteType';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/components/contexts/theme/themehook';
import { useRouter } from 'expo-router';

export default function ChatHeader() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { name, image, status = 'En ligne', chatId } = route.params;

  const [showMenu, setShowMenu] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSeen, setLastSeen] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);

  // Simulate real-time status updates
  useEffect(() => {
    const statusInterval = setInterval(() => {
      const now = new Date();
      const randomStatus = Math.random();
      
      if (randomStatus > 0.8) {
        setIsTyping(true);
        setCurrentStatus('En train d\'écrire...');
        setTimeout(() => {
          setIsTyping(false);
          setCurrentStatus('En ligne');
        }, 3000);
      } else if (randomStatus > 0.6) {
        setIsOnline(true);
        setCurrentStatus('En ligne');
      } else {
        setIsOnline(false);
        setLastSeen(`Vu ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);
        setCurrentStatus(lastSeen);
      }
    }, 15000);

    return () => clearInterval(statusInterval);
  }, []);

  const getStatusColor = () => {
    if (isTyping) return '#22C55E';
    if (isOnline) return '#10B981';
    return '#6B7280';
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
      'Appel audio',
      `Appeler ${name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Appeler',
          onPress: () => {
            // Simulate call initiation
            Alert.alert('Appel en cours...', `Appel audio vers ${name}`);
            // In real app: initiate actual call
            // Linking.openURL(`tel:${phoneNumber}`);
          }
        }
      ]
    );
  };

  const handleVideoCall = () => {
    Alert.alert(
      'Appel vidéo',
      `Démarrer un appel vidéo avec ${name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Appeler',
          onPress: () => {
            router.push({
              pathname: '/video-call',
              params: { name, image, chatId }
            });
          }
        }
      ]
    );
  };

  const handleMenuAction = (action) => {
    setShowMenu(false);
    
    switch (action) {
      case 'view_contact':
        handleOpenContactInfo();
        break;
      case 'media':
        router.push({
          pathname: '/chat-media',
          params: { chatId, name }
        });
        break;
      case 'search':
        router.push({
          pathname: '/chat-search',
          params: { chatId, name }
        });
        break;
      case 'mute':
        Alert.alert(
          'Notifications',
          'Désactiver les notifications pour cette conversation ?',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Désactiver', onPress: () => Alert.alert('Notifications désactivées') }
          ]
        );
        break;
      case 'wallpaper':
        router.push({
          pathname: '/chat-wallpaper',
          params: { chatId }
        });
        break;
      case 'export':
        Alert.alert(
          'Exporter le chat',
          'Choisissez le format d\'export',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'PDF', onPress: () => Alert.alert('Export PDF en cours...') },
            { text: 'TXT', onPress: () => Alert.alert('Export TXT en cours...') }
          ]
        );
        break;
      case 'clear':
        Alert.alert(
          'Vider la conversation',
          'Cette action supprimera tous les messages. Continuer ?',
          [
            { text: 'Annuler', style: 'cancel' },
            { 
              text: 'Vider', 
              style: 'destructive',
              onPress: () => Alert.alert('Conversation vidée')
            }
          ]
        );
        break;
      case 'block':
        Alert.alert(
          'Bloquer le contact',
          `Bloquer ${name} ? Vous ne recevrez plus de messages de ce contact.`,
          [
            { text: 'Annuler', style: 'cancel' },
            { 
              text: 'Bloquer', 
              style: 'destructive',
              onPress: () => {
                Alert.alert('Contact bloqué');
                navigation.goBack();
              }
            }
          ]
        );
        break;
      case 'report':
        Alert.alert(
          'Signaler',
          'Signaler ce contact pour contenu inapproprié ?',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Signaler', style: 'destructive', onPress: () => Alert.alert('Contact signalé') }
          ]
        );
        break;
      default:
        break;
    }
  };

  const menuItems = [
    { id: 'view_contact', icon: 'person-outline', label: 'Voir le contact', color: theme.onSurface },
    { id: 'media', icon: 'images-outline', label: 'Médias, liens, docs', color: theme.onSurface },
    { id: 'search', icon: 'search-outline', label: 'Rechercher', color: theme.onSurface },
    { id: 'mute', icon: 'notifications-off-outline', label: 'Couper le son', color: theme.onSurface },
    { id: 'wallpaper', icon: 'color-palette-outline', label: 'Fond d\'écran', color: theme.onSurface },
    { id: 'export', icon: 'download-outline', label: 'Exporter le chat', color: theme.onSurface },
    { id: 'clear', icon: 'trash-outline', label: 'Vider la conversation', color: theme.error },
    { id: 'block', icon: 'ban-outline', label: 'Bloquer', color: theme.error },
    { id: 'report', icon: 'flag-outline', label: 'Signaler', color: theme.error },
  ];

  return (
    <ThemedView variant='surfaceVariant' style={{ paddingTop: insets.top }}>
      <LinearGradient
        colors={theme.priceGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <ThemedView variant='surfaceVariant'
          className="flex-row items-center px-4 py-3 relative"
          style={{ minHeight: 78 }}
        >
          {/* Bouton Retour */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
            style={{
              padding: 8,
              borderRadius: 20,
            }}
            accessibilityLabel="Revenir à la liste"
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={theme.typography.body || '#374151'} 
            />
          </TouchableOpacity>

          {/* Section Utilisateur */}
          <TouchableOpacity
            onPress={handleOpenContactInfo}
            className="flex-row items-center flex-1"
            accessibilityLabel={`Voir les infos de ${name}`}
          >
            {/* Avatar with Animation */}
            <MotiView
              from={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 500 }}
              className="relative mr-3"
            >
              <Image
                source={{ uri: image || `https://i.pravatar.cc/150?u=${name}` }}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  borderWidth: 2,
                  borderColor: isOnline ? '#10B981' : theme.outline,
                }}
                resizeMode="cover"
              />
              
              {/* Animated Status Indicator */}
              <MotiView
                from={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 200 }}
                style={{
                  position: 'absolute',
                  right: -2,
                  bottom: -2,
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: getStatusColor(),
                  borderWidth: 2,
                  borderColor: '#FFFFFF',
                }}
              />

              {/* Typing Animation */}
              {isTyping && (
                <MotiView
                  from={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ 
                    type: 'timing',
                    duration: 300,
                    loop: true,
                    repeatReverse: true
                  }}
                  style={{
                    position: 'absolute',
                    right: -8,
                    bottom: -8,
                    width: 20,
                    height: 12,
                    backgroundColor: theme.primary,
                    borderRadius: 6,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <ThemedText style={{ color: 'white', fontSize: 8, fontWeight: 'bold' }}>
                    ✎
                  </ThemedText>
                </MotiView>
              )}
            </MotiView>

            {/* Informations utilisateur */}
            <View className="flex-1">
              <ThemedText 
                className="font-semibold text-lg"
                style={{ 
                  color: theme.typography.heading || '#111827',
                  marginBottom: 2,
                }}
              >
                {name}
              </ThemedText>
              
              <MotiView
                key={currentStatus}
                from={{ opacity: 0, translateY: 5 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 300 }}
              >
                <ThemedText 
                  className="text-sm"
                  style={{ 
                    color: getStatusColor(),
                    fontWeight: '500',
                  }}
                >
                  {currentStatus}
                </ThemedText>
              </MotiView>
            </View>
          </TouchableOpacity>

          {/* Actions */}
          <ThemedView variant="surfaceVariant" className="flex-row items-center ml-2">
            {/* Audio Call */}
            <TouchableOpacity
              onPress={handleAudioCall}
              style={{
                padding: 10,
                marginRight: 4,
                borderRadius: 20,
                backgroundColor: theme.primary + '15',
              }}
              accessibilityLabel="Appel audio"
            >
              <Ionicons 
                name="call" 
                size={22} 
                color={theme.primary} 
              />
            </TouchableOpacity>

            {/* Video Call */}
            <TouchableOpacity
              onPress={handleVideoCall}
              style={{
                padding: 10,
                marginRight: 4,
                borderRadius: 20,
                backgroundColor: theme.primary + '15',
              }}
              accessibilityLabel="Appel vidéo"
            >
              <Ionicons 
                name="videocam" 
                size={24} 
                color={theme.primary} 
              />
            </TouchableOpacity>

            {/* Menu */}
            <TouchableOpacity
              onPress={() => setShowMenu(!showMenu)}
              style={{
                padding: 10,
                borderRadius: 20,
                backgroundColor: showMenu ? theme.primary + '20' : 'transparent',
              }}
              accessibilityLabel="Plus d'options"
            >
              <Feather 
                name="more-vertical" 
                size={20} 
                color={showMenu ? theme.primary : theme.typography.body || '#6B7280'} 
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
                  top: 70,
                  right: 16,
                  zIndex: 1000,
                  backgroundColor: theme.surface,
                  borderRadius: 12,
                  shadowColor: theme.onSurface,
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
                      borderBottomColor: theme.outline + '30',
                    }}
                  >
                    <Ionicons 
                      name={item.icon} 
                      size={18} 
                      color={item.color} 
                      style={{ marginRight: 12 }}
                    />
                    <ThemedText 
                      className="text-sm flex-1"
                      style={{ color: item.color }}
                    >
                      {item.label}
                    </ThemedText>
                    {item.id === 'mute' && (
                      <ThemedText className="text-xs" style={{ color: theme.onSurface + '60' }}>
                        8h
                      </ThemedText>
                    )}
                  </TouchableOpacity>
                ))}
              </MotiView>
            )}
          </AnimatePresence>
        </ThemedView>
      </LinearGradient>

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