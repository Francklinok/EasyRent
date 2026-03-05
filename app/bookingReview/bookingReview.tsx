import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useBooking, BookingReservation } from '@/components/contexts/booking/BookingContext';
import { useTheme } from '@/hooks/themehook';
import { router } from 'expo-router';
import { getBookingService } from '@/services/api/bookingService';
import { getActivityService } from '@/services/api/activityService';
import { useAuthUser } from '@/components/contexts/authContext/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/components/contexts/language';
import { SelectPaymentMethod } from '@/components/wallets/payment/SelectPaymentMethod';
import { MobileMoneyForm } from '@/components/wallets/payment/MobileMoneyForm';
import CardPaymentForm from '@/components/wallets/payment/CardPaymentForm';
import PayPalPaymentForm from '@/components/wallets/payment/PayPalPaymentForm';
import { UserAction, PaymentConfig, PaymentMethodType, MobileMoneyConfig } from '@/types/payment';
import { simulatePayment, formatXOF } from '@/utils/simulatePayment';


const { width } = Dimensions.get('window');

const PAYMENT_DEADLINE_DAYS = 3;

function parseTimestamp(raw: string | number): Date {
  const n = Number(raw);
  return isNaN(n) ? new Date(raw) : new Date(n);
}

function getPaymentDeadline(createdAt: string): Date {
  const deadline = parseTimestamp(createdAt);
  deadline.setDate(deadline.getDate() + PAYMENT_DEADLINE_DAYS);
  return deadline;
}

function getTimeRemaining(deadline: Date): { days: number; hours: number; minutes: number; seconds: number; expired: boolean } {
  const now = new Date().getTime();
  const diff = deadline.getTime() - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    expired: false
  };
}

export default function BookingReview() {
  const route = useRoute();
  const { reservationId, propertyId } = route.params as { reservationId: string; propertyId?: string };
  const { theme } = useTheme();
  const { getReservation } = useBooking();
  const bookingService = getBookingService();
  const user = useAuthUser();
  const  insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const [reservation, setReservation] = useState<BookingReservation | null>(null);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  // Prolongation state
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionMode, setExtensionMode] = useState<'days' | 'date'>('days');
  const [extensionDays, setExtensionDays] = useState('');
  const [extensionDate, setExtensionDate] = useState<Date>(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
  const [extensionLoading, setExtensionLoading] = useState(false);

  // Payment flow state (mirrors Wallet.tsx pattern)
  const [paymentSection, setPaymentSection] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentConfig | PaymentMethodType | null>(null);

  // Payment success state
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [generatingContract, setGeneratingContract] = useState(false);
  const [contractUri, setContractUri] = useState<string | null>(null);

  // Cancellation state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    const loadBookingData = async () => {
      if (!reservationId || !propertyId || !user) {
        setLoading(false);
        return;
      }

      try {
        const booking = await bookingService.getUserBookingForProperty(propertyId, user.id);
        console.log('[BookingReview] booking data:', JSON.stringify(booking));
        setReservation(booking);

        const propertyDetails = await bookingService.getPropertyDetails(propertyId);
        setProperty(propertyDetails);
      } catch (error) {
        console.error('Error loading booking data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBookingData();
  }, [reservationId, propertyId, user]);

  const resolveEffectiveDeadline = (res: any): Date | null => {
    if (res?.extensionStatus === 'ACCEPTED' && res?.extensionGrantedDeadline) {
      return parseTimestamp(res.extensionGrantedDeadline);
    }
    if (res?.paymentDeadline) return parseTimestamp(res.paymentDeadline);
    if (res?.createdAt) return getPaymentDeadline(res.createdAt);
    return null;
  };

  // Countdown timer
  useEffect(() => {
    const rawReservation = reservation as any;
    const deadlineDate = resolveEffectiveDeadline(rawReservation);

    if (!deadlineDate || isNaN(deadlineDate.getTime())) return;

    const updateCountdown = () => {
      setTimeRemaining(getTimeRemaining(deadlineDate));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [reservation]);

  const calculateTotal = () => {
    if (property?.price) return property.price;
    if (property?.monthlyRent) return property.monthlyRent;
    if (property?.ownerCriteria?.monthlyRent) return property.ownerCriteria.monthlyRent;
    if (reservation?.monthlyRent) return reservation.monthlyRent;
    return 20; 
  };

  const buildUserAction = (): UserAction => {
    const acceptedMethods =
      property?.acceptedPaymentMethods?.length
        ? property.acceptedPaymentMethods
        : property?.ownerCriteria?.acceptedPaymentMethods?.length
        ? property.ownerCriteria.acceptedPaymentMethods
        : undefined;

    return {
      id: (reservation as any)?._id || (reservation as any)?.id || 'booking',
      type: 'reservation',
      title: property?.title || 'Réservation',
      description: property?.address,
      amount: calculateTotal(),
      currency: property?.ownerCriteria?.currency || 'XOF',
      status: 'pending',
      dueDate: resolveEffectiveDeadline(reservation as any) ?? undefined,
      createdAt: new Date(),
      metadata: {
        propertyId: propertyId,
        propertyName: property?.title,
        reservationId: (reservation as any)?._id || (reservation as any)?.id,
        acceptedPaymentMethods: acceptedMethods,
      },
    };
  };

  const handleContinue = () => {
    setPaymentSection('select-payment-method');
  };

  const handlePaymentSuccess = () => {
    setPaymentSection(null);
    setSelectedMethod(null);
    setPaymentSuccess(true);
  };

  const handleGenerateContract = async () => {
    const activityId = (reservation as any)?._id || (reservation as any)?.id || reservationId;
    const amount = calculateTotal();
    setGeneratingContract(true);
    const result = await simulatePayment({ activityId, amount, delayMs: 800 });
    setGeneratingContract(false);
    if (result.success && result.contractUri) {
      setContractUri(result.contractUri);
      router.push({
        pathname: '/contrat/ContratScreen',
        params: { activityId, paymentStatus: 'completed' },
      } as any);
    } else {
      Alert.alert('Erreur', result.message);
    }
  };

  const handlePaymentMethodSelect = (method: PaymentConfig | PaymentMethodType) => {
    setSelectedMethod(method);
    const methodType = typeof method === 'string' ? method : method.type;
    switch (methodType) {
      case 'mobile_money':
        setPaymentSection('mobile-money-form');
        break;
      case 'bank_card':
        setPaymentSection('bank-card-form');
        break;
      case 'paypal':
        setPaymentSection('paypal-form');
        break;
      default:
        Alert.alert('Méthode sélectionnée', `Paiement via ${methodType}`);
        setPaymentSection(null);
    }
  };

  const handleRequestExtension = async () => {
    if (!reservation) return;
    const activityId = (reservation as any).id || (reservation as any)._id;
    if (!activityId) return;

    try {
      setExtensionLoading(true);
      const days = extensionMode === 'days' ? (parseInt(extensionDays, 10) || undefined) : undefined;
      const date = extensionMode === 'date' ? extensionDate.toISOString() : undefined;
      const updated = await bookingService.requestPaymentExtension(activityId, days, date);
      setReservation((prev: any) => ({ ...prev, ...updated }));
      setShowExtensionModal(false);
      Alert.alert('Demande envoyée', 'Votre demande de prolongation a été envoyée au propriétaire.');
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible d\'envoyer la demande.');
    } finally {
      setExtensionLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!reservation) return;
    const activityId = (reservation as any).id || (reservation as any)._id || reservationId;
    if (!activityId) return;

    try {
      setCancelLoading(true);
      const activityService = getActivityService();
      await activityService.cancelActivity(activityId, cancelReason.trim() || 'Annulation par le client');
      setCancelled(true);
      setShowCancelModal(false);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible d\'annuler la réservation.');
    } finally {
      setCancelLoading(false);
    }
  };

  const res = reservation as any;
  const paymentDeadline = resolveEffectiveDeadline(res);
  const extensionStatus: string | null = res?.extensionStatus ?? null;
  const isUrgent = timeRemaining.days === 0 && !timeRemaining.expired;

  if (loading) {
    return (
      <ThemedView >
        <ThemedView style={styles.loadingContainer}>
          <ThemedText type ="normaltitle">{t('common.loading')}</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  // Payment flow sections 
  if (paymentSection === 'select-payment-method') {
    return (
      <SelectPaymentMethod
        action={buildUserAction()}
        onSelect={handlePaymentMethodSelect}
        onBack={() => setPaymentSection(null)}
      />
    );
  }

  if (paymentSection === 'mobile-money-form') {
    return (
      <MobileMoneyForm
        action={buildUserAction()}
        existingConfig={
          selectedMethod && typeof selectedMethod !== 'string' && selectedMethod.type === 'mobile_money'
            ? selectedMethod as MobileMoneyConfig
            : undefined
        }
        onBack={() => setPaymentSection('select-payment-method')}
        onSuccess={handlePaymentSuccess}
      />
    );
  }

  if (paymentSection === 'bank-card-form') {
    return (
      <CardPaymentForm
        renderAsPage={true}
        amount={calculateTotal()}
        currency="XOF"
        isLoading={false}
        onBack={() => setPaymentSection('select-payment-method')}
        onConfirm={handlePaymentSuccess}
      />
    );
  }

  if (paymentSection === 'paypal-form') {
    return (
      <PayPalPaymentForm
        renderAsPage={true}
        amount={calculateTotal()}
        currency="XOF"
        isLoading={false}
        onBack={() => setPaymentSection('select-payment-method')}
        onConfirm={handlePaymentSuccess}
      />
    );
  }
//payment  screen
  if (paymentSuccess) {
    const amount = calculateTotal();
    return (
      <ThemedView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={{ alignItems: 'center', marginBottom: 32 }}>
            <ThemedView style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: '#E8F5E9',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <Ionicons name="checkmark-circle" size={64} color="#1B5E20" />
            </ThemedView>

            <ThemedText type="normaltitle" intensity="strong" style={{ textAlign: 'center', color: '#1B5E20', marginBottom: 8 }}>
              Paiement effectué avec succès !
            </ThemedText>
            <ThemedText type="caption" style={{ textAlign: 'center', color: '#666', marginBottom: 4 }}>
              Votre réservation est confirmée.
            </ThemedText>
            <ThemedText type="caption" style={{ textAlign: 'center', color: '#1B5E20', fontWeight: '700', fontSize: 16 }}>
              {formatXOF(amount)}
            </ThemedText>
          </ThemedView>

          {/* property  card */}
          {property && (
            <ThemedView style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#C8E6C9',
              backgroundColor: '#F1F8E9',
              padding: 16,
              marginBottom: 24,
            }}>
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="home-outline" size={20} color="#1B5E20" />
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText type="normal" intensity="strong" numberOfLines={1}>
                    {property.title}
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: '#666' }} numberOfLines={1}>
                    {property.address}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          )}

          {/* Message */}
          <ThemedView style={{
            borderRadius: 12,
            backgroundColor: '#FFF9C4',
            borderWidth: 1,
            borderColor: '#F9A825',
            padding: 16,
            marginBottom: 28,
          }}>
            <ThemedView style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
              <Ionicons name="information-circle-outline" size={18} color="#F57F17" style={{ marginTop: 1 }} />
              <ThemedText type="caption" style={{ flex: 1, color: '#5D4037', lineHeight: 20 }}>
                Votre contrat est prêt à être généré. Cliquez sur le bouton ci-dessous pour créer et télécharger votre contrat de bail officiel.
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* contrat button */}
          <TouchableOpacity
            onPress={handleGenerateContract}
            disabled={generatingContract}
            style={{
              borderRadius: 14,
              backgroundColor: generatingContract ? '#A5D6A7' : '#1B5E20',
              paddingVertical: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 10,
              marginBottom: 12,
            }}
          >
            {generatingContract ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons name="document-text-outline" size={20} color="white" />
            )}
            <ThemedText type="normal" intensity="strong" style={{ color: 'white', fontSize: 15 }}>
              {generatingContract ? 'Génération en cours...' : 'Générer le contrat'}
            </ThemedText>
          </TouchableOpacity>

          {/* Bouton retour accueil */}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)' as any)}
            style={{
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: '#1B5E20',
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <ThemedText type="normal" style={{ color: '#1B5E20', fontWeight: '600' }}>
              Retour à l'accueil
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    );
  }

  // canceled
  if (cancelled) {
    const visitDone = !!(res?.visitCompleted || res?.visitStatus === 'completed' || res?.visitId);
    return (
      <ThemedView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} showsVerticalScrollIndicator={false}>

          <ThemedView style={{ alignItems: 'center', marginBottom: 32 }}>
            <ThemedView style={{
              width: 100, height: 100, borderRadius: 50,
              backgroundColor: theme.error + '15',
              justifyContent: 'center', alignItems: 'center', marginBottom: 20,
            }}>
              <Ionicons name="close-circle" size={64} color={theme.error} />
            </ThemedView>
            <ThemedText type="normaltitle" intensity="strong" style={{ textAlign: 'center', marginBottom: 8 }}>
              Réservation annulée
            </ThemedText>
            <ThemedText type="caption" style={{ textAlign: 'center', color: theme.text + '70', lineHeight: 20 }}>
              Votre réservation a bien été annulée.{'\n'}La propriété est de nouveau disponible.
            </ThemedText>
          </ThemedView>

          {property && (
            <ThemedView style={{
              borderRadius: 16, borderWidth: 1,
              borderColor: theme.outline + '40',
              padding: 16, marginBottom: 20,
            }}>
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="home-outline" size={20} color={theme.text + '80'} />
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText type="normal" intensity="strong" numberOfLines={1}>{property.title}</ThemedText>
                  <ThemedText type="caption" style={{ color: theme.text + '60' }} numberOfLines={1}>{property.address}</ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          )}

          {/* Preserve visit information */}
          {visitDone && (
            <ThemedView style={{
              borderRadius: 12, borderWidth: 1,
              borderColor: theme.primary + '40',
              backgroundColor: theme.primary + '08',
              padding: 16, marginBottom: 20,
            }}>
              <ThemedView style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                <Ionicons name="eye-outline" size={18} color={theme.primary} style={{ marginTop: 1 }} />
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText type="normal" intensity="strong" style={{ color: theme.primary, marginBottom: 4 }}>
                    Votre visite reste enregistrée
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: theme.text + '70', lineHeight: 20 }}>
                    La visite que vous avez effectuée est conservée dans votre historique. Si vous souhaitez louer ce bien, il vous suffit de faire une nouvelle réservation — aucune nouvelle visite ne sera nécessaire.
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          )}

          {!!cancelReason.trim() && (
            <ThemedView style={{
              borderRadius: 12, borderWidth: 1,
              borderColor: theme.outline + '30',
              backgroundColor: theme.surfaceVariant,
              padding: 14, marginBottom: 20,
            }}>
              <ThemedText type="caption" style={{ color: theme.text + '55', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Motif d'annulation
              </ThemedText>
              <ThemedText type="normal" style={{ color: theme.text + '90' }}>{cancelReason.trim()}</ThemedText>
            </ThemedView>
          )}

          {/* New  reservation button*/}
          <TouchableOpacity
            onPress={() => router.replace({ pathname: '/property/[infoId]', params: { infoId: propertyId! } } as any)}
            style={{
              borderRadius: 14, backgroundColor: theme.primary,
              paddingVertical: 16, alignItems: 'center',
              flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 12,
            }}
          >
            <Ionicons name="refresh-outline" size={19} color="#fff" />
            <ThemedText type="normal" intensity="strong" style={{ color: '#fff', fontSize: 15 }}>
              Faire une nouvelle réservation
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)' as any)}
            style={{
              borderRadius: 14, borderWidth: 1.5,
              borderColor: theme.outline + '50',
              paddingVertical: 14, alignItems: 'center',
            }}
          >
            <ThemedText type="normal" style={{ color: theme.text + '80', fontWeight: '600' }}>
              Retour à l'accueil
            </ThemedText>
          </TouchableOpacity>

        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style = {{flex: 1}}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Property Card */}
        <ThemedView style={{...styles.propertyCard, borderWidth:1, borderColor: theme.outline + "40"}}>
          <Image
            source={{ uri: property?.images?.[0] || property?.avatar }}
            style={styles.propertyImage}
          />
          <ThemedView style={styles.propertyInfo}>
            <ThemedText type ="normal" style={styles.roomType}>{property?.propertyType || 'Property'}</ThemedText>
            <ThemedText type ="normal" intensity ="strong" style={styles.hotelName}>{property?.title}</ThemedText>
            <ThemedView style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <ThemedText type ="normal" style={styles.locationText}>{property?.address}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.ratingRow}>
              <Ionicons name="star" size={14} color = {theme.star} />
              <ThemedText type ="body" style={styles.ratingText}>{property?.stars || property?.rating} ({property?.reviews || 0} Reviews)</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Payment Deadline */}
        {paymentDeadline && (
          <ThemedView style={{
            ...styles.section,
            borderWidth: 1,
            borderColor: timeRemaining.expired ? theme.error : isUrgent ? theme.warning : theme.outline + "80",
            backgroundColor: timeRemaining.expired ? theme.error + '08' : isUrgent ? theme.warning + '08' : undefined
          }}>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Ionicons
                name={timeRemaining.expired ? "alert-circle" : "time-outline"}
                size={20}
                color={timeRemaining.expired ? theme.error : isUrgent ? theme.warning : theme.primary}
              />
              <ThemedText type="normal" intensity="strong" style={{
                color: timeRemaining.expired ? theme.error : isUrgent ? theme.warning : theme.text
              }}>
                {timeRemaining.expired ? t('bookingReview.deadlineExpired') : t('bookingReview.paymentDeadline')}
              </ThemedText>
            </ThemedView>

            {timeRemaining.expired ? (
              <ThemedView>
                <ThemedText type="normal" style={{ color: theme.error, marginBottom: 8 }}>
                  {t('bookingReview.deadlineExpiredMsg')}
                </ThemedText>
              </ThemedView>
            ) : (
              <>
                {/* Countdown */}
                <ThemedView style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                  {[
                    { value: timeRemaining.days, label: 'Jours' },
                    { value: timeRemaining.hours, label: 'Heures' },
                    { value: timeRemaining.minutes, label: 'Min' },
                    { value: timeRemaining.seconds, label: 'Sec' }
                  ].map((unit, index) => (
                    <ThemedView key={index} style={{
                      alignItems: 'center',
                      backgroundColor: isUrgent ? theme.warning + '15' : theme.primary + '10',
                      borderRadius: 10,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      minWidth: 60
                    }}>
                      <ThemedText type="title" intensity="strong" style={{
                        color: isUrgent ? theme.warning : theme.primary,
                        fontSize: 22
                      }}>
                        {String(unit.value).padStart(2, '0')}
                      </ThemedText>
                      <ThemedText type="caption" style={{
                        color: isUrgent ? theme.warning : theme.outline,
                        marginTop: 2
                      }}>
                        {unit.label}
                      </ThemedText>
                    </ThemedView>
                  ))}
                </ThemedView>

                <ThemedText type="caption" style={{ textAlign: 'center', color: theme.outline }}>
                  {t('bookingReview.paymentRequiredBefore', { date: paymentDeadline.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) })}
                </ThemedText>
                <ThemedText type="caption" style={{ textAlign: 'center', color: isUrgent ? theme.warning : theme.outline, marginTop: 4 }}>
                  {t('bookingReview.autoCancel')}
                </ThemedText>
              </>
            )}
          </ThemedView>
        )}

        {/* Prolongation Request */}
        {!timeRemaining.expired && paymentDeadline && (
          <ThemedView style={{ ...styles.section, borderWidth: 1, borderColor: theme.outline + '40', marginTop: 10 }}>
            {extensionStatus === 'PENDING' ? (
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="time-outline" size={18} color={theme.warning} />
                <ThemedText type="normal" style={{ color: theme.warning, flex: 1 }}>
                  Demande de prolongation en attente de réponse du propriétaire...
                </ThemedText>
              </ThemedView>
            ) : extensionStatus === 'ACCEPTED' ? (
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="checkmark-circle" size={18} color={theme.success ?? '#22c55e'} />
                <ThemedText type="normal" style={{ color: theme.success ?? '#22c55e', flex: 1 }}>
                  Prolongation accordée — nouveau délai appliqué
                </ThemedText>
              </ThemedView>
            ) : extensionStatus === 'REFUSED' ? (
              <ThemedView>
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Ionicons name="close-circle" size={18} color={theme.error} />
                  <ThemedText type="normal" style={{ color: theme.error, flex: 1 }}>
                    Prolongation refusée — délai maintenu (ou 24h de grâce accordées)
                  </ThemedText>
                </ThemedView>
                <TouchableOpacity
                  onPress={() => setShowExtensionModal(true)}
                  style={{ backgroundColor: theme.primary + '15', borderRadius: 10, padding: 12, alignItems: 'center' }}
                >
                  <ThemedText type="normal" style={{ color: theme.primary, fontWeight: '600' }}>
                    Faire une nouvelle demande
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            ) : (
              <TouchableOpacity
                onPress={() => setShowExtensionModal(true)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <Ionicons name="add-circle-outline" size={20} color={theme.primary} />
                <ThemedText type="normal" style={{ color: theme.primary, fontWeight: '600' }}>
                  Demander une prolongation du délai
                </ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
        )}

        {/* Extension Modal */}
        <Modal visible={showExtensionModal} transparent animationType="slide">
          <ThemedView style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <ThemedView style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
              <ThemedText type="normaltitle" style={{ marginBottom: 16 }}>Demander une prolongation</ThemedText>

            
              <ThemedView style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                {(['days', 'date'] as const).map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => setExtensionMode(mode)}
                    style={{
                      flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5,
                      borderColor: extensionMode === mode ? theme.primary : theme.outline + '30',
                      backgroundColor: extensionMode === mode ? theme.primary + '15' : 'transparent',
                      alignItems: 'center'
                    }}
                  >
                    <ThemedText style={{ color: extensionMode === mode ? theme.primary : theme.onSurface, fontWeight: extensionMode === mode ? '600' : '400', fontSize: 13 }}>
                      {mode === 'days' ? 'En jours' : 'Date précise'}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>

              {extensionMode === 'days' ? (
                <ThemedView style={{ marginBottom: 16 }}>
                  <ThemedText type="caption" style={{ marginBottom: 8, color: theme.onSurface + '80' }}>
                    Nombre de jours supplémentaires souhaités
                  </ThemedText>
                  <TextInput
                    style={{ backgroundColor: theme.surfaceVariant, borderRadius: 12, padding: 14, fontSize: 16, color: theme.onSurface }}
                    placeholder="Ex: 3"
                    placeholderTextColor={theme.onSurface + '50'}
                    keyboardType="numeric"
                    value={extensionDays}
                    onChangeText={setExtensionDays}
                  />
                </ThemedView>
              ) : (
                <ThemedView style={{ marginBottom: 16 }}>
                  <ThemedText type="caption" style={{ marginBottom: 8, color: theme.onSurface + '80' }}>
                    Date limite souhaitée: {extensionDate.toLocaleDateString('fr-FR')}
                  </ThemedText>
                  <ThemedView style={{ flexDirection: 'row', gap: 8 }}>
                    {[3, 5, 7].map((d) => (
                      <TouchableOpacity
                        key={d}
                        onPress={() => setExtensionDate(new Date(Date.now() + d * 24 * 60 * 60 * 1000))}
                        style={{ flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: theme.primary + '40', alignItems: 'center' }}
                      >
                        <ThemedText type="caption" style={{ color: theme.primary }}>+{d}j</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ThemedView>
                </ThemedView>
              )}

              <ThemedView style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setShowExtensionModal(false)}
                  style={{ flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: theme.outline + '40', alignItems: 'center' }}
                >
                  <ThemedText type="normal">Annuler</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleRequestExtension}
                  disabled={extensionLoading || (extensionMode === 'days' && !extensionDays)}
                  style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: theme.primary, alignItems: 'center', opacity: extensionLoading ? 0.6 : 1 }}
                >
                  <ThemedText type="normal" style={{ color: 'white', fontWeight: '600' }}>
                    {extensionLoading ? 'Envoi...' : 'Envoyer'}
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </Modal>

        {/* Booking Details */}
        <ThemedView style={{...styles.section, borderWidth:1, borderColor: theme.outline + "80"}}>
          <ThemedText type ="normal" style={styles.sectionTitle}>{t('bookingReview.yourBooking')}</ThemedText>

          <ThemedView style={styles.detailRow}>
            <ThemedText type ="normal">{t('bookingReview.dates')}</ThemedText>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil-outline" size={16} color={theme.primary} />
              <ThemedText Type = "body" style={styles.editText}>{t('bookingReview.edit')}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
          <ThemedText type ="normal" style={styles.detailValue}>
            {reservation?.startDate && reservation?.endDate
              ? `${new Date(reservation.startDate).toLocaleDateString()} - ${new Date(reservation.endDate).toLocaleDateString()}`
              : t('bookingReview.datesNotSpecified')
            }
          </ThemedText>

          <ThemedView style={[styles.detailRow, { marginTop: 20 }]}>
            <ThemedText type ="normal">{t('bookingReview.guest')}</ThemedText>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil-outline" size={16} color={theme.primary}/>
              <ThemedText type ="body" style={styles.editText}>{t('bookingReview.edit')}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
          <ThemedText type ="normal" style={styles.detailValue}>{reservation?.guestCount || 1} {t('bookingReview.person')}</ThemedText>
        </ThemedView>

        {/* Payment Information */}
        <ThemedView style={{...styles.section, borderWidth:1, borderColor: theme.outline + "80"}}>
          <ThemedText type ="normal" style={styles.sectionTitle}>{t('bookingReview.paymentInfo')}</ThemedText>

          <ThemedView style={styles.paymentRow}>
            <ThemedText style={styles.paymentLabel}>{t('bookingReview.totalCost')}</ThemedText>
            <ThemedText type ="body" style={styles.paymentDue}>
              {t('bookingReview.due', { date: reservation?.endDate ? new Date(reservation.endDate).toLocaleDateString() : 'TBD' })}
            </ThemedText>
          </ThemedView>
          <ThemedText type ="normal" intensity ="strong">
            ${calculateTotal().toLocaleString()}
          </ThemedText>
        </ThemedView>

        {/* Final Price */}
        <ThemedView style={{...styles.finalPriceContainer, borderWidth:1, borderColor: theme.outline + "40"}}>
          <ThemedText  type ="title" intensity = "strong">
            ${calculateTotal().toLocaleString()}
          </ThemedText>
          <ThemedText type ="caption" style={styles.includesText}>{t('bookingReview.includesTaxes')}</ThemedText>
        </ThemedView>
      </ScrollView>

      {/* Cancel Modal */}
      <Modal visible={showCancelModal} transparent animationType="slide">
        <ThemedView style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <ThemedView style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>

            {/* Handle */}
            <ThemedView style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: theme.outline + '40', alignSelf: 'center', marginBottom: 20 }} />

            {/* Icône + title */}
            <ThemedView style={{ alignItems: 'center', marginBottom: 20 }}>
              <ThemedView style={{
                width: 56, height: 56, borderRadius: 28,
                backgroundColor: theme.error + '15',
                justifyContent: 'center', alignItems: 'center', marginBottom: 12,
              }}>
                <Ionicons name="close-circle-outline" size={30} color={theme.error} />
              </ThemedView>
              <ThemedText type="normaltitle" intensity="strong" style={{ textAlign: 'center', marginBottom: 6 }}>
                Annuler la réservation ?
              </ThemedText>
              <ThemedText type="caption" style={{ textAlign: 'center', color: theme.text + '65', lineHeight: 20, paddingHorizontal: 8 }}>
                La propriété sera remise en disponibilité.{'\n'}
                {res?.visitCompleted || res?.visitId
                  ? 'Votre visite restera enregistrée — vous pourrez réserver à nouveau sans refaire de visite.'
                  : 'Cette action est irréversible.'}
              </ThemedText>
            </ThemedView>

            {/* reason (optionnal) */}
            <ThemedView style={{ marginBottom: 20 }}>
              <ThemedText type="caption" style={{ color: theme.text + '60', marginBottom: 8 }}>
                Motif d'annulation (optionnel)
              </ThemedText>
              <TextInput
                style={{
                  backgroundColor: theme.surfaceVariant,
                  borderRadius: 12, padding: 14,
                  fontSize: 14, color: theme.text,
                  minHeight: 80, textAlignVertical: 'top',
                  borderWidth: 1, borderColor: theme.outline + '30',
                }}
                placeholder="Ex: J'ai trouvé un autre logement, changement de situation..."
                placeholderTextColor={theme.text + '40'}
                multiline
                value={cancelReason}
                onChangeText={setCancelReason}
              />
            </ThemedView>

            <ThemedView style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => { setShowCancelModal(false); setCancelReason(''); }}
                style={{
                  flex: 1, paddingVertical: 14, borderRadius: 13,
                  borderWidth: 1, borderColor: theme.outline + '40',
                  alignItems: 'center',
                }}
              >
                <ThemedText type="normal" style={{ fontWeight: '600' }}>Garder</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCancelReservation}
                disabled={cancelLoading}
                style={{
                  flex: 1, paddingVertical: 14, borderRadius: 13,
                  backgroundColor: cancelLoading ? theme.error + '60' : theme.error,
                  alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
                }}
              >
                {cancelLoading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Ionicons name="close-circle" size={17} color="#fff" />
                }
                <ThemedText type="normal" style={{ color: '#fff', fontWeight: '700' }}>
                  {cancelLoading ? 'Annulation...' : 'Confirmer'}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>

          </ThemedView>
        </ThemedView>
      </Modal>

      <ThemedView style={{...styles.buttonContainer, paddingBottom: insets.bottom, gap: 10}}>
        <TouchableOpacity
          style={{
            ...styles.continueButton,
            backgroundColor: timeRemaining.expired ? theme.outline : theme.primary,
            opacity: timeRemaining.expired ? 0.6 : 1
          }}
          onPress={handleContinue}
          disabled={timeRemaining.expired}
        >
          <ThemedText type="normal" intensity="strong" style={{ color: 'white' }}>
            {timeRemaining.expired ? t('bookingReview.deadlineExpiredBtn') : t('bookingReview.continue')}
          </ThemedText>
        </TouchableOpacity>

        {/* Annuler la réservation */}
        <TouchableOpacity
          onPress={() => setShowCancelModal(true)}
          style={{ paddingVertical: 12, alignItems: 'center' }}
        >
          <ThemedText type="normal" style={{ color: theme.error, fontWeight: '600', fontSize: 14 }}>
            Annuler la réservation
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  propertyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 16,
    overflow: 'hidden',
  },
  propertyImage: {
    width: '100%',
    height: 200,
  },
  propertyInfo: {
    padding: 10,
  },
  roomType: {
    marginBottom: 4,
  },
  hotelName: {
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#666',
    marginLeft: 4,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  sectionTitle: {
    color: '#666',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editText: {
    color: '#007AFF',
    marginLeft: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#000',
    marginTop: 4,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentLabel: {
    fontWeight: '600',
    color: '#000',
  },
  paymentDue: {
    color: '#666',
  },

  finalPriceContainer: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
    alignItems: 'center',
  },

  nightText: {
    fontSize: 16,
    color: '#000',
    marginTop: 4,
  },
  includesText: {
    marginTop: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  continueButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
});
