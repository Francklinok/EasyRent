
// // import { View, Text } from "react-native";

// // const MessageBody = () => {
// //     return (
// //         <View className="flex justify-center">
// //             {/* Message reçu */}
// //             <View className="self-start bg-gray-200 p-4 rounded-[20px] my-1">
// //                 <Text className = "text-[18px] ">Salut tout le monde</Text>
// //                 <Text className = "self-end text-[10px]">10:20</Text>

// //             </View>

// //             {/* Message envoyé */}
// //             <View className="self-end bg-blue-500 p-4 text-white rounded-[20px] my-1">
// //                 <Text className="text-white text-[18px] ">Comment tu vas ?</Text>
// //                 <Text className = "self-end text-[10px]">10:20</Text>
// //             </View>
            
// //         </View>
// //     );
// // };

// // export default MessageBody;
// import { View, Text, Image, TouchableOpacity } from "react-native";
// import { Video } from "expo-av";
// import { Audio } from "expo-av";
// import * as Linking from "expo-linking";
// import { MessageType } from "@/types/MessageTypes";

// const MessageBody = ({ message:MessageType }) => {

//     return (
//         <View className="flex justify-center">
//             <View className={`p-4 rounded-[20px] my-1 ${isSent ? "self-end bg-blue-500" : "self-start bg-gray-200"}`}>
//                 {type === "text" && (
//                     <Text className={`${isSent ? "text-white" : "text-black"} text-[18px]`}>{content}</Text>
//                 )}

//                 {type === "image" && (
//                     <Image source={{ uri: content }} className="w-40 h-40 rounded-lg" />
//                 )}

//                 {type === "video" && (
//                     <Video
//                         source={{ uri: content }}
//                         style={{ width: 200, height: 200, borderRadius: 10 }}
//                         useNativeControls
//                         resizeMode="contain"
//                     />
//                 )}

//                 {type === "audio" && (
//                     <TouchableOpacity onPress={async () => {
//                         const sound = new Audio.Sound();
//                         await sound.loadAsync({ uri: content });
//                         await sound.playAsync();
//                     }}>
//                         <Text className="text-blue-700 underline">Écouter l'audio</Text>
//                     </TouchableOpacity>
//                 )}

//                 {type === "document" && (
//                     <TouchableOpacity onPress={() => Linking.openURL(content)}>
//                         <Text className="text-blue-700 underline">Ouvrir le document</Text>
//                     </TouchableOpacity>
//                 )}

//                 <Text className="self-end text-[10px]">{timestamp}</Text>
//             </View>
//         </View>
//     );
// };

// export default MessageBody;
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Video } from "expo-av";
import { Audio } from "expo-av";
import * as Linking from "expo-linking";
import { MessageType } from "@/types/MessageTypes";


interface MessageBodyProps {
    message: MessageType;
}

const MessageBody = ({ message }:MessageBodyProps) => {
    return (
        <View className="flex justify-center">
            <View className={`p-4 rounded-[20px] my-1 ${message.isSent ? "self-end bg-blue-500" : "self-start bg-gray-200"}`}>
                {message.type === "text" && (
                    <Text className={`${message.isSent ? "text-white" : "text-black"} text-[18px]`}>
                        {message.content}
                    </Text>
                )}

                {message.type === "image" && (
                    <Image source={{ uri: message.content }} className="w-40 h-40 rounded-lg" />
                )}

                {message.type === "video" && (
                    <Video
                        source={{ uri: message.content }}
                        style={{ width: 200, height: 200, borderRadius: 10 }}
                        useNativeControls
                        // resizeMode="contain"
                    />
                )}

                {message.type === "audio" && (
                    <TouchableOpacity onPress={async () => {
                        const sound = new Audio.Sound();
                        await sound.loadAsync({ uri: message.content });
                        await sound.playAsync();
                    }}>
                        <Text className="text-blue-700 underline">Écouter l'audio</Text>
                    </TouchableOpacity>
                )}

                {message.type === "document" && (
                    <TouchableOpacity onPress={() => Linking.openURL(message.content)}>
                        <Text className="text-blue-700 underline">Ouvrir le document</Text>
                    </TouchableOpacity>
                )}

                <Text className="self-end text-[10px]">{new Date(message.timestamp).toLocaleTimeString()}</Text>
            </View>
        </View>
    );
};

export default MessageBody;
