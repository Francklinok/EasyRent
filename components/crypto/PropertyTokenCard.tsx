import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  PropertyToken,
  TokenStatus,
  PropertyType,
  BlockchainNetwork,
} from '../../services/api/cryptoService';

interface PropertyTokenCardProps {
  token: PropertyToken;
  onPress?: (token: PropertyToken) => void;
  onInvest?: (token: PropertyToken) => void;
  style?: ViewStyle;
  userOwnership?: {
    tokensOwned: number;
    ownershipPercentage: number;
    currentValue: number;
    unrealizedGains: number;
  };
}

const PropertyTokenCard: React.FC<PropertyTokenCardProps> = ({
  token,
  onPress,
  onInvest,
  style,
  userOwnership,
}) => {
  // Obtenir la couleur du statut
  const getStatusColor = (status: TokenStatus): string => {
    const colorMap = {
      [TokenStatus.DEVELOPMENT]: '#636E72',
      [TokenStatus.TOKENIZED]: '#74B9FF',
      [TokenStatus.DEPLOYED]: '#FDCB6E',
      [TokenStatus.ACTIVE]: '#00B894',
      [TokenStatus.PAUSED]: '#E17055',
      [TokenStatus.COMPLETED]: '#636E72',
    };
    return colorMap[status] || '#74B9FF';
  };

  // Obtenir le label du statut
  const getStatusLabel = (status: TokenStatus): string => {
    const labelMap = {
      [TokenStatus.DEVELOPMENT]: 'Développement',
      [TokenStatus.TOKENIZED]: 'Tokenisé',
      [TokenStatus.DEPLOYED]: 'Déployé',
      [TokenStatus.ACTIVE]: 'Actif',
      [TokenStatus.PAUSED]: 'En pause',
      [TokenStatus.COMPLETED]: 'Terminé',
    };
    return labelMap[status] || status;
  };

  // Obtenir l'icône du type de propriété
  const getPropertyTypeIcon = (type: PropertyType): string => {
    const iconMap = {
      [PropertyType.RESIDENTIAL]: 'home',
      [PropertyType.COMMERCIAL]: 'business',
      [PropertyType.INDUSTRIAL]: 'construct',
      [PropertyType.LAND]: 'earth',
    };
    return iconMap[type] || 'home';
  };

  // Obtenir l'icône de la blockchain
  const getBlockchainIcon = (network: BlockchainNetwork): string => {
    const iconMap = {
      [BlockchainNetwork.BITCOIN]: 'logo-bitcoin',
      [BlockchainNetwork.ETHEREUM]: 'logo-ethereum',
      [BlockchainNetwork.POLYGON]: 'diamond',
      [BlockchainNetwork.BSC]: 'wallet',
      [BlockchainNetwork.AVALANCHE]: 'snow',
    };
    return iconMap[network] || 'link';
  };

  // Formater le montant
  const formatAmount = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Formater le pourcentage
  const formatPercentage = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  // Calculer le rendement annuel potentiel
  const calculatePotentialYield = (): number => {
    return token.valueMetrics.cashFlow.annual / token.propertyDetails.totalValue * 100;
  };

  const statusColor = getStatusColor(token.status);
  const statusLabel = getStatusLabel(token.status);
  const propertyIcon = getPropertyTypeIcon(token.propertyDetails.propertyType);
  const blockchainIcon = getBlockchainIcon(token.blockchain.network);
  const potentialYield = calculatePotentialYield();
  const isOwned = userOwnership && userOwnership.tokensOwned > 0;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress?.(token)}
      activeOpacity={0.7}
    >
      {/* Badge de statut */}
      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
        <Text style={styles.statusText}>{statusLabel}</Text>
      </View>

      {/* En-tête avec informations de base */}
      <View style={styles.header}>
        <View style={styles.propertyInfo}>
          <Ionicons name={propertyIcon as any} size={24} color="#2D3436" />
          <View style={styles.propertyDetails}>
            <Text style={styles.tokenName}>{token.tokenomics.tokenName}</Text>
            <Text style={styles.tokenSymbol}>{token.tokenomics.tokenSymbol}</Text>
          </View>
        </View>

        <View style={styles.blockchainBadge}>
          <Ionicons name={blockchainIcon as any} size={16} color="#636E72" />
          <Text style={styles.blockchainText}>{token.blockchain.network}</Text>
        </View>
      </View>

      {/* Adresse de la propriété */}
      <Text style={styles.propertyAddress} numberOfLines={2}>
        {token.propertyDetails.address}
      </Text>

      {/* Métriques principales */}
      <View style={styles.metricsGrid}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Valeur totale</Text>
          <Text style={styles.metricValue}>
            {formatAmount(token.propertyDetails.totalValue, token.propertyDetails.currency)}
          </Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Prix par token</Text>
          <Text style={styles.metricValue}>
            {formatAmount(token.tokenomics.tokenPrice, token.propertyDetails.currency)}
          </Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Rendement</Text>
          <Text style={[styles.metricValue, { color: '#00B894' }]}>
            {potentialYield.toFixed(1)}%
          </Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Taux d'occupation</Text>
          <Text style={styles.metricValue}>
            {formatPercentage(token.valueMetrics.occupancyRate)}
          </Text>
        </View>
      </View>

      {/* Informations de propriété détaillées */}
      <View style={styles.propertyMetrics}>
        <View style={styles.propertyMetric}>
          <Ionicons name="business" size={16} color="#636E72" />
          <Text style={styles.propertyMetricText}>
            CAP Rate: {token.valueMetrics.capRate.toFixed(2)}%
          </Text>
        </View>

        <View style={styles.propertyMetric}>
          <Ionicons name="trending-up" size={16} color="#636E72" />
          <Text style={styles.propertyMetricText}>
            Appréciation: {formatPercentage(token.valueMetrics.appreciationRate)}/an
          </Text>
        </View>
      </View>

      {/* Informations de tokenisation */}
      <View style={styles.tokenizationInfo}>
        <View style={styles.tokenSupply}>
          <Text style={styles.supplyLabel}>Tokens en circulation</Text>
          <Text style={styles.supplyValue}>
            {token.tokenomics.circulatingSupply.toLocaleString()} / {token.tokenomics.totalSupply.toLocaleString()}
          </Text>
          <View style={styles.supplyBar}>
            <View
              style={[
                styles.supplyFill,
                { width: `${(token.tokenomics.circulatingSupply / token.tokenomics.totalSupply) * 100}%` }
              ]}
            />
          </View>
        </View>

        <View style={styles.ownershipInfo}>
          <Text style={styles.ownershipLabel}>
            {token.ownership.totalOwners} propriétaire{token.ownership.totalOwners > 1 ? 's' : ''}
          </Text>
          <Text style={styles.minimumInvestment}>
            Min. investissement: {formatAmount(token.tokenomics.minimumInvestment, token.propertyDetails.currency)}
          </Text>
        </View>
      </View>

      {/* Informations de possession de l'utilisateur */}
      {isOwned && userOwnership && (
        <View style={styles.userOwnership}>
          <View style={styles.ownershipHeader}>
            <Text style={styles.ownershipTitle}>Votre participation</Text>
            <View style={styles.ownershipBadge}>
              <Text style={styles.ownershipPercentage}>
                {userOwnership.ownershipPercentage.toFixed(2)}%
              </Text>
            </View>
          </View>

          <View style={styles.ownershipDetails}>
            <View style={styles.ownershipDetail}>
              <Text style={styles.ownershipDetailLabel}>Tokens détenus</Text>
              <Text style={styles.ownershipDetailValue}>
                {userOwnership.tokensOwned.toLocaleString()}
              </Text>
            </View>

            <View style={styles.ownershipDetail}>
              <Text style={styles.ownershipDetailLabel}>Valeur actuelle</Text>
              <Text style={styles.ownershipDetailValue}>
                {formatAmount(userOwnership.currentValue, token.propertyDetails.currency)}
              </Text>
            </View>

            <View style={styles.ownershipDetail}>
              <Text style={styles.ownershipDetailLabel}>Gains non réalisés</Text>
              <Text style={[
                styles.ownershipDetailValue,
                { color: userOwnership.unrealizedGains >= 0 ? '#00B894' : '#E17055' }
              ]}>
                {userOwnership.unrealizedGains >= 0 ? '+' : ''}
                {formatAmount(userOwnership.unrealizedGains, token.propertyDetails.currency)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Footer avec actions */}
      <View style={styles.footer}>
        {token.revenueSharing.enabled && (
          <View style={styles.revenueSharingInfo}>
            <Ionicons name="cash" size={16} color="#00B894" />
            <Text style={styles.revenueSharingText}>
              Partage de revenus - {token.revenueSharing.distributionFrequency}
            </Text>
          </View>
        )}

        {!isOwned && onInvest && token.status === TokenStatus.ACTIVE && (
          <TouchableOpacity
            style={styles.investButton}
            onPress={() => onInvest(token)}
          >
            <Ionicons name="add-circle" size={16} color="white" />
            <Text style={styles.investButtonText}>Investir</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Badges additionnels */}
      <View style={styles.badges}>
        {token.trading.isTradeEnabled && (
          <View style={styles.badge}>
            <Ionicons name="swap-horizontal" size={12} color="#74B9FF" />
            <Text style={styles.badgeText}>Échangeable</Text>
          </View>
        )}

        {token.governance.enabled && (
          <View style={styles.badge}>
            <Ionicons name="vote" size={12} color="#A29BFE" />
            <Text style={styles.badgeText}>Gouvernance</Text>
          </View>
        )}

        {token.compliance.isCompliant && (
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={12} color="#00B894" />
            <Text style={styles.badgeText}>Conforme</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
  } as ViewStyle,

  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  } as ViewStyle,

  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  } as TextStyle,

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    marginTop: 8,
  } as ViewStyle,

  propertyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,

  propertyDetails: {
    marginLeft: 12,
    flex: 1,
  } as ViewStyle,

  tokenName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 2,
  } as TextStyle,

  tokenSymbol: {
    fontSize: 14,
    color: '#636E72',
    fontFamily: 'monospace',
  } as TextStyle,

  blockchainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  } as ViewStyle,

  blockchainText: {
    fontSize: 12,
    color: '#636E72',
    marginLeft: 4,
    textTransform: 'capitalize',
  } as TextStyle,

  propertyAddress: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 20,
    marginBottom: 16,
  } as TextStyle,

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  } as ViewStyle,

  metric: {
    width: '50%',
    marginBottom: 12,
  } as ViewStyle,

  metricLabel: {
    fontSize: 12,
    color: '#636E72',
    marginBottom: 4,
  } as TextStyle,

  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
  } as TextStyle,

  propertyMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  } as ViewStyle,

  propertyMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,

  propertyMetricText: {
    fontSize: 12,
    color: '#636E72',
    marginLeft: 6,
  } as TextStyle,

  tokenizationInfo: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  } as ViewStyle,

  tokenSupply: {
    marginBottom: 8,
  } as ViewStyle,

  supplyLabel: {
    fontSize: 12,
    color: '#636E72',
    marginBottom: 4,
  } as TextStyle,

  supplyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 6,
  } as TextStyle,

  supplyBar: {
    height: 4,
    backgroundColor: '#E9ECEF',
    borderRadius: 2,
    overflow: 'hidden',
  } as ViewStyle,

  supplyFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  } as ViewStyle,

  ownershipInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,

  ownershipLabel: {
    fontSize: 12,
    color: '#636E72',
  } as TextStyle,

  minimumInvestment: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3436',
  } as TextStyle,

  userOwnership: {
    backgroundColor: '#E8F4FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  } as ViewStyle,

  ownershipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  ownershipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
  } as TextStyle,

  ownershipBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  } as ViewStyle,

  ownershipPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  } as TextStyle,

  ownershipDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  } as ViewStyle,

  ownershipDetail: {
    flex: 1,
  } as ViewStyle,

  ownershipDetailLabel: {
    fontSize: 10,
    color: '#636E72',
    marginBottom: 2,
  } as TextStyle,

  ownershipDetailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3436',
  } as TextStyle,

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,

  revenueSharingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,

  revenueSharingText: {
    fontSize: 12,
    color: '#00B894',
    marginLeft: 6,
  } as TextStyle,

  investButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  } as ViewStyle,

  investButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    marginLeft: 4,
  } as TextStyle,

  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  } as ViewStyle,

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  } as ViewStyle,

  badgeText: {
    fontSize: 10,
    color: '#636E72',
    marginLeft: 3,
  } as TextStyle,
});

export default PropertyTokenCard;