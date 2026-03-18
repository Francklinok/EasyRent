import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert, Modal } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building2,
  Send,
  User,
  DollarSign,
  CheckCircle2,
  Plus,
  Banknote,
  Wallet
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/components/contexts/language';

interface PaymentMethod {
  id: string;
  type: 'mobile_money' | 'card' | 'bank' | 'paypal' | 'crypto' | 'wallet';
  name: string;
  details: {
    last4?: string;
    phoneNumber?: string;
    email?: string;
    iban?: string;
  };
  icon: any;
  color: string;
}

interface SendPaymentModernProps {
  onBack: () => void;
  onPayment: (amount: number, description: string, method: string, metadata: any) => Promise<void>;
  balance: number;
  formatAmount: (amount: number) => string;
  existingMethods: any[];
}

export const SendPaymentModern: React.FC<SendPaymentModernProps> = ({
  onBack,
  onPayment,
  balance,
  formatAmount,
  existingMethods
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [showMethodSelector, setShowMethodSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [methodTypeToAdd, setMethodTypeToAdd] = useState<'mobile_money' | 'card' | 'bank' | 'paypal'>('card');

  // available payment types
  const availablePaymentTypes = [
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      description: 'Orange Money, MTN, Moov',
      icon: Smartphone,
      color: '#FF9500'
    },
    {
      id: 'card',
      name: t('walletComponents.bankTransfer'),
      description: 'Visa, Mastercard, Amex',
      icon: CreditCard,
      color: '#007AFF'
    },
    {
      id: 'bank',
      name: t('walletComponents.bankTransfer'),
      description: t('walletComponents.bankTransferDesc'),
      icon: Building2,
      color: '#34C759'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: t('walletComponents.securePaypal'),
      icon: Wallet,
      color: '#003087'
    },
    {
      id: 'wallet',
      name: t('walletComponents.mainWallet'),
      description: `${t('walletComponents.walletBalance')}: ${formatAmount(balance)}`,
      icon: Banknote,
      color: '#5856D6'
    }
  ];

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert(t('common.error'), t('walletComponents.enterValidAmount'));
      return;
    }

    if (!recipient) {
      Alert.alert(t('common.error'), t('walletComponents.enterRecipient'));
      return;
    }

    if (!selectedMethod) {
      Alert.alert(t('common.error'), t('walletComponents.selectPaymentMethod'));
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (selectedMethod.type === 'wallet' && paymentAmount > balance) {
      Alert.alert(t('walletComponents.insufficientBalance'), t('walletComponents.insufficientBalanceMsg'));
      return;
    }

    try {
      setLoading(true);
      await onPayment(
        paymentAmount,
        description || `${t('walletComponents.paymentTo')} ${recipient}`,
        selectedMethod.id,
        {
          recipient,
          paymentType: selectedMethod.type,
          methodDetails: selectedMethod.details
        }
      );

      Alert.alert(
        t('walletComponents.paymentSent'),
        t('walletComponents.paymentSentMsg'),
        [{ text: 'OK', onPress: onBack }]
      );
    } catch (error) {
      Alert.alert(t('common.error'), t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const openMethodSelector = (type: string) => {
    Alert.alert(
      t('walletComponents.addMethod'),
      t('walletComponents.addMethodConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('walletComponents.add'),
          onPress: () => {
            if (type === 'mobile_money') {
              Alert.alert('Info', 'Redirection vers l\'ajout Mobile Money');
            } else if (type === 'card') {
              Alert.alert('Info', 'Redirection vers l\'ajout de carte');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.onSurface} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>{t('walletComponents.sendMoney')}</ThemedText>
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
            <Send size={32} color="white" />
            <ThemedText style={styles.balanceLabel}>{t('walletComponents.walletBalance')}</ThemedText>
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
          <ThemedText style={styles.inputLabel}>{t('walletComponents.amount')}</ThemedText>
          <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              style={[styles.amountInput, { color: theme.onSurface }]}
              placeholderTextColor={theme.onSurface + '40'}
            />
            <ThemedText style={styles.currency}>EUR</ThemedText>
          </View>
        </MotiView>

        {/* Recipient Input */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 150 }}
          style={styles.inputSection}
        >
          <ThemedText style={styles.inputLabel}>
            <User size={16} color={theme.onSurface} /> {t('walletComponents.recipient')}
          </ThemedText>
          <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
            <TextInput
              value={recipient}
              onChangeText={setRecipient}
              placeholder={t('walletComponents.recipientPlaceholder')}
              style={[styles.input, { color: theme.onSurface }]}
              placeholderTextColor={theme.onSurface + '40'}
            />
          </View>
        </MotiView>

        {/* Description Input */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200 }}
          style={styles.inputSection}
        >
          <ThemedText style={styles.inputLabel}>{t('walletComponents.descriptionOptional')}</ThemedText>
          <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t('walletComponents.descriptionPlaceholder')}
              style={[styles.input, { color: theme.onSurface }]}
              placeholderTextColor={theme.onSurface + '40'}
              multiline
            />
          </View>
        </MotiView>

        {/* Payment Method Selection */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 250 }}
          style={styles.inputSection}
        >
          <ThemedText style={styles.inputLabel}>{t('walletComponents.paymentMethod')}</ThemedText>

          {selectedMethod ? (
            <TouchableOpacity
              onPress={() => setShowMethodSelector(true)}
              style={[
                styles.selectedMethodCard,
                { borderColor: theme.primary, backgroundColor: theme.primary + '10' }
              ]}
            >
              <View style={styles.selectedMethodContent}>
                <View style={[styles.methodIconContainer, { backgroundColor: selectedMethod.color + '20' }]}>
                  <selectedMethod.icon size={24} color={selectedMethod.color} />
                </View>
                <View style={styles.selectedMethodDetails}>
                  <ThemedText style={styles.selectedMethodName}>{selectedMethod.name}</ThemedText>
                  <ThemedText style={styles.selectedMethodInfo}>
                    {selectedMethod.details.phoneNumber ||
                     selectedMethod.details.last4 ? `•••• ${selectedMethod.details.last4}` :
                     selectedMethod.details.email ||
                     t('walletComponents.mainWallet')}
                  </ThemedText>
                </View>
              </View>
              <CheckCircle2 size={24} color={theme.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setShowMethodSelector(true)}
              style={[styles.selectMethodButton, { borderColor: theme.outline + '30' }]}
            >
              <ThemedText style={styles.selectMethodText}>
                {t('walletComponents.selectMethod')}
              </ThemedText>
              <Plus size={20} color={theme.primary} />
            </TouchableOpacity>
          )}

          {/* Available Payment Types Grid */}
          <View style={styles.paymentTypesGrid}>
            {availablePaymentTypes.map((type, index) => (
              <MotiView
                key={type.id}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 300 + index * 50 }}
                style={styles.paymentTypeWrapper}
              >
                <TouchableOpacity
                  onPress={() => {
                    if (type.id === 'wallet') {
                      setSelectedMethod({
                        id: 'wallet-main',
                        type: 'wallet',
                        name: t('walletComponents.mainWallet'),
                        details: {},
                        icon: type.icon,
                        color: type.color
                      });
                    } else {
                      openMethodSelector(type.id);
                    }
                  }}
                  style={[
                    styles.paymentTypeCard,
                    { backgroundColor: type.color + '10', borderColor: type.color + '30' }
                  ]}
                >
                  <View style={[styles.paymentTypeIcon, { backgroundColor: type.color + '20' }]}>
                    <type.icon size={24} color={type.color} />
                  </View>
                  <ThemedText style={styles.paymentTypeName}>{type.name}</ThemedText>
                  <ThemedText style={styles.paymentTypeDesc}>{type.description}</ThemedText>
                </TouchableOpacity>
              </MotiView>
            ))}
          </View>
        </MotiView>

        {/* Summary */}
        {amount && recipient && selectedMethod && (
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
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>{t('walletComponents.recipient')}</ThemedText>
              <ThemedText style={styles.summaryValue}>{recipient}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>{t('walletComponents.method')}</ThemedText>
              <ThemedText style={styles.summaryValue}>{selectedMethod.name}</ThemedText>
            </View>
          </MotiView>
        )}

        {/* Send Button */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 350 }}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            onPress={handlePayment}
            disabled={loading || !amount || !recipient || !selectedMethod}
            style={{ width: '100%' }}
          >
            <LinearGradient
              colors={
                loading || !amount || !recipient || !selectedMethod
                  ? [theme.outline + '40', theme.outline + '40']
                  : [theme.success, theme.success + 'DD']
              }
              style={styles.sendButton}
            >
              <Send size={24} color="white" />
              <ThemedText style={styles.sendButtonText}>
                {loading ? t('walletComponents.sendingInProgress') : t('walletComponents.sendPayment')}
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
    minHeight: 56,
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
  selectedMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  selectedMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedMethodDetails: {
    flex: 1,
  },
  selectedMethodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedMethodInfo: {
    fontSize: 13,
    opacity: 0.6,
  },
  selectMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  selectMethodText: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.6,
  },
  paymentTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  paymentTypeWrapper: {
    width: '48%',
  },
  paymentTypeCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  paymentTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentTypeName: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  paymentTypeDesc: {
    fontSize: 10,
    opacity: 0.6,
    textAlign: 'center',
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
  sendButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
