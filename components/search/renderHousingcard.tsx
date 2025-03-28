
import { View, Text, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Housing } from '@/types/HousingType';
import { HousingCard } from '../ui';



const renderHousingCard = (housing: Housing) => (
    
  <HousingCard 
    key={housing.id} 
    title={housing.title}   // Assurez-vous de passer title
    price={housing.price}   // Assurez-vous de passer price
    className="mb-4"
  >
    <Image 
      source={{ uri: housing.images[0] }} 
      className="w-24 h-24 rounded-xl mr-4" 
    />
    <View className="flex-1">
      <Text className="text-lg font-bold">{housing.title}</Text>
      <View className="flex-row justify-between mt-2">
        <View>
          <Text className="text-gray-600">{housing.city}, {housing.country}</Text>
          <Text className="font-bold text-blue-600">{housing.price}€/month</Text>
        </View>
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="home-city" size={20} color="#4B5563" />
          <Text className="ml-1">{housing.type}</Text>
        </View>
      </View>
    </View>
  </HousingCard>
);

export default renderHousingCard;
