import { ScrollView } from "react-native";
import { ThemedView } from "../ui/ThemedView";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Shield, CreditCard, Wallet, Settings, ArrowRight, ArrowLeft, ChevronDown, ChevronUp, Plus, Lock, BarChart3, History, Send, Download, DollarSign, Bitcoin, Bell } from 'lucide-react-native';
import _ from 'lodash';
import { useTheme } from "../contexts/theme/themehook";
import { ThemedScrollView } from "../ui/ScrolleView";
import { ThemedText } from "../ui/ThemedText";

type WalletData = {
  balance: number;
  pendingBalance: number;
  cryptoBalances: {
    currency: string;
    amount: number;
    value: number;
  }[];
  paymentMethods: {
    id: number;
    type: string;
    name: string;
    last4: string;
    expiry?: string;
    iban?: string;
  }[];
};

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

// Define Props type
type Props = {
  showBalance: boolean;
  setShowBalance: (show: boolean) => void;
  formatAmount: (amount: number, currency?: string) => string;
  setCurrentSection: (section: string) => void;
  toggleExpand: (section: string) => void;
  expanded: {
    crypto: boolean;
    payment: boolean;
    transactions: boolean;
    settings: boolean;
  };
  walletData: WalletData,
  transactionHistory: TransactionHistory[]
};

const RenderMainDashboard: React.FC<Props> = ({
  showBalance,
  setShowBalance,
  formatAmount,
  setCurrentSection,
  toggleExpand,
  expanded,
  walletData,
  transactionHistory
}) => {
  const { theme } = useTheme();

  return (
    <ThemedView variant = 'default'
      style={{ flex: 1 }}
    >
      <ThemedScrollView className="w-full h-full">
        {/* Balance Card - Using elevated for better visual hierarchy */}
        <ThemedView 
          variant="surface" 
          style={styles.balanceContainer} 
          // intensity="strong"
          // elevated="medium"
          bordered
        >
          <ThemedView variant="surface" style={styles.balanceHeader}>
            <ThemedText variant="primary" type='title'  style={styles.balanceTitle}>Solde disponible</ThemedText>
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
              <Lock size={16} color={theme.onSurface} />
            </TouchableOpacity>
          </ThemedView>
          
          <ThemedText variant="accent" style={styles.balanceAmount}>
            {showBalance ? formatAmount(walletData.balance) : '••••••'}
          </ThemedText>
          
          {walletData.pendingBalance > 0 && (
            <ThemedText variant="secondary" style={styles.pendingAmount}>
              {showBalance ? `+ ${formatAmount(walletData.pendingBalance)} en attente` : '•••• en attente'}
            </ThemedText>
          )}
          
          <ThemedView variant = "surface" style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={() => setCurrentSection('send')}
            >
              <Send size={18} color={theme.onSurface} />
              <ThemedText type ="caption" style={styles.actionButtonText}>Envoyer</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.secondary }]}
              onPress={() => setCurrentSection('receive')}
            >
              <Download size={18} color={theme.onSurface} />
              <ThemedText  type ="caption" style={styles.actionButtonText}>Recevoir</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.accent }]}
              onPress={() => setCurrentSection('crypto')}
            >
              <Bitcoin size={18} color={theme.onSurface} />
              <ThemedText  type ="caption"  style={styles.actionButtonText}>Crypto</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
        
        {/* Portefeuille crypto */}
        <ThemedView 
          variant="surface" 
          style={styles.sectionContainer}
          bordered
        >
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={() => toggleExpand('crypto')}
          >
            <ThemedView variant  = "surface" style={styles.sectionTitleContainer}>
              <Bitcoin size={20} color={theme.accent} />
              <ThemedText  style={styles.sectionTitle , {color:theme.onSurface}}>Portefeuille Crypto</ThemedText>
            </ThemedView>
            {expanded.crypto ? 
              <ChevronUp size={20} color={theme.onSurface} /> : 
              <ChevronDown size={20} color={theme.onSurfaceVariant} />
            }
          </TouchableOpacity>
          
          {expanded.crypto && (
            <ThemedView variant = "surface" style={styles.cryptoContainer}>
              {walletData.cryptoBalances.map((crypto, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.cryptoItem}
                  onPress={() => setCurrentSection(`crypto-detail-${crypto.currency}`)}
                >
                  <ThemedView variant = "surface" style={styles.cryptoInfo}>
                    <ThemedText  style={styles.cryptoSymbol}>{crypto.currency}</ThemedText>
                    <ThemedText variant="secondary" style={styles.cryptoAmount}>
                      {crypto.amount} {crypto.currency}
                    </ThemedText>
                  </ThemedView>
                  <ThemedText variant="accent" style={styles.cryptoValue}>
                    {showBalance ? formatAmount(crypto.value) : '••••••'}
                  </ThemedText>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity 
                style={[styles.viewAllButton]}
                onPress={() => setCurrentSection('crypto')}
              >
                <ThemedText variant="primary" style={styles.viewAllText}>Gérer le portefeuille crypto</ThemedText>
                <ArrowRight size={16} color={theme.primary} />
              </TouchableOpacity>
            </ThemedView>
          )}
        </ThemedView>
        
        {/* Moyens de paiement */}
        <ThemedView 
          variant="surface" 
          style={styles.sectionContainer}
          bordered
        >
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={() => toggleExpand('payment')}
          >
            <ThemedView variant = "surface" style={styles.sectionTitleContainer}>
              <CreditCard size={20} color={theme.primary} />
              <ThemedText style={styles.sectionTitle, {color:theme.onSurface}}>Moyens de paiement</ThemedText>
            </ThemedView>
            {expanded.payment ? 
              <ChevronUp size={20} color={theme.onSurfaceVariant} /> : 
              <ChevronDown size={20} color={theme.onSurfaceVariant} />
            }
          </TouchableOpacity>
          
          {expanded.payment && (
            <ThemedView variant = "surface" style={styles.paymentMethodsContainer}>
              {walletData.paymentMethods.map((method, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.paymentMethodItem}
                  onPress={() => setCurrentSection(`payment-detail-${method.id}`)}
                >
                  <ThemedView variant = "surface" style={styles.paymentMethodInfo}>
                    {method.type === 'card' ? (
                      <CreditCard size={24} color={theme.primary} />
                    ) : (
                      <DollarSign size={24} color={theme.secondary} />
                    )}
                    <ThemedView variant = "surface" style={styles.paymentMethodDetails}>
                      <ThemedText variant="primary" style={styles.paymentMethodName}>{method.name}</ThemedText>
                      <ThemedText variant="secondary" style={styles.paymentMethodNumber}>
                        {method.type === 'card' ? `•••• ${method.last4}` : `•••• ${method.last4}`}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  <ArrowRight size={16} color={theme.onSurfaceVariant} />
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity 
                style={[styles.addPaymentMethod]}
                onPress={() => setCurrentSection('add-payment')}
              >
                <Plus size={18} color={theme.primary} />
                <ThemedText variant="primary" style={styles.addPaymentText}>Ajouter un moyen de paiement</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
        </ThemedView>
        
        {/* Transactions récentes */}
        <ThemedView 
          variant="surface" 
          style={styles.sectionContainer}
          bordered
        >
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={() => toggleExpand('transactions')}
          >
            <ThemedView variant = "surface" style={styles.sectionTitleContainer}>
              <History size={20} color={theme.secondary} />
              <ThemedText style={[styles.sectionTitle, {color:theme.onSurface}]}>Transactions récentes</ThemedText>
            </ThemedView>
            {expanded.transactions ? 
              <ChevronUp size={20} color={theme.onSurfaceVariant} /> : 
              <ChevronDown size={20} color={theme.onSurfaceVariant} />
            }
          </TouchableOpacity>
          
          {expanded.transactions && (
            <ThemedView variant = "surface" style={styles.transactionsContainer}>
              {transactionHistory.slice(0, 5).map((transaction, index) => (
                <TouchableOpacity 
                  key={transaction.id}
                  style={styles.transactionItem}
                  onPress={() => setCurrentSection(`transaction-detail-${transaction.id}`)}
                >
                  <ThemedView variant = "surface" style={styles.transactionInfo}>
                    <ThemedView variant={transaction.type === 'received' ? 'accent' : 
                      transaction.type === 'crypto' ? 'secondary' : 'primary'} 
                      style={styles.transactionIcon}>
                      {transaction.type === 'received' ? (
                        <Download size={14} color={theme.onSurface} />
                      ) : transaction.type === 'crypto' ? (
                        <Bitcoin size={14} color={theme.onSurface} />
                      ) : (
                        <Send size={14} color={theme.onSurface} />
                      )}
                    </ThemedView>
                    <ThemedView variant = "surface" style={styles.transactionDetails}>
                      <ThemedText variant="primary" style={styles.transactionDesc}>
                        {transaction.description}
                      </ThemedText>
                      <ThemedText variant="secondary" style={styles.transactionDate}>
                        {transaction.date}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  <ThemedView variant = "surface" style={styles.transactionAmountContainer}>
                    <ThemedText 
                      variant={transaction.type === 'received' ? 'success' : 
                        transaction.type === 'crypto' ? 'accent' : 'primary'} 
                      style={styles.transactionAmount}
                    >
                      {transaction.type === 'received' ? '+' : transaction.type === 'crypto' ? '' : '-'} 
                      {transaction.type === 'crypto' 
                        ? `${transaction.amount} ${transaction.cryptoCurrency}`
                        : formatAmount(transaction.amount)
                      }
                    </ThemedText>
                    {transaction.status === 'pending' && (
                      <ThemedText variant="secondary" style={styles.pendingLabel}>En attente</ThemedText>
                    )}
                  </ThemedView>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => setCurrentSection('transactions')}
              >
                <ThemedText variant="primary" style={styles.viewAllText}>Voir toutes les transactions</ThemedText>
                <ArrowRight size={16} color={theme.primary} />
              </TouchableOpacity>
            </ThemedView>
          )}
        </ThemedView>
        
        {/* Paramètres */}
        <ThemedView 
          variant="surface" 
          style={styles.sectionContainer}
          bordered
        >
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={() => toggleExpand('settings')}
          >
            <ThemedView variant = "surface" style={styles.sectionTitleContainer}>
              <Settings size={20} color={theme.onSurfaceVariant} />
              <ThemedText variant="primary" style={styles.sectionTitle, {color:theme.onSurface}}>Paramètres du portefeuille</ThemedText>
            </ThemedView>
            {expanded.settings ? 
              <ChevronUp size={20} color={theme.onSurfaceVariant} /> : 
              <ChevronDown size={20} color={theme.onSurfaceVariant} />
            }
          </TouchableOpacity>
          
          {expanded.settings && (
            <ThemedView variant = "surface" style={styles.settingsContainer}>
              <TouchableOpacity 
                style={styles.settingsItem}
                onPress={() => setCurrentSection('security-settings')}
              >
                <Shield size={20} color={theme.primary} />
                <ThemedText variant="primary" style={styles.settingsText}>Sécurité et authentification</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.settingsItem}
                onPress={() => setCurrentSection('currency-settings')}
              >
                <DollarSign size={20} color={theme.secondary} />
                <ThemedText variant="primary" style={styles.settingsText}>Devise et préférences</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.settingsItem}
                onPress={() => setCurrentSection('notification-settings')}
              >
                <Bell size={20} color={theme.accent} />
                <ThemedText variant="primary" style={styles.settingsText}>Notifications</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedScrollView>
    </ThemedView>
  );
};

// Styles with better theme compatibility
const styles = StyleSheet.create({
  balanceContainer: {
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 6,
    marginTop: 16,
    marginBottom: 16,
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
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    padding:8
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
    paddingVertical: 8,
    paddingHorizontal: 1,
    flex: 1,
    marginHorizontal: 2,
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '500',
  },
  sectionContainer: {
    borderRadius: 12,
    marginHorizontal: 6,
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
    fontSize: 14,
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
  },
  settingsText: {
    fontSize: 16,
    marginLeft: 12,
  },
});

export default RenderMainDashboard;