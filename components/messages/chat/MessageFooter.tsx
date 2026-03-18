import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Alert, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FrontendMessage } from "@/types/MessageTypes";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { launchImageLibraryWithFallback } from '@/components/utils/imagePickerUtils';
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from "@/hooks/themehook";

interface MessageFooterProps {
  onSendMessage: (
    messageType: FrontendMessage['messageType'],
    content: string,
    mediaData?: any,
    mentions?: string[],
    replyTo?: string
  ) => Promise<void>;
  onTypingStatusChange: (isTyping: boolean) => void;
  isLoading: boolean;
  replyTo?: FrontendMessage;
  onCancelReply: () => void;
}

const MessageFooter = ({
  onSendMessage,
  onTypingStatusChange,
  isLoading = false,
  replyTo,
  onCancelReply
}: MessageFooterProps) => {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const  insets = useSafeAreaInsets();
  const  {theme} = useTheme();

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle typing indicator
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (input.trim()) {
      if (!isTyping) {
        setIsTyping(true);
        onTypingStatusChange(true);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTypingStatusChange(false);
        typingTimeoutRef.current = null;
      }, 1500);
    } else {
      if (isTyping) {
        setIsTyping(false);
        onTypingStatusChange(false);
      }
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [input, isTyping, onTypingStatusChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isTyping) {
        onTypingStatusChange(false);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSendText = () => {
    if (input.trim() === "" || isLoading) return;

    const content = input.trim();
    const mentions = extractMentions(content);

    onSendMessage(
      'text',
      content,
      undefined,
      mentions.length > 0 ? mentions : undefined,
      replyTo?.msgId
    );

    setInput("");
    onCancelReply();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setIsTyping(false);
    onTypingStatusChange(false);
  };

  const extractMentions = (content: string): string[] => {
    const mentionPattern = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionPattern.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  };

  const handleAttachment = () => {
    Alert.alert(
      'Attachment',
      'Choose media type',
      [
        { text: 'Photo', onPress: () => handleMediaSelection('image') },
        { text: 'Video', onPress: () => handleMediaSelection('video') },
        { text: 'Document', onPress: () => handleMediaSelection('document') },
        { text: 'Location', onPress: () => handleLocationShare() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleMediaSelection = async (type: 'image' | 'video' | 'document') => {
    try {
      if (type === 'document') {
        const result = await DocumentPicker.getDocumentAsync({
          type: '*/*',
          copyToCacheDirectory: true
        });

        if (result.canceled) return;

        const file = result.assets[0];
        const mediaData = {
          filename: file.name,
          originalName: file.name,
          size: file.size || 0,
          mimetype: file.mimeType || 'application/octet-stream',
          uri: file.uri
        };

        onSendMessage('document', file.uri, mediaData);
      } else {
        const result = await launchImageLibraryWithFallback({
          mediaTypes: type === 'image'
            ? ImagePicker.MediaTypeOptions.Images
            : ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: true,
          quality: 0.8,
          videoMaxDuration: type === 'video' ? 60 : undefined,
        });

        if (result.canceled || !result.assets) return;

        const asset = result.assets[0];
        const filename = asset.uri.split('/').pop() || 'media';
        const mediaData = {
          filename,
          originalName: filename,
          size: asset.fileSize || 0,
          mimetype: type === 'image' ? 'image/jpeg' : 'video/mp4',
          uri: asset.uri,
          width: asset.width,
          height: asset.height
        };

        onSendMessage(type, asset.uri, mediaData);
      }
    } catch (error) {
      console.error('Media selection error:', error);
      Alert.alert('Error', 'Unable to select media');
    }
  };

  const handleLocationShare = async () => {
    try {
      const locationData = {
        latitude: 48.8566,
        longitude: 2.3522,
        address: 'Paris, France'
      };

      onSendMessage('location', JSON.stringify(locationData));
    } catch (error) {
      console.error('Geolocation error:', error);
      Alert.alert('Error', 'Unable to get location');
    }
  };

  const handleVoiceRecord = () => {
    Alert.alert('Voice recording', 'Coming soon');
  };

  return (
    <ThemedView style={{ paddingBottom: insets.bottom }}>
      {/* Reply indicator */}
      {replyTo && (
        <ThemedView style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: '#F9FAFB',
          borderLeftWidth: 3,
          borderLeftColor: theme.success,
          marginHorizontal: 12,
          marginTop: 8,
          borderRadius: 8,
        }}>
          <ThemedView style={{ flex: 1 }}>
            <ThemedText type="caption" style={{ color: theme.success }}>
              Replying to
            </ThemedText>
            <ThemedText type='normal' style={{ color: '#374151' }} numberOfLines={1}>
              {replyTo.content}
            </ThemedText>
          </ThemedView>
          <TouchableOpacity onPress={onCancelReply} style={{ padding: 4 }}>
            <Ionicons name="close" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </ThemedView>
      )}

      {/* Input bar */}
      <ThemedView style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
      }}>
        {/* Text input with attachment icon */}
        <ThemedView style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#F3F4F6',
          borderRadius: 24,
          paddingHorizontal: 16,
          paddingVertical: 4,
          minHeight: 48,
          borderWidth: 1,
          borderColor: theme.outline + "30"
        }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Message"
            placeholderTextColor="#9CA3AF"
            multiline
            style={{
              flex: 1,
              fontSize: 16,
              color: '#111827',
              maxHeight: 100,
              paddingVertical: 8,
            }}
            editable={!isLoading}
            onSubmitEditing={handleSendText}
          />

          <TouchableOpacity
            onPress={handleAttachment}
            disabled={isLoading}
            style={{ padding: 4, marginLeft: 8 }}
          >
            <Ionicons
              name="attach"
              size={24}
              color={isLoading ? '#D1D5DB' : '#6B7280'}
            />
          </TouchableOpacity>
        </ThemedView>

        {/* Send or mic button */}
        {input.trim().length > 0 ? (
          <TouchableOpacity
            disabled={isLoading}
            onPress={handleSendText}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.primary,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleVoiceRecord}
            disabled={isLoading}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.primary,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons name="mic" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </ThemedView>
    </ThemedView>
  );
};

export default MessageFooter;
