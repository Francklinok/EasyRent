import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CustomButton, CustomInput, DatePicker, PropertyCard } from '../../components/ui';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Property } from '@/types/property';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { sendGlobalNotification } from '@/components/contexts/notifications/NotificationContext';

type RootStackParamList = {

  Reservation: { property: Property };
  DocumentUpload: { reservationId: string; property: Property };
};

type ReservationScreenRouteProp = RouteProp<RootStackParamList, 'Reservation'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Reservation'>;

// Données d'essai pour remplacer les données du backend
const MOCK_USER = {
  uid: 'user123',
  fullName: 'Jean Dupont'
};

type BookingMode = 'direct' | 'visit';
type VisitStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'active';

interface Visit {
  id: string;
  date: Date;
  time: string;
  status: VisitStatus;
  notes?: string;
}  

const ReservationScreen = () => {
  const route = useRoute<ReservationScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { property } = route.params;
  const [loading, setLoading] = useState(false);
  const [bookingMode, setBookingMode] = useState<BookingMode>('direct');
  const [visit, setVisit] = useState<Visit | null>(null);
  const [visitDate, setVisitDate] = useState(new Date());
  const [visitTime, setVisitTime] = useState('10:00');
  const [showBookingForm, setShowBookingForm] = useState(false);

  const validationSchema = Yup.object().shape({
    startDate: Yup.date().required('Date de début requise'),
    endDate: Yup.date().min(
      Yup.ref('startDate'),
      'La date de fin doit être après la date de début'
    ).required('Date de fin requise'),
    numberOfOccupants: Yup.number()
      .min(1, 'Au moins 1 occupant requis')
      .max(property?.maxOccupants || 10, `Maximum ${property?.maxOccupants || 10} occupants`)
      .required('Nombre d\'occupants requis'),
    hasGuarantor: Yup.boolean(),
    monthlyIncome: Yup.number()
      .min((property?.monthlyRent || 0) * 2, 'Le revenu doit être au moins le double du loyer')
      .required('Revenu mensuel requis'),
  });

  const scheduleVisit = () => {
    setLoading(true);
    setTimeout(() => {
      const newVisit: Visit = {
        id: 'visit-' + Date.now(),
        date: visitDate,
        time: visitTime,
        status: 'pending',
        notes: 'Visite programmée'
      };
      setVisit(newVisit);
      
      // Send automatic message to owner
      sendVisitRequestMessage(newVisit);
      
      // Send notification to owner
      sendNotificationToOwner(newVisit);
      
      // Update profiles
      updateProfileStatus('client', 'Visit Scheduled');
      updateProfileStatus('owner', 'Visit Scheduled');
      
      setLoading(false);
      Alert.alert('Succès', 'Votre demande de visite a été envoyée au propriétaire. Vous recevrez une confirmation sous 24h.');
    }, 1000);
  };

  const sendVisitRequestMessage = (visit: Visit) => {
    if (!property) {
      console.error('Property data not available');
      return;
    }
    
    // Add message to chat list for owner
    const visitMessage = {
      id: 'visit-msg-' + Date.now(),
      sender: {
        name: MOCK_USER.fullName,
        avatar: 'https://ui-avatars.com/api/?name=' + MOCK_USER.fullName.replace(' ', '+'),
      },
      content: `Demande de visite pour ${property.title || 'cette propriété'} le ${visit.date.toLocaleDateString()} à ${visit.time}`,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      count: 1,
      isArchived: false,
      status: 'online',
      isBot: false,
      isSentByCurrentUser: false,
      statusIcon: 'sent',
      messageType: 'visit_request',
      visitData: visit,
      propertyData: {
        title: property.title || 'Propriété',
        address: property.address || '',
        ownerId: property.ownerId || property.owner?.id || 'unknown'
      }
    };
    console.log('Message sent to owner ID:', property.ownerId || property.owner?.id);
    console.log('Visit message:', visitMessage);
  };

  const sendNotificationToOwner = (visit: Visit) => {
    if (!property) {
      console.error('Property data not available for notification');
      return;
    }
    
    sendGlobalNotification({
      type: 'visit_request',
      title: 'Nouvelle demande de visite',
      message: `${MOCK_USER.fullName} souhaite visiter ${property.title || 'votre propriété'}`,
      userId: property.ownerId || property.owner?.id || 'unknown',
      data: { visit, property },
      actions: [
        {
          id: 'accept',
          label: 'Accepter',
          type: 'accept',
          onPress: () => {
            console.log('Visit accepted from notification');
            if (visit) {
              setVisit({ ...visit, status: 'confirmed' });
              updateProfileStatus('client', 'Visit Accepted');
              updateProfileStatus('owner', 'Visit Accepted');
            }
          }
        },
        {
          id: 'reject',
          label: 'Refuser',
          type: 'reject',
          onPress: () => {
            console.log('Visit rejected from notification');
            if (visit) {
              setVisit({ ...visit, status: 'cancelled' });
            }
          }
        }
      ]
    });
    
    console.log('Notification sent to owner ID:', property.ownerId || property.owner?.id);
  };

  const updateProfileStatus = (userType: 'client' | 'owner', status: string) => {
    console.log(`Profile status updated for ${userType}: ${status}`);
  };

  // Check if visit time has passed
  const checkVisitTime = () => {
    if (visit && visit.status === 'confirmed') {
      const visitDateTime = new Date(visit.date);
      const [hours, minutes] = visit.time.split(':');
      visitDateTime.setHours(parseInt(hours), parseInt(minutes));
      
      const now = new Date();
      if (now > visitDateTime) {
        setVisit({ ...visit, status: 'completed' });
        setShowBookingForm(true);
        updateProfileStatus('client', 'Visit Active');
        Alert.alert('Visite active', 'Votre visite est maintenant active. Vous pouvez procéder à la réservation.');
      }
    }
  };

  // Check visit time every minute
  React.useEffect(() => {
    const interval = setInterval(checkVisitTime, 60000);
    return () => clearInterval(interval);
  }, [visit]);

  const confirmVisit = () => {
    if (visit) {
      setVisit({ ...visit, status: 'confirmed' });
      updateProfileStatus('client', 'Visit Accepted');
      updateProfileStatus('owner', 'Visit Accepted');
      Alert.alert('Visite confirmée', 'Votre visite a été confirmée par le propriétaire.');
    }
  };

  const completeVisit = () => {
    if (visit) {
      setVisit({ ...visit, status: 'completed' });
      setShowBookingForm(true);
      Alert.alert('Visite terminée', 'Vous pouvez maintenant procéder à la réservation.');
    }
  };

  const formik = useFormik({
    initialValues: {
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)),
      numberOfOccupants: 1,
      hasGuarantor: false,
      monthlyIncome: 0,
    },
    validationSchema,
    
    onSubmit: (values) => {
      try {
        setLoading(true);
        
        // Simuler l'envoi des données au backend
        setTimeout(() => {
          console.log('Données de réservation:', {
            propertyId: property?.id || 'unknown',
            propertyTitle: property?.title || 'Propriété',
            tenantId: MOCK_USER.uid,
            tenantName: MOCK_USER.fullName,
            landlordId: property?.ownerId || property?.owner?.id || 'unknown',
            startDate: values.startDate,
            endDate: values.endDate,
            numberOfOccupants: values.numberOfOccupants,
            hasGuarantor: values.hasGuarantor,
            monthlyIncome: values.monthlyIncome,
            monthlyRent: property?.monthlyRent || 0,
            status: 'pending',
            createdAt: new Date(),
            documentsSubmitted: false,
          });
          
          // Redirection vers l'écran de téléchargement de documents
          navigation.navigate('DocumentUpload', { 
            reservationId: 'mock-reservation-id-123',
            property
          });
          
          setLoading(false);
        }, 1500); // Simuler un délai réseau de 1,5 seconde
        
      } catch (error) {
        console.error('Erreur de simulation:', error);
        Alert.alert('Erreur', 'Une erreur est survenue lors de la soumission de votre réservation.');
        setLoading(false);
      }
    },
  });

  const calculateTotalAmount = () => {
    if (!property) return 0;
    return (property.monthlyRent || 0) + (property.depositAmount || 0);
  };

  const renderModeSelector = () => (
    <ThemedView className="mb-6">
      <ThemedText className="text-lg font-semibold mb-4">Comment souhaitez-vous procéder ?</ThemedText>
      <ThemedView className="flex-row gap-3">
        <TouchableOpacity
          onPress={() => {
            setBookingMode('direct');
            setShowBookingForm(true);
          }}
          className={`flex-1 p-4 rounded-lg border-2 ${bookingMode === 'direct' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
        >
          <MaterialCommunityIcons name="flash" size={24} color={bookingMode === 'direct' ? '#3B82F6' : '#6B7280'} />
          <ThemedText className={`font-medium mt-2 ${bookingMode === 'direct' ? 'text-blue-600' : 'text-gray-600'}`}>Réservation directe</ThemedText>
          <ThemedText className="text-sm text-gray-500 mt-1">Réserver immédiatement sans visite</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => {
            setBookingMode('visit');
            setShowBookingForm(false);
          }}
          className={`flex-1 p-4 rounded-lg border-2 ${bookingMode === 'visit' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
        >
          <MaterialCommunityIcons name="calendar-check" size={24} color={bookingMode === 'visit' ? '#10B981' : '#6B7280'} />
          <ThemedText className={`font-medium mt-2 ${bookingMode === 'visit' ? 'text-green-600' : 'text-gray-600'}`}>Programmer une visite</ThemedText>
          <ThemedText className="text-sm text-gray-500 mt-1">Visiter avant de réserver</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );

  const renderVisitScheduling = () => (
    <ThemedView className="mb-6">
      <ThemedText className="text-lg font-semibold mb-4">Programmer votre visite</ThemedText>
      
      <ThemedView className="mb-4">
        <ThemedText className="mb-2 font-medium">Date de visite</ThemedText>
        <DatePicker
          date={visitDate}
          onDateChange={setVisitDate}
          minimumDate={new Date()}
        />
      </ThemedView>
      
      <ThemedView className="mb-4">
        <ThemedText className="mb-2 font-medium">Heure préférée</ThemedText>
        <ThemedView className="flex-row gap-2">
          {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
            <TouchableOpacity
              key={time}
              onPress={() => setVisitTime(time)}
              className={`px-3 py-2 rounded-lg border ${visitTime === time ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
            >
              <ThemedText className={visitTime === time ? 'text-blue-600' : 'text-gray-600'}>{time}</ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>
      
      <CustomButton
        title="Demander la visite"
        onPress={scheduleVisit}
        loading={loading}
        type="primary"
      />
    </ThemedView>
  );

  const renderVisitStatus = () => {
    if (!visit) return null;
    
    const getStatusColor = (status: VisitStatus) => {
      switch (status) {
        case 'pending': return 'text-orange-600 bg-orange-50';
        case 'confirmed': return 'text-green-600 bg-green-50';
        case 'completed': return 'text-blue-600 bg-blue-50';
        case 'active': return 'text-purple-600 bg-purple-50';
        case 'cancelled': return 'text-red-600 bg-red-50';
      }
    };
    
    const getStatusText = (status: VisitStatus) => {
      switch (status) {
        case 'pending': return 'En attente de confirmation';
        case 'confirmed': return 'Confirmée';
        case 'completed': return 'Terminée';
        case 'active': return 'Active';
        case 'cancelled': return 'Annulée';
        case 'active': return 'Active';
      }
    };
    
    return (
      <ThemedView className="mb-6 p-4 border border-gray-200 rounded-lg">
        <ThemedText className="text-lg font-semibold mb-3">Statut de votre visite</ThemedText>
        
        <ThemedView className="flex-row items-center mb-3">
          <MaterialCommunityIcons name="calendar" size={20} color="#6B7280" />
          <ThemedText className="ml-2">{visit.date.toLocaleDateString()} à {visit.time}</ThemedText>
        </ThemedView>
        
        <ThemedView className={`px-3 py-1 rounded-full self-start ${getStatusColor(visit.status)}`}>
          <ThemedText className="text-sm font-medium">{getStatusText(visit.status)}</ThemedText>
        </ThemedView>
        
        {visit.status === 'pending' && (
          <ThemedView className="mt-4">
            <ThemedText className="text-sm text-gray-600 mb-3">Simulation: Confirmer la visite</ThemedText>
            <CustomButton title="Confirmer la visite" onPress={confirmVisit} type="outline" />
          </ThemedView>
        )}
        
        {visit.status === 'confirmed' && (
          <ThemedView className="mt-4">
            <ThemedText className="text-sm text-gray-600 mb-3">Simulation: Marquer comme terminée</ThemedText>
            <CustomButton title="Visite terminée" onPress={completeVisit} type="primary" />
          </ThemedView>
        )}
        
        {visit.status === 'active' && (
          <ThemedView className="mt-4 p-3 bg-purple-50 rounded-lg">
            <ThemedText className="text-purple-700 font-medium">✓ Visite active</ThemedText>
            <ThemedText className="text-purple-600 text-sm mt-1">Vous pouvez maintenant procéder à la réservation</ThemedText>
          </ThemedView>
        )}
        
        {visit.status === 'completed' && (
          <ThemedView className="mt-4 p-3 bg-green-50 rounded-lg">
            <ThemedText className="text-green-700 font-medium">✓ Visite terminée avec succès</ThemedText>
            <ThemedText className="text-green-600 text-sm mt-1">Vous pouvez maintenant procéder à la réservation</ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    );
  };

  const canShowBookingForm = () => {
    return bookingMode === 'direct' || (bookingMode === 'visit' && visit?.status === 'completed') || showBookingForm;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 pt-2">
        <ThemedText className="text-2xl font-bold mb-6 mt-2">
          Réserver {property?.title || 'ce logement'}
        </ThemedText>
        
        {renderModeSelector()}
        
        {bookingMode === 'visit' && !visit && renderVisitScheduling()}
        
        {visit && renderVisitStatus()}
        
        {canShowBookingForm() && (
          <ThemedView>
            <ThemedText className="text-lg font-semibold mb-4">Détails de la réservation</ThemedText>
          
          <ThemedView className="mb-4">
            <ThemedText className="mb-2 font-medium">Date de début</ThemedText>
            <DatePicker
              date={formik.values.startDate}
              onDateChange={(date) => formik.setFieldValue('startDate', date)}
              minimumDate={new Date()}
            />
            {formik.errors.startDate && formik.touched.startDate && (
              <ThemedText className="text-red-500">{formik.errors.startDate}</ThemedText>
            )}
          </ThemedView>
          
          <ThemedView className="mb-4">
            <ThemedText className="mb-2 font-medium">Date de fin</ThemedText>
            <DatePicker
              date={formik.values.endDate}
              onDateChange={(date) => formik.setFieldValue('endDate', date)}
              minimumDate={formik.values.startDate}
            />
            {formik.errors.endDate && formik.touched.endDate && (
              <ThemedText className="text-red-500">{formik.errors.endDate}</ThemedText>
            )}
          </ThemedView>
          
          <CustomInput
            label="Nombre d'occupants"
            placeholder="Nombre d'occupants"
            keyboardType="numeric"
            value={formik.values.numberOfOccupants.toString()}
            onChangeText={(value) => formik.setFieldValue('numberOfOccupants', parseInt(value) || 0)}
            error={formik.touched.numberOfOccupants ? formik.errors.numberOfOccupants : undefined}
          />
          
          <CustomInput
            label="Revenu mensuel (€)"
            placeholder="Votre revenu mensuel"
            keyboardType="numeric"
            value={formik.values.monthlyIncome.toString()}
            onChangeText={(value) => formik.setFieldValue('monthlyIncome', parseInt(value) || 0)}
            error={formik.touched.monthlyIncome ? formik.errors.monthlyIncome : undefined}
          />
          
          <ThemedView className="flex-row items-center mb-4">
            <ThemedText className="font-medium flex-1">Avez-vous un garant?</ThemedText>
            <CustomButton
              title={formik.values.hasGuarantor ? "Oui" : "Non"}
              onPress={() => formik.setFieldValue('hasGuarantor', !formik.values.hasGuarantor)}
              type={formik.values.hasGuarantor ? "primary" : "outline"}
              className="w-20"
            />
          </ThemedView>
          
          <ThemedView className="bg-gray-50 p-4 rounded-lg my-4">
            <ThemedText className="text-lg font-semibold mb-2">Résumé des coûts</ThemedText>
            <ThemedView className="flex-row justify-between mb-2">
              <ThemedText>Loyer mensuel</ThemedText>
              <ThemedText>{property?.monthlyRent || 0} €</ThemedText>
            </ThemedView>
            <ThemedView className="flex-row justify-between mb-2">
              <ThemedText>Dépôt de garantie</ThemedText>
              <ThemedText>{property?.depositAmount || 0} €</ThemedText>
            </ThemedView>
            <ThemedView className="flex-row justify-between pt-2 border-t border-gray-200 mt-2">
              <ThemedText className="font-bold">Total à payer</ThemedText>
              <ThemedText className="font-bold">{calculateTotalAmount()} €</ThemedText>
            </ThemedView>
          </ThemedView>
          
            <ThemedText className="mb-4 text-sm text-gray-600">
              {bookingMode === 'visit' && visit?.status === 'completed' 
                ? 'Suite à votre visite confirmée, vous pouvez maintenant finaliser votre réservation.'
                : 'En cliquant sur "Continuer", vous acceptez de soumettre votre dossier pour vérification.'}
              Vous devrez télécharger les documents nécessaires à l'étape suivante.
            </ThemedText>
            
            <CustomButton
              title={bookingMode === 'visit' && visit?.status === 'completed' ? 'Finaliser la réservation' : 'Continuer vers les documents'}
              onPress={() => {
                // Send booking notification
                sendGlobalNotification({
                  type: 'booking_request',
                  title: 'Nouvelle demande de réservation',
                  message: `${MOCK_USER.fullName} a soumis une demande de réservation pour ${property?.title || 'votre propriété'}`,
                  userId: property?.ownerId || property?.owner?.id || 'unknown',
                  data: { 
                    property, 
                    bookingDetails: formik.values,
                    clientName: MOCK_USER.fullName
                  }
                });
                
                router.navigate({
                  pathname:"/documentsubmit/DocumentUploadFile"
                });
              }}
              loading={loading}
              disabled={!formik.isValid || loading}
            />
          </ThemedView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};


export default ReservationScreen;

