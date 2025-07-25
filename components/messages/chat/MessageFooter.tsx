// MessageFooter.tsx - Version corrigée
import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Alert, Text } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FrontendMessage } from "@/types/MessageTypes";

interface MessageFooterProps {
  onSend: (
    messageType: FrontendMessage['messageType'],
    content: string,
    mediaData?: any,
    mentions?: string[],
    replyTo?: string
  ) => void;
  onTypingChange?: (isTyping: boolean) => void;
  isLoading?: boolean;
  replyTo?: FrontendMessage;
  onCancelReply?: () => void;
}

const MessageFooter = ({ 
  onSend, 
  onTypingChange, 
  isLoading = false,
  replyTo,
  onCancelReply 
}: MessageFooterProps) => {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Correction du useRef avec le bon type pour React Native
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (input.trim() && !isTyping) {
      setIsTyping(true);
      onTypingChange?.(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (input.trim()) {
      // Utiliser le type correct pour React Native
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTypingChange?.(false);
      }, 2000);
    } else if (isTyping) {
      setIsTyping(false);
      onTypingChange?.(false);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [input, isTyping, onTypingChange]);

  const handleSendText = () => {
    if (input.trim() === "" || isLoading) return;

    const content = input.trim();
    const mentions = extractMentions(content);
    
    onSend(
      'text',
      content,
      undefined,
      mentions.length > 0 ? mentions : undefined,
      replyTo?.msgId
    );
    
    setInput("");
    onCancelReply?.();
    
    setIsTyping(false);
    onTypingChange?.(false);
  };

  const extractMentions = (content: string): string[] => {
    const mentionPattern = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionPattern.exec(content)) !== null) {
      // Ici, vous devriez convertir le username en ID utilisateur
      // Pour l'exemple, on utilise directement le username
      mentions.push(match[1]);
    }

    return mentions;
  };

  const handleAttachment = () => {
    Alert.alert(
      'Pièce jointe',
      'Choisir le type de média',
      [
        { text: 'Photo', onPress: () => handleMediaSelection('image') },
        { text: 'Vidéo', onPress: () => handleMediaSelection('video') },
        { text: 'Document', onPress: () => handleMediaSelection('document') },
        { text: 'Localisation', onPress: () => handleLocationShare() },
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  const handleMediaSelection = async (type: 'image' | 'video' | 'document') => {
    try {
      // TODO: Implémentation avec expo-image-picker ou expo-document-picker
      const mediaUri = 'https://example.com/media.jpg';
      const mediaData = {
        filename: 'image.jpg',
        originalName: 'photo.jpg',
        size: 1024000,
        mimetype: 'image/jpeg'
      };

      onSend(type, mediaUri, mediaData);
    } catch (error) {
      console.error('Erreur sélection média:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner le média');
    }
  };

  const handleLocationShare = async () => {
    try {
      // TODO: Implémentation avec expo-location
      const locationData = {
        latitude: 48.8566,
        longitude: 2.3522,
        address: 'Paris, France'
      };

      onSend('location', JSON.stringify(locationData));
    } catch (error) {
      console.error('Erreur géolocalisation:', error);
      Alert.alert('Erreur', 'Impossible d\'obtenir la localisation');
    }
  };

  const handleEmojiPress = () => {
    // TODO: Implémenter le sélecteur d'emoji
    console.log('Ouvrir sélecteur emoji');
  };

  return (
    <View>
      {/* Indicateur de réponse */}
      {replyTo && (
        <View className="flex-row items-center justify-between p-2 bg-gray-100 rounded-t-lg">
          <View className="flex-1">
            <Text className="text-xs text-gray-500">Réponse à {replyTo.senderId}</Text>
            <Text className="text-sm text-gray-700" numberOfLines={1}>
              {replyTo.content}
            </Text>
          </View>
          <TouchableOpacity onPress={onCancelReply}>
            <Ionicons name="close" size={20} color="gray" />
          </TouchableOpacity>
        </View>
      )}

      {/* Barre de saisie */}
      <View className="flex flex-row gap-3 items-center justify-between p-2 bg-white border-t border-gray-300 w-full ml-1 mr-1 rounded-[14px]">
        <TouchableOpacity onPress={handleAttachment} disabled={isLoading}>
          <MaterialIcons name="attach-file" size={24} color={isLoading ? "gray" : "black"} />
        </TouchableOpacity>

        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Écrire un message..."
          multiline
          className="flex-1 px-3 py-2 text-base bg-gray-100 rounded-lg mx-2"
          style={{ minHeight: 40, maxHeight: 120 }}
          editable={!isLoading}
          onSubmitEditing={handleSendText}
          blurOnSubmit={false}
        />

        <TouchableOpacity onPress={handleEmojiPress} disabled={isLoading}>
          <Entypo name="emoji-happy" size={24} color={isLoading ? "gray" : "black"} />
        </TouchableOpacity>

        <TouchableOpacity 
          disabled={input.trim().length === 0 || isLoading} 
          onPress={handleSendText}
        >
          <Ionicons 
            name="send-sharp" 
            size={24} 
            color={input.trim().length > 0 && !isLoading ? "blue" : "gray"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MessageFooter;