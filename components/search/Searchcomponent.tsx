import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Animated,
  Image
} from 'react-native';
// import { styled } from 'nativewind';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import Slider from '@react-native-community/slider';
import { BlurView } from 'expo-blur';

// Types et interfaces
interface Logement {
  id: number;
  titre: string;
  pays: string;
  ville: string;
  prixLocation: number;
  nombreChambres: number;
  superficie: number;
  note: number;
  coordonnees: {
    latitude: number;
    longitude: number;
  };
  images: string[];
  equipements: string[];
  proximiteInfrastructures: {
    ecoles: number;
    hopitaux: number;
    transports: number;
    commerces: number;
  };
}

// Composant principal
const SearchComponent = () => {
  // États de recherche
  const [recherche, setRecherche] = useState('');
  const [filtres, setFiltres] = useState({
    prixMin: 0,
    prixMax: 5000,
    chambres: 1,
    superficie: 0,
  });
  const [localisationActuelle, setLocalisationActuelle] = useState(null);
  const [logementsFiltres, setLogementsFiltres] = useState<Logement[]>([]);
  
  // Animation
  const animationRecherche = useRef(new Animated.Value(0)).current;

  // Fonction de recherche avancée avec IA
  const rechercherLogements = async () => {
    // Simulation de recherche avec intelligence artificielle
    Animated.spring(animationRecherche, {
      toValue: 1,
      friction: 2,
      useNativeDriver: true
    }).start();

    // Logique de recherche avancée
    // 1. Analyse sémantique de la recherche
    // 2. Recommandation personnalisée
    // 3. Scoring multi-critères
  };

  // Demande de localisation
  const obtenirLocalisationActuelle = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission de localisation refusée');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocalisationActuelle(location.coords);
  };

  // Composant de carte interactive
  const CarteLogements = () => (
    <View className="h-60 w-full rounded-2xl overflow-hidden">
      <MapView
        className="flex-1"
        initialRegion={{
          latitude: localisationActuelle?.latitude || 48.8566,
          longitude: localisationActuelle?.longitude || 2.3522,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {/* Markers de logements */}
      </MapView>
    </View>
  );

  // Carte de logement détaillée
  const CarteLogement = ({ logement }: { logement: Logement }) => (
    <BlurView 
      intensity={50} 
      className="rounded-2xl p-4 mb-4 flex-row items-center"
    >
      <Image 
        source={{ uri: logement.images[0] }} 
        className="w-24 h-24 rounded-xl mr-4"
      />
      <View className="flex-1">
        <Text className="text-lg font-bold">{logement.titre}</Text>
        <Text className="text-gray-600">{logement.ville}</Text>
        <View className="flex-row items-center mt-2">
          <Text className="font-bold text-blue-600">
            {logement.prixLocation}€/mois
          </Text>
          <View className="ml-4 flex-row items-center">
            <Text>⭐ {logement.note}/5</Text>
          </View>
        </View>
      </View>
    </BlurView>
  );

  // Filtres avancés avec sliders
  const FiltresAvances = () => (
    <View className="space-y-4">
      <View>
        <Text>Prix: {filtres.prixMin}€ - {filtres.prixMax}€</Text>
        <Slider
          minimumValue={0}
          maximumValue={5000}
          step={100}
          value={filtres.prixMax}
          onValueChange={(val) => setFiltres(prev => ({...prev, prixMax: val}))}
        />
      </View>
      <View>
        <Text>Nombre de chambres: {filtres.chambres}</Text>
        <Slider
          minimumValue={1}
          maximumValue={5}
          step={1}
          value={filtres.chambres}
          onValueChange={(val) => setFiltres(prev => ({...prev, chambres: val}))}
        />
      </View>
    </View>
  );

  // Interface principale
  return (
    <ScrollView 
      className="flex bg-white p-4"
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-3xl font-bold mb-6 text-center">
        Trouvez Votre Refuge Idéal
      </Text>

      {/* Barre de recherche intelligente */}
      <Animated.View 
        style={{
          transform: [{
            scale: animationRecherche.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.05]
            })
          }]
        }}
      >
        <View className="flex-row mb-4">
          <TextInput
            placeholder="Recherche intelligente..."
            className="flex-1 bg-gray-100 p-3 rounded-l-xl"
            value={recherche}
            onChangeText={setRecherche}
          />
          <TouchableOpacity 
            className="bg-blue-500 p-3 rounded-r-xl"
            onPress={rechercherLogements}
          >
            <Text className="text-white">🔍</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Carte interactive */}
      <CarteLogements />

      {/* Filtres avancés */}
      <FiltresAvances />

      {/* Section de recommandations personnalisées */}
      <View className="mt-6">
        <Text className="text-xl font-bold mb-4">
          🌟 Recommandations Personnalisées
        </Text>
        {/* Liste de logements recommandés */}
        {logementsFiltres.map(logement => (
          <CarteLogement key={logement.id} logement={logement} />
        ))}
      </View>
    </ScrollView>
  );
};

export default SearchComponent;