import { ScrollView } from "react-native";
import { ThemedView } from "../ui/ThemedView";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Shield, CreditCard, Wallet, Settings, ArrowRight, ArrowLeft, ChevronDown, ChevronUp, Plus, Lock, BarChart3, History, Send, Download, DollarSign, Bitcoin, Bell } from 'lucide-react';

// Add missing theme object
const theme = {
  primary: '#6200ee',
  secondary: '#03dac6',
  accent: '#ff8a00',
  onSurface: '#000000',
  onSurfaceVariant: '#6B6B6B',
  surface: '#FFFFFF',
  outline: '#E1E1E1',
};

// Add sample data that was being used but not defined
const walletData = {
  balance: 1250.75,
  pendingBalance: 125.50,
  cryptoBalances: [
    { currency: 'BTC', amount: 0.025, value: 1200 },
    { currency: 'ETH', amount: 1.5, value: 2500 },
  ],
  paymentMethods: [
    { id: '1', type: 'card', name: 'Visa Gold', last4: '4321' },
    { id: '2', type: 'bank', name: 'Compte Bancaire', last4: '8765' },
  ]
};

const transactionHistory = [
  { id: '1', type: 'received', description: 'Paiement reçu', date: '19 Avr 2025', amount: 250, status: 'completed' },
  { id: '2', type: 'sent', description: 'Achat en ligne', date: '18 Avr 2025', amount: 75.30, status: 'completed' },
  { id: '3', type: 'crypto', description: 'Achat Bitcoin', date: '17 Avr 2025', amount: 0.005, cryptoCurrency: 'BTC', status: 'completed' },
  { id: '4', type: 'received', description: 'Remboursement', date: '15 Avr 2025', amount: 32.50, status: 'pending' },
  { id: '5', type: 'sent', description: 'Transfert à Jean', date: '14 Avr 2025', amount: 100, status: 'completed' },
];

// Define Props type
type Props = {
  showBalance: boolean;
  setShowBalance: (show: boolean) => void;
  formatAmount: (amount: number) => string;
  setCurrentSection: (section: string) => void;
  toggleExpand: (section: string) => void;
  expanded: {
    crypto: boolean;
    payment: boolean;
    transactions: boolean;
    settings: boolean;
  };
};


const RenderMainDashboard:React.FC< Props>= ({
  showBalance,
  setShowBalance,
  formatAmount,
  setCurrentSection,
  toggleExpand,
  expanded
}) => (
    <ScrollView className="w-full h-full">
      <ThemedView variant="surface" style={styles.balanceContainer} intensity="strong">
        <View style={styles.balanceHeader}>
          <Text style={[styles.balanceTitle, { color: theme.onSurface }]}>Solde disponible</Text>
          <TouchableOpacity onPress={() => setShowBalance(!showBalance)} style={styles.hideButton}>
            <Lock size={16} color={theme.onSurface} />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.balanceAmount, { color: theme.accent }]}>
          {showBalance ? formatAmount(walletData.balance) : '••••••'}
        </Text>
        
        {walletData.pendingBalance > 0 && (
          <Text style={[styles.pendingAmount, { color: theme.onSurfaceVariant }]}>
            {showBalance ? `+ ${formatAmount(walletData.pendingBalance)} en attente` : '•••• en attente'}
          </Text>
        )}
        
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() => setCurrentSection('send')}
          >
            <Send size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Envoyer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.secondary }]}
            onPress={() => setCurrentSection('receive')}
          >
            <Download size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Recevoir</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.accent }]}
            onPress={() => setCurrentSection('crypto')}
          >
            <Bitcoin size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Crypto</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
      
      {/* Portefeuille crypto */}
      <ThemedView variant="surfaceVariant" style={styles.sectionContainer}>
        <TouchableOpacity 
          style={styles.sectionHeader} 
          onPress={() => toggleExpand('crypto')}
        >
          <View style={styles.sectionTitleContainer}>
            <Bitcoin size={20} color={theme.accent} />
            <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>Portefeuille Crypto</Text>
          </View>
          {expanded.crypto ? 
            <ChevronUp size={20} color={theme.onSurfaceVariant} /> : 
            <ChevronDown size={20} color={theme.onSurfaceVariant} />
          }
        </TouchableOpacity>
        
        {expanded.crypto && (
          <View style={styles.cryptoContainer}>
            {walletData.cryptoBalances.map((crypto, index) => (
              <TouchableOpacity
                key={index}
                style={styles.cryptoItem}
                onPress={() => setCurrentSection(`crypto-detail-${crypto.currency}`)}
              >
                <View style={styles.cryptoInfo}>
                  <Text style={[styles.cryptoSymbol, { color: theme.onSurface }]}>{crypto.currency}</Text>
                  <Text style={[styles.cryptoAmount, { color: theme.onSurfaceVariant }]}>
                    {crypto.amount} {crypto.currency}
                  </Text>
                </View>
                <Text style={[styles.cryptoValue, { color: theme.accent }]}>
                  {showBalance ? formatAmount(crypto.value) : '••••••'}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={[styles.viewAllButton, { borderColor: theme.outline }]}
              onPress={() => setCurrentSection('crypto')}
            >
              <Text style={[styles.viewAllText, { color: theme.primary }]}>Gérer le portefeuille crypto</Text>
              <ArrowRight size={16} color={theme.primary} />
            </TouchableOpacity>
          </View>
        )}
      </ThemedView>
      
      {/* Moyens de paiement */}
      <ThemedView variant="surfaceVariant" style={styles.sectionContainer}>
        <TouchableOpacity 
          style={styles.sectionHeader} 
          onPress={() => toggleExpand('payment')}
        >
          <View style={styles.sectionTitleContainer}>
            <CreditCard size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>Moyens de paiement</Text>
          </View>
          {expanded.payment ? 
            <ChevronUp size={20} color={theme.onSurfaceVariant} /> : 
            <ChevronDown size={20} color={theme.onSurfaceVariant} />
          }
        </TouchableOpacity>
        
        {expanded.payment && (
          <View style={styles.paymentMethodsContainer}>
            {walletData.paymentMethods.map((method, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.paymentMethodItem}
                onPress={() => setCurrentSection(`payment-detail-${method.id}`)}
              >
                <View style={styles.paymentMethodInfo}>
                  {method.type === 'card' ? (
                    <CreditCard size={24} color={theme.primary} />
                  ) : (
                    <DollarSign size={24} color={theme.secondary} />
                  )}
                  <View style={styles.paymentMethodDetails}>
                    <Text style={[styles.paymentMethodName, { color: theme.onSurface }]}>{method.name}</Text>
                    <Text style={[styles.paymentMethodNumber, { color: theme.onSurfaceVariant }]}>
                      {method.type === 'card' ? `•••• ${method.last4}` : `•••• ${method.last4}`}
                    </Text>
                  </View>
                </View>
                <ArrowRight size={16} color={theme.onSurfaceVariant} />
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={[styles.addPaymentMethod, { borderColor: theme.outline }]}
              onPress={() => setCurrentSection('add-payment')}
            >
              <Plus size={18} color={theme.primary} />
              <Text style={[styles.addPaymentText, { color: theme.primary }]}>Ajouter un moyen de paiement</Text>
            </TouchableOpacity>
          </View>
        )}
      </ThemedView>
      
      {/* Transactions récentes */}
      <ThemedView variant="surfaceVariant" style={styles.sectionContainer}>
        <TouchableOpacity 
          style={styles.sectionHeader} 
          onPress={() => toggleExpand('transactions')}
        >
          <View style={styles.sectionTitleContainer}>
            <History size={20} color={theme.secondary} />
            <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>Transactions récentes</Text>
          </View>
          {expanded.transactions ? 
            <ChevronUp size={20} color={theme.onSurfaceVariant} /> : 
            <ChevronDown size={20} color={theme.onSurfaceVariant} />
          }
        </TouchableOpacity>
        
        {expanded.transactions && (
          <View style={styles.transactionsContainer}>
            {transactionHistory.slice(0, 5).map((transaction, index) => (
              <TouchableOpacity 
                key={transaction.id}
                style={styles.transactionItem}
                onPress={() => setCurrentSection(`transaction-detail-${transaction.id}`)}
              >
                <View style={styles.transactionInfo}>
                  <View style={[styles.transactionIcon, { 
                    backgroundColor: transaction.type === 'received' ? theme.accent : 
                                     transaction.type === 'crypto' ? '#f7931a' : theme.secondary 
                  }]}>
                    {transaction.type === 'received' ? (
                      <Download size={14} color="#fff" />
                    ) : transaction.type === 'crypto' ? (
                      <Bitcoin size={14} color="#fff" />
                    ) : (
                      <Send size={14} color="#fff" />
                    )}
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={[styles.transactionDesc, { color: theme.onSurface }]}>
                      {transaction.description}
                    </Text>
                    <Text style={[styles.transactionDate, { color: theme.onSurfaceVariant }]}>
                      {transaction.date}
                    </Text>
                  </View>
                </View>
                <View style={styles.transactionAmountContainer}>
                  <Text style={[styles.transactionAmount, { 
                    color: transaction.type === 'received' ? '#4caf50' : 
                           transaction.type === 'crypto' ? '#f7931a' : theme.onSurface 
                  }]}>
                    {transaction.type === 'received' ? '+' : transaction.type === 'crypto' ? '' : '-'} 
                    {transaction.type === 'crypto' 
                      ? `${transaction.amount} ${transaction.cryptoCurrency}`
                      : formatAmount(transaction.amount)
                    }
                  </Text>
                  {transaction.status === 'pending' && (
                    <Text style={[styles.pendingLabel, { color: theme.onSurfaceVariant }]}>En attente</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={[styles.viewAllButton, { borderColor: theme.outline }]}
              onPress={() => setCurrentSection('transactions')}
            >
              <Text style={[styles.viewAllText, { color: theme.primary }]}>Voir toutes les transactions</Text>
              <ArrowRight size={16} color={theme.primary} />
            </TouchableOpacity>
          </View>
        )}
      </ThemedView>
      
      {/* Paramètres */}
      <ThemedView variant="surfaceVariant" style={styles.sectionContainer}>
        <TouchableOpacity 
          style={styles.sectionHeader} 
          onPress={() => toggleExpand('settings')}
        >
          <View style={styles.sectionTitleContainer}>
            <Settings size={20} color={theme.onSurfaceVariant} />
            <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>Paramètres du portefeuille</Text>
          </View>
          {expanded.settings ? 
            <ChevronUp size={20} color={theme.onSurfaceVariant} /> : 
            <ChevronDown size={20} color={theme.onSurfaceVariant} />
          }
        </TouchableOpacity>
        
        {expanded.settings && (
          <View style={styles.settingsContainer}>
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => setCurrentSection('security-settings')}
            >
              <Shield size={20} color={theme.primary} />
              <Text style={[styles.settingsText, { color: theme.onSurface }]}>Sécurité et authentification</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => setCurrentSection('currency-settings')}
            >
              <DollarSign size={20} color={theme.secondary} />
              <Text style={[styles.settingsText, { color: theme.onSurface }]}>Devise et préférences</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => setCurrentSection('notification-settings')}
            >
              <Bell size={20} color={theme.accent} />
              <Text style={[styles.settingsText, { color: theme.onSurface }]}>Notifications</Text>
            </TouchableOpacity>
          </View>
        )}
      </ThemedView>
    </ScrollView>
  );
  
  // Add missing styles
const styles = StyleSheet.create({
  balanceContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  hideButton: {
    padding: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pendingAmount: {
    fontSize: 14,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
  sectionContainer: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  cryptoContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cryptoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.outline,
  },
  cryptoInfo: {
    flex: 1,
  },
  cryptoSymbol: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cryptoAmount: {
    fontSize: 14,
  },
  cryptoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  paymentMethodsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.outline,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodDetails: {
    marginLeft: 12,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  paymentMethodNumber: {
    fontSize: 14,
  },
  addPaymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  addPaymentText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  transactionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.outline,
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionDetails: {
    marginLeft: 12,
  },
  transactionDesc: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  pendingLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  settingsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.outline,
  },
  settingsText: {
    fontSize: 16,
    marginLeft: 12,
  },
});

export default RenderMainDashboard;