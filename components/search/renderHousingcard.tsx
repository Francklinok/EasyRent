
import { Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Housing } from '@/types/HousingType';
import { HousingCard } from '../ui';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';


const renderHousingCard = (housing: Housing) => (
    
  <HousingCard 
    key={housing.id}   >
    <ThemedView className = "flex-row gap-10  items-center">
    <Image 
      source={{ uri: housing.images[0] }} 
      // className="w-28 h-6 rounded-xl mr-2" 
      style = {{ width:100, height:100 , borderRadius:10}}
    />
    <ThemedView>
      <ThemedText type = 'caption' intensity='strong'>{housing.title}</ThemedText>
      <ThemedView className=" align-items-center mt-2">
        <ThemedView>
           <ThemedView className="flex-row items-center">
          <MaterialCommunityIcons name="home-city" size={20} color="#4B5563" />
          <ThemedText className="ml-1">{housing.type}</ThemedText>
         </ThemedView>
          <ThemedText >{housing.city}, {housing.country}</ThemedText>
          <ThemedText>{housing.price}€/month</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
    </ThemedView>
  </HousingCard>
);

export default renderHousingCard;
