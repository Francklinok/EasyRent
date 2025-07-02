
import { Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Housing } from '@/types/HousingType';
import { HousingCard } from '../ui';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';


const renderHousingCard = (housing: Housing) => (
    
  <HousingCard 
    key={housing.id} 
    title={housing.title}   
    price={housing.price}   
    className="mb-2"
  >
    <Image 
      source={{ uri: housing.images[0] }} 
      className="w-28 h-18 rounded-xl mr-2" 
    />
    <ThemedView className="flex-1">
      <ThemedText type = 'caption' intensity='strong'>{housing.title}</ThemedText>
      <ThemedView className="flex-row justify-between mt-2">
        <ThemedView>
          <ThemedText className="text-gray-600">{housing.city}, {housing.country}</ThemedText>
          <ThemedText className="font-bold text-blue-600">{housing.price}€/month</ThemedText>
        </ThemedView>
        <ThemedView className="flex-row items-center">
          <MaterialCommunityIcons name="home-city" size={20} color="#4B5563" />
          <ThemedText className="ml-1">{housing.type}</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  </HousingCard>
);

export default renderHousingCard;
