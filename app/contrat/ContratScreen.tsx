import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';

import ContractSummary from '@/components/contact/contratSummary';
import PartyInfoSection from '@/components/contact/partyInfo';
import  ContractStatusSection from '@/components/contact/contractStatusSection';
import { ContractActionButtons } from '@/components/ui/contractActionButton';
import LegalNoticeSection from '@/components/contact/legalNoticeSection';
import FooterSection from '@/components/contact/footerSection';
import { CustomButton } from '@/components/ui';
import generateContractHTML from '@/components/utils/generateContractHTML';
import generateAdvancedQRCode from '@/components/contact/utilsgeneratecodeQr';
import generateWatermark from '@/components/utils/generateWatermark';
import { Property,Reservation, User } from '@/types/type';

const ContractScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
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

  // Fonction pour formater les dates de manière cohérente
  const formatDate = (date: any): Date => {
    if (date?.toDate && typeof date.toDate === 'function') {
      return date.toDate();
    }
    return new Date(date);
  };

  // Ajouter un hook useEffect pour configurer la navigation
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ marginRight: 15 }}>
          <Ionicons 
            name="home-outline" 
            size={24} 
            color="#4F46E5" 
            onPress={() => navigation.navigate('Home')}
          />
        </View>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setErrorMessage(null);
        setLoading(true);
        
        // TODO: Implémentation du backend pour récupérer les données
        // Exemple fictif pour le développement frontend
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
            id:"section10",
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
      
      // Créer les éléments graphiques pour le contrat
      const qrCodeSVG = generateAdvancedQRCode({
        contractId,
        propertyTitle: property.title,
        tenantName: tenant.fullName,
        startDate: formatDate(reservation.startDate).toISOString(),
        endDate: formatDate(reservation.endDate).toISOString()
      });
      
      const watermarkSVG = generateWatermark(contractId);
      
      // Générer le HTML du contrat
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
      
      // Créer un PDF à partir du HTML avec expo-print
      const { uri } = await Print.printToFileAsync({ 
        html,
        base64: false,
        width: 612, // 8.5 x 11 pouces en points (72 points par pouce)
        height: 792
      });
      
      // Définir l'URI du fichier contrat
      setContractFileUri(uri);
      
      // Mettre à jour l'état local
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
      // Si le contrat n'a pas encore été généré, le générer
      let uri = contractFileUri;
      if (!uri) {
        uri = await generateContract();
        if (!uri) return;
      }
      
      // Vérifier si le partage est disponible
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Contrat de location ${contractId}`,
          UTI: 'com.adobe.pdf'
        });
      } else {
        Alert.alert(
          "Partage non disponible",
          "Le partage n'est pas disponible sur cet appareil."
        );
      }
    } catch (error) {
      console.error('Contract sharing error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du partage du contrat');
    }
  };

  const viewContract = async () => {
    try {
      // Si le contrat n'a pas encore été généré, le générer
      let uri = contractFileUri;
      if (!uri) {
        uri = await generateContract();
        if (!uri) return;
      }
      
      // Afficher le fichier PDF
      await Print.printAsync({
        uri: uri,
      });
    } catch (error) {
      console.error('Contract viewing error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'ouverture du contrat');
    }
  };

  const regenerateContract = async () => {
    // Demander confirmation avant de régénérer
    Alert.alert(
      "Régénérer le contrat",
      "Voulez-vous vraiment régénérer le contrat ? Le contrat actuel sera remplacé.",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Régénérer",
          onPress: async () => {
            // Générer un nouvel ID de contrat
            setContractId(`SCF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
            setContractFileUri(null);
            await generateContract();
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center p-4">
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className="text-xl font-semibold mt-4 mb-2 text-center">Une erreur est survenue</Text>
        <Text className="text-gray-600 text-center mb-6">{errorMessage}</Text>
        <CustomButton 
          title="Retour à l'accueil" 
          onPress={() => navigation.navigate('Home')}
          className="bg-indigo-600"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-4">Contrat de location</Text>
        
        <View className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
          <Text className="text-green-800 font-medium mb-2">
            Félicitations ! Votre location a été finalisée.
          </Text>
          <Text className="text-green-700">
            Le contrat de location 
            {contractFileUri ? ' a été généré' : ' sera généré'} 
            automatiquement avec un design futuriste de haute valeur. Vous pouvez le consulter, le télécharger ou le partager.
          </Text>
        </View>

        <View className="bg-indigo-50 p-4 rounded-lg mb-6 border border-indigo-200">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={24} color="#4F46E5" />
            <Text className="text-indigo-800 font-medium ml-2">Contrat avec Identifiant Unique</Text>
          </View>
          <Text className="text-indigo-700">
            ID: {contractId}
          </Text>
          <Text className="text-indigo-700 mt-1">
            Ce contrat est sécurisé et comprend un code QR avancé pour la vérification d'authenticité.
          </Text>
        </View>
        
        <ContractSummary 
          property={property} 
          reservation={reservation} 
          formatDate={formatDate} 
        />

        <PartyInfoSection landlord={landlord} tenant={tenant} />
        
        <ContractStatusSection 
          contractFileUri={contractFileUri} 
          reservation={reservation} 
        />
        
        <ContractActionButtons 
          generateContract={generateContract}
          viewContract={viewContract}
          shareContract={shareContract}
          regenerateContract={regenerateContract}
          contractFileUri={contractFileUri}
          generating={generating}
        />
        
        <LegalNoticeSection />
        
        <FooterSection />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ContractScreen;