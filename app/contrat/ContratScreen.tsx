import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText } from 'moti';
import { BlurView } from 'expo-blur';

import ContractSummary from '@/components/contract/contratSummary';
import PartyInfoSection from '@/components/contract/partyInfo';
import ContractStatusSection from '@/components/contract/contractStatusSection';
import { ContractActionButtons } from '@/components/ui/contractActionButton';
import LegalNoticeSection from '@/components/contract/legalNoticeSection';
import FooterSection from '@/components/contract/footerSection';
import { CustomButton } from '@/components/ui';
import generateContractHTML from '@/components/utils/generateContractHTML';
import generateAdvancedQRCode from '@/components/contract/utilsgeneratecodeQr';
import generateWatermark from '@/components/utils/generateWatermark';
import { Property, Reservation, User } from '@/types/type';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { BackButton } from '@/components/ui/BackButton';
import { useTheme } from '@/components/contexts/theme/themehook';

const { width, height } = Dimensions.get('window');

const ContractScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { reservationId } = route.params as { reservationId: string };
  
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [landlord, setLandlord] = useState<User | null>(null);
  const [tenant, setTenant] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [contractFileUri, setContractFileUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [contractId, setContractId] = useState(
    `SCF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
  );
  const [aiAnalysis, setAiAnalysis] = useState({
    riskScore: 92,
    complianceScore: 98,
    marketAnalysis: 'Favorable',
    recommendations: ['Excellent tenant profile', 'Property value trending up', 'Low risk investment']
  });

  const formatDate = (date: any): Date => {
    if (date?.toDate && typeof date.toDate === 'function') {
      return date.toDate();
    }
    return new Date(date);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setErrorMessage(null);
        setLoading(true);
        
        setTimeout(() => {
          const mockReservation: Reservation = {
            propertyId: 'property123',
            landlordId: 'landlord123',
            tenantId: 'tenant123',
            startDate: new Date('2025-05-01'),
            endDate: new Date('2026-05-01'),
            monthlyRent: 800,
            status: 'payment_completed',
          };
          
          const mockProperty: Property = {
            id: "section10",
            title: 'Appartement moderne au centre-ville',
            address: '123 Rue de la Paix, 75001 Paris',
            type: 'Appartement',
            surface: 65,
            rooms: 3,
            depositAmount: 1600,
          };
          
          const mockLandlord: User = {
            fullName: 'Jean Dupont',
            email: 'jean.dupont@example.com',
            phone: '06 12 34 56 78',
          };
          
          const mockTenant: User = {
            fullName: 'Marie Martin',
            email: 'marie.martin@example.com',
            phone: '06 98 76 54 32',
          };
          
          setReservation(mockReservation);
          setProperty(mockProperty);
          setLandlord(mockLandlord);
          setTenant(mockTenant);
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching contract data:', error);
        setErrorMessage('Une erreur est survenue lors du chargement des données');
        setLoading(false);
      }
    };

    fetchData();
  }, [reservationId]);

  const generateContract = async () => {
    try {
      setGenerating(true);
      
      if (!reservation || !property || !landlord || !tenant) {
        throw new Error('Données incomplètes pour générer le contrat');
      }
      
      const qrCodeSVG = generateAdvancedQRCode({
        contractId,
        propertyTitle: property.title,
        tenantName: tenant.fullName,
        startDate: formatDate(reservation.startDate).toISOString(),
        endDate: formatDate(reservation.endDate).toISOString()
      });
      
      const watermarkSVG = generateWatermark(contractId);
      
      const html = generateContractHTML({
        contractId,
        reservation,
        property,
        landlord,
        tenant,
        qrCodeSVG,
        watermarkSVG,
        formatDate
      });
      
      const { uri } = await Print.printToFileAsync({ 
        html,
        base64: false,
        width: 612,
        height: 792
      });
      
      setContractFileUri(uri);
      
      setReservation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'contract_generated',
          contractFileUri: uri,
          contractGenerationDate: new Date().toISOString()
        };
      });
      
      setGenerating(false);
      return uri;
    } catch (error) {
      console.error('Contract generation error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la génération du contrat');
      setGenerating(false);
      return null;
    }
  };

  const shareContract = async () => {
    try {
      let uri = contractFileUri;
      if (!uri) {
        uri = await generateContract();
        if (!uri) return;
      }
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Contrat de location ${contractId}`,
          UTI: 'com.adobe.pdf'
        });
      } else {
        Alert.alert("Partage non disponible", "Le partage n'est pas disponible sur cet appareil.");
      }
    } catch (error) {
      console.error('Contract sharing error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du partage du contrat');
    }
  };

  const viewContract = async () => {
    try {
      let uri = contractFileUri;
      if (!uri) {
        uri = await generateContract();
        if (!uri) return;
      }
      
      await Print.printAsync({ uri: uri });
    } catch (error) {
      console.error('Contract viewing error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'ouverture du contrat');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <LinearGradient
          colors={[theme.primary + '20', theme.background]}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <LinearGradient
              colors={[theme.primary, theme.secondary || theme.primary + '80']}
              style={{ borderRadius: 50, padding: 20 }}
            >
              <ActivityIndicator size="large" color="white" />
            </LinearGradient>
          </MotiView>
          <MotiText
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 500 }}
            style={{ marginTop: 20, fontSize: 16, color: theme.primary, fontWeight: '600' }}
          >
            Génération du contrat intelligent...
          </MotiText>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <LinearGradient
          colors={[theme.error + '20', theme.background]}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}
        >
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ alignItems: 'center' }}
          >
            <MaterialCommunityIcons name="alert-circle" size={64} color={theme.error} />
            <ThemedText style={{ fontSize: 20, fontWeight: '700', marginTop: 16, textAlign: 'center' }}>
              Erreur système
            </ThemedText>
            <ThemedText style={{ color: theme.onSurface + '70', textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
              {errorMessage}
            </ThemedText>
            <CustomButton 
              title="Retour à l'accueil" 
              onPress={() => navigation.navigate('Home')}
            />
          </MotiView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      {/* <LinearGradient
        colors={[theme.primary + '10', theme.background]}
        style={{ flex: 1 }}
      > */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {/* Futuristic Header */}
          <MotiView
            from={{ opacity: 0, translateY: -30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            {/* <LinearGradient
              colors={[theme.primary + '20', 'transparent']}
              style={{ borderRadius: 20, padding: 20, marginBottom: 24 }}
            >
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}> */}
                <BackButton />
                <ThemedView style={{ flex: 1, alignItems: 'center' }}>
                  <LinearGradient
                    colors={[theme.primary, theme.secondary || theme.primary + '80']}
                    style={{ borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 }}
                  >
                    <ThemedText style={{ color: 'white', fontSize: 18, fontWeight: '800' }}>
                      CONTRAT INTELLIGENT
                    </ThemedText>
                  </LinearGradient>
                </ThemedView>
              </ThemedView>
              
              <ThemedView style={{ alignItems: 'center' }}>
                <ThemedText style={{ fontSize: 12, color: theme.primary, fontWeight: '600', marginBottom: 4 }}>
                  BLOCKCHAIN SECURED • AI POWERED
                </ThemedText>
                <ThemedText style={{ fontSize: 14, color: theme.onSurface + '80', textAlign: 'center' }}>
                  Contrat de nouvelle génération avec vérification automatique
                </ThemedText>
              </ThemedView>
            {/* </LinearGradient> */}
          </MotiView>

          {/* AI Analysis Dashboard */}
          <MotiView
            from={{ opacity: 0, translateX: -30 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'spring', damping: 15, delay: 200 }}
          >
            <LinearGradient
              colors={[theme.success + '20', theme.success + '10']}
              style={{ borderRadius: 20, padding: 20, marginBottom: 24 }}
            >
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <LinearGradient
                  colors={[theme.success, theme.success + '80']}
                  style={{ borderRadius: 12, padding: 8, marginRight: 12 }}
                >
                  <MaterialCommunityIcons name="brain" size={24} color="white" />
                </LinearGradient>
                <ThemedView>
                  <ThemedText style={{ fontSize: 16, fontWeight: '700', color: theme.success }}>
                    Analyse IA Avancée
                  </ThemedText>
                  <ThemedText style={{ fontSize: 12, color: theme.success + '80' }}>
                    Évaluation en temps réel
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              
              <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
                <ThemedView style={{ alignItems: 'center' }}>
                  <ThemedText style={{ fontSize: 24, fontWeight: '800', color: theme.success }}>
                    {aiAnalysis.riskScore}%
                  </ThemedText>
                  <ThemedText style={{ fontSize: 10, color: theme.success + '80' }}>Score Risque</ThemedText>
                </ThemedView>
                <ThemedView style={{ alignItems: 'center' }}>
                  <ThemedText style={{ fontSize: 24, fontWeight: '800', color: theme.success }}>
                    {aiAnalysis.complianceScore}%
                  </ThemedText>
                  <ThemedText style={{ fontSize: 10, color: theme.success + '80' }}>Conformité</ThemedText>
                </ThemedView>
                <ThemedView style={{ alignItems: 'center' }}>
                  <ThemedText style={{ fontSize: 14, fontWeight: '700', color: theme.success }}>
                    {aiAnalysis.marketAnalysis}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 10, color: theme.success + '80' }}>Marché</ThemedText>
                </ThemedView>
              </ThemedView>
              
              <ThemedView>
                <ThemedText style={{ fontSize: 12, fontWeight: '600', color: theme.success, marginBottom: 8 }}>
                  Recommandations IA:
                </ThemedText>
                {aiAnalysis.recommendations.map((rec, index) => (
                  <ThemedView key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <MaterialCommunityIcons name="check-circle" size={12} color={theme.success} />
                    <ThemedText style={{ fontSize: 11, color: theme.success + '90', marginLeft: 8 }}>
                      {rec}
                    </ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
            </LinearGradient>
          </MotiView>

          {/* Contract ID & Security */}
          <MotiView
            from={{ opacity: 0, translateX: 30 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'spring', damping: 15, delay: 300 }}
          >
            <LinearGradient
              colors={[theme.primary + '20', theme.primary + '10']}
              style={{ borderRadius: 20, padding: 20, marginBottom: 24 }}
            >
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <LinearGradient
                  colors={[theme.primary, theme.secondary || theme.primary + '80']}
                  style={{ borderRadius: 10, padding: 8, marginRight: 12 }}
                >
                  <MaterialCommunityIcons name="shield-check" size={20} color="white" />
                </LinearGradient>
                <ThemedView>
                  <ThemedText style={{ fontSize: 14, fontWeight: '700', color: theme.primary }}>
                    Sécurité Blockchain
                  </ThemedText>
                  <ThemedText style={{ fontSize: 10, color: theme.primary + '80' }}>
                    Contrat immuable et vérifiable
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              
              <ThemedView style={{ 
                backgroundColor: theme.surface, 
                borderRadius: 12, 
                padding: 12, 
                borderWidth: 1, 
                borderColor: theme.primary + '30' 
              }}>
                <ThemedText style={{ fontSize: 10, color: theme.primary, fontWeight: '600', marginBottom: 4 }}>
                  CONTRACT ID
                </ThemedText>
                <ThemedText style={{ fontSize: 16, fontWeight: '800', color: theme.onSurface, fontFamily: 'monospace' }}>
                  {contractId}
                </ThemedText>
              </ThemedView>
              
              <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 }}>
                <ThemedView style={{ alignItems: 'center' }}>
                  <MaterialCommunityIcons name="qrcode" size={16} color={theme.primary} />
                  <ThemedText style={{ fontSize: 9, color: theme.primary, marginTop: 2 }}>QR Sécurisé</ThemedText>
                </ThemedView>
                <ThemedView style={{ alignItems: 'center' }}>
                  <MaterialCommunityIcons name="fingerprint" size={16} color={theme.primary} />
                  <ThemedText style={{ fontSize: 9, color: theme.primary, marginTop: 2 }}>Biométrie</ThemedText>
                </ThemedView>
                <ThemedView style={{ alignItems: 'center' }}>
                  <MaterialCommunityIcons name="lock" size={16} color={theme.primary} />
                  <ThemedText style={{ fontSize: 9, color: theme.primary, marginTop: 2 }}>Crypté</ThemedText>
                </ThemedView>
              </ThemedView>
            </LinearGradient>
          </MotiView>

          {/* Contract Status with Progress */}
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 400 }}
          >
            <LinearGradient
              colors={contractFileUri ? [theme.success + '20', theme.success + '10'] : [theme.warning + '20', theme.warning + '10']}
              style={{ borderRadius: 20, padding: 20, marginBottom: 24 }}
            >
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <LinearGradient
                  colors={contractFileUri ? [theme.success, theme.success + '80'] : [theme.warning, theme.warning + '80']}
                  style={{ borderRadius: 12, padding: 8, marginRight: 12 }}
                >
                  <MaterialCommunityIcons 
                    name={contractFileUri ? "check-circle" : "clock"} 
                    size={24} 
                    color="white" 
                  />
                </LinearGradient>
                <ThemedView>
                  <ThemedText style={{ 
                    fontSize: 16, 
                    fontWeight: '700', 
                    color: contractFileUri ? theme.success : theme.warning 
                  }}>
                    {contractFileUri ? 'Contrat Généré' : 'En Attente'}
                  </ThemedText>
                  <ThemedText style={{ 
                    fontSize: 12, 
                    color: (contractFileUri ? theme.success : theme.warning) + '80' 
                  }}>
                    {contractFileUri ? 'Prêt à être signé' : 'Génération en cours'}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              
              {/* Progress Bar */}
              <ThemedView style={{ 
                backgroundColor: theme.surface, 
                borderRadius: 10, 
                height: 8, 
                marginBottom: 12 
              }}>
                <MotiView
                  from={{ width: 0 }}
                  animate={{ width: contractFileUri ? '100%' : '60%' }}
                  transition={{ type: 'timing', duration: 1000 }}
                  style={{ 
                    height: '100%', 
                    borderRadius: 10,
                    backgroundColor: contractFileUri ? theme.success : theme.warning
                  }}
                />
              </ThemedView>
              
              <ThemedText style={{ 
                fontSize: 11, 
                color: (contractFileUri ? theme.success : theme.warning) + '90',
                textAlign: 'center'
              }}>
                {contractFileUri ? 'Contrat sécurisé et prêt' : 'Finalisation des détails...'}
              </ThemedText>
            </LinearGradient>
          </MotiView>

          {/* Enhanced Action Buttons */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 15, delay: 500 }}
          >
            <ThemedView style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              <TouchableOpacity
                onPress={generateContract}
                disabled={generating}
                style={{ flex: 1 }}
              >
                <LinearGradient
                  colors={[theme.primary, theme.secondary || theme.primary + '80']}
                  style={{ 
                    borderRadius: 16, 
                    padding: 16, 
                    alignItems: 'center',
                    opacity: generating ? 0.7 : 1
                  }}
                >
                  {generating ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <MaterialCommunityIcons name="file-document-plus" size={24} color="white" />
                  )}
                  <ThemedText style={{ color: 'white', fontWeight: '700', marginTop: 8, fontSize: 12 }}>
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
                  colors={contractFileUri ? [theme.success, theme.success + '80'] : [theme.outline + '40', theme.outline + '20']}
                  style={{ borderRadius: 16, padding: 16, alignItems: 'center' }}
                >
                  <MaterialCommunityIcons 
                    name="eye" 
                    size={24} 
                    color={contractFileUri ? "white" : theme.outline} 
                  />
                  <ThemedText style={{ 
                    color: contractFileUri ? 'white' : theme.outline, 
                    fontWeight: '700', 
                    marginTop: 8, 
                    fontSize: 12 
                  }}>
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
                  colors={contractFileUri ? [theme.warning, theme.warning + '80'] : [theme.outline + '40', theme.outline + '20']}
                  style={{ borderRadius: 16, padding: 16, alignItems: 'center' }}
                >
                  <MaterialCommunityIcons 
                    name="share-variant" 
                    size={24} 
                    color={contractFileUri ? "white" : theme.outline} 
                  />
                  <ThemedText style={{ 
                    color: contractFileUri ? 'white' : theme.outline, 
                    fontWeight: '700', 
                    marginTop: 8, 
                    fontSize: 12 
                  }}>
                    Partager
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </ThemedView>
          </MotiView>

          {/* Legacy Components */}
          <ContractSummary 
            property={property} 
            reservation={reservation} 
            formatDate={formatDate} 
          />

          <PartyInfoSection landlord={landlord} tenant={tenant} />
          
          <LegalNoticeSection />
          
          <FooterSection />
        </ScrollView>
      {/* </LinearGradient> */}
    </SafeAreaView>
  );
};

export default ContractScreen;