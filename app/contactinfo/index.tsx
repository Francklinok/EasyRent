import React from 'react';
import {
  Image,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { BackButton } from '@/components/ui/BackButton';
import { useTheme } from '@/components/contexts/theme/themehook';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';

type ActionButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
  iconSize?: number;
};

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onPress,
  color,
  iconSize = 24,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      className="items-center justify-center p-2 rounded-2xl flex-1"
      style={{
        backgroundColor: theme.surfaceVariant,
        // borderWidth: 1,
        // borderColor: theme.cardBorder,
        minHeight: 50,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={iconSize} color={color || theme.info} />
      <ThemedText  type = 'caption' className="text-xs mt-2 text-center font-medium" style={{ color: color || theme.info }}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
};

type InfoItemProps = {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
  destructive?: boolean;
};

const InfoItem: React.FC<InfoItemProps> = ({
  icon,
  label,
  onPress,
  color,
  destructive = false,
}) => {
  const { theme } = useTheme();
  const iconColor = color || theme.typography.caption;

  return (
    <TouchableOpacity
      className="flex-row items-center p-3 rounded-2xl mb-3 "
      style={{
        backgroundColor: theme.surfaceVariant,
        // borderWidth: 1,
        // borderColor: theme.cardBorder,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ThemedView
        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: destructive ? `${iconColor}20` : theme.surface }}
      >
        {React.createElement(
          icon.includes('block') ? MaterialIcons : Feather,
          { name: icon as any, size: 20, color: iconColor }
        )}
      </ThemedView>
      <ThemedText
        className="flex-1 text-sm font-medium"
        style={{ color: destructive ? iconColor : theme.primary}}
      >
        {label}
      </ThemedText>
      <Feather name="chevron-right" size={16} color={theme.typography.caption} />
    </TouchableOpacity>
  );
};

export default function ContactInfo() {
  const { name, image, status, chatId } = useLocalSearchParams();
  const { theme } = useTheme();

  const statusColor = /écrit|train|typing/i.test(String(status)) ? theme.warning : theme.success;

  const handleCall = () => {
    Alert.alert('Appel', `Appeler ${name} ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Appeler', onPress: () => console.log('Appel initié') },
    ]);
  };

  const handleVideoCall = () => {
    Alert.alert('Appel vidéo', `Démarrer un appel vidéo avec ${name} ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Appeler', onPress: () => console.log('Appel vidéo initié') },
    ]);
  };

  const handleMessage = () => {
    console.log('Retour au chat');
  };

  const handleBlock = () => {
    Alert.alert(
      'Bloquer ce contact',
      `Voulez-vous vraiment bloquer ${name} ? Cette action empêchera ce contact de vous envoyer des messages.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Bloquer', style: 'destructive', onPress: () => console.log('Contact bloqué') },
      ]
    );
  };

  const handleReport = () => {
    Alert.alert(
      'Signaler le profil',
      'Pourquoi voulez-vous signaler ce profil ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Spam', onPress: () => console.log('Signalé pour spam') },
        { text: 'Comportement inapproprié', onPress: () => console.log('Signalé pour comportement') },
        { text: 'Autre', onPress: () => console.log('Signalé pour autre') },
      ]
    );
  };

  const handleMute = () => {
    Alert.alert('Notifications', `Désactiver les notifications pour ${name} ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Désactiver', onPress: () => console.log('Notifications désactivées') },
    ]);
  };

  return ( 
    <SafeAreaView 
    style={{ flex: 1, backgroundColor:theme.surface}}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedView className="flex-row items-center justify-between  ">
          <BackButton />
          <TouchableOpacity className="p-2 rounded-xl">
            <Feather name="more-horizontal" size={20} color={theme.typography.caption} />
          </TouchableOpacity>
        </ThemedView>

        {/* Profil */}
        <ThemedView className="items-center mb-1  rounded-2xl">
          <ThemedView className="relative mb-4">
            <Image
              source={{ uri: String(image) || `https://i.pravatar.cc/150?u=${name}` }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                borderWidth: 4,
                borderColor: theme.surfaceVariant,
              }}
            />
            <ThemedView
              className="absolute bottom-2 right-2 w-6 h-6 rounded-full items-center justify-center"
              style={{
                backgroundColor: theme.surface,
                borderWidth: 2,
                borderColor: theme.background,
              }}
            >
              <ThemedView
                style={{
                  backgroundColor: statusColor,
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                }}
              />
            </ThemedView>
          </ThemedView>

          <ThemedText className="text-2xl font-bold mb-2 text-center">{name}</ThemedText>

          <ThemedView className="flex-row items-center px-4 py-2 rounded-full mb-6" style={{ backgroundColor: theme.surfaceVariant }}>
            <ThemedView
              style={{
                backgroundColor: statusColor,
                width: 8,
                height: 8,
                borderRadius: 4,
                marginRight: 8,
              }}
            />
            <ThemedText className="text-sm font-medium">{status}</ThemedText>
          </ThemedView>

          {/* Actions rapides */}
          <ThemedView className="flex-row gap-3 mb-8 px-2 ">
            <ActionButton icon="call" label="Appeler" onPress={handleCall} iconSize={22} />
            <ActionButton icon="videocam" label="Vidéo" onPress={handleVideoCall} iconSize={22} />
            <ActionButton icon="chatbubble" label="Message" onPress={handleMessage} iconSize={22} />
          </ThemedView>
        </ThemedView>

        {/* Section informations */}
        <ThemedView className="mb-2 px-2  rounded-2xl p-2">
          <ThemedText type = 'caption' className="text-base font-semibold mb-4">Informations</ThemedText>
          <InfoItem icon="info" label="Voir les détails du profil" onPress={() => console.log('Voir profil')} />
          <InfoItem icon="image" label="Photos, vidéos et fichiers" onPress={() => console.log('Voir médias')} />
          <InfoItem icon="bell-off" label="Désactiver les notifications" onPress={handleMute} />
        </ThemedView>

        {/* Section confidentialité */}
        <ThemedView className = "mb-2 px-2  rounded-2xl p-2">
          <ThemedText type ="caption" className="text-base font-semibold mb-4">Confidentialité</ThemedText>
          <InfoItem icon="alert-triangle" label="Signaler ce profil" onPress={handleReport} color={theme.warning} destructive />
          <InfoItem icon="block" label="Bloquer ce contact" onPress={handleBlock} color={theme.error} destructive />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}
