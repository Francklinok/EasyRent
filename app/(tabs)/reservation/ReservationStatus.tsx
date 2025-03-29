
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { firestore } from '../services/firebase';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';

interface Reservation {
  id: string;
  propertyTitle: string;
  status: string;
  createdAt: any;
  startDate: any;
  endDate: any;
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

export default function ReservationStatusScreen() {
  const { user, userType } = useContext(AuthContext);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    if (!user) return;

    const field = userType === 'tenant' ? 'tenantId' : 'landlordId';
    const reservationsRef = collection(firestore, 'reservations');
    const q = query(reservationsRef, where(field, '==', user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reservationsData: Reservation[] = [];
      querySnapshot.forEach((doc) => {
        reservationsData.push({ id: doc.id, ...doc.data() } as Reservation);
      });
      
      // Trier par date de création (la plus récente en premier)
      reservationsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      setReservations(reservationsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, userType]);



  const handleReservationPress = (reservation: Reservation) => {
    if (userType === 'landlord') {
      navigation.navigate('ApplicationReview', { reservationId: reservation.id });
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
        navigation.navigate('Payment', { reservationId: reservation.id });
        break;
      case 'payment_completed':
      case 'contract_generated':
        navigation.navigate('Contract', { reservationId: reservation.id });
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
      return// Suite du fichier: screens/ReservationStatusScreen.tsx
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
    
      const formatDate = (date: any) => {
        if (!date) return 'Non définie';
        
        try {
          const dateObj = date?.toDate?.() || new Date(date);
          return format(dateObj, 'dd MMMM yyyy', { locale: fr });
        } catch (error) {
          console.error('Date formatting error:', error);
          return 'Date invalide';
        }
      }};
    
      const renderItem = ({ item }: { item: Reservation }) => {
        const statusInfo = statusMap[item.status] || statusMap.pending;
        
        return (
          <TouchableOpacity
            className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden"
            onPress={() => handleReservationPress(item)}
          >
            <View className="p-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-semibold">{item.propertyTitle}</Text>
                <View className={`px-2 py-1 rounded-full ${statusInfo.color}`}>
                  <Text className="text-xs font-medium">{statusInfo.text}</Text>
                </View>
              </View>
              
              <View className="mb-3">
                <Text className="text-gray-600 text-sm">
                  Demande créée le {formatDate(item.createdAt)}
                </Text>
                <Text className="text-gray-600 text-sm">
                  Période: {formatDate(item.startDate)} - {formatDate(item.endDate)}
                </Text>
                <Text className="text-gray-600 text-sm">
                  Loyer mensuel: {item.monthlyRent} €
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center border-t border-gray-200 pt-3">
                <Text className="text-blue-600 font-medium">
                  {getNextAction(item.status)}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#4B5563" />
              </View>
            </View>
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
          <View className="p-4">
            <Text className="text-2xl font-bold mb-4">Mes réservations</Text>
            
            {reservations.length === 0 ? (
              <View className="bg-white rounded-lg shadow-sm p-6 items-center justify-center">
                <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
                <Text className="text-lg font-medium text-gray-700 mt-4 mb-2">
                  Aucune réservation trouvée
                </Text>
                <Text className="text-gray-500 text-center mb-4">
                  {userType === 'tenant' 
                    ? 'Vous n\'avez pas encore effectué de demande de réservation.'
                    : 'Vous n\'avez pas encore reçu de demande de réservation.'}
                </Text>
                {userType === 'tenant' && (
                  <TouchableOpacity
                    className="bg-blue-600 py-3 px-4 rounded-lg"
                    onPress={() => navigation.navigate('Home')}
                  >
                    <Text className="text-white font-medium">Chercher un logement</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <FlatList
                data={reservations}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}
          </View>
        </SafeAreaView>
      );
    }
  }
}