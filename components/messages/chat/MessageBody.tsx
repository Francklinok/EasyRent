import React, { useState, useRef, useEffect } from "react";
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
  Linking,
  Clipboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
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
  const [showActions, setShowActions] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const contextMenuScale = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const actionsOpacity = useRef(new Animated.Value(0)).current;

  const isSent = message.senderId === currentUserId;
  const senderAvatar = message.sender?.avatar || `https://ui-avatars.com/api/?name=${message.sender?.name || 'User'}&background=random`;
  const senderName = message.sender?.name || 'Unknown';
  const { theme } = useTheme();

  const colors = {
    primary: '#1DA1F2',
    primaryHover: '#1A91DA',
    background: theme.surface,
    backgroundHover: theme.surfaceVariant + '30',
    text: theme.onSurface,
    textSecondary: theme.onSurface + '70',
    textMuted: theme.onSurface + '50',
    border: theme.outline + '20',
    like: '#F91880',
    retweet: '#17BF63',
    verified: '#1DA1F2',
    link: '#1DA1F2'
  };

  const reactionEmojis = ['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🔥'];

  useEffect(() => {
    if (onMarkAsRead && !isSent) {
      onMarkAsRead();
    }
  }, []);

  const handleLongPress = () => {
    Vibration.vibrate(50);
    showContextMenuAnimated();
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

  const showActionsAnimated = () => {
    setShowActions(true);
    Animated.timing(actionsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hideActions = () => {
    Animated.timing(actionsOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setShowActions(false);
    });
  };

  const handleReaction = (emoji: string) => {
    onReact?.(emoji);
    hideContextMenu();
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(message.content);
    hideContextMenu();
    Alert.alert("Copié", "Message copié dans le presse-papiers");
  };

  const handleDelete = () => {
    hideContextMenu();
    Alert.alert(
      "Supprimer le message",
      "Êtes-vous sûr de vouloir supprimer ce message ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: () => onDelete?.() }
      ]
    );
  };

  const handleEdit = () => {
    hideContextMenu();
    setShowEditModal(true);
  };

  const handleReply = () => {
    hideContextMenu();
    onReply?.();
  };

  const parseTextContent = (text: string) => {
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const mentionRegex = /@(\w+)/g;
    const hashtagRegex = /#(\w+)/g;
    
    const parts = [];
    let lastIndex = 0;

    const allMatches = [
      ...Array.from(text.matchAll(linkRegex)).map(m => ({ ...m, type: 'link' })),
      ...Array.from(text.matchAll(mentionRegex)).map(m => ({ ...m, type: 'mention' })),
      ...Array.from(text.matchAll(hashtagRegex)).map(m => ({ ...m, type: 'hashtag' })),
    ].sort((a, b) => a.index! - b.index!);

    allMatches.forEach((match, i) => {
      if (match.index! > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
          key: `text-${i}`
        });
      }

      parts.push({
        type: match.type,
        content: match[0],
        key: `${match.type}-${i}`
      });

      lastIndex = match.index! + match[0].length;
    });

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex),
        key: 'text-end'
      });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content: text, key: 'text-only' }];
  };

  const renderTextPart = (part: any) => {
    switch (part.type) {
      case 'link':
        return (
          <ThemedText
            key={part.key}
            style={{ color: colors.link, textDecorationLine: 'underline' }}
            onPress={() => Linking.openURL(part.content)}
          >
            {part.content}
          </ThemedText>
        );
      case 'mention':
        return (
          <ThemedText
            key={part.key}
            style={{ color: colors.primary, fontWeight: '500' }}
          >
            {part.content}
          </ThemedText>
        );
      case 'hashtag':
        return (
          <ThemedText
            key={part.key}
            style={{ color: colors.primary, fontWeight: '500' }}
          >
            {part.content}
          </ThemedText>
        );
      default:
        return (
          <ThemedText key={part.key} style={{ color: colors.text }}>
            {part.content}
          </ThemedText>
        );
    }
  };

  const renderMessageContent = () => {
    switch (message.messageType) {
      case "text":
        const textParts = parseTextContent(message.content);
        return (
          <ThemedText style={{ fontSize: 15, lineHeight: 20, marginTop: 2 }}>
            {textParts.map(renderTextPart)}
          </ThemedText>
        );

      case "image":
        return (
          <View style={{ 
            marginTop: 12, 
            borderRadius: 16, 
            overflow: 'hidden', 
            borderWidth: 1,
            borderColor: colors.border
          }}>
            <Image
              source={{ uri: message.content }}
              style={{ 
                width: '100%', 
                height: 200, 
                borderRadius: 16 
              }}
              resizeMode="cover"
            />
          </View>
        );

      case "video":
        return (
          <ThemedView style={{
            marginTop: 12,
            borderRadius: 16,
            backgroundColor: colors.backgroundHover,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border
          }}>
            <ThemedView style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Ionicons name="play" size={20} color="white" />
            </ThemedView>
            <ThemedView style={{ marginLeft: 12, flex: 1 }}>
              <ThemedText style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>
                Vidéo
              </ThemedText>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 13 }}>
                Cliquer pour lire
              </ThemedText>
            </ThemedView>
          </ThemedView>
        );

      default:
        return (
          <ThemedText style={{ color: colors.text, fontSize: 15, lineHeight: 20 }}>
            {message.content}
          </ThemedText>
        );
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 1) return "maintenant";
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getVerifiedBadge = () => {
    if (message.isBot) {
      return (
        <Ionicons 
          name="checkmark-circle" 
          size={16} 
          color={colors.verified} 
          style={{ marginLeft: 4 }}
        />
      );
    }
    return null;
  };

  return (
    <>
      <Pressable
        onLongPress={handleLongPress}
        onPressIn={() => {
          Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver: true,
          }).start();
          showActionsAnimated();
        }}
        onPressOut={() => {
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
          setTimeout(hideActions, 2000);
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            backgroundColor: colors.background,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.border
          }}
        >
          <ThemedView style={{ flexDirection: 'row' }}>
            {/* Avatar */}
            <TouchableOpacity style={{ marginRight: 12 }}>
              <Image
                source={{ uri: senderAvatar }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 24
                }}
              />
            </TouchableOpacity>

            {/* Content */}
            <ThemedView style={{ flex: 1, minWidth: 0 }}>
              {/* Header */}
              <ThemedView style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginBottom: 2,
                flexWrap: 'wrap'
              }}>
                <ThemedText style={{
                  color: colors.text,
                  fontWeight: '700',
                  fontSize: 15,
                  marginRight: 4
                }}>
                  {senderName}
                </ThemedText>
                {getVerifiedBadge()}
                <ThemedText style={{
                  color: colors.textSecondary,
                  fontSize: 15,
                  marginLeft: 4
                }}>
                  @{senderName.toLowerCase().replace(' ', '')}
                </ThemedText>
                <ThemedText style={{
                  color: colors.textMuted,
                  fontSize: 15,
                  marginLeft: 4
                }}>
                  · {formatTime(message.createdAt)}
                  {message.isEdited && " · modifié"}
                </ThemedText>
              </ThemedView>

              {/* Message Content */}
              <ThemedView style={{ marginBottom: 8 }}>
                {renderMessageContent()}
              </ThemedView>

              {/* Reactions */}
              {message.reactions && message.reactions.length > 0 && (
                <ThemedView style={{ 
                  flexDirection: 'row', 
                  flexWrap: 'wrap', 
                  marginBottom: 8 
                }}>
                  {message.reactions.map((reaction, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleReaction(reaction.emoji)}
                      style={{
                        backgroundColor: colors.backgroundHover,
                        borderRadius: 16,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        marginRight: 6,
                        marginBottom: 4,
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: colors.border
                      }}
                    >
                      <Text style={{ fontSize: 14, marginRight: 4 }}>
                        {reaction.emoji}
                      </Text>
                      <ThemedText style={{ 
                        color: colors.textSecondary, 
                        fontSize: 12, 
                        fontWeight: '500' 
                      }}>
                        1
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ThemedView>
              )}

              {/*  Action Bar */}
              
              {/* <Animated.View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 4,
                  opacity: showActions ? actionsOpacity : 0.7,
                  maxWidth: 425
                }}
              >
                <TouchableOpacity
                  onPress={handleReply}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 8,
                    borderRadius: 20,
                    minWidth: 60
                  }}
                >
                  <Ionicons 
                    name="chatbubble-outline" 
                    size={18} 
                    color={colors.textMuted} 
                  />
                  <ThemedText style={{ 
                    color: colors.textMuted, 
                    fontSize: 13, 
                    marginLeft: 4,
                    fontWeight: '500'
                  }}>
                    {Math.floor(Math.random() * 10)}
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 8,
                    borderRadius: 20,
                    minWidth: 60
                  }}
                >
                  <Ionicons 
                    name="repeat-outline" 
                    size={18} 
                    color={colors.textMuted} 
                  />
                  <Text style={{ 
                    color: colors.textMuted, 
                    fontSize: 13, 
                    marginLeft: 4,
                    fontWeight: '500'
                  }}>
                    {Math.floor(Math.random() * 20)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleReaction('❤️')}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 8,
                    borderRadius: 20,
                    minWidth: 60
                  }}
                >
                  <Ionicons 
                    name={message.reactions?.some(r => r.emoji === '❤️') ? "heart" : "heart-outline"}
                    size={18} 
                    color={message.reactions?.some(r => r.emoji === '❤️') ? colors.like : colors.textMuted}
                  />
                  <ThemedText style={{ 
                    color: message.reactions?.some(r => r.emoji === '❤️') ? colors.like : colors.textMuted,
                    fontSize: 13, 
                    marginLeft: 4,
                    fontWeight: '500'
                  }}>
                    {Math.floor(Math.random() * 50)}
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowContextMenu(true)}
                  style={{
                    padding: 8,
                    borderRadius: 20
                  }}
                >
                  <Ionicons 
                    name="share-outline" 
                    size={18} 
                    color={colors.textMuted} 
                  />
                </TouchableOpacity>
              </Animated.View> */}


            </ThemedView>
          </ThemedView>
        </Animated.View>
      </Pressable>

      {/* Context Menu */}
      <Modal transparent visible={showContextMenu} animationType="none">
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            opacity: overlayOpacity
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={hideContextMenu}
            activeOpacity={1}
          >
            <ThemedView style={{ 
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
                  padding: 8,
                  minWidth: 240,
                  shadowColor: theme.onSurface,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.25,
                  shadowRadius: 16,
                  elevation: 12
                }}
              >
                {/* Quick Reactions */}
                <ThemedView style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  marginBottom: 8
                }}>
                  {reactionEmojis.slice(0, 6).map((emoji, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleReaction(emoji)}
                      style={{
                        padding: 8,
                        borderRadius: 20,
                        marginHorizontal: 4
                      }}
                    >
                      <Text style={{ fontSize: 20 }}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </ThemedView>

                <TouchableOpacity
                  onPress={handleReply}
                  style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    padding: 16, 
                    borderRadius: 8 
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
                  <ThemedText style={{ 
                    marginLeft: 12, 
                    color: colors.text, 
                    fontSize: 16,
                    fontWeight: '500'
                  }}>
                    Répondre
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCopy}
                  style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    padding: 16, 
                    borderRadius: 8 
                  }}
                >
                  <Ionicons name="copy-outline" size={20} color={colors.text} />
                  <ThemedText style={{ 
                    marginLeft: 12, 
                    color: colors.text, 
                    fontSize: 16,
                    fontWeight: '500'
                  }}>
                    Copier le message
                  </ThemedText>
                </TouchableOpacity>

                {isSent && message.messageType === "text" && (
                  <TouchableOpacity
                    onPress={handleEdit}
                    style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      padding: 16, 
                      borderRadius: 8 
                    }}
                  >
                    <Ionicons name="create-outline" size={20} color={colors.text} />
                    <ThemedText style={{ 
                      marginLeft: 12, 
                      color: colors.text, 
                      fontSize: 16,
                      fontWeight: '500'
                    }}>
                      Modifier
                    </ThemedText>
                  </TouchableOpacity>
                )}

                {isSent && (
                  <TouchableOpacity
                    onPress={handleDelete}
                    style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      padding: 16, 
                      borderRadius: 8 
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#F91880" />
                    <ThemedText style={{ 
                      marginLeft: 12, 
                      color: "#F91880", 
                      fontSize: 16,
                      fontWeight: '500'
                    }}>
                      Supprimer
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </Animated.View>
            </ThemedView>
          </TouchableOpacity>
        </Animated.View>
      </Modal>

      {/* Edit Modal */}
      <Modal transparent visible={showEditModal} animationType="slide">
        <ThemedView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <ThemedView style={{ flex: 1, justifyContent: 'flex-end' }}>
            <ThemedView style={{
              backgroundColor: theme.surface,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              paddingBottom: 40
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 20,
                textAlign: 'center'
              }}>
                Modifier le message
              </Text>

              <TextInput
                value={editText}
                onChangeText={setEditText}
                multiline
                style={{
                  backgroundColor: colors.backgroundHover,
                  borderRadius: 12,
                  padding: 14,
                  color: colors.text,
                  fontSize: 14,
                  minHeight: 120,
                  textAlignVertical: 'top',
                  borderWidth: 1,
                  borderColor: colors.primary + '20'
                }}
                placeholder="Que se passe-t-il ?"
                placeholderTextColor={colors.textMuted}
              />

              <ThemedView style={{ 
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
                    borderRadius: 25,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                >
                  <Text style={{ 
                    color: colors.text, 
                    fontWeight: '700',
                    fontSize: 15
                  }}>
                    Annuler
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    onEdit?.(editText);
                    setShowEditModal(false);
                  }}
                  style={{
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 25,
                    backgroundColor: colors.primary
                  }}
                >
                  <ThemedText style={{ 
                    color: 'white', 
                    fontWeight: '700',
                    fontSize: 15
                  }}>
                    Sauvegarder
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>
    </>
  );
};

export default MessageDisplay;