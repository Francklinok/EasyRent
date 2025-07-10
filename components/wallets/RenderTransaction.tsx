import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedView } from "../ui/ThemedView";
import { ArrowLeft, Download, Send, Bitcoin } from 'lucide-react-native';
import { useTheme } from '@/components/contexts/theme/themehook';
import _ from 'lodash';
import { ThemedText } from "../ui/ThemedText";
import { ThemedScrollView } from "../ui/ScrolleView";
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

type Props = {
  formatAmount: (amount: number, currency?: string) => string;
  setCurrentSection: (section: string) => void;
  transactionHistory:TransactionHistory[]

};


const RenderTransactions: React.FC<Props> = ({ setCurrentSection,formatAmount,transactionHistory}) => {
  const {theme} = useTheme();
  
  return (
    <ThemedScrollView className="w-full h-full pt-10">
      <ThemedView style={styles.sectionContainer}>
        <ThemedView style={styles.sectionHeader}>
          <TouchableOpacity onPress={() => setCurrentSection('main')} style={styles.backButton}>
            <ArrowLeft size={20} color={theme.onSurface} />
          </TouchableOpacity>
          <ThemedText type = "subtitle" style={{ color: theme.onSurface }}>Historique des transactions</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.transactionFilterContainer}>
          <ThemedText  className="px-2 py-4" style={ { color: theme.onSurface }}>Filtrer par</ThemedText>
          <ThemedView className="px-2" style={styles.filterOptions}>
            <TouchableOpacity style={[styles.filterOption, { borderColor: theme.surface, backgroundColor: theme.surfaceVariant }]}>
              <ThemedText style={{ color: theme.text }}>Tout</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterOption, { borderColor: theme.outline, backgroundColor: theme.surfaceVariant }]}>
              <ThemedText style={ { color: theme.text }}>Envoyés</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterOption, { borderColor: theme.outline, backgroundColor: theme.surfaceVariant }]}>
              <ThemedText style={ { color: theme.text }}>Reçus</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterOption, { borderColor: theme.outline, backgroundColor: theme.surfaceVariant }]}>
              <ThemedText style={ { color: theme.text }}>Crypto</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
        
        <ThemedView className="px-2" >
          {transactionHistory.map((transaction, index) => (
            <TouchableOpacity 
              key={transaction.id}
              style={[styles.transactionItemLarge, index < transactionHistory.length - 1 ? { borderBottomColor: theme.outline, borderBottomWidth: 1 } : {}]}
              onPress={() => setCurrentSection(`transaction-detail-${transaction.id}`)}
            >
              <ThemedView style={styles.transactionInfoLarge}>
                <ThemedView style={[styles.transactionIconLarge, { 
                  backgroundColor: transaction.type === 'received' ? theme.accent : 
                                   transaction.type === 'crypto' ? theme.warning : theme.secondary 
                }]}>
                  {transaction.type === 'received' ? (
                    <Download size={18} color= {theme.surface}/>
                  ) : transaction.type === 'crypto' ? (
                    <Bitcoin size={18} color={theme.surface} />
                  ) : (
                    <Send size={18} color={theme.surface} />
                  )}
                </ThemedView>
                <ThemedView style={styles.transactionDetailsLarge}>
                  <ThemedText style={ { color: theme.onSurface }}>
                    {transaction.description}
                  </ThemedText>
                  <ThemedText style={ { color: theme.onSurface }}>
                    {transaction.date}
                  </ThemedText>
                  {transaction.status === 'pending' && (
                    <ThemedView style={[styles.statusBadge, { backgroundColor: theme.surfaceVariant }]}>
                      <ThemedText style={ { color: theme.onSurface }}>En attente</ThemedText>
                    </ThemedView>
                  )}
                </ThemedView>
              </ThemedView>
              <ThemedView style={styles.transactionAmountContainerLarge}>
                <ThemedText intensity="strong" style={ { 
                  color: transaction.type === 'received' ? '#4caf50' : 
                         transaction.type === 'crypto' ? '#f7931a' : theme.onSurface 
                }}>
                  {transaction.type === 'received' ? '+' : transaction.type === 'crypto' ? '' : '-'} 
                  {transaction.type === 'crypto' 
                    ? `${transaction.amount} ${transaction.cryptoCurrency}`
                    : formatAmount(transaction.amount)
                  }
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>
    </ThemedScrollView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 'auto',
    minHeight: 800,
    padding: 16,

  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  transactionFilterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
nsactionsListContainer: {
    marginTop: 8,
  },
  transactionItemLarge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    alignItems: 'center',
  },
  transactionInfoLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIconLarge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetailsLarge: {
    flex: 1,
  },
  transactionDescLarge: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDateLarge: {
    fontSize: 14,
  },
  transactionAmountContainerLarge: {
    alignItems: 'flex-end',
  },
  transactionAmountLarge: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default RenderTransactions;