import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, NavigationProp } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText } from 'moti';
import ContractPreview from '@/components/contract/ContractPreview';
import ContractSummary from '@/components/contract/contratSummary';
import PartyInfoSection from '@/components/contract/partyInfo';
import LegalNoticeSection from '@/components/contract/legalNoticeSection';
import FooterSection from '@/components/contract/footerSection';
import generateProfessionalContractHTML from '@/components/utils/generateProfessionalContractHTML';
import generateAdvancedQRCode from '@/components/contract/utilsgeneratecodeQr';
import generateWatermark from '@/components/utils/generateWatermark';
import { Property, Reservation, User } from '@/types/type';
import { ContractType } from '@/types/contract';
import { ThemedText } from '@/components/ui/ThemedText';
import { BackButton } from '@/components/ui/BackButton';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { getActivityService } from '@/services/api/activityService';
import { ThemedView } from '@/components/ui/ThemedView';

type RootStackParamList = {
  Home: undefined;
  Chat: { chatId: string; name: string; image: string; status: string };
  Contract: {
    activityId: string;
    reservationId?: string;
    contractType?: ContractType;
    paymentStatus?: 'pending' | 'completed' | 'failed';
  };
};

type PaymentStatus = 'pending' | 'completed' | 'failed' | 'verifying';

const ContractScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { theme } = useTheme();
  const { user } = useAuth();
  const activityService = getActivityService();

  const {
    activityId,
    reservationId,
    contractType = ContractType.RENTAL,
    paymentStatus: initialPaymentStatus = 'pending',
  } = route.params as {
    activityId?: string;
    reservationId?: string;
    contractType?: ContractType;
    paymentStatus?: PaymentStatus;
  };

  // State
  const [activity, setActivity] = useState<any>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [landlord, setLandlord] = useState<User | null>(null);
  const [tenant, setTenant] = useState<User | null>(null);
  const [buyer, setBuyer] = useState<User | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [contractFileUri, setContractFileUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(initialPaymentStatus);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'details'>('preview');

  const [contractId] = useState(
    `CTR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
  );

  const [aiAnalysis] = useState({
    riskScore: 92,
    complianceScore: 98,
    marketAnalysis: 'Favorable',
    recommendations: [
      'Profil excellent du locataire/acheteur',
      'Valeur du bien en tendance haussière',
      'Investissement à faible risque',
    ],
  });

  const isPurchase = contractType === ContractType.PURCHASE;

  // theme colors can be string or string[] — extract first value if array
  const c = (color: any): string => Array.isArray(color) ? color[0] : color;

  const formatDate = (date: any): Date => {
    if (date?.toDate && typeof date.toDate === 'function') {
      return date.toDate();
    }
    return new Date(date);
  };

  // Fetch contract data from real API
  useEffect(() => {
    fetchData();
  }, [activityId, reservationId]);

  const fetchData = async () => {
    try {
      setErrorMessage(null);
      setLoading(true);

      const targetId = activityId || reservationId;
      if (!targetId) {
        setErrorMessage('Identifiant de réservation manquant');
        setLoading(false);
        return;
      }

      // Fetch real activity data
      const activityData = await activityService.getActivity(targetId);
      if (!activityData) {
        setErrorMessage('Activité introuvable');
        setLoading(false);
        return;
      }

      setActivity(activityData);

      // Map activity data to local state
      const prop = activityData.property;
      if (prop) {
        const mappedProperty: Property = {
          id: prop.id || targetId,
          title: (prop as any).title || 'Propriété',
          address: (prop as any).address || '',
          type: (prop as any).actionType === 'sell' ? 'Vente' : 'Location',
          surface: (prop as any).generalHInfo?.surface || (prop as any).generalLandinfo?.surface || 0,
          rooms: (prop as any).generalHInfo?.rooms || 0,
          depositAmount: (prop as any).ownerCriteria?.depositAmount || 0,
          rentalPrice: (prop as any).ownerCriteria?.monthlyRent || 0,
        };
        setProperty(mappedProperty);

        // Build reservation from activity booking info
        const bookingInfo = activityData.bookingInfo || {};
        const mappedReservation: Reservation = {
          propertyId: prop.id || targetId,
          landlordId: (prop as any).ownerId || '',
          tenantId: activityData.clientId || user?.id || '',
          startDate: bookingInfo.startDate ? new Date(bookingInfo.startDate) : new Date(),
          endDate: bookingInfo.endDate ? new Date(bookingInfo.endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          monthlyRent: (prop as any).ownerCriteria?.monthlyRent || activityData.amount || 0,
          status: activityData.isPayment ? 'payment_completed' : 'pending_payment',
        } as any;
        setReservation(mappedReservation);
      }

      // Build party info from activity client + property owner
      const clientData = activityData.client;
      if (clientData) {
        const clientUser: User = {
          id: clientData.id,
          fullName: clientData.fullName || '',
          email: clientData.email || '',
          phone: (clientData as any).phone || '',
        };

        const ownerUser: User = {
          id: (activityData.property as any)?.ownerId || '',
          fullName: (activityData.property as any)?.ownerName || 'Propriétaire',
          email: (activityData.property as any)?.ownerEmail || '',
          phone: (activityData.property as any)?.ownerPhone || '',
        };

        if (isPurchase) {
          setSeller(ownerUser);
          setBuyer(clientUser);
        } else {
          setLandlord(ownerUser);
          setTenant(clientUser);
        }
      }

      // If activity already has payment done and a stored contract URL
      if (activityData.isPayment) {
        setPaymentStatus('completed');
        if ((activityData as any).contractUrl) {
          setContractFileUri((activityData as any).contractUrl);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching contract data:', error);
      setErrorMessage('Une erreur est survenue lors du chargement des données');
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, [activityId, reservationId]);

  // Helper: fetch image URL and convert to base64 data URI for expo-print
  const fetchImageAsBase64 = async (url: string): Promise<string | undefined> => {
    try {
      const response = await fetch(url);
      if (!response.ok) return undefined;
      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      // Detect mime type from URL
      const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || 'jpg';
      const mimeMap: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
      const mime = mimeMap[ext] || 'image/jpeg';
      return `data:${mime};base64,${base64}`;
    } catch {
      return undefined;
    }
  };

  // Generate contract PDF
  const generateContract = async (): Promise<string | null> => {
    try {
      setGenerating(true);

      if (!reservation || !property) {
        throw new Error('Données incomplètes pour générer le contrat');
      }

      // Generate QR Code
      const qrCodeSVG = generateAdvancedQRCode({
        contractId,
        propertyTitle: property.title,
        tenantName: (isPurchase ? buyer?.fullName : tenant?.fullName) || 'N/A',
        startDate: reservation.startDate?.toISOString() || new Date().toISOString(),
        endDate: reservation.endDate?.toISOString() || new Date().toISOString(),
      });

      // Generate Watermark
      const watermarkSVG = generateWatermark(contractId);

      // Fetch property image as base64 (expo-print cannot load external URLs)
      const actProp = activity?.property as any;
      const imageUrl = actProp?.images?.[0];
      let propertyImageBase64: string | undefined;
      if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
        propertyImageBase64 = await fetchImageAsBase64(imageUrl);
      }

      // Generate professional HTML
      const contractHTML = generateProfessionalContractHTML({
        contractId,
        contractType,
        property,
        reservation,
        buyer: isPurchase ? buyer || undefined : undefined,
        seller: isPurchase ? seller || undefined : undefined,
        landlord: !isPurchase ? landlord || undefined : undefined,
        tenant: !isPurchase ? tenant || undefined : undefined,
        qrCodeSVG,
        watermarkSVG,
        purchasePrice: isPurchase ? (property.depositAmount || 0) * 10 : undefined,
        earnestMoney: isPurchase ? property.depositAmount : undefined,
        propertyImage: propertyImageBase64 || imageUrl || undefined,
        rawProperty: actProp ? {
          propertyType: actProp.propertyType,
          description: actProp.description,
          amenities: actProp.amenities,
          generalHInfo: actProp.generalHInfo,
          generalLandinfo: actProp.generalLandinfo,
          ownerCriteria: {
            minimumDuration: actProp.ownerCriteria?.minimumDuration,
            currency: actProp.ownerCriteria?.currency,
            acceptedPaymentMethods: actProp.ownerCriteria?.acceptedPaymentMethods,
          },
        } : undefined,
      });

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html: contractHTML,
        base64: false,
        width: 612,
        height: 792,
      });

      setContractFileUri(uri);

      // Save contract URI to backend
      const targetId = activityId || reservationId;
      if (targetId) {
        try {
          await activityService.saveContractUrl(targetId, uri);
        } catch (saveError) {
          console.warn('Could not save contract URL to backend:', saveError);
        }
      }

      // Update reservation status locally
      setReservation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'contract_generated',
          contractFileUri: uri,
          contractGenerationDate: new Date().toISOString(),
        };
      });

      setGenerating(false);
      Alert.alert('Succès', 'Votre contrat a été généré avec succès!');
      return uri;
    } catch (error) {
      console.error('Contract generation error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la génération du contrat');
      setGenerating(false);
      return null;
    }
  };

  // Share contract
  const shareContract = async () => {
    try {
      let uri: string | null = contractFileUri;
      if (!uri) {
        const generatedUri = await generateContract();
        if (!generatedUri) return;
        uri = generatedUri;
      }
      if (!uri) return;

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Contrat ${isPurchase ? 'de Vente' : 'de Bail'} - ${contractId}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Partage non disponible', "Le partage n'est pas disponible sur cet appareil.");
      }
    } catch (error) {
      console.error('Contract sharing error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du partage du contrat');
    }
  };

  // View/Print contract
  const viewContract = async () => {
    try {
      let uri = contractFileUri;
      if (!uri) {
        uri = await generateContract();
        if (!uri) return;
      }

      await Print.printAsync({ uri });
    } catch (error) {
      console.error('Contract viewing error:', error);
      Alert.alert('Erreur', "Une erreur est survenue lors de l'ouverture du contrat");
    }
  };

  // Sign contract handler
  const handleSignContract = () => {
    Alert.alert(
      'Signature électronique',
      'La signature électronique sera bientôt disponible. Cette fonctionnalité permettra de signer le contrat de manière légale et sécurisée.',
      [{ text: 'OK' }]
    );
  };

  // Verify payment via real API then auto-generate contract
  const verifyPayment = async () => {
    const targetId = activityId || reservationId;
    if (!targetId) {
      Alert.alert('Erreur', 'Identifiant de réservation manquant');
      return;
    }

    try {
      setPaymentStatus('verifying');

      const amount = property?.depositAmount || activity?.amount || 0;
      await activityService.processPayment(targetId, amount);

      setPaymentStatus('completed');

      // Auto-generate contract after payment confirmed
      setTimeout(() => {
        generateContract();
      }, 500);
    } catch (error: any) {
      console.error('Payment verification error:', error);
      setPaymentStatus('pending');
      Alert.alert(
        'Erreur de paiement',
        error?.message || 'Une erreur est survenue lors de la vérification du paiement'
      );
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c(theme.background) }}>
        <LinearGradient
          colors={[`${theme.primary}20`, theme.surface]}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ThemedView
          >
            <LinearGradient
              colors={['#1B5E20', '#2E7D32']}
              style={{ borderRadius: 50, padding: 20 }}
            >
              <ActivityIndicator size="large" color="white" />
            </LinearGradient>
          </ThemedView>

          <ThemedText  type ="normaltitle"
            style={{
              marginTop: 20,
              color: '#1B5E20',
              fontWeight: '600',
            }}
          >
            Chargement du contrat...
          </ThemedText>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Error state
  if (errorMessage) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c(theme.background) }}>
        <LinearGradient
          colors={[`${theme.error}20`, theme.surface]}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}
        >
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ alignItems: 'center' }}
          >
            <MaterialCommunityIcons name="alert-circle" size={64} color={theme.error} />
            <ThemedText
              style={{ fontSize: 20, fontWeight: '700', marginTop: 16, textAlign: 'center' }}
            >
              Erreur système
            </ThemedText>
            <ThemedText
              style={{
                color: theme.onSurface + '70',
                textAlign: 'center',
                marginTop: 8,
                marginBottom: 24,
              }}
            >
              {errorMessage}
            </ThemedText>
            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              style={{
                backgroundColor: c(theme.primary),
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
              }}
            >
              <ThemedText style={{ color: 'white', fontWeight: '700' }}>
                Retour à l'accueil
              </ThemedText>
            </TouchableOpacity>
          </MotiView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Payment pending state
  if (paymentStatus === 'pending' || paymentStatus === 'verifying') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c(theme.surface) }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <BackButton />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <ThemedText type = "normaltitle" style={{ fontWeight: '700' }}>
                Contrat {isPurchase ? 'de Vente' : 'de Bail'}
              </ThemedText>
            </View>
          </View>

          {/* Payment Status Card */}
          <View
            style={{
              backgroundColor: c(theme.background),
              borderRadius: 16,
              padding: 24,
              marginBottom: 20,
              borderWidth: 2,
              borderColor: '#FF9800',
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: '#FFF3E0',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                {paymentStatus === 'verifying' ? (
                  <ActivityIndicator size="large" color="#FF9800" />
                ) : (
                  <MaterialCommunityIcons name="credit-card-clock" size={40} color="#FF9800" />
                )}
              </View>

              <ThemedText
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: '#E65100',
                  textAlign: 'center',
                }}
              >
                {paymentStatus === 'verifying' ? 'Vérification en cours...' : 'Paiement en attente'}
              </ThemedText>

              <ThemedText type= "normal"
                style={{
                  color: theme.onSurface + '80',
                  textAlign: 'center',
                  marginTop: 8,
                }}
              >
                {paymentStatus === 'verifying'
                  ? 'Nous vérifions votre paiement...'
                  : 'Le contrat sera généré automatiquement après confirmation du paiement de la réservation.'}
              </ThemedText>
            </View>

            {/* Property Summary */}
            {property && (
              <View
                style={{
                  backgroundColor: c(theme.surface),
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <ThemedText style={{ fontWeight: '600', marginBottom: 8 }}>
                  {property.title}
                </ThemedText>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="location-outline" size={14} color={theme.onSurface + '70'} />
                  <ThemedText
                    style={{ fontSize: 12, color: theme.onSurface + '70', marginLeft: 4 }}
                  >
                    {property.address}
                  </ThemedText>
                </View>
              </View>
            )}

            {/* Amount Due */}
            <View
              style={{
                backgroundColor: '#FFF3E0',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <ThemedText style={{ fontSize: 12, color: '#E65100', marginBottom: 4 }}>
                Montant de la réservation
              </ThemedText>
              <ThemedText style={{ fontSize: 24, fontWeight: '800', color: '#E65100' }}>
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XAF',
                  minimumFractionDigits: 0,
                }).format(property?.depositAmount || activity?.amount || 0)}
              </ThemedText>
            </View>

            {/* Verify Payment Button */}
            {paymentStatus === 'pending' && (
              <TouchableOpacity onPress={verifyPayment}>
                <LinearGradient
                  colors={['#FF9800', '#F57C00']}
                  style={{
                    borderRadius: 12,
                    paddingVertical: 14,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <MaterialCommunityIcons name="check-circle" size={20} color="white" />
                  <ThemedText
                    style={{
                      color: 'white',
                      fontSize: 14,
                      fontWeight: '700',
                      marginLeft: 8,
                    }}
                  >
                    J'ai effectué le paiement
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Info Cards */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: c(theme.background),
                borderRadius: 12,
                padding: 16,
              }}
            >
              <MaterialCommunityIcons name="shield-check" size={24} color="#1B5E20" />
              <ThemedText style={{ fontWeight: '600', marginTop: 8, fontSize: 12 }}>
                Sécurisé
              </ThemedText>
              <ThemedText style={{ fontSize: 10, color: theme.onSurface + '60', marginTop: 4 }}>
                Transactions protégées
              </ThemedText>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: c(theme.background),
                borderRadius: 12,
                padding: 16,
              }}
            >
              <MaterialCommunityIcons name="file-document-check" size={24} color="#1B5E20" />
              <ThemedText style={{ fontWeight: '600', marginTop: 8, fontSize: 12 }}>
                Légal
              </ThemedText>
              <ThemedText style={{ fontSize: 10, color: theme.onSurface + '60', marginTop: 4 }}>
                Contrat conforme
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main contract view (payment completed)
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c(theme.surface) }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.outline + '20',
        }}
      >
        <BackButton />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <LinearGradient
            colors={['#1B5E20', '#2E7D32']}
            style={{ borderRadius: 8, paddingHorizontal: 16, paddingVertical: 6 }}
          >
            <ThemedText style={{ color: 'white', fontSize: 14, fontWeight: '700' }}>
              {isPurchase ? 'CONTRAT DE VENTE' : 'CONTRAT DE BAIL'}
            </ThemedText>
          </LinearGradient>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* View Mode Toggle */}
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 16,
          marginTop: 12,
          backgroundColor: c(theme.background),
          borderRadius: 10,
          padding: 4,
        }}
      >
        <TouchableOpacity
          onPress={() => setViewMode('preview')}
          style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: viewMode === 'preview' ? '#1B5E20' : 'transparent',
          }}
        >
          <ThemedText
            style={{
              textAlign: 'center',
              fontWeight: '600',
              fontSize: 12,
              color: viewMode === 'preview' ? 'white' : theme.onSurface,
            }}
          >
            Aperçu
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setViewMode('details')}
          style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: viewMode === 'details' ? '#1B5E20' : 'transparent',
          }}
        >
          <ThemedText
            style={{
              textAlign: 'center',
              fontWeight: '600',
              fontSize: 12,
              color: viewMode === 'details' ? 'white' : theme.onSurface,
            }}
          >
            Détails
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {viewMode === 'preview' ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <ContractPreview
            contractId={contractId}
            contractType={contractType}
            property={property!}
            reservation={reservation!}
            buyer={buyer || undefined}
            seller={seller || undefined}
            landlord={landlord || undefined}
            tenant={tenant || undefined}
            purchasePrice={isPurchase ? (property?.depositAmount || 0) * 10 : undefined}
            earnestMoney={isPurchase ? property?.depositAmount : undefined}
            onSign={handleSignContract}
            onDownload={viewContract}
            onShare={shareContract}
            paymentCompleted={paymentStatus === 'completed'}
          />
        </ScrollView>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {/* AI Analysis */}
          <View
          >
            <LinearGradient
              colors={['#E8F5E9', '#C8E6C9']}
              style={{ borderRadius: 16, padding: 16, marginBottom: 16 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <LinearGradient
                  colors={['#1B5E20', '#2E7D32']}
                  style={{ borderRadius: 10, padding: 8, marginRight: 10 }}
                >
                  <MaterialCommunityIcons name="brain" size={20} color="white" />
                </LinearGradient>
                <View>
                  <ThemedText style={{ fontSize: 14, fontWeight: '700', color: '#1B5E20' }}>
                    Analyse IA
                  </ThemedText>
                  <ThemedText style={{ fontSize: 10, color: '#2E7D32' }}>
                    Évaluation automatique
                  </ThemedText>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 }}>
                <View style={{ alignItems: 'center' }}>
                  <ThemedText style={{ fontSize: 22, fontWeight: '800', color: '#1B5E20' }}>
                    {aiAnalysis.riskScore}%
                  </ThemedText>
                  <ThemedText style={{ fontSize: 9, color: '#2E7D32' }}>Score Risque</ThemedText>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <ThemedText style={{ fontSize: 22, fontWeight: '800', color: '#1B5E20' }}>
                    {aiAnalysis.complianceScore}%
                  </ThemedText>
                  <ThemedText style={{ fontSize: 9, color: '#2E7D32' }}>Conformité</ThemedText>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <ThemedText style={{ fontSize: 12, fontWeight: '700', color: '#1B5E20' }}>
                    {aiAnalysis.marketAnalysis}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 9, color: '#2E7D32' }}>Marché</ThemedText>
                </View>
              </View>

              <View>
                <ThemedText style={{ fontSize: 10, fontWeight: '600', color: '#1B5E20', marginBottom: 6 }}>
                  Recommandations:
                </ThemedText>
                {aiAnalysis.recommendations.map((rec, index) => (
                  <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <MaterialCommunityIcons name="check-circle" size={12} color="#1B5E20" />
                    <ThemedText style={{ fontSize: 10, color: '#2E7D32', marginLeft: 6 }}>
                      {rec}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>

          {/* Contract Summary */}
          <ContractSummary property={property} reservation={reservation} formatDate={formatDate} />

          {/* Party Info */}
          <PartyInfoSection
            landlord={isPurchase ? seller : landlord}
            tenant={isPurchase ? buyer : tenant}
          />

          {/* Contract Status */}
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 400 }}
          >
            <LinearGradient
              colors={
                contractFileUri
                  ? ['#E8F5E9', '#C8E6C9']
                  : ['#FFF3E0', '#FFE0B2']
              }
              style={{ borderRadius: 16, padding: 16, marginBottom: 16 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <LinearGradient
                  colors={
                    contractFileUri
                      ? ['#1B5E20', '#2E7D32']
                      : ['#FF9800', '#F57C00']
                  }
                  style={{ borderRadius: 10, padding: 8, marginRight: 10 }}
                >
                  <MaterialCommunityIcons
                    name={contractFileUri ? 'check-circle' : 'clock'}
                    size={20}
                    color="white"
                  />
                </LinearGradient>
                <View>
                  <ThemedText
                    style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: contractFileUri ? '#1B5E20' : '#E65100',
                    }}
                  >
                    {contractFileUri ? 'Contrat Généré' : 'Prêt à Générer'}
                  </ThemedText>
                  <ThemedText
                    style={{
                      fontSize: 10,
                      color: contractFileUri ? '#2E7D32' : '#FF9800',
                    }}
                  >
                    {contractFileUri ? 'Prêt à être signé' : 'Cliquez pour générer'}
                  </ThemedText>
                </View>
              </View>

              {/* Progress Bar */}
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 6,
                  height: 6,
                  marginBottom: 8,
                }}
              >
                <MotiView
                  from={{ width: 0 }}
                  animate={{ width: contractFileUri ? '100%' : '30%' }}
                  transition={{ type: 'timing', duration: 1000 }}
                  style={{
                    height: '100%',
                    borderRadius: 6,
                    backgroundColor: contractFileUri ? '#1B5E20' : '#FF9800',
                  }}
                />
              </View>
            </LinearGradient>
          </MotiView>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            <TouchableOpacity
              onPress={generateContract}
              disabled={generating}
              style={{ flex: 1 }}
            >
              <LinearGradient
                colors={['#1B5E20', '#2E7D32']}
                style={{
                  borderRadius: 12,
                  padding: 14,
                  alignItems: 'center',
                  opacity: generating ? 0.7 : 1,
                }}
              >
                {generating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <MaterialCommunityIcons name="file-document" size={22} color="white" />
                )}
                <ThemedText
                  style={{ color: 'white', fontWeight: '700', marginTop: 6, fontSize: 11 }}
                >
                  {generating ? 'Génération...' : 'Générer'}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={viewContract}
              style={{ flex: 1 }}
              disabled={!contractFileUri}
            >
              <LinearGradient
                colors={
                  contractFileUri
                    ? ['#4CAF50', '#43A047']
                    : [theme.outline + '40', theme.outline + '20']
                }
                style={{ borderRadius: 12, padding: 14, alignItems: 'center' }}
              >
                <MaterialCommunityIcons
                  name="eye"
                  size={22}
                  color={contractFileUri ? 'white' : theme.outline}
                />
                <ThemedText
                  style={{
                    color: contractFileUri ? 'white' : theme.outline,
                    fontWeight: '700',
                    marginTop: 6,
                    fontSize: 11,
                  }}
                >
                  Visualiser
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={shareContract}
              style={{ flex: 1 }}
              disabled={!contractFileUri}
            >
              <LinearGradient
                colors={
                  contractFileUri
                    ? ['#FF9800', '#F57C00']
                    : [theme.outline + '40', theme.outline + '20']
                }
                style={{ borderRadius: 12, padding: 14, alignItems: 'center' }}
              >
                <MaterialCommunityIcons
                  name="share-variant"
                  size={22}
                  color={contractFileUri ? 'white' : theme.outline}
                />
                <ThemedText
                  style={{
                    color: contractFileUri ? 'white' : theme.outline,
                    fontWeight: '700',
                    marginTop: 6,
                    fontSize: 11,
                  }}
                >
                  Partager
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <LegalNoticeSection />
          <FooterSection />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ContractScreen;
