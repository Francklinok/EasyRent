import React, { useState, useEffect } from 'react';
import {Text, TouchableOpacity, ScrollView, Image, StyleSheet,SafeAreaView, TextInput, Alert } from 'react-native';
import { useTheme } from '@/components/contexts/theme/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import {Settings,  Plus, Bitcoin , Home, Clock} from 'lucide-react-native';
import _ from 'lodash';
import RenderCrypto from '@/components/wallets/RenderCrypto';
import RenderMainDashboard from '@/components/wallets/RenderMainDashboard';
import RenderReceivePayment from '@/components/wallets/RenderReceivePayement';
import RenderSecuritySettings from '@/components/wallets/RenderSecuritySetting';
import RenderTransactions from '@/components/wallets/RenderTransaction';
import RenderTransactionDetail from '@/components/wallets/RenderTransactionDetails';
import RenderSendPayment from '@/components/wallets/RenderPayement';


type TransactionType = 'payment' | 'received' | 'crypto';


type TransactionHistory = {
  id: number; 
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending';
  cryptoCurrency?: string;
};

type ExpandedSections = {
  transactions: boolean;
  payment: boolean;
  crypto: boolean;
  settings: boolean;
};

// Composant principal du portefeuille
const  WalletPortfolio = () => {
  const { theme } = useTheme();
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
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>([
    { id: 1, type: 'payment', amount: 1200, description: 'Caution Appartement', date: '2025-04-18', status: 'completed' },
    { id: 2, type: 'received', amount: 350, description: 'Remboursement travaux', date: '2025-04-15', status: 'completed' },
    { id: 3, type: 'crypto', amount: 0.015, description: 'Achat BTC', date: '2025-04-10', status: 'completed', cryptoCurrency: 'BTC' },
    { id: 4, type: 'payment', amount: 750, description: 'Loyer Avril', date: '2025-04-01', status: 'completed' },
    { id: 5, type: 'payment', amount: 250, description: 'Acompte réservation', date: '2025-03-28', status: 'pending' }
  ]);


  const [walletData, setWalletData] = useState({
    balance: 3580.45,
    pendingBalance: 250,
    cryptoBalances: [
      { currency: 'BTC', amount: 0.042, value: 2451.30 },
      { currency: 'ETH', amount: 1.23, value: 1855.75 },
      { currency: 'SOL', amount: 15.5, value: 984.23 }
    ],
    paymentMethods: [
      { id: 1, type: 'card', name: 'Visa', last4: '4582', expiry: '09/28' },
      { id: 2, type: 'bank', name: 'Compte Courant', last4: '7823', iban: 'FR76************7823' }
    ]
  });

  // Fonction pour formater les montants
  const formatAmount = (amount, currency = selectedCurrency) => {
    if (currency === 'EUR') return `${amount.toFixed(2)} €`;
    if (currency === 'USD') return `$${amount.toFixed(2)}`;
    return `${amount.toFixed(2)} ${currency}`;
  };

  // Fonction pour traiter un nouveau paiement
  const handleNewPayment = (amount, description, method) => {
    // Logique de traitement sécurisé des paiements
    const newTransaction = {
      id: transactionHistory.length + 1,
      type: 'payment',
      amount: parseFloat(amount),
      description,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      method
    };
    
    // Mise à jour du solde et de l'historique
    setWalletData(prev => ({
      ...prev,
      balance: prev.balance - parseFloat(amount)
    }));
    
    setTransactionHistory(prev => [newTransaction, ...prev]);
    setCurrentSection('main');
    
    // Notification de confirmation
    Alert.alert('Paiement effectué', `Votre paiement de ${formatAmount(parseFloat(amount))} a été traité avec succès.`);
  };

  // Fonction pour gérer les transferts crypto
  const handleCryptoTransfer = (amount, currency, type) => {
    const newTransaction = {
      id: transactionHistory.length + 1,
      type: 'crypto',
      amount: parseFloat(amount),
      description: type === 'buy' ? `Achat ${currency}` : `Vente ${currency}`,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      cryptoCurrency: currency
    };
    
    // Mise à jour du portefeuille crypto
    setWalletData(prev => {
      const updatedCryptoBalances = prev.cryptoBalances.map(crypto => {
        if (crypto.currency === currency) {
          const newAmount = type === 'buy' 
            ? crypto.amount + parseFloat(amount)
            : crypto.amount - parseFloat(amount);
          return { ...crypto, amount: newAmount };
        }
        return crypto;
      });
      
      return {
        ...prev,
        cryptoBalances: updatedCryptoBalances
      };
    });
    
    setTransactionHistory(prev => [newTransaction, ...prev]);
    setCurrentSection('main');
  };

  // Fonction pour gérer l'expansion des sections
  const toggleExpand = (section) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  

const renderMainSection = (
  <RenderMainDashboard
    showBalance={showBalance}
    setShowBalance={setShowBalance}
    formatAmount={formatAmount}
    setCurrentSection={setCurrentSection}
    toggleExpand={toggleExpand}
    expanded={expanded}
    walletData={walletData}
    transactionHistory={transactionHistory}
  />
);

const renderCryptoSection = (
  <RenderCrypto
    walletData={walletData}
    selectedCurrency={selectedCurrency}
    formatAmount={formatAmount}
    showBalance={showBalance}
    setCurrentSection={setCurrentSection}
    handleCryptoTransfer={handleCryptoTransfer}
    activeTab={activeTab}
    setActiveTab={setActiveTab}
  />
);

const renderReceivePayment = <RenderReceivePayment setCurrentSection={setCurrentSection} />;

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
  <RenderSendPayment
    setCurrentSection={setCurrentSection}
    handleNewPayment={handleNewPayment}
    walletData={walletData}
  />
);

// Détermine quelle section doit être rendue
const renderSection = () => {
  if (currentSection === 'main') {
    return renderMainSection;
  } else if (currentSection === 'crypto') {
    return renderCryptoSection;
  } else if (currentSection === 'receive') {
    return renderReceivePayment;
  } else if (currentSection === 'payment') {
    return renderSendPaymentSection;
  } else if (currentSection === 'security') {
    return renderSecuritySettings;
  } else if (currentSection === 'transactions') {
    return renderTransactions;
  } else if (currentSection.startsWith('transaction-detail-')) {
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
  return renderMainSection;
};
return (
  <SafeAreaView className="flex-1">
    {renderSection()}
    {currentSection === 'main' && (
      <ThemedView variant="surface" style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentSection('main')}>
          <Home size={24} color={theme.primary} />
          <ThemedText style={ { color: theme.primary }}>Accueil</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentSection('crypto')}>
          <Bitcoin size={24} color={theme.onSurface} />
          <ThemedText style={ { color: theme.onSurface }}>Crypto</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mainAction, { backgroundColor: theme.primary }]}
          onPress={() => {
            // Logique pour l'action principale
            Alert.alert('Sélectionner une action', 'Que souhaitez-vous faire ?', [
              { text: 'Envoyer', onPress: () => setCurrentSection('payment') },
              { text: 'Recevoir', onPress: () => setCurrentSection('receive') },
              { text: 'Annuler', style: 'cancel' }
            ]);
          }}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentSection('transactions')}>
          <Clock size={24} color={theme.onSurface} />
          <ThemedText style={ { color: theme.onSurface }}>Activité</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentSection('security')}>
          <Settings size={24} color={theme.onSurface} />
          <ThemedText style={ { color: theme.onSurface}}>Paramètres</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    )}
  </SafeAreaView>)}

// Styles pour la barre de navigation
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
