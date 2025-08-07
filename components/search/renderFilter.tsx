import React, { useRef, useState } from 'react';
import {
  TouchableOpacity,
  Modal,
  TextInput,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '../ui/ThemedText';
import { ThemedView } from '../ui/ThemedView';
import { SearchFilters } from '@/types/FilterType';
import { useTheme } from '../contexts/theme/themehook';

const { width: screenWidth } = Dimensions.get('window');

interface FilterModalProps {
  isVisible: boolean;
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  applyFilters: () => void;
  onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isVisible,
  filters,
  setFilters,
  applyFilters,
  onClose,
}) => {
  const { theme } = useTheme();
  const scrollOffsetY = useRef(0);
  const [draggingDown, setDraggingDown] = useState(false);

  const propertyTypes = [
    { id: 'apartment', label: 'Apartment', icon: 'apartment' },
    { id: 'house', label: 'House', icon: 'home' },
    { id: 'studio', label: 'Studio', icon: 'home-city' },
    { id: 'villa', label: 'Villa', icon: 'home-variant' },
  ];

  const countries = [
    { id: 'France', label: 'France', flag: '🇫🇷' },
    { id: 'Spain', label: 'Spain', flag: '🇪🇸' },
    { id: 'Italy', label: 'Italy', flag: '🇮🇹' },
    { id: 'Germany', label: 'Germany', flag: '🇩🇪' },
  ];

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;
    scrollOffsetY.current = offset;
    if (offset < -40) {
      setDraggingDown(true);
    }
  };

  const handleScrollEndDrag = () => {
    if (draggingDown) {
      onClose();
      setDraggingDown(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: 10000,
      minSurface: 20,
      rooms: 1,
      type: null,
      country: null,
    });
  };

  const renderPriceRange = () => (
    <ThemedView style={{ marginBottom: 24 }}>
      <ThemedView style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
      }}>
        <Ionicons name="pricetag" size={20} color={theme.primary} />
        <ThemedText style={{
          marginLeft: 8,
          fontSize: 18,
          fontWeight: '600',
          color: theme.onSurface
        }}>
          Price Range
        </ThemedText>
      </ThemedView>
      
      <ThemedText style={{
        fontSize: 14,
        color: theme.onSurface + '80',
        marginBottom: 12
      }}>
        €{filters.minPrice.toLocaleString()} - €{filters.maxPrice.toLocaleString()} per month
      </ThemedText>
      
      <ThemedView style={{ flexDirection: 'row', gap: 12 }}>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{
            fontSize: 12,
            color: theme.onSurface + '80',
            marginBottom: 6
          }}>
            Min Price
          </ThemedText>
          <TextInput
            placeholder="0"
            keyboardType="numeric"
            value={filters.minPrice.toString()}
            onChangeText={(val) =>
              setFilters((prev) => ({
                ...prev,
                minPrice: Number(val) || 0,
              }))
            }
            style={{
              backgroundColor: theme.surfaceVariant,
              borderRadius: 12,
              padding: 12,
              fontSize: 16,
              color: theme.onSurface,
              borderWidth: 1,
              borderColor: theme.outline + '30'
            }}
            placeholderTextColor={theme.onSurface + '60'}
          />
        </ThemedView>
        
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{
            fontSize: 12,
            color: theme.onSurface + '80',
            marginBottom: 6
          }}>
            Max Price
          </ThemedText>
          <TextInput
            placeholder="10000"
            keyboardType="numeric"
            value={filters.maxPrice.toString()}
            onChangeText={(val) =>
              setFilters((prev) => ({
                ...prev,
                maxPrice: Number(val) || 10000,
              }))
            }
            style={{
              backgroundColor: theme.surfaceVariant,
              borderRadius: 12,
              padding: 12,
              fontSize: 16,
              color: theme.onSurface,
              borderWidth: 1,
              borderColor: theme.outline + '30'
            }}
            placeholderTextColor={theme.onSurface + '60'}
          />
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );

  const renderPropertyDetails = () => (
    <ThemedView style={{ marginBottom: 24 }}>
      <ThemedView style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
      }}>
        <MaterialCommunityIcons name="floor-plan" size={20} color={theme.primary} />
        <ThemedText style={{
          marginLeft: 8,
          fontSize: 18,
          fontWeight: '600',
          color: theme.onSurface
        }}>
          Property Details
        </ThemedText>
      </ThemedView>

      <ThemedView style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{
            fontSize: 12,
            color: theme.onSurface + '80',
            marginBottom: 6
          }}>
            Min Surface (m²)
          </ThemedText>
          <TextInput
            placeholder="20"
            keyboardType="numeric"
            value={filters.minSurface.toString()}
            onChangeText={(val) =>
              setFilters((prev) => ({
                ...prev,
                minSurface: Number(val) || 20,
              }))
            }
            style={{
              backgroundColor: theme.surfaceVariant,
              borderRadius: 12,
              padding: 12,
              fontSize: 16,
              color: theme.onSurface,
              borderWidth: 1,
              borderColor: theme.outline + '30'
            }}
            placeholderTextColor={theme.onSurface + '60'}
          />
        </ThemedView>

        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{
            fontSize: 12,
            color: theme.onSurface + '80',
            marginBottom: 6
          }}>
            Min Rooms
          </ThemedText>
          <TextInput
            placeholder="1"
            keyboardType="numeric"
            value={filters.rooms.toString()}
            onChangeText={(val) =>
              setFilters((prev) => ({
                ...prev,
                rooms: Number(val) || 1,
              }))
            }
            style={{
              backgroundColor: theme.surfaceVariant,
              borderRadius: 12,
              padding: 12,
              fontSize: 16,
              color: theme.onSurface,
              borderWidth: 1,
              borderColor: theme.outline + '30'
            }}
            placeholderTextColor={theme.onSurface + '60'}
          />
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );

  const renderPropertyTypes = () => (
    <ThemedView style={{ marginBottom: 24 }}>
      <ThemedView style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
      }}>
        <MaterialCommunityIcons name="home-variant" size={20} color={theme.primary} />
        <ThemedText style={{
          marginLeft: 8,
          fontSize: 18,
          fontWeight: '600',
          color: theme.onSurface
        }}>
          Property Type
        </ThemedText>
      </ThemedView>

      <ThemedView style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
      }}>
        {propertyTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            onPress={() =>
              setFilters((prev) => ({
                ...prev,
                type: prev.type === type.id ? null : type.id,
              }))
            }
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: filters.type === type.id ? theme.primary : theme.surfaceVariant,
              borderWidth: 1,
              borderColor: filters.type === type.id ? theme.primary : theme.outline + '30'
            }}
          >
            <MaterialCommunityIcons
              name={type.icon}
              size={18}
              color={filters.type === type.id ? 'white' : theme.onSurface + '80'}
            />
            <ThemedText style={{
              marginLeft: 6,
              fontSize: 14,
              fontWeight: '500',
              color: filters.type === type.id ? 'white' : theme.onSurface + '80'
            }}>
              {type.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>
    </ThemedView>
  );

  const renderCountries = () => (
    <ThemedView style={{ marginBottom: 32 }}>
      <ThemedView style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
      }}>
        <Ionicons name="location" size={20} color={theme.primary} />
        <ThemedText style={{
          marginLeft: 8,
          fontSize: 18,
          fontWeight: '600',
          color: theme.onSurface
        }}>
          Country
        </ThemedText>
      </ThemedView>

      <ThemedView style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
      }}>
        {countries.map((country) => (
          <TouchableOpacity
            key={country.id}
            onPress={() =>
              setFilters((prev) => ({
                ...prev,
                country: prev.country === country.id ? null : country.id,
              }))
            }
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: filters.country === country.id ? theme.primary : theme.surfaceVariant,
              borderWidth: 1,
              borderColor: filters.country === country.id ? theme.primary : theme.outline + '30'
            }}
          >
            <ThemedText style={{ fontSize: 16, marginRight: 6 }}>
              {country.flag}
            </ThemedText>
            <ThemedText style={{
              fontSize: 14,
              fontWeight: '500',
              color: filters.country === country.id ? 'white' : theme.onSurface + '80'
            }}>
              {country.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>
    </ThemedView>
  );

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={80}
          >
            <ThemedView style={{
              maxHeight: '90%',
              backgroundColor: theme.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 8
            }}>
              {/* Handle Bar */}
              <ThemedView style={{
                alignItems: 'center',
                paddingVertical: 12
              }}>
                <ThemedView style={{
                  width: 40,
                  height: 4,
                  backgroundColor: theme.outline + '40',
                  borderRadius: 2
                }} />
              </ThemedView>

              <ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                onScrollEndDrag={handleScrollEndDrag}
                scrollEventThrottle={16}
                style={{ paddingHorizontal: 20 }}
              >
                {/* Header */}
                <ThemedView style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 24
                }}>
                  <ThemedText style={{
                    fontSize: 24,
                    fontWeight: '700',
                    color: theme.onSurface
                  }}>
                    Filters
                  </ThemedText>
                  
                  <TouchableOpacity
                    onPress={resetFilters}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      backgroundColor: theme.surfaceVariant
                    }}
                  >
                    <ThemedText style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: theme.primary
                    }}>
                      Reset
                    </ThemedText>
                  </TouchableOpacity>
                </ThemedView>

                {renderPriceRange()}
                {renderPropertyDetails()}
                {renderPropertyTypes()}
                {renderCountries()}
              </ScrollView>

              {/* Action Buttons */}
              <ThemedView style={{
                flexDirection: 'row',
                paddingHorizontal: 20,
                paddingVertical: 20,
                paddingBottom: 40,
                gap: 12,
                borderTopWidth: 1,
                borderTopColor: theme.outline + '20'
              }}>
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    borderRadius: 12,
                    backgroundColor: theme.surfaceVariant,
                    alignItems: 'center'
                  }}
                >
                  <ThemedText style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: theme.onSurface + '80'
                  }}>
                    Cancel
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={applyFilters}
                  style={{
                    flex: 2,
                    paddingVertical: 16,
                    borderRadius: 12,
                    backgroundColor: theme.primary,
                    alignItems: 'center'
                  }}
                >
                  <ThemedText style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: 'white'
                  }}>
                    Apply Filters
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default FilterModal;