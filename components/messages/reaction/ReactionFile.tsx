import { TouchableOpacity, Text, View } from "react-native";
import { MessageType } from "@/types/MessageTypes";

interface MessageReactionProps {
    message: MessageType;
}

const emojis = ["👍", "❤️", "😂", "😮", "😢"];

const MessageReaction = ({ message }: MessageReactionProps) => {
    return (
        <View className="flex-row mt-2">
            {emojis.map((emoji) => (
                <TouchableOpacity key={emoji} onPress={() => console.log(`Ajout de la réaction ${emoji} à ${message.id}`)}>
                    <Text className="text-lg">{emoji}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default MessageReaction;
