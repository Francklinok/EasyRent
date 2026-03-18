import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { useActivity } from '@/components/contexts/activity/ActivityContext';
import { getBookingService } from '@/services/api/bookingService';
import { ItemType } from '@/types/ItemType';
import { CustomButton, DatePicker } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/components/contexts/language';

// Types - Utiliser les valeurs exactes du backend
type VisitType = 'physical' | 'virtual' | 'self-guided';
type VisitStatus = 'PENDING' | 'ACCEPTED' | 'REFUSED' | 'CANCELLED';
type TimeSlot = { time: string; available: boolean; premium?: boolean };

interface VisitRequest {
  id: string;
  visiteStatus: VisitStatus;
  visitDate: string;
  visitTime: string;
  visitType: VisitType;
  createdAt: string;
  message?: string;
  rejectionReason?: string;
}

// Note: STATUS_CONFIG is now created inside the component to access t() function

// Status Badge Component
const VisitStatusBadge: React.FC<{ status: VisitStatus }> = ({ status }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const colorMap: Record<VisitStatus, string> = {
    PENDING: theme.warning,
    ACCEPTED: theme.success,
    REFUSED: theme.error,
    CANCELLED: theme.error
  };

  const STATUS_CONFIG: Record<VisitStatus, { color: string; icon: string; label: string; description: string }> = {
    PENDING: { color: '', icon: 'clock-outline', label: t('visit.statusPending'), description: t('visit.statusPendingDesc') },
    ACCEPTED: { color: '', icon: 'check-circle', label: t('visit.statusAccepted'), description: t('visit.statusAcceptedDesc') },
    REFUSED: { color: '', icon: 'close-circle', label: t('visit.statusRefused'), description: t('visit.statusRefusedDesc') },
    CANCELLED: { color: '', icon: 'alert-circle', label: t('visit.statusCancelled'), description: t('visit.statusCancelledDesc') }
  };

  const config = STATUS_CONFIG[status];
  const color = colorMap[status];

  return (
    <ThemedView style={{
      backgroundColor: color + '10',
      borderRadius: 14,
      padding: 16,
      borderWidth: 1.5,
      borderColor: color + '40',
      marginBottom: 10
    }}>
      <ThemedView backgroundColor="transparent" style={{ flexDirection: 'row', alignItems: 'center' }}>
        <ThemedView style={{
          width: 40, height: 40, borderRadius: 20,
          backgroundColor: color + '20',
          alignItems: 'center', justifyContent: 'center', marginRight: 12
        }}>
          <MaterialCommunityIcons name={config.icon as any} size={22} color={color} />
        </ThemedView>
        <ThemedView backgroundColor="transparent" style={{ flex: 1 }}>
          <ThemedText style={{ color, fontSize: 16, fontWeight: '600', marginBottom: 2 }}>
            {t('visit.title')} {config.label.toLowerCase()}
          </ThemedText>
          <ThemedText style={{ fontSize: 12, color: theme.onSurface + '70' }}>
            {config.description}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};

const VisitScreen = () => {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user, isAuthenticated, initializing } = useAuth();
  const { addActivity } = useActivity();
  const bookingService = getBookingService();

  // Parse property from params - instant loading with pre-loaded data
  const property = useMemo<ItemType | null>(() => {
    try {
      if (!params.property) {
        return null;
      }
      if (typeof params.property === 'object') {
        return params.property as unknown as ItemType;
      }
      const trimmed = (params.property as string).trim();
      if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
        return null;
      }
      const parsed = JSON.parse(trimmed) as ItemType;

      // Ensure we have an id field - use _id if id is not present
      const finalProperty = {
        ...parsed,
        id: parsed.id || (parsed as any)._id
      };

      return finalProperty;
    } catch {
      return null;
    }
  }, [params.property]);

  // State
  const [isLoadingVisit, setIsLoadingVisit] = useState(true);
  const [loading, setLoading] = useState(false);
  const [visitType, setVisitType] = useState<VisitType>('physical');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [visitors, setVisitors] = useState(1);
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentVisitRequest, setCurrentVisitRequest] = useState<VisitRequest | null>(null);

  // Load existing visit from backend
  const loadVisit = useCallback(async () => {
    const propertyId = property?.id || (property as any)?._id;
    const userId = user?.id || (user as any)?._id;

    if (!propertyId || !userId) {
      setIsLoadingVisit(false);
      return;
    }

    setIsLoadingVisit(true);

    try {
      const existingVisit = await bookingService.getUserVisitForProperty(propertyId, userId);

      if (existingVisit) {
        // Vérifier si c'est une visite (pas une réservation)
        if (existingVisit.isReservation === true) {
          setCurrentVisitRequest(null);
          setIsLoadingVisit(false);
          return;
        }

        // Extraire le statut directement du backend
        const rawStatus = existingVisit.visiteStatus || existingVisit.status || 'PENDING';
        const backendStatus = rawStatus.toUpperCase() as VisitStatus;

        const visitRequest: VisitRequest = {
          id: existingVisit._id || existingVisit.id,
          visiteStatus: backendStatus,
          visitDate: existingVisit.visitDate,
          visitTime: existingVisit.visitDate
            ? new Date(existingVisit.visitDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            : '',
          visitType: 'physical',
          createdAt: existingVisit.createdAt || new Date().toISOString(),
          message: existingVisit.message,
          rejectionReason: existingVisit.rejectionReason || existingVisit.reason || ''
        };

        setCurrentVisitRequest(visitRequest);
      } else {
        setCurrentVisitRequest(null);
      }
    } catch {
      setCurrentVisitRequest(null);
    } finally {
      setIsLoadingVisit(false);
    }
  }, [property, user, bookingService]);

  // Time slots
  const timeSlots: TimeSlot[] = [
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

  // Schedule visit
  const scheduleVisit = async () => {
    if (!selectedTime) {
      Alert.alert(t('visit.attention'), t('visit.selectTime'));
      return;
    }

    if (!user?.id || !property?.id) {
      Alert.alert(t('common.error'), t('visit.missingInfo'));
      return;
    }

    try {
      setLoading(true);

      // Vérifier que l'utilisateur n'est pas le propriétaire
      const propertyDetails = await bookingService.getPropertyDetails(property.id);
      if (propertyDetails.ownerId === user.id) {
        Alert.alert(t('visit.notAuthorized'), t('visit.ownPropertyMsg'));
        return;
      }

      // Vérifier les conflits de créneaux
      const conflictCheck = await bookingService.checkTimeSlotConflict(property.id, selectedDate.toISOString(), selectedTime);
      if (conflictCheck.hasConflict) {
        Alert.alert(t('visit.slotTaken'), t('visit.slotTakenMsg'));
        return;
      }

      // Extract selected unit info if present (passed from info page)
      const selectedUnit = (property as any)?._selectedUnit;

      // Créer la visite
      const result = await bookingService.createVisitRequest({
        propertyId: property.id,
        clientId: user.id,
        visitDate: selectedDate.toISOString(),
        visitTime: selectedTime,
        visitType: visitType,
        numberOfVisitors: visitors,
        message: notes,
        unitId: selectedUnit?.roomId,
        unitName: selectedUnit?.roomName,
      }, property?.title, `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Client');

      // Mettre à jour l'état local
      const visitRequest: VisitRequest = {
        id: result?.visitId || `visit_${Date.now()}`,
        visiteStatus: 'PENDING',
        visitDate: selectedDate.toISOString(),
        visitTime: selectedTime,
        visitType: visitType,
        createdAt: new Date().toISOString(),
        message: notes
      };

      setCurrentVisitRequest(visitRequest);

      // Ajouter l'activité
      addActivity({
        userId: user.id,
        type: 'visit',
        title: t('visit.visitScheduled'),
        description: t('visit.visitScheduledDesc', { title: property?.title }),
        status: 'pending',
        propertyId: property.id,
        propertyTitle: property?.title,
        metadata: { visitRequestId: visitRequest.id }
      });

      Alert.alert(t('visit.requestSent'), t('visit.requestSentMsg'));
    } catch (error: any) {
      console.error('Error scheduling visit:', error);
      Alert.alert(t('common.error'), error.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  // Skip visit and go to booking
  const skipVisit = () => {
    Alert.alert(
      t('visit.skipVisitTitle'),
      t('visit.skipVisitMsg'),
      [
        {
          text: t('visit.yesBookDirectly'),
          onPress: () => router.push({
            pathname: '/booking/Bookingscreen',
            params: { property: JSON.stringify(property), skipVisit: 'true' }
          })
        },
        { text: t('visit.noScheduleVisit'), style: 'cancel' }
      ]
    );
  };

  // Go to booking after visit accepted
  const goToBooking = () => {
    router.replace({
      pathname: '/booking/Bookingscreen',
      params: {
        property: JSON.stringify(property),
        visitScheduled: 'true',
        visitType: currentVisitRequest?.visitType || 'physical',
        visitId: currentVisitRequest?.id || ''
      }
    });
  };

  // Effects
  useEffect(() => {
    loadVisit();
  }, [loadVisit]);

  useFocusEffect(
    useCallback(() => {
      loadVisit();
    }, [loadVisit])
  );

  useEffect(() => {
    if (!initializing && !isAuthenticated) {
      Alert.alert(t('auth.loginRequired'), t('auth.loginRequiredMsg'), [
        { text: t('auth.login'), onPress: () => router.push('/Auth/Login') },
        { text: t('common.cancel'), onPress: () => router.back(), style: 'cancel' }
      ]);
    }
  }, [initializing, isAuthenticated, t]);

  // Render visit type card
  const renderVisitTypeCard = (type: VisitType, icon: string, title: string, description: string, features: string[]) => {
    const isSelected = visitType === type;
    return (
      <TouchableOpacity onPress={() => setVisitType(type)} style={{ marginBottom: 12 }}>
        <ThemedView style={{ borderRadius: 14, borderWidth: 1, borderColor: theme.outline, overflow: 'hidden', padding: 10 }}>
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 4 }}>
            <ThemedView style={{
              backgroundColor: isSelected ? theme.primary : theme.outline + '40',
              borderRadius: 10, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: 12
            }}>
              <MaterialCommunityIcons name={icon as any} size={22} color={isSelected ? 'white' : theme.onSurface + '80'} />
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText type="normal" style={{ marginBottom: 4 }}>{title}</ThemedText>
              <ThemedText type="caption" intensity="light" style={{ lineHeight: 14 }}>{description}</ThemedText>
            </ThemedView>
            {isSelected && <MaterialCommunityIcons name="check-circle" size={20} color={theme.success} />}
          </ThemedView>
          {isSelected && (
            <ThemedView style={{ borderRadius: 8, paddingLeft: 4, marginTop: 2 }}>
              {features.map((feature, index) => (
                <ThemedView key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: index < features.length - 1 ? 6 : 0 }}>
                  <Ionicons name="checkmark-circle" size={14} color={theme.success} />
                  <ThemedText type="body" intensity="light" style={{ marginLeft: 8 }}>{feature}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          )}
        </ThemedView>
      </TouchableOpacity>
    );
  };

  // Render time slots
  const renderTimeSlots = () => (
    <ThemedView style={{ marginTop: 12 }}>
      <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <ThemedText type="normal">{t('visit.availableSlots')}</ThemedText>
        {selectedTime && (
          <ThemedView style={{ backgroundColor: theme.primary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
            <ThemedText style={{ color: theme.primary, fontSize: 12, fontWeight: '600' }}>{selectedTime}</ThemedText>
          </ThemedView>
        )}
      </ThemedView>
      <ThemedView style={{ borderRadius: 12, padding: 10 }}>
        <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {timeSlots.map((slot) => {
            const isSelected = selectedTime === slot.time;
            return (
              <TouchableOpacity
                key={slot.time}
                onPress={() => slot.available && setSelectedTime(slot.time)}
                disabled={!slot.available}
                style={{
                  paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1,
                  borderColor: isSelected ? theme.primary : theme.outline + '70',
                  backgroundColor: isSelected ? theme.primary : slot.premium ? theme.warning + '15' : theme.surface,
                  opacity: slot.available ? 1 : 0.4, marginBottom: 2, marginRight: 6
                }}
              >
                {slot.premium && !isSelected && (
                  <ThemedView style={{
                    position: 'absolute', top: -4, right: -4, backgroundColor: theme.warning,
                    borderRadius: 6, width: 12, height: 12, alignItems: 'center', justifyContent: 'center'
                  }}>
                    <MaterialCommunityIcons name="star" size={8} color="white" />
                  </ThemedView>
                )}
                <ThemedText type="body" style={{
                  color: isSelected ? 'white' : slot.available ? theme.onSurface : theme.onSurface + '50',
                  fontWeight: isSelected ? '600' : '500'
                }}>
                  {slot.time}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );

  // Loading state
  if (isLoadingVisit) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText style={{ marginTop: 16 }}>{t('visit.loading')}</ThemedText>
      </ThemedView>
    );
  }

  // Error state - no property
  if (!property) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <MaterialCommunityIcons name="alert-circle" size={64} color={theme.error} />
        <ThemedText style={{ fontSize: 18, fontWeight: '600', marginTop: 16, textAlign: 'center', color: theme.error }}>
          {t('visit.errorLoading')}
        </ThemedText>
        <ThemedText style={{ fontSize: 14, color: theme.onSurface + '70', marginTop: 8, textAlign: 'center' }}>
          {t('visit.errorLoadingMsg')}
        </ThemedText>
        <CustomButton title={t('common.back')} onPress={() => router.back()} className="mt-6" />
      </ThemedView>
    );
  }

  // Visit already accepted - show success and button to continue
  if (currentVisitRequest?.visiteStatus === 'ACCEPTED') {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <MaterialCommunityIcons name="check-circle" size={80} color={theme.success} />
        <ThemedText type="normaltitle" style={{ color: theme.success, marginTop: 16, textAlign: 'center' }}>
          {t('visit.visitAccepted')}
        </ThemedText>
        <ThemedText type="normal" style={{ marginTop: 8, textAlign: 'center', lineHeight: 22 }}>
          {t('visit.visitAcceptedMsg')}
        </ThemedText>
        <CustomButton
          title={t('visit.continueToBooking')}
          onPress={goToBooking}
          className="mt-6 w-full"
        />
        <CustomButton title={t('common.back')} onPress={() => router.back()} type="outline" className="mt-3 w-full" />
      </ThemedView>
    );
  }

  // Main render
  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: insets.bottom + 10 }}>
        {/* Header */}
        <ThemedView>
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 1 }}>
            <ThemedView style={{ flex: 1, alignItems: 'center' }}>
              <ThemedText type="normaltitle" numberOfLines={1}>
                {property?.title || 'Propriété sélectionnée'}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Visit Status Badge */}
        {currentVisitRequest && <VisitStatusBadge status={currentVisitRequest.visiteStatus} />}

        {/* Visit Types */}
        <ThemedView>
          <ThemedText type="normal" style={{ marginBottom: 10, marginTop: 4 }}>{t('visit.visitType')}</ThemedText>
          {renderVisitTypeCard('physical', 'home-city', t('visit.physicalVisit'), t('visit.physicalVisitDesc'), [t('visit.physicalFeature1'), t('visit.physicalFeature2')])}
          {renderVisitTypeCard('virtual', 'video', t('visit.virtualVisit'), t('visit.virtualVisitDesc'), [t('visit.virtualFeature1'), t('visit.virtualFeature2')])}
          {renderVisitTypeCard('self-guided', 'key', t('visit.selfGuidedVisit'), t('visit.selfGuidedVisitDesc'), [t('visit.selfGuidedFeature1'), t('visit.selfGuidedFeature2')])}
        </ThemedView>

        {/* Date Selection */}
        <ThemedView style={{ marginTop: 2 }}>
          <ThemedText type="normal" style={{ marginBottom: 6 }}>{t('visit.dateAndTime')}</ThemedText>
          <TouchableOpacity
            onPress={() => setShowDatePicker(!showDatePicker)}
            style={{
              backgroundColor: theme.surface, borderRadius: 10, borderWidth: 1, borderColor: theme.outline + '30',
              padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
            }}
          >
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="calendar" size={20} color={theme.primary} />
              <ThemedText type="normal" style={{ marginLeft: 10 }}>
                {selectedDate.toLocaleDateString('fr-FR', { weekday: 'short', month: 'short', day: 'numeric' })}
              </ThemedText>
            </ThemedView>
            <MaterialCommunityIcons name={showDatePicker ? "chevron-up" : "chevron-down"} size={20} color={theme.onSurface} />
          </TouchableOpacity>

          {showDatePicker && (
            <ThemedView style={{ marginTop: 8 }}>
              <DatePicker date={selectedDate} onDateChange={(date) => { setSelectedDate(date); setShowDatePicker(false); }} minimumDate={new Date()} />
            </ThemedView>
          )}
        </ThemedView>

        {/* Time Slots */}
        <ThemedView>{renderTimeSlots()}</ThemedView>

        {/* Number of Visitors */}
        {visitType === 'physical' && (
          <ThemedView style={{ marginTop: 8 }}>
            <ThemedText type="normal" style={{ marginBottom: 8 }}>{t('visit.numberOfVisitors')}</ThemedText>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity onPress={() => setVisitors(Math.max(1, visitors - 1))} style={{
                backgroundColor: theme.surface, borderRadius: 10, width: 42, height: 42,
                alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.outline + '30'
              }}>
                <MaterialCommunityIcons name="minus" size={20} color={theme.onSurface} />
              </TouchableOpacity>
              <ThemedView style={{
                flex: 1, backgroundColor: theme.surfaceVariant, borderRadius: 10, padding: 10,
                alignItems: 'center', borderWidth: 1, borderColor: theme.outline + '30'
              }}>
                <ThemedText type="normal">
                  {visitors} {visitors > 1 ? t('visit.people') : t('visit.person')}
                </ThemedText>
              </ThemedView>
              <TouchableOpacity onPress={() => setVisitors(Math.min(6, visitors + 1))} style={{
                backgroundColor: theme.primary, borderRadius: 10, width: 42, height: 42, alignItems: 'center', justifyContent: 'center'
              }}>
                <MaterialCommunityIcons name="plus" size={20} color="white" />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        )}

        {/* Action Buttons */}
        <ThemedView style={{ marginTop: 14, gap: 10, marginBottom: 14 }}>
          {!currentVisitRequest ? (
            // No visit request - show create buttons
            <>
              <CustomButton title={t('visit.sendRequest')} onPress={scheduleVisit} loading={loading} type="secondary" />
              <CustomButton title={t('visit.skipToBooking')} onPress={skipVisit} type="success" />
            </>
          ) : currentVisitRequest.visiteStatus === 'PENDING' ? (
            // Pending visit
            <>
              <ThemedView style={{
                backgroundColor: theme.warning + '10', borderRadius: 12, padding: 16,
                borderWidth: 1, borderColor: theme.warning + '30', marginBottom: 10
              }}>
                <ThemedView backgroundColor="transparent" style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color={theme.warning} />
                  <ThemedText style={{ color: theme.warning, fontSize: 14, marginLeft: 8, fontWeight: '600' }}>{t('visit.pendingApproval')}</ThemedText>
                </ThemedView>
                <ThemedText style={{ fontSize: 13, color: theme.onSurface + '80', lineHeight: 18 }}>
                  {t('visit.pendingApprovalMsg')}
                </ThemedText>
              </ThemedView>
              <CustomButton title={t('visit.refreshStatus')} onPress={loadVisit} type="outline" />
            </>
          ) : currentVisitRequest.visiteStatus === 'REFUSED' ? (
            // Refused visit
            <>
              <ThemedView style={{
                backgroundColor: theme.error + '10', borderRadius: 12, padding: 16,
                borderWidth: 1, borderColor: theme.error + '30', marginBottom: 10
              }}>
                <ThemedView backgroundColor="transparent" style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <MaterialCommunityIcons name="close-circle" size={20} color={theme.error} />
                  <ThemedText style={{ color: theme.error, fontSize: 14, marginLeft: 8, fontWeight: '600' }}>{t('visit.requestRefused')}</ThemedText>
                </ThemedView>
                <ThemedText style={{ fontSize: 13, color: theme.onSurface + '80', lineHeight: 18 }}>
                  {t('visit.requestRefusedMsg')}
                </ThemedText>
                {currentVisitRequest.rejectionReason && (
                  <ThemedView style={{
                    backgroundColor: theme.surface, borderRadius: 8, padding: 12, marginTop: 12,
                    borderLeftWidth: 3, borderLeftColor: theme.error
                  }}>
                    <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60', fontWeight: '600', marginBottom: 4 }}>{t('visit.refusalReason')}</ThemedText>
                    <ThemedText style={{ fontSize: 13, color: theme.onSurface + '90', lineHeight: 18, fontStyle: 'italic' }}>
                      "{currentVisitRequest.rejectionReason}"
                    </ThemedText>
                  </ThemedView>
                )}
              </ThemedView>
              <CustomButton title={t('visit.chooseAnotherSlot')} onPress={() => setCurrentVisitRequest(null)} type="primary" />
              <CustomButton title={t('visit.skipAndBook')} onPress={skipVisit} type="outline" />
            </>
          ) : (
            // Other status (CANCELLED etc)
            <>
              <CustomButton title={t('visit.newRequest')} onPress={() => setCurrentVisitRequest(null)} type="primary" />
              <CustomButton title={t('visit.skipToBooking')} onPress={skipVisit} type="outline" />
            </>
          )}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
};

export default VisitScreen;
