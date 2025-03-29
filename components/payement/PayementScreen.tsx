
    // Fichier: screens/PaymentScreen.tsx
    import React, { useState, useEffect, useContext } from 'react';
    import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
    import { SafeAreaView } from 'react-native-safe-area-context';
    import { useNavigation } from '@react-navigation/native';
    import { doc, getDoc, updateDoc } from 'firebase/firestore';
    import { firestore } from '../services/firebase';
    import { AuthContext } from '../contexts/AuthContext';
    import { CustomButton } from '../components';
    import { Ionicons } from '@expo/vector-icons';
    import { useStripe } from '@stripe/stripe-react-native';
    import axios from 'axios';
    import { PAYMENT_API_URL } from '@env';
    
    export default function PaymentScreen({ route }) {
      const { reservationId } = route.params;
      const { user } = useContext(AuthContext);
      const navigation = useNavigation();
      const { initPaymentSheet, presentPaymentSheet } = useStripe();
      const [reservation, setReservation] = useState<any>(null);
      const [property, setProperty] = useState<any>(null);
      const [loading, setLoading] = useState(true);
      const [paymentLoading, setPaymentLoading] = useState(false);
      const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'crypto' | null>(null);
    
      useEffect(() => {
        const fetchReservation = async () => {
          try {
            const reservationDoc = await getDoc(doc(firestore, 'reservations', reservationId));
            
            if (reservationDoc.exists()) {
              const reservationData = reservationDoc.data();
              setReservation(reservationData);
              
              // Récupérer les informations de la propriété
              const propertyDoc = await getDoc(doc(firestore, 'properties', reservationData.propertyId));
              if (propertyDoc.exists()) {
                setProperty(propertyDoc.data());
              }
            } else {
              Alert.alert('Erreur', 'Réservation introuvable');
              navigation.goBack();
            }
          } catch (error) {
            console.error('Error fetching reservation:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors du chargement des données');
          } finally {
            setLoading(false);
          }
        };
    
        fetchReservation();
      }, [reservationId, navigation]);
    
      const initializePaymentSheet = async () => {
        try {
          setPaymentLoading(true);
          
          // Appeler l'API pour créer l'intention de paiement
          const response = await axios.post(`${PAYMENT_API_URL}/create-payment-intent`, {
            amount: calculateTotalAmount() * 100, // Convertir en centimes pour Stripe
            currency: 'eur',
            customerId: user.uid,
            metadata: {
              reservationId,
              propertyId: reservation.propertyId,
              tenantId: user.uid,
              landlordId: reservation.landlordId
            }
          });
          
          const { paymentIntent, ephemeralKey, customer } = response.data;
          
          // Initialiser la feuille de paiement
          const { error } = await initPaymentSheet({
            merchantDisplayName: 'Système de Location',
            customerId: customer,
            customerEphemeralKeySecret: ephemeralKey,
            paymentIntentClientSecret: paymentIntent,
            allowsDelayedPaymentMethods: false,
            defaultBillingDetails: {
              name: user.fullName,
              email: user.email
            }
          });
          
          if (error) {
            console.error('Payment sheet initialization error:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de l\'initialisation du paiement');
          }
          
          return !error;
        } catch (error) {
          console.error('Payment intent creation error:', error);
          Alert.alert('Erreur', 'Une erreur est survenue lors de la création de l\'intention de paiement');
          return false;
        } finally {
          setPaymentLoading(false);
        }
      };
    
      const handleCardPayment = async () => {
        const initialized = await initializePaymentSheet();
        
        if (!initialized) return;
        
        const { error } = await presentPaymentSheet();
        
        if (error) {
          console.error('Payment error:', error);
          Alert.alert('Paiement échoué', error.message);
        } else {
          handlePaymentSuccess();
        }
      };
    
      const handlePayPalPayment = async () => {
        // Dans une application réelle, intégrez ici le SDK PayPal
        Alert.alert(
          'Paiement PayPal',
          'Cette fonctionnalité serait intégrée avec le SDK PayPal dans une application réelle.',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Simuler un paiement réussi', onPress: handlePaymentSuccess }
          ]
        );
      };
    
      const handleCryptoPayment = async () => {
        // Dans une application réelle, intégrez ici un service de paiement en cryptomonnaie
        Alert.alert(
          'Paiement en cryptomonnaie',
          'Cette fonctionnalité serait intégrée avec un service de paiement en cryptomonnaie dans une application réelle.',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Simuler un paiement réussi', onPress: handlePaymentSuccess }
          ]
        );
      };
    
      const handlePaymentSuccess = async () => {
        try {
          setPaymentLoading(true);
          
          // Mettre à jour le statut de la réservation
          await updateDoc(doc(firestore, 'reservations', reservationId), {
            status: 'payment_completed',
            paymentDate: new Date().toISOString(),
            paymentMethod: paymentMethod || 'card',
          });
          
          // Rediriger vers l'écran du contrat
          navigation.navigate('Contract', { reservationId });
          
          Alert.alert(
            'Paiement réussi',
            'Votre paiement a été traité avec succès. Un contrat de location a été généré.'
          );
        } catch (error) {
          console.error('Payment success handling error:', error);
          Alert.alert('Erreur', 'Une erreur est survenue lors de la finalisation du paiement');
        } finally {
          setPaymentLoading(false);
        }
      };
    
      const calculateTotalAmount = () => {
        if (!reservation || !property) return 0;
        return (reservation.monthlyRent || 0) + (property.depositAmount || 0);
      };
    
      if (loading) {
        return (
          <SafeAreaView className="flex-1 bg-white justify-center items-center">
            <Text>Chargement...</Text>
          </SafeAreaView>
        );
      }
    
      return (
        <SafeAreaView className="flex-1 bg-white">
          <ScrollView className="flex-1 p-4">
            <Text className="text-2xl font-bold mb-4">Paiement</Text>
            
            <View className="bg-gray-50 p-4 rounded-lg mb-6">
              <Text className="text-lg font-semibold mb-2">Résumé de la réservation</Text>
              <Text className="mb-1">{property?.title}</Text>
              <Text className="mb-1">Loyer mensuel: {reservation?.monthlyRent} €</Text>
              <Text className="mb-1">Dépôt de garantie: {property?.depositAmount} €</Text>
              <View className="flex-row justify-between pt-2 border-t border-gray-200 mt-2">
                <Text className="font-bold">Total à payer</Text>
                <Text className="font-bold">{calculateTotalAmount()} €</Text>
              </View>
            </View>
            
            <Text className="text-lg font-semibold mb-4">Méthode de paiement</Text>
            
            <TouchableOpacity
              className={`flex-row items-center p-4 border rounded-lg mb-3 ${
                paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onPress={() => setPaymentMethod('card')}
            >
              <Ionicons name="card-outline" size={24} color={paymentMethod === 'card' ? '#3B82F6' : '#6B7280'} />
              <View className="ml-3 flex-1">
                <Text className="font-medium">Carte bancaire</Text>
                <Text className="text-gray-500 text-sm">Visa, Mastercard, etc.</Text>
              </View>
              {paymentMethod === 'card' && <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />}
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`flex-row items-center p-4 border rounded-lg mb-3 ${
                paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onPress={() => setPaymentMethod('paypal')}
            >
              <Ionicons name="logo-paypal" size={24} color={paymentMethod === 'paypal' ? '#3B82F6' : '#6B7280'} />
              <View className="ml-3 flex-1">
                <Text className="font-medium">PayPal</Text>
                <Text className="text-gray-500 text-sm">Paiement sécurisé via PayPal</Text>
              </View>
              {paymentMethod === 'paypal' && <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />}
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`flex-row items-center p-4 border rounded-lg mb-6 ${
                paymentMethod === 'crypto' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onPress={() => setPaymentMethod('crypto')}
            >
              <Ionicons name="logo-bitcoin" size={24} color={paymentMethod === 'crypto' ? '#3B82F6' : '#6B7280'} />
              <View className="ml-3 flex-1">
                <Text className="font-medium">Cryptomonnaie</Text>
                <Text className="text-gray-500 text-sm">Bitcoin, Ethereum, etc.</Text>
              </View>
              {paymentMethod === 'crypto' && <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />}
            </TouchableOpacity>
            
            <CustomButton
              title="Procéder au paiement"
              onPress={() => {
                switch (paymentMethod) {
                  case 'card':
                    handleCardPayment();
                    break;
                  case 'paypal':
                    handlePayPalPayment();
                    break;
                  case 'crypto':
                    handleCryptoPayment();
                    break;
                  default:
                    Alert.alert('Erreur', 'Veuillez sélectionner une méthode de paiement');
                }
              }}
              loading={paymentLoading}
              disabled={!paymentMethod || paymentLoading}
            />
            
            <View className="mt-6 items-center">
              <Text className="text-sm text-gray-500 mb-2">Paiement sécurisé</Text>
              <View className="flex-row">
                <Ionicons name="lock-closed" size={16} color="#6B7280" />
                <Text className="text-sm text-gray-500 ml-1">Vos données sont protégées</Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }