import React from 'react';
import { PropertyType, PropertyStatus } from '@/types/property';

// Import des icônes avec des alias pour éviter les conflits de types
import { Home, Map, DollarSign } from 'lucide-react-native';

// Types pour les thèmes
interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  onSurface: string;
  onSurfaceVariant: string;
}

export const getStatusColor = (status: PropertyStatus, theme: Theme): string => {
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

export const getPropertyTypeIcon = (type: PropertyType, theme: Theme): React.ReactElement => {
  const iconSize = 18;
  
  switch (type) {
    case 'house':
      // return <Home size={iconSize} color={theme.primary || '#007bff'} />;
    case 'apartment':
      // return <Home size={iconSize} color={theme.secondary || '#6c757d'} />;
    case 'land':
      // return <Map size={iconSize} color={theme.accent || '#6f42c1'} />;
    case 'commercial':
      // return <DollarSign size={iconSize} color={theme.onSurfaceVariant || theme.onSurface || '#495057'} />;
    default:
      // return <Home size={iconSize} color={theme.primary || '#007bff'} />;
  }
};

export const formatAmount = (amount: number, currency: string): string => {
  // Vérification si amount est un nombre valide
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0 €';
  }

  // Formatage selon la devise
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

// Fonction utilitaire pour obtenir le type d'icône comme string (si nécessaire)
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

// Fonction utilitaire pour obtenir la couleur du type de propriété
export const getPropertyTypeColor = (type: PropertyType, theme: Theme): string => {
  switch (type) {
    case 'house':
      return theme.primary || '#007bff';
    case 'apartment':
      return theme.secondary || '#6c757d';
    case 'land':
      return theme.accent || '#6f42c1';
    case 'commercial':
      return theme.onSurfaceVariant || theme.onSurface || '#495057';
    default:
      return theme.primary || '#007bff';
  }
};