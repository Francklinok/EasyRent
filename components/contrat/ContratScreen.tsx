
    // Fichier: screens/ContractScreen.tsx
    import React, { useState, useEffect, useContext } from 'react';
    import { View, Text, ScrollView, ActivityIndicator, Alert, Share } from 'react-native';
    import { SafeAreaView } from 'react-native-safe-area-context';
    import { doc, getDoc, updateDoc } from 'firebase/firestore';
    import { firestore } from '../services/firebase';
    import { AuthContext } from '../contexts/AuthContext';
    import { CustomButton } from '../ui';
    import * as Print from 'expo-print';
    import * as FileSystem from 'expo-file-system';
    import * as Sharing from 'expo-sharing';
    
    export default function ContractScreen({ route }) {
      const { reservationId } = route.params;
      const { user } = useContext(AuthContext);
      const [reservation, setReservation] = useState<any>(null);
      const [property, setProperty] = useState<any>(null);
      const [landlord, setLandlord] = useState<any>(null);
      const [tenant, setTenant] = useState<any>(null);
      const [loading, setLoading] = useState(true);
      const [generating, setGenerating] = useState(false);
      const [contractFileUri, setContractFileUri] = useState<string | null>(null);
    
      useEffect(() => {
        const fetchData = async () => {
          try {
            // Récupérer la réservation
            const reservationDoc = await getDoc(doc(firestore, 'reservations', reservationId));
            
            if (!reservationDoc.exists()) {
              Alert.alert('Erreur', 'Réservation introuvable');
              return;
            }
            
            const reservationData = reservationDoc.data();
            setReservation(reservationData);
            
            // Récupérer la propriété
            const propertyDoc = await getDoc(doc(firestore, 'properties', reservationData.propertyId));
            if (propertyDoc.exists()) {
              setProperty(propertyDoc.data());
            }
            
            // Récupérer les informations du propriétaire
            const landlordDoc = await getDoc(doc(firestore, 'users', reservationData.landlordId));
            if (landlordDoc.exists()) {
              setLandlord(landlordDoc.data());
            }
            
            // Récupérer les informations du locataire
            const tenantDoc = await getDoc(doc(firestore, 'users', reservationData.tenantId));
            if (tenantDoc.exists()) {
              setTenant(tenantDoc.data());
            }
            
            // Si un contrat a déjà été généré, récupérer l'URI
            if (reservationData.contractFileUri) {
              setContractFileUri(reservationData.contractFileUri);
            } else {
              // Générer automatiquement le contrat si le paiement a été effectué
              if (reservationData.status === 'payment_completed') {
                generateContract();
              }
            }
          } catch (error) {
            console.error('Error fetching contract data:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors du chargement des données');
          } finally {
            setLoading(false);
          }
        };
    
        fetchData();
      }, [reservationId]);
    
      const generateContractHTML = () => {
        if (!reservation || !property || !landlord || !tenant) {
          return '';
        }
        
        const startDate = new Date(reservation.startDate?.toDate?.() || reservation.startDate);
        const endDate = new Date(reservation.endDate?.toDate?.() || reservation.endDate);
        
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
              }
              h1 {
                text-align: center;
                color: #2563EB;
              }
              h2 {
                color: #2563EB;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
              }
              .section {
                margin-bottom: 20px;
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
            </style>
          </head>
          <body>
            <h1>CONTRAT DE LOCATION</h1>
            
            <div class="section">
              <h2>1. PARTIES</h2>
              <p><strong>ENTRE :</strong></p>
              <p>${landlord.fullName}, ci-après dénommé "LE BAILLEUR"</p>
              <p><strong>ET :</strong></p>
              <p>${tenant.fullName}, ci-après dénommé "LE LOCATAIRE"</p>
            </div>
            
            <div class="section">
              <h2>2. OBJET DE LA LOCATION</h2>
              <table class="info-table">
                <tr>
                  <td>Adresse du bien:</td>
                  <td>${property.address}</td>
                </tr>
                <tr>
                  <td>Type de bien:</td>
                  <td>${property.type}</td>
                </tr>
                <tr>
                  <td>Surface:</td>
                  <td>${property.surface} m²</td>
                </tr>
                <tr>
                  <td>Nombre de pièces:</td>
                  <td>${property.rooms}</td>
                </tr>
              </table>
            </div>
            
            <div class="section">
              <h2>3. DURÉE DU CONTRAT</h2>
              <p>Le présent contrat est conclu pour une durée de ${
                Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.5))} mois.</p>
              <p>Date de prise d'effet: ${startDate.toLocaleDateString('fr-FR')}</p>
              <p>Date de fin: ${endDate.toLocaleDateString('fr-FR')}</p>
            </div>
            
            <div class="section">
              <h2>4. LOYER ET CHARGES</h2>
              <p>Le loyer mensuel est fixé à ${reservation.monthlyRent} euros.</p>
              <p>Le dépôt de garantie s'élève à ${property.depositAmount} euros.</p>
              <p>Le loyer est payable d'avance le ${startDate.getDate()} de chaque mois.</p>
            </div>
            
            <div class="section">
              <h2>5. OBLIGATIONS DU BAILLEUR</h2>
              <ul>
                <li>Délivrer un logement décent en bon état d'usage et de réparation</li>
                <li>Assurer au locataire la jouissance paisible du logement</li>
                <li>Entretenir les locaux en état de servir à l'usage prévu</li>
                <li>Effectuer les réparations nécessaires au maintien en état et à l'entretien normal des locaux loués</li>
              </ul>
            </div>
            
            <div class="section">
              <h2>6. OBLIGATIONS DU LOCATAIRE</h2>
              <ul>
                <li>Payer le loyer et les charges aux termes convenus</li>
                <li>User paisiblement des locaux loués</li>
                <li>Répondre des dégradations qui surviennent pendant la durée du contrat</li>
                <li>Prendre à sa charge l'entretien courant du logement et des équipements</li>
                <li>Laisser exécuter les travaux d'urgence</li>
                <li>Souscrire une assurance habitation</li>
              </ul>
            </div>
            
            <div class="section">
              <h2>7. RÉSILIATION</h2>
              <p>Le locataire peut résilier le contrat à tout moment, avec un préavis de trois mois, réduit à un mois dans certains cas prévus par la loi.</p>
              <p>Le bailleur peut résilier le contrat pour motif légitime et sérieux, notamment en cas de non-paiement du loyer ou de non-respect des obligations.</p>
            </div>
    
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
          
          // Générer le HTML du contrat
          const html = generateContractHTML();
          
          // Créer un PDF à partir du HTML
          const { uri } = await Print.printToFileAsync({ html });
          
          // Copier le fichier dans un dossier permanent
          const permanentUri = FileSystem.documentDirectory + `contrat_${reservationId}.pdf`;
          await FileSystem.copyAsync({
            from: uri,
            to: permanentUri
          });
          
          // Mettre à jour l'URI du contrat
          setContractFileUri(permanentUri);
          
          // Mettre à jour le statut de la réservation
          await updateDoc(doc(firestore, 'reservations', reservationId), {
            status: 'contract_generated',
            contractFileUri: permanentUri,
            contractGenerationDate: new Date().toISOString()
          });
          
          return permanentUri;
        } catch (error) {
          console.error('Contract generation error:', error);
          Alert.alert('Erreur', 'Une erreur est survenue lors de la génération du contrat');
          return null;
        } finally {
          setGenerating(false);
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
            await Sharing.shareAsync(uri);
          } else {
            // Utiliser l'API Share comme solution de repli
            await Share.share({
              title: 'Contrat de location',
              url: uri
            });
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
          
          await Sharing.shareAsync(uri);
        } catch (error) {
          console.error('Contract viewing error:', error);
          Alert.alert('Erreur', 'Une erreur est survenue lors de l\'ouverture du contrat');
        }
      };
    
      if (loading) {
        return (
          <SafeAreaView className="flex-1 bg-white justify-center items-center">
            <ActivityIndicator size="large" color="#4F46E5" />
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
                Le contrat de location a été généré automatiquement. Vous pouvez le consulter, le télécharger ou le partager.
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
                <Text>Date de début:<Text>Date de début:</Text>
            <Text className="font-medium">
              {new Date(reservation?.startDate?.toDate?.() || reservation?.startDate).toLocaleDateString('fr-FR')}
            </Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text>Date de fin:</Text>
            <Text className="font-medium">
              {new Date(reservation?.endDate?.toDate?.() || reservation?.endDate).toLocaleDateString('fr-FR')}
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
                </>
              ) : (
                <CustomButton 
                  title="Générer le contrat" 
                  onPress={generateContract}
                  className="bg-indigo-600"
                />
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}