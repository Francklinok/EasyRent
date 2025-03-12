import { View, Text, FlatList} from "react-native";
import MessageBody from "@/components/messages/MessageBody";

const messages: MessageType[] = [
  { id: "1", type: "text", content: "Salut tout le monde comment vous allez aujourduit  !", timestamp: Date.now(), isSent: false },
  { id: "2", type: "image", content: "https://example.com/image.jpg", timestamp: Date.now(), isSent: true },
  { id: "3", type: "video", content: "https://example.com/video.mp4", timestamp: Date.now(), isSent: false },
  { id: "4", type: "audio", content: "https://example.com/audio.mp3", timestamp: Date.now(), isSent: true },
  { id: "5", type: "document", content: "https://example.com/document.pdf", timestamp: Date.now(), isSent: false }
];



 export default function Message (){
  return (
    <View className="flex-1 p-4 mt-20">
    <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBody message={item} />}
    />
    </View>
    // <View className = " p-20">
    //    <MessageBody message = "salut tout le monde "/>      
    // </View>
  );
};



