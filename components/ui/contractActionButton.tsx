import React from 'react';
import { View, Text } from 'react-native';
import { CustomButton } from '@/components/ui';
import { ContractActionProps} from '@/types/type';


export const ContractActionButtons: React.FC<ContractActionProps> = ({
  generateContract,
  viewContract,
  shareContract,
  regenerateContract,
  contractFileUri,
  generating
}) => {
  return (
    <>
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
    </>
  );
};