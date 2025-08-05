import React, { useState } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
import Header from '@/components/ui/header';

interface StarredMessage {
  id: string;
  chatId: string;
  sender: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  messageType: 'text' | 'image' | 'document';
}

export default function StarredMessages() {
  const { theme } = useTheme();
  const [starredMessages] = useState<StarredMessage[]>([
    {
      id: '1',
      chatId: '1',
      sender: {
        name: 'EasyBot',
        avatar: 'https://ui-avatars.com/api/?name=Easy+Bot&background=random',
      },
      content: 'Voici les documents importants pour votre dossier',
      timestamp: '10:30',
      messageType: 'text'
    },
    {
      id: '2',
      chatId: '2',
      sender: {
        name: 'Agent Immo',
        avatar: 'https://ui-avatars.com/api/?name=Agent+Immo',
      },
      content: 'Rendez-vous confirmé pour samedi 14h',
      timestamp: '09:15',
      messageType: 'text'
    }
  ]);

  const unstarMessage = (messageId: string) => {
    console.log('Unstarring message:', messageId);
  };

  const goToChat = (chatId: string, messageId: string) => {
    router.navigate({
      pathname: '/chat/[chatId]',
      params: { chatId, messageId }
    });
  };

  
  const renderStarredMessage = ({ item, index }: { item: StarredMessage; index: number }) => (
    <MotiView
      from={{ opacity: 0, translateY: 30 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 100, type: 'spring' }}
      style={{ marginBottom: 12 }}
    >
      <TouchableOpacity
        onPress={() => goToChat(item.chatId, item.id)}
        activeOpacity={0.8}
      >
        <ThemedView style={{
          backgroundColor: theme.surface,
          borderRadius: 12,
          padding: 16,
          shadowColor: theme.shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
          borderLeftWidth: 3,
          borderLeftColor: '#FFD700'
        }}>
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Image
              source={{ uri: item.sender.avatar }}
              style={{ width: 32, height: 32, borderRadius: 16, marginRight: 12 }}
            />
            <ThemedView style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 14, fontWeight: '600', color: theme.onSurface }}>
                {item.sender.name}
              </ThemedText>
              <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60' }}>
                {item.timestamp}
              </ThemedText>
            </ThemedView>
            <TouchableOpacity
              onPress={() => unstarMessage(item.id)}
              style={{
                backgroundColor: '#FFD700' + '20',
                borderRadius: 16,
                padding: 6
              }}
            >
              <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
            </TouchableOpacity>
          </ThemedView>
          
          <ThemedView style={{
            backgroundColor: theme.surfaceVariant + '40',
            borderRadius: 8,
            padding: 12
          }}>
            <ThemedText style={{ fontSize: 14, color: theme.onSurface, lineHeight: 20 }}>
              {item.content}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    </MotiView>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      
      <ThemedView style={{ flex: 1, padding: 16 }}>
        {starredMessages.length === 0 ? (
          <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="star-outline" size={64} color={theme.onSurface + '40'} />
            <ThemedText style={{ fontSize: 18, fontWeight: '600', marginTop: 16, color: theme.onSurface + '60' }}>
              Aucun message favori
            </ThemedText>
            <ThemedText style={{ fontSize: 14, color: theme.onSurface + '40', textAlign: 'center', marginTop: 8 }}>
              Appuyez longuement sur un message pour l'ajouter aux favoris
            </ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={starredMessages}
            renderItem={renderStarredMessage}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ThemedView>
    </ThemedView>
  );
}