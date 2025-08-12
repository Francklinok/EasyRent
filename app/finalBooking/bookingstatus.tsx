import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useBooking, BookingReservation } from '@/components/contexts/booking/BookingContext';
import { useNotifications } from '@/components/contexts/notifications/NotificationContext';
import { BackButton } from '@/components/ui/BackButton';
import { useTheme } from '@/components/contexts/theme/themehook';

const statusMap = {
  pending: { text: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  documents_submitted: { text: 'Documents soumis', color: 'bg-blue-100 text-blue-800' },
  approved: { text: 'Approuvé', color: 'bg-green-100 text-green-800' },
  rejected: { text: 'Rejeté', color: 'bg-red-100 text-red-800' },
  payment_pending: { text: 'Paiement en attente', color: 'bg-purple-100 text-purple-800' },
  payment_completed: { text: 'Paiement effectué', color: 'bg-green-100 text-green-800' },
  contract_generated: { text: 'Contrat généré', color: 'bg-teal-100 text-teal-800' },
  completed: { text: 'Terminé', color: 'bg-gray-100 text-gray-800' },
};

const ReservationStatusScreen = () => {
  const { reservations, getUserReservations, getOwnerReservations, approveReservation, rejectReservation } = useBooking();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const {theme} = useTheme()
  
  const userType = 'tenant'; // Ou 'landlord' pour tester l'autre rôle
  const currentUserId = 'user123'; // Mock user ID
  
  const [userReservations, setUserReservations] = useState<BookingReservation[]>([]);

  useEffect(() => {
    // Get user's reservations from context and remove duplicates
    setTimeout(() => {
      const userBookings = getUserReservations(currentUserId);
      
      // Remove duplicates based on propertyId - keep only the latest reservation per property
      const uniqueReservations = userBookings.reduce((acc, current) => {
        const existingIndex = acc.findIndex(item => item.propertyId === current.propertyId);
        
        if (existingIndex === -1) {
          // No existing reservation for this property, add it
          acc.push(current);
        } else {
          // Compare dates and keep the most recent one
          const existing = acc[existingIndex];
          if (new Date(current.createdAt) > new Date(existing.createdAt)) {
            acc[existingIndex] = current;
          }
        }
        
        return acc;
      }, [] as BookingReservation[]);
      
      // Sort by creation date (most recent first)
      const sortedReservations = uniqueReservations.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setUserReservations(sortedReservations);
      setLoading(false);
    }, 500);
  }, [reservations, getUserReservations]);

  const handleOwnerApproval = (reservation: BookingReservation, approve: boolean) => {
    if (approve) {
      approveReservation(reservation.id, reservation.landlordId);
      // Send notification to client
      addNotification({
        type: 'booking_confirmed',
        title: 'Réservation approuvée',
        message: `Votre réservation pour ${reservation.propertyTitle} a été approuvée. Vous pouvez maintenant procéder au paiement.`,
        data: {
          reservationId: reservation.id,
          propertyId: reservation.propertyId,
          status: 'approved'
        }
      });
      Alert.alert('Approuvé', 'La réservation a été approuvée. Le client a été notifié.');
    } else {
      rejectReservation(reservation.id, reservation.landlordId);
      Alert.alert('Rejeté', 'La réservation a été rejetée.');
    }
  };

  const handleReservationPress = (reservation: BookingReservation) => {
    if (userType === 'landlord') {
      // Show owner approval options
      if (reservation.status === 'pending' || reservation.status === 'documents_submitted') {
        Alert.alert(
          'Examiner la demande',
          `Demande de réservation pour ${reservation.propertyTitle}\n\nOccupants: ${reservation.numberOfOccupants}\nRevenu: ${reservation.monthlyIncome}€\nGarant: ${reservation.hasGuarantor ? 'Oui' : 'Non'}`,
          [
            { text: 'Rejeter', style: 'destructive', onPress: () => handleOwnerApproval(reservation, false) },
            { text: 'Annuler', style: 'cancel' },
            { text: 'Approuver', onPress: () => handleOwnerApproval(reservation, true) }
          ]
        );
      }
      return;
    }

    switch (reservation.status) {
      case 'pending':
      case 'documents_submitted':
        Alert.alert(
          'Demande en cours',
          'Votre demande est en cours d\'examen par le propriétaire. Vous serez notifié lorsqu\'une décision sera prise.'
        );
        break;
      case 'approved':
        router.push({
          pathname: "/payement/PayementScreen",
          params: { reservationId: reservation.id }
        });
        break;
      case 'payment_completed':
      case 'contract_generated':
        router.push({
          pathname: '/contrat/ContratScreen',
          params: { reservationId: reservation.id }
        });
        break;
      case 'rejected':
        Alert.alert(
          'Demande refusée',
          'Votre demande a été refusée par le propriétaire.'
        );
        break;
      default:
        break;
    }
  };

  const getNextAction = (status: string) => {
    if (userType === 'landlord') {
      switch (status) {
        case 'pending':
        case 'documents_submitted':
          return 'Examiner la demande';
        case 'approved':
          return 'Approuvé - En attente de paiement';
        case 'rejected':
          return 'Demande rejetée';
        default:
          return 'Voir les détails';
      }
    }
    
    switch (status) {
      case 'pending':
      case 'documents_submitted':
        return 'En attente d\'approbation';
      case 'approved':
        return 'Procéder au paiement';
      case 'payment_completed':
      case 'contract_generated':
        return 'Voir le contrat';
      case 'rejected':
        return 'Demande refusée';
      default:
        return 'Voir les détails';
    }
  };

  const formatDate = (date: string) => {
    if (!date) return 'Non définie';
    
    try {
      const dateObj = new Date(date);
      return format(dateObj, 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Date invalide';
    }
  };

  const renderItem = ({ item }: { item: BookingReservation }) => {
    const statusInfo = statusMap[item.status] || statusMap.pending;
    
    return (
      <TouchableOpacity
        className=" rounded-lg shadow-sm mb-4 overflow-hidden"
        onPress={() => handleReservationPress(item)}
      >
        <ThemedView className="p-4">
          <ThemedView className="flex-row justify-between items-center mb-2">
            <ThemedText className="text-lg font-semibold">{item.propertyTitle}</ThemedText>
            {item.documentsSubmitted && (
              <ThemedView className="flex-row items-center mt-1">
                <Ionicons name="document-text" size={14} color={theme.success} />
                <ThemedText className="text-xs text-green-600 ml-1">Documents soumis</ThemedText>
              </ThemedView>
            )}
            <ThemedView className={`px-2 py-1 rounded-full ${statusInfo.color}`}>
              <ThemedText className="text-xs font-medium">{statusInfo.text}</ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedView className="mb-3">
            <ThemedText className="text-gray-600">
              Demande créée le {formatDate(item.createdAt)}
            </ThemedText>
            <ThemedText className="text-gray-600">
              Période: {formatDate(item.startDate)} - {formatDate(item.endDate)}
            </ThemedText>
            <ThemedText className="text-gray-600">
              Loyer mensuel: {item.monthlyRent} €
            </ThemedText>
            <ThemedText className="text-gray-600">
              Occupants: {item.numberOfOccupants} | Garant: {item.hasGuarantor ? 'Oui' : 'Non'}
            </ThemedText>
          </ThemedView>
          
          <ThemedView className="flex-row justify-between items-center border-t border-gray-200 pt-3">
            <ThemedText className={`font-medium ${
              item.status === 'approved' ? theme.success : 
              item.status === 'rejected' ?theme.error: theme.primary
            }`}>
              {getNextAction(item.status)}
            </ThemedText>
            {item.status === 'approved' && userType === 'tenant' && (
              <Ionicons name="card" size={20} color={theme.success} />
            )}
            {(item.status === 'pending' || item.status === 'documents_submitted') && (
              <Ionicons name="time" size={20} color={theme.star} />
            )}
            {item.status !== 'approved' && item.status !== 'pending' && item.status !== 'documents_submitted' && (
              <Ionicons name="chevron-forward" size={20} color="#4B5563" />
            )}
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1"
    style = {{backgroundColor: theme.surface}}>
      <ThemedView className="p-4">
        <ThemedView className = "flex-row gap-6">
          <BackButton/>
          <ThemedText type = "title" intensity = "strong" className=" mb-4">Mes réservations</ThemedText>
        </ThemedView>
        
        {userReservations.length === 0 ? (
          <ThemedView className=" rounded-lg shadow-sm p-6 items-center justify-center">
            <Ionicons name="calendar-outline" size={48} color={theme.accent} />
            <ThemedText type = "normal" className=" mt-4 mb-2">
              Aucune réservation trouvée
            </ThemedText>
            <ThemedText className="text-gray-500 text-center mb-4">
              {userType === 'tenant' 
                ? 'Vous n\'avez pas encore effectué de demande de réservation.'
                : 'Vous n\'avez pas encore reçu de demande de réservation.'}
            </ThemedText>

            {/* modify the route after  */}

            {userType === 'tenant' && (
              <TouchableOpacity
                className="bg-blue-600 py-3 px-4 rounded-lg"
                onPress={() => router.push("/home/home")}
              >
                <ThemedText >Chercher un logement</ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
        ) : (
          <FlatList
            data={userReservations}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}
export default  ReservationStatusScreen;