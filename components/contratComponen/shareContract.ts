import generateContract from "./generateContract";
import { Alert } from 'react-native';

import * as Print from 'expo-print';

import { GenerateContractParams } from "@/types/generateContratcType";

import * as Sharing from 'expo-sharing';




  const shareContract = async ({
    property,
    landlord,
    tenant,
    contractId,
    formatDate,
    setReservation,
    setContractFileUri,
    contractFileUri,
    setGenerating}:GenerateContractParams) => {
    try {
      // Si le contrat n'a pas encore été généré, le générer
      let uri = contractFileUri;
      if (!uri) {

        uri = await generateContract({ 
          property,
          landlord,
          tenant,
          contractId,
          formatDate,
          setReservation,
          setContractFileUri,
          setGenerating});
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

  export default shareContract;