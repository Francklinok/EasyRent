
// import React from 'react';
// import { View, Text, FlatList } from 'react-native';
// import MessageBody from "@/components/messages/MessageBody";
// import { MessageType } from "@/types/MessageTypes"; // Assurez-vous que vous avez défini ce type MessageType
// import MessageHeader from '@/components/messages/MessageHeade';
// import { ScrollView } from 'react-native-reanimated/lib/typescript/Animated';
// // Liste des messages
// const messages: MessageType[] = [
//   { 
//       id: "1", type: "text", content: "Bienvenue dans le futur ! Waouh, j'adore vraiment cette application. 🚀", timestamp: Date.now(), 
//       isSent: false, status: "read", sender: { name: "Alice", avatar: "https://example.com/avatar1.jpg" } 
//   },
//   { 
//       id: "2", type: "text", content: "Moi aussi j'adore cette application. Vraiment c'est ouf", timestamp: Date.now(), 
//       isSent: true, status: "sent", sender: { name: "Moi", avatar: "https://example.com/my-avatar.jpg" } 
//   },
//   { 
//       id: "3", type: "text", content: "Regarde cette image 😍", timestamp: Date.now(), 
//       isSent: false, status: "read", sender: { name: "Bob", avatar: "https://example.com/avatar2.jpg" } 
//   },
//   { 
//       id: "4", type: "text", content: "Bonjour fréro. Comment tu te portes aujourd'hui? J'espère que tu vas bien.", timestamp: Date.now(), 
//       isSent: true, status: "read", sender: { name: "Moi", avatar: "https://example.com/my-avatar.jpg" } 
//   },
//   { 
//       id: "5", type: "video", content: "https://example.com/video.mp4", timestamp: Date.now(), 
//       isSent: true, status: "read", sender: { name: "Moi", avatar: "https://example.com/my-avatar.jpg" } 
//   }
// ];

// export default function Message() {
//   return (
//     <View className="flex-1 p-1 mt-10">
//       {/* Afficher l'en-tête une seule fois, pas besoin de le boucler */}
//       <MessageHeader message={messages[0]} /> 

//       {/* Affichage des messages dans la liste */}
//       <ScrollView>
//       <FlatList
//         data={messages}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => <MessageBody message={item} />}
//         inverted  // Pour afficher les derniers messages en bas
//       />
//       </ScrollView>

//     </View>
//   );
// }
import React from 'react';
import { View, FlatList } from 'react-native';
import MessageBody from "@/components/messages/chat/MessageBody";
import { MessageType } from "@/types/MessageTypes";
import MessageHeader from '@/components/messages/chat/MessageHeade';
import MessageFooter from '@/components/messages/chat/MessageFooter';
// import MessageFooter from '@/components/messages/MessageFooter'; // Ajoute un footer si nécessaire

// Liste des messages
const messages: MessageType[] = [
  { 
    id: "1", type: "text", content: "Bienvenue dans le futur ! Waouh, j'adore vraiment cette application. 🚀", timestamp: Date.now(), 
    isSent: false, status: "read", sender: { name: "Alice", avatar: "https://example.com/avatar1.jpg" } 
  },
  { 
    id: "2", type: "text", content: "Moi aussi j'adore cette application. Vraiment c'est ouf", timestamp: Date.now(), 
    isSent: true, status: "sent", sender: { name: "Moi", avatar: "https://example.com/my-avatar.jpg" } 
  },
  { 
    id: "3", type: "text", content: "Regarde cette image 😍", timestamp: Date.now(), 
    isSent: false, status: "read", sender: { name: "Bob", avatar: "https://example.com/avatar2.jpg" } 
  },
  { 
    id: "4", type: "text", content: "Bonjour fréro. Comment tu te portes aujourd'hui? J'espère que tu vas bien.", timestamp: Date.now(), 
    isSent: true, status: "read", sender: { name: "Moi", avatar: "https://example.com/my-avatar.jpg" } 
  },
  { 
    id: "2", type: "text", content: "Moi aussi j'adore cette application. Vraiment c'est ouf", timestamp: Date.now(), 
    isSent: true, status: "sent", sender: { name: "Moi", avatar: "https://example.com/my-avatar.jpg" } 
  },
  { 
    id: "3", type: "text", content: "Regarde cette image 😍", timestamp: Date.now(), 
    isSent: false, status: "read", sender: { name: "Bob", avatar: "https://example.com/avatar2.jpg" } 
  },
  { 
    id: "4", type: "text", content: "Bonjour fréro. Comment tu te portes aujourd'hui? J'espère que tu vas bien.", timestamp: Date.now(), 
    isSent: true, status: "read", sender: { name: "Moi", avatar: "https://example.com/my-avatar.jpg" } 
  },
  { 
    id: "5", type: "text", content: "salut.j espere que tu va bien ce matin.moi aussi je vais bien par la grace de Dieu", timestamp: Date.now(), 
    isSent: false, status: "sent", sender: { name: "bob", avatar: "https://example.com/my-avatar.jpg" } 
  }
];

export default function Message() {
  return (
    <View className="flex-1">
      {/* Header (10%) */}
      <View className="h-[15%]">
        <MessageHeader message={messages[0]} />
      </View>

      {/* Body (80%) avec scroll */}
      <View className="h-[75%]">
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBody message={item} />}
          inverted  // Pour afficher les derniers messages en bas
          showsVerticalScrollIndicator={false} // Cache la barre de scroll
        />
      </View>

      {/* Footer (10%) */}
      <View className="h-[15%] p-5">
        <MessageFooter />
      </View>
    </View>
  );
}
