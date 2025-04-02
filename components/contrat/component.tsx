// components/LoadingScreen.tsx
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoadingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center">
      <ActivityIndicator size="large" color="#4F46E5" />
    </SafeAreaView>
  );
}

// components/ErrorScreen.tsx
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton } from '@/components/ui';

interface ErrorScreenProps {
  message: string;
  onReturnHome: () => void;
}

export default function ErrorScreen({ message, onReturnHome }: ErrorScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center p-4">
      <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
      <Text className="text-xl font-semibold mt-4 mb-2 text-center">Une erreur est survenue</Text>
      <Text className="text-gray-600 text-center mb-6">{message}</Text>
      <CustomButton 
        title="Retour à l'accueil" 
        onPress={onReturnHome}
        className="bg-indigo-600"
      />
    </SafeAreaView>
  );
}

// components/ContractHeader.tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function ContractHeader() {
  return (
    <View className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
      <Text className="text-green-800 font-medium mb-2">
        Félicitations ! Votre location a été finalisée.
      </Text>
      <Text className="text-green-700">
        Le contrat de location sera généré automatiquement avec un design futuriste de haute valeur. 
        Vous pouvez le consulter, le télécharger ou le partager.
      </Text>
    </View>
  );
}

// components/ContractSecurityInfo.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ContractSecurityInfoProps {
  contractId: string;
}

export default function ContractSecurityInfo({ contractId }: ContractSecurityInfoProps) {
  return (
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
  );
}

// components/ContractSummary.tsx
import React from 'react';
import { View, Text } from 'react-native';

interface ContractSummaryProps {
  property: any;
  reservation: any;
  formatDate: (date: any) => Date;
}

export default function ContractSummary({ property, reservation, formatDate }: ContractSummaryProps) {
  return (
    <View className="bg-gray-50 p-4 rounded-lg mb-6">
      <Text className="text-lg font-semibold mb-2">Résumé de la location</Text>
      <View className="flex-row justify-between mb-1">
        <Text>Propriété:</Text>
        <Text className="font-medium">{property?.title}</Text>
      </View>
      <View className="flex-row justify-between mb-1">
        <Text>Adresse:</Text>
        <Text className="font-medium">{property?.address}</Text>
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
  );
}

// components/ContractParties.tsx
import React from 'react';
import { View, Text } from 'react-native';

interface ContractPartiesProps {
  landlord: any;
  tenant: any;
}

export default function ContractParties({ landlord, tenant }: ContractPartiesProps) {
  return (
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
  );
}

// components/ContractStatusBadge.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ContractStatusBadgeProps {
  contractFileUri: string | null;
  contractGenerationDate?: string;
}

export default function ContractStatusBadge({ contractFileUri, contractGenerationDate }: ContractStatusBadgeProps) {
  return (
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
            ? "Contrat généré le " + new Date(contractGenerationDate || Date.now()).toLocaleDateString('fr-FR') 
            : "En attente de génération"}
        </Text>
      </View>
    </View>
  );
}

// components/ContractActions.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { CustomButton } from '@/components/ui';

interface ContractActionsProps {
  contractFileUri: string | null;
  generating: boolean;
  onViewContract: () => Promise<void>;
  onGenerateContract: () => Promise<string | null>;
  onShareContract: () => Promise<void>;
  onRegenerateContract: () => Promise<void>;
}

export default function ContractActions({ 
  contractFileUri,
  generating,
  onViewContract,
  onGenerateContract,
  onShareContract,
  onRegenerateContract
}: ContractActionsProps) {
  return (
    <>
      <Text className="text-lg font-semibold mb-2">Actions</Text>
      <View className="flex-row justify-between mb-4">
        <CustomButton 
          title={contractFileUri ? "Voir le contrat" : "Générer le contrat"}
          onPress={contractFileUri ? onViewContract : onGenerateContract}
          className="bg-indigo-600 flex-1 mr-2"
          loading={generating}
          disabled={generating}
          icon={contractFileUri ? "document-text-outline" : "create-outline"}
        />
        
        <CustomButton 
          title="Partager" 
          onPress={onShareContract}
          className="bg-blue-600 flex-1 ml-2" 
          disabled={generating || !contractFileUri}
          icon="share-outline"
        />
      </View>
      
      {contractFileUri && (
        <View className="mb-8">
          <CustomButton 
            title="Régénérer le contrat" 
            onPress={onRegenerateContract}
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
}

// components/ContractFooter.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ContractFooter() {
  return (
    <>
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
    </>
  );
}