import { ThemedView } from "../ui/ThemedView";
import { Text, View, TextInput, Alert } from "react-native";
import { ScrollView } from "react-native";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ArrowLeft, ChevronDown, Bitcoin } from 'lucide-react';
import { useTheme } from "../contexts/theme/themehook";
import { useState } from "react";
  
interface CryptoBalance {
  currency: string;
  amount: number;
  value: number;
}

interface WalletData {
  cryptoBalances: CryptoBalance[];
}

interface Props {
  walletData: WalletData;
  selectedCurrency: string;
  formatAmount: (value: number) => string;
  showBalance: boolean;
  setCurrentSection: (section: string) => void;
  handleCryptoTransfer: (amount: number, currency: string, action: "buy" | "sell" | "transfer") => void;
}

const RenderCrypto: React.FC<Props> = ({
  walletData,
  selectedCurrency,
  formatAmount,
  showBalance,
  setCurrentSection,
  handleCryptoTransfer
}) => {
  
  const [activeTab, setActiveTab] = useState('overview');
  const theme = useTheme();
  
  return (
    <ScrollView className="w-full h-full">
      <ThemedView variant="surface" style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <TouchableOpacity onPress={() => setCurrentSection('main')} style={styles.backButton}>
            <ArrowLeft size={20} color={theme.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.sectionHeaderTitle, { color: theme.onSurface }]}>Portefeuille Crypto</Text>
        </View>
        
        <ThemedView variant="surfaceVariant" style={styles.cryptoBalanceSummary}>
          <Text style={[styles.cryptoBalanceTitle, { color: theme.onSurfaceVariant }]}>Valeur totale</Text>
          <Text style={[styles.cryptoBalanceAmount, { color: theme.accent }]}>
            {showBalance ? formatAmount(walletData.cryptoBalances.reduce((acc, curr) => acc + curr.value, 0)) : '••••••'}
          </Text>
        </ThemedView>
        
        <View style={styles.cryptoTabs}>
          <TouchableOpacity 
            style={[
              styles.cryptoTab, 
              { borderBottomColor: activeTab === 'overview' ? theme.primary : 'transparent' }
            ]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[
              styles.cryptoTabText, 
              { color: activeTab === 'overview' ? theme.primary : theme.onSurfaceVariant }
            ]}>Aperçu</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.cryptoTab, 
              { borderBottomColor: activeTab === 'buy' ? theme.primary : 'transparent' }
            ]}
            onPress={() => setActiveTab('buy')}
          >
            <Text style={[
              styles.cryptoTabText, 
              { color: activeTab === 'buy' ? theme.primary : theme.onSurfaceVariant }
            ]}>Acheter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.cryptoTab, 
              { borderBottomColor: activeTab === 'sell' ? theme.primary : 'transparent' }
            ]}
            onPress={() => setActiveTab('sell')}
          >
            <Text style={[
              styles.cryptoTabText, 
              { color: activeTab === 'sell' ? theme.primary : theme.onSurfaceVariant }
            ]}>Vendre</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.cryptoTab, 
              { borderBottomColor: activeTab === 'transfer' ? theme.primary : 'transparent' }
            ]}
            onPress={() => setActiveTab('transfer')}
          >
            <Text style={[
              styles.cryptoTabText, 
              { color: activeTab === 'transfer' ? theme.primary : theme.onSurfaceVariant }
            ]}>Transférer</Text>
          </TouchableOpacity>
        </View>
        
        {activeTab === 'overview' && (
          <View style={styles.cryptoOverview}>
            {walletData.cryptoBalances.map((crypto, index) => (
              <ThemedView 
                key={index}
                variant="surfaceVariant" 
                style={styles.cryptoCard}
                bordered
              >
                <View style={styles.cryptoCardHeader}>
                  <Text style={[styles.cryptoCardSymbol, { color: theme.accent }]}>{crypto.currency}</Text>
                  <Text style={[styles.cryptoCardName, { color: theme.onSurfaceVariant }]}>
                    {crypto.currency === 'BTC' ? 'Bitcoin' : 
                     crypto.currency === 'ETH' ? 'Ethereum' : 
                     crypto.currency === 'SOL' ? 'Solana' : crypto.currency}
                  </Text>
                </View>
                
                <View style={styles.cryptoCardDetails}>
                  <Text style={[styles.cryptoCardAmount, { color: theme.onSurface }]}>
                    {crypto.amount} {crypto.currency}
                  </Text>
                  <Text style={[styles.cryptoCardValue, { color: theme.onSurfaceVariant }]}>
                    {formatAmount(crypto.value)}
                  </Text>
                </View>
                
                <View style={styles.cryptoCardActions}>
                  <TouchableOpacity 
                    style={[styles.cryptoCardAction, { backgroundColor: theme.primary }]}
                    onPress={() => {
                      setActiveTab('buy');
                      // Autres actions...
                    }}
                  >
                    <Text style={styles.cryptoCardActionText}>Acheter</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.cryptoCardAction, { backgroundColor: theme.secondary }]}
                    onPress={() => {
                      setActiveTab('sell');
                      // Autres actions...
                    }}
                  >
                    <Text style={styles.cryptoCardActionText}>Vendre</Text>
                  </TouchableOpacity>
                </View>
              </ThemedView>
            ))}
          </View>
        )}
        
        {activeTab === 'buy' && (
          <View style={styles.cryptoActionForm}>
            <Text style={[styles.formLabel, { color: theme.onSurfaceVariant }]}>Crypto-monnaie</Text>
            <TouchableOpacity style={[styles.selectInput, { borderColor: theme.outline }]}>
              <Text style={{ color: theme.onSurface }}>Bitcoin (BTC)</Text>
              <ChevronDown size={16} color={theme.onSurfaceVariant} />
            </TouchableOpacity>
            
            <Text style={[styles.formLabel, { color: theme.onSurfaceVariant }]}>Montant</Text>
            <TextInput
              placeholder="0.00"
              keyboardType="numeric"
              style={[styles.formInput, { borderColor: theme.outline, color: theme.onSurface }]}
              placeholderTextColor={theme.onSurfaceVariant}
            />
            
            <Text style={[styles.formLabel, { color: theme.onSurfaceVariant }]}>Équivalent en {selectedCurrency}</Text>
            <Text style={[styles.cryptoEquivalent, { color: theme.onSurface }]}>
              {formatAmount(0)}
            </Text>
            
            <Text style={[styles.formLabel, { color: theme.onSurfaceVariant }]}>Méthode de paiement</Text>
            <TouchableOpacity style={[styles.selectInput, { borderColor: theme.outline }]}>
              <Text style={{ color: theme.onSurface }}>Visa •••• 4582</Text>
              <ChevronDown size={16} color={theme.onSurfaceVariant} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.primary }]}
              onPress={() => handleCryptoTransfer(0.001, 'BTC', 'buy')}
            >
              <Text style={styles.primaryButtonText}>Acheter BTC</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {activeTab === 'sell' && (
          <View style={styles.cryptoActionForm}>
            <Text style={[styles.formLabel, { color: theme.onSurfaceVariant }]}>Crypto-monnaie</Text>
            <TouchableOpacity style={[styles.selectInput, { borderColor: theme.outline }]}>
              <Text style={{ color: theme.onSurface }}>Bitcoin (BTC)</Text>
              <ChevronDown size={16} color={theme.onSurfaceVariant} />
            </TouchableOpacity>
            
            <Text style={[styles.formLabel, { color: theme.onSurfaceVariant }]}>Montant</Text>
            <TextInput
              placeholder="0.00"
              keyboardType="numeric"
              style={[styles.formInput, { borderColor: theme.outline, color: theme.onSurface }]}
              placeholderTextColor={theme.onSurfaceVariant}
            />
            
            <Text style={[styles.formLabel, { color: theme.onSurfaceVariant }]}>Équivalent en {selectedCurrency}</Text>
            <Text style={[styles.cryptoEquivalent, { color: theme.onSurface }]}>
              {formatAmount(0)}
            </Text>
            
            <Text style={[styles.formLabel, { color: theme.onSurfaceVariant }]}>Méthode de réception</Text>
            <TouchableOpacity style={[styles.selectInput, { borderColor: theme.outline }]}>
              <Text style={{ color: theme.onSurface }}>Compte Courant •••• 7823</Text>
              <ChevronDown size={16} color={theme.onSurfaceVariant} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.secondary }]}
              onPress={() => handleCryptoTransfer(0.001, 'BTC', 'sell')}
            >
              <Text style={styles.primaryButtonText}>Vendre BTC</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {activeTab === 'transfer' && (
          <View style={styles.cryptoActionForm}>
            <Text style={[styles.formLabel, { color: theme.onSurfaceVariant }]}>Crypto-monnaie</Text>
            <TouchableOpacity style={[styles.selectInput, { borderColor: theme.outline }]}>
              <Text style={{ color: theme.onSurface }}>Bitcoin (BTC)</Text>
              <ChevronDown size={16} color={theme.onSurfaceVariant} />
            </TouchableOpacity>
            
            <Text style={[styles.formLabel, { color: theme.onSurfaceVariant }]}>Montant</Text>
            <TextInput
              placeholder="0.00"
              keyboardType="numeric"
              style={[styles.formInput, { borderColor: theme.outline, color: theme.onSurface }]}
              placeholderTextColor={theme.onSurfaceVariant}
            />
            
            <Text style={[styles.formLabel, { color: theme.onSurfaceVariant }]}>Adresse de destination</Text>
            <TextInput
              placeholder="Adresse du portefeuille"
              style={[styles.formInput, { borderColor: theme.outline, color: theme.onSurface }]}
              placeholderTextColor={theme.onSurfaceVariant}
            />
            
            <View style={styles.transferFeeContainer}>
              <Text style={[styles.transferFeeLabel, { color: theme.onSurfaceVariant }]}>Frais de réseau</Text>
              <View style={styles.transferFeeOptions}>
                <TouchableOpacity style={[styles.feeOption, { borderColor: theme.outline, backgroundColor: theme.surfaceVariant }]}>
                  <Text style={[styles.feeOptionTitle, { color: theme.onSurface }]}>Économique</Text>
                  <Text style={[styles.feeOptionValue, { color: theme.onSurfaceVariant }]}>0.0001 BTC</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.feeOption, { borderColor: theme.primary, backgroundColor: theme.surfaceVariant }]}>
                  <Text style={[styles.feeOptionTitle, { color: theme.onSurface }]}>Standard</Text>
                  <Text style={[styles.feeOptionValue, { color: theme.onSurfaceVariant }]}>0.0005 BTC</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.feeOption, { borderColor: theme.outline, backgroundColor: theme.surfaceVariant }]}>
                  <Text style={[styles.feeOptionTitle, { color: theme.onSurface }]}>Rapide</Text>
                  <Text style={[styles.feeOptionValue, { color: theme.onSurfaceVariant }]}>0.001 BTC</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.accent }]}
              onPress={() => {
                // Logique de transfert crypto
                Alert.alert('Transfert initié', 'Votre transfert crypto a été initié. Veuillez vérifier l\'état dans l\'historique des transactions.');
                setCurrentSection('main');
              }}
            >
              <Text style={styles.primaryButtonText}>Transférer BTC</Text>
            </TouchableOpacity>
          </View>
        )}
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '600'
  },
  backButton: {
    marginRight: 12
  },
  balanceTitle: {
    fontSize: 16,
    opacity: 0.7
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 6
  },
  // Styles pour la section crypto
  cryptoBalanceSummary: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16
  },
  cryptoBalanceTitle: {
    fontSize: 14,
    marginBottom: 8
  },
  cryptoBalanceAmount: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  cryptoTabs: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  cryptoTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2
  },
  cryptoTabText: {
    fontSize: 14,
    fontWeight: '500'
  },
  cryptoOverview: {
    marginTop: 8
  },
  cryptoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  cryptoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  cryptoCardSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8
  },
  cryptoCardName: {
    fontSize: 14
  },
  cryptoCardDetails: {
    marginBottom: 16
  },
  cryptoCardAmount: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4
  },
  cryptoCardValue: {
    fontSize: 14
  },
  cryptoCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  cryptoCardAction: {
    flex: 1,
    marginHorizontal: 4,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cryptoCardActionText: {
    color: '#fff',
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
  cryptoEquivalent: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8
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
  }
});

export default RenderCrypto;