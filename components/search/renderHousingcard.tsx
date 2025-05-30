
import { View, Text, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Housing } from '@/types/HousingType';
import { HousingCard } from '../ui';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';


const renderHousingCard = (housing: Housing) => (
    
  <HousingCard 
    key={housing.id} 
    title={housing.title}   // Assurez-vous de passer title
    price={housing.price}   // Assurez-vous de passer price
    className="mb-2"
  >
    <Image 
      source={{ uri: housing.images[0] }} 
      className="w-24 h-24 rounded-xl mr-4" 
    />
    <ThemedView className="flex">
      <ThemedText className="text-lg font-bold">{housing.title}</ThemedText>
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
