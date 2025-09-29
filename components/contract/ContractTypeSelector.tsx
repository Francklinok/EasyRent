import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
import { ContractType } from '@/types/contract';

interface ContractTypeOption {
  type: ContractType;
  label: string;
  description: string;
  icon: string;
  color: string;
}

interface Props {
  selectedType: ContractType;
  onSelect: (type: ContractType) => void;
  availableTypes?: ContractType[];
}

const contractTypeOptions: ContractTypeOption[] = [
  {
    type: ContractType.RENTAL,
    label: 'Location Résidentielle',
    description: 'Contrat de bail standard pour logement',
    icon: 'home',
    color: '#4CAF50'
  },
  {
    type: ContractType.VACATION_RENTAL,
    label: 'Location Saisonnière',
    description: 'Contrat pour location de courte durée',
    icon: 'beach',
    color: '#2196F3'
  },
  {
    type: ContractType.PURCHASE,
    label: 'Achat Immobilier',
    description: 'Contrat de vente de bien immobilier',
    icon: 'key',
    color: '#FF9800'
  },
  {
    type: ContractType.LEASE,
    label: 'Bail Commercial',
    description: 'Contrat pour usage professionnel',
    icon: 'office-building',
    color: '#9C27B0'
  },
  {
    type: ContractType.SUBLEASE,
    label: 'Sous-location',
    description: 'Contrat de sous-location',
    icon: 'account-group',
    color: '#607D8B'
  },
  {
    type: ContractType.RESERVATION,
    label: 'Réservation',
    description: 'Contrat de réservation temporaire',
    icon: 'calendar-check',
    color: '#E91E63'
  }
];

export const ContractTypeSelector: React.FC<Props> = ({
  selectedType,
  onSelect,
  availableTypes
}) => {
  const { theme } = useTheme();

  const options = availableTypes
    ? contractTypeOptions.filter(option => availableTypes.includes(option.type))
    : contractTypeOptions;

  const renderOption = (option: ContractTypeOption) => {
    const isSelected = selectedType === option.type;

    return (
      <TouchableOpacity
        key={option.type}
        onPress={() => onSelect(option.type)}
        style={{
          marginRight: 12,
          marginBottom: 12
        }}
      >
        <ThemedView
          style={{
            padding: 16,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: isSelected ? option.color : theme.outline + '40',
            backgroundColor: isSelected ? option.color + '20' : theme.surface,
            minWidth: 160,
            alignItems: 'center'
          }}
        >
          <ThemedView
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: isSelected ? option.color : theme.accent + '40',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8
            }}
          >
            <MaterialCommunityIcons
              name={option.icon as any}
              size={24}
              color={isSelected ? 'white' : theme.accent}
            />
          </ThemedView>

          <ThemedText
            style={{
              fontSize: 14,
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: 4,
              color: isSelected ? option.color : theme.onSurface
            }}
          >
            {option.label}
          </ThemedText>

          <ThemedText
            style={{
              fontSize: 11,
              textAlign: 'center',
              color: isSelected ? option.color + '80' : theme.onSurface + '70',
              lineHeight: 14
            }}
          >
            {option.description}
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView>
      <ThemedText
        style={{
          fontSize: 18,
          fontWeight: '700',
          marginBottom: 16,
          color: theme.onSurface
        }}
      >
        Type de contrat
      </ThemedText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        <ThemedView style={{ flexDirection: 'row' }}>
          {options.map(renderOption)}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
};

export default ContractTypeSelector;