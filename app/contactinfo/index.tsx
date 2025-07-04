import { Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ContactInfo() {
  const { params } = useRoute<any>();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView className="flex-1 bg-background p-4">
        <Image
          source={{ uri: params.image }}
          className="w-32 h-32 rounded-full self-center mb-4"
        />
        <ThemedText className="text-center text-xl font-bold mb-2">
          {params.name}
        </ThemedText>
        <ThemedText className="text-center text-muted mb-1">
          Statut : {params.status}
        </ThemedText>
        <ThemedText className="text-center text-muted">
          ID Chat : {params.chatId}
        </ThemedText>
      </ThemedView>
    </SafeAreaView>
  );
}
