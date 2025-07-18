import React from 'react';
import { PropertyType, PropertyStatus } from '@/types/property';
import { Home as HomeIcon, Map as MapIcon, DollarSign as DollarIcon } from 'lucide-react-native';
import { useTheme } from '@/components/contexts/theme/themehook';




export const getStatusColor = (status: PropertyStatus): string => {
  const  {theme} = useTheme()

  switch (status) {
    case 'available':
      return theme.success || '#28a745';
    case 'rented':
      return theme.warning || '#ffc107';
    case 'sold':
      return theme.error || '#dc3545';
    case 'pending':
      return theme.accent || '#6f42c1';
    default:
      return theme.primary || '#007bff';
  }
};

export const getStatusLabel = (status: PropertyStatus): string => {
  switch (status) {
    case 'available':
      return 'Disponible';
    case 'rented':
      return 'Loué';
    case 'sold':
      return 'Vendu';
    case 'pending':
      return 'En attente';
    default:
      return status;
  }
};

// Ici on change React.ReactElement en React.ReactNode pour plus de souplesse
export const getPropertyTypeIcon = (type: PropertyType): React.ReactNode => {
    const  {theme} = useTheme()

  const iconSize = 18;
  switch (type) {
    case 'house':
      return <HomeIcon size={iconSize} color={theme.primary || '#007bff'} />;
    case 'apartment':
      return <HomeIcon size={iconSize} color={theme.secondary || '#6c757d'} />;
    case 'land':
      return <MapIcon size={iconSize} color={theme.accent || '#6f42c1'} />;
    case 'commercial':
      return <DollarIcon size={iconSize} color={theme.surfaceVariant || theme.onSurface || '#495057'} />;
    default:
      return <HomeIcon size={iconSize} color={theme.primary || '#007bff'} />;
  }
};

export const formatAmount = (amount: number, currency: string): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0 €';
  }
  switch (currency) {
    case 'EUR':
      return `${amount.toLocaleString('fr-FR')} €`;
    case 'USD':
      return `$${amount.toLocaleString('en-US')}`;
    case 'GBP':
      return `£${amount.toLocaleString('en-GB')}`;
    default:
      return `${amount.toLocaleString()} ${currency}`;
  }
};

export const getPropertyTypeIconName = (type: PropertyType): string => {
  switch (type) {
    case 'house':
    case 'apartment':
      return 'home';
    case 'land':
      return 'map';
    case 'commercial':
      return 'dollar-sign';
    default:
      return 'home';
  }
};

export const getPropertyTypeColor = (type: PropertyType): string => {  
  const  {theme} = useTheme()

  switch (type) {
    case 'house':
      return theme.primary || '#007bff';
    case 'apartment':
      return theme.secondary || '#6c757d';
    case 'land':
      return theme.accent || '#6f42c1';
    case 'commercial':
      return theme.surfaceVariant || theme.onSurface || '#495057';
    default:
      return theme.primary || '#007bff';
  }
};
