import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  Modal,
  Animated,
  Alert,
  Dimensions,
  Vibration,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { MessageBodyProps } from "@/types/MessageTypes";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { useTheme } from "@/components/contexts/theme/themehook";

const { width: screenWidth } = Dimensions.get('window');

const MessageDisplay = ({
  message,
  currentUserId,
  onReply,
  onDelete,
  onReact,
  onMarkAsRead,
  onEdit
}: MessageBodyProps) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [isPressed, setIsPressed] = useState(false);
  
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const contextMenuScale = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const isSent = message.senderId === currentUserId;
  const senderAvatar = message.sender?.avatar || `https://ui-avatars.com/api/?name=${message.sender?.name || 'User'}&background=random`;
  const senderName = message.sender?.name || 'Unknown';
  const { theme } = useTheme();

  const messageColors = isSent 
    ? {
        background: theme.primary,
        text: '#FFFFFF',
        textSecondary: 'rgba(255,255,255,0.8)',
        border: theme.primary + '20'
      }
    : {
        background: theme.surfaceVariant,
        text: theme.onSurface,
        textSecondary: theme.onSurface + '80',
        border: theme.outline + '30'
      };

  const reactionEmojis = [
    '👍', '❤️', '😂', '😮', '😢', '😡', '🔥', '👀'
  ];

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();

    longPressTimer.current = setTimeout(() => {
      if (isPressed) {
        Vibration.vibrate(50);
        showContextMenuAnimated();
      }
    }, 600);
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const showContextMenuAnimated = () => {
    setShowContextMenu(true);
    
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(contextMenuScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  };

  const hideContextMenu = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(contextMenuScale, {
        toValue: 0,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowContextMenu(false);
    });
  };

  const handleReaction = (emoji: string) => {
    onReact?.(emoji);
    hideContextMenu();
    
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.05,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleDelete = () => {
    hideContextMenu();
    setTimeout(() => {
      Alert.alert(
        "Supprimer le message",
        "Êtes-vous sûr de vouloir supprimer ce message ?",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: () => onDelete?.()
          }
        ]
      );
    }, 200);
  };

  const handleEdit = () => {
    hideContextMenu();
    setTimeout(() => setShowEditModal(true), 200);
  };

  const handleReply = () => {
    hideContextMenu();
    onReply?.();
  };

  const renderMessageContent = () => {
    switch (message.messageType) {
      case "text":
        return (
          <ThemedText 
            style={{ 
              color: messageColors.text,
              fontSize: 16,
              lineHeight: 22
            }}
          >
            {message.content}
          </ThemedText>
        );

      case "image":
        return (
          <View style={{ marginTop: 4, borderRadius: 12, overflow: 'hidden' }}>
            <Image
              source={{ uri: message.content }}
              style={{ 
                width: screenWidth * 0.65, 
                height: 200,
                borderRadius: 12
              }}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 40,
                justifyContent: 'flex-end',
                paddingHorizontal: 12,
                paddingBottom: 8
              }}
            >
              <Ionicons name="expand" size={16} color="white" />
            </LinearGradient>
          </View>
        );

      default:
        return (
          <ThemedText style={{ color: messageColors.text }}>
            {message.content}
          </ThemedText>
        );
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <View style={{
        marginBottom: 8,
        paddingHorizontal: 16,
        alignItems: isSent ? 'flex-end' : 'flex-start'
      }}>
        <View style={{
          flexDirection: isSent ? 'row-reverse' : 'row',
          maxWidth: '85%',
          alignItems: 'flex-end'
        }}>
          {/* Avatar */}
          {!isSent && (
            <View style={{ marginRight: 8, marginBottom: 4 }}>
              <Image
                source={{ uri: senderAvatar }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: theme.outline + '30'
                }}
              />
            </View>
          )}

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              {/* Message bubble */}
              <View style={{
                backgroundColor: messageColors.background,
                borderRadius: 20,
                borderBottomLeftRadius: isSent ? 20 : 6,
                borderBottomRightRadius: isSent ? 6 : 20,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: messageColors.border,
                shadowColor: theme.onSurface,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3
              }}>
                {/* Sender name for received messages */}
                {!isSent && (
                  <ThemedText 
                    style={{ 
                      color: theme.primary,
                      fontSize: 12,
                      fontWeight: '600',
                      marginBottom: 4
                    }}
                  >
                    {senderName}
                  </ThemedText>
                )}

                {/* Message content */}
                {renderMessageContent()}

                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <View style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    marginTop: 8,
                    marginBottom: -4
                  }}>
                    {message.reactions.map((reaction, index) => (
                      <View
                        key={index}
                        style={{
                          backgroundColor: theme.surface,
                          borderRadius: 12,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          marginRight: 4,
                          marginBottom: 4,
                          borderWidth: 1,
                          borderColor: theme.outline + '20'
                        }}
                      >
                        <Text style={{ fontSize: 14 }}>{reaction.emoji}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Footer */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 6
                }}>
                  <ThemedText 
                    style={{ 
                      color: messageColors.textSecondary,
                      fontSize: 11,
                      fontWeight: '500'
                    }}
                  >
                    {formatTime(message.createdAt)}
                    {message.isEdited && " • modifié"}
                  </ThemedText>
                  
                  {isSent && (
                    <View style={{ marginLeft: 8 }}>
                      <Ionicons
                        name={message.status?.read?.length ? "checkmark-done" : "checkmark"}
                        size={14}
                        color={message.status?.read?.length ? theme.success : messageColors.textSecondary}
                      />
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          </Animated.View>
        </View>
      </View>

      {/* Context Menu Modal */}
      <Modal transparent visible={showContextMenu} animationType="none">
        <Animated.View
          style={{ 
            flex: 1, 
            backgroundColor: 'rgba(0,0,0,0.5)',
            opacity: overlayOpacity
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={hideContextMenu}
            activeOpacity={1}
          >
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 20
            }}>
              <Animated.View
                style={{
                  transform: [{ scale: contextMenuScale }],
                  backgroundColor: theme.surface,
                  borderRadius: 16,
                  padding: 16,
                  minWidth: 280,
                  shadowColor: theme.onSurface,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.25,
                  shadowRadius: 16,
                  elevation: 12
                }}
              >
                {/* Quick Reactions */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginBottom: 16,
                  paddingHorizontal: 8
                }}>
                  {reactionEmojis.slice(0, 6).map((emoji, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleReaction(emoji)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginHorizontal: 4,
                        backgroundColor: theme.surfaceVariant
                      }}
                    >
                      <Text style={{ fontSize: 20 }}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Separator */}
                <View style={{
                  height: 1,
                  backgroundColor: theme.outline + '30',
                  marginBottom: 12
                }} />

                {/* Action buttons */}
                <TouchableOpacity
                  onPress={handleReply}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8
                  }}
                >
                  <Ionicons name="arrow-undo-outline" size={20} color={theme.onSurface} />
                  <ThemedText style={{ marginLeft: 12, fontSize: 16, fontWeight: '500' }}>
                    Répondre
                  </ThemedText>
                </TouchableOpacity>

                {isSent && message.messageType === "text" && (
                  <TouchableOpacity
                    onPress={handleEdit}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8
                    }}
                  >
                    <Ionicons name="create-outline" size={20} color={theme.onSurface} />
                    <ThemedText style={{ marginLeft: 12, fontSize: 16, fontWeight: '500' }}>
                      Modifier
                    </ThemedText>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8
                  }}
                >
                  <Ionicons name="copy-outline" size={20} color={theme.onSurface} />
                  <ThemedText style={{ marginLeft: 12, fontSize: 16, fontWeight: '500' }}>
                    Copier
                  </ThemedText>
                </TouchableOpacity>

                {isSent && (
                  <TouchableOpacity
                    onPress={handleDelete}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color={theme.error} />
                    <ThemedText style={{ 
                      marginLeft: 12, 
                      fontSize: 16, 
                      fontWeight: '500',
                      color: theme.error 
                    }}>
                      Supprimer
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </Animated.View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>

      {/* Edit Modal */}
      <Modal transparent visible={showEditModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View style={{
              backgroundColor: theme.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: 40
            }}>
              <ThemedText style={{ 
                fontSize: 20, 
                fontWeight: '600', 
                marginBottom: 16,
                textAlign: 'center'
              }}>
                Modifier le message
              </ThemedText>
              
              <TextInput
                value={editText}
                onChangeText={setEditText}
                multiline
                style={{
                  backgroundColor: theme.surfaceVariant,
                  borderRadius: 12,
                  padding: 16,
                  color: theme.onSurface,
                  fontSize: 16,
                  minHeight: 100,
                  textAlignVertical: 'top',
                  borderWidth: 1,
                  borderColor: theme.outline + '30'
                }}
                placeholder="Tapez votre message..."
                placeholderTextColor={theme.onSurface + '60'}
              />
              
              <View style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: 20,
                gap: 12
              }}>
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  style={{
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 24,
                    backgroundColor: theme.surfaceVariant
                  }}
                >
                  <ThemedText style={{ fontWeight: '600' }}>Annuler</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => {
                    onEdit?.(editText);
                    setShowEditModal(false);
                  }}
                  style={{
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 24,
                    backgroundColor: theme.primary
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
                    Sauvegarder
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default MessageDisplay;