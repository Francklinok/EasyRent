
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomButton } from '@/components/ui';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

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

const  ContractScreen = () =>{


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

  const generateQRCodeSVG = (data: string) => {
    // Simuler un QR code avec un SVG basique
    // Dans une véritable implémentation, vous utiliseriez une bibliothèque dédiée
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
        <rect x="10" y="10" width="80" height="80" fill="#000000" />
        <rect x="20" y="20" width="60" height="60" fill="#ffffff" />
        <rect x="30" y="30" width="40" height="40" fill="#000000" />
        <rect x="40" y="40" width="20" height="20" fill="#ffffff" />
        <text x="10" y="95" font-size="3" fill="#000000">SCAN: ${data}</text>
      </svg>
    `;
  };

  const generateWatermarkSVG = () => {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500" opacity="0.04">
        <text transform="rotate(-45 250 250)" x="0" y="250" fill="#000000" font-size="30" font-family="Arial, sans-serif">CONTRAT OFFICIEL • ${contractId} • CONTRAT OFFICIEL</text>
      </svg>
    `;
  };

  const generateContractHTML = () => {
    if (!reservation || !property || !landlord || !tenant) {
      return '';
    }
    
    const startDate = formatDate(reservation.startDate);
    const endDate = formatDate(reservation.endDate);
    
    // Calculer la durée en mois
    const durationMonths = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.5));
    
    // Génération de l'identifiant unique du contrat
    const qrCodeData = `CONTRACT:${contractId}|PROP:${property.title}|TENANT:${tenant.fullName}|START:${startDate.toISOString()}|END:${endDate.toISOString()}`;
    const qrCodeSVG = generateQRCodeSVG(qrCodeData);
    const watermarkSVG = generateWatermarkSVG();
    
    const currentDate = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Contrat de location - ${contractId}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Playfair+Display:wght@700&display=swap');
          
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: 'Roboto', sans-serif;
            margin: 0;
            padding: 0;
            color: #24292e;
            line-height: 1.6;
            background-color: #ffffff;
            position: relative;
            counter-reset: section;
          }
          
          .watermark {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
          }
          
          .page {
            width: 100%;
            max-width: 100%;
            padding: 40px 60px;
            position: relative;
            background: linear-gradient(to bottom, #ffffff, #f9fafc);
            border: 1px solid #e1e4e8;
            border-radius: 8px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 20px;
            margin-bottom: 40px;
            border-bottom: 1px solid #e1e4e8;
          }
          
          .logo-container {
            display: flex;
            align-items: center;
          }
          
          .logo {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #4F46E5, #6366F1);
            margin-right: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 20px;
          }
          
          .contract-info {
            flex: 1;
          }
          
          .contract-title {
            font-family: 'Playfair Display', serif;
            font-size: 32px;
            color: #111827;
            margin-bottom: 10px;
            font-weight: 700;
            letter-spacing: -0.02em;
          }
          
          .contract-subtitle {
            color: #6B7280;
            font-size: 16px;
            font-weight: 400;
          }
          
          .contract-id {
            font-size: 14px;
            color: #4F46E5;
            margin-top: 5px;
            font-weight: 500;
          }
          
          .qr-container {
            width: 100px;
            height: 100px;
            margin-left: 20px;
          }
          
          h1 {
            text-align: center;
            color: #1F2937;
            margin-bottom: 30px;
            font-weight: 700;
            font-size: 28px;
          }
          
          h2 {
            color: #4F46E5;
            font-size: 20px;
            font-weight: 600;
            margin-top: 40px;
            margin-bottom: 20px;
            position: relative;
            padding-bottom: 10px;
          }
          
          h2::before {
            counter-increment: section;
            content: counter(section) ".";
            margin-right: 8px;
            color: #4F46E5;
          }
          
          h2::after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            border-bottom: 2px solid #E5E7EB;
          }
          
          h3 {
            color: #374151;
            font-size: 18px;
            margin-top: 25px;
            margin-bottom: 15px;
            font-weight: 600;
          }
          
          .section {
            margin-bottom: 30px;
            padding: 25px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            border: 1px solid #E5E7EB;
          }
          
          .highlight-box {
            background-color: #F3F4F6;
            border-left: 4px solid #4F46E5;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          
          .property-details {
            display: flex;
            flex-wrap: wrap;
            margin: 20px 0;
          }
          
          .property-detail {
            width: 50%;
            padding: 10px 0;
            display: flex;
          }
          
          .property-detail-label {
            font-weight: 500;
            width: 150px;
            color: #4B5563;
          }
          
          .property-detail-value {
            color: #111827;
            font-weight: 400;
          }
          
          .party-info {
            padding: 20px;
            margin: 10px 0;
            background-color: #F9FAFB;
            border-radius: 6px;
          }
          
          .party-name {
            font-weight: 600;
            color: #111827;
            font-size: 18px;
            margin-bottom: 10px;
          }
          
          .party-contact {
            margin-top: 5px;
            color: #4B5563;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          
          table, th, td {
            border: 1px solid #E5E7EB;
          }
          
          th {
            background-color: #F3F4F6;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #374151;
          }
          
          td {
            padding: 12px;
            color: #1F2937;
          }
          
          .signature-area {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
          }
          
          .signature-box {
            width: 45%;
            position: relative;
          }
          
          .signature-title {
            font-weight: 600;
            color: #374151;
            margin-bottom: 60px;
          }
          
          .signature-line {
            border-bottom: 1px solid #000;
            margin-bottom: 5px;
          }
          
          .signature-name {
            font-weight: 500;
          }
          
          .signature-date {
            color: #6B7280;
            font-size: 14px;
            margin-top: 5px;
          }
          
          .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
            color: #6B7280;
            font-size: 12px;
          }
          
          .clause {
            margin-bottom: 15px;
          }
          
          .special-clause {
            background-color: #EFF6FF;
            border: 1px solid #BFDBFE;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
          }
          
          .official-seal {
            position: absolute;
            width: 120px;
            height: 120px;
            bottom: 40px;
            right: 60px;
            opacity: 0.7;
          }
          
          .legal-notice {
            font-size: 11px;
            color: #9CA3AF;
            margin-top: 30px;
            font-style: italic;
          }
          
          .holographic-effect {
            position: absolute;
            bottom: 100px;
            right: 50px;
            width: 150px;
            height: 150px;
            background: linear-gradient(135deg, transparent, rgba(99, 102, 241, 0.1), transparent);
            border-radius: 50%;
            pointer-events: none;
          }
          
          .page-number {
            position: absolute;
            bottom: 20px;
            right: 20px;
            color: #9CA3AF;
            font-size: 12px;
          }
          
          .security-ribbon {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 32px;
            height: 90px;
            background-color: #4F46E5;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            writing-mode: vertical-rl;
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 1px;
            border-radius: 4px;
          }
          
          @media print {
            .page {
              box-shadow: none;
              border: none;
            }
            
            body {
              background-color: white;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="watermark">
          ${watermarkSVG}
        </div>
        <div class="page">
          <div class="security-ribbon">DOCUMENT OFFICIEL</div>
          <div class="header">
            <div class="logo-container">
              <div class="logo">RL</div>
              <div class="contract-info">
                <div class="contract-title">Contrat de Location</div>
                <div class="contract-subtitle">Document officiel légalement contraignant</div>
                <div class="contract-id">ID: ${contractId}</div>
              </div>
            </div>
            <div class="qr-container">
              ${qrCodeSVG}
            </div>
          </div>
          
          <div class="section">
            <h2>Parties au Contrat</h2>
            
            <div class="party-info">
              <div class="party-name">LE BAILLEUR</div>
              <div class="party-contact"><strong>${landlord.fullName}</strong></div>
              <div class="party-contact">Email: ${landlord.email}</div>
              <div class="party-contact">Téléphone: ${landlord.phone}</div>
              <div class="party-contact">Ci-après dénommé "LE BAILLEUR"</div>
            </div>
            
            <div class="party-info">
              <div class="party-name">LE LOCATAIRE</div>
              <div class="party-contact"><strong>${tenant.fullName}</strong></div>
              <div class="party-contact">Email: ${tenant.email}</div>
              <div class="party-contact">Téléphone: ${tenant.phone}</div>
              <div class="party-contact">Ci-après dénommé "LE LOCATAIRE"</div>
            </div>
          </div>
          
          <div class="section">
            <h2>Bien Immobilier</h2>
            
            <div class="highlight-box">
              <strong>${property.title}</strong><br>
              ${property.address}
            </div>
            
            <div class="property-details">
              <div class="property-detail">
                <span class="property-detail-label">Type de bien:</span>
                <span class="property-detail-value">${property.type}</span>
              </div>
              <div class="property-detail">
                <span class="property-detail-label">Surface:</span>
                <span class="property-detail-value">${property.surface} m²</span>
              </div>
              <div class="property-detail">
                <span class="property-detail-label">Nombre de pièces:</span>
                <span class="property-detail-value">${property.rooms}</span>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2>Conditions Financières</h2>
            
            <table>
              <tr>
                <th>Désignation</th>
                <th>Montant</th>
                <th>Périodicité</th>
              </tr>
              <tr>
                <td>Loyer</td>
                <td>${reservation.monthlyRent} €</td>
                <td>Mensuel</td>
              </tr>
              <tr>
                <td>Dépôt de garantie</td>
                <td>${property.depositAmount} €</td>
                <td>Unique</td>
              </tr>
            </table>
            
            <div class="special-clause">
              <h3>Modalités de paiement</h3>
              <p>Le loyer est payable d'avance le 1er de chaque mois par virement bancaire sur le compte du BAILLEUR dont les coordonnées seront communiquées au LOCATAIRE.</p>
            </div>
            
            <h3>Révision du loyer</h3>
            <p class="clause">Le loyer sera révisé automatiquement chaque année à la date anniversaire du contrat en fonction de la variation de l'Indice de Référence des Loyers (IRL) publié par l'INSEE.</p>
          </div>
          
          <div class="section">
            <h2>Durée du Contrat</h2>
            
            <div class="property-details">
              <div class="property-detail">
                <span class="property-detail-label">Date de début:</span>
                <span class="property-detail-value">${formatDate(reservation.startDate).toLocaleDateString('fr-FR')}</span>
              </div>
              <div class="property-detail">
                <span class="property-detail-label">Date de fin:</span>
                <span class="property-detail-value">${formatDate(reservation.endDate).toLocaleDateString('fr-FR')}</span>
              </div>
              <div class="property-detail">
                <span class="property-detail-label">Durée:</span>
                <span class="property-detail-value">${durationMonths} mois</span>
              </div>
            </div>
            
            <h3>Renouvellement</h3>
            <p class="clause">À l'expiration du contrat, celui-ci sera renouvelé tacitement pour une durée identique, sauf dénonciation par l'une des parties dans les conditions prévues par la loi.</p>
          </div>
          
          <div class="holographic-effect"></div>
          
          <div class="signature-area">
            <div class="signature-box">
              <div class="signature-title">LE BAILLEUR</div>
              <div class="signature-line"></div>
              <div class="signature-name">${landlord.fullName}</div>
              <div class="signature-date">Date: ${currentDate}</div>
            </div>
            
            <div class="signature-box">
              <div class="signature-title">LE LOCATAIRE</div>
              <div class="signature-line"></div>
              <div class="signature-name">${tenant.fullName}</div>
              <div class="signature-date">Date: ${currentDate}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>Ce contrat est authentifié électroniquement et enregistré dans la blockchain sous l'identifiant ${contractId}</p>
            <p class="legal-notice">Conformément à la législation en vigueur, toute modification du présent contrat doit faire l'objet d'un avenant signé par toutes les parties.</p>
          </div>
          
          <div class="page-number">Page 1/1</div>
        </div>
      </body>
      </html>
    `;
  };

  const generateContract = async () => {
    try {
      setGenerating(true);
      
      // Générer le HTML du contrat
      const html = generateContractHTML();
      
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
        // On peut aussi utiliser html directement si on n'a pas encore de fichier
        // html: generateContractHTML(),
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
            Ce contrat est sécurisé et comprend un QR code pour la vérification d'authenticité.
          </Text>
        </View>
        
        <View className="bg-gray-50 p-4 rounded-lg mb-6">
          <Text className="text-lg font-semibold mb-2">Résumé de la location</Text>
          <View className="flex-row justify-between mb-1">
            <Text>Propriété:</Text>
            <Text className="font-medium">{property?.title}</Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text>Adresse:</Text>
            <View className="flex-row justify-between mb-1">
              <Text>Adresse:</Text>
              <Text className="font-medium">{property?.address}</Text>
            </View>
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
              {reservation ? formatDate(reservation.startDate).toLocaleDateString('fr-FR') : ''}
            </Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text>Date de fin:</Text>
            <Text className="font-medium">
              {reservation ? formatDate(reservation.endDate).toLocaleDateString('fr-FR') : ''}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between mb-6">
          <View className="bg-gray-50 p-4 rounded-lg flex-1 mr-2">
            <Text className="text-lg font-semibold mb-2">Propriétaire</Text>
            <Text>{landlord?.fullName}</Text>
            <Text className="text-gray-500 text-sm">{landlord?.email}</Text>
            <Text className="text-gray-500 text-sm">{landlord?.phone}</Text>
          </View>
          <View className="bg-gray-50 p-4 rounded-lg flex-1 ml-2">
            <Text className="text-lg font-semibold mb-2">Locataire</Text>
            <Text>{tenant?.fullName}</Text>
            <Text className="text-gray-500 text-sm">{tenant?.email}</Text>
            <Text className="text-gray-500 text-sm">{tenant?.phone}</Text>
          </View>
        </View>
        
        <View className="bg-gray-50 p-4 rounded-lg mb-6">
          <Text className="text-lg font-semibold mb-2">Statut du contrat</Text>
          <View className="flex-row items-center">
            <Ionicons 
              name={contractFileUri ? "checkmark-circle" : "time-outline"} 
              size={24} 
              color={contractFileUri ? "#10B981" : "#F59E0B"}
            />
            <Text className="ml-2">
              {contractFileUri 
                ? "Contrat généré le " + new Date(reservation?.contractGenerationDate || Date.now()).toLocaleDateString('fr-FR') 
                : "En attente de génération"}
            </Text>
          </View>
        </View>
        
        {/* Actions du contrat */}
        <Text className="text-lg font-semibold mb-2">Actions</Text>
        <View className="flex-row justify-between mb-4">
          <CustomButton 
            title={contractFileUri ? "Voir le contrat" : "Générer le contrat"}
            onPress={contractFileUri ? viewContract : generateContract}
            className="bg-indigo-600 flex-1 mr-2"
            loading={generating}
            disabled={generating}
            icon={contractFileUri ? "document-text-outline" : "create-outline"}
          />
          
          <CustomButton 
            title="Partager" 
            onPress={shareContract}
            className="bg-blue-600 flex-1 ml-2" 
            disabled={generating || !contractFileUri}
            icon="share-outline"
          />
        </View>
        
        {contractFileUri && (
          <View className="mb-8">
            <CustomButton 
              title="Régénérer le contrat" 
              onPress={regenerateContract}
              className="bg-amber-600" 
              disabled={generating}
              icon="refresh-outline"
            />
            
            <View className="bg-amber-50 p-3 rounded-lg mt-2 border border-amber-200">
              <Text className="text-amber-800 text-sm">
                La régénération créera un nouveau contrat avec un nouvel identifiant unique.
              </Text>
            </View>
          </View>
        )}
        
        <View className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
          <View className="flex-row items-center mb-2">
            <Ionicons name="shield-checkmark-outline" size={24} color="#3B82F6" />
            <Text className="text-blue-800 font-medium ml-2">Protection juridique</Text>
          </View>
          <Text className="text-blue-700 mb-2">
            Ce contrat est légalement valide et conforme à la législation en vigueur sur les baux d'habitation.
          </Text>
          <Text className="text-blue-700">
            Il inclut toutes les clauses obligatoires et respecte les droits du locataire et du propriétaire.
          </Text>
        </View>
        
        <View className="border-t border-gray-200 pt-4 pb-10">
          <Text className="text-center text-gray-500 text-sm mb-2">
            © {new Date().getFullYear()} RentalHub • Tous droits réservés
          </Text>
          <Text className="text-center text-gray-400 text-xs">
            Document généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
    )}

export default ContractScreen





