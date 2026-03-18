import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useLanguage } from '@/components/contexts/language';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import {
  Home as HomeIcon,
  ArrowLeft,
  Calendar,
  Building2,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PayRentProps {
  onBack: () => void;
  onPayment: (amount: number, description: string, method: string, metadata: any) => Promise<void>;
  balance: number;
  formatAmount: (amount: number) => string;
  paymentMethods: any[];
}

export const PayRent: React.FC<PayRentProps> = ({
  onBack,
  onPayment,
  balance,
  formatAmount,
  paymentMethods
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [amount, setAmount] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert(t('common.error'), t('walletComponents.enterValidAmount'));
      return;
    }

    if (parseFloat(amount) > balance) {
      Alert.alert(t('walletComponents.insufficientBalance'), t('walletComponents.insufficientBalanceMsg'));
      return;
    }

    if (!selectedMethod) {
      Alert.alert(t('common.error'), t('walletComponents.selectPaymentMethod'));
      return;
    }

    try {
      setLoading(true);
      await onPayment(
        parseFloat(amount),
        `${t('walletComponents.payRent')} - ${month}`,
        selectedMethod.id,
        {
          type: 'rent',
          propertyId: propertyId || undefined,
          period: month
        }
      );

      Alert.alert(
        t('walletComponents.payRentSuccess'),
        t('walletComponents.payRentSuccessMsg', { amount: formatAmount(parseFloat(amount)) }),
        [{ text: 'OK', onPress: onBack }]
      );
    } catch (error) {
      Alert.alert(t('common.error'), t('walletScreen.paymentError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.onSurface} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>{t('walletComponents.payRent')}</ThemedText>
          <View style={{ width: 40 }} />
        </View>

        {/* Balance Display */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.balanceCard}
        >
          <LinearGradient
            colors={[theme.primary, theme.secondary || theme.primary + 'DD']}
            style={styles.balanceGradient}
          >
            <HomeIcon size={32} color="white" />
            <ThemedText style={styles.balanceLabel}>{t('walletComponents.availableBalance')}</ThemedText>
            <ThemedText style={styles.balanceAmount}>{formatAmount(balance)}</ThemedText>
          </LinearGradient>
        </MotiView>

        {/* Amount Input */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100 }}
          style={styles.inputSection}
        >
          <ThemedText style={styles.inputLabel}>{t('walletComponents.rentAmount')}</ThemedText>
          <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              style={[styles.input, { color: theme.onSurface }]}
              placeholderTextColor={theme.onSurface + '40'}
            />
            <ThemedText style={styles.currency}>EUR</ThemedText>
          </View>
        </MotiView>

        {/* Property ID (optional) */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 150 }}
          style={styles.inputSection}
        >
          <ThemedText style={styles.inputLabel}>
            <Building2 size={16} color={theme.onSurface} /> {t('walletComponents.propertyRef')}
          </ThemedText>
          <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
            <TextInput
              value={propertyId}
              onChangeText={setPropertyId}
              placeholder="Ex: APT-123"
              style={[styles.input, { color: theme.onSurface }]}
              placeholderTextColor={theme.onSurface + '40'}
            />
          </View>
        </MotiView>

        {/* Month Selection */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200 }}
          style={styles.inputSection}
        >
          <ThemedText style={styles.inputLabel}>
            <Calendar size={16} color={theme.onSurface} /> {t('walletComponents.month')}
          </ThemedText>
          <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
            <TextInput
              value={month}
              onChangeText={setMonth}
              placeholder="YYYY-MM"
              style={[styles.input, { color: theme.onSurface }]}
              placeholderTextColor={theme.onSurface + '40'}
            />
          </View>
        </MotiView>

        {/* Payment Methods */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 250 }}
          style={styles.inputSection}
        >
          <ThemedText style={styles.inputLabel}>{t('walletComponents.paymentMethod')}</ThemedText>
          <View style={styles.paymentMethods}>
            {paymentMethods.length === 0 ? (
              <View style={[styles.emptyState, { borderColor: theme.outline + '30' }]}>
                <AlertCircle size={32} color={theme.onSurface + '40'} />
                <ThemedText style={styles.emptyStateText}>
                  {t('walletComponents.noPaymentMethod')}
                </ThemedText>
              </View>
            ) : (
              paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  onPress={() => setSelectedMethod(method)}
                  style={[
                    styles.paymentMethodCard,
                    {
                      borderColor: selectedMethod?.id === method.id ? theme.primary : theme.outline + '30',
                      backgroundColor: selectedMethod?.id === method.id ? theme.primary + '10' : 'transparent'
                    }
                  ]}
                >
                  <View style={styles.paymentMethodContent}>
                    <View style={[styles.paymentMethodIcon, { backgroundColor: theme.primary + '20' }]}>
                      <CreditCard size={20} color={theme.primary} />
                    </View>
                    <View style={styles.paymentMethodDetails}>
                      <ThemedText style={styles.paymentMethodName}>{method.name}</ThemedText>
                      <ThemedText style={styles.paymentMethodInfo}>
                        •••• {method.last4 || method.details?.last4}
                      </ThemedText>
                    </View>
                  </View>
                  {selectedMethod?.id === method.id && (
                    <CheckCircle2 size={24} color={theme.primary} />
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </MotiView>

        {/* Summary */}
        {amount && selectedMethod && (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={[styles.summary, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}
          >
            <ThemedText style={styles.summaryTitle}>{t('walletComponents.summary')}</ThemedText>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>{t('walletComponents.amount')}</ThemedText>
              <ThemedText style={styles.summaryValue}>{formatAmount(parseFloat(amount))}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>{t('walletComponents.period')}</ThemedText>
              <ThemedText style={styles.summaryValue}>{month}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>{t('walletComponents.method')}</ThemedText>
              <ThemedText style={styles.summaryValue}>{selectedMethod.name}</ThemedText>
            </View>
          </MotiView>
        )}

        {/* Pay Button */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300 }}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            onPress={handlePayment}
            disabled={loading || !amount || !selectedMethod}
            style={{ width: '100%' }}
          >
            <LinearGradient
              colors={
                loading || !amount || !selectedMethod
                  ? [theme.outline + '40', theme.outline + '40']
                  : [theme.success, theme.success + 'DD']
              }
              style={styles.payButton}
            >
              <ThemedText style={styles.payButtonText}>
                {loading ? t('walletComponents.processing') : t('walletComponents.payRentButton')}
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </MotiView>

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
    marginBottom: 24,
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
  balanceCard: {
    marginBottom: 32,
  },
  balanceGradient: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 12,
    marginBottom: 8,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 32,
    fontWeight: '900',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
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
    fontSize: 18,
    fontWeight: '600',
  },
  currency: {
    fontSize: 16,
    fontWeight: '700',
    opacity: 0.5,
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentMethodInfo: {
    fontSize: 13,
    opacity: 0.6,
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
  buttonContainer: {
    marginBottom: 16,
  },
  payButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyState: {
    padding: 32,
    borderWidth: 2,
    borderRadius: 16,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    opacity: 0.5,
    textAlign: 'center',
  },
});
