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
  Vibration,
  TextInput,
  Linking,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { MessageBodyProps } from "@/types/MessageTypes";
import { useTheme } from "@/hooks/themehook";
import { usePrivacy } from "@/components/contexts/privacy/PrivacyContext";
import { getBookingService } from "@/services/api/bookingService";
import { ThemedView } from "@/components/ui/ThemedView";

// Single source of truth for message body typography
const MSG_FONT = { fontSize: 14, lineHeight: 22 } as const;

const MessageDisplay = ({
  message,
  currentUserId,
  isSent: isSentProp,
  onReply,
  onDelete,
  onReact,
  onMarkAsRead,
  onEdit,
}: MessageBodyProps) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [visitActionLoading, setVisitActionLoading] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const contextMenuScale = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const isSent =
    isSentProp !== undefined
      ? isSentProp
      : Boolean(
          message.isSent !== undefined
            ? message.isSent
            : currentUserId &&
              message.senderId &&
              String(message.senderId) === String(currentUserId)
        );

  const { theme } = useTheme();
  const { isReadReceiptsEnabled } = usePrivacy();

  const bubbleBg = isSent ? theme.primary : theme.surface;
  const textColor = isSent ? "#FFFFFF" : theme.onSurface;
  const timestampColor = isSent ? "rgba(255,255,255,0.65)" : theme.outline;

  const reactionEmojis = ["❤️", "😂", "😮", "😢", "😡", "👍"];

  useEffect(() => {
    if (onMarkAsRead && !isSent) {
      onMarkAsRead(message.msgId);
    }
  }, []);

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
      }),
    ]).start(() => {
      setShowContextMenu(false);
    });
  };

  const handleLongPress = () => {
    Vibration.vibrate(50);
    showContextMenuAnimated();
  };

  const handleReaction = (emoji: string) => {
    onReact?.(message.msgId, emoji);
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
      "Voulez-vous vraiment supprimer ce message ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => onDelete?.(message.msgId),
        },
      ]
    );
  };

  const handleEdit = () => {
    hideContextMenu();
    setShowEditModal(true);
  };

  const handleReply = () => {
    hideContextMenu();
    onReply?.(message);
  };

  const handleAcceptVisit = async () => {
    if (!message.visitData?.id) {
      Alert.alert("Erreur", "Données de visite manquantes");
      return;
    }
    setVisitActionLoading(true);
    try {
      const bookingService = getBookingService();
      await bookingService.respondToVisitRequest(
        message.visitData.id,
        currentUserId,
        true
      );
      Alert.alert("Visite acceptée", "La demande de visite a été acceptée.");
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Une erreur est survenue");
    } finally {
      setVisitActionLoading(false);
    }
  };

  const handleRejectVisit = async () => {
    if (!message.visitData?.id) {
      Alert.alert("Erreur", "Données de visite manquantes");
      return;
    }
    Alert.alert(
      "Refuser la visite",
      "Voulez-vous refuser cette demande de visite ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Refuser",
          style: "destructive",
          onPress: async () => {
            setVisitActionLoading(true);
            try {
              const bookingService = getBookingService();
              await bookingService.respondToVisitRequest(
                message.visitData!.id,
                currentUserId,
                false,
                "Créneau non disponible"
              );
              Alert.alert(
                "Visite refusée",
                "La demande de visite a été refusée."
              );
            } catch (error: any) {
              Alert.alert("Erreur", error.message || "Une erreur est survenue");
            } finally {
              setVisitActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const parseTextWithLinks = (text: string) => {
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const parts: { type: "text" | "link"; content: string; key: string }[] =
      [];
    let lastIndex = 0;
    const matches = Array.from(text.matchAll(linkRegex));

    matches.forEach((match, i) => {
      if (match.index! > lastIndex) {
        parts.push({
          type: "text",
          content: text.slice(lastIndex, match.index),
          key: `text-${i}`,
        });
      }
      parts.push({ type: "link", content: match[0], key: `link-${i}` });
      lastIndex = match.index! + match[0].length;
    });

    if (lastIndex < text.length) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex),
        key: "text-end",
      });
    }

    return parts.length > 0
      ? parts
      : [{ type: "text" as const, content: text, key: "text-only" }];
  };

  const renderMessageContent = () => {
    switch (message.messageType) {
      case "text": {
        const parts = parseTextWithLinks(message.content);
        return (
          <Text style={[MSG_FONT, { color: textColor }]}>
            {parts.map((part) =>
              part.type === "link" ? (
                <Text
                  key={part.key}
                  style={[
                    MSG_FONT,
                    {
                      color: isSent ? "rgba(255,255,255,0.85)" : theme.primary,
                      textDecorationLine: "underline",
                    },
                  ]}
                  onPress={() => Linking.openURL(part.content)}
                >
                  {part.content}
                </Text>
              ) : (
                <Text key={part.key} style={[MSG_FONT, { color: textColor }]}>
                  {part.content}
                </Text>
              )
            )}
          </Text>
        );
      }

      case "image":
        return (
          <View
            style={{ borderRadius: 12, overflow: "hidden", marginBottom: 4 }}
          >
            <Image
              source={{ uri: message.content }}
              style={{ width: 200, height: 150, borderRadius: 12 }}
              resizeMode="cover"
            />
          </View>
        );

      case "video":
        return (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isSent
                ? "rgba(255,255,255,0.15)"
                : "rgba(0,0,0,0.06)",
              borderRadius: 10,
              padding: 10,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: isSent
                  ? "rgba(255,255,255,0.25)"
                  : "rgba(0,0,0,0.1)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="play"
                size={18}
                color={isSent ? "#FFFFFF" : "#374151"}
              />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text
                style={[MSG_FONT, { color: textColor, fontWeight: "600" }]}
              >
                Vidéo
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  lineHeight: 16,
                  color: isSent ? "rgba(255,255,255,0.65)" : "#6B7280",
                  marginTop: 1,
                }}
              >
                Appuyer pour lire
              </Text>
            </View>
          </View>
        );

      case "visit_request": {
        const visitStatus = message.visitData?.status;
        const statusColors: Record<string, { bg: string; text: string }> = {
          pending: { bg: "#F59E0B20", text: "#F59E0B" },
          confirmed: { bg: "#10B98120", text: "#10B981" },
          completed: { bg: "#6366F120", text: "#6366F1" },
          cancelled: { bg: "#EF444420", text: "#EF4444" },
        };
        const statusLabels: Record<string, string> = {
          pending: "En attente",
          confirmed: "Confirmée",
          completed: "Terminée",
          cancelled: "Annulée",
        };
        const statusStyle =
          visitStatus && statusColors[visitStatus]
            ? statusColors[visitStatus]
            : { bg: "#9CA3AF20", text: "#9CA3AF" };

        return (
          <View style={{ paddingTop: 2 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
                gap: 6,
              }}
            >
              <Ionicons
                name="calendar"
                size={16}
                color={isSent ? "rgba(255,255,255,0.85)" : "#6366F1"}
              />
              <Text
                style={[
                  MSG_FONT,
                  { color: textColor, fontWeight: "700" },
                ]}
              >
                Demande de visite
              </Text>
            </View>
            <Text style={[MSG_FONT, { color: textColor }]}>
              {message.content || "Demande de visite"}
            </Text>
            {visitStatus && (
              <View
                style={{
                  marginTop: 8,
                  alignSelf: "flex-start",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 10,
                  backgroundColor: statusStyle.bg,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: statusStyle.text,
                  }}
                >
                  {statusLabels[visitStatus] ?? visitStatus}
                </Text>
              </View>
            )}
            {message.visitData && !isSent && visitStatus === "pending" && (
              <View
                style={{ flexDirection: "row", gap: 8, marginTop: 10 }}
              >
                <TouchableOpacity
                  onPress={handleAcceptVisit}
                  disabled={visitActionLoading}
                  style={{
                    flex: 1,
                    backgroundColor: theme.success,
                    paddingVertical: 8,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontWeight: "600",
                      fontSize: 13,
                    }}
                  >
                    Accepter
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleRejectVisit}
                  disabled={visitActionLoading}
                  style={{
                    flex: 1,
                    backgroundColor: theme.error,
                    paddingVertical: 8,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontWeight: "600",
                      fontSize: 13,
                    }}
                  >
                    Refuser
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      }

      case "reservation_request": {
        const resStatus = message.visitData?.status;
        const resStatusColors: Record<string, { bg: string; text: string }> = {
          pending: { bg: "#F59E0B20", text: "#F59E0B" },
          confirmed: { bg: "#10B98120", text: "#10B981" },
          completed: { bg: "#6366F120", text: "#6366F1" },
          cancelled: { bg: "#EF444420", text: "#EF4444" },
        };
        const resStatusLabels: Record<string, string> = {
          pending: "En attente",
          confirmed: "Confirmée",
          completed: "Terminée",
          cancelled: "Annulée",
        };
        const resStyle =
          resStatus && resStatusColors[resStatus]
            ? resStatusColors[resStatus]
            : { bg: "#9CA3AF20", text: "#9CA3AF" };

        return (
          <View style={{ paddingTop: 2 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
                gap: 6,
              }}
            >
              <Ionicons
                name="home"
                size={16}
                color={isSent ? "rgba(255,255,255,0.85)" : theme.primary}
              />
              <Text
                style={[
                  MSG_FONT,
                  { color: textColor, fontWeight: "700" },
                ]}
              >
                Demande de réservation
              </Text>
            </View>
            <Text style={[MSG_FONT, { color: textColor }]}>
              {message.content || "Demande de réservation"}
            </Text>
            {resStatus && (
              <View
                style={{
                  marginTop: 8,
                  alignSelf: "flex-start",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 10,
                  backgroundColor: resStyle.bg,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: resStyle.text,
                  }}
                >
                  {resStatusLabels[resStatus] ?? resStatus}
                </Text>
              </View>
            )}
          </View>
        );
      }

      default:
        return (
          <Text style={[MSG_FONT, { color: textColor }]}>
            {message.content}
          </Text>
        );
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isRead =
    message.status.read.length > 0 && isReadReceiptsEnabled();

  return (
    <>
      <Pressable
        onLongPress={handleLongPress}
        delayLongPress={150}
        onPressIn={() => {
          Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver: true,
          }).start();
        }}
        onPressOut={() => {
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            flexDirection: "row",
            justifyContent: isSent ? "flex-end" : "flex-start",
            paddingHorizontal: 14,
            paddingVertical: 2,
          }}
        >
          <View
            style={{
              maxWidth: "80%",
              backgroundColor: bubbleBg,
              borderRadius: 20,
              borderTopLeftRadius: isSent ? 20 : 6,
              borderTopRightRadius: isSent ? 6 : 20,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            {renderMessageContent()}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                marginTop: 2,
                gap: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  lineHeight: 14,
                  color: timestampColor,
                }}
              >
                {formatTime(message.createdAt)}
                {message.isEdited ? " · modifié" : ""}
              </Text>
              {isSent && (
                <Ionicons
                  name={isRead ? "checkmark-done" : "checkmark"}
                  size={14}
                  color={isRead ? "#60A5FA" : "rgba(255,255,255,0.65)"}
                />
              )}
            </View>

            {message.reactions && message.reactions.length > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginTop: 6,
                  gap: 4,
                }}
              >
                {message.reactions.map((reaction, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleReaction(reaction.emoji)}
                    style={{
                      backgroundColor: isSent
                        ? "rgba(255,255,255,0.2)"
                        : "#E5E7EB",
                      borderRadius: 12,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 12 }}>{reaction.emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      </Pressable>

      {/* Context Menu Modal */}
      <Modal transparent visible={showContextMenu} animationType="none">
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            opacity: overlayOpacity,
          }}
        >
          <TouchableOpacity
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
            onPress={hideContextMenu}
            activeOpacity={1}
          >
            <Animated.View
              style={{
                transform: [{ scale: contextMenuScale }],
                borderRadius: 16,
                overflow: "hidden",
                minWidth: 240,
                backgroundColor: "#FFFFFF",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
                elevation: 12,
              }}
            >
              {/* Quick reactions row */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: "#F3F4F6",
                }}
              >
                {reactionEmojis.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleReaction(emoji)}
                    style={{
                      padding: 6,
                      borderRadius: 20,
                      marginHorizontal: 2,
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Reply */}
              <TouchableOpacity
                onPress={handleReply}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 13,
                }}
              >
                <Ionicons name="arrow-undo-outline" size={20} color="#374151" />
                <Text
                  style={{
                    marginLeft: 12,
                    color: "#374151",
                    fontSize: 15,
                    fontWeight: "500",
                  }}
                >
                  Répondre
                </Text>
              </TouchableOpacity>

              {/* Copy */}
              <TouchableOpacity
                onPress={handleCopy}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 13,
                }}
              >
                <Ionicons name="copy-outline" size={20} color="#374151" />
                <Text
                  style={{
                    marginLeft: 12,
                    color: "#374151",
                    fontSize: 15,
                    fontWeight: "500",
                  }}
                >
                  Copier
                </Text>
              </TouchableOpacity>

              {/* Edit — only for own text messages */}
              {isSent && message.messageType === "text" && (
                <TouchableOpacity
                  onPress={handleEdit}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 13,
                  }}
                >
                  <Ionicons name="create-outline" size={20} color="#374151" />
                  <Text
                    style={{
                      marginLeft: 12,
                      color: "#374151",
                      fontSize: 15,
                      fontWeight: "500",
                    }}
                  >
                    Modifier
                  </Text>
                </TouchableOpacity>
              )}

              {/* Delete — only for own messages */}
              {isSent && (
                <TouchableOpacity
                  onPress={handleDelete}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 13,
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  <Text
                    style={{
                      marginLeft: 12,
                      color: "#EF4444",
                      fontSize: 15,
                      fontWeight: "500",
                    }}
                  >
                    Supprimer
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>

      {/* Edit Modal */}
      <Modal transparent visible={showEditModal} animationType="slide">
        <ThemedView style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
          <ThemedView style={{ flex: 1, justifyContent: "flex-end" }}>
            <ThemedView
              style={{
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 20,
                paddingBottom: 40,
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                Modifier le message
              </Text>

              <TextInput
                value={editText}
                onChangeText={setEditText}
                multiline
                style={{
                  backgroundColor: "#F3F4F6",
                  borderRadius: 12,
                  padding: 14,
                  color: "#111827",
                  fontSize: 15,
                  lineHeight: 22,
                  minHeight: 100,
                  textAlignVertical: "top",
                }}
                placeholder="Écrire un message..."
                placeholderTextColor="#9CA3AF"
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 16,
                  gap: 12,
                }}
              >
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  style={{
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 24,
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                  }}
                >
                  <Text
                    style={{
                      color: "#374151",
                      fontWeight: "600",
                      fontSize: 15,
                    }}
                  >
                    Annuler
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    onEdit?.(message.msgId, editText);
                    setShowEditModal(false);
                  }}
                  style={{
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 24,
                    backgroundColor: theme.primary,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontWeight: "600",
                      fontSize: 15,
                    }}
                  >
                    Enregistrer
                  </Text>
                </TouchableOpacity>
              </View>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>
    </>
  );
};

export default MessageDisplay;
