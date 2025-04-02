import { Alert} from 'react-native';
import * as Print from 'expo-print';
import { GenerateContractParams } from "@/types/generateContratcType";
  
  const generateContract = async ({
    reservation,
    property,
    landlord,
    tenant,
    contractId,
    formatDate,
    setReservation,
    setContractFileUri,
    setGenerating
  }: GenerateContractParams) => {
    
    try {
      setGenerating(true);
  
      // Générer le HTML du contrat
      const html = generateContractHTML({
        reservation,
        property,
        landlord,
        tenant,
        contractId,
        formatDate
      });
  
      // Créer un PDF à partir du HTML avec expo-print
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
        width: 612,
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
  
  export default generateContract;
  
  
  
  