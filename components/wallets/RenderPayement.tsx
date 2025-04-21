
import { CreditCard, ArrowLeft, DollarSign } from 'lucide-react-native';
import { ThemedView } from '../ui/ThemedView';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/theme/themehook';
import _ from 'lodash';
import { ThemedText } from '../ui/ThemedText';

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

type Props = {
  setCurrentSection: (section: string) => void;
  handleNewPayment: (amount: number, description: string, method: string) => void;
  walletData: WalletData;
};

// Rendu de la section d'envoi de paiement
const RenderSendPayment: React.FC<Props> = ({ setCurrentSection, handleNewPayment, walletData }) => {
  // Get the theme from context
  const {theme} = useTheme();

  return (
    <ScrollView className="w-full h-full">
      <ThemedView variant="surface" style={styles.sectionContainer}>
        <ThemedView style={styles.sectionHeader}>
          <TouchableOpacity onPress={() => setCurrentSection('main')} style={styles.backButton}>
            <ArrowLeft size={20} color={theme.onSurface} />
          </TouchableOpacity>
          <ThemedText style={[styles.sectionHeaderTitle, { color: theme.onSurface }]}>Envoyer un paiement</ThemedText>
        </ThemedView>
        
        <ThemedView variant = "surface" style={styles.formContainer}>
          <ThemedText style={[styles.formLabel, { color: theme.onSurface }]}>Montant</ThemedText>
          <TextInput
            placeholder="0.00"
            keyboardType="numeric"
            style={[styles.formInput, { borderColor: theme.outline, color: theme.onSurface }]}
            placeholderTextColor={theme.onSurface}
          />
          
          <ThemedText style={[styles.formLabel, { color: theme.onSurface}]}>Description</ThemedText>
          <TextInput
            placeholder="Description du paiement"
            style={[styles.formInput, { borderColor: theme.outline, color: theme.onSurface }]}
            placeholderTextColor={theme.onSurface}
          />
          
          <ThemedText style={[styles.formLabel, { color: theme.onSurface}]}>Destinataire</ThemedText>
          <TextInput
            placeholder="Email ou identifiant"
            style={[styles.formInput, { borderColor: theme.outline, color: theme.onSurface }]}
            placeholderTextColor={theme.onSurface}
          />
          
          <ThemedText style={[styles.formLabel, { color: theme.onSurface }]}>Méthode de paiement</ThemedText>
          <ThemedView style={styles.paymentMethodsContainer}>
            {walletData.paymentMethods.map((method, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.paymentMethodOption,
                  { borderColor: theme.outline }
                ]}
              >
                <ThemedView style={styles.paymentMethodOptionInfo}>
                  {method.type === 'card' ? (
                    <CreditCard size={20} color={theme.primary} />
                  ) : (
                    <DollarSign size={20} color={theme.secondary} />
                  )}
                  <ThemedView>
                    <ThemedText style={[styles.paymentMethodName, { color: theme.onSurface }]}>{method.name}</ThemedText>
                    <ThemedText style={[styles.paymentMethodNumber, { color: theme.onSurface}]}>
                      {method.type === 'card' ? `•••• ${method.last4}` : `•••• ${method.last4}`}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                <ThemedView style={[styles.radioButton, { borderColor: theme.primary }]}>
                  <ThemedView style={[styles.radioButtonInner, { backgroundColor: theme.primary }]} />
                </ThemedView>
              </TouchableOpacity>
            ))}
          </ThemedView>
          
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: theme.primary }]}
            onPress={() => handleNewPayment(250, 'Test paiement', walletData.paymentMethods[0].id.toString())}
          >
            <ThemedText style={styles.primaryButtonText}>Confirmer le paiement</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  sectionContainer: {
    padding: 16,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  formContainer: {
    width: '100%',
  },
  formLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  formInput: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  paymentMethodsContainer: {
    marginBottom: 24,
  },
  paymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  paymentMethodOptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  paymentMethodNumber: {
    fontSize: 14,
    marginLeft: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  primaryButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RenderSendPayment;










