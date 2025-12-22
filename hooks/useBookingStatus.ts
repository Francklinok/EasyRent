import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Alert } from 'react-native';

export type BookingStatus =
  | 'idle'           // Pas encore commencé
  | 'creating'       // En cours de création
  | 'pending'        // En attente de réponse du propriétaire
  | 'accepted'       // Acceptée par le propriétaire
  | 'rejected'       // Refusée par le propriétaire
  | 'documents_required'  // Documents requis
  | 'documents_submitted' // Documents soumis
  | 'documents_approved'  // Documents approuvés
  | 'documents_rejected'  // Documents rejetés
  | 'payment_pending'     // En attente de paiement
  | 'payment_completed'   // Paiement effectué
  | 'completed';          // Réservation complétée

export interface BookingStatusData {
  reservationId?: string;
  status: BookingStatus;
  propertyId?: string;
  propertyTitle?: string;
  ownerId?: string;
  clientId?: string;
  rejectionReason?: string;
  acceptedAt?: Date;
  rejectedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Hook pour gérer le statut d'une réservation
 * Empêche les redirections automatiques non désirées
 * Affiche la page de paiement seulement quand la réservation est acceptée
 */
export const useBookingStatus = (initialStatus: BookingStatus = 'idle') => {
  const [bookingData, setBookingData] = useState<BookingStatusData>({
    status: initialStatus
  });
  const [previousStatus, setPreviousStatus] = useState<BookingStatus>(initialStatus);
  const [shouldShowPayment, setShouldShowPayment] = useState(false);

  /**
   * Met à jour le statut de la réservation
   * Gère automatiquement la navigation vers la page de paiement
   */
  const updateStatus = (newStatus: BookingStatus, data?: Partial<BookingStatusData>) => {
    console.log('📊 [useBookingStatus] Changement de statut:', {
      from: bookingData.status,
      to: newStatus,
      data
    });

    setPreviousStatus(bookingData.status);

    setBookingData(prev => ({
      ...prev,
      ...data,
      status: newStatus,
      updatedAt: new Date()
    }));

    // Gérer les transitions de statut
    handleStatusTransition(bookingData.status, newStatus, data);
  };

  /**
   * Gère les transitions entre statuts
   */
  const handleStatusTransition = (
    oldStatus: BookingStatus,
    newStatus: BookingStatus,
    data?: Partial<BookingStatusData>
  ) => {
    // Réservation acceptée → Afficher page de paiement
    if (oldStatus === 'pending' && newStatus === 'accepted') {
      console.log('✅ [useBookingStatus] Réservation acceptée → Affichage paiement');

      Alert.alert(
        '🎉 Réservation acceptée !',
        'Votre réservation a été acceptée par le propriétaire. Vous pouvez maintenant procéder au paiement.',
        [
          {
            text: 'Payer maintenant',
            onPress: () => {
              setShouldShowPayment(true);
              navigateToPayment(data);
            }
          },
          {
            text: 'Plus tard',
            style: 'cancel',
            onPress: () => {
              console.log('💡 Paiement reporté');
            }
          }
        ]
      );
    }

    // Réservation refusée
    if (oldStatus === 'pending' && newStatus === 'rejected') {
      console.log('❌ [useBookingStatus] Réservation refusée');

      Alert.alert(
        '❌ Réservation refusée',
        data?.rejectionReason
          ? `Raison : ${data.rejectionReason}`
          : 'Le propriétaire a refusé votre demande de réservation.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Retour à la liste des propriétés
              router.back();
            }
          }
        ]
      );
    }

    // Documents approuvés → Attente paiement
    if (oldStatus === 'documents_submitted' && newStatus === 'documents_approved') {
      console.log('📄 [useBookingStatus] Documents approuvés');

      Alert.alert(
        '✅ Documents approuvés',
        'Vos documents ont été approuvés. Le propriétaire va maintenant examiner votre demande.',
        [{ text: 'OK' }]
      );
    }

    // Documents rejetés
    if (oldStatus === 'documents_submitted' && newStatus === 'documents_rejected') {
      console.log('❌ [useBookingStatus] Documents rejetés');

      Alert.alert(
        '❌ Documents rejetés',
        data?.rejectionReason
          ? `Raison : ${data.rejectionReason}`
          : 'Vos documents ont été rejetés. Veuillez soumettre de nouveaux documents.',
        [{ text: 'OK' }]
      );
    }

    // Paiement complété
    if (oldStatus === 'payment_pending' && newStatus === 'payment_completed') {
      console.log('💰 [useBookingStatus] Paiement complété');

      Alert.alert(
        '🎉 Paiement réussi !',
        'Votre réservation est maintenant confirmée. Vous recevrez un contrat sous peu.',
        [
          {
            text: 'Voir ma réservation',
            onPress: () => {
              // Navigation vers les réservations
              router.push('/activity');
            }
          }
        ]
      );
    }
  };

  /**
   * Navigation vers la page de paiement
   */
  const navigateToPayment = (data?: Partial<BookingStatusData>) => {
    if (!data?.reservationId || !data?.propertyId) {
      console.error('❌ [useBookingStatus] Données manquantes pour le paiement');
      Alert.alert('Erreur', 'Impossible d\'accéder au paiement. Données manquantes.');
      return;
    }

    console.log('💳 [useBookingStatus] Navigation vers paiement:', {
      reservationId: data.reservationId,
      propertyId: data.propertyId
    });

    // Navigation vers la page de paiement
    router.push({
      pathname: '/payement/PayementScreen',
      params: {
        reservationId: data.reservationId,
        propertyId: data.propertyId,
        propertyTitle: data.propertyTitle || 'Propriété',
        amount: '1000' // TODO: Calculer le montant réel
      }
    });
  };

  /**
   * Vérifie si la page de paiement doit être affichée
   */
  const canShowPayment = () => {
    return bookingData.status === 'accepted' ||
           bookingData.status === 'payment_pending';
  };

  /**
   * Vérifie si la réservation peut être soumise
   */
  const canSubmitBooking = () => {
    return bookingData.status === 'idle' ||
           bookingData.status === 'creating';
  };

  /**
   * Vérifie si la réservation est en attente
   */
  const isPending = () => {
    return bookingData.status === 'pending';
  };

  /**
   * Vérifie si la réservation est acceptée
   */
  const isAccepted = () => {
    return bookingData.status === 'accepted' ||
           bookingData.status === 'payment_pending' ||
           bookingData.status === 'payment_completed';
  };

  /**
   * Vérifie si la réservation est refusée
   */
  const isRejected = () => {
    return bookingData.status === 'rejected' ||
           bookingData.status === 'documents_rejected';
  };

  /**
   * Réinitialise le statut
   */
  const resetStatus = () => {
    console.log('🔄 [useBookingStatus] Réinitialisation du statut');
    setBookingData({
      status: 'idle'
    });
    setPreviousStatus('idle');
    setShouldShowPayment(false);
  };

  /**
   * Simuler une acceptation (pour les tests)
   */
  const simulateAcceptance = (reservationId: string, propertyId: string) => {
    console.log('🧪 [useBookingStatus] Simulation acceptation');
    setTimeout(() => {
      updateStatus('accepted', {
        reservationId,
        propertyId,
        acceptedAt: new Date()
      });
    }, 3000);
  };

  /**
   * Simuler un refus (pour les tests)
   */
  const simulateRejection = (reason: string = 'Le propriétaire a refusé votre demande') => {
    console.log('🧪 [useBookingStatus] Simulation refus');
    setTimeout(() => {
      updateStatus('rejected', {
        rejectionReason: reason,
        rejectedAt: new Date()
      });
    }, 3000);
  };

  return {
    bookingData,
    status: bookingData.status,
    previousStatus,
    shouldShowPayment,
    updateStatus,
    canShowPayment,
    canSubmitBooking,
    isPending,
    isAccepted,
    isRejected,
    resetStatus,
    navigateToPayment,
    simulateAcceptance,
    simulateRejection
  };
};

/**
 * Hook pour écouter les changements de statut d'une réservation
 * depuis le backend (WebSocket, polling, etc.)
 */
export const useBookingStatusListener = (
  reservationId?: string,
  onStatusChange?: (status: BookingStatus, data?: BookingStatusData) => void
) => {
  useEffect(() => {
    if (!reservationId) return;

    console.log('👂 [useBookingStatusListener] Écoute des changements pour:', reservationId);

    // TODO: Implémenter l'écoute réelle via WebSocket ou polling
    // Pour l'instant, simulation avec interval
    const interval = setInterval(async () => {
      try {
        // Simuler un appel API pour vérifier le statut
        // const status = await checkBookingStatus(reservationId);
        // if (status !== currentStatus) {
        //   onStatusChange?.(status);
        // }
      } catch (error) {
        console.error('❌ Erreur vérification statut:', error);
      }
    }, 10000); // Vérifier toutes les 10 secondes

    return () => {
      console.log('🔇 [useBookingStatusListener] Arrêt de l\'écoute');
      clearInterval(interval);
    };
  }, [reservationId]);
};

export default useBookingStatus;
