import { 
  View, 
  Dimensions
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { 
  MaterialIcons, 
} from '@expo/vector-icons';
import { Housing } from '@/types/HousingType';

const HousingMap = ({ 
  housings, 
  currentLocation 
}: { 
  housings: Housing[], 
  currentLocation: Location.LocationObject | null 
}) => (
  <MapView
    style={{ 
      width: Dimensions.get('window').width, 
      height: 450 
    }}
    initialRegion={currentLocation ? {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    } : undefined}
  >
    {currentLocation && (
      <Marker
        coordinate={{
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude
        }}
        title="Ma Position"
        pinColor="blue"
      />
    )}
    
    {housings.map(housing => (
      <Marker
        key={housing.id}
        coordinate={housing.location}
        title={housing.title}
        description={`${housing.price}€`}
      >
        <View className="bg-blue-500 p-2 rounded-full">
          <MaterialIcons name="home" size={24} color="white" />
        </View>
      </Marker>
    ))}
  </MapView>
);

export default  HousingMap;

