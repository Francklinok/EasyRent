import React, { useState, useMemo, useEffect } from 'react';
import { ScrollView, Alert, TouchableOpacity, Dimensions, Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { BackButton } from '@/components/ui/BackButton';
import { useTheme } from '@/components/contexts/theme/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { useActivity } from '@/components/contexts/activity/ActivityContext';
import { getBookingService } from '@/services/api/bookingService';
import { ItemType } from '@/types/ItemType';
import { CustomButton, DatePicker } from '@/components/ui';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

// Visit Status Badge Component
interface VisitStatusBadgeProps {
  status: VisitStatus;
  compact?: boolean;
}

const VisitStatusBadge: React.FC<VisitStatusBadgeProps> = ({ status, compact = false }) => {
  const { theme } = useTheme();

  const getStatusConfig = () => {
    switch(status) {
      case 'pending':
        return {
          color: theme.warning || '#F59E0B',
          icon: 'clock-outline' as const,
          label: 'En attente',
          description: 'Le propriétaire n\'a pas encore répondu'
        };
      case 'accepted':
        return {
          color: theme.success || '#10B981',
          icon: 'check-circle' as const,
          label: 'Acceptée',
          description: 'Votre visite a été confirmée par le propriétaire'
        };
      case 'rejected':
        return {
          color: theme.error || '#EF4444',
          icon: 'close-circle' as const,
          label: 'Refusée',
          description: 'Le propriétaire a refusé cette demande'
        };
      case 'failed':
        return {
          color: '#DC2626',
          icon: 'alert-circle' as const,
          label: 'Échouée',
          description: 'La demande n\'a pas pu être envoyée'
        };
    }
  };

  const config = getStatusConfig();

  if (compact) {
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: config.color + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: config.color + '30'
      }}>
        <MaterialCommunityIcons name={config.icon} size={16} color={config.color} />
        <ThemedText style={{
          color: config.color,
          fontSize: 13,
          fontWeight: '600',
          marginLeft: 6
        }}>
          {config.label}
        </ThemedText>
      </View>
    );
  }

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <ThemedView style={{
        backgroundColor: config.color + '10',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1.5,
        borderColor: config.color + '40',
        marginBottom: 16
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: config.color + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12
          }}>
            <MaterialCommunityIcons name={config.icon} size={22} color={config.color} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="normal" intensity="strong" style={{
              color: config.color,
              fontSize: 16,
              marginBottom: 2
            }}>
              Visite {config.label.toLowerCase()}
            </ThemedText>
            <ThemedText style={{
              fontSize: 12,
              color: theme.onSurface + '70'
            }}>
              {config.description}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </MotiView>
  );
};

type VisitType = 'physical' | 'virtual' | 'self-guided';
type VisitStatus = 'pending' | 'accepted' | 'rejected' | 'failed';
type TimeSlot = {
  time: string;
  available: boolean;
  premium?: boolean;
};

interface VisitRequest {
  id: string;
  status: VisitStatus;
  visitDate: string;
  visitTime: string;
  visitType: VisitType;
  createdAt: string;
  message?: string;
}

const VisitScreen = () => {
  const params = useLocalSearchParams();
  const property = useMemo(() => {
    try {
      return params.property ? JSON.parse(params.property as string) as ItemType : null;
    } catch (error) {
      console.error('Error parsing property:', error);
      return null;
    }
  }, [params.property]);

  const { theme } = useTheme();
  const { user, isAuthenticated, initializing } = useAuth();
  const { addActivity } = useActivity();
  const bookingService = getBookingService();

  const [loading, setLoading] = useState(false);
  const [visitType, setVisitType] = useState<VisitType>('physical');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [visitors, setVisitors] = useState(1);
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentVisitRequest, setCurrentVisitRequest] = useState<VisitRequest | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!initializing && !isAuthenticated) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour programmer une visite.',
        [
          { text: 'Se connecter', onPress: () => router.push('/Auth/Login') },
          { text: 'Annuler', onPress: () => router.back(), style: 'cancel' }
        ]
      );
    }
  }, [initializing, isAuthenticated]);

  // Fonction pour vérifier le statut de la visite
  const checkVisitStatus = async () => {
    if (!currentVisitRequest || !user?.id || !property) return;

    try {
      setCheckingStatus(true);
      
    } catch (error) {
      console.error('Error checking visit status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  // Vérifier le statut toutes les 10 secondes si une visite est en attente
  useEffect(() => {
    if (currentVisitRequest && currentVisitRequest.status === 'pending') {
      const interval = setInterval(checkVisitStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [currentVisitRequest]);

  // Safety check
  if (!property) {
    Alert.alert('Erreur', 'Informations de propriété manquantes', [
      { text: 'OK', onPress: () => router.back() }
    ]);
    return null;
  }

  // Generate time slots based on property availability
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [
      { time: '09:00', available: true, premium: true },
      { time: '10:00', available: true },
      { time: '11:00', available: true },
      { time: '12:00', available: false },
      { time: '14:00', available: true },
      { time: '15:00', available: true, premium: true },
      { time: '16:00', available: true },
      { time: '17:00', available: true },
      { time: '18:00', available: true, premium: true },
    ];
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const scheduleVisit = async () => {
    if (!selectedTime) {
      Alert.alert('Attention', 'Veuillez sélectionner une heure de visite');
      return;
    }

    if (!user || !user.id) {
      Alert.alert('Erreur', 'Vous devez être connecté pour programmer une visite.');
      return;
    }

    try {
      setLoading(true);

      // Vérifier les conflits d'horaires
      const conflictCheck = await bookingService.checkTimeSlotConflict(
        property.id,
        selectedDate.toISOString(),
        selectedTime
      );

      if (conflictCheck.hasConflict) {
        setLoading(false);
        Alert.alert(
          'Créneau déjà réservé',
          'Ce créneau horaire est déjà pris par une autre visite. Veuillez choisir un autre horaire.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      const result = await bookingService.createVisitRequest({
        propertyId: property.id,
        clientId: user.id,
        visitDate: selectedDate.toISOString(),
        visitTime: selectedTime,
        visitType: visitType,
        numberOfVisitors: visitors,
        message: notes || `Demande de visite ${visitType === 'physical' ? 'physique' : visitType === 'virtual' ? 'virtuelle' : 'autonome'} pour ${property.title}`
      });

      // Créer l'objet de demande de visite avec le statut
      const visitRequest: VisitRequest = {
        id: result?.visitId || `visit_${Date.now()}`,
        status: 'pending',
        visitDate: selectedDate.toISOString(),
        visitTime: selectedTime,
        visitType: visitType,
        createdAt: new Date().toISOString(),
        message: notes
      };

      setCurrentVisitRequest(visitRequest);

      addActivity({
        userId: user.id,
        type: 'visit',
        title: 'Visite programmée',
        description: `${visitType === 'physical' ? 'Visite physique' : visitType === 'virtual' ? 'Visite virtuelle' : 'Visite autonome'} programmée pour ${property?.title} le ${selectedDate.toLocaleDateString()} à ${selectedTime}`,
        status: 'pending',
        propertyId: property.id,
        propertyTitle: property?.title,
        metadata: {
          visitDate: selectedDate.toISOString(),
          visitTime: selectedTime,
          visitType: visitType,
          numberOfVisitors: visitors,
          visitRequestId: visitRequest.id
        }
      });

      setLoading(false);

      Alert.alert(
        'Demande de visite envoyée !',
        `Votre demande de ${visitType === 'physical' ? 'visite physique' : visitType === 'virtual' ? 'visite virtuelle' : 'visite autonome'} a été envoyée au propriétaire. Elle est en attente d'acceptation.`,
        [
          {
            text: 'Compris',
            onPress: () => {
              // La visite est maintenant affichée avec le badge "pending"
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error scheduling visit:', error);
      setLoading(false);

      if (error.message === 'NETWORK_ERROR_USE_MOCK' || error.message?.includes('Network Error')) {
        // Créer une demande de visite en mode hors ligne (statut pending)
        const offlineVisitRequest: VisitRequest = {
          id: `visit_offline_${Date.now()}`,
          status: 'pending',
          visitDate: selectedDate.toISOString(),
          visitTime: selectedTime,
          visitType: visitType,
          createdAt: new Date().toISOString(),
          message: notes
        };

        setCurrentVisitRequest(offlineVisitRequest);

        addActivity({
          userId: user.id,
          type: 'visit',
          title: 'Visite programmée (hors ligne)',
          description: `${visitType === 'physical' ? 'Visite physique' : visitType === 'virtual' ? 'Visite virtuelle' : 'Visite autonome'} programmée pour ${property?.title}`,
          status: 'pending',
          propertyId: property.id,
          propertyTitle: property?.title,
          metadata: {
            visitDate: selectedDate.toISOString(),
            visitTime: selectedTime,
            visitType: visitType,
            visitRequestId: offlineVisitRequest.id
          }
        });

        Alert.alert(
          'Mode hors ligne',
          'Votre demande a été enregistrée localement et sera envoyée dès la connexion.',
          [
            {
              text: 'Compris',
              onPress: () => {
                // La visite s'affiche avec le badge "pending"
              }
            }
          ]
        );
      } else {
        // Marquer la visite comme échouée
        const failedVisitRequest: VisitRequest = {
          id: `visit_failed_${Date.now()}`,
          status: 'failed',
          visitDate: selectedDate.toISOString(),
          visitTime: selectedTime,
          visitType: visitType,
          createdAt: new Date().toISOString(),
          message: notes
        };

        setCurrentVisitRequest(failedVisitRequest);

        Alert.alert('Erreur', error.message || 'Une erreur est survenue lors de l\'envoi de votre demande.');
      }
    }
  };

  const skipVisit = () => {
    Alert.alert(
      'Passer la visite ?',
      'Vous pouvez réserver directement sans visite préalable. Voulez-vous continuer ?',
      [
        {
          text: 'Oui, réserver directement',
          onPress: () => router.push({
            pathname: '/booking/bookingscreen',
            params: {
              property: JSON.stringify(property),
              skipVisit: 'true'
            }
          })
        },
        { text: 'Non, programmer une visite', style: 'cancel' }
      ]
    );
  };

  const renderVisitTypeCard = (
    type: VisitType,
    icon: string,
    title: string,
    description: string,
    features: string[]
  ) => {
    const isSelected = visitType === type;

    return (
      <TouchableOpacity
        onPress={() => setVisitType(type)}
        style={{ marginBottom: 10 }}
      >
        <MotiView
          animate={{
            scale: isSelected ? 1.01 : 1,
            borderColor: isSelected ? theme.primary : theme.outline + '30',
          }}
          transition={{ type: 'timing', duration: 200 }}
        >
          <ThemedView
            style={{
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: isSelected ? theme.primary : theme.outline + '30',
              overflow: 'hidden',
            }}
          >
            <LinearGradient
              colors={isSelected ? [theme.primary + '12', theme.primary + '05'] : [theme.surface, theme.surfaceVariant]}
              style={{ padding: 12 }}
            >
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ThemedView
                  style={{
                    backgroundColor: isSelected ? theme.primary : theme.outline + '40',
                    borderRadius: 12,
                    width: 44,
                    height: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12
                  }}
                >
                  <MaterialCommunityIcons
                    name={icon as any}
                    size={22}
                    color={isSelected ? 'white' : theme.onSurface + '80'}
                  />
                </ThemedView>
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText type="normal" intensity="strong" style={{ color: isSelected ? theme.primary : theme.onSurface, fontSize: 14, marginBottom: 2 }}>
                    {title}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 11, color: theme.onSurface + '70', lineHeight: 14 }}>
                    {description}
                  </ThemedText>
                </ThemedView>
                {isSelected && (
                  <MaterialCommunityIcons name="check-circle" size={20} color={theme.primary} />
                )}
              </ThemedView>

              {isSelected && (
                <MotiView
                  from={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ type: 'timing', duration: 250 }}
                >
                  <ThemedView
                    style={{
                      backgroundColor: theme.surface,
                      borderRadius: 8,
                      padding: 8,
                      marginTop: 8
                    }}
                  >
                    {features.map((feature, index) => (
                      <ThemedView key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: index < features.length - 1 ? 6 : 0 }}>
                        <Ionicons name="checkmark-circle" size={14} color={theme.success} />
                        <ThemedText style={{ fontSize: 11, color: theme.onSurface + '90', marginLeft: 6 }}>
                          {feature}
                        </ThemedText>
                      </ThemedView>
                    ))}
                  </ThemedView>
                </MotiView>
              )}
            </LinearGradient>
          </ThemedView>
        </MotiView>
      </TouchableOpacity>
    );
  };

  const renderTimeSlots = () => (
    <ThemedView style={{ marginTop: 12 }}>
      <ThemedView style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8
      }}>
        <ThemedText type="normal" intensity="strong" style={{ color: theme.onSurface, fontSize: 14 }}>
          Horaires disponibles
        </ThemedText>
        {selectedTime && (
          <ThemedView style={{
            backgroundColor: theme.primary + '15',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12
          }}>
            <ThemedText style={{ color: theme.primary, fontSize: 12, fontWeight: '600' }}>
              {selectedTime}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      <ThemedView style={{
        backgroundColor: theme.surfaceVariant,
        borderRadius: 12,
        padding: 10
      }}>
        <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {timeSlots.map((slot) => {
            const isSelected = selectedTime === slot.time;
            const isAvailable = slot.available;

            return (
              <TouchableOpacity
                key={slot.time}
                onPress={() => isAvailable && setSelectedTime(slot.time)}
                disabled={!isAvailable}
                style={{ width: 'auto' }}
              >
                <MotiView
                  animate={{
                    scale: isSelected ? 1.05 : 1,
                  }}
                  transition={{ type: 'timing', duration: 150 }}
                >
                  <ThemedView
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: isSelected
                        ? theme.primary
                        : isAvailable
                          ? theme.outline + '40'
                          : theme.outline + '20',
                      backgroundColor: isSelected
                        ? theme.primary
                        : slot.premium
                          ? theme.warning + '15'
                          : theme.surface,
                      opacity: isAvailable ? 1 : 0.4,
                      position: 'relative'
                    }}
                  >
                    {slot.premium && !isSelected && (
                      <ThemedView style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        backgroundColor: theme.warning,
                        borderRadius: 6,
                        width: 12,
                        height: 12,
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <MaterialCommunityIcons name="star" size={8} color="white" />
                      </ThemedView>
                    )}
                    <ThemedText
                      style={{
                        color: isSelected ? 'white' : isAvailable ? theme.onSurface : theme.onSurface + '50',
                        fontSize: 13,
                        fontWeight: isSelected ? '600' : '500'
                      }}
                    >
                      {slot.time}
                    </ThemedText>
                  </ThemedView>
                </MotiView>
              </TouchableOpacity>
            );
          })}
        </ThemedView>

        {/* Légende */}
        <ThemedView style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginTop: 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: theme.outline + '20'
        }}>
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <ThemedView style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.warning
            }} />
            <ThemedText style={{ fontSize: 10, color: theme.onSurface + '70' }}>
              Premium
            </ThemedText>
          </ThemedView>
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <ThemedView style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.outline + '40',
              opacity: 0.4
            }} />
            <ThemedText style={{ fontSize: 10, color: theme.onSurface + '70' }}>
              Indisponible
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14 }}>
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          style={{ marginBottom: 14 }}
        >
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <BackButton />
            <ThemedView style={{ flex: 1, marginLeft: 8 }}>
              <ThemedText type="title" intensity="strong" style={{ color: theme.onSurface, fontSize: 20 }}>
                Programmer une visite
              </ThemedText>
              <ThemedText style={{ fontSize: 12, color: theme.onSurface + '70', marginTop: 2 }} numberOfLines={1}>
                {property?.title || 'Propriété sélectionnée'}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Property Preview Card - Compact */}
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 100 }}
          >
            <ThemedView
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3
              }}
            >
              <Image
                source={{ uri: property.images?.[0] || 'https://via.placeholder.com/400x120' }}
                style={{ width: '100%', height: 120 }}
                resizeMode="cover"
              />
              <LinearGradient
                colors={[theme.surface, theme.surfaceVariant]}
                style={{ padding: 10 }}
              >
                <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <ThemedView>
                    <ThemedText type="normal" intensity="strong" style={{ color: theme.primary, fontSize: 16 }}>
                      {property.price?.toLocaleString()} €
                    </ThemedText>
                    <ThemedText style={{ fontSize: 10, color: theme.onSurface + '70', marginTop: 1 }}>
                      {property.listType === 'sale' ? 'Prix de vente' : 'Par mois'}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
                    <ThemedView style={{ alignItems: 'center' }}>
                      <MaterialCommunityIcons name="bed" size={16} color={theme.onSurface} />
                      <ThemedText style={{ fontSize: 10, color: theme.onSurface + '70', marginTop: 1 }}>
                        {property.bedrooms || 0}
                      </ThemedText>
                    </ThemedView>
                    <ThemedView style={{ alignItems: 'center' }}>
                      <MaterialCommunityIcons name="shower" size={16} color={theme.onSurface} />
                      <ThemedText style={{ fontSize: 10, color: theme.onSurface + '70', marginTop: 1 }}>
                        {property.bathrooms || 0}
                      </ThemedText>
                    </ThemedView>
                    <ThemedView style={{ alignItems: 'center' }}>
                      <MaterialCommunityIcons name="ruler-square" size={16} color={theme.onSurface} />
                      <ThemedText style={{ fontSize: 10, color: theme.onSurface + '70', marginTop: 1 }}>
                        {property.surface || 0}m²
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                </ThemedView>
              </LinearGradient>
            </ThemedView>
          </MotiView>
        </MotiView>

        {/* Visit Status Badge */}
        {currentVisitRequest && (
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 15, delay: 150 }}
            style={{ marginTop: 14 }}
          >
            <VisitStatusBadge status={currentVisitRequest.status} />
          </MotiView>
        )}

        {/* Visit Types */}
        <MotiView
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: 'spring', damping: 15, delay: 200 }}
        >
          <ThemedText type="normal" intensity="strong" style={{ color: theme.onSurface, fontSize: 14, marginBottom: 10, marginTop: 4 }}>
            Type de visite
          </ThemedText>

          {renderVisitTypeCard(
            'physical',
            'home-city',
            'Visite physique',
            'Rencontrez l\'agent sur place',
            [
              'Accompagnement personnalisé',
              'Découverte complète du bien',
              'Réponses à toutes vos questions',
              'Visite du quartier incluse'
            ]
          )}

          {renderVisitTypeCard(
            'virtual',
            'video',
            'Visite virtuelle',
            'Visite guidée en vidéo en direct',
            [
              'Visite en direct par vidéo',
              'Interaction avec l\'agent',
              'Depuis chez vous',
              'Enregistrement disponible'
            ]
          )}

          {renderVisitTypeCard(
            'self-guided',
            'key',
            'Visite autonome',
            'Accès sécurisé sans rendez-vous',
            [
              'Accès par code sécurisé',
              'À votre rythme',
              'Disponible 24/7',
              'Support à distance disponible'
            ]
          )}
        </MotiView>

        {/* Date Selection */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 15, delay: 300 }}
          style={{ marginTop: 16 }}
        >
          <ThemedText type="normal" intensity="strong" style={{ color: theme.onSurface, fontSize: 14, marginBottom: 8 }}>
            Date et heure
          </ThemedText>
          <TouchableOpacity
            onPress={() => setShowDatePicker(!showDatePicker)}
            style={{
              backgroundColor: theme.surface,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme.outline + '30',
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="calendar" size={20} color={theme.primary} />
              <ThemedText style={{ marginLeft: 10, color: theme.onSurface, fontSize: 13 }}>
                {selectedDate.toLocaleDateString('fr-FR', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </ThemedText>
            </ThemedView>
            <MaterialCommunityIcons
              name={showDatePicker ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.onSurface}
            />
          </TouchableOpacity>

          {showDatePicker && (
            <MotiView
              from={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ type: 'timing', duration: 200 }}
              style={{ marginTop: 8 }}
            >
              <ThemedView
                style={{
                  backgroundColor: theme.surfaceVariant,
                  borderRadius: 10,
                  padding: 10,
                  borderWidth: 1,
                  borderColor: theme.outline + '20'
                }}
              >
                <DatePicker
                  date={selectedDate}
                  onDateChange={(date) => {
                    setSelectedDate(date);
                    setShowDatePicker(false);
                  }}
                  minimumDate={new Date()}
                />
              </ThemedView>
            </MotiView>
          )}
        </MotiView>

        {/* Time Slots */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 15, delay: 400 }}
        >
          {renderTimeSlots()}
        </MotiView>

        {/* Number of Visitors */}
        {visitType === 'physical' && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 15, delay: 500 }}
            style={{ marginTop: 14 }}
          >
            <ThemedText type="normal" intensity="strong" style={{ color: theme.onSurface, fontSize: 14, marginBottom: 8 }}>
              Nombre de visiteurs
            </ThemedText>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setVisitors(Math.max(1, visitors - 1))}
                style={{
                  backgroundColor: theme.surface,
                  borderRadius: 10,
                  width: 42,
                  height: 42,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: theme.outline + '30'
                }}
              >
                <MaterialCommunityIcons name="minus" size={20} color={theme.onSurface} />
              </TouchableOpacity>
              <ThemedView
                style={{
                  flex: 1,
                  backgroundColor: theme.surfaceVariant,
                  borderRadius: 10,
                  padding: 10,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: theme.primary + '40'
                }}
              >
                <ThemedText type="normal" intensity="strong" style={{ color: theme.primary, fontSize: 15 }}>
                  {visitors} {visitors > 1 ? 'personnes' : 'personne'}
                </ThemedText>
              </ThemedView>
              <TouchableOpacity
                onPress={() => setVisitors(Math.min(6, visitors + 1))}
                style={{
                  backgroundColor: theme.primary,
                  borderRadius: 10,
                  width: 42,
                  height: 42,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <MaterialCommunityIcons name="plus" size={20} color="white" />
              </TouchableOpacity>
            </ThemedView>
          </MotiView>
        )}

        {/* Action Buttons */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 15, delay: 600 }}
          style={{ marginTop: 20, gap: 10, marginBottom: 20 }}
        >
          {/* Afficher des boutons différents selon le statut de la visite */}
          {!currentVisitRequest ? (
            <>
              {/* Pas encore de visite programmée */}
              <CustomButton
                title="Envoyer la demande de visite"
                onPress={scheduleVisit}
                loading={loading}
                type="primary"
              />

              <CustomButton
                title="Passer la visite"
                onPress={skipVisit}
                type="outline"
              />
            </>
          ) : currentVisitRequest.status === 'pending' ? (
            <>
              {/* Visite en attente d'approbation */}
              <ThemedView style={{
                backgroundColor: theme.warning + '10',
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: theme.warning + '30',
                marginBottom: 10
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={20}
                    color={theme.warning}
                  />
                  <ThemedText type="normal" intensity="strong" style={{
                    color: theme.warning,
                    fontSize: 14,
                    marginLeft: 8
                  }}>
                    En attente d'approbation
                  </ThemedText>
                </View>
                <ThemedText style={{
                  fontSize: 13,
                  color: theme.onSurface + '80',
                  lineHeight: 18
                }}>
                  Votre demande a été envoyée au propriétaire. Vous recevrez une notification dès qu'il aura répondu.
                </ThemedText>
              </ThemedView>

              <CustomButton
                title="Annuler et choisir un autre créneau"
                onPress={() => setCurrentVisitRequest(null)}
                type="outline"
              />
            </>
          ) : currentVisitRequest.status === 'accepted' ? (
            <>
              {/* Visite acceptée - Peut passer à la réservation */}
              <CustomButton
                title="Passer à la réservation"
                onPress={() => router.push({
                  pathname: '/booking/bookingscreen',
                  params: {
                    property: JSON.stringify(property),
                    visitScheduled: 'true',
                    visitType: currentVisitRequest.visitType,
                    visitId: currentVisitRequest.id
                  }
                })}
                type="primary"
              />

              <CustomButton
                title="Retour"
                onPress={() => router.back()}
                type="outline"
              />
            </>
          ) : currentVisitRequest.status === 'rejected' ? (
            <>
              {/* Visite refusée - Peut réessayer */}
              <ThemedView style={{
                backgroundColor: theme.error + '10',
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: theme.error + '30',
                marginBottom: 10
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={20}
                    color={theme.error}
                  />
                  <ThemedText type="normal" intensity="strong" style={{
                    color: theme.error,
                    fontSize: 14,
                    marginLeft: 8
                  }}>
                    Demande refusée
                  </ThemedText>
                </View>
                <ThemedText style={{
                  fontSize: 13,
                  color: theme.onSurface + '80',
                  lineHeight: 18
                }}>
                  Le propriétaire a refusé ce créneau. Essayez un autre horaire ou contactez-le directement.
                </ThemedText>
              </ThemedView>

              <CustomButton
                title="Choisir un autre créneau"
                onPress={() => setCurrentVisitRequest(null)}
                type="primary"
              />

              <CustomButton
                title="Passer la visite et réserver"
                onPress={skipVisit}
                type="outline"
              />
            </>
          ) : (
            <>
              {/* Visite échouée - Peut réessayer */}
              <CustomButton
                title="Réessayer l'envoi"
                onPress={scheduleVisit}
                loading={loading}
                type="primary"
              />

              <CustomButton
                title="Passer la visite"
                onPress={skipVisit}
                type="outline"
              />
            </>
          )}
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VisitScreen;
