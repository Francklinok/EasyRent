import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Dimensions,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart, PieChart } from 'react-native-chart-kit';
import {
  getCryptoService,
  CryptoAnalytics,
  PriceData,
  MarketIndicators,
  UserPropertyToken,
  UserUtilityToken,
  CryptoPayment,
} from '../../services/api/cryptoService';

const { width: screenWidth } = Dimensions.get('window');

interface CryptoDashboardProps {
  userId: string;
  onNavigateToPayments: () => void;
  onNavigateToTokens: () => void;
  onNavigateToMarketplace: () => void;
  onNavigateToStaking: () => void;
}

const CryptoDashboard: React.FC<CryptoDashboardProps> = ({
  userId,
  onNavigateToPayments,
  onNavigateToTokens,
  onNavigateToMarketplace,
  onNavigateToStaking,
}) => {
  const insets = useSafeAreaInsets();
  const cryptoService = getCryptoService();

  // États
  const [analytics, setAnalytics] = useState<CryptoAnalytics | null>(null);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [marketIndicators, setMarketIndicators] = useState<MarketIndicators | null>(null);
  const [recentPayments, setRecentPayments] = useState<CryptoPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Charger les données du dashboard
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [
        analyticsData,
        pricesData,
        marketsData,
        paymentsData,
      ] = await Promise.all([
        cryptoService.getCryptoAnalytics(userId),
        cryptoService.getCryptoPrices(['BTC', 'ETH', 'USDT', 'MATIC']),
        cryptoService.getMarketIndicators(),
        cryptoService.getUserCryptoPayments(userId, { limit: 5 }),
      ]);

      setAnalytics(analyticsData);
      setPriceData(pricesData);
      setMarketIndicators(marketsData);
      setRecentPayments(paymentsData.payments);
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, cryptoService]);

  // Actualiser les données
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, [loadDashboardData]);

  // Charger les données au montage
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Formater le montant
  const formatAmount = (amount: number, currency = 'EUR'): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Formater le pourcentage
  const formatPercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  // Configuration du graphique
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(45, 52, 54, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#007AFF',
    },
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement du dashboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard Crypto</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#2D3436" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        {/* Résumé du portefeuille */}
        {analytics && (
          <View style={styles.portfolioSummary}>
            <Text style={styles.sectionTitle}>Votre portefeuille</Text>
            <View style={styles.portfolioValueContainer}>
              <Text style={styles.portfolioValue}>
                {formatAmount(analytics.totalPortfolioValue)}
              </Text>
              <View style={styles.portfolioStats}>
                <View style={styles.portfolioStat}>
                  <Text style={styles.portfolioStatLabel}>Tokens actifs</Text>
                  <Text style={styles.portfolioStatValue}>{analytics.activeTokens}</Text>
                </View>
                <View style={styles.portfolioStat}>
                  <Text style={styles.portfolioStatLabel}>Récompenses</Text>
                  <Text style={[styles.portfolioStatValue, { color: '#00B894' }]}>
                    {formatAmount(analytics.stakingRewards)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Répartition du portefeuille */}
            {analytics.portfolioBreakdown.length > 0 && (
              <View style={styles.portfolioBreakdown}>
                <Text style={styles.breakdownTitle}>Répartition</Text>
                <View style={styles.breakdownList}>
                  {analytics.portfolioBreakdown.map((item, index) => (
                    <View key={index} style={styles.breakdownItem}>
                      <View style={styles.breakdownItemHeader}>
                        <Text style={styles.breakdownItemName}>{item.name}</Text>
                        <Text style={styles.breakdownItemPercentage}>
                          {item.percentage.toFixed(1)}%
                        </Text>
                      </View>
                      <Text style={styles.breakdownItemValue}>
                        {formatAmount(item.value)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Actions rapides */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onNavigateToPayments}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#E8F4FD' }]}>
                <Ionicons name="card" size={24} color="#007AFF" />
              </View>
              <Text style={styles.actionText}>Paiements</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onNavigateToTokens}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#F0FFF4' }]}>
                <Ionicons name="diamond" size={24} color="#00B894" />
              </View>
              <Text style={styles.actionText}>Mes tokens</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onNavigateToMarketplace}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FFF5F5' }]}>
                <Ionicons name="storefront" size={24} color="#E17055" />
              </View>
              <Text style={styles.actionText}>Marketplace</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onNavigateToStaking}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="trending-up" size={24} color="#A29BFE" />
              </View>
              <Text style={styles.actionText}>Staking</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Prix des cryptomonnaies */}
        {priceData.length > 0 && (
          <View style={styles.cryptoPrices}>
            <Text style={styles.sectionTitle}>Prix des cryptomonnaies</Text>
            <View style={styles.pricesList}>
              {priceData.map((crypto, index) => (
                <View key={index} style={styles.priceItem}>
                  <View style={styles.priceInfo}>
                    <Text style={styles.cryptoSymbol}>{crypto.symbol}</Text>
                    <Text style={styles.cryptoPrice}>
                      ${crypto.price.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.priceChange}>
                    <Text style={[
                      styles.priceChangeText,
                      { color: crypto.change24h >= 0 ? '#00B894' : '#E17055' }
                    ]}>
                      {formatPercentage(crypto.change24h)}
                    </Text>
                    <Ionicons
                      name={crypto.change24h >= 0 ? 'trending-up' : 'trending-down'}
                      size={16}
                      color={crypto.change24h >= 0 ? '#00B894' : '#E17055'}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Indicateurs de marché */}
        {marketIndicators && (
          <View style={styles.marketIndicators}>
            <Text style={styles.sectionTitle}>Indicateurs de marché</Text>
            <View style={styles.indicatorsGrid}>
              <View style={styles.indicator}>
                <Text style={styles.indicatorLabel}>Market Cap Crypto</Text>
                <Text style={styles.indicatorValue}>
                  ${(marketIndicators.cryptoMarket.totalMarketCap / 1e12).toFixed(2)}T
                </Text>
              </View>

              <View style={styles.indicator}>
                <Text style={styles.indicatorLabel}>Fear & Greed</Text>
                <Text style={[
                  styles.indicatorValue,
                  {
                    color: marketIndicators.cryptoMarket.fearGreedIndex >= 50
                      ? '#00B894'
                      : '#E17055'
                  }
                ]}>
                  {marketIndicators.cryptoMarket.fearGreedIndex}
                </Text>
              </View>

              <View style={styles.indicator}>
                <Text style={styles.indicatorLabel}>TVL DeFi</Text>
                <Text style={styles.indicatorValue}>
                  ${(marketIndicators.defiMetrics.totalValueLocked / 1e9).toFixed(1)}B
                </Text>
              </View>

              <View style={styles.indicator}>
                <Text style={styles.indicatorLabel}>APY moyen</Text>
                <Text style={styles.indicatorValue}>
                  {marketIndicators.defiMetrics.averageApy.toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Paiements récents */}
        {recentPayments.length > 0 && (
          <View style={styles.recentPayments}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Paiements récents</Text>
              <TouchableOpacity onPress={onNavigateToPayments}>
                <Text style={styles.seeAllText}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.paymentsList}>
              {recentPayments.slice(0, 3).map((payment, index) => (
                <View key={index} style={styles.paymentItem}>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentAmount}>
                      {formatAmount(payment.amountFiat, payment.fiatCurrency)}
                    </Text>
                    <Text style={styles.paymentType}>
                      {payment.paymentType} • {payment.cryptocurrency}
                    </Text>
                  </View>
                  <View style={[
                    styles.paymentStatus,
                    {
                      backgroundColor: payment.status === 'confirmed'
                        ? '#00B894'
                        : payment.status === 'pending'
                        ? '#FDCB6E'
                        : '#E17055'
                    }
                  ]}>
                    <Text style={styles.paymentStatusText}>
                      {payment.status === 'confirmed' ? 'Confirmé' :
                       payment.status === 'pending' ? 'En attente' : 'Échoué'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Nouvelles et actualités */}
        <View style={styles.newsSection}>
          <Text style={styles.sectionTitle}>Actualités</Text>
          <View style={styles.newsCard}>
            <Text style={styles.newsTitle}>
              Les tokenisations immobilières en hausse de 300% cette année
            </Text>
            <Text style={styles.newsDescription}>
              Le marché des tokens immobiliers continue sa croissance avec de nouveaux projets...
            </Text>
            <Text style={styles.newsDate}>Il y a 2 heures</Text>
          </View>
        </View>

        {/* Espacement en bas */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  } as ViewStyle,

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#636E72',
  } as TextStyle,

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  } as ViewStyle,

  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3436',
  } as TextStyle,

  notificationButton: {
    padding: 4,
  } as ViewStyle,

  content: {
    flex: 1,
  } as ViewStyle,

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 16,
  } as TextStyle,

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  } as ViewStyle,

  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  } as TextStyle,

  portfolioSummary: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,

  portfolioValueContainer: {
    alignItems: 'center',
    marginBottom: 20,
  } as ViewStyle,

  portfolioValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 12,
  } as TextStyle,

  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  } as ViewStyle,

  portfolioStat: {
    alignItems: 'center',
  } as ViewStyle,

  portfolioStatLabel: {
    fontSize: 12,
    color: '#636E72',
    marginBottom: 4,
  } as TextStyle,

  portfolioStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
  } as TextStyle,

  portfolioBreakdown: {
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingTop: 16,
  } as ViewStyle,

  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 12,
  } as TextStyle,

  breakdownList: {
    // Container styles
  } as ViewStyle,

  breakdownItem: {
    marginBottom: 12,
  } as ViewStyle,

  breakdownItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  } as ViewStyle,

  breakdownItemName: {
    fontSize: 14,
    color: '#2D3436',
  } as TextStyle,

  breakdownItemPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  } as TextStyle,

  breakdownItemValue: {
    fontSize: 12,
    color: '#636E72',
  } as TextStyle,

  quickActions: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  } as ViewStyle,

  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  } as ViewStyle,

  actionButton: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  } as ViewStyle,

  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  actionText: {
    fontSize: 12,
    color: '#2D3436',
    textAlign: 'center',
  } as TextStyle,

  cryptoPrices: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  } as ViewStyle,

  pricesList: {
    // Container styles
  } as ViewStyle,

  priceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  } as ViewStyle,

  priceInfo: {
    flex: 1,
  } as ViewStyle,

  cryptoSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 2,
  } as TextStyle,

  cryptoPrice: {
    fontSize: 14,
    color: '#636E72',
  } as TextStyle,

  priceChange: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  priceChangeText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  } as TextStyle,

  marketIndicators: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  } as ViewStyle,

  indicatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  } as ViewStyle,

  indicator: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  } as ViewStyle,

  indicatorLabel: {
    fontSize: 12,
    color: '#636E72',
    marginBottom: 4,
    textAlign: 'center',
  } as TextStyle,

  indicatorValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
  } as TextStyle,

  recentPayments: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  } as ViewStyle,

  paymentsList: {
    // Container styles
  } as ViewStyle,

  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  } as ViewStyle,

  paymentInfo: {
    flex: 1,
  } as ViewStyle,

  paymentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 2,
  } as TextStyle,

  paymentType: {
    fontSize: 12,
    color: '#636E72',
    textTransform: 'capitalize',
  } as TextStyle,

  paymentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  } as ViewStyle,

  paymentStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  } as TextStyle,

  newsSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  } as ViewStyle,

  newsCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  } as ViewStyle,

  newsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 8,
    lineHeight: 20,
  } as TextStyle,

  newsDescription: {
    fontSize: 12,
    color: '#636E72',
    lineHeight: 18,
    marginBottom: 8,
  } as TextStyle,

  newsDate: {
    fontSize: 10,
    color: '#636E72',
  } as TextStyle,

  bottomSpacing: {
    height: 20,
  } as ViewStyle,
});

export default CryptoDashboard;