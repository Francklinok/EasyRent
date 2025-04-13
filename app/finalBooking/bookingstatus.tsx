import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
interface Reservation {
  id: string;
  propertyTitle: string;
  status: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  landlordId: string;
  propertyId: string;
}

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

const  ReservationStatusScreen = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const userType = 'tenant'; // Ou 'landlord' pour tester l'autre rôle

  useEffect(() => {
    // Simuler le chargement des données depuis une API
    setTimeout(() => {
      // Données de réservation de démonstration
      const mockReservations: Reservation[] = [
        {
          id: '1',
          propertyTitle: 'Appartement T2 au centre-ville',
          status: 'pending',
          createdAt: new Date(2025, 2, 15).toISOString(),
          startDate: new Date(2025, 4, 1).toISOString(),
          endDate: new Date(2026, 4, 1).toISOString(),
          monthlyRent: 950,
          landlordId: 'landlord123',
          propertyId: 'property123'
        },
        {
          id: '2',
          propertyTitle: 'Studio meublé près de la gare',
          status: 'documents_submitted',
          createdAt: new Date(2025, 2, 10).toISOString(),
          startDate: new Date(2025, 3, 15).toISOString(),
          endDate: new Date(2026, 3, 15).toISOString(),
          monthlyRent: 750,
          landlordId: 'landlord456',
          propertyId: 'property456'
        },
        {
          id: '3',
          propertyTitle: 'Maison avec jardin',
          status: 'approved',
          createdAt: new Date(2025, 2, 5).toISOString(),
          startDate: new Date(2025, 4, 15).toISOString(),
          endDate: new Date(2026, 4, 15).toISOString(),
          monthlyRent: 1200,
          landlordId: 'landlord789',
          propertyId: 'property789'
        },
        {
          id: '3',
          propertyTitle: 'Maison avec jardin',
          status: 'contract_generated',
          createdAt: new Date(2025, 2, 5).toISOString(),
          startDate: new Date(2025, 4, 15).toISOString(),
          endDate: new Date(2026, 4, 15).toISOString(),
          monthlyRent: 1200,
          landlordId: 'landlord789',
          propertyId: 'property789'
        }
      ];
      
      setReservations(mockReservations);
      setLoading(false);
    }, 1500); // Simuler un délai de chargement
  }, []);

  const handleReservationPress = (reservation: Reservation) => {
    if (userType === 'landlord') {
      router.push({
        pathname: '/application-review',
        params: { reservationId: reservation.id }
      });
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
      return 'Voir les détails';
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

  const renderItem = ({ item }: { item: Reservation }) => {
    const statusInfo = statusMap[item.status] || statusMap.pending;
    
    return (
      <TouchableOpacity
        className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden"
        onPress={() => handleReservationPress(item)}
      >
        <ThemedView className="p-4">
          <ThemedView className="flex-row justify-between items-center mb-2">
            <ThemedText className="text-lg font-semibold">{item.propertyTitle}</ThemedText>
            <ThemedText className={`px-2 py-1 rounded-full ${statusInfo.color}`}>
              <ThemedText className="text-xs font-medium">{statusInfo.text}</ThemedText>
            </ThemedText>
          </ThemedView>
          
          <ThemedView className="mb-3">
            <ThemedText className="text-gray-600 text-sm">
              Demande créée le {formatDate(item.createdAt)}
            </ThemedText>
            <ThemedText className="text-gray-600 text-sm">
              Période: {formatDate(item.startDate)} - {formatDate(item.endDate)}
            </ThemedText>
            <ThemedText className="text-gray-600 text-sm">
              Loyer mensuel: {item.monthlyRent} €
            </ThemedText>
          </ThemedView>
          
          <ThemedView className="flex-row justify-between items-center border-t border-gray-200 pt-3">
            <ThemedText className="text-blue-600 font-medium">
              {getNextAction(item.status)}
            </ThemedText>
            <Ionicons name="chevron-forward" size={20} color="#4B5563" />
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ThemedView className="p-4">
        <Text className="text-2xl font-bold mb-4">Mes réservations</Text>
        
        {reservations.length === 0 ? (
          <ThemedView className="bg-white rounded-lg shadow-sm p-6 items-center justify-center">
            <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
            <ThemedText className="text-lg font-medium text-gray-700 mt-4 mb-2">
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
                <Text className="text-white font-medium">Chercher un logement</Text>
              </TouchableOpacity>
            )}
          </ThemedView>
        ) : (
          <FlatList
            data={reservations}
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