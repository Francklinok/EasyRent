import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, Share, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomButton } from '@/components/ui';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';

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

export default function ContractScreen({ route, navigation }) {
  const { reservationId } = route.params;
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [landlord, setLandlord] = useState<User | null>(null);
  const [tenant, setTenant] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [contractFileUri, setContractFileUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    const fetchData = async () => {
      try {
        setErrorMessage(null);
        setLoading(true);
        
        // TODO: Implémentation du backend pour récupérer les données
        // 1. Récupérer la réservation
        // 2. Récupérer la propriété
        // 3. Récupérer les informations du propriétaire
        // 4. Récupérer les informations du locataire
        // 5. Vérifier si un contrat existe déjà

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

    fetchData();
  }, [reservationId]);

  const generateContractHTML = () => {
    if (!reservation || !property || !landlord || !tenant) {
      return '';
    }
    
    const startDate = formatDate(reservation.startDate);
    const endDate = formatDate(reservation.endDate);
    
    // Calculer la durée en mois
    const durationMonths = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.5));
    
    // TODO: À compléter - Implémenter la génération du HTML pour le contrat PDF
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Contrat de location</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #333;
            line-height: 1.5;
          }
          h1 {
            text-align: center;
            color: #2563EB;
            margin-bottom: 30px;
          }
          h2 {
            color: #2563EB;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin-top: 25px;
          }
          .section {
            margin-bottom: 25px;
          }
          .signature-area {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            border-top: 1px solid #000;
            width: 45%;
            padding-top: 5px;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .info-table td {
            padding: 8px;
            border-bottom: 1px solid #eee;
          }
          .info-table td:first-child {
            font-weight: bold;
            width: 40%;
          }
          ul li {
            margin-bottom: 8px;
          }
          .contract-ref {
            text-align: right;
            font-size: 0.8em;
            color: #666;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="contract-ref">Référence: CON-${reservationId ? reservationId.substring(0, 8) : 'XXXXXXXX'}</div>
        <h1>CONTRAT DE LOCATION</h1>
        
        <div class="section">
          <h2>1. PARTIES</h2>
          <p><strong>ENTRE :</strong></p>
          <p>${landlord.fullName}, ci-après dénommé "LE BAILLEUR"</p>
          <p>Adresse email : ${landlord.email}</p>
          <p>Téléphone : ${landlord.phone}</p>
          <p><strong>ET :</strong></p>
          <p>${tenant.fullName}, ci-après dénommé "LE LOCATAIRE"</p>
          <p>Adresse email : ${tenant.email}</p>
          <p>Téléphone : ${tenant.phone}</p>
        </div>
        
        <!-- Autres sections du contrat -->
        <!-- ... -->
        
        <div class="signature-area">
          <div class="signature-box">
            <p>LE BAILLEUR</p>
            <p>${landlord.fullName}</p>
            <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          
          <div class="signature-box">
            <p>LE LOCATAIRE</p>
            <p>${tenant.fullName}</p>
            <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateContract = async () => {
    try {
      setGenerating(true);
      
      // TODO: Intégration avec le backend
      // 1. Générer le HTML du contrat
      const html = generateContractHTML();
      
      // 2. Créer un PDF à partir du HTML
      // Dans une implémentation réelle, vous pourriez appeler une API backend
      
      // Simulation de la génération de contrat pour le développement frontend
      setTimeout(() => {
        const mockContractUri = FileSystem.documentDirectory + `contrat_${reservationId || 'new'}_${Date.now()}.pdf`;
        setContractFileUri(mockContractUri);
        
        // Mettre à jour l'état local
        setReservation(prev => {
          if (!prev) return null;
          return {
            ...prev,
            status: 'contract_generated',
            contractFileUri: mockContractUri,
            contractGenerationDate: new Date().toISOString()
          };
        });
        
        setGenerating(false);
      }, 2000);
      
      return 'mock-uri'; // À remplacer par l'URI réel
    } catch (error) {
      console.error('Contract generation error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la génération du contrat');
      setGenerating(false);
      return null;
    }
  };

  const shareContract = async () => {
    try {
      // TODO: Implémentation du partage de contrat
      // Si le contrat n'a pas encore été généré, le générer
      let uri = contractFileUri;
      if (!uri) {
        uri = await generateContract();
        if (!uri) return;
      }
      
      // Simulation du partage pour le développement frontend
      Alert.alert(
        "Partage de contrat",
        "Dans l'application finale, cette fonction partagera le contrat PDF.",
        [
          { text: "OK" }
        ]
      );
    } catch (error) {
      console.error('Contract sharing error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du partage du contrat');
    }
  };

  const viewContract = async () => {
    try {
      // TODO: Implémentation de l'affichage du contrat
      // Si le contrat n'a pas encore été généré, le générer
      
      // Simulation de l'affichage pour le développement frontend
      Alert.alert(
        "Visualisation de contrat",
        "Dans l'application finale, cette fonction affichera le contrat PDF.",
        [
          { text: "OK" }
        ]
      );
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
            automatiquement. Vous pouvez le consulter, le télécharger ou le partager.
          </Text>
        </View>
        
        <View className="bg-gray-50 p-4 rounded-lg mb-6">
          <Text className="text-lg font-semibold mb-2">Résumé de la location</Text>
          <View className="flex-row justify-between mb-1">
            <Text>Propriété:</Text>
            <Text className="font-medium">{property?.title}</Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text>Loyer mensuel:</Text>
            <Text className="font-medium">{reservation?.monthlyRent} €</Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text>Dépôt de garantie:</Text>
            <Text className="font-medium">{property?.depositAmount} €</Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text>Date de début:</Text>
            <Text className="font-medium">
              {reservation?.startDate ? formatDate(reservation.startDate).toLocaleDateString('fr-FR') : ''}
            </Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text>Date de fin:</Text>
            <Text className="font-medium">
              {reservation?.endDate ? formatDate(reservation.endDate).toLocaleDateString('fr-FR') : ''}
            </Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text>Statut:</Text>
            <Text className="font-medium capitalize">
              {reservation?.status === 'contract_generated' ? 'Contrat généré' : 
               reservation?.status === 'payment_completed' ? 'Paiement effectué' : 
               reservation?.status}
            </Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text>Durée:</Text>
            <Text className="font-medium">
              {reservation?.startDate && reservation?.endDate ? 
                `${Math.round((formatDate(reservation.endDate).getTime() - formatDate(reservation.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30.5))} mois` : 
                ''}
            </Text>
          </View>
        </View>
        
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2">Parties du contrat</Text>
          <View className="bg-gray-50 p-4 rounded-lg mb-3">
            <Text className="font-medium mb-1">Propriétaire:</Text>
            <Text>{landlord?.fullName}</Text>
            <Text>{landlord?.email}</Text>
            <Text>{landlord?.phone}</Text>
          </View>
          <View className="bg-gray-50 p-4 rounded-lg">
            <Text className="font-medium mb-1">Locataire:</Text>
            <Text>{tenant?.fullName}</Text>
            <Text>{tenant?.email}</Text>
            <Text>{tenant?.phone}</Text>
          </View>
        </View>
        
        <View className="mt-6 space-y-4">
          {generating ? (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color="#4F46E5" />
              <Text className="mt-2 text-gray-600">Génération du contrat en cours...</Text>
            </View>
          ) : (
            <>
              {contractFileUri ? (
                <>
                  <CustomButton 
                    title="Consulter le contrat" 
                    onPress={viewContract}
                    className="bg-indigo-600"
                  />
                  <CustomButton 
                    title="Partager le contrat" 
                    onPress={shareContract}
                    className="bg-green-600"
                  />
                  <CustomButton 
                    title="Régénérer le contrat" 
                    onPress={regenerateContract}
                    className="bg-amber-600"
                  />
                </>
              ) : (
                <CustomButton 
                  title="Générer le contrat" 
                  onPress={generateContract}
                  className="bg-indigo-600"
                />
              )}
              <CustomButton 
                title="Retour aux réservations" 
                onPress={() => navigation.navigate('Reservations')}
                className="bg-gray-500"
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}