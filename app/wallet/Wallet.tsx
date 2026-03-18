import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, ScrollView, Image, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { Settings, Plus, Bitcoin, Home, Clock, AlertCircle, LogIn, ShieldAlert } from 'lucide-react-native';
import _ from 'lodash';
import RenderCrypto from '@/components/wallets/RenderCrypto';
import RenderSecuritySettings from '@/components/wallets/RenderSecuritySetting';
import RenderTransactions from '@/components/wallets/RenderTransaction';
import RenderTransactionDetail from '@/components/wallets/RenderTransactionDetails';
import { InvestmentTokensSection } from '@/components/wallets/InvestmentTokensSection';
import { SendPaymentModern } from '@/components/wallets/SendPaymentModern';
import { WalletHome } from '@/components/wallets/WalletHomes';
import { PayRent } from '@/components/wallets/PayRent';
import { MobileMoney } from '@/components/wallets/MobileMoney';
import { ReceivePayment } from '@/components/wallets/ReceivePayment';
import { CreatePaymentCode } from '@/components/wallets/CreatePaymentCode';
// import { PayWithCode } from '@/components/wallets/PayWithCode';
import { SelectPaymentType } from '@/components/wallets/payment/SelectPaymentType';
import { SelectPaymentMethod } from '@/components/wallets/payment/SelectPaymentMethod';
import { MobileMoneyForm } from '@/components/wallets/payment/MobileMoneyForm';
import { WalletSettings } from '@/components/wallets/WalletSettings';
import { UserAction, PaymentConfig, PaymentMethodType, MobileMoneyConfig } from '@/types/payment';
import { useWallet, useTransactions, usePaymentMethods, useOngoingActivities } from '@/hooks/useWallet';
import { useRouter } from 'expo-router';
import { GraphQLError } from '@/services/api/graphqlService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CardPaymentForm from '@/components/wallets/payment/CardPaymentForm';
import PayPalPaymentForm from '@/components/wallets/payment/PayPalPaymentForm';
import { useWalletHeader, WALLET_SECTION_TITLES } from './_layout';
import { useLanguage } from '@/components/contexts/language';

type TransactionAction = 'buy' | 'sell' | 'transfer';
type TransactionType = 'payment' | 'received' | 'crypto';


type TransactionHistory = {
  id: number;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending';
  cryptoCurrency?: string;
  method?: string;
};

type ExpandedSections = {
  transactions: boolean;
  payment: boolean;
  crypto: boolean;
  settings: boolean;
};

// Principal component
const WalletPortfolio = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const { setTitle, setOnBackPress } = useWalletHeader();
  const { t } = useLanguage();

  const { wallet, loading: walletLoading, error: walletError, refresh: refreshWallet } = useWallet();
  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    refresh: refreshTransactions,
    createTransaction,
    transferMoney
  } = useTransactions({}, 50);
  const { paymentMethods, loading: paymentMethodsLoading, refresh: refreshPaymentMethods } = usePaymentMethods();

  //hook for ongoing activities
  const {
    activities: ongoingActivities,
    loading: activitiesLoading,
    byType: activitiesByType,
    refresh: refreshActivities
  } = useOngoingActivities();

  //local states
  const [showBalance, setShowBalance] = useState(true);
  const [expanded, setExpanded] = useState<ExpandedSections>({
    transactions: false,
    payment: false,
    crypto: false,
    settings: false
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [currentSection, setCurrentSection] = useState('main');
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [userId, setUserId] = useState<string>('');

  // state for payment flow
  const [selectedAction, setSelectedAction] = useState<UserAction | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentConfig | PaymentMethodType | null>(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentMethodType | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('EUR');
  const [isCardProcessing, setIsCardProcessing] = useState(false);
  const [isPayPalProcessing, setIsPayPalProcessing] = useState(false);

  useEffect(() => {
    const loadUserId = async () => {
      const id = await AsyncStorage.getItem('@user_id');
      if (id) setUserId(id);
    };
    loadUserId();
  }, []);

  useEffect(() => {
    if (wallet?.userId) {
      console.log('✅ Wallet loaded, setting userId:', wallet.userId);
      setUserId(wallet.userId);
    }
  }, [wallet]);

  // Update header title when the section changes
  useEffect(() => {
    // Handle dynamic sections (transaction-detail-xxx)
    if (currentSection.startsWith('transaction-detail-')) {
      setTitle(t('walletScreen.transactionDetail'));
    } else if (currentSection.startsWith('activity-detail-')) {
      setTitle(t('walletScreen.activityDetail'));
    } else {
      const title = WALLET_SECTION_TITLES[currentSection] || 'Wallet';
      setTitle(title);
    }
  }, [currentSection, setTitle]);

  // Update back button callback based on current section
  useEffect(() => {
    const getBackCallback = (): (() => void) | undefined => {
      switch (currentSection) {
        case 'payment':
          return () => setCurrentSection('main');
        case 'select-payment-method':
          return () => setCurrentSection('payment');
        case 'mobile-money-form':
        case 'configure-mobile-money':
          return () => setCurrentSection('select-payment-method');
        case 'bank-card-form':
        case 'configure-bank-card':
          return () => setCurrentSection('select-payment-method');
        case 'paypal-form':
        case 'configure-paypal':
          return () => setCurrentSection('select-payment-method');
        case 'direct-payment':
        case 'pay-rent':
        case 'mobile-money':
        case 'crypto':
        case 'receive':
        case 'qr-payment':
        case 'create-payment-code':
        case 'security':
        case 'settings':
        case 'transactions':
        case 'invest-tokens':
          return () => setCurrentSection('main');
        default:
          if (currentSection.startsWith('transaction-detail-') || currentSection.startsWith('activity-detail-')) {
            return () => setCurrentSection('transactions');
          }
          return undefined;
      }
    };

    const backCallback = getBackCallback();
    if (backCallback && setOnBackPress) {
      setOnBackPress(backCallback);
    }
  }, [currentSection, setOnBackPress]);

  // detect errors 
  const isAuthenticationError = (error: string | null): boolean => {
    if (!error) return false;
    const lowerError = error.toLowerCase();
    return lowerError.includes('authentication required') ||
      lowerError.includes('not authenticated') ||
      lowerError.includes('unauthorized') ||
      lowerError.includes('unauthenticated');
  };

  const isNetworkError = (error: string | null): boolean => {
    if (!error) return false;
    const lowerError = error.toLowerCase();
    return lowerError.includes('network') ||
      lowerError.includes('econnrefused') ||
      lowerError.includes('connection') ||
      lowerError.includes('timeout');
  };

  const transactionHistory: TransactionHistory[] = transactions.map(t => {
    const d = t.createdAt ? new Date(t.createdAt) : null;
    const date = d && !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
    return {
      id: parseInt(t.id),
      type: t.type as TransactionType,
      amount: t.amount,
      description: t.description,
      date,
      status: t.status === 'completed' ? 'completed' : 'pending',
      cryptoCurrency: t.cryptoCurrency,
      method: t.paymentMethodId
    };
  });

  const walletData = {
    balance: wallet?.balance || 0,
    pendingBalance: wallet?.pendingBalance || 0,
    cryptoBalances: wallet?.cryptoBalances?.map(cb => ({
      currency: cb.currency,
      amount: cb.amount,
      value: cb.value
    })) || [
        { currency: 'BTC', amount: 0, value: 0 },
        { currency: 'ETH', amount: 0, value: 0 },
        { currency: 'SOL', amount: 0, value: 0 }
      ],
    paymentMethods: paymentMethods.map(pm => ({
      id: parseInt(pm.id),
      type: pm.type,
      name: pm.name,
      last4: pm.details.last4 || '',
      expiry: pm.details.expiry,
      iban: pm.details.iban
    }))
  };

  //format amount based on currency
  const formatAmount = (amount: number, currency: string = selectedCurrency) => {
    if (currency === 'EUR') return `${amount.toFixed(2)} €`;
    if (currency === 'FCFA') return `${amount.toFixed(2)} FCFA`;
    if (currency === 'USD') return `$${amount.toFixed(2)}$ `;
    return `${amount.toFixed(2)} ${currency}`;
  };

  // handle new payment 
  const handleNewPayment = async (amount: number, description: string, method: string) => {
    try {
      const transaction = await createTransaction({
        type: 'payment',
        amount,
        description,
        currency: selectedCurrency,
        paymentMethodId: method
      });

      if (transaction) {
        //refresh data
        await refreshWallet();
        await refreshTransactions();

        setCurrentSection('main');

        // notification
        Alert.alert(t('walletScreen.paymentSuccess'), t('walletScreen.paymentSuccessMsg', { amount: formatAmount(amount) }));
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert(t('common.error'), t('walletScreen.paymentError'));
    }
  };

  //handle crypto transfert
  const handleCryptoTransfer = async (amount: number, currency: string, type: 'buy' | 'sell') => {
    try {
      const transaction = await createTransaction({
        type: 'crypto',
        amount,
        description: type === 'buy' ? `Achat ${currency}` : `Vente ${currency}`,
        currency: selectedCurrency,
        cryptoCurrency: currency as 'BTC' | 'ETH' | 'LTC' | 'BCH' | 'XRP' | 'ADA' | 'DOT'
      });

      if (transaction) {
        await refreshWallet();
        await refreshTransactions();

        setCurrentSection('main');

        Alert.alert(
          t('walletScreen.transactionSuccess'),
          type === 'buy'
            ? t('walletScreen.cryptoBuyMsg', { amount: String(amount), currency })
            : t('walletScreen.cryptoSellMsg', { amount: String(amount), currency })
        );
      }
    } catch (error) {
      console.error('Error processing crypto transfer:', error);
      Alert.alert(t('common.error'), t('walletScreen.cryptoError'));
    }
  };

  // Create payment code
  const handleCreatePaymentCode = async (paymentData: {
    amount: number;
    description: string;
    propertyRef?: string;
    tenantEmail?: string;
    dueDate?: string;
    type: string;
    status: string;
    allowedMethods: string[];
  }) => {
    try {
      // generate unique  code 
      const code = `PAY-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const paymentCode = {
        id: Date.now().toString(),
        code,
        ...paymentData,
        createdAt: new Date().toISOString(),
        expiresAt: paymentData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

    
      await refreshWallet();

      Alert.alert(
        t('walletScreen.codeCreated'),
        t('walletScreen.codeCreatedMsg', { code, amount: formatAmount(paymentData.amount) })
      );

      return paymentCode;
    } catch (error) {
      console.error('Error creating payment code:', error);
      Alert.alert(t('common.error'), t('walletScreen.codeError'));
      throw error;
    }
  };

  const handleVerifyPaymentCode = async (code: string) => {
    try {

      const mockPaymentDetails = {
        id: '123',
        code,
        amount: 15000,
        currency: 'XOF',
        description: 'Loyer Janvier 2025',
        propertyRef: 'Villa A, Appart 12',
        status: 'pending',
        allowedMethods: ['mobile_money', 'card', 'bank', 'paypal', 'wallet'],
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      return mockPaymentDetails;
    } catch (error) {
      console.error('Error verifying payment code:', error);
      Alert.alert(t('common.error'), t('walletScreen.codeInvalid'));
      throw error;
    }
  };

  const handlePayWithCode = async (code: string, paymentMethodId: string) => {
    try {
      const paymentDetails = await handleVerifyPaymentCode(code);

      const transaction = await createTransaction({
        type: 'payment',
        amount: paymentDetails.amount,
        description: `${paymentDetails.description} (Code: ${code})`,
        currency: selectedCurrency,
        paymentMethodId
      });

      if (transaction) {
        await refreshWallet();
        await refreshTransactions();

        setCurrentSection('main');

        Alert.alert(
          t('walletScreen.paymentSuccess'),
          t('walletScreen.codePaymentMsg', { amount: formatAmount(paymentDetails.amount), code })
        );
      }
    } catch (error) {
      console.error('Error processing code payment:', error);
      Alert.alert(t('common.error'), t('walletScreen.paymentError'));
      throw error;
    }
  };

  const handleCardConfirm = async (cardData: any) => {
    try {
      setIsCardProcessing(true);
      const transaction = await createTransaction({
        type: 'payment',
        amount,
        description: t('walletScreen.cardPaymentDesc'),
        currency,
        paymentMethodId: cardData.id || ''
      });

      if (transaction) {
        await refreshWallet();
        await refreshTransactions();
        setCurrentSection('main');
        Alert.alert(t('common.success'), t('walletScreen.paymentSuccessMsg', { amount: formatAmount(amount, currency) }));
      }
    } catch (error) {
      console.error('Error processing card payment:', error);
      Alert.alert(t('common.error'), t('walletScreen.cardPaymentError'));
    } finally {
      setIsCardProcessing(false);
    }
  };

  const handlePayPalConfirm = async (paypalData: any) => {
    try {
      setIsPayPalProcessing(true);
      const transaction = await createTransaction({
        type: 'payment',
        amount,
        description: t('walletScreen.paypalPaymentDesc'),
        currency,
        paymentMethodId: paypalData.id || ''
      });

      if (transaction) {
        await refreshWallet();
        await refreshTransactions();
        setCurrentSection('main');
        Alert.alert(t('common.success'), t('walletScreen.paymentSuccessMsg', { amount: formatAmount(amount, currency) }));
      }
    } catch (error) {
      console.error('Error processing PayPal payment:', error);
      Alert.alert(t('common.error'), t('walletScreen.paypalPaymentError'));
    } finally {
      setIsPayPalProcessing(false);
    }
  };

  const toggleExpand = (section: keyof ExpandedSections) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (walletError && !wallet && isAuthenticationError(walletError)) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <ThemedView style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: theme.error + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24
          }}>
            <ShieldAlert size={48} color={theme.error} />
          </ThemedView>

          <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
            {t('walletScreen.authRequired')}
          </ThemedText>

          <ThemedText style={{ fontSize: 16, textAlign: 'center', marginBottom: 32, opacity: 0.7, paddingHorizontal: 20 }}>
            {t('walletScreen.authRequiredMsg')}
          </ThemedText>

          <TouchableOpacity
            onPress={() => router.push('/Auth/Login')}
            style={{
              backgroundColor: theme.primary,
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4.65,
              elevation: 8,
            }}
          >
            <LogIn size={20} color="white" />
            <ThemedText style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
              {t('walletScreen.login')}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              marginTop: 16,
              paddingVertical: 12
            }}
          >
            <ThemedText style={{ color: theme.primary, fontWeight: '600', fontSize: 14 }}>
              {t('common.back')}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  }

  if (walletError && !wallet && isNetworkError(walletError)) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <ThemedView style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: theme.warning + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24
          }}>
            <AlertCircle size={48} color={theme.warning} />
          </ThemedView>

          <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
            {t('walletScreen.connectionProblem')}
          </ThemedText>

          <ThemedText style={{ fontSize: 16, textAlign: 'center', marginBottom: 8, opacity: 0.7, paddingHorizontal: 20 }}>
            {t('walletScreen.connectionErrorMsg')}
          </ThemedText>

          <ThemedText style={{ fontSize: 14, textAlign: 'center', marginBottom: 32, opacity: 0.5, paddingHorizontal: 20 }}>
            {t('walletScreen.checkConnection')}
          </ThemedText>

          <TouchableOpacity
            onPress={refreshWallet}
            style={{
              backgroundColor: theme.primary,
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderRadius: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4.65,
              elevation: 8,
            }}
          >
            <ThemedText style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
              {t('common.retry')}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              marginTop: 16,
              paddingVertical: 12
            }}
          >
            <ThemedText style={{ color: theme.primary, fontWeight: '600', fontSize: 14 }}>
              {t('common.back')}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  }

  if (walletError && !wallet) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <ThemedView style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: theme.error + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24
          }}>
            <AlertCircle size={48} color={theme.error} />
          </ThemedView>

          <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
            {t('walletScreen.errorOccurred')}
          </ThemedText>

          <ThemedText style={{ fontSize: 14, textAlign: 'center', marginBottom: 32, opacity: 0.7, paddingHorizontal: 20 }}>
            {walletError}
          </ThemedText>

          <TouchableOpacity
            onPress={refreshWallet}
            style={{
              backgroundColor: theme.primary,
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderRadius: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4.65,
              elevation: 8,
            }}
          >
            <ThemedText style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
              {t('common.retry')}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              marginTop: 16,
              paddingVertical: 12
            }}
          >
            <ThemedText style={{ color: theme.primary, fontWeight: '600', fontSize: 14 }}>
              {t('common.back')}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  }

  const handleWalletNavigate = (section: string) => {
    if (section === 'invest-rst') {
      router.push('/invest/rst' as any);
    } else if (section === 'invest-spv') {
      router.push('/invest/spv' as any);
    } else {
      setCurrentSection(section);
    }
  };

  const renderMainSection = (
    <WalletHome
      balance={walletData.balance}
      pendingBalance={walletData.pendingBalance}
      currency={selectedCurrency}
      formatAmount={formatAmount}
      onNavigate={handleWalletNavigate}
      transactions={transactions}
      walletData={walletData}
      ongoingActivities={ongoingActivities}
      activitiesLoading={activitiesLoading}
      activitiesByType={activitiesByType}
    />
  );

  const renderCryptoSection = (
    <RenderCrypto
      walletData={walletData}
      selectedCurrency={selectedCurrency}
      formatAmount={formatAmount}
      showBalance={showBalance}
      setCurrentSection={setCurrentSection}
      handleCryptoTransfer={(amount: number, currency: string, action: TransactionAction) =>
        handleCryptoTransfer(amount, currency, action as 'buy' | 'sell')}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );

  const renderReceivePayment = (
    <ReceivePayment
      onBack={() => setCurrentSection('main')}
      userId={userId}
      formatAmount={formatAmount}
    />
  );

  const renderPayRent = (
    <PayRent
      onBack={() => setCurrentSection('main')}
      onPayment={handleNewPayment}
      balance={walletData.balance}
      formatAmount={formatAmount}
      paymentMethods={walletData.paymentMethods}
    />
  );

  const renderMobileMoney = (
    <MobileMoney
      onBack={() => setCurrentSection('main')}
      onPayment={handleNewPayment}
      balance={walletData.balance}
      formatAmount={formatAmount}
    />
  );
 
         
  const  renderCardPayment = (
   <CardPaymentForm
          renderAsPage={true}
          onBack={() => setCurrentSection('main')}
          onConfirm={handleCardConfirm}
          amount={amount}
          currency={currency}
          isLoading={isCardProcessing}
        />
  )

  const  renderPaypalPayment = (
 <PayPalPaymentForm
          renderAsPage={true}
          onBack={() => setCurrentSection('main')}
          onConfirm={handlePayPalConfirm}
          amount={amount}
          currency={currency}
          isLoading={isPayPalProcessing}
        />
  )

  const renderQRPayment = renderReceivePayment;

  const renderSecuritySettings = (
    <RenderSecuritySettings
      setCurrentSection={setCurrentSection}
      selectedCurrency={selectedCurrency}
      setSelectedCurrency={setSelectedCurrency}
    />
  );

  const renderTransactions = (
    <RenderTransactions
      setCurrentSection={setCurrentSection}
      formatAmount={formatAmount}
      transactionHistory={transactionHistory}
    />
  );

  const renderSendPaymentSection = (
    <SendPaymentModern
      onBack={() => setCurrentSection('main')}
      onPayment={handleNewPayment}
      balance={walletData.balance}
      formatAmount={formatAmount}
      existingMethods={walletData.paymentMethods}
    />
  );

  const renderCreatePaymentCode = (
    <CreatePaymentCode
      onBack={() => setCurrentSection('main')}
      onCreate={handleCreatePaymentCode}
      formatAmount={formatAmount}
    />
  );

  // const renderPayWithCode = (
  //   <PayWithCode
  //     onBack={() => setCurrentSection('main')}
  //     onVerifyCode={handleVerifyPaymentCode}
  //     onPay={handlePayWithCode}
  //     formatAmount={formatAmount}
  //     balance={walletData.balance}
  //   />
  // );

  const renderSelectPaymentType = (
    <SelectPaymentType
      userId={userId}
      onSelect={(action) => {
        setSelectedAction(action);
        setCurrentSection('select-payment-method');
      }}
      onBack={() => setCurrentSection('main')}
    />
  );

  const renderSelectPaymentMethod = selectedAction ? (
    <SelectPaymentMethod
      action={selectedAction}
      onSelect={(method) => {
        setSelectedMethod(method);
        // find methode type
        const methodType = typeof method === 'string' ? method : method.type;
        setSelectedPaymentType(methodType);

        // navigate to appropriate form
        switch (methodType) {
          case 'mobile_money':
            setCurrentSection('mobile-money-form');
            break;
          case 'bank_card':
            setCurrentSection('bank-card-form');
            break;
          case 'paypal':
            setCurrentSection('paypal-form');
            break;
        }
      }}
      onBack={() => setCurrentSection('payment')}
    />
  ) : null;

  const renderMobileMoneyForm = selectedAction ? (
    <MobileMoneyForm
      action={selectedAction}
      existingConfig={
        selectedMethod && typeof selectedMethod !== 'string' && selectedMethod.type === 'mobile_money'
          ? selectedMethod as MobileMoneyConfig
          : undefined
      }
      onBack={() => setCurrentSection('select-payment-method')}
      onSuccess={() => {
        setCurrentSection('main');
        setSelectedAction(null);
        setSelectedMethod(null);
        setSelectedPaymentType(null);
        refreshWallet();
        refreshTransactions();
      }}
    />
  ) : null;

  const renderWalletSettings = (
    <WalletSettings
      onBack={() => setCurrentSection('main')}
      onConfigureMethod={(type) => {
        setSelectedPaymentType(type);
        switch (type) {
          case 'mobile_money':
            setCurrentSection('configure-mobile-money');
            break;
          case 'bank_card':
            setCurrentSection('configure-bank-card');
            break;
          case 'paypal':
            setCurrentSection('configure-paypal');
            break;
        }
      }}
    />
  );

// Render section based on currentSection state
  const renderSection = () => {
    switch (currentSection) {
      case 'main':
        return renderMainSection;
      case 'crypto':
        return renderCryptoSection;
      case 'receive':
      case 'qr-payment':
        return renderReceivePayment;
      case 'payment':
        return renderSelectPaymentType;
      case 'direct-payment':
        return renderSendPaymentSection;
      case 'pay-rent':
        return renderPayRent;
      case 'mobile-money':
        return renderMobileMoney;
      case 'bank-card-form':
        return renderCardPayment;
        case'paypal-form':
        return renderPaypalPayment;
      case 'create-payment-code':
        return renderCreatePaymentCode;
      // case 'pay-with-code':
      //   return renderPayWithCode;
      case 'security':
        return renderSecuritySettings;
      case 'settings':
        return renderWalletSettings;
      case 'select-payment-method':
        return renderSelectPaymentMethod;
      case 'mobile-money-form':
        return renderMobileMoneyForm;
      case 'configure-mobile-money':
        return renderMobileMoneyForm;
      case 'transactions':
        return renderTransactions;

      case 'invest-tokens':
        return (
          <InvestmentTokensSection
            onNavigateToTrade={(token) => {
              router.push({
                pathname: '/trade',
                params: {
                  tokenSymbol: token.symbol,
                  tokenType: token.type,
                  projectId: token.projectId,
                  action: 'sell',
                },
              } as any);
            }}
          />
        );

      default:
        // Dynamic transaction detail management
        if (currentSection.startsWith('transaction-detail-')) {
          const transactionId = currentSection.split('-').pop();
          return (
            <RenderTransactionDetail
              transactionId={transactionId}
              setCurrentSection={setCurrentSection}
              formatAmount={formatAmount}
              transactionHistory={transactionHistory}
            />
          );
        }
        // Navigate to ContratScreen for paid reservations
        if (currentSection.startsWith('activity-detail-')) {
          const activityId = currentSection.replace('activity-detail-', '');
          const ongoingActivity = ongoingActivities.find((a: any) => a.id === activityId);
          if (ongoingActivity && ongoingActivity.paymentStatus === 'paid' && ongoingActivity.type === 'reservation') {
            router.push({
              pathname: '/contrat/ContratScreen',
              params: { activityId: ongoingActivity.referenceId || activityId, paymentStatus: 'completed' }
            } as any);
            setCurrentSection('main');
          }
        }
        // Fallback
        return renderMainSection;
    }
  };
  return (
    <ThemedView className="flex-1 ,pt-10">
      {renderSection()}
    </ThemedView>)
}

const styles = StyleSheet.create({
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  mainAction: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default WalletPortfolio
