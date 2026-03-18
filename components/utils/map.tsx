import React, { useState } from 'react';
import {
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  StyleSheet
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import {
  MaterialIcons,
  Ionicons
} from '@expo/vector-icons';
import { Housing } from '@/types/HousingType';
import { Property } from '@/services/api/propertyService';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import { useTheme } from '../../hooks/themehook';
import { useRouter } from 'expo-router';

interface HousingMapProps {
  housings?: Housing[];
  properties?: Property[];
  currentLocation: Location.LocationObject | null;
  onPropertyPress?: (property: Property) => void;
}

const HousingMap = ({
  housings,
  properties,
  currentLocation,
  onPropertyPress
}: HousingMapProps) => {
  const { theme } = useTheme();
  const router = useRouter();
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  const handleMarkerPress = (id: string) => {
    setSelectedMarker(id);
  };

  const handleCalloutPress = (property: Property) => {
    if (onPropertyPress) {
      onPropertyPress(property);
    } else {
      router.push(`/info/[infoId]` as any);
    }
  };

  const renderPropertyMarker = (property: Property) => {
    if (!property.coordinates?.latitude || !property.coordinates?.longitude) return null;
    const coordinates = {
      latitude: property.coordinates.latitude,
      longitude: property.coordinates.longitude,
    };
    const isSelected = selectedMarker === property.id;
    const monthlyRent = property.ownerCriteria?.monthlyRent || 0;
    const image = Array.isArray(property.images) && property.images.length > 0
      ? (typeof property.images[0] === 'string' ? property.images[0] : property.images[0]?.url)
      : null;

    return (
      <Marker
        key={property.id}
        coordinate={coordinates}
        onPress={() => handleMarkerPress(property.id)}
      >
        <View style={[
          styles.markerContainer,
          isSelected && styles.markerSelected
        ]}>
          <ThemedView style={{
            backgroundColor: theme.primary,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5
          }}>
            <Ionicons
              name={property.propertyType === 'apartment' ? 'business' : 'home'}
              size={16}
              color="white"
            />
            <ThemedText style={{
              color: 'white',
              fontWeight: 'bold',
              marginLeft: 4,
              fontSize: 12
            }}>
              {monthlyRent.toLocaleString()}€
            </ThemedText>
          </ThemedView>
        </View>

        <Callout
          tooltip
          onPress={() => handleCalloutPress(property)}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.calloutContainer}
          >
            {image && (
              <Image
                source={{ uri: image }}
                style={styles.calloutImage}
                resizeMode="cover"
              />
            )}
            <ThemedView style={styles.calloutContent}>
              <ThemedText
                numberOfLines={1}
                style={styles.calloutTitle}
              >
                {property.title}
              </ThemedText>
              <ThemedText
                numberOfLines={2}
                style={styles.calloutDescription}
              >
                {property.address}
              </ThemedText>

              <ThemedView style={styles.calloutDetails}>
                {property.generalHInfo && (
                  <>
                    <ThemedView style={styles.detailItem}>
                      <Ionicons name="bed-outline" size={14} color={theme.onSurface} />
                      <ThemedText style={styles.detailText}>
                        {property.generalHInfo.bedrooms}
                      </ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.detailItem}>
                      <Ionicons name="resize-outline" size={14} color={theme.onSurface} />
                      <ThemedText style={styles.detailText}>
                        {property.generalHInfo.surface}m²
                      </ThemedText>
                    </ThemedView>
                  </>
                )}
              </ThemedView>

              <ThemedView style={{
                backgroundColor: theme.primary + '20',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                marginTop: 8,
                alignSelf: 'flex-start'
              }}>
                <ThemedText style={{
                  color: theme.primary,
                  fontWeight: 'bold',
                  fontSize: 14
                }}>
                  {monthlyRent.toLocaleString()}€/mois
                </ThemedText>
              </ThemedView>

              <ThemedText style={{
                fontSize: 10,
                color: theme.primary,
                marginTop: 6,
                fontWeight: '600'
              }}>
                Appuyez pour voir les détails
              </ThemedText>
            </ThemedView>
          </TouchableOpacity>
        </Callout>
      </Marker>
    );
  };

  const renderHousingMarker = (housing: Housing) => (
    <Marker
      key={housing.id}
      coordinate={housing.location}
      title={housing.title}
      description={`${housing.price}€`}
      onPress={() => handleMarkerPress(housing.id)}
    >
      <View style={[
        styles.markerContainer,
        selectedMarker === housing.id && styles.markerSelected
      ]}>
        <ThemedView style={{
          backgroundColor: theme.primary,
          padding: 8,
          borderRadius: 20
        }}>
          <MaterialIcons name="home" size={24} color="white" />
        </ThemedView>
      </View>
    </Marker>
  );

  const firstPropertyWithCoords = properties?.find(p => p.coordinates?.latitude && p.coordinates?.longitude);

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={{
        width: Dimensions.get('window').width,
        height: 450
      }}
      initialRegion={currentLocation ? {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      } : firstPropertyWithCoords ? {
        latitude: firstPropertyWithCoords.coordinates!.latitude,
        longitude: firstPropertyWithCoords.coordinates!.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      } : {
        latitude: 6.1375,
        longitude: 1.2123,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }}
      showsUserLocation
      showsMyLocationButton
    >
      {currentLocation && (
        <Marker
          coordinate={{
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude
          }}
          title="Ma Position"
        >
          <View style={{
            backgroundColor: theme.primary,
            padding: 8,
            borderRadius: 20,
            borderWidth: 3,
            borderColor: 'white'
          }}>
            <Ionicons name="person" size={20} color="white" />
          </View>
        </Marker>
      )}

      {properties && properties.map(renderPropertyMarker)}
      {housings && housings.map(renderHousingMarker)}
    </MapView>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerSelected: {
    transform: [{ scale: 1.1 }],
  },
  calloutContainer: {
    width: 280,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calloutImage: {
    width: '100%',
    height: 140,
  },
  calloutContent: {
    padding: 12,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  calloutDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default HousingMap;

