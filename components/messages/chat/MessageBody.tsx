import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Video } from "expo-av";
import { Audio } from "expo-av";
import * as Linking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";
import { MessageDisplayProps } from "@/types/MessageTypes";

const MessageDisplay = ({
  message,
  currentUserId,
  onReply,
  onDelete,
  onReact,
  onMarkAsRead
}: MessageDisplayProps) => {

  const isSent = message.senderId === currentUserId;
  const gradientColors = isSent
    ? ["rgba(20, 87, 231, 0.8)", "rgba(27, 87, 218, 0.83)"]
    : ["rgba(240, 248, 255, 0.7)", "rgba(230, 245, 255, 0.4)"];

  const senderAvatar = message.sender?.avatar || `https://i.pravatar.cc/150?u=${message.senderId}`;
  const senderName = message.sender?.name || message.senderId;

  return (
    <View className={`flex-row items-start my-2 ${isSent ? "justify-end" : "justify-start"}`}>
      {/* Avatar gauche pour les messages reçus */}
      {!isSent && (
        <Image source={{ uri: senderAvatar }} className="w-10 h-10 rounded-full mr-3" />
      )}

      {/* Message content */}
      <LinearGradient
        colors={gradientColors}
        className={`p-4 max-w-[75%] rounded-2xl 
          ${isSent ? "self-end rounded-tr-none shadow-md" : "self-start rounded-tl-none shadow-sm"}`}
      >
        {!isSent && (
          <Text className="font-semibold text-gray-400 text-xs mb-1">{senderName}</Text>
        )}

        {/* Text */}
        {message.messageType === "text" && (
          <Text className={`text-[16px] ${isSent ? "text-white" : "text-gray-800"}`}>
            {message.content}
          </Text>
        )}

        {/* Image */}
        {message.messageType === "image" && (
          <Image source={{ uri: message.content }} className="w-full h-48 rounded-lg mt-2" />
        )}

        {/* Video */}
        {message.messageType === "video" && (
          <Video
            source={{ uri: message.content }}
            style={{ width: 250, height: 200, borderRadius: 10, marginTop: 5 }}
            useNativeControls
          />
        )}

        {/* Audio */}
        {message.messageType === "audio" && (
          <TouchableOpacity
            onPress={async () => {
              const sound = new Audio.Sound();
              await sound.loadAsync({ uri: message.content });
              await sound.playAsync();
            }}
            className="mt-2"
          >
            <Text className="text-blue-600 font-semibold">🎵 Lire l'audio</Text>
          </TouchableOpacity>
        )}

        {/* Document */}
        {message.messageType === "document" && (
          <TouchableOpacity onPress={() => Linking.openURL(message.content)} className="mt-2">
            <Text className="text-blue-600 underline font-semibold">📄 Ouvrir le document</Text>
          </TouchableOpacity>
        )}

        {/* Timestamp & Status */}
        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-xs text-gray-600">
            {new Date(message.createdAt).toLocaleTimeString()}
          </Text>
          {isSent && (
            <Ionicons
              name={
                message.status?.read?.length ? "checkmark-done" : "checkmark"
              }
              size={16}
              color={message.status?.read?.length ? "blue" : "gray"}
            />
          )}
        </View>

        {/* Optionnel: réactions, reply, delete... */}
        <View className="flex-row space-x-2 mt-2">
          {onReply && (
            <TouchableOpacity onPress={onReply}>
              <Text className="text-xs text-blue-500">↩️ Répondre</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete}>
              <Text className="text-xs text-red-500">🗑 Supprimer</Text>
            </TouchableOpacity>
          )}
          {onReact && (
            <TouchableOpacity onPress={() => onReact("👍")}>
              <Text className="text-xs text-yellow-500">👍</Text>
            </TouchableOpacity>
          )}
          {onMarkAsRead && (
            <TouchableOpacity onPress={onMarkAsRead}>
              <Text className="text-xs text-gray-500">✔️ Vu</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Avatar à droite pour messages envoyés */}
      {isSent && (
        <Image source={{ uri: senderAvatar }} className="w-10 h-10 rounded-full ml-3" />
      )}
    </View>
  );
};

export default MessageDisplay;
