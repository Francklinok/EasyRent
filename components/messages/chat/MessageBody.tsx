import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  Pressable,
  Modal,
  Animated,
  Alert,
  Dimensions,
  Vibration,
  TextInput,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Video } from "expo-av";
import { Audio } from "expo-av";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { MessageBodyProps } from "@/types/MessageTypes";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { useTheme } from "@/components/contexts/theme/themehook";


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
  const [showReactions, setShowReactions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  
  // const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const contextMenuScale = useRef(new Animated.Value(0)).current;
  const contextMenuOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(1)).current;

  const isSent = message.senderId === currentUserId;
  const senderAvatar = message.sender?.avatar || `https://i.pravatar.cc/150?u=${message.senderId}`;
  const senderName = message.sender?.name || message.senderId;
  const  {theme} = useTheme()

  // Discord-like colors
  const messageColors = isSent 
    ? {
        background: theme.primary,
        backgroundSecondary: '#4752c4',
        text:  theme.text,
        textSecondary: 'rgba(255,255,255,0.8)',
        border: theme.outline
      }
    : {
        background: theme.surfaceVariant,
        backgroundSecondary: '#2f3136',
        text: theme.text,
        textSecondary: '#b9bbbe',
        border: theme.outline
      };

  const reactionEmojis = [
    { emoji: '👍', name: 'like' },
    { emoji: '❤️', name: 'love' },
    { emoji: '😂', name: 'laugh' },
    { emoji: '😮', name: 'wow' },
    { emoji: '😢', name: 'sad' },
    { emoji: '😡', name: 'angry' },
    { emoji: '🔥', name: 'fire' },
    { emoji: '👀', name: 'eyes' }
  ];

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();

    // Démarrer le timer pour l'appui prolongé
    longPressTimer.current = setTimeout(() => {
      if (isPressed) {
        Vibration.vibrate(50);
        showContextMenuAnimated();
      }
    }, 800); // 800ms d'appui
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
      }),
      Animated.timing(contextMenuOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(messageOpacity, {
        toValue: 0.7,
        duration: 200,
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
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(contextMenuOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowContextMenu(false);
    });
  };

  const handleReaction = (emoji: string) => {
    onReact?.(message.msgId, emoji);
    hideContextMenu();
    
    // Animation de feedback
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.1,
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
            onPress: () => onDelete?.(message.msgId)
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
    onReply?.(message);
  };

  const playAudio = async () => {
    try {
      if (isPlaying && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        const newSound = new Audio.Sound();
        await newSound.loadAsync({ uri: message.content });
        await newSound.playAsync();
        setSound(newSound);
        setIsPlaying(true);
        
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors de la lecture audio:', error);
    }
  };

  const renderMessageContent = () => {
    switch (message.messageType) {
      case "text":
        return (
          <ThemedText 
            style={{ color: messageColors.text }}
          >
            {message.content}
          </ThemedText>
        );

      case "image":
        return (
          <ThemedView className="mt-1 rounded-lg overflow-hidden">
            <Image
              source={{ uri: message.content }}
              className="w-72 h-48"
              resizeMode="cover"
            />
            <ThemedView className="absolute top-2 right-2  rounded-full p-1">
              <Ionicons name="expand" size={16} color="white" />
            </ThemedView>
          </ThemedView>
        );

      case "video":
        return (
          <View className="mt-2 rounded-lg overflow-hidden">
            <Video
              source={{ uri: message.content }}
              style={{ width: 280, height: 180 }}
              useNativeControls
              // resizeMode="cover"
            />
          </View>
        );

      case "audio":
        return (
          <TouchableOpacity
            onPress={playAudio}
            className="mt-2 flex-row items-center rounded-lg px-3 py-3"
            style={{ backgroundColor: messageColors.backgroundSecondary }}
          >
            <View 
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: isSent ? 'rgba(255,255,255,0.2)' : '#5865f2' }}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={18}
                color="white"
              />
            </View>
            <View className="flex-1">
              <Text style={{ color: messageColors.text }} className="font-medium">
                Message vocal
              </Text>
              <Text style={{ color: messageColors.textSecondary }} className="text-xs">
                {isPlaying ? "En cours de lecture..." : "Cliquer pour écouter"}
              </Text>
            </View>
            <View className="flex-row space-x-1">
              {[...Array(4)].map((_, i) => (
                <View
                  key={i}
                  className="w-1 rounded-full"
                  style={{
                    height: Math.random() * 20 + 8,
                    backgroundColor: messageColors.textSecondary,
                  }}
                />
              ))}
            </View>
          </TouchableOpacity>
        );

      case "document":
        return (
          <TouchableOpacity
            onPress={() => Linking.openURL(message.content)}
            className="mt-2 flex-row items-center rounded-lg px-3 py-3"
            style={{ backgroundColor: messageColors.backgroundSecondary }}
          >
            <View 
              className="w-10 h-10 rounded-lg items-center justify-center mr-3"
              style={{ backgroundColor: '#5865f2' }}
            >
              <Ionicons name="document-text" size={18} color="white" />
            </View>
            <View className="flex-1">
              <Text style={{ color: messageColors.text }} className="font-medium">
                Document.pdf
              </Text>
              <Text style={{ color: messageColors.textSecondary }} className="text-xs">
                Cliquer pour ouvrir
              </Text>
            </View>
            <Ionicons name="download-outline" size={18} color={messageColors.textSecondary} />
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Animated.View 
        style={{ opacity: messageOpacity }}
        className={`mb-1 px-3 ${isSent ? "items-end" : "items-start"}`}
      >
        <ThemedView className={`flex-row max-w-[8 0%] ${isSent ? "flex-row-reverse" : "flex-row"}`}>
          {/* Avatar */}
          {!isSent && (
            <Image
              source={{ uri: senderAvatar }}
              className="w-6 h-6 rounded-full mr-3 mt-1"
            />
          )}

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              className="group"
            >
              {/* Message bubble */}
              <ThemedView
                className={`px-2 py-2 rounded-2xl ${
                  isSent ? "rounded-br-md" : "rounded-bl-md"
                }`}
                style={{
                  backgroundColor: messageColors.background,
                  borderColor: messageColors.border,
                  borderWidth: 1,
                }}
              >
                {/* Sender name for received messages */}
                {!isSent && (
                  <ThemedText 
 
                    className=" mb-1" 
                    style={{ color: theme.success }}
                  >
                    {senderName}
                  </ThemedText>
                )}

                {/* Message content */}
                {renderMessageContent()}

                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <ThemedView className="flex-row flex-wrap mt-3 -mb-1">
                    {message.reactions.map((reaction, index) => (
                      <ThemedView
                        key={index}
                        className="rounded-full px-2 py-1 mr-1 mb-1 flex-row items-center"
                        style={{ backgroundColor: messageColors.backgroundSecondary }}
                      >
                        <ThemedText >{reaction.emoji}</ThemedText>
                        {/* <Text 
                          className="text-xs ml-1 font-medium" 
                          style={{ color: messageColors.textSecondary }}
                        >
                          {reaction.count}
                        </Text> */}
                      </ThemedView>
                    ))}
                  </ThemedView>
                )}

                {/* Footer */}
                <View  className="flex-row justify-between items-center mt-1">
                  <ThemedText 
                    style={{ color: messageColors.textSecondary }}
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    {message.isEdited && " • modifié"}
                  </ThemedText>
                  
                  {isSent && (
                    <Ionicons
                      name={message.status?.read?.length ? "checkmark-done" : "checkmark"}
                      size={14}
                      color={message.status?.read?.length ? theme.success : messageColors.textSecondary}
                    />
                  )}
                </View>
              </ThemedView>
            </Pressable>
          </Animated.View>

          {/* Avatar for sent messages */}
          {/* {isSent && (
            <Image
              source={{ uri: senderAvatar }}
              className="w-10 h-10 rounded-full ml-3 mt-1"
            />
          )} */}
        </ThemedView>
      </Animated.View>

      {/* Context Menu Overlay */}
      <Modal transparent visible={showContextMenu} animationType="none">
        <Animated.View
          style={{ 
            flex: 1, 
            backgroundColor: 'rgba(0,0,0,0.6)',
            opacity: overlayOpacity
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={hideContextMenu}
            className="justify-center items-center"
          >
            <Animated.View
              style={{
                transform: [{ scale: contextMenuScale }],
                opacity: contextMenuOpacity,
              }}
              className=" rounded-xl p-2 mx-4  min-w-[200px]"
            >
              {/* Quick Reactions */}
              <ThemedView className="flex-row justify-center mb-3 px-2">
                {reactionEmojis.slice(0, 6).map((reaction, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleReaction(reaction.emoji)}
                    className="w-10 h-10 rounded-full items-center justify-center mx-1 active:bg-[#5865f2]"
                  >
                    <ThemedText >{reaction.emoji}</ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>

              {/* Separator */}
              <ThemedView className="h-[1px]  mb-2" />

              {/* Action buttons */}
              <TouchableOpacity
                onPress={handleReply}
                className="flex-row items-center px-3 py-2 rounded-lg"
              >
                <Ionicons name="arrow-undo-outline" size={18} color="#b9bbbe" />
                <ThemedText className="ml-3 ">Répondre</ThemedText>
              </TouchableOpacity>

              {isSent && message.messageType === "text" && (
                <TouchableOpacity
                  onPress={handleEdit}
                  className="flex-row items-center px-3 py-2 rounded-lg active:bg-[#40444b]"
                >
                  <Ionicons name="create-outline" size={18} color="#b9bbbe" />
                  <ThemedText className="ml-3">Modifier</ThemedText>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => {/* Copy functionality */}}
                className="flex-row items-center px-3 py-2 rounded-lg active:bg-[#40444b]"
              >
                <Ionicons name="copy-outline" size={18} color="#b9bbbe" />
                <ThemedText className="ml-3 text-[#dcddde] font-medium">Copier</ThemedText>
              </TouchableOpacity>

              {isSent && (
                <TouchableOpacity
                  onPress={handleDelete}
                  className="flex-row items-center px-3 py-2 rounded-lg active:bg-[#40444b]"
                >
                  <Ionicons name="trash-outline" size={18} color={theme.error} />
                  <ThemedText className="ml-3 ">Supprimer</ThemedText>
                </TouchableOpacity>
              )}
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>

      {/* Edit Modal */}
      <Modal transparent visible={showEditModal} animationType="slide">
        <ThemedView className="flex-1 justify-end">
          <ThemedView className=" rounded-t-3xl p-6">
            <ThemedText className=" mb-4">Modifier le message</ThemedText>
            <TextInput
              value={editText}
              onChangeText={setEditText}
              multiline
              className="border border-[#40444b] rounded-lg p-4 text-[#dcddde] mb-4 min-h-[100px]"
              placeholder="Tapez votre message..."
              placeholderTextColor="#72767d"
              style={{ backgroundColor: '#40444b' }}
            />
            <ThemedView className="flex-row justify-end space-x-3">
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                className="px-6 py-3 rounded-full bg-[#40444b]"
              >
                <Text className="font-medium text-[#dcddde]">Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  onEdit?.(message.msgId, editText);
                  setShowEditModal(false);
                }}
                className="px-6 py-3 rounded-full bg-[#5865f2]"
              >
                <ThemedText>Sauvegarder</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>
    </>
  );
};

export default MessageDisplay;