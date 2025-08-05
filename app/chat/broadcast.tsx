import React, { useState } from 'react';
import { FlatList, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
import Header from '@/components/ui/header';
import chatListData from '@/assets/data/chatListData';

export default function BroadcastMessage() {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [contacts] = useState(chatListData.filter(chat => !chat.isArchived));

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const sendBroadcast = () => {
    if (message.trim() && selectedContacts.length > 0) {
      console.log('Sending broadcast:', { message, recipients: selectedContacts });
      router.back();
    }
  };

  

  const renderContact = ({ item, index }: { item: any; index: number }) => {
    const isSelected = selectedContacts.includes(item.id);
    
    return (
      <MotiView
        from={{ opacity: 0, translateX: -30 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ delay: index * 50, type: 'spring' }}
        style={{ marginBottom: 8 }}
      >
        <TouchableOpacity
          onPress={() => toggleContact(item.id)}
          activeOpacity={0.8}
        >
          <ThemedView style={{
            backgroundColor: isSelected ? theme.primary + '10' : theme.surface,
            borderRadius: 12,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: isSelected ? 2 : 1,
            borderColor: isSelected ? theme.primary : theme.outline + '20'
          }}>
            <Image
              source={{ uri: item.sender.avatar }}
              style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
            />
            
            <ThemedView style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 16, fontWeight: '600', color: theme.onSurface }}>
                {item.sender.name}
              </ThemedText>
              <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60' }}>
                {item.status === 'online' ? 'En ligne' : 'Hors ligne'}
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: isSelected ? theme.primary : 'transparent',
              borderWidth: 2,
              borderColor: isSelected ? theme.primary : theme.outline,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isSelected && (
                <MaterialCommunityIcons name="check" size={14} color="white" />
              )}
            </ThemedView>
          </ThemedView>
        </TouchableOpacity>
      </MotiView>
    );
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      
      <ThemedView style={{ flex: 1, padding: 16 }}>
        {/* Message Input */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring' }}
          style={{ marginBottom: 20 }}
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
          }}>
            <ThemedText style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: theme.onSurface }}>
              Message à diffuser
            </ThemedText>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Tapez votre message..."
              placeholderTextColor={theme.onSurface + '60'}
              multiline
              style={{
                backgroundColor: theme.surfaceVariant + '40',
                borderRadius: 8,
                padding: 12,
                minHeight: 80,
                fontSize: 14,
                color: theme.onSurface,
                textAlignVertical: 'top'
              }}
            />
          </ThemedView>
        </MotiView>

        {/* Selected Count */}
        {selectedContacts.length > 0 && (
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' }}
            style={{ marginBottom: 16 }}
          >
            <ThemedView style={{
              backgroundColor: theme.primary + '20',
              borderRadius: 8,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <MaterialCommunityIcons name="account-multiple" size={20} color={theme.primary} />
              <ThemedText style={{ marginLeft: 8, color: theme.primary, fontWeight: '600' }}>
                {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} sélectionné{selectedContacts.length > 1 ? 's' : ''}
              </ThemedText>
            </ThemedView>
          </MotiView>
        )}

        {/* Contacts List */}
        <ThemedText style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: theme.onSurface }}>
          Sélectionner les contacts
        </ThemedText>
        
        <FlatList
          data={contacts}
          renderItem={renderContact}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        />

        {/* Send Button */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300, type: 'spring' }}
          style={{ marginTop: 16 }}
        >
          <TouchableOpacity
            onPress={sendBroadcast}
            disabled={!message.trim() || selectedContacts.length === 0}
            style={{
              backgroundColor: (!message.trim() || selectedContacts.length === 0) 
                ? theme.outline 
                : theme.primary,
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <MaterialCommunityIcons 
              name="send" 
              size={20} 
              color={(!message.trim() || selectedContacts.length === 0) ? theme.onSurface + '60' : 'white'} 
            />
            <ThemedText style={{ 
              marginLeft: 8, 
              fontSize: 16, 
              fontWeight: '700',
              color: (!message.trim() || selectedContacts.length === 0) ? theme.onSurface + '60' : 'white'
            }}>
              Envoyer la diffusion
            </ThemedText>
          </TouchableOpacity>
        </MotiView>
      </ThemedView>
    </ThemedView>
  );
}