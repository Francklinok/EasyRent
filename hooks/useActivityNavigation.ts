import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ActivityProgress, getActivityProgressService } from '@/services/activityProgressService';

interface UseActivityNavigationOptions {
  propertyId: string;
  userId: string;
  autoNavigate?: boolean; 
  currentScreen?: 'visit' | 'reservation' | 'payment';
}

export const useActivityNavigation = ({
  propertyId,
  userId,
  autoNavigate = true,
  currentScreen
}: UseActivityNavigationOptions) => {
  const router = useRouter();
  const [progress, setProgress] = useState<ActivityProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const activityProgressService = getActivityProgressService();

  useEffect(() => {
    if (propertyId && userId) {
      loadProgress();
    }
  }, [propertyId, userId]);

  const loadProgress = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 [useActivityNavigation] Chargement progression...');

      // Essayer de charger depuis le cache d'abord
      const cached = await activityProgressService.getCachedProgress(propertyId);
      if (cached) {
        setProgress(cached);
        console.log('📦 [useActivityNavigation] Progression depuis cache:', cached);
      }

      // load from the  backend
      const serverProgress = await activityProgressService.getProgress(propertyId, userId);
      setProgress(serverProgress);
      console.log('✅ [useActivityNavigation] Progression depuis serveur:', serverProgress);

      // automatic  navigation
      if (autoNavigate && currentScreen) {
        checkAndNavigate(serverProgress, currentScreen);
      }
    } catch (error) {
      console.error('❌ [useActivityNavigation] Erreur chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAndNavigate = (prog: ActivityProgress, screen: string) => {
    console.log('🧭 [useActivityNavigation] Vérification navigation:', {
      currentScreen: screen,
      currentStep: prog.currentStep,
      visitStatus: prog.visitStatus,
      reservationStatus: prog.reservationStatus
    });

    if (screen === 'visit' && prog.visitStatus === 'accepted') {
      console.log('➡️ [useActivityNavigation] Visite acceptée → Redirection vers réservation');
      setShouldRedirect(true);
      router.replace({
        pathname: '/booking/bookingscreen',
        params: { propertyId }
      });
      return;
    }

    if (screen === 'reservation') {
      //if visit is not accepted
      if (prog.visitStatus !== 'accepted') {
        console.log('⬅️ [useActivityNavigation] Visite pas acceptée → Redirection vers visite');
        setShouldRedirect(true);
        router.replace({
          pathname: '/booking/VisitScreen',
          params: { propertyId }
        });
        return;
      }
      
      // if  reservation accepted, redirect  to payment
      if (prog.reservationStatus === 'accepted') {
        console.log('➡️ [useActivityNavigation] Réservation acceptée → Redirection vers paiement');
        setShouldRedirect(true);
        router.replace({
          pathname: '/payement/PayementScreen',
          params: { propertyId }
        });
        return;
      }
    }
    if (screen === 'payment') {
      //return   to  the  reservation screen if  reservation  is  not accepted
      if (prog.reservationStatus !== 'accepted') {
        console.log('⬅️ [useActivityNavigation] Réservation pas acceptée → Redirection vers réservation');
        setShouldRedirect(true);
        router.replace({
          pathname: '/booking/bookingscreen',
          params: { propertyId }
        });
        return;
      }
      
     
      if (prog.paymentStatus === 'completed') {
        console.log('➡️ [useActivityNavigation] Paiement fait → Redirection vers profil');
        setShouldRedirect(true);
        router.replace('/profile/activities');
        return;
      }
    }

    console.log('✓ [useActivityNavigation] Pas de redirection nécessaire');
  };

  const refreshProgress = async () => {
    await loadProgress();
  };

  const navigateToNextStep = () => {
    if (!progress) return;

    switch (progress.currentStep) {
      case 'visit':
        router.push({
          pathname: '/booking/VisitScreen',
          params: { propertyId }
        });
        break;
      case 'reservation':
        router.push({
          pathname: '/booking/bookingscreen',
          params: { propertyId }
        });
        break;
      case 'payment':
        router.push({
          pathname: '/payement/PayementScreen',
          params: { propertyId }
        });
        break;
      case 'completed':
        router.push('/profile/activities');
        break;
    }
  };

  return {
    progress,
    isLoading,
    shouldRedirect,
    refreshProgress,
    navigateToNextStep
  };
};
