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
import chatListData from '@/assets/data/chatListData';
import { ChatListItem } from '@/types/ChatListTypes';

export default function ArchivedChats() {
  const { theme } = useTheme();
  const [archivedChats] = useState<ChatListItem[]>(
    chatListData.filter(chat => chat.isArchived)
  );

  const unarchiveChat = (chatId: string) => {
    // In real app, this would update the backend
    console.log('Unarchiving chat:', chatId);
  };

  const deleteChat = (chatId: string) => {
    // In real app, this would delete from backend
    console.log('Deleting chat:', chatId);
  };

 
  const renderArchivedChat = ({ item, index }: { item: ChatListItem; index: number }) => (
    <MotiView
      from={{ opacity: 0, translateX: -50 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ delay: index * 100, type: 'spring' }}
      style={{ marginBottom: 12 }}
    >
      <ThemedView style={{
        backgroundColor: theme.surface,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}>
        <Image
          source={{ uri: item.sender.avatar }}
          style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
        />
        
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 16, fontWeight: '600', color: theme.onSurface }}>
            {item.sender.name}
          </ThemedText>
          <ThemedText 
            style={{ fontSize: 14, color: theme.onSurface + '80', marginTop: 2 }}
            numberOfLines={1}
          >
            {item.content}
          </ThemedText>
          <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60', marginTop: 4 }}>
            Archivé • {item.timestamp}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => unarchiveChat(item.id)}
            style={{
              backgroundColor: theme.primary + '20',
              borderRadius: 20,
              padding: 8
            }}
          >
            <MaterialCommunityIcons name="archive-arrow-up" size={20} color={theme.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => deleteChat(item.id)}
            style={{
              backgroundColor: theme.error + '20',
              borderRadius: 20,
              padding: 8
            }}
          >
            <MaterialCommunityIcons name="delete" size={20} color={theme.error} />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </MotiView>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      
      <ThemedView style={{ flex: 1, padding: 16 }}>
        {archivedChats.length === 0 ? (
          <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="archive" size={64} color={theme.onSurface + '40'} />
            <ThemedText style={{ fontSize: 18, fontWeight: '600', marginTop: 16, color: theme.onSurface + '60' }}>
              Aucune conversation archivée
            </ThemedText>
            <ThemedText style={{ fontSize: 14, color: theme.onSurface + '40', textAlign: 'center', marginTop: 8 }}>
              Les conversations archivées apparaîtront ici
            </ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={archivedChats}
            renderItem={renderArchivedChat}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ThemedView>
    </ThemedView>
  );
}