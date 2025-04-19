import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, TextInput, Alert } from 'react-native';
import { useTheme } from '@/components/contexts/theme/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { Shield, CreditCard, Wallet, Settings, ArrowRight, ArrowLeft, ChevronDown, ChevronUp, Plus, Lock, BarChart3, History, Send, Download, DollarSign, Bitcoin } from 'lucide-react';
import _ from 'lodash';
import renderCrypto from '@/components/wallets/RenderCrypto';
import RenderMainDashboard from '@/components/wallets/RenderMainDashboard';
// Composant principal du portefeuille
export default function WalletPortfolio() {
  const { theme } = useTheme();
  const [showBalance, setShowBalance] = useState(true);
  const [expanded, setExpanded] = useState({
    transactions: false,
    payment: false,
    crypto: false,
    settings: false
  });
  const [currentSection, setCurrentSection] = useState('main');
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [transactionHistory, setTransactionHistory] = useState([
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
  
// Styles du composant
const renderMainSection = RenderMainDashboard({
  showBalance,
  setShowBalance,
  formatAmount,
  setCurrentSection,
  toggleExpand,
  expanded
})
const renderCryptoSection = renderCrypto({
  walletData,
  selectedCurrency,
  formatAmount,
  showBalance,
  setCurrentSection,
  handleCryptoTransfer
})

// Détermine quelle section doit être rendue
const renderSection = () => {
  if (currentSection === 'main') {
    return renderMainSection;
  } else if (currentSection === 'crypto') {
    return renderCryptoSection;
  } else if (currentSection === 'receive') {
    return renderReceivePayment();
  } else if (currentSection === 'security') {
    return renderSecuritySettings();
  } else if (currentSection === 'transactions') {
    return renderTransactions();
  } else if (currentSection.startsWith('transaction-detail-')) {
    const transactionId = currentSection.split('-').pop();
    return renderTransactionDetail(transactionId);
  }
  return renderMainSection();
};

return (
  <SafeAreaView className="flex-1">
    {renderSection()}
    {currentSection === 'main' && (
      <ThemedView variant="surface" style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentSection('main')}>
          <Home size={24} color={theme.primary} />
          <Text style={[styles.navText, { color: theme.primary }]}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentSection('crypto')}>
          <Bitcoin size={24} color={theme.onSurfaceVariant} />
          <Text style={[styles.navText, { color: theme.onSurfaceVariant }]}>Crypto</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.mainAction, { backgroundColor: theme.primary }]}
          onPress={() => {
            // Logique pour l'action principale
            Alert.alert('Sélectionner une action', 'Que souhaitez-vous faire ?', [
              { text: 'Envoyer', onPress: () => setCurrentSection('crypto') },
              { text: 'Recevoir', onPress: () => setCurrentSection('receive') },
              { text: 'Annuler', style: 'cancel' }
            ]);
          }}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentSection('transactions')}>
          <Clock size={24} color={theme.onSurfaceVariant} />
          <Text style={[styles.navText, { color: theme.onSurfaceVariant }]}>Activité</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentSection('security')}>
          <Settings size={24} color={theme.onSurfaceVariant} />
          <Text style={[styles.navText, { color: theme.onSurfaceVariant }]}>Paramètres</Text>
        </TouchableOpacity>
      </ThemedView>
    )}
  </SafeAreaView>
);
};


const styles = StyleSheet.create({
  balanceContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  balanceTitle: {
    fontSize: 16,
    opacity: 0.7
  },
  hideButton: {
    padding: 4
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4
  },
  pendingAmount: {
    fontSize: 14,
    opacity: 0.7
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 100
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 6
  },
  sectionContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  cryptoContainer: {
    marginTop: 8
  },
  cryptoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  cryptoInfo: {},
  cryptoSymbol: {
    fontSize: 16,
    fontWeight: '600'
  },
  cryptoAmount: {
    fontSize: 14,
    opacity: 0.7
  },
  cryptoValue: {
    fontSize: 16,
    fontWeight: '500'
  },
  viewAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8
  },
  viewAllText: {
    fontWeight: '500',
    marginRight: 4
  },
  paymentMethodsContainer: {
    marginTop: 8
  },
  paymentMethodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  paymentMethodDetails: {
    marginLeft: 12
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500'
  },
  paymentMethodNumber: {
    fontSize: 14,
    opacity: 0.7
  },
  addPaymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: 'dashed'
  },
  addPaymentText: {
    fontWeight: '500',
    marginLeft: 8
  },
  transactionsContainer: {
    marginTop: 8
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  transactionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  transactionDetails: {
    marginLeft: 12
  },
  transactionDesc: {
    fontSize: 15,
    fontWeight: '500'
  },
  transactionDate: {
    fontSize: 13,
    opacity: 0.7
  },
  transactionAmountContainer: {
    alignItems: 'flex-end'
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600'
  },
  pendingLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2
  },
  settingsContainer: {
    marginTop: 8
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  settingsText: {
    fontSize: 16,
    marginLeft: 12
  },
  backButton: {
    marginRight: 12
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '600'
  },
  // Styles pour la section crypto
  cryptoActionContainer: {
    marginVertical: 16
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden'
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center'
  },
  tabText: {
    fontWeight: '500'
  },
  cryptoActionForm: {
    marginTop: 8
  },
  formLabel: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16
  },
  formInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16
  },
  selectInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  primaryButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  secondaryButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500'
  },
  transferFeeContainer: {
    marginTop: 16
  },
  transferFeeLabel: {
    fontSize: 14,
    marginBottom: 8
  },
  transferFeeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  feeOption: {
    width: '31%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center'
  },
  feeOptionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4
  },
  feeOptionValue: {
    fontSize: 12
  },
  // Styles pour la section receive payment
  receiveContainer: {
    alignItems: 'center',
    paddingVertical: 16
  },
  qrCodeContainer: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16
  },
  qrCodePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  qrCode: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderStyle: 'dashed'
  },
  receiveInfoText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16
  },
  receiveIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    width: '100%'
  },
  receiveId: {
    flex: 1,
    fontSize: 15
  },
  copyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  receiveMethodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 16
  },
  receiveMethodOption: {
    width: '48%',
    height: 60,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  receiveMethodText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500'
  },
  receiveFormContainer: {
    width: '100%',
    marginTop: 8
  },
  // Styles pour la section Security
  securityContainer: {
    paddingVertical: 8
  },
  securityItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16
  },
  securityItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  securityItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12
  },
  securityItemDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20
  },
  securityToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  securityToggleLabel: {
    fontSize: 14,
    fontWeight: '500'
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center'
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignSelf: 'flex-end'
  },
  // Styles pour la section Transactions
  transactionFilterContainer: {
    marginBottom: 16
  },
  filterLabel: {
    fontSize: 14,
    marginBottom: 8
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1
  },
  filterOptionText: {
    fontSize: 14
  },
  transactionsListContainer: {
    marginTop: 8
  },
  transactionItemLarge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16
  },
  transactionInfoLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  transactionIconLarge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  transactionDetailsLarge: {
    marginLeft: 12,
    flex: 1
  },
  transactionDescLarge: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4
  },
  transactionDateLarge: {
    fontSize: 14
  },
  transactionAmountContainerLarge: {
    alignItems: 'flex-end'
  },
  transactionAmountLarge: {
    fontSize: 16,
    fontWeight: '600'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4
  },
  statusBadgeText: {
    fontSize: 12
  },
  // Styles pour la section Transaction Detail
  transactionDetailCard: {
    padding: 20,
    borderRadius: 16
  },
  transactionDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  transactionIconXLarge: {
    width: 48,
    height: 48, 
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  transactionDetailHeaderInfo: {
    marginLeft: 16
  },
  transactionDetailType: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4
  },
  transactionDetailDate: {
    fontSize: 14
  },
  transactionDetailAmount: {
    alignItems: 'center',
    marginVertical: 20
  },
  transactionDetailAmountValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4
  },
  transactionDetailEquivalent: {
    fontSize: 16
  },
  transactionDetailInfo: {
    marginBottom: 20
  },
  transactionDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  transactionDetailLabel: {
    fontSize: 15
  },
  transactionDetailValue: {
    fontSize: 15,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right'
  },
  transactionDetailStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16
  },
  transactionDetailStatusText: {
    fontSize: 14,
    fontWeight: '500'
  }
});

export default WalletApp;

