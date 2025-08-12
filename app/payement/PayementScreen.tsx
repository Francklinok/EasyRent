import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CustomButton } from '@/components/ui';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { BackButton } from '@/components/ui/BackButton';
import { useBooking, BookingReservation } from '@/components/contexts/booking/BookingContext';
import { useTheme } from '@/components/contexts/theme/themehook';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { router } from 'expo-router';

export default function PaymentScreen() {
  const route = useRoute();
  const { reservationId } = route.params as { reservationId: string };
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { getReservation, updateReservationStatus } = useBooking();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'crypto' | 'wallet' | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [reservation, setReservation] = useState<BookingReservation | null>(null);
  const walletBalance = 15750.50;
  
  useEffect(() => {
    const res = getReservation(reservationId);
    setReservation(res || null);
  }, [reservationId, getReservation]);
  
  const calculateTotal = () => {
    if (!reservation) return 0;
    return reservation.monthlyRent + reservation.depositAmount;
  };

  const handlePayment = () => {
    if (!paymentMethod) {
      Alert.alert('Erreur', 'Veuillez sélectionner une méthode de paiement');
      return;
    }
    
    if (paymentMethod === 'wallet' && walletBalance < calculateTotal()) {
      Alert.alert(
        'Solde insuffisant',
        `Votre solde (${walletBalance.toLocaleString()}€) est insuffisant pour ce paiement (${calculateTotal().toLocaleString()}€).`,
        [
          { text: 'Recharger le portefeuille', onPress: () => router.push('/profile/wallet') },
          { text: 'Choisir autre méthode', style: 'cancel' }
        ]
      );
      return;
    }
    
    setPaymentLoading(true);
    setTimeout(() => {
      updateReservationStatus(reservationId, 'payment_completed');
      setPaymentLoading(false);
      Alert.alert(
        'Paiement réussi !',
        'Votre paiement a été traité avec succès. Votre contrat sera généré sous 24h.',
        [{ text: 'OK', onPress: () => router.push('/finalBooking/bookingstatus') }]
      );
    }, 2000);
  };
  
  const handleWalletRedirect = () => {
    router.push('/wallet/wallet');
  };
  
  if (!reservation) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ThemedText>Réservation non trouvée</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16,backgroundColor: theme.surface }}>
        <MotiView from={{ opacity: 0, translateY: -20 }} animate={{ opacity: 1, translateY: 0 }}>
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <BackButton />
            <ThemedText type="title" intensity="strong" style={{ marginLeft: 16, color: theme.onSurface }}>
              Finaliser le paiement
            </ThemedText>
          </ThemedView>
        </MotiView>
        
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 100 }}>
          <ThemedText type = "normal" className = "px-2 py-2">Méthode de paiement</ThemedText>
          
          <TouchableOpacity onPress={() => setPaymentMethod('wallet')} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 2, borderColor: paymentMethod === 'wallet' ? theme.primary : theme.outline + '30', backgroundColor: paymentMethod === 'wallet' ? theme.primary + '10' : theme.surfaceVariant }}>
            <LinearGradient colors={[theme.primary, theme.secondary || theme.primary + '80']} style={{ borderRadius: 8, padding: 8, marginRight: 12 }}>
              <MaterialCommunityIcons name="wallet" size={24} color="white" />
            </LinearGradient>
            <ThemedView variant="surfaceVariant" style={{ flex: 1 }}>
              <ThemedText type = "normal">Portefeuille de l'app</ThemedText>
              <ThemedText style={{ fontSize: 12, color: theme.onSurface + '70' }}>Solde: {walletBalance.toLocaleString()}€</ThemedText>
              {walletBalance < calculateTotal() && <ThemedText style={{ fontSize: 11, color: theme.error, marginTop: 2 }}>Solde insuffisant</ThemedText>}
            </ThemedView>
            <TouchableOpacity onPress={handleWalletRedirect} style={{ marginRight: 8 }}>
              <MaterialCommunityIcons name="cog" size={20} color={theme.primary} />
            </TouchableOpacity>
            {paymentMethod === 'wallet' && <MaterialCommunityIcons name="check-circle" size={24} color={theme.primary} />}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setPaymentMethod('card')} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 2, borderColor: paymentMethod === 'card' ? theme.primary : theme.outline + '30', backgroundColor: paymentMethod === 'card' ? theme.primary + '10' : theme.surfaceVariant }}>
            <Ionicons name="card-outline" size={24} color={paymentMethod === 'card' ? theme.primary : theme.onSurface + '60'} style={{ marginRight: 12 }} />
            <ThemedView variant = "surfaceVariant" style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 16, fontWeight: '600', color: theme.onSurface }}>Carte bancaire</ThemedText>
              <ThemedText style={{ fontSize: 12, color: theme.onSurface + '70' }}>Visa, Mastercard, Amex</ThemedText>
            </ThemedView>
            {paymentMethod === 'card' && <MaterialCommunityIcons name="check-circle" size={24} color={theme.primary} />}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setPaymentMethod('paypal')} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 2, borderColor: paymentMethod === 'paypal' ? theme.primary : theme.outline + '30', backgroundColor: paymentMethod === 'paypal' ? theme.primary + '10' : theme.surfaceVariant }}>
            <Ionicons name="logo-paypal" size={24} color={paymentMethod === 'paypal' ? theme.primary : theme.onSurface + '60'} style={{ marginRight: 12 }} />
            <ThemedView variant = "surfaceVariant" style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 16, fontWeight: '600', color: theme.onSurface }}>PayPal</ThemedText>
              <ThemedText style={{ fontSize: 12, color: theme.onSurface + '70' }}>Paiement sécurisé</ThemedText>
            </ThemedView>
            {paymentMethod === 'paypal' && <MaterialCommunityIcons name="check-circle" size={24} color={theme.primary} />}
          </TouchableOpacity>
        </MotiView>  
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 300 }}>
          <ThemedView  style={{ borderRadius: 16, padding: 20, marginBottom: 24, backgroundColor: theme.success +"80" }}>
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',backgroundColor: theme.success +"80" }}>
              <ThemedText type = "normal" intensity="strong">Total à payer</ThemedText>
              <ThemedText type = "normal" intensity="strong">{calculateTotal().toLocaleString()}€</ThemedText>
            </ThemedView>
          </ThemedView>
          
          <CustomButton title={paymentLoading ? 'Traitement...' : 'Confirmer le paiement'} onPress={handlePayment} loading={paymentLoading} disabled={paymentLoading || !paymentMethod} />
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}