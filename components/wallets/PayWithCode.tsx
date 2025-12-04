import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import {
  ArrowLeft,
  Scan,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  Search
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PaymentDetails {
  code: string;
  id: string;
  amount: number;
  description: string;
  propertyRef?: string;
  dueDate?: string;
  status: string;
  allowedMethods: string[];
}

interface PayWithCodeProps {
  onBack: () => void;
  onPay: (code: string, method: string) => Promise<void>;
  onVerifyCode: (code: string) => Promise<PaymentDetails>;
  balance: number;
  formatAmount: (amount: number) => string;
}

export const PayWithCode: React.FC<PayWithCodeProps> = ({
  onBack,
  onPay,
  onVerifyCode,
  balance,
  formatAmount
}) => {
  const { theme } = useTheme();

  const [paymentCode, setPaymentCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const paymentMethods = [
    {
      id: 'wallet',
      name: 'Solde du portefeuille',
      description: `Disponible: ${formatAmount(balance)}`,
      icon: Wallet,
      color: '#5856D6'
    },
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      description: 'Orange, MTN, Moov',
      icon: Smartphone,
      color: '#FF9500'
    },
    {
      id: 'card',
      name: 'Carte bancaire',
      description: 'Visa, Mastercard',
      icon: CreditCard,
      color: '#007AFF'
    },
    {
      id: 'bank',
      name: 'Virement bancaire',
      description: 'IBAN, SWIFT',
      icon: Building2,
      color: '#34C759'
    }
  ];

  const verifyCode = async () => {
    if (!paymentCode || paymentCode.length < 5) {
      Alert.alert('Erreur', 'Veuillez entrer un code valide');
      return;
    }

    try {
      setVerifying(true);
      const details = await onVerifyCode(paymentCode);

      if (details.status === 'paid') {
        Alert.alert('Déjà payé', 'Ce paiement a déjà été effectué');
        return;
      }

      if (details.status === 'cancelled') {
        Alert.alert('Annulé', 'Ce code de paiement a été annulé');
        return;
      }

      setPaymentDetails(details);
    } catch (error: any) {
      Alert.alert('Code invalide', error.message || 'Le code de paiement n\'existe pas');
    } finally {
      setVerifying(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentDetails || !selectedMethod) {
      return;
    }

    if (selectedMethod === 'wallet' && paymentDetails.amount > balance) {
      Alert.alert('Solde insuffisant', 'Votre solde est insuffisant pour cette transaction');
      return;
    }

    Alert.alert(
      'Confirmer le paiement',
      `Montant: ${formatAmount(paymentDetails.amount)}\nDescription: ${paymentDetails.description}\n\nConfirmer le paiement?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Payer',
          onPress: async () => {
            try {
              setPaying(true);
              await onPay(paymentDetails.code, selectedMethod);

              Alert.alert(
                'Paiement effectué',
                `Votre paiement de ${formatAmount(paymentDetails.amount)} a été traité avec succès`,
                [{ text: 'OK', onPress: onBack }]
              );
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Le paiement a échoué');
            } finally {
              setPaying(false);
            }
          }
        }
      ]
    );
  };

  const openScanner = () => {
    Alert.alert('Scanner', 'Fonctionnalité de scan QR à venir');
    // Ici, implémenter le scan QR code
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.onSurface} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Payer avec un code</ThemedText>
          <View style={{ width: 40 }} />
        </View>

        {!paymentDetails ? (
          <>
            {/* Info Banner */}
            <MotiView
              from={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={[styles.infoBanner, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }]}
            >
              <AlertCircle size={20} color={theme.primary} />
              <ThemedText style={styles.infoText}>
                Entrez le code de paiement fourni par votre propriétaire
              </ThemedText>
            </MotiView>

            {/* Code Input */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 100 }}
              style={styles.codeInputSection}
            >
              <ThemedText style={styles.inputLabel}>Code de paiement</ThemedText>
              <View style={[styles.codeInputContainer, { borderColor: theme.outline + '30' }]}>
                <Search size={24} color={theme.onSurface + '60'} />
                <TextInput
                  value={paymentCode}
                  onChangeText={(text) => setPaymentCode(text.toUpperCase())}
                  placeholder="PAY-12345"
                  autoCapitalize="characters"
                  style={[styles.codeInput, { color: theme.onSurface }]}
                  placeholderTextColor={theme.onSurface + '40'}
                />
              </View>
            </MotiView>

            {/* Action Buttons */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 150 }}
              style={styles.actionsRow}
            >
              <TouchableOpacity
                onPress={verifyCode}
                disabled={verifying || !paymentCode}
                style={{ flex: 1, marginRight: 8 }}
              >
                <LinearGradient
                  colors={
                    verifying || !paymentCode
                      ? [theme.outline + '40', theme.outline + '40']
                      : [theme.primary, theme.primary + 'DD']
                  }
                  style={styles.verifyButton}
                >
                  <ThemedText style={styles.verifyButtonText}>
                    {verifying ? 'Vérification...' : 'Vérifier'}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openScanner}
                style={[styles.scanButton, { borderColor: theme.primary }]}
              >
                <Scan size={24} color={theme.primary} />
              </TouchableOpacity>
            </MotiView>

            {/* How it works */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 200 }}
              style={[styles.howItWorks, { backgroundColor: theme.surfaceVariant }]}
            >
              <ThemedText style={styles.howItWorksTitle}>Comment ça marche ?</ThemedText>
              <ThemedText style={styles.howItWorksText}>
                1. Récupérez le code de paiement auprès de votre propriétaire{'\n'}
                2. Entrez le code ou scannez le QR code{'\n'}
                3. Vérifiez les détails du paiement{'\n'}
                4. Choisissez votre méthode de paiement{'\n'}
                5. Confirmez le paiement
              </ThemedText>
            </MotiView>
          </>
        ) : (
          <>
            {/* Payment Details Card */}
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={[styles.detailsCard, { backgroundColor: theme.success + '10', borderColor: theme.success + '30' }]}
            >
              <View style={styles.detailsHeader}>
                <CheckCircle2 size={32} color={theme.success} />
                <ThemedText style={styles.detailsHeaderText}>Code vérifié</ThemedText>
              </View>

              <View style={styles.detailsContent}>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Code</ThemedText>
                  <ThemedText style={[styles.detailValue, { color: theme.success }]}>
                    {paymentDetails.code}
                  </ThemedText>
                </View>

                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Montant</ThemedText>
                  <ThemedText style={styles.detailValueLarge}>
                    {formatAmount(paymentDetails.amount)}
                  </ThemedText>
                </View>

                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Description</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {paymentDetails.description}
                  </ThemedText>
                </View>

                {paymentDetails.propertyRef && (
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Propriété</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {paymentDetails.propertyRef}
                    </ThemedText>
                  </View>
                )}

                {paymentDetails.dueDate && (
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Date limite</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {paymentDetails.dueDate}
                    </ThemedText>
                  </View>
                )}
              </View>
            </MotiView>

            {/* Payment Method Selection */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 100 }}
              style={styles.methodsSection}
            >
              <ThemedText style={styles.methodsTitle}>Choisir une méthode de paiement</ThemedText>

              <View style={styles.methodsGrid}>
                {paymentMethods
                  .filter(m => paymentDetails.allowedMethods.includes(m.id))
                  .map((method) => (
                    <TouchableOpacity
                      key={method.id}
                      onPress={() => setSelectedMethod(method.id)}
                      style={[
                        styles.methodCard,
                        {
                          borderColor: selectedMethod === method.id ? method.color : theme.outline + '30',
                          backgroundColor: selectedMethod === method.id ? method.color + '10' : 'transparent'
                        }
                      ]}
                    >
                      <View style={[styles.methodIcon, { backgroundColor: method.color + '20' }]}>
                        <method.icon size={24} color={method.color} />
                      </View>
                      <ThemedText style={styles.methodName}>{method.name}</ThemedText>
                      <ThemedText style={styles.methodDesc}>{method.description}</ThemedText>
                      {selectedMethod === method.id && (
                        <View style={styles.methodCheck}>
                          <CheckCircle2 size={24} color={method.color} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
              </View>
            </MotiView>

            {/* Pay Button */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 200 }}
              style={styles.buttonContainer}
            >
              <TouchableOpacity
                onPress={handlePayment}
                disabled={paying || !selectedMethod}
                style={{ width: '100%' }}
              >
                <LinearGradient
                  colors={
                    paying || !selectedMethod
                      ? [theme.outline + '40', theme.outline + '40']
                      : [theme.success, theme.success + 'DD']
                  }
                  style={styles.payButton}
                >
                  <ThemedText style={styles.payButtonText}>
                    {paying ? 'Paiement en cours...' : `Payer ${formatAmount(paymentDetails.amount)}`}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setPaymentDetails(null);
                  setPaymentCode('');
                  setSelectedMethod(null);
                }}
                style={styles.cancelButton}
              >
                <ThemedText style={[styles.cancelButtonText, { color: theme.error }]}>
                  Annuler
                </ThemedText>
              </TouchableOpacity>
            </MotiView>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 32,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  codeInputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  codeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 64,
    gap: 12,
  },
  codeInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  verifyButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  howItWorks: {
    borderRadius: 16,
    padding: 20,
  },
  howItWorksTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  howItWorksText: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.7,
  },
  detailsCard: {
    borderWidth: 2,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  detailsHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  detailsHeaderText: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 12,
  },
  detailsContent: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailValueLarge: {
    fontSize: 24,
    fontWeight: '900',
  },
  methodsSection: {
    marginBottom: 24,
  },
  methodsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  methodsGrid: {
    gap: 12,
  },
  methodCard: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  methodDesc: {
    fontSize: 12,
    opacity: 0.6,
    marginRight: 8,
  },
  methodCheck: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  buttonContainer: {
    gap: 12,
  },
  payButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  cancelButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
