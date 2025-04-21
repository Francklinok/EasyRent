import { ThemedView } from "../ui/ThemedView";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import { ArrowLeft, Download, Send, Bitcoin, Copy } from 'lucide-react-native';
import { useTheme } from '@/components/contexts/theme/themehook';
import _ from 'lodash';


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

// const parts = currentSection.split('-');
// const transactionId = parts.length > 1 ? parts.pop()! : '';



type Props = {
  transactionId?: string, 
  setCurrentSection: (section: string) => void;
  formatAmount: (amount: number) => string;
  transactionHistory:TransactionHistory[]

};

const RenderTransactionDetail: React.FC<Props> = ({ transactionId, setCurrentSection ,formatAmount,transactionHistory}) => {
  const theme = useTheme();
  const transaction = transactionHistory.find(t => t.id === parseInt(transactionId));
  
  if (!transaction) return <View><Text>Transaction non trouvée</Text></View>;
  
  return (
    <ScrollView className="w-full h-full">
      <ThemedView variant='surface' style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <TouchableOpacity onPress={() => setCurrentSection('transactions')} style={styles.backButton}>
            <ArrowLeft size={20} color={theme.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.sectionHeaderTitle, { color: theme.onSurface }]}>Détails de la transaction</Text>
        </View>
        
        <ThemedView variant="surfaceVariant" style={styles.transactionDetailCard} bordered>
          <View style={styles.transactionDetailHeader}>
            <View style={[styles.transactionIconXLarge, { 
              backgroundColor: transaction.type === 'received' ? theme.accent : 
                               transaction.type === 'crypto' ? '#f7931a' : theme.secondary 
            }]}>
              {transaction.type === 'received' ? (
                <Download size={24} color="#fff" />
              ) : transaction.type === 'crypto' ? (
                <Bitcoin size={24} color="#fff" />
              ) : (
                <Send size={24} color="#fff" />
              )}
            </View>
            
            <View style={styles.transactionDetailHeaderInfo}>
              <Text style={[styles.transactionDetailType, { color: theme.onSurface }]}>
                {transaction.type === 'received' ? 'Paiement reçu' : 
                 transaction.type === 'crypto' ? 'Transaction crypto' : 'Paiement envoyé'}
              </Text>
              <Text style={[styles.transactionDetailDate, { color: theme.onSurfaceVariant }]}>
                {transaction.date}
              </Text>
            </View>
          </View>
          
          <View style={styles.transactionDetailAmount}>
            <Text style={[styles.transactionDetailAmountValue, { 
              color: transaction.type === 'received' ? '#4caf50' : 
                     transaction.type === 'crypto' ? '#f7931a' : theme.onSurface 
            }]}>
              {transaction.type === 'received' ? '+' : transaction.type === 'crypto' ? '' : '-'} 
              {transaction.type === 'crypto' 
                ? `${transaction.amount} ${transaction.cryptoCurrency}`
                : formatAmount(transaction.amount)
              }
            </Text>
            
            {transaction.type === 'crypto' && (
              <Text style={[styles.transactionDetailEquivalent, { color: theme.onSurfaceVariant }]}>
                ≈ {formatAmount(transaction.amount * 58365.25)} {/* Taux fictif pour l'exemple */}
              </Text>
            )}
          </View>
          
          <View style={styles.transactionDetailInfo}>
            <View style={styles.transactionDetailRow}>
              <Text style={[styles.transactionDetailLabel, { color: theme.onSurfaceVariant }]}>Statut</Text>
              <View style={[styles.transactionDetailStatusBadge, { 
                backgroundColor: transaction.status === 'completed' ? '#e6f7ed' : theme.surfaceVariant 
              }]}>
                <Text style={[styles.transactionDetailStatusText, { 
                  color: transaction.status === 'completed' ? '#4caf50' : theme.onSurfaceVariant 
                }]}>
                  {transaction.status === 'completed' ? 'Terminé' : 'En attente'}
                </Text>
              </View>
            </View>
            
            <View style={styles.transactionDetailRow}>
              <Text style={[styles.transactionDetailLabel, { color: theme.onSurfaceVariant }]}>Description</Text>
              <Text style={[styles.transactionDetailValue, { color: theme.onSurface }]}>{transaction.description}</Text>
            </View>
            
            <View style={styles.transactionDetailRow}>
              <Text style={[styles.transactionDetailLabel, { color: theme.onSurfaceVariant }]}>ID de transaction</Text>
              <Text style={[styles.transactionDetailValue, { color: theme.onSurface }]}>TX-{Math.random().toString(36).substring(2, 10)}</Text>
            </View>
            
            {transaction.type === 'crypto' && (
              <View style={styles.transactionDetailRow}>
                <Text style={[styles.transactionDetailLabel, { color: theme.onSurfaceVariant }]}>Adresse de blockchain</Text>
                <Text style={[styles.transactionDetailValue, { color: theme.onSurface }]}>
                  {transaction.type === 'crypto' ? '0x3F5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE' : 'N/A'}
                </Text>
              </View>
            )}
            
            <View style={styles.transactionDetailRow}>
              <Text style={[styles.transactionDetailLabel, { color: theme.onSurfaceVariant }]}>Frais</Text>
              <Text style={[styles.transactionDetailValue, { color: theme.onSurface }]}>
                {transaction.type === 'crypto' ? '0.0005 BTC' : formatAmount(2.50)}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.secondaryButton, { borderColor: theme.outline }]}
            onPress={() => {
              // Logique pour exporter le reçu
              Alert.alert('Reçu exporté', 'Le reçu de la transaction a été sauvegardé dans vos documents.');
            }}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>Exporter le reçu</Text>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    flex: 1,
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
  transactionDetailCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  transactionDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  transactionIconXLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionDetailHeaderInfo: {
    flex: 1,
  },
  transactionDetailType: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDetailDate: {
    fontSize: 14,
  },
  transactionDetailAmount: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  transactionDetailAmountValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  transactionDetailEquivalent: {
    fontSize: 16,
  },
  transactionDetailInfo: {
    marginBottom: 24,
  },
  transactionDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  transactionDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionDetailValue: {
    fontSize: 14,
    maxWidth: '60%',
    textAlign: 'right',
  },
  transactionDetailStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  transactionDetailStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RenderTransactionDetail;