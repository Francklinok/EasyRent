import React, { useState, useRef } from 'react';
import {
  Image,
  Alert,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
  View,
  StatusBar,
  Share,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { BackButton } from '@/components/ui/BackButton';
import { useTheme } from '@/components/contexts/theme/themehook';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

type ContactData = {
  name: string;
  phone: string;
  email?: string;
  status: string;
  image: string;
  isOnline: boolean;
  lastSeen: string;
  mutedUntil?: Date;
  isBlocked: boolean;
  sharedMedia: number;
  commonGroups: number;
};

const ContactInfo = () => {
  const { name, image, status, chatId, phone } = useLocalSearchParams();
  const { theme } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // États locaux
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [contactData, setContactData] = useState<ContactData>({
    name: String(name),
    phone: String(phone || '+1234567890'),
    status: String(status),
    image: String(image),
    isOnline: Math.random() > 0.5,
    lastSeen: 'il y a 2 heures',
    sharedMedia: 126,
    commonGroups: 3,
    isBlocked: false
  });

  // Animation pour le header flottant
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 280],
    outputRange: [0, 60],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [250, 300],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Fonctions d'action
  const handleCall = async () => {
    try {
      const url = `tel:${contactData.phone}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erreur', 'Impossible d\'effectuer l\'appel');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'appel');
    }
  };

  const handleVideoCall = () => {
    Alert.alert(
      'Appel vidéo',
      `Démarrer un appel vidéo avec ${contactData.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Appeler', 
          onPress: () => {
            // Ici vous pouvez intégrer votre logique d'appel vidéo
            console.log('Appel vidéo initié avec:', contactData.name);
          }
        },
      ]
    );
  };

  const handleMessage = () => {
    router.back();
  };

  const handleMute = () => {
    Alert.alert(
      isMuted ? 'Réactiver les notifications' : 'Désactiver les notifications',
      isMuted 
        ? `Réactiver les notifications pour ${contactData.name} ?`
        : `Désactiver les notifications pour ${contactData.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: isMuted ? 'Réactiver' : 'Désactiver',
          onPress: () => {
            setIsMuted(!isMuted);
            console.log(isMuted ? 'Notifications réactivées' : 'Notifications désactivées');
          },
        },
      ]
    );
  };

  const handleBlock = () => {
    Alert.alert(
      isBlocked ? 'Débloquer ce contact' : 'Bloquer ce contact',
      isBlocked
        ? `Débloquer ${contactData.name} ? Vous pourrez à nouveau recevoir ses messages.`
        : `Bloquer ${contactData.name} ? Cette personne ne pourra plus vous envoyer de messages.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: isBlocked ? 'Débloquer' : 'Bloquer',
          style: isBlocked ? 'default' : 'destructive',
          onPress: () => {
            setIsBlocked(!isBlocked);
            setContactData(prev => ({ ...prev, isBlocked: !prev.isBlocked }));
            console.log(isBlocked ? 'Contact débloqué' : 'Contact bloqué');
          },
        },
      ]
    );
  };

  const handleReport = () => {
    Alert.alert(
      'Signaler le contact',
      'Pourquoi voulez-vous signaler ce contact ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Spam', 
          onPress: () => console.log('Signalé pour spam') 
        },
        {
          text: 'Comportement inapproprié',
          onPress: () => console.log('Signalé pour comportement'),
        },
        { 
          text: 'Autre', 
          onPress: () => console.log('Signalé pour autre') 
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Contact: ${contactData.name} - ${contactData.phone}`,
        title: 'Partager le contact',
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  const handleEdit = () => {
    console.log('Modifier le contact');
    // Navigation vers l'écran d'édition
  };

  const handleViewMedia = () => {
    console.log('Voir les médias partagés');
    // Navigation vers les médias partagés
  };

  const handleExportChat = () => {
    Alert.alert(
      'Exporter la conversation',
      'Voulez-vous inclure les médias dans l\'export ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Sans médias', 
          onPress: () => console.log('Export sans médias') 
        },
        { 
          text: 'Avec médias', 
          onPress: () => console.log('Export avec médias') 
        },
      ]
    );
  };

  const ActionButton = ({ 
    icon, 
    label, 
    onPress, 
    color = theme.primary 
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: color,
        width: 56,
        height: 56,
        borderRadius: 28,
        marginHorizontal: 12,
        shadowColor: color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={24} color="white" />
    </TouchableOpacity>
  );

  const InfoSection = ({ 
    title, 
    children 
  }: { 
    title: string; 
    children: React.ReactNode;
  }) => (
    <ThemedView style={{ marginBottom: 8 }}>
      <ThemedText
        style={{
          color: theme.text,
          marginHorizontal: 20,
          marginBottom: 12,
        }}
      >
        {title}
      </ThemedText>
      <ThemedView
        style={{
          // backgroundColor: theme.surface,
          marginHorizontal: 0,
          borderTopWidth: 0.5,
          borderBottomWidth: 0.5,
          borderColor: theme.surfaceVariant,
        }}
      >
        {children}
      </ThemedView>
    </ThemedView>
  );

  const InfoItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    destructive = false,
    showArrow = true,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    destructive?: boolean;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 10,
        // backgroundColor: theme.surface,
        // borderBottomWidth: 0.5,
        // borderBottomColor: theme.surfaceVariant,
      }}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Feather
        name={icon as any}
        size={22}
        color={destructive ? theme.error : theme.typography.caption}
        style={{ marginRight: 20, width: 24 }}
      />
      <ThemedView style={{ flex: 1 }}>
        <ThemedText
          style={{
            color: destructive ? theme.error : theme.text,
            marginBottom: subtitle ? 2 : 0,
          }}
        >
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText
            style={{
              color: theme.typography.caption,
            }}
          >
            {subtitle}
          </ThemedText>
        )}
      </ThemedView>
      {rightElement && <View style={{ marginRight: 8 }}>{rightElement}</View>}
      {showArrow && onPress && (
        <Feather 
          name="chevron-right" 
          size={20} 
          color={theme.typography.caption} 
        />
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <StatusBar 
        barStyle={theme.dark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.surface} 
      />
      
      {/* Header fixe en haut */}
      <SafeAreaView edges={['top']}>
        <ThemedView
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            // backgroundColor: theme.surface,
            // borderBottomWidth: 0.5,
            // borderBottomColor: theme.surfaceVariant,
          }}
        >
          <BackButton />
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Options',
                '',
                [
                  { text: 'Modifier', onPress: handleEdit },
                  { text: 'Partager', onPress: handleShare },
                  { text: 'Annuler', style: 'cancel' },
                ]
              );
            }}
            style={{
              // padding: 4,
              borderRadius: 20,
            }}
          >
            <Feather name="more-vertical" size={20} color={theme.text} />
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Section Profil */}
        <ThemedView
          style={{
            alignItems: 'center',
            paddingVertical: 32,
            // backgroundColor: theme.surface,
            borderBottomWidth: 8,
            // borderBottomColor: theme.background,
          }}
        >
          <ThemedView style={{ position: 'relative', marginBottom: 16 }}>
            <Image
              source={{
                uri: contactData.image || `https://i.pravatar.cc/200?u=${contactData.name}`,
              }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: theme.surfaceVariant,
              }}
            />
            {contactData.isOnline && (
              <ThemedView
                style={{
                  position: 'absolute',
                  bottom: 4,
                  right: 4,
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: '#25D366',
                  borderWidth: 3,
                  borderColor: theme.surface,
                }}
              />
            )}
          </ThemedView>

          <ThemedText type = "title"
            style={{
              marginBottom: 4,
              textAlign: 'center',
            }}
          >
            {contactData.name}
          </ThemedText>

          <ThemedText
            style={{
              color: theme.typography.caption,
              marginBottom: 8,
            }}
          >
            {contactData.phone}
          </ThemedText>

          <ThemedText
            style={{
              color: theme.typography.caption,
              textAlign: 'center',
            }}
          >
            {contactData.isOnline ? 'En ligne' : `Vu ${contactData.lastSeen}`}
          </ThemedText>

          {/* Actions rapides */}
          <ThemedView
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 20,
            }}
          >
            <ActionButton
              icon="call"
              label="Appeler"
              onPress={handleCall}
              color="#25D366"
            />
            <ActionButton
              icon="videocam"
              label="Vidéo"
              onPress={handleVideoCall}
              color="#128C7E"
            />
            <ActionButton
              icon="chatbubble-ellipses"
              label="Message"
              onPress={handleMessage}
              color="#075E54"
            />
          </ThemedView>
        </ThemedView>

        {/* Status */}
        {contactData.status && (
          <InfoSection title="À propos et numéro de téléphone">
            <InfoItem
              icon="info"
              title={contactData.status}
              subtitle={`${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}`}
              showArrow={false}
            />
            <InfoItem
              icon="phone"
              title={contactData.phone}
              subtitle="Mobile"
              onPress={handleCall}
            />
          </InfoSection>
        )}

        {/* Médias et documents */}
        <InfoSection title="Médias, liens et documents">
          <InfoItem
            icon="image"
            title="Médias partagés"
            subtitle={`${contactData.sharedMedia} éléments`}
            onPress={handleViewMedia}
            rightElement={
              <ThemedText style={{ color: theme.typography.caption }}>
                {contactData.sharedMedia}
              </ThemedText>
            }
          />
        </InfoSection>

        {/* Groupes en commun */}
        {contactData.commonGroups > 0 && (
          <InfoSection title="Groupes en commun">
            <InfoItem
              icon="users"
              title="Groupes"
              subtitle={`${contactData.commonGroups} groupes en commun`}
              onPress={() => console.log('Voir groupes communs')}
              rightElement={
                <ThemedText style={{ color: theme.typography.caption }}>
                  {contactData.commonGroups}
                </ThemedText>
              }
            />
          </InfoSection>
        )}

        {/* Paramètres de conversation */}
        <InfoSection title="Paramètres de conversation">
          <InfoItem
            icon={isMuted ? "bell-off" : "bell"}
            title="Notifications"
            subtitle={isMuted ? "Désactivées" : "Activées"}
            onPress={handleMute}
            showArrow={false}
            rightElement={
              <TouchableOpacity onPress={handleMute}>
                <ThemedView
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: isMuted ? theme.surfaceVariant : '#25D366',
                    justifyContent: 'center',
                    paddingHorizontal: 2,
                  }}
                >
                  <ThemedView
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: 'white',
                      alignSelf: isMuted ? 'flex-start' : 'flex-end',
                    }}
                  />
                </ThemedView>
              </TouchableOpacity>
            }
          />
          <InfoItem
            icon="download"
            title="Visibilité des médias"
            subtitle="Par défaut"
            onPress={() => console.log('Paramètres médias')}
          />
          <InfoItem
            icon="archive"
            title="Exporter la conversation"
            onPress={handleExportChat}
          />
        </InfoSection>

        {/* Actions */}
        <InfoSection title="">
          <InfoItem
            icon={isBlocked ? "user-check" : "user-x"}
            title={isBlocked ? "Débloquer" : "Bloquer"}
            onPress={handleBlock}
            destructive={!isBlocked}
            showArrow={false}
          />
          <InfoItem
            icon="flag"
            title="Signaler le contact"
            onPress={handleReport}
            destructive
            showArrow={false}
          />
        </InfoSection>
      </ScrollView>

      {/* Header flottant avec animation */}
      <Animated.View
        style={{
          position: 'absolute',
          top: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
          left: 0,
          right: 0,
          height: headerHeight,
          opacity: headerOpacity,
          zIndex: 1000,
        }}
        pointerEvents="box-none"
      >
        <BlurView
          intensity={15}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            borderBottomWidth: 0.5,
            // borderBottomColor: theme.surfaceVariant,
          }}
        >
          {/* <BackButton /> */}
          <ThemedText type = "body"
            style={{
              flex: 1,
              textAlign: 'center',
              marginHorizontal: 16,
            }}
          >
            {contactData.name}
          </ThemedText>
          <TouchableOpacity
            style={{
              padding: 8,
              borderRadius: 20,
            }}
          >
            <Feather name="more-vertical" size={20} color={theme.text} />
          </TouchableOpacity>
        </BlurView>
      </Animated.View>
    </ThemedView>
  );
};

export default ContactInfo;


