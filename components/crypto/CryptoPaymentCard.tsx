import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  CryptoPayment,
  PaymentStatus,
  Cryptocurrency,
  PaymentType,
} from '../../services/api/cryptoService';

interface CryptoPaymentCardProps {
  payment: CryptoPayment;
  onPress?: (payment: CryptoPayment) => void;
  style?: ViewStyle;
}

const CryptoPaymentCard: React.FC<CryptoPaymentCardProps> = ({
  payment,
  onPress,
  style,
}) => {
  // Obtenir l'icône de la cryptomonnaie
  const getCryptoIcon = (crypto: Cryptocurrency): string => {
    const iconMap: Record<Cryptocurrency, string> = {
      [Cryptocurrency.BTC]: 'logo-bitcoin',
      [Cryptocurrency.ETH]: 'logo-ethereum',
      [Cryptocurrency.USDT]: 'wallet',
      [Cryptocurrency.USDC]: 'wallet',
      [Cryptocurrency.MATIC]: 'diamond',
      [Cryptocurrency.BNB]: 'wallet',
    };
    return iconMap[crypto] || 'wallet';
  };

  // Obtenir la couleur de la cryptomonnaie
  const getCryptoColor = (crypto: Cryptocurrency): string => {
    const colorMap: Record<Cryptocurrency, string> = {
      [Cryptocurrency.BTC]: '#F7931A',
      [Cryptocurrency.ETH]: '#627EEA',
      [Cryptocurrency.USDT]: '#26A17B',
      [Cryptocurrency.USDC]: '#2775CA',
      [Cryptocurrency.MATIC]: '#8247E5',
      [Cryptocurrency.BNB]: '#F3BA2F',
    };
    return colorMap[crypto] || '#74B9FF';
  };

  // Obtenir la configuration du statut
  const getStatusConfig = (status: PaymentStatus) => {
    const statusConfig = {
      [PaymentStatus.PENDING]: { color: '#FDCB6E', text: 'En attente', icon: 'time' },
      [PaymentStatus.CONFIRMING]: { color: '#74B9FF', text: 'Confirmation', icon: 'sync' },
      [PaymentStatus.CONFIRMED]: { color: '#00B894', text: 'Confirmé', icon: 'checkmark-circle' },
      [PaymentStatus.FAILED]: { color: '#E17055', text: 'Échoué', icon: 'close-circle' },
      [PaymentStatus.REFUNDED]: { color: '#636E72', text: 'Remboursé', icon: 'return-up-back' },
    };
    return statusConfig[status];
  };

  // Obtenir le label du type de paiement
  const getPaymentTypeLabel = (type: PaymentType): string => {
    const typeLabels = {
      [PaymentType.RENT]: 'Loyer',
      [PaymentType.PURCHASE]: 'Achat',
      [PaymentType.DEPOSIT]: 'Dépôt',
      [PaymentType.SECURITY_DEPOSIT]: 'Caution',
      [PaymentType.SERVICE_FEE]: 'Frais de service',
    };
    return typeLabels[type] || type;
  };

  // Formater le montant
  const formatAmount = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Formater la date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Calculer la progression des confirmations
  const getConfirmationProgress = (): number => {
    if (payment.confirmationsRequired === 0) return 1;
    return Math.min(payment.confirmations / payment.confirmationsRequired, 1);
  };

  const statusConfig = getStatusConfig(payment.status);
  const cryptoColor = getCryptoColor(payment.cryptocurrency);
  const cryptoIcon = getCryptoIcon(payment.cryptocurrency);
  const confirmationProgress = getConfirmationProgress();

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress?.(payment)}
      activeOpacity={0.7}
    >
      {/* En-tête avec crypto et statut */}
      <View style={styles.header}>
        <View style={styles.cryptoInfo}>
          <View style={[styles.cryptoIcon, { backgroundColor: cryptoColor }]}>
            <Ionicons name={cryptoIcon as any} size={20} color="white" />
          </View>
          <View style={styles.cryptoDetails}>
            <Text style={styles.cryptoSymbol}>{payment.cryptocurrency}</Text>
            <Text style={styles.networkText}>{payment.network}</Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
          <Ionicons name={statusConfig.icon as any} size={14} color="white" />
          <Text style={styles.statusText}>{statusConfig.text}</Text>
        </View>
      </View>

      {/* Informations de paiement */}
      <View style={styles.paymentInfo}>
        <View style={styles.amountRow}>
          <Text style={styles.fiatAmount}>
            {formatAmount(payment.amountFiat, payment.fiatCurrency)}
          </Text>
          <Text style={styles.cryptoAmount}>
            {payment.amount.toFixed(8)} {payment.cryptocurrency}
          </Text>
        </View>

        <View style={styles.typeRow}>
          <Text style={styles.paymentType}>
            {getPaymentTypeLabel(payment.paymentType)}
          </Text>
          <Text style={styles.exchangeRate}>
            1 {payment.cryptocurrency} = {formatAmount(payment.exchangeRate, payment.fiatCurrency)}
          </Text>
        </View>
      </View>

      {/* Informations de la propriété */}
      <View style={styles.propertyInfo}>
        <Ionicons name="home" size={16} color="#636E72" />
        <Text style={styles.propertyAddress} numberOfLines={1}>
          {payment.metadata.propertyAddress}
        </Text>
      </View>

      {/* Barre de progression des confirmations */}
      {payment.status === PaymentStatus.CONFIRMING && (
        <View style={styles.confirmationSection}>
          <View style={styles.confirmationHeader}>
            <Text style={styles.confirmationText}>
              Confirmations: {payment.confirmations}/{payment.confirmationsRequired}
            </Text>
            <Text style={styles.confirmationPercentage}>
              {Math.round(confirmationProgress * 100)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${confirmationProgress * 100}%` }
              ]}
            />
          </View>
        </View>
      )}

      {/* Hash de transaction */}
      {payment.transactionHash && (
        <View style={styles.transactionHash}>
          <Ionicons name="link" size={14} color="#636E72" />
          <Text style={styles.hashText} numberOfLines={1}>
            {payment.transactionHash}
          </Text>
          <TouchableOpacity style={styles.copyButton}>
            <Ionicons name="copy" size={14} color="#007AFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Informations d'escrow */}
      {payment.escrow?.isEscrow && (
        <View style={styles.escrowInfo}>
          <Ionicons name="shield-checkmark" size={16} color="#FDCB6E" />
          <Text style={styles.escrowText}>
            {payment.escrow.isReleased ? 'Escrow libéré' : 'En escrow'}
          </Text>
        </View>
      )}

      {/* Date */}
      <View style={styles.footer}>
        <Text style={styles.dateText}>{formatDate(payment.createdAt)}</Text>
        {payment.recurring?.isRecurring && (
          <View style={styles.recurringBadge}>
            <Ionicons name="repeat" size={12} color="#636E72" />
            <Text style={styles.recurringText}>Récurrent</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,

  cryptoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,

  cryptoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  cryptoDetails: {
    marginLeft: 12,
  } as ViewStyle,

  cryptoSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
  } as TextStyle,

  networkText: {
    fontSize: 12,
    color: '#636E72',
    textTransform: 'capitalize',
  } as TextStyle,

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  } as ViewStyle,

  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
    marginLeft: 4,
  } as TextStyle,

  paymentInfo: {
    marginBottom: 12,
  } as ViewStyle,

  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  } as ViewStyle,

  fiatAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3436',
  } as TextStyle,

  cryptoAmount: {
    fontSize: 14,
    color: '#636E72',
    fontFamily: 'monospace',
  } as TextStyle,

  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,

  paymentType: {
    fontSize: 14,
    color: '#636E72',
  } as TextStyle,

  exchangeRate: {
    fontSize: 12,
    color: '#636E72',
  } as TextStyle,

  propertyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,

  propertyAddress: {
    fontSize: 14,
    color: '#636E72',
    marginLeft: 6,
    flex: 1,
  } as TextStyle,

  confirmationSection: {
    marginBottom: 12,
  } as ViewStyle,

  confirmationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  } as ViewStyle,

  confirmationText: {
    fontSize: 12,
    color: '#636E72',
  } as TextStyle,

  confirmationPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#74B9FF',
  } as TextStyle,

  progressBar: {
    height: 4,
    backgroundColor: '#F8F9FA',
    borderRadius: 2,
    overflow: 'hidden',
  } as ViewStyle,

  progressFill: {
    height: '100%',
    backgroundColor: '#74B9FF',
    borderRadius: 2,
  } as ViewStyle,

  transactionHash: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
  } as ViewStyle,

  hashText: {
    fontSize: 12,
    color: '#636E72',
    fontFamily: 'monospace',
    marginLeft: 6,
    flex: 1,
  } as TextStyle,

  copyButton: {
    padding: 4,
  } as ViewStyle,

  escrowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBF0',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
  } as ViewStyle,

  escrowText: {
    fontSize: 12,
    color: '#FDCB6E',
    fontWeight: '500',
    marginLeft: 6,
  } as TextStyle,

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,

  dateText: {
    fontSize: 12,
    color: '#636E72',
  } as TextStyle,

  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  } as ViewStyle,

  recurringText: {
    fontSize: 10,
    color: '#636E72',
    marginLeft: 2,
  } as TextStyle,
});

export default CryptoPaymentCard;