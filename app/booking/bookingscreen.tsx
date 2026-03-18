import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, Alert, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CustomButton, CustomInput, DatePicker } from '../../components/ui';
import { Property } from '@/types/property';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNotifications } from '@/components/contexts/notifications/NotificationContext';
import { useTheme } from '@/hooks/themehook';
import { useBooking } from '@/components/contexts/booking/BookingContext';
import { useActivity } from '@/components/contexts/activity/ActivityContext';
import { DocumentUploadSection } from '@/components/booking/DocumentUploadSection';
import { getPropertyConfig, isVisitRequired, PropertyType, ActionType, normalizePropertyType, normalizeActionType } from '@/constants/propertyTypeConfigs';
import useBookingStatus from '@/hooks/useBookingStatus';
import { getBookingService } from '@/services/api/bookingService';
import { useAuthUser } from '@/components/contexts/authContext/AuthContext';
import { useLanguage } from '@/components/contexts/language';

// Types
type BookingMode = 'direct' | 'visit';
type reserStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface Visit {
  id: string;
  date: Date;
  time: string;
  status: reserStatus;
  notes?: string;
}

interface OwnerStats {
  acceptanceRate: number;
  averageResponseTime: number;
  completedReservations: number;
  rating: number;
}

// Status Badge Component
const BookingStatusBadge: React.FC<{ status: string; bookingData: any; theme: any; onPayment: () => void }> = ({ 
  status, bookingData, theme, onPayment
}) => {
  const { t } = useLanguage();
  const STATUS_CONFIG:any = {
    pending: { color: theme.warning, icon: 'clock-outline', title: t('bookingScreen.statusPending'), message: t('bookingScreen.statusPendingMsg') },
    accepted: { color: theme.success, icon: 'check-circle', title: t('bookingScreen.statusAccepted'), message: t('bookingScreen.statusAcceptedMsg') },
    rejected: { color: theme.error, icon: 'close-circle', title: t('bookingScreen.statusRejected'), message: bookingData.rejectionReason || t('bookingScreen.statusRejectedDefault') },
    completed: { color: theme.success, icon: 'check-all', title: t('bookingScreen.statusCompleted'), message: t('bookingScreen.statusCompletedMsg') }
  }

  const  statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG['pending'];

  return (
    <ThemedView style={{ marginBottom: 20 }}>
      <ThemedView style={{
        backgroundColor: statusConfig.color + '15',
        borderRadius: 16,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: statusConfig.color
      }}>
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' }}>
          <MaterialCommunityIcons name={statusConfig.icon as any} size={28} color={statusConfig.color} />
          <ThemedView style={{ marginLeft: 12, flex: 1, backgroundColor: 'transparent' }}>
            <ThemedText style={{ fontSize: 16, fontWeight: '600', color: statusConfig.color }}>
              {statusConfig.title}
            </ThemedText>
            <ThemedText style={{ fontSize: 13, color: theme.onSurface + '80', marginTop: 2 }}>
              {statusConfig.message}
            </ThemedText>
          </ThemedView>
        </ThemedView>
        {status === 'accepted' && (
          <CustomButton
            title={t('bookingScreen.proceedPayment')}
            onPress={onPayment}
            style={{ marginTop: 12 }}
          />
        )}
      </ThemedView>
    </ThemedView>
  );
};

// Timeline Component
const Timeline: React.FC<{ currentStep: number; requiresDocuments: boolean; theme: any }> = ({ 
  currentStep, requiresDocuments, theme
}) => {
  const { t } = useLanguage();
  const steps = requiresDocuments
    ? [
        { number: 1, title: t('bookingScreen.stepInfo'), icon: 'clipboard-text' },
        { number: 2, title: t('bookingScreen.stepDocuments'), icon: 'file-document' },
        { number: 3, title: t('bookingScreen.stepConfirmation'), icon: 'check-circle' }
      ]
    : [
        { number: 1, title: t('bookingScreen.stepInfo'), icon: 'clipboard-text' },
        { number: 2, title: t('bookingScreen.stepConfirmation'), icon: 'check-circle' }
      ];

  return (
    <ThemedView style={{ marginBottom: 24 }}>
      <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 20 }}>
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <ThemedView style={{ alignItems: 'center', flex: 1 }}>
              <ThemedView style={{
                width: 50, height: 50, borderRadius: 25,
                backgroundColor: currentStep >= step.number ? theme.primary : theme.surfaceVariant,
                alignItems: 'center', justifyContent: 'center', marginBottom: 8,
                borderWidth: 2, borderColor: currentStep === step.number ? theme.primary : 'transparent'
              }}>
                <MaterialCommunityIcons
                  name={step.icon as any}
                  size={24}
                  color={currentStep >= step.number ? 'white' : theme.onSurface + '60'}
                />
              </ThemedView>
              <ThemedText style={{
                fontSize: 12,
                color: currentStep >= step.number ? theme.primary : theme.onSurface + '60',
                fontWeight: currentStep === step.number ? '600' : '400',
                textAlign: 'center'
              }}>
                {step.title}
              </ThemedText>
            </ThemedView>
            {index < steps.length - 1 && (
              <ThemedView style={{
                flex: 0.3, height: 2,
                backgroundColor: currentStep > step.number ? theme.primary : theme.outline + '30',
                marginBottom: 30
              }} />
            )}
          </React.Fragment>
        ))}
      </ThemedView>
    </ThemedView>
  );
};

const ReservationScreen = () => {
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { addNotification } = useNotifications();
  const { addReservation, getUserReservations } = useBooking();
  const { addActivity } = useActivity();
  const bookingService = getBookingService();
  const user = useAuthUser();
  const  insets = useSafeAreaInsets()

  const hasHandledNavigation = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);
  const [parseError, setParseError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingMode, setBookingMode] = useState<BookingMode>('direct');
  const [visit, setVisit] = useState<Visit | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [uploadedDocumentIds, setUploadedDocumentIds] = useState<string[]>([]);
  const [clientMessage, setClientMessage] = useState('');
  const [fullName, setFullName] = useState('');
  const [paymentDelayMode, setPaymentDelayMode] = useState<'days' | 'date'>('days');
  const [proposedPaymentDays, setProposedPaymentDays] = useState<string>('');
  const [proposedPaymentDate, setProposedPaymentDate] = useState<Date | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [visitStatus, setVisitStatus] = useState<'loading' | 'not_required' | 'pending' | 'accepted' | 'refused' | 'none'>('loading');
  const [ownerStats] = useState<OwnerStats>({
    acceptanceRate: 85,
    averageResponseTime: 4,
    completedReservations: 23,
    rating: 4.8
  });

  // Hooks
  const { bookingData, status: bookingStatus, updateStatus, isPending } = useBookingStatus('idle');
  
  // Form handling
  const formik = useFormik({
    initialValues: {
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)),
      numberOfOccupants: 1,
      hasGuarantor: false,
      monthlyIncome: 0,
      budget: 0,
      financingType: '',
      intendedUse: '',
      specialRequirements: '',
      roomType: '',
      // New fields for land/property purchases
      profession: '',
      country: '',
      address: '',
      constructionPlan: ''
    },
    validationSchema: Yup.object().shape({}),
    onSubmit: async (values) => {
    },
  });
  
useEffect(() => {
  const parseProperty = () => {
    try {
      if (!params.property || Array.isArray(params.property)) {
        setParseError(true);
        return;
      }

      const parsed: Property = JSON.parse(params.property);

      if (!parsed.id) {
        setParseError(true);
        return;
      }

      setProperty(parsed);
      setParseError(false);
    } catch {
      setParseError(true);
    } finally {
      setIsLoading(false);
    }
  };

  parseProperty();
}, [params.property]);


  // Vérifier si une visite est requise et son statut
  useEffect(() => {
    const checkVisitRequirement = async () => {
      if (!property?.id || !user?.id) return;

      // Si skipVisit est passé en paramètre, autoriser l'accès direct
      if (params.skipVisit === 'true') {
        setVisitStatus('not_required');
        setShowBookingForm(true);
        return;
      }

      // Si visitScheduled est passé, la visite a été effectuée
      if (params.visitScheduled === 'true') {
        setVisitStatus('accepted');
        setShowBookingForm(true);
        return;
      }

      // Normaliser le type de propriété
      const rawType = property?.propertyType || property?.type || 'apartment';
      const normalizedType = normalizePropertyType(rawType);
      const actionType = (property?.actionType || property?.listType || 'rent') as ActionType;

      // Vérifier si la visite est requise pour ce type de propriété
      const visitRequired = isVisitRequired(normalizedType, actionType);

      if (!visitRequired) {
        setVisitStatus('not_required');
        setShowBookingForm(true);
        return;
      }

      // Visite requise : vérifier l'activité existante du user pour cette propriété
      try {
        // 1. D'abord vérifier s'il existe déjà une réservation acceptée ou en cours
        //    Si oui, la visite a forcément déjà eu lieu → on affiche le formulaire
        const existingBooking = await bookingService.getUserBookingForProperty(property.id, user.id);
        if (existingBooking) {
          // Une réservation existe → bypass le check visite
          setVisitStatus('accepted');
          setShowBookingForm(true);
          return;
        }

        // 2. Pas de réservation → vérifier le statut de la visite
        const existingVisit = await bookingService.getUserVisitForProperty(property.id, user.id);

        if (existingVisit && !existingVisit.isReservation) {
          const status = (existingVisit.visiteStatus || existingVisit.status || 'PENDING').toUpperCase();

          if (status === 'ACCEPTED') {
            setVisitStatus('accepted');
            setShowBookingForm(true);
          } else if (status === 'REFUSED' || status === 'CANCELLED') {
            setVisitStatus('refused');
            setShowBookingForm(false);
          } else {
            setVisitStatus('pending');
            setShowBookingForm(false);
          }
        } else if (existingVisit && existingVisit.isReservation) {
          // → la visite est implicitement acceptée
          setVisitStatus('accepted');
          setShowBookingForm(true);
        } else {
          setVisitStatus('none');
          setShowBookingForm(false);
        }
      } catch {
        setVisitStatus('none');
        setShowBookingForm(false);
      }
    };

    checkVisitRequirement();
  }, [property, user?.id, params.skipVisit, params.visitScheduled]);

  useEffect(() => {
    if (!property?.id || !user?.id) return;

    const loadExistingBooking = async () => {
      try {
        const serverBooking = await bookingService.getUserBookingForProperty(property.id, user.id);
        if (serverBooking) {
          let mappedStatus: any = 'pending';
          if (serverBooking.isReservationAccepted === true) mappedStatus = 'accepted';
          else if (serverBooking.status === 'REFUSED') mappedStatus = 'rejected';

          updateStatus(mappedStatus, {
            reservationId: serverBooking.id,
            propertyId: serverBooking.propertyId,
            propertyTitle: property.title,
            ownerId: property?.ownerId,
            clientId: serverBooking.clientId,
            createdAt: new Date(serverBooking.createdAt)
          });
          setCurrentStep(3);
        }
      } catch {
        // Booking loading failed, will show empty form
      }
    };

    loadExistingBooking();
  }, [property?.id, user?.id]);

  useEffect(() => {
    if (bookingStatus === 'accepted' && !hasHandledNavigation.current && bookingData.reservationId) {
      hasHandledNavigation.current = true;
      setTimeout(() => {
        router.push({
          pathname: '/payement/PayementScreen',
          params: {
            reservationId: bookingData.reservationId!,
            propertyId: property?.id || '',
            propertyTitle: property?.title || 'Propriété',
            amount: calculateTotalAmount().toString()
          }
        });
      }, 2000);
    }
  }, [bookingStatus, bookingData.reservationId]);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface, justifyContent: 'center', alignItems: 'center' }}>
        <MaterialCommunityIcons name="loading" size={48} color={theme.primary} />
        <ThemedText style={{ marginTop: 16, color: theme.onSurface }}>{t('bookingScreen.loading')}</ThemedText>
      </SafeAreaView>
    );
  }

  // Normalize propertyType using the normalizePropertyType function
  const rawPropertyType = property?.propertyType || property?.type || 'apartment';
  const propertyType: PropertyType = normalizePropertyType(rawPropertyType);
  // Normalize actionType (handles 'sell'->'sale', 'location'->'rent', etc.)
  const rawActionType = property?.actionType || property?.listType || 'rent';
  const actionType: ActionType = normalizeActionType(rawActionType);
  const propertyConfig = getPropertyConfig(propertyType, actionType);

  const requiresDocuments = property?.ownerCriteria?.isdocumentRequired || false;
  const requiresGuarantor = property?.ownerCriteria?.guarantorRequired || false;

  const calculateTotalAmount = () => {
    if (!property) return 0;
    if (actionType === 'sale') return Math.round((property.price || 0) * 1.08);
    return (property.monthlyRent || 0) + (property.depositAmount || 0);
  };

  const canShowBookingForm = () => {
    return showBookingForm || bookingMode === 'direct' || (bookingMode === 'visit' && visit?.status === 'completed');
  };

  const getValidationSchema = () => {
    const schema: any = {};
    if (actionType === 'sale') {
      if (propertyConfig.fields.budget?.required) {
        schema.budget = Yup.number().min(property?.price * 0.8 || 0, 'Budget insuffisant').required('Budget requis');
      }
    } else {
      if (propertyConfig.fields.numberOfOccupants?.required) {
        schema.numberOfOccupants = Yup.number().min(1, 'Au moins 1 personne').required('Nombre de personnes requis');
      }
    }
    return Yup.object().shape(schema);
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (requiresDocuments && uploadedDocumentIds.length === 0) {
        Alert.alert(t('bookingScreen.documentsRequiredAlert'), t('bookingScreen.documentsRequiredMsg'));
        setCurrentStep(2);
        return;
      }

      setLoading(true);
      updateStatus('creating');

      // Extract selected unit info if present (passed from info page)
      const selectedUnit = (property as any)?._selectedUnit;

      const bookingRequest = {
        propertyId: property?.id || '',
        clientId: user?.id || '',
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        numberOfOccupants: values.numberOfOccupants,
        hasGuarantor: values.hasGuarantor,
        monthlyIncome: values.monthlyIncome,
        budget: values.budget,
        financingType: values.financingType,
        timeframe: values.intendedUse,
        currentSituation: clientMessage,
        unitId: selectedUnit?.roomId,
        unitName: selectedUnit?.roomName,
        fullName: fullName.trim() || user?.fullName || '',
        proposedPaymentDays: paymentDelayMode === 'days' && proposedPaymentDays
          ? parseInt(proposedPaymentDays, 10) || undefined
          : undefined,
        proposedPaymentDate: paymentDelayMode === 'date' && proposedPaymentDate
          ? proposedPaymentDate.toISOString()
          : undefined,
      };

      const booking = await bookingService.createBooking(
        bookingRequest,
        property?.title || 'Propriété',
        user?.fullName || 'Client',
        actionType
      );

      const reservationId = booking.id;

      addReservation({
        propertyId: property?.id || 'unknown',
        propertyTitle: property?.title || 'Propriété',
        landlordId: property?.ownerId || 'unknown',
        tenantId: user?.id || '',
        startDate: bookingRequest.startDate,
        endDate: bookingRequest.endDate,
        numberOfOccupants: bookingRequest.numberOfOccupants,
        hasGuarantor: bookingRequest.hasGuarantor,
        monthlyIncome: bookingRequest.monthlyIncome,
        monthlyRent: property?.monthlyRent || 0,
        status: 'pending',
        documentsSubmitted: uploadedDocumentIds.length > 0,
        budget: bookingRequest.budget,
        financingType: bookingRequest.financingType,
        timeframe: bookingRequest.timeframe,
      });

      addActivity({
        userId: user?.id || '',
        type: actionType === 'sale' ? 'interest' : 'booking',
        title: propertyConfig.bookingText.title,
        description: `${propertyConfig.bookingText.title} pour ${property?.title}`,
        status: 'pending',
        propertyId: property?.id,
        propertyTitle: property?.title,
        metadata: { reservationId, propertyType, actionType }
      });

      updateStatus('pending', {
        reservationId,
        propertyId: property?.id,
        propertyTitle: property?.title,
        ownerId: property?.ownerId,
        clientId: user?.id || '',
        createdAt: new Date()
      });

      addNotification({
        type: actionType === 'sale' ? 'interest_sent' : 'booking_sent',
        title: propertyConfig.bookingText.successMessage,
        message: t('bookingScreen.requestSentMsg', { hours: String(ownerStats.averageResponseTime) }),
        data: { reservationId, property }
      });

      setLoading(false);
      setCurrentStep(3);

      Alert.alert(
        t('bookingScreen.requestPending'),
        t('bookingScreen.requestSentSuccess'),
        [
          { text: 'OK' }
        ]
      );

    } catch (error: any) {
      setLoading(false);
      updateStatus('idle');
      Alert.alert(t('common.error'), error.message || 'Une erreur est survenue.');
    }
  };

  if (parseError || !property) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <MaterialCommunityIcons name="alert-circle" size={64} color={theme.error} />
        <ThemedText style={{ fontSize: 18, fontWeight: '600', marginTop: 16, textAlign: 'center', color: theme.error }}>{t('bookingScreen.loadError')}</ThemedText>
        <ThemedText style={{ fontSize: 14, color: theme.onSurface + '70', marginTop: 8, textAlign: 'center' }}>{t('bookingScreen.loadErrorMsg')}</ThemedText>
        <CustomButton title={t('common.back')} onPress={() => router.back()} className="mt-6" />
      </SafeAreaView>
    );
  }

  // Vérification de la visite - Bloquer l'accès si visite requise mais pas acceptée
  if (visitStatus === 'loading') {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText style={{ marginTop: 16 }}>{t('bookingScreen.checkingVisit')}</ThemedText>
      </ThemedView>
    );
  }

  if (visitStatus === 'none') {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <MaterialCommunityIcons name="calendar-clock" size={80} color={theme.warning} />
        <ThemedText type="normaltitle" style={{ color: theme.warning, marginTop: 16, textAlign: 'center' }}>
          {t('bookingScreen.visitRequired')}
        </ThemedText>
        <ThemedText type="normal" style={{ marginTop: 8, textAlign: 'center', lineHeight: 22 }}>
          {t('bookingScreen.visitRequiredMsg', { type: propertyConfig.displayName })}
        </ThemedText>
        <CustomButton
          title={t('bookingScreen.scheduleVisit')}
          onPress={() => router.push({
            pathname: '/booking/VisitScreen',
            params: { property: JSON.stringify(property) }
          })}
          className="mt-6 w-full"
        />
        <CustomButton title={t('common.back')} onPress={() => router.back()} type="outline" className="mt-3 w-full" />
      </ThemedView>
    );
  }

  if (visitStatus === 'pending') {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, paddingTop:0 }}>
        <MaterialCommunityIcons name="clock-outline" size={80} color={theme.warning} />
        <ThemedText type="normaltitle" style={{ color: theme.warning, marginTop: 16, textAlign: 'center' }}>
          {t('bookingScreen.visitPending')}
        </ThemedText>
        <ThemedText type="normal" style={{ marginTop: 8, textAlign: 'center', lineHeight: 22 }}>
          {t('bookingScreen.visitPendingMsg')}
        </ThemedText>
        <CustomButton
          title={t('bookingScreen.viewVisitRequest')}
          onPress={() => router.push({
            pathname: '/booking/VisitScreen',
            params: { property: JSON.stringify(property) }
          })}
          className="mt-6 w-full"
        />
        <CustomButton title={t('common.back')} onPress={() => router.back()} type="outline" className="mt-3 w-full" />
      </ThemedView>
    );
  }

  if (visitStatus === 'refused') {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <MaterialCommunityIcons name="close-circle" size={80} color={theme.error} />
        <ThemedText type="normaltitle" style={{ color: theme.error, marginTop: 16, textAlign: 'center' }}>
          {t('bookingScreen.visitRefused')}
        </ThemedText>
        <ThemedText type="normal" style={{ marginTop: 8, textAlign: 'center', lineHeight: 22 }}>
          {t('bookingScreen.visitRefusedMsg')}
        </ThemedText>
        <CustomButton
          title={t('bookingScreen.requestNewVisit')}
          onPress={() => router.push({
            pathname: '/booking/VisitScreen',
            params: { property: JSON.stringify(property) }
          })}
          className="mt-6 w-full"
        />
        <CustomButton title={t('common.back')} onPress={() => router.back()} type="outline" className="mt-3 w-full" />
      </ThemedView>
    );
  }

  // Field type definitions for dynamic rendering
  type FieldKey = keyof typeof propertyConfig.fields;

  const DATE_FIELDS: FieldKey[] = ['startDate', 'endDate', 'checkInDate', 'checkOutDate'];
  const NUMBER_FIELDS: FieldKey[] = ['numberOfOccupants', 'numberOfGuests', 'numberOfRooms', 'numberOfNights', 'monthlyIncome', 'budget'];
  const BOOLEAN_FIELDS: FieldKey[] = ['hasGuarantor'];
  const SELECT_FIELDS: FieldKey[] = ['financingType', 'roomType'];
  const TEXT_FIELDS: FieldKey[] = ['profession', 'country', 'address'];
  const MULTILINE_TEXT_FIELDS: FieldKey[] = ['specialRequirements', 'intendedUse', 'constructionPlan'];

  // Map field keys to formik value keys
  const getFormikKey = (fieldKey: FieldKey): string => {
    const mapping: Record<string, string> = {
      checkInDate: 'startDate',
      checkOutDate: 'endDate',
      numberOfGuests: 'numberOfOccupants',
      numberOfRooms: 'numberOfOccupants',
      numberOfNights: 'numberOfOccupants',
      constructionPlan: 'intendedUse',
    };
    return mapping[fieldKey] || fieldKey;
  };

  // Render a single field based on its type
  const renderField = (fieldKey: FieldKey, fieldConfig: any) => {
    if (!fieldConfig?.show) return null;

    // Check owner requirements for specific fields
    // hasGuarantor field: only show if owner requires a guarantor
    if (fieldKey === 'hasGuarantor' && !requiresGuarantor) {
      return null;
    }

    // monthlyIncome field: only show if owner requires income proof (linked to guarantor requirement)
    if (fieldKey === 'monthlyIncome' && !requiresGuarantor) {
      return null;
    }

    const formikKey = getFormikKey(fieldKey);
    const formikValue = (formik.values as any)[formikKey];
    const formikError = (formik.touched as any)[formikKey] ? (formik.errors as any)[formikKey] : undefined;

    // Date fields
    if (DATE_FIELDS.includes(fieldKey)) {
      const isEndDate = fieldKey === 'endDate' || fieldKey === 'checkOutDate';
      return (
        <ThemedView key={fieldKey} style={{ marginBottom: 16 }}>
          <ThemedText type = "body" style={{ marginBottom: 8,}}>
            {fieldConfig.label} {fieldConfig.required && <ThemedText style={{ color: theme.error }}>*</ThemedText>}
          </ThemedText>
          {fieldConfig.helpText && (
            <ThemedText  type = "body" style={{  marginBottom: 8 }}>
              {fieldConfig.helpText}
            </ThemedText>
          )}
          <DatePicker
            date={formikValue || new Date()}
            onDateChange={(date: Date) => formik.setFieldValue(formikKey, date)}
            minimumDate={isEndDate ? formik.values.startDate : new Date()}
          />
        </ThemedView>
      );
    }

    // Number fields
    if (NUMBER_FIELDS.includes(fieldKey)) {
      return (
        <ThemedView key={fieldKey} style={{ marginBottom: 16 }}>
          <CustomInput
            label={`${fieldConfig.label}${fieldConfig.required ? ' *' : ''}`}
            placeholder={fieldConfig.placeholder}
            keyboardType="numeric"
            value={formikValue?.toString() || ''}
            onChangeText={(value) => formik.setFieldValue(formikKey, parseInt(value) || 0)}
            error={formikError}
          />
          {fieldConfig.helpText && (
            <ThemedText  type = "body" style={{  marginTop: 4 }}>
              {fieldConfig.helpText}
            </ThemedText>
          )}
        </ThemedView>
      );
    }

    // Boolean fields (Yes/No toggle)
    if (BOOLEAN_FIELDS.includes(fieldKey)) {
      return (
        <ThemedView key={fieldKey} style={{ marginBottom: 16 }}>
          <ThemedText type ="body" style={{  marginBottom: 8, }}>
            {fieldConfig.label} {fieldConfig.required && <ThemedText style={{ color: theme.error }}>*</ThemedText>}
          </ThemedText>
          {fieldConfig.helpText && (
            <ThemedText style={{ fontSize: 12, color: theme.onSurface + '70', marginBottom: 8 }}>
              {fieldConfig.helpText}
            </ThemedText>
          )}
          <ThemedView style={{ flexDirection: 'row', gap: 12 }}>
            {[{ label: t('bookingScreen.yes'), value: true }, { label: t('bookingScreen.no'), value: false }].map((option) => (
              <TouchableOpacity
                key={option.label}
                onPress={() => formik.setFieldValue(formikKey, option.value)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: formikValue === option.value ? theme.primary : theme.outline + '30',
                  backgroundColor: formikValue === option.value ? theme.primary + '15' : 'transparent',
                  alignItems: 'center'
                }}
              >
                <ThemedText style={{
                  fontWeight: formikValue === option.value ? '600' : '400',
                  color: formikValue === option.value ? theme.primary : theme.onSurface
                }}>
                  {option.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>
      );
    }

    // Select fields (chips)
    if (SELECT_FIELDS.includes(fieldKey)) {
      const options = fieldKey === 'financingType'
        ? [t('bookingScreen.financingCredit'), t('bookingScreen.financingCash'), t('bookingScreen.financingMixed')]
        : [t('bookingScreen.roomStandard'), t('bookingScreen.roomDeluxe'), t('bookingScreen.roomSuite'), t('bookingScreen.roomPremium')];
      return (
        <ThemedView key={fieldKey} style={{ marginBottom: 16 }}>
          <ThemedText type ="body" style={{marginBottom: 12 }}>
            {fieldConfig.label} {fieldConfig.required && <ThemedText style={{ color: theme.error }}>*</ThemedText>}
          </ThemedText>
          {fieldConfig.helpText && (
            <ThemedText type ="body" style={{ marginBottom: 8 }}>
              {fieldConfig.helpText}
            </ThemedText>
          )}
          <ThemedView style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => formik.setFieldValue(formikKey, option)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: formikValue === option ? theme.primary : theme.outline + '30',
                  backgroundColor: formikValue === option ? theme.primary + '15' : 'transparent'
                }}
              >
                <ThemedText type ="body" style={{
                  fontWeight: formikValue === option ? '600' : '400',
                  color: formikValue === option ? theme.primary : theme.onSurface
                }}>
                  {option}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>
      );
    }

    // Multiline text fields (special requirements)
    if (MULTILINE_TEXT_FIELDS.includes(fieldKey)) {
      return (
        <ThemedView key={fieldKey} style={{ marginBottom: 16 }}>
          <ThemedText type ="body" style={{ marginBottom: 8 }}>
            {fieldConfig.label} {fieldConfig.required && <ThemedText style={{ color: theme.error }}>*</ThemedText>}
          </ThemedText>
          {fieldConfig.helpText && (
            <ThemedText type ="body" style={{ marginBottom: 8 }}>
              {fieldConfig.helpText}
            </ThemedText>
          )}
          <TextInput
            style={{
              backgroundColor: theme.surface,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: theme.outline + '30',
              padding: 14,
              minHeight: 80,
              textAlignVertical: 'top',
              color: theme.onSurface,
              fontSize: 14
            }}
            placeholder={fieldConfig.placeholder}
            placeholderTextColor={theme.onSurface + '50'}
            multiline
            value={formikValue || ''}
            onChangeText={(value) => formik.setFieldValue(formikKey, value)}
          />
        </ThemedView>
      );
    }

    // Text fields (single line)
    if (TEXT_FIELDS.includes(fieldKey)) {
      return (
        <ThemedView key={fieldKey} style={{ marginBottom: 16 }}>
          <CustomInput
            label={`${fieldConfig.label}${fieldConfig.required ? ' *' : ''}`}
            placeholder={fieldConfig.placeholder}
            value={formikValue || ''}
            onChangeText={(value) => formik.setFieldValue(formikKey, value)}
          />
          {fieldConfig.helpText && (
            <ThemedText type ="body" style={{ marginTop: 4 }}>
              {fieldConfig.helpText}
            </ThemedText>
          )}
        </ThemedView>
      );
    }

    return null;
  };

  const renderDynamicFields = () => {
    const fields = propertyConfig.fields;

    // Get all field keys in the order they are defined in the config
    const fieldKeys = Object.keys(fields) as FieldKey[];

    return (
      <>
        {/* Render each field dynamically in config order */}
        {fieldKeys.map((fieldKey) => {
          const fieldConfig = fields[fieldKey];
          return renderField(fieldKey, fieldConfig);
        })}

        {/* Nom complet du client */}
        <ThemedView style={{ marginBottom: 16 }}>
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <MaterialCommunityIcons name="account" size={20} color={theme.primary} style={{ marginRight: 6 }} />
            <ThemedText type="body">Nom complet <ThemedText style={{ color: theme.error }}>*</ThemedText></ThemedText>
          </ThemedView>
          <TextInput
            style={{
              backgroundColor: theme.surface,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: fullName.trim() ? theme.primary + '60' : theme.outline + '30',
              padding: 14,
              color: theme.onSurface,
              fontSize: 14
            }}
            placeholder="Votre nom et prénom"
            placeholderTextColor={theme.onSurface + '50'}
            value={fullName}
            onChangeText={setFullName}
          />
        </ThemedView>

        {/* Délai de paiement proposé */}
        <ThemedView style={{ marginBottom: 16 }}>
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={theme.primary} style={{ marginRight: 6 }} />
            <ThemedText type="body">Délai de paiement proposé</ThemedText>
          </ThemedView>
          <ThemedText type="caption" style={{ color: theme.onSurface + '70', marginBottom: 10 }}>
            Indiquez dans quel délai vous pouvez effectuer le paiement après acceptation
          </ThemedText>

          {/* Toggle jours / date */}
          <ThemedView style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
            {(['days', 'date'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => setPaymentDelayMode(mode)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderColor: paymentDelayMode === mode ? theme.primary : theme.outline + '30',
                  backgroundColor: paymentDelayMode === mode ? theme.primary + '15' : 'transparent',
                  alignItems: 'center'
                }}
              >
                <ThemedText style={{
                  fontWeight: paymentDelayMode === mode ? '600' : '400',
                  color: paymentDelayMode === mode ? theme.primary : theme.onSurface,
                  fontSize: 13
                }}>
                  {mode === 'days' ? 'En jours' : 'Date précise'}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>

          {paymentDelayMode === 'days' ? (
            <TextInput
              style={{
                backgroundColor: theme.surface,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: theme.outline + '30',
                padding: 14,
                color: theme.onSurface,
                fontSize: 14
              }}
              placeholder="Ex: 5 (nombre de jours)"
              placeholderTextColor={theme.onSurface + '50'}
              keyboardType="numeric"
              value={proposedPaymentDays}
              onChangeText={setProposedPaymentDays}
            />
          ) : (
            <DatePicker
              date={proposedPaymentDate || new Date(new Date().setDate(new Date().getDate() + 3))}
              onDateChange={(date: Date) => setProposedPaymentDate(date)}
              minimumDate={new Date()}
            />
          )}
        </ThemedView>

        {/* Message to owner/seller - always shown */}
        <ThemedView style={{ marginBottom: 80 }}>
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <MaterialCommunityIcons name="message-text" size={20} color={theme.primary} style={{ marginRight: 6 }} />
            <ThemedText type ="body">
              {t('bookingScreen.messageTo', { role: actionType === 'sale' ? t('bookingScreen.seller') : t('bookingScreen.owner') })}
            </ThemedText>
          </ThemedView>
          <TextInput
            style={{
              backgroundColor: theme.surface,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: theme.outline + '30',
              padding: 14,
              minHeight: 120,
              textAlignVertical: 'top',
              color: theme.onSurface,
              fontSize: 14
            }}
            placeholder={t('bookingScreen.messagePlaceholder')}
            placeholderTextColor={theme.onSurface + '50'}
            multiline
            value={clientMessage}
            onChangeText={setClientMessage}
          />
        </ThemedView>
      </>
    );
  };

  return (
    <ThemedView style={{ flex: 1}}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom:insets.bottom + 10, paddingTop:0 }}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedView style={{ marginBottom: 10 }}>
            <ThemedText type ="normaltitle" style={{  textAlign: 'center', marginTop: 8 }}>
              {propertyConfig.displayName} • {property?.title || 'Propriété sélectionnée'}
            </ThemedText>
          </ThemedView>

          <Timeline currentStep={currentStep} requiresDocuments={requiresDocuments} theme={theme} />

          {bookingStatus !== 'idle' && (
            <BookingStatusBadge
              status={bookingStatus}
              bookingData={bookingData}
              theme={theme}
              onPayment={() => {
                if (!hasHandledNavigation.current && bookingData.reservationId) {
                  hasHandledNavigation.current = true;
                  router.push({
                    pathname: '/payement/PayementScreen',
                    params: {
                      reservationId: bookingData.reservationId,
                      propertyId: property?.id || '',
                      propertyTitle: property?.title || 'Propriété',
                      amount: calculateTotalAmount().toString()
                    }
                  });
                }
              }}
            />
          )}


          {canShowBookingForm() && bookingStatus === 'idle' && (
            <ThemedView>
              {currentStep === 1 && (
                <ThemedView>
                  <ThemedText type ="normal" style={{ marginBottom: 10 }}>
                    {propertyConfig.bookingText.title}
                  </ThemedText>

                  {/* Owner requirements info banner */}
                  <ThemedView style={{
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 16,
                    borderLeftWidth: 3,
                    borderLeftColor: theme.primary
                  }}>
                    <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <MaterialCommunityIcons name="information-outline" size={18} color={theme.primary} />
                      <ThemedText type="body" style={{ marginLeft: 8, color: theme.primary }}>{t('bookingScreen.ownerRequirements')}</ThemedText>
                    </ThemedView>
                    <ThemedView style={{ gap: 8 }}>
                      <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons
                          name={requiresGuarantor ? 'check-circle' : 'close-circle'}
                          size={16}
                          color={requiresGuarantor ? theme.success || '#10B981' : theme.onSurface + '50'}
                        />
                        <ThemedText type="caption" style={{ marginLeft: 6 }}>
                          {requiresGuarantor ? t('bookingScreen.guarantorRequired') : t('bookingScreen.guarantorNotRequired')}
                        </ThemedText>
                      </ThemedView>
                      <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons
                          name={requiresDocuments ? 'check-circle' : 'close-circle'}
                          size={16}
                          color={requiresDocuments ? theme.success || '#10B981' : theme.onSurface + '50'}
                        />
                        <ThemedText type="caption" style={{ marginLeft: 6 }}>
                          {requiresDocuments ? t('bookingScreen.documentsRequired') : t('bookingScreen.documentsNotRequired')}
                        </ThemedText>
                      </ThemedView>
                    </ThemedView>
                  </ThemedView>

                  {renderDynamicFields()}

                  <CustomButton
                    title={requiresDocuments ? t('bookingScreen.continueToDocuments') : propertyConfig.bookingText.submitButton}
                    onPress={() => {
                      if (requiresDocuments) {
                        setCurrentStep(2);
                      } else {
                        handleFormSubmit(formik.values);
                      }
                    }}
                    loading={loading}
                    disabled={!formik.isValid || loading || isPending()}
                  />
                </ThemedView>
              )}

              {currentStep === 2 && requiresDocuments && (
                <ThemedView>
                  <DocumentUploadSection
                    reservationId="temp-reservation-id"
                    onDocumentsUploaded={(documentIds) => setUploadedDocumentIds(documentIds)}
                    onValidationStatusChange={() => {}}
                    required={requiresDocuments}
                  />
                  <ThemedView style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                    <CustomButton title={t('common.back')} onPress={() => setCurrentStep(1)} type="outline" style={{ flex: 1 }} />
                    <CustomButton
                      title={propertyConfig.bookingText.submitButton}
                      onPress={() => handleFormSubmit(formik.values)}
                      loading={loading}
                      disabled={uploadedDocumentIds.length === 0 || loading}
                      style={{ flex: 1 }}
                    />
                  </ThemedView>
                </ThemedView>
              )}

              {currentStep === 3 && (
                <ThemedView >
                  <ThemedView style={{ backgroundColor: theme.warning + '10', borderRadius: 20, padding: 24, alignItems: 'center' }}>
                    <MaterialCommunityIcons name="clock-check-outline" size={80} color={theme.warning} />
                    <ThemedText type = "title" style={{ color: theme.warning, marginTop: 16, textAlign: 'center' }}>
                      {t('bookingScreen.pendingTitle')}
                    </ThemedText>
                    <ThemedText type ="normal" style={{ marginTop: 12, textAlign: 'center' }}>
                      {t('bookingScreen.requestSentTo', { role: actionType === 'sale' ? t('bookingScreen.seller') : t('bookingScreen.owner') })}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              )}
            </ThemedView>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

export default ReservationScreen;