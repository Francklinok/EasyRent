import React from 'react';
import { Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Housing } from '@/types/HousingType';
import { HousingCard } from '../ui';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import { useTheme } from '../contexts/theme/themehook';

const { width: screenWidth } = Dimensions.get('window');

const renderHousingCard = (housing: Housing) => {
  const { theme } = useTheme();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'apartment': return 'apartment';
      case 'house': return 'home';
      case 'studio': return 'home-city';
      default: return 'home';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'apartment': return '#3B82F6';
      case 'house': return '#10B981';
      case 'studio': return '#F59E0B';
      default: return theme.primary;
    }
  };

  return (
    <TouchableOpacity
      key={housing.id}
      activeOpacity={0.9}
      style={{
        backgroundColor: theme.surface,
        borderRadius: 16,
        shadowColor: theme.onSurface,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
        marginBottom: 4,
        overflow: 'hidden'
      }}
    >
      {/* Image Section */}
      <ThemedView style={{ position: 'relative' }}>
        <Image 
          source={{ uri: housing.images[0] }} 
          style={{ 
            width: '100%', 
            height: 200,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16
          }}
          resizeMode="cover"
        />
        
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            justifyContent: 'flex-end',
            paddingHorizontal: 16,
            paddingBottom: 12
          }}
        >
          <ThemedView style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: getTypeColor(housing.type),
            alignSelf: 'flex-start',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8
          }}>
            <MaterialCommunityIcons 
              name={getTypeIcon(housing.type)} 
              size={14} 
              color="white" 
            />
            <ThemedText style={{
              marginLeft: 4,
              fontSize: 12,
              fontWeight: '600',
              color: 'white',
              textTransform: 'capitalize'
            }}>
              {housing.type}
            </ThemedText>
          </ThemedView>
        </LinearGradient>

        {/* Favorite Button */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: 20,
            padding: 8
          }}
        >
          <Ionicons name="heart-outline" size={20} color={theme.error} />
        </TouchableOpacity>
      </ThemedView>

      {/* Content Section */}
      <ThemedView style={{ padding: 16 }}>
        {/* Title and Price */}
        <ThemedView style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 8
        }}>
          <ThemedView style={{ flex: 1, marginRight: 12 }}>
            <ThemedText style={{
              fontSize: 18,
              fontWeight: '700',
              color: theme.onSurface,
              marginBottom: 4
            }}>
              {housing.title}
            </ThemedText>
            <ThemedView style={{
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <Ionicons name="location" size={14} color={theme.onSurface + '60'} />
              <ThemedText style={{
                marginLeft: 4,
                fontSize: 14,
                color: theme.onSurface + '80'
              }}>
                {housing.city}, {housing.country}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedView style={{
            backgroundColor: theme.primary + '15',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8
          }}>
            <ThemedText style={{
              fontSize: 16,
              fontWeight: '700',
              color: theme.primary
            }}>
              €{housing.price.toLocaleString()}
            </ThemedText>
            <ThemedText style={{
              fontSize: 12,
              color: theme.primary,
              textAlign: 'center'
            }}>
              /month
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Property Details */}
        <ThemedView style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 12
        }}>
          <ThemedView style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1
          }}>
            <MaterialCommunityIcons 
              name="floor-plan" 
              size={16} 
              color={theme.onSurface + '60'} 
            />
            <ThemedText style={{
              marginLeft: 6,
              fontSize: 14,
              color: theme.onSurface + '80'
            }}>
              {housing.surface}m²
            </ThemedText>
          </ThemedView>

          <ThemedView style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1
          }}>
            <MaterialCommunityIcons 
              name="bed" 
              size={16} 
              color={theme.onSurface + '60'} 
            />
            <ThemedText style={{
              marginLeft: 6,
              fontSize: 14,
              color: theme.onSurface + '80'
            }}>
              {housing.rooms} rooms
            </ThemedText>
          </ThemedView>

          <ThemedView style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1
          }}>
            <MaterialCommunityIcons 
              name="shower" 
              size={16} 
              color={theme.onSurface + '60'} 
            />
            <ThemedText style={{
              marginLeft: 6,
              fontSize: 14,
              color: theme.onSurface + '80'
            }}>
              {housing.bathrooms} baths
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Amenities */}
        {housing.amenities && housing.amenities.length > 0 && (
          <ThemedView style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: 12
          }}>
            {housing.amenities.slice(0, 3).map((amenity, index) => (
              <ThemedView
                key={index}
                style={{
                  backgroundColor: theme.surfaceVariant,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  marginRight: 6,
                  marginBottom: 4
                }}
              >
                <ThemedText style={{
                  fontSize: 12,
                  color: theme.onSurface + '80',
                  fontWeight: '500'
                }}>
                  {amenity}
                </ThemedText>
              </ThemedView>
            ))}
            {housing.amenities.length > 3 && (
              <ThemedView style={{
                backgroundColor: theme.primary + '15',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6
              }}>
                <ThemedText style={{
                  fontSize: 12,
                  color: theme.primary,
                  fontWeight: '600'
                }}>
                  +{housing.amenities.length - 3} more
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        )}

        {/* Proximity Scores */}
        <ThemedView style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: theme.outline + '20'
        }}>
          <ThemedView style={{ alignItems: 'center' }}>
            <Ionicons name="train" size={16} color={theme.success} />
            <ThemedText style={{
              fontSize: 12,
              color: theme.onSurface + '80',
              marginTop: 2
            }}>
              {housing.proximityScore.transport}/5
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={{ alignItems: 'center' }}>
            <Ionicons name="school" size={16} color={theme.warning} />
            <ThemedText style={{
              fontSize: 12,
              color: theme.onSurface + '80',
              marginTop: 2
            }}>
              {housing.proximityScore.schools}/5
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={{ alignItems: 'center' }}>
            <Ionicons name="medical" size={16} color={theme.error} />
            <ThemedText style={{
              fontSize: 12,
              color: theme.onSurface + '80',
              marginTop: 2
            }}>
              {housing.proximityScore.healthcare}/5
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={{ alignItems: 'center' }}>
            <Ionicons name="storefront" size={16} color={theme.primary} />
            <ThemedText style={{
              fontSize: 12,
              color: theme.onSurface + '80',
              marginTop: 2
            }}>
              {housing.proximityScore.shopping}/5
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
};

export default renderHousingCard;