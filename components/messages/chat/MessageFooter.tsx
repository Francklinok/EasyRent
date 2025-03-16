import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MessageType } from "@/types/MessageTypes"; // Import de ton interface MessageType

const MessageFooter = ({ onSend }: { onSend: (message: MessageType) => void }) => {
  const [input, setInput] = useState("");

  const handleSendText = () => {
    if (input.trim() === "") return;

    const newMessage: MessageType = {
      id: Date.now().toString(), // Génération d'un ID temporaire
      type: "text",
      content: input,
      timestamp: Date.now(),
      isSent: true,
      status: "sent",
      sender: {
        name: "Moi", // Remplace par le vrai nom
        avatar: "https://via.placeholder.com/150", // Remplace par un avatar dynamique
      },
      reactions: {}, // Initialiser vide
      isEdited: false,
      isDeleted: false,
    };

    onSend(newMessage); // Envoyer le message à la liste principale
    setInput(""); // Réinitialiser l'input après envoi
  };

  return (
    <View className="flex flex-row gap-3 items-center justify-between p-2 bg-white border-t border-gray-300 w-full ml-1 mr-1 rounded-[14px]">
      <TouchableOpacity>
        <MaterialIcons name="attach-file" size={24} color="black" />
      </TouchableOpacity>

      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Écrire un message..."
        multiline
        className="flex-1 px-3 py-2 text-base bg-gray-100 rounded-lg mx-2"
        style={{ minHeight: 40, maxHeight: 120 }}
      />

      <TouchableOpacity>
        <Entypo name="emoji-happy" size={24} color="black" />
      </TouchableOpacity>

      <TouchableOpacity disabled={input.trim().length === 0} onPress={handleSendText}>
        <Ionicons name="send-sharp" size={24} color={input.trim().length > 0 ? "blue" : "gray"} />
      </TouchableOpacity>
    </View>
  );
};

export default MessageFooter;
