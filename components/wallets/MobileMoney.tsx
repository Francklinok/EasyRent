import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useLanguage } from '@/components/contexts/language';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import {
  Smartphone,
  ArrowLeft,
  CheckCircle2,
  Phone,
  User,
  AlertCircle,
  Info
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getWalletService, type MobileMoneyProvider } from '@/services/api/walletService';

interface MobileMoneyProps {
  onBack: () => void;
  onPayment: (amount: number, description: string, method: string, metadata: any) => Promise<void>;
  balance: number;
  formatAmount: (amount: number) => string;
}

export const MobileMoney: React.FC<MobileMoneyProps> = ({
  onBack,
  onPayment,
  balance,
  formatAmount
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const walletService = getWalletService();

  const [providers, setProviders] = useState<MobileMoneyProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<MobileMoneyProvider | null>(null);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [fees, setFees] = useState<number>(0);

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    if (selectedProvider && amount && parseFloat(amount) > 0) {
      calculateFees();
    }
  }, [selectedProvider, amount]);

  const loadProviders = async () => {
    try {
      const data = await walletService.getMobileMoneyProviders();
      setProviders(data.filter(p => p.isActive));
    } catch (error) {
      console.error('Error loading providers:', error);
    }
  };

  const calculateFees = async () => {
    if (!selectedProvider || !amount) return;

    try {
      const feeData = await walletService.calculateMobileMoneyFees(
        selectedProvider.id,
        parseFloat(amount),
        'deposit'
      );
      setFees(feeData.feeAmount);
    } catch (error) {
      console.error('Error calculating fees:', error);
    }
  };

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert(t('common.error'), t('walletComponents.enterValidAmount'));
      return;
    }

    if (!selectedProvider) {
      Alert.alert(t('common.error'), t('walletComponents.selectOperatorError'));
      return;
    }

    if (!phoneNumber) {
      Alert.alert(t('common.error'), t('walletComponents.enterPhone'));
      return;
    }

    const totalAmount = parseFloat(amount) + fees;
    if (totalAmount > balance) {
      Alert.alert(t('walletComponents.insufficientBalance'), t('walletComponents.needAmount', { amount: formatAmount(totalAmount) }));
      return;
    }

    try {
      setLoading(true);

      const response = await walletService.processPaymentWithMobileMoney({
        amount: parseFloat(amount),
        currency: 'XOF',
        description: `Recharge Mobile Money - ${selectedProvider.name}`,
        phoneNumber,
        providerId: selectedProvider.id,
        countryCode: selectedProvider.countryCode,
        accountName
      });

      if (response.success) {
        Alert.alert(
          t('walletComponents.paymentInitiated'),
          t('walletComponents.paymentInitiatedMsg', { amount: formatAmount(parseFloat(amount)), phone: phoneNumber }),
          [{ text: 'OK', onPress: onBack }]
        );
      } else {
        Alert.alert(t('common.error'), response.error || t('walletComponents.paymentFailed'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('walletScreen.paymentError'));
    } finally {
      setLoading(false);
    }
  };

  // Providers populaires (avec logos)
  const providerLogos: Record<string, any> = {
    'orange': { color: '#FF7900', name: 'Orange Money' },
    'mtn': { color: '#FFCB05', name: 'MTN Mobile Money' },
    'moov': { color: '#009EE2', name: 'Moov Money' },
    'togocell': { color: '#E2001A', name: 'Togocel Flooz' },
    'wave': { color: '#6C5CE7', name: 'Wave' },
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.onSurface} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>{t('walletComponents.mobileMoneyTitle')}</ThemedText>
          <View style={{ width: 40 }} />
        </View>

        {/* Info Banner */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={[styles.infoBanner, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }]}
        >
          <Info size={20} color={theme.primary} />
          <ThemedText style={styles.infoText}>
            {t('walletComponents.mobileMoneyInfo')}
          </ThemedText>
        </MotiView>

        {/* Providers Selection */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100 }}
          style={styles.section}
        >
          <ThemedText style={styles.sectionTitle}>{t('walletComponents.selectOperator')}</ThemedText>
          <ThemedView style={styles.providersGrid}>
            {providers.length === 0 ? (
              <View style={styles.emptyState}>
                <Smartphone size={48} color={theme.onSurface + '40'} />
                <ThemedText style={styles.emptyText}>
                  {t('walletComponents.loadingOperators')}
                </ThemedText>
              </View>
            ) : (
              providers.map((provider) => {
                const providerInfo = providerLogos[provider.shortCode.toLowerCase()];
                return (
                  <TouchableOpacity
                    key={provider.id}
                    onPress={() => setSelectedProvider(provider)}
                    style={[
                      styles.providerCard,
                      {
                        borderColor: selectedProvider?.id === provider.id ? theme.primary : theme.outline + '30',
                        backgroundColor: selectedProvider?.id === provider.id ? theme.primary + '10' : 'transparent'
                      }
                    ]}
                  >
                    <View style={[
                      styles.providerLogo,
                      { backgroundColor: (providerInfo?.color || theme.primary) + '20' }
                    ]}>
                      <Smartphone size={32} color={providerInfo?.color || theme.primary} />
                    </View>
                    <ThemedText style={styles.providerName}>
                      {providerInfo?.name || provider.name}
                    </ThemedText>
                    <ThemedText style={styles.providerCountry}>{provider.country}</ThemedText>
                    {selectedProvider?.id === provider.id && (
                      <View style={styles.checkMark}>
                        <CheckCircle2 size={24} color={theme.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ThemedView>
        </MotiView>

        {selectedProvider && (
          <>
            {/* Amount Input */}
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={styles.section}
            >
              <ThemedText style={styles.sectionTitle}>{t('walletComponents.amount')}</ThemedText>
              <ThemedView style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0"
                  keyboardType="numeric"
                  style={[styles.amountInput, { color: theme.onSurface }]}
                  placeholderTextColor={theme.onSurface + '40'}
                />
                <ThemedText style={styles.currency}>{selectedProvider.currency}</ThemedText>
              </ThemedView>
              {fees > 0 && (
                <ThemedView style={styles.feeInfo}>
                  <ThemedText style={styles.feeLabel}>{t('walletComponents.fees')}</ThemedText>
                  <ThemedText style={styles.feeAmount}>{formatAmount(fees)}</ThemedText>
                </ThemedView>
              )}
            </MotiView>

            {/* Phone Number */}
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 50 }}
              style={styles.section}
            >
              <ThemedText style={styles.sectionTitle}>
                <Phone size={16} color={theme.onSurface} /> {t('walletComponents.phoneNumber')}
              </ThemedText>
              <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="+225 XX XX XX XX XX"
                  keyboardType="phone-pad"
                  style={[styles.input, { color: theme.onSurface }]}
                  placeholderTextColor={theme.onSurface + '40'}
                />
              </View>
            </MotiView>

            {/* Account Name (optional) */}
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 100 }}
              style={styles.section}
            >
              <ThemedText style={styles.sectionTitle}>
                <User size={16} color={theme.onSurface} /> {t('walletComponents.accountName')}
              </ThemedText>
              <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
                <TextInput
                  value={accountName}
                  onChangeText={setAccountName}
                  placeholder="Jean Dupont"
                  style={[styles.input, { color: theme.onSurface }]}
                  placeholderTextColor={theme.onSurface + '40'}
                />
              </View>
            </MotiView>

            {/* Summary */}
            {amount && phoneNumber && (
              <MotiView
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={[styles.summary, { backgroundColor: theme.success + '10', borderColor: theme.success + '30' }]}
              >
                <ThemedText style={styles.summaryTitle}>{t('walletComponents.summary')}</ThemedText>
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>{t('walletComponents.amount')}</ThemedText>
                  <ThemedText style={styles.summaryValue}>{formatAmount(parseFloat(amount))}</ThemedText>
                </View>
                {fees > 0 && (
                  <View style={styles.summaryRow}>
                    <ThemedText style={styles.summaryLabel}>{t('walletComponents.fees')}</ThemedText>
                    <ThemedText style={styles.summaryValue}>{formatAmount(fees)}</ThemedText>
                  </View>
                )}
                <View style={[styles.summaryRow, styles.summaryTotal]}>
                  <ThemedText style={styles.summaryTotalLabel}>{t('walletComponents.total')}</ThemedText>
                  <ThemedText style={styles.summaryTotalValue}>
                    {formatAmount(parseFloat(amount) + fees)}
                  </ThemedText>
                </View>
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>{t('walletComponents.operator')}</ThemedText>
                  <ThemedText style={styles.summaryValue}>{selectedProvider.name}</ThemedText>
                </View>
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>{t('walletComponents.number')}</ThemedText>
                  <ThemedText style={styles.summaryValue}>{phoneNumber}</ThemedText>
                </View>
              </MotiView>
            )}

            {/* Pay Button */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 150 }}
              style={styles.buttonContainer}
            >
              <TouchableOpacity
                onPress={handlePayment}
                disabled={loading || !amount || !phoneNumber}
                style={{ width: '100%' }}
              >
                <LinearGradient
                  colors={
                    loading || !amount || !phoneNumber
                      ? [theme.outline + '40', theme.outline + '40']
                      : [theme.success, theme.success + 'DD']
                  }
                  style={styles.payButton}
                >
                  <Smartphone size={24} color="white" />
                  <ThemedText style={styles.payButtonText}>
                    {loading ? t('walletComponents.processing') : t('walletComponents.confirmPayment')}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </MotiView>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  providersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  providerCard: {
    width: '48%',
    aspectRatio: 1.2,
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  providerLogo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  providerName: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  providerCountry: {
    fontSize: 11,
    opacity: 0.6,
  },
  checkMark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
  },
  currency: {
    fontSize: 16,
    fontWeight: '700',
    opacity: 0.5,
  },
  feeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  feeLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  feeAmount: {
    fontSize: 12,
    fontWeight: '600',
  },
  summary: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 12,
    marginTop: 4,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  payButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    opacity: 0.5,
  },
});
