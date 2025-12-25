import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { Alert } from 'react-native';

export interface RedirectConfig {
  propertyId: string;
  clientId: string;
  onRedirect?: (destination: string) => void;
}

export const useAutoRedirect = (config: RedirectConfig) => {
  const hasRedirected = useRef(false);
  const isChecking = useRef(false);

  useEffect(() => {
    if (hasRedirected.current || isChecking.current) {
      return; 
    }

    const checkAndRedirect = async () => {
      if (isChecking.current) return;

      isChecking.current = true;

      try {
        console.log('🔍 [useAutoRedirect] Vérification de l\'état...');

        const visitStatus = await checkVisitStatus(config.propertyId, config.clientId);

        if (visitStatus?.isAccepted && visitStatus.needsBooking) {
          console.log('✅ [useAutoRedirect] Visite acceptée → Redirection vers réservation');
          handleVisitAcceptedRedirect(config.propertyId, visitStatus);
          return;
        }

        const bookingStatus = await checkBookingStatus(config.propertyId, config.clientId);

        if (bookingStatus?.isAccepted && bookingStatus.needsPayment) {
          console.log('💳 [useAutoRedirect] Réservation acceptée → Redirection vers paiement');
          handleBookingAcceptedRedirect(bookingStatus);
          return;
        }

        console.log('ℹ️ [useAutoRedirect] Aucune redirection nécessaire');

      } catch (error) {
        console.error('❌ [useAutoRedirect] Erreur:', error);
      } finally {
        isChecking.current = false;
      }
    };

    const timer = setTimeout(() => {
      checkAndRedirect();
    }, 500);

    return () => clearTimeout(timer);
  }, [config.propertyId, config.clientId]);


  const checkVisitStatus = async (
    propertyId: string,
    clientId: string
  ): Promise<{ isAccepted: boolean; needsBooking: boolean; visitData?: any } | null> => {
    try {
      const { getBookingService } = await import('@/services/api/bookingService');
      const bookingService = getBookingService();

      const visit = await bookingService.getUserVisitForProperty(propertyId, clientId);

      if (!visit) {
        return null;
      }

      console.log('📋 [useAutoRedirect] Visite trouvée:', {
        id: visit.id,
        status: visit.status,
        isVisiteAccepted: visit.isVisiteAccepted,
        isReservation: visit.isReservation
      });

      if (visit.isReservation) {
        console.log('⚠️ [useAutoRedirect] C\'est une réservation, pas une visite');
        return null;
      }

      const isAccepted = visit.isVisiteAccepted === true || visit.status === 'ACCEPTED';

      const hasExistingBooking = await checkIfBookingExists(propertyId, clientId);

      return {
        isAccepted,
        needsBooking: isAccepted && !hasExistingBooking,
        visitData: visit
      };
    } catch (error) {
      console.error('❌ [useAutoRedirect] Erreur vérification visite:', error);
      return null;
    }
  };

  const checkIfBookingExists = async (
    propertyId: string,
    clientId: string
  ): Promise<boolean> => {
    try {
      const { getBookingService } = await import('@/services/api/bookingService');
      const bookingService = getBookingService();
      
      const booking = await bookingService.getUserBookingForProperty(propertyId, clientId);
      
      if (booking && booking.isReservation) {
        console.log('✅ [useAutoRedirect] Réservation existante trouvée:', booking.id);
        return true;
      }
      
      console.log('ℹ️ [useAutoRedirect] Aucune réservation trouvée');
      return false;
    } catch (error) {
      console.error('❌ [useAutoRedirect] Erreur vérification réservation:', error);
      return false;
    }
  };

  const checkBookingStatus = async (
    propertyId: string,
    clientId: string
  ): Promise<{ isAccepted: boolean; needsPayment: boolean; bookingData?: any } | null> => {
    try {
      // TODO: Implémenter la vérification réelle via API
      const { getBookingService } = await import('@/services/api/bookingService');
      const bookingService = getBookingService();

      const activity = await bookingService.getUserVisitForProperty(propertyId, clientId);

      if (!activity || !activity.isReservation) {
        return null;
      }

      console.log('📋 [useAutoRedirect] Réservation trouvée:', {
        id: activity.id,
        status: activity.status,
        isReservation: activity.isReservation
      });

      const isAccepted = activity.status === 'ACCEPTED' || activity.isVisiteAccepted === true;

      const hasExistingPayment = await checkIfPaymentExists(activity.id);

      return {
        isAccepted,
        needsPayment: isAccepted && !hasExistingPayment,
        bookingData: activity
      };
    } catch (error) {
      console.error('❌ [useAutoRedirect] Erreur vérification réservation:', error);
      return null;
    }
  };


  const checkIfPaymentExists = async (bookingId: string): Promise<boolean> => {
    try {
      //
      return false;
    } catch (error) {
      console.error('❌ [useAutoRedirect] Erreur vérification paiement:', error);
      return false;
    }
  };

  const handleVisitAcceptedRedirect = (propertyId: string, visitStatus: any) => {
    if (hasRedirected.current) return;

    hasRedirected.current = true;

    Alert.alert(
      '✅ Visite confirmée !',
      'Votre demande de visite a été acceptée par le propriétaire. Vous pouvez maintenant procéder à la réservation.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
          onPress: () => {
            hasRedirected.current = false;
          }
        },
        {
          text: 'Réserver maintenant',
          onPress: () => {
            config.onRedirect?.('booking');

            setTimeout(() => {
              router.push({
                pathname: '/booking/bookingscreen',
                params: {
                  property: JSON.stringify({
                    id: propertyId,
                    visitCompleted: true,
                    visitId: visitStatus.visitData?.id
                  })
                }
              });
            }, 300);
          }
        }
      ],
      { cancelable: false }
    );
  };


  const handleBookingAcceptedRedirect = (bookingStatus: any) => {
    if (hasRedirected.current) return;

    hasRedirected.current = true;

    Alert.alert(
      '🎉 Réservation acceptée !',
      'Félicitations ! Le propriétaire a accepté votre demande de réservation. Vous pouvez maintenant procéder au paiement.',
      [
        {
          text: 'Plus tard',
          style: 'cancel',
          onPress: () => {
            hasRedirected.current = false;
          }
        },
        {
          text: 'Payer maintenant',
          onPress: () => {
            config.onRedirect?.('payment');

            setTimeout(() => {
              router.push({
                pathname: '/payement/PayementScreen',
                params: {
                  reservationId: bookingStatus.bookingData?.id || '',
                  propertyId: bookingStatus.bookingData?.propertyId || '',
                  propertyTitle: bookingStatus.bookingData?.propertyTitle || 'Propriété',
                  amount: bookingStatus.bookingData?.amount || '1000'
                }
              });
            }, 300);
          }
        }
      ],
      { cancelable: false }
    );
  };

  return {
    hasRedirected: hasRedirected.current,
    isChecking: isChecking.current
  };
};

export default useAutoRedirect;
