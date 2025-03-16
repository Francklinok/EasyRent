import { View, Text, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Video } from "expo-av";
import { Audio } from "expo-av";
import * as Linking from "expo-linking";
import { MessageType } from "@/types/MessageTypes";
import { Ionicons } from "@expo/vector-icons"; // Pour les icônes de lecture

interface MessageBodyProps {
    message: MessageType;
}

const MessageDisplay= ({ message }: MessageBodyProps) => {    

    
    const gradientColors = message.isSent
        ? ["rgba(20, 87, 231, 0.8)", "rgba(27, 87, 218, 0.83)"] // Dégradé futuriste bleu pour les messages envoyés
        : ["rgba(240, 248, 255, 0.7)", "rgba(230, 245, 255, 0.4)"]; // Dégradé léger bleu/vert pour les messages reçus

    return (
        <View className={`flex-row  items-start my-2 ${message.isSent ? "justify-end" : "justify-start"}`}>
            {/* Avatar côté gauche uniquement pour les messages reçus */}
            {!message.isSent && (
                <Image source={{ uri: message.sender.avatar }} className="w-10 h-10 rounded-full mr-3" />
            )}

            {/* Conteneur du message avec gradient et ombre */}
            <LinearGradient
                colors={gradientColors}
                className={`p-4 max-w-[75%] rounded-2xl 
                    ${message.isSent ? "self-end rounded-tr-none shadow-md" : "self-start rounded-tl-none shadow-sm"}
                    ${message.isSent ? "bg-gradient-to-r" : "bg-gradient-to-l"}
                `}
            >
                {/* Nom de l'expéditeur pour les messages reçus */}
                {!message.isSent && (
                    <Text className="font-semibold text-gray-400 text-xs">{message.sender.name}</Text>
                )}

                {/* Message Texte */}
                {message.type === "text" && (
                    <Text className={`text-[16px] ${message.isSent ? "text-white" : "text-gray-800"}`}>
                        {message.content}
                    </Text>
                )}

                {/* Image */}
                {message.type === "image" && (
                    <Image source={{ uri: message.content }} className="w-full h-48 rounded-lg mt-2" />
                )}

                {/* Vidéo */}
                {message.type === "video" && (
                    <Video
                        source={{ uri: message.content }}
                        style={{ width: 250, height: 200, borderRadius: 10, marginTop: 5 }}
                        useNativeControls
                    />
                )}

                {/* Audio */}
                {message.type === "audio" && (
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
                {message.type === "document" && (
                    <TouchableOpacity onPress={() => Linking.openURL(message.content)} className="mt-2">
                        <Text className="text-blue-600 underline font-semibold">📄 Ouvrir le document</Text>
                    </TouchableOpacity>
                )}

                {/* Timestamp + Indicateur de lecture */}
                <View className="flex-row justify-between items-center mt-2">
                    <Text className="text-xs text-gray-600">{new Date(message.timestamp).toLocaleTimeString()}</Text>
                    {message.isSent && (
                        <Ionicons
                            name={message.status === "read" ? "checkmark-done" : "checkmark"}
                            size={16}
                            color={message.status === "read" ? "blue" : "gray"}
                        />
                    )}
                </View>
                           {/* Réactions */}
                {/* <MessageReaction message={message} />

                <View className="flex-row mt-2">
                    <MessageEdit message={message} />
                    <MessageDelete messageId={message.id} />
                </View> */}
            </LinearGradient>

            {/* Avatar côté droit uniquement pour les messages envoyés */}
            {message.isSent && (
                <Image source={{ uri: message.sender.avatar }} className="w-10 h-10 rounded-full ml-3" />
            )}
        </View>
    );
};

export default MessageDisplay  ;
