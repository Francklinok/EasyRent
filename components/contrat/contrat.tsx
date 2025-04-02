import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomButton } from '@/components/ui';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';
import ContractSummary from './components/ContractSummary';
import ContractActions from './components/ContractActions';
import ContractHeader from './components/ContractHeader';
import ContractParties from './components/ContractParties';
import ContractFooter from './components/ContractFooter';
import ContractStatusBadge from './components/ContractStatusBadge';
import ContractSecurityInfo from './components/ContractSecurityInfo';
import generateContractHTML from './utils/contractGenerator';

interface Property {
  title: string;
  address: string;
  type: string;
  surface: number;
  rooms: number;
  depositAmount: number;
}

interface User {
  fullName: string;
  email: string;
  phone: string;
}

interface Reservation {
  propertyId: string;
  landlordId: string;
  tenantId: string;
  startDate: any; // Timestamp ou Date
  endDate: any; // Timestamp ou Date
  monthlyRent: number;
  status: string;
  contractFileUri?: string;
  contractGenerationDate?: string;
}

export default function ContractScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { reservationId } = route.params;
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [landlord, setLandlord] = useState<User | null>(null);
  const [tenant, setTenant] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [contractFileUri, setContractFileUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [contractId, setContractId] = useState(`SCF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);

  // Fonction pour formater les dates de manière cohérente
  const formatDate = (date: any): Date => {
    if (date?.toDate && typeof date.toDate === 'function') {
      return date.toDate();
    }
    return new Date(date);
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="home-outline" size={24} color="#4F46E5" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    fetchContractData();
  }, [reservationId]);

  const fetchContractData = async () => {
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

  const generateContract = async () => {
    try {
      setGenerating(true);
      
      // Générer le HTML du contrat
      const html = generateContractHTML({
        contractId,
        reservation,
        property,
        landlord,
        tenant,
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
    return <LoadingScreen />;
  }

  if (errorMessage) {
    return <ErrorScreen message={errorMessage} onReturnHome={() => navigation.navigate('Home')} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-4">Contrat de location</Text>
        
        <ContractHeader />
        
        <ContractSecurityInfo contractId={contractId} />
        
        <ContractSummary 
          property={property} 
          reservation={reservation}
          formatDate={formatDate}
        />

        <ContractParties landlord={landlord} tenant={tenant} />
        
        <ContractStatusBadge 
          contractFileUri={contractFileUri} 
          contractGenerationDate={reservation?.contractGenerationDate} 
        />
        
        <ContractActions 
          contractFileUri={contractFileUri}
          generating={generating}
          onViewContract={viewContract}
          onGenerateContract={generateContract}
          onShareContract={shareContract}
          onRegenerateContract={regenerateContract}
        />
        
        <ContractFooter />
      </ScrollView>
    </SafeAreaView>
  );
}