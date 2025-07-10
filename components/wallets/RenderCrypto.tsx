import { ThemedView } from "../ui/ThemedView";
import { Text, View, TextInput, Alert } from "react-native";
import { ScrollView } from "react-native";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ArrowLeft, ChevronDown, Bitcoin } from 'lucide-react-native';
import { useTheme } from "../contexts/theme/themehook";
import _ from 'lodash';
import { ThemedText } from "../ui/ThemedText";
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

interface Props {
  walletData: WalletData;
  selectedCurrency: string;
  formatAmount: (amount: number, currency?: string) => string;
  showBalance: boolean;
  setCurrentSection: (section: string) => void;
  handleCryptoTransfer: (amount: number, currency: string, action: "buy" | "sell" | "transfer") => void;
  activeTab:string,
  setActiveTab:(section:string) =>void
}

const RenderCrypto: React.FC<Props> = ({
  walletData,
  selectedCurrency,
  formatAmount,
  showBalance,
  setCurrentSection,
  handleCryptoTransfer,
  activeTab,
  setActiveTab
}) => {
  
  const {theme} = useTheme();
  
  return (
    <ThemedView className="h-full">
    <ScrollView  contentContainerStyle={{ paddingTop: 40, paddingBottom: 40, height:'100%' }}>
      <ThemedView className=" flex-1 px-3">
        <ThemedView className="gap-4" style={styles.sectionHeader}>
          <BackButton/>
          <ThemedText  type = "title" style={{color:theme.onSurface }}>Portefeuille Crypto</ThemedText>
        </ThemedView>
        
        <ThemedView variant="surface" style={styles.cryptoBalanceSummary}>
          <ThemedText type = 'subtitle' style={[styles.cryptoBalanceTitle, { color: theme.text }]}>Valeur totale</ThemedText>
          <ThemedText style={[styles.cryptoBalanceAmount, { color: theme.primary }]}>
            {showBalance ? formatAmount(walletData.cryptoBalances.reduce((acc, curr) => acc + curr.value, 0)) : '••••••'}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.cryptoTabs}>
          <TouchableOpacity 
            style={[
              styles.cryptoTab, 
              { borderBottomColor: activeTab === 'overview' ? theme.primary : 'transparent' }
            ]}
            onPress={() => setActiveTab('overview')}
          >
            <ThemedText  intensity="light" style={[
              { color: activeTab === 'overview' ? theme.primary : theme.onSurface }
            ]}>Aperçu</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.cryptoTab, 
              { borderBottomColor: activeTab === 'buy' ? theme.primary : 'transparent' }
            ]}
            onPress={() => setActiveTab('buy')}
          >
            <ThemedText intensity="light" style={[
              { color: activeTab === 'buy' ? theme.primary : theme.onSurface }
            ]}>Acheter</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.cryptoTab, 
              { borderBottomColor: activeTab === 'sell' ? theme.primary : 'transparent' }
            ]}
            onPress={() => setActiveTab('sell')}
          >
            <ThemedText 
               intensity="light"  style={[
                { color: activeTab === 'sell' ? theme.primary : theme.onSurface }
            ]}>Vendre</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.cryptoTab, 
              { borderBottomColor: activeTab === 'transfer' ? theme.primary : 'transparent' }
            ]}
            onPress={() => setActiveTab('transfer')}
          >
            <ThemedText intensity="light"  style={[
              { color: activeTab === 'transfer' ? theme.primary : theme.onSurface}
            ]}>Transférer</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        {activeTab === 'overview' && (
          <ThemedView   style={styles.cryptoOverview}>
            {walletData.cryptoBalances.map((crypto, index) => (
              <ThemedView 
                key={index}
                variant = "surfaceVariant"
                style={styles.cryptoCard}
                bordered
              >
                <ThemedView variant = "surfaceVariant" className="flex-row gap-4">
                  <ThemedText type = "body" style={ { color: theme.primary }}>{crypto.currency}</ThemedText>
                  <ThemedText style={[styles.cryptoCardName, { color: theme.onSurface}]}>
                    {crypto.currency === 'BTC' ? 'Bitcoin' : 
                     crypto.currency === 'ETH' ? 'Ethereum' : 
                     crypto.currency === 'SOL' ? 'Solana' : crypto.currency}
                  </ThemedText>
                </ThemedView>
                
                <ThemedView variant = "surfaceVariant" style={styles.cryptoCardDetails}>
                  <ThemedText type = "normal" style={{ color: theme.onSurface }}>
                    {crypto.amount} {crypto.currency}
                  </ThemedText>
                  <ThemedText style={{ color: theme.onSurface }}>
                    {formatAmount(crypto.value)}
                  </ThemedText>
                </ThemedView>
                
                <ThemedView  variant = "surface"  style={styles.cryptoCardActions}>
                  <TouchableOpacity 
                    style={[styles.cryptoCardAction, { backgroundColor: theme.primary }]}
                    onPress={() => {
                      setActiveTab('buy');
                    }}
                  >
                    <ThemedText style = {{color:theme.surface}}>Acheter</ThemedText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.cryptoCardAction, { backgroundColor: theme.secondary }]}
                    onPress={() => {
                      setActiveTab('sell');
                    }}
                  >
                    <ThemedText style = {{color:theme.surface}}>Vendre</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
            ))}
          </ThemedView>
        )}
        
        {activeTab === 'buy' && (
          <ThemedView className=" flex-col gap-4 h-full px-2">
            <ThemedText style={{ color: theme.onSurface }}>Crypto-monnaie</ThemedText>
            <TouchableOpacity style={[styles.selectInput, { borderColor: theme.outline }]}>
              <ThemedText style={{ color: theme.onSurface }}>Bitcoin (BTC)</ThemedText>
              <ChevronDown size={16} color={theme.onSurface} />
            </TouchableOpacity>
            
            <ThemedText style={ { color: theme.onSurface }}>Montant</ThemedText>
            <TextInput
              placeholder="0.00"
              keyboardType="numeric"
              style={{ borderColor: theme.outline, color: theme.onSurface }}
              placeholderTextColor={theme.onSurface}
            />
            
            <ThemedText style={ { color: theme.onSurface}}>Équivalent en {selectedCurrency}</ThemedText>
            <ThemedText style={ { color: theme.onSurface }}>
              {formatAmount(0)}
            </ThemedText>
            
            <ThemedText style={ { color: theme.onSurface }}>Méthode de paiement</ThemedText>
            <TouchableOpacity style={[styles.selectInput, { borderColor: theme.outline }]}>
              <Text style={{ color: theme.onSurface }}>Visa •••• 4582</Text>
              <ChevronDown size={16} color={theme.onSurface} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.primary }]}
              onPress={() => handleCryptoTransfer(0.001, 'BTC', 'buy')}
            >
              <ThemedText style = {{color:theme.surface}}>Acheter BTC</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
        
        {activeTab === 'sell' && (
          <ThemedView className="flex-col gap-4 h-full px-2">
            <ThemedText style={ { color: theme.onSurface }}>Crypto-monnaie</ThemedText>
            <TouchableOpacity style={[styles.selectInput, { borderColor: theme.outline }]}>
              <ThemedText style={{ color: theme.onSurface }}>Bitcoin (BTC)</ThemedText>
              <ChevronDown size={16} color={theme.onSurface} />
            </TouchableOpacity>
            
            <ThemedText style={ { color: theme.onSurface }}>Montant</ThemedText>
            <TextInput
              placeholder="0.00"
              keyboardType="numeric"
              style={[styles.formInput, { borderColor: theme.outline, color: theme.onSurface }]}
              placeholderTextColor={theme.onSurface}
            />
            
            <ThemedText style={ { color: theme.onSurface}}>Équivalent en {selectedCurrency}</ThemedText>
            <ThemedText style={ { color: theme.onSurface }}>
              {formatAmount(0)}
            </ThemedText>
            
            <ThemedText style={ { color: theme.onSurface}}>Méthode de réception</ThemedText>
            <TouchableOpacity style={[styles.selectInput, { borderColor: theme.outline }]}>
              <ThemedText style={{ color: theme.onSurface }}>Compte Courant •••• 7823</ThemedText>
              <ChevronDown size={16} color={theme.onSurface} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.secondary }]}
              onPress={() => handleCryptoTransfer(0.001, 'BTC', 'sell')}
            >
              <ThemedText style={styles.primaryButtonText}>Vendre BTC</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
        
        {activeTab === 'transfer' && (
          <ThemedView className="flex-col gap-4 h-full px-2">
            <ThemedText style={ { color: theme.onSurface }}>Crypto-monnaie</ThemedText>
            <TouchableOpacity style={[styles.selectInput, { borderColor: theme.outline }]}>
              <ThemedText style={{ color: theme.onSurface }}>Bitcoin (BTC)</ThemedText>
              <ChevronDown size={16} color={theme.onSurface} />
            </TouchableOpacity>
            
            <ThemedText style={ { color: theme.onSurface }}>Montant</ThemedText>
            <TextInput
              placeholder="0.00"
              keyboardType="numeric"
              style={[styles.formInput, { borderColor: theme.outline, color: theme.onSurface }]}
              placeholderTextColor={theme.onSurface}
            />
            
            <ThemedText style={ { color: theme.onSurface}}>Adresse de destination</ThemedText>
            <TextInput
              placeholder="Adresse du portefeuille"
              style={[styles.formInput, { borderColor: theme.outline, color: theme.onSurface }]}
              placeholderTextColor={theme.onSurface}
            />
            
            <ThemedView className="flex-col gap-4">
              <ThemedText style={ { color: theme.onSurface }}>Frais de réseau</ThemedText>
              <ThemedView style={styles.transferFeeOptions}>
                <TouchableOpacity style={[styles.feeOption, { borderColor: theme.outline, backgroundColor: theme.surfaceVariant }]}>
                  <ThemedText style={ { color: theme.onSurface }}>Économique</ThemedText>
                  <ThemedText style={ { color: theme.onSurface }}>0.0001 BTC</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.feeOption, { borderColor: theme.primary, backgroundColor: theme.surfaceVariant }]}>
                  <ThemedText style={ { color: theme.onSurface }}>Standard</ThemedText>
                  <ThemedText style={ { color: theme.onSurface}}>0.0005 BTC</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.feeOption, { borderColor: theme.outline, backgroundColor: theme.surfaceVariant }]}>
                  <ThemedText style={ { color: theme.onSurface }}>Rapide</ThemedText>
                  <ThemedText style={ { color: theme.onSurface}}>0.001 BTC</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
            
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.accent }]}
              onPress={() => {
                // Logique de transfert crypto
                Alert.alert('Transfert initié', 'Votre transfert crypto a été initié. Veuillez vérifier l\'état dans l\'historique des transactions.');
                setCurrentSection('main');
              }}
            >
              <ThemedText style={styles.primaryButtonText}>Transférer BTC</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
    </ThemedView>
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
    marginBottom: 16,
    marginTop:20,
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
    marginTop: 1
  },
  cryptoCard: {
    borderRadius: 12,
    padding: 6,
    marginBottom: 18
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
    fontSize: 14
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
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
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
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4
  },
  feeOptionValue: {
    fontSize: 12
  }
});

export default RenderCrypto;