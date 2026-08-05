import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { AlertCircle, LogIn, ShieldAlert } from 'lucide-react-native';
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
import { SelectPaymentType } from '@/components/wallets/payment/SelectPaymentType';
import { SelectPaymentMethod } from '@/components/wallets/payment/SelectPaymentMethod';
import { MobileMoneyForm } from '@/components/wallets/payment/MobileMoneyForm';
import { WalletSettings } from '@/components/wallets/WalletSettings';
import { UserAction, PaymentConfig, PaymentMethodType, MobileMoneyConfig } from '@/types/payment';
import { useWallet, useTransactions, usePaymentMethods, useOngoingActivities } from '@/hooks/useWallet';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GraphQLError } from '@/services/api/graphqlService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CardPaymentForm from '@/components/wallets/payment/CardPaymentForm';
import PayPalPaymentForm from '@/components/wallets/payment/PayPalPaymentForm';
import { useWalletHeader, WALLET_SECTION_TITLE_KEYS, WALLET_INVEST_TOKENS_TITLE } from './_layout';
import { useLanguage } from '@/components/contexts/language';
import { WalletErrorScreen } from '@/components/wallets/shared/WalletErrorScreen';
import { onColor } from '@/constants/tokens';

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
  const router = useRouter();
  const { tab: initialTabParam } = useLocalSearchParams<{ tab?: string }>();
  const { setTitle, setOnBackPress, setShowBackButton } = useWalletHeader();
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
    } else if (currentSection === 'invest-tokens') {
      setTitle(WALLET_INVEST_TOKENS_TITLE);
    } else {
      const titleKey = WALLET_SECTION_TITLE_KEYS[currentSection];
      setTitle(titleKey ? t(titleKey as any) : t('walletComponents.wallet'));
    }
  }, [currentSection, setTitle, t]);

  // Le bouton retour n'apparaît que hors de l'écran racine (currentSection
  // === 'main') : l'onglet Wallet est un point d'entrée de la tab bar, un
  // retour n'y a de sens que sur les sous-sections.
  useEffect(() => {
    setShowBackButton(currentSection !== 'main');
  }, [currentSection, setShowBackButton]);

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

  //handle crypto buy/sell — appelle réellement buyCrypto/sellCrypto (débit/crédit
  // effectif de wallet.cryptoBalances), pas une transaction générique factice.
  const handleCryptoTransfer = async (amount: number, currency: string, type: 'buy' | 'sell', paymentMethodId?: string) => {
    try {
      const { getWalletService } = await import('@/services/api/walletService');
      const walletSvc = getWalletService();
      const transaction = type === 'buy'
        ? await walletSvc.buyCrypto(currency, amount, paymentMethodId || '')
        : await walletSvc.sellCrypto(currency, amount, paymentMethodId);

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
    } catch (error: any) {
      console.error('Error processing crypto transfer:', error);
      Alert.alert(t('common.error'), error?.message || t('walletScreen.cryptoError'));
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
      const { getWalletService } = await import('@/services/api/walletService');
      const walletSvc = getWalletService();

      const paymentCode = await walletSvc.createPaymentCode({
        amount: paymentData.amount,
        description: paymentData.description,
        propertyRef: paymentData.propertyRef,
        tenantEmail: paymentData.tenantEmail,
        dueDate: paymentData.dueDate,
        type: paymentData.type,
        allowedMethods: paymentData.allowedMethods,
      });

      await refreshWallet();

      Alert.alert(
        t('walletScreen.codeCreated'),
        t('walletScreen.codeCreatedMsg', { code: paymentCode.code, amount: formatAmount(paymentData.amount) })
      );

      return { ...paymentCode, id: paymentCode.codeId };
    } catch (error) {
      console.error('Error creating payment code:', error);
      Alert.alert(t('common.error'), t('walletScreen.codeError'));
      throw error;
    }
  };

  const handleVerifyPaymentCode = async (code: string) => {
    try {
      const { getWalletService } = await import('@/services/api/walletService');
      const walletSvc = getWalletService();

      const paymentDetails = await walletSvc.verifyPaymentCode(code);

      return {
        id: paymentDetails.codeId,
        code: paymentDetails.code,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        description: paymentDetails.description,
        propertyRef: paymentDetails.propertyRef,
        status: paymentDetails.status,
        allowedMethods: paymentDetails.allowedMethods,
        createdAt: new Date().toISOString(),
        expiresAt: paymentDetails.expiresAt
      };
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

  // Paiement carte réel : le token Stripe (cardData.stripePaymentMethodId) est
  // transmis au PaymentIntent adossé à la facture de l'action sélectionnée —
  // processUnifiedPayment/createTransaction ne font ni vrai appel Stripe ni
  // lien avec une facture, ce composant utilisait un flux générique factice.
  const handleCardConfirm = async (cardData: { stripePaymentMethodId: string; cardholderName: string; brand: string; last4: string }) => {
    if (!selectedAction?.metadata?.invoiceId) {
      Alert.alert(t('common.error'), t('walletScreen.cardPaymentError'));
      return;
    }

    try {
      setIsCardProcessing(true);
      const { getWalletService } = await import('@/services/api/walletService');
      const result = await getWalletService().initiatePayment({
        invoiceId: selectedAction.metadata.invoiceId,
        paymentMethod: 'card',
        cardData: { stripePaymentMethodId: cardData.stripePaymentMethodId },
      });

      if (!result.success) {
        throw new Error(result.error || t('walletScreen.cardPaymentError'));
      }

      await refreshWallet();
      await refreshTransactions();
      setCurrentSection('main');
      setSelectedAction(null);

      if (result.nextAction?.type === 'use_stripe_sdk') {
        Alert.alert(t('walletComponents.confirmOnPhone'), result.nextAction.instructions || t('walletComponents.confirmOnPhoneMsg'));
      } else {
        Alert.alert(t('common.success'), t('walletScreen.paymentSuccessMsg', { amount: formatAmount(selectedAction.amount, selectedAction.currency) }));
      }
    } catch (error: any) {
      console.error('Error processing card payment:', error);
      Alert.alert(t('common.error'), error?.message || t('walletScreen.cardPaymentError'));
    } finally {
      setIsCardProcessing(false);
    }
  };

  // Paiement PayPal réel : crée une commande PayPal via le PaymentIntent
  // adossé à la facture, puis ouvre l'URL d'approbation retournée par PayPal
  // (nextAction.redirectUrl) — auparavant createTransaction ne créait ni
  // commande PayPal ni lien avec une facture.
  const handlePayPalConfirm = async () => {
    if (!selectedAction?.metadata?.invoiceId) {
      Alert.alert(t('common.error'), t('walletScreen.paypalPaymentError'));
      return;
    }

    try {
      setIsPayPalProcessing(true);
      const { getWalletService } = await import('@/services/api/walletService');
      const result = await getWalletService().initiatePayment({
        invoiceId: selectedAction.metadata.invoiceId,
        paymentMethod: 'paypal',
      });

      if (!result.success) {
        throw new Error(result.error || t('walletScreen.paypalPaymentError'));
      }

      if (result.nextAction?.type === 'redirect_to_url' && result.nextAction.redirectUrl) {
        const { openBrowserAsync } = await import('expo-web-browser');
        await openBrowserAsync(result.nextAction.redirectUrl);
      }

      await refreshWallet();
      await refreshTransactions();
      setCurrentSection('main');
      setSelectedAction(null);
      Alert.alert(t('common.success'), t('walletScreen.paymentSuccessMsg', { amount: formatAmount(selectedAction.amount, selectedAction.currency) }));
    } catch (error: any) {
      console.error('Error processing PayPal payment:', error);
      Alert.alert(t('common.error'), error?.message || t('walletScreen.paypalPaymentError'));
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
      <WalletErrorScreen
        icon={ShieldAlert}
        tone="error"
        title={t('walletScreen.authRequired')}
        messages={[t('walletScreen.authRequiredMsg')]}
        primaryAction={{
          label: t('walletScreen.login'),
          onPress: () => router.push('/Auth/Login'),
          icon: <LogIn size={20} color={onColor} />,
        }}
        onBack={() => router.back()}
        backLabel={t('common.back')}
      />
    );
  }

  if (walletError && !wallet && isNetworkError(walletError)) {
    return (
      <WalletErrorScreen
        icon={AlertCircle}
        tone="warning"
        title={t('walletScreen.connectionProblem')}
        messages={[t('walletScreen.connectionErrorMsg'), t('walletScreen.checkConnection')]}
        primaryAction={{ label: t('common.retry'), onPress: refreshWallet }}
        onBack={() => router.back()}
        backLabel={t('common.back')}
      />
    );
  }

  if (walletError && !wallet) {
    return (
      <WalletErrorScreen
        icon={AlertCircle}
        tone="error"
        title={t('walletScreen.errorOccurred')}
        messages={[walletError]}
        primaryAction={{ label: t('common.retry'), onPress: refreshWallet }}
        onBack={() => router.back()}
        backLabel={t('common.back')}
      />
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
      userId={userId}
      initialTab={initialTabParam === 'tokens' ? 'tokens' : undefined}
    />
  );

  const renderCryptoSection = (
    <RenderCrypto
      walletData={walletData}
      selectedCurrency={selectedCurrency}
      formatAmount={formatAmount}
      showBalance={showBalance}
      setCurrentSection={setCurrentSection}
      handleCryptoTransfer={(amount: number, currency: string, action: TransactionAction, paymentMethodId?: string) =>
        handleCryptoTransfer(amount, currency, action as 'buy' | 'sell', paymentMethodId)}
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
 
         
  const  renderCardPayment = selectedAction ? (
   <CardPaymentForm
          renderAsPage={true}
          onBack={() => setCurrentSection('select-payment-method')}
          onConfirm={handleCardConfirm}
          amount={selectedAction.amount}
          currency={selectedAction.currency}
          isLoading={isCardProcessing}
        />
  ) : null

  const  renderPaypalPayment = selectedAction ? (
 <PayPalPaymentForm
          renderAsPage={true}
          onBack={() => setCurrentSection('select-payment-method')}
          onConfirm={handlePayPalConfirm}
          amount={selectedAction.amount}
          currency={selectedAction.currency}
          isLoading={isPayPalProcessing}
        />
  ) : null

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
      // Redirige vers le flow d'ajout de méthode existant (SelectPaymentType → SelectPaymentMethod)
      // plutôt que l'Alert.alert factice précédent qui ne menait nulle part.
      onAddMethod={() => setCurrentSection('payment')}
    />
  );

  const renderCreatePaymentCode = (
    <CreatePaymentCode
      onBack={() => setCurrentSection('main')}
      onCreate={handleCreatePaymentCode}
      formatAmount={formatAmount}
    />
  );

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
      case 'paypal-form':
        return renderPaypalPayment;
      case 'create-payment-code':
        return renderCreatePaymentCode;
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
    <ThemedView style={{ flex: 1 }}>
      {renderSection()}
    </ThemedView>
  );
}

export default WalletPortfolio
