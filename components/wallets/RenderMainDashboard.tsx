import { ScrollView } from "react-native";
import { ThemedView } from "../ui/ThemedView";
import {  TouchableOpacity, StyleSheet } from "react-native";
import { Shield, CreditCard, Settings, ArrowRight, ArrowLeft, ChevronDown, ChevronUp, Plus, Lock, BarChart3, History, Send, Download, DollarSign, Bitcoin, Bell } from 'lucide-react-native';
import _ from 'lodash';
import { useTheme } from "../contexts/theme/themehook";
import { ThemedScrollView } from "../ui/ScrolleView";
import { ThemedText } from "../ui/ThemedText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackButton } from "../ui/BackButton";

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
  const insets = useSafeAreaInsets();
  

  return (
    <ThemedView  className = "px-3"
      style={{ flex: 1, paddingTop: insets.top + 4  }}
    >
      <ThemedScrollView className="w-full h-full">
        {/* Balance Card - Using elevated for better visual hierarchy */}
        <ThemedView className="px-4 ">
           <BackButton />
        </ThemedView>
        <ThemedView 
          variant="surfaceVariant" 
          style={styles.balanceContainer} 
          bordered
        >
          <ThemedView variant="surfaceVariant" style={styles.balanceHeader}>
            <ThemedText  type='title' intensity="strong">Solde disponible</ThemedText>
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
              <Lock size={16} color={theme.onSurface} />
            </TouchableOpacity>
          </ThemedView>
          
          <ThemedText variant="primary" style={styles.balanceAmount}>
            {showBalance ? formatAmount(walletData.balance) : '••••••'}
          </ThemedText>
          
          {walletData.pendingBalance > 0 && (
            <ThemedText variant='default' >
              {showBalance ? `+ ${formatAmount(walletData.pendingBalance)} en attente` : '•••• en attente'}
            </ThemedText>
          )}
          
          <ThemedView variant = "surfaceVariant" style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={() => setCurrentSection('send')}
            >
              <Send size={18} color={theme.surface} />
              <ThemedText type ="caption" style={styles.actionButtonText}>Envoyer</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.secondary }]}
              onPress={() => setCurrentSection('receive')}
            >
              <Download size={18} color={theme.surface} />
              <ThemedText  type ="caption" style={styles.actionButtonText}>Recevoir</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.accent }]}
              onPress={() => setCurrentSection('crypto')}
            >
              <Bitcoin size={18} color={theme.surface} />
              <ThemedText  type ="caption"  style={styles.actionButtonText}>Crypto</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
        
        {/* Portefeuille crypto */}
        <ThemedView 
          style={styles.sectionContainer}
          bordered
        >
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={() => toggleExpand('crypto')}
          >
            <ThemedView variant  = "surface" className="px-4" style={styles.sectionTitleContainer}>
              <Bitcoin size={20} color={theme.accent} />
              <ThemedText className="pl-4" style={{color:theme.onSurface}}>Portefeuille Crypto</ThemedText>
            </ThemedView>
            {expanded.crypto ? 
              <ChevronUp size={20} color={theme.onSurface} /> : 
              <ChevronDown size={20} color={theme.surfaceVariant} />
            }
          </TouchableOpacity>
          
          {expanded.crypto && (
            <ThemedView  className = "px-8"  style={styles.cryptoContainer}>
              {walletData.cryptoBalances.map((crypto, index) => (
                <TouchableOpacity
                  key={index}
                  style={{ flex:1,
                  flexDirection:"row",
                  padding:10,
                  borderRadius:10,
                  marginBottom:8,
                  alignItems:"center",
                  justifyContent: "center",
                  gap:8,
                  backgroundColor:theme.surfaceVariant}}
                  onPress={() => setCurrentSection(`crypto-detail-${crypto.currency}`)}
                >
                  <ThemedView variant = 'surfaceVariant' className = "px-6" style={styles.cryptoInfo}>
                    <ThemedText intensity="strong"  style={styles.cryptoSymbol}>{crypto.currency}</ThemedText>
                    <ThemedText intensity="strong" variant="secondary">
                      {crypto.amount} {crypto.currency}
                    </ThemedText>
                  </ThemedView>
                  <ThemedText intensity="strong" variant="accent" type = "normal">
                    {showBalance ? formatAmount(crypto.value) : '••••••'}
                  </ThemedText>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity 
                style={{ flex:1,
                  flexDirection:"row",
                  borderWidth:1,
                  borderColor:theme.outline,
                  padding:10,
                  borderRadius:20,
                  marginBottom:8,
                  alignItems:"center",
                  justifyContent: "center",
                  gap:8,
                  backgroundColor:theme.surfaceVariant}}
                onPress={() => setCurrentSection('crypto')}
              >
                <ThemedText>Gérer le portefeuille crypto</ThemedText>
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
          className="px-2 mb-4"
        >
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={() => toggleExpand('payment')}
          >
            <ThemedView variant = "surface" className="px-4" style={styles.sectionTitleContainer}>
              <CreditCard size={20} color={theme.primary} />
              <ThemedText className="pl-4"  style={ {color:theme.onSurface}}>Moyens de paiement</ThemedText>
            </ThemedView>
            {expanded.payment ? 
              <ChevronUp size={20} color={theme.surfaceVariant} /> : 
              <ChevronDown size={20} color={theme.surfaceVariant} />
            }
          </TouchableOpacity>
          
          {expanded.payment && (
            <ThemedView className="px-4">
              {walletData.paymentMethods.map((method, index) => (
                <TouchableOpacity 
                  key={index}
                  onPress={() => setCurrentSection(`payment-detail-${method.id}`)}
                >
                  <ThemedView  variant = "surfaceVariant"  className=" flex-1 flex-row items-center  p-2 rounded-2xl">
                    {method.type === 'card' ? (
                      <CreditCard size={24} color={theme.primary} />
                    ) : (
                      <DollarSign size={24} color={theme.secondary} />
                    )}
                    <ThemedView variant = "surfaceVariant"style={styles.paymentMethodDetails}>
                      <ThemedText  type = "normal" variant= "default" intensity="strong" style={styles.paymentMethodName}>{method.name}</ThemedText>
                      <ThemedText type = "normal" variant= "default" intensity="strong" style={styles.paymentMethodNumber}>
                        {method.type === 'card' ? `•••• ${method.last4}` : `•••• ${method.last4}`}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  <ArrowRight size={16} color={theme.surfaceVariant} />
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity 
                style = {{
                  flex:1,
                  flexDirection:"row",
                  borderWidth:1,
                  borderColor:theme.outline,
                  padding:10,
                  borderRadius:20,
                  marginBottom:8,
                  alignItems:"center",
                  justifyContent: "center",
                  gap:8,
                  backgroundColor:theme.surfaceVariant

                }}
                onPress={() => setCurrentSection('add-payment')}>

                <Plus size={18} color={theme.text} />
                <ThemedText variant="default" >
                  Ajouter un moyen de paiement
                </ThemedText>
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
            <ThemedView variant = "surface" className="px-4" style={styles.sectionTitleContainer}>
              <History size={20} color={theme.secondary} />
              <ThemedText className="pl-4" style={{color:theme.onSurface}}>Transactions récentes</ThemedText>
            </ThemedView>
            {expanded.transactions ? 
              <ChevronUp size={20} color={theme.surfaceVariant} /> : 
              <ChevronDown size={20} color={theme.surfaceVariant} />
            }
          </TouchableOpacity>
          
          {expanded.transactions && (
            <ThemedView variant = "surface" className="px-4" >
              {transactionHistory.slice(0, 5).map((transaction, index) => (
                <TouchableOpacity 
                  key={transaction.id}
                  style = {{
                    left:1,
                    flexDirection:'row',
                    padding:6,
                  }}
                  onPress={() => setCurrentSection(`transaction-detail-${transaction.id}`)}
                >
                  <ThemedView variant = "surface" style={styles.transactionInfo}>
                    <ThemedView variant={transaction.type === 'received' ? 'accent' : 
                      transaction.type === 'crypto' ? 'secondary' : 'primary'} 
                      style = {{
                        padding:6,
                        borderRadius:20,
                        alignItems:"center"

                      }}
                      >
                      {transaction.type === 'received' ? (
                        <Download size={14} color={theme.surface} />
                      ) : transaction.type === 'crypto' ? (
                        <Bitcoin size={14} color={theme.surface} />
                      ) : (
                        <Send size={14} color={theme.surface} />
                      )}
                    </ThemedView>
                    <ThemedView variant = "surface" className="px-4">
                      <ThemedText intensity="normal" variant="default" type= "body">
                        {transaction.description}
                      </ThemedText>
                      <ThemedText variant="default" intensity="light">
                        {transaction.date}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  <ThemedView variant = "surface" style={styles.transactionAmountContainer}>
                    <ThemedText  intensity="strong"
                      style={{
                        color:transaction.type === 'received'? theme.success: 
                         transaction.type === 'crypto' ? 'accent' : 'primary'
                      }}
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
                style={{ flex:1,
                  flexDirection:"row",
                  borderWidth:1,
                  borderColor:theme.outline,
                  padding:10,
                  borderRadius:20,
                  marginBottom:8,
                  alignItems:"center",
                  justifyContent: "center",
                  gap:8,
                  backgroundColor:theme.surfaceVariant}}
                onPress={() => setCurrentSection('transactions')}
              >
                <ThemedText>Voir toutes les transactions</ThemedText>
                <ArrowRight size={16} color={theme.text} />
              </TouchableOpacity>
            </ThemedView>
          )}
        </ThemedView>
        
        {/* Paramètres */}
        <ThemedView 
          variant="surface" 
          bordered
          className="px-4"
          style={styles.sectionContainer}

        >
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={() => toggleExpand('settings')}
          >
            <ThemedView variant = "surface" className="flex-row">
              <Settings size={20} color={theme.error} />
              <ThemedText className="pl-4" style={{color:theme.onSurface}}>Paramètres du portefeuille</ThemedText>
            </ThemedView>
            {expanded.settings ? 
              <ChevronUp size={20} color={theme.surfaceVariant} /> : 
              <ChevronDown size={20} color={theme.surfaceVariant} />
            }
          </TouchableOpacity>
          
          {expanded.settings && (
            <ThemedView variant = "surface" style={styles.settingsContainer}>
              <TouchableOpacity 
                style={styles.settingsItem}
                onPress={() => setCurrentSection('security-settings')}
              >
                <Shield size={20} color={theme.primary} />
                <ThemedText className="pl-4">Sécurité et authentification</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.settingsItem}
                onPress={() => setCurrentSection('currency-settings')}
              >
                <DollarSign size={20} color={theme.secondary} />
                <ThemedText className="pl-4" >Devise et préférences</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.settingsItem}
                onPress={() => setCurrentSection('notification-settings')}
              >
                <Bell size={20} color={theme.accent} />
                <ThemedText className="pl-4">Notifications</ThemedText>
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

  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    padding:8
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
    marginHorizontal:2,
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
    marginBottom: 4,
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
    paddingBottom: 16,
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
    paddingHorizontal: 40,
    paddingBottom: 16,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    
  },
  settingsText: {
    fontSize: 16,
    marginLeft: 12,
  },
});

export default RenderMainDashboard;