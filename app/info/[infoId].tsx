import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Platform,
  Dimensions,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Octicons from '@expo/vector-icons/Octicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ItemData from '@/components/info/index';
import Services from '@/components/info/servicesFiles';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useProperty } from '@/hooks/useProperties';
import { ActivityIndicator } from 'react-native';
import { getChatService, ConversationType } from '@/services/api/chatService';
import { useActivity } from '@/components/contexts/activity/ActivityContext';
import Criteria from '@/components/info/criteriaFile';
import { useLanguage } from '@/components/contexts/language';
import { Currency } from 'lucide-react-native';


const HOTEL_TYPES = ['Hôtel', 'Hotel', 'Auberge', 'Motel', 'Resort', 'Chambre d\'hôte', 'Guesthouse'];

const { width, height } = Dimensions.get('window');

interface ComponentProps {
  itemData?: any;
  onClick?:() => void;
}

export default function Info() {
  const params = useLocalSearchParams();
  const id = (params.infoId || params.id) as string;
  const passedItemData = params.itemData as string | undefined;
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const { addActivity } = useActivity();
  const [creatingConversation, setCreatingConversation] = useState(false);

  // Parse passed item data if available (for instant loading)
  const parsedPassedData = useMemo(() => {
    if (passedItemData) {
      try {
        return JSON.parse(passedItemData);
      } catch {
        return null;
      }
    }
    return null;
  }, [passedItemData]);

  // Only fetch from network if no data was passed
  const { property: fetchedProperty, loading: fetchLoading, error } = useProperty(
    parsedPassedData ? '' : id // Don't fetch if we have passed data
  );

  // Use passed data immediately, or fetched data as fallback
  const property = parsedPassedData || fetchedProperty;
  const loading = parsedPassedData ? false : fetchLoading;

  const handleStartConversation = useCallback(async () => {
    if (!property || !property.ownerId) {
      Alert.alert(t('common.error'), t('info.conversationError'));
      return;
    }


    try {
      setCreatingConversation(true);
      const chatService = getChatService();

      // create a new conversation or get existing one
      const conversation = await chatService.createOrGetConversation({
        participantId: property.ownerId,
        type: ConversationType.PROPERTY_INQUIRY,
        propertyId: property.id
      });


      // Log activity
      addActivity({
        userId: 'current-user', 
        type: 'navigation',
        title: 'Consultation de propriété',
        description: `Vous avez consulté ${property.title}`,
        status: 'completed',
        propertyId: property.id,
        propertyTitle: property.title
      });

      // Navigate to ChatList with conversationId
      router.push(`/(tabs)/ChatList?conversationId=${conversation.id}`);
    } catch (error) {
      console.error('Erreur création conversation:', error);
      Alert.alert(
        t('common.error'),
        t('info.conversationStartError')
      );
    } finally {
      setCreatingConversation(false);
    }
  }, [property, router, addActivity]);

  const currentItem = useMemo(() => {
    // If we have passed item data (ExtendedItemTypes format), use it directly
    if (parsedPassedData) {
      return {
        ...parsedPassedData,
        // Ensure required fields are present
        owner: parsedPassedData.owner || {
          id: 'owner1',
          name: 'Propriétaire',
          phone: '+237 677 123 456',
          email: 'owner@email.com',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop'
        },
        propertyAvailability: parsedPassedData.propertyAvailability || {
          startDate: new Date().toISOString(),
          type: 'immediate' as const
        },
        ownerCriteria: parsedPassedData.ownerCriteria || {
          minimumDuration: '6 mois',
          solvability: 'instant',
          guarantorRequired: false,
          acceptedSituations: ['employed', 'student'],
          monthlyRent: parsedPassedData.price || 0,
          depositAmount: 0,
          isdocumentRequired: false,
          requiredDocuments: { tenant: [], guarantor: [] },
          currency:parsedPassedData.currency
        },
        equipments: parsedPassedData.equipments || [],
        atouts: parsedPassedData.atouts || parsedPassedData.features || [],
        services: parsedPassedData.services || [],
      };
    }

    if (!property) return null;

    // Handle both string[] and object[] formats for images
    const firstImage = property.images?.[0];
    const imageUrl = typeof firstImage === 'string'
      ? firstImage
      : firstImage?.url || 'https://via.placeholder.com/400x300';

    return {
      id: property.id,
      title: property.title,
      location: property.address || property.generalHInfo?.area || 'Location',
      price: property.ownerCriteria?.monthlyRent || 0,
      type: property.propertyType || 'villa',
      listType: property.actionType === 'rent' ? 'rent' : 'sale',
      // Include propertyType and actionType for booking screen compatibility
      propertyType: property.propertyType || 'villa',
      actionType: property.actionType || 'rent',
      actionCategory: (property as any).actionCategory,
      investmentModel: (property as any).investmentModel,
      avatar: imageUrl,
      images: property.images || [],
      imageAvif: imageUrl,
      imageWebP: imageUrl,
      thumbnail: imageUrl,
      availibility: property.status ,
      stars: 0.0,
      review: property.description || '',
      description: property.description || '',
      virtualTourAvailable: property.virtualTours?.length > 0 || false,
      generalInfo: {
        bedrooms: property.generalHInfo?.bedrooms || 0,
        bathrooms: property.generalHInfo?.bathrooms || 0,
        surface: property.generalLandinfo?.surface || property.generalHInfo?.surface || 0,
        rooms: property.generalHInfo?.rooms || 0,
        furnished: property.generalHInfo?.furnished || false,
        pets: property.generalHInfo?.pets || false,
        smoking: property.generalHInfo?.smoking || false,
      },
      owner: {
        id: property.ownerId || 'owner1',
        name: property.ownerName || 'Propriétaire',
        phone: property.ownerPhone || '+237 677 123 456',
        email: property.ownerEmail || 'owner@email.com',
        avatar: property.ownerAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop'
      },
      propertyAvailability: {
        startDate: property.availableFrom || new Date().toISOString(),
        type: 'immediate' as const
      },
      equipments: property.equipments || [],
      atouts: property.atouts || [],
      ownerCriteria: {
        minimumDuration: property.ownerCriteria?.minimumDuration || '6 mois',
        solvability: property.ownerCriteria?.solvability || 'instant',
        currency: property.ownerCriteria?.currency || 'XAF',
        guarantorRequired: property.ownerCriteria?.guarantorRequired || false,
        guarantorLocation: property.ownerCriteria?.guarantorLocation,
        acceptedSituations: property.ownerCriteria?.acceptedSituations || ['employed', 'student'],
        monthlyRent: property.ownerCriteria?.monthlyRent || 0,
        depositAmount: property.ownerCriteria?.depositAmount || 0,
        isdocumentRequired: property.ownerCriteria?.isdocumentRequired || false,
        requiredDocuments: property.ownerCriteria?.requiredDocuments || {
          tenant: [],
          guarantor: []
        }
      },
      services: property.services || [],
      features: property.amenities || [],
      hotelRoomTypes: property.hotelRoomTypes || [],
      propertyRooms: property.propertyRooms || [],
      rentalStrategy: property.rentalStrategy || 'global',
      roomAvailability: property.roomAvailability || null,
      energyScore: 7,
      distanceToAmenities: {
        schools: 500,
        healthcare: 1000,
        shopping: 300,
        transport: 200
      }
    };
  }, [property, parsedPassedData]);


  const [activeComponent, setActiveComponent] = useState<string>('Description');

  // Check if  the  propert is hotel
  const isHotel = useMemo(() => {
    if (!currentItem?.type) return false;
    return HOTEL_TYPES.some(hotelType =>
      currentItem.type.toLowerCase().includes(hotelType.toLowerCase())
    );
  }, [currentItem?.type]);

  const componentMap = useMemo(() => {
    const map: Record<string, {
      component: React.ComponentType<ComponentProps>,
      icon: string,
      iconLib: string,
      gradient: string[]
    }> = {
      Description: {
        component: ItemData,
        icon: 'description',
        iconLib: 'MaterialIcons',
        gradient: ['#667eea', '#764ba2']
      },
    };

    // Add Criteria and Services only if not a hotel
    if (!isHotel) {
      map.Criteria = {
        component: Criteria,
        icon: 'criteria',
        iconLib: 'MaterialIcons',
        gradient: ['#4facfe', '#00f2fe']
      };
      map.Services = {
        component: Services,
        icon: 'room-service',
        iconLib: 'MaterialIcons',
        gradient: ['#fa709a', '#fee140']
      };
    }

    return map;
  }, [isHotel]);

  const ActiveComponent = componentMap[activeComponent]?.component;

  // loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.surface }]}>
        <LinearGradient
          colors={theme.priceGradient}
          style={styles.errorContainer}
        >
          <ActivityIndicator size="large" color="white" />
          <ThemedText type="subtitle" color="white" style={styles.errorText}>Chargement...</ThemedText>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Error  state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.surface }]}>
        <LinearGradient
          colors={theme.priceGradient}
          style={styles.errorContainer}
        >
          <MaterialIcons name="error-outline" size={64} color="white" />
          <ThemedText type="subtitle" color="white" style={styles.errorText}>Erreur: {error}</ThemedText>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Item not  found
  if (!currentItem) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.surface }]}>
        <LinearGradient
          colors={theme.priceGradient}
          style={styles.errorContainer}
        >
          <MaterialIcons name="error-outline" size={64} color="white" />
          <ThemedText type="subtitle" color="white" style={styles.errorText}>Propriété non trouvée</ThemedText>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surface }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Contenu avec animation */}
      <ThemedView 
        style={styles.contentContainer}
      >
        <View style={styles.contentWrapper}>
          {ActiveComponent ? (
            <ActiveComponent
             itemData={currentItem}
             onClick={handleStartConversation}
             onInvestPress={currentItem?.actionCategory === 'hybrid' ? () => {
               const model = currentItem.investmentModel || 'rst';
               router.push({
                 pathname: model === 'spv' ? '/invest/spv/[spvId]' : '/invest/rst/[projectId]',
                 params: {
                   [model === 'spv' ? 'spvId' : 'projectId']: currentItem.id,
                   propertyData: JSON.stringify(currentItem),
                 }
               } as any);
             } : undefined}
             />
          ) : (
            <ThemedView style={styles.noDataContainer}>
              <MaterialIcons name="inbox" size={48} color={theme.outline} />
              <ThemedText type="body" variant="secondary">
                Aucune donnée disponible
              </ThemedText>
            </ThemedView>
          )}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 24,
    paddingBottom: 10,
  },
  headerBlur: {
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginLeft: 14,
  },
  avatarGlow: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: 'white',
  },
  ownerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  ownerName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  responseRate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

 
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  actionButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tabWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  activeTab: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  inactiveTab: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  activeTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
  },
  inactiveTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  noDataText: {
  },
});
