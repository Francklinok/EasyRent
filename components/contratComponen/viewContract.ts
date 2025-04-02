import generateContract from "./generateContract";
import { Alert } from 'react-native';

import * as Print from 'expo-print';

import { GenerateContractParams } from "@/types/generateContratcType";


  const viewContract = async ({ 
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
export default viewContract;