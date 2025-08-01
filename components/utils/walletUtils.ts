import { Alert } from 'react-native';

export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const validateAmount = (amount: string): { isValid: boolean; value: number } => {
  const numericAmount = parseFloat(amount);
  
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return { isValid: false, value: 0 };
  }
  
  if (numericAmount > 10000) {
    Alert.alert('Montant trop élevé', 'Le montant maximum est de 10 000€');
    return { isValid: false, value: 0 };
  }
  
  return { isValid: true, value: numericAmount };
};

export const showPaymentSuccess = (amount: number, description: string) => {
  Alert.alert(
    'Paiement réussi',
    `${formatCurrency(amount)} a été débité pour: ${description}`,
    [{ text: 'OK' }]
  );
};

export const showInsufficientFunds = () => {
  Alert.alert(
    'Solde insuffisant',
    'Votre solde est insuffisant pour effectuer cette transaction.',
    [{ text: 'OK' }]
  );
};