import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert, Share } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import {
  QrCode,
  ArrowLeft,
  Copy,
  Share2,
  Link2,
  Download,
  CheckCircle
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';

interface ReceivePaymentProps {
  onBack: () => void;
  userId: string;
  formatAmount: (amount: number) => string;
}

export const ReceivePayment: React.FC<ReceivePaymentProps> = ({
  onBack,
  userId,
  formatAmount
}) => {
  const { theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [copied, setCopied] = useState(false);

  // Générer le lien de paiement
  const generatePaymentLink = () => {
    const baseUrl = 'https://yourapp.com/pay';
    const params = new URLSearchParams({
      to: userId,
      amount: amount || '0',
      desc: description || 'Paiement'
    });
    return `${baseUrl}?${params.toString()}`;
  };

  // Générer les données QR
  const generateQRData = () => {
    return JSON.stringify({
      type: 'payment',
      userId,
      amount: amount ? parseFloat(amount) : undefined,
      description: description || undefined
    });
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(generatePaymentLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert('Copié', 'Le lien de paiement a été copié dans le presse-papiers');
  };

  const sharePaymentLink = async () => {
    try {
      await Share.share({
        message: `Payez-moi facilement via ce lien : ${generatePaymentLink()}`,
        title: 'Lien de paiement'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.onSurface} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Recevoir un paiement</ThemedText>
          <View style={{ width: 40 }} />
        </View>

        {/* QR Code Display */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.qrSection}
        >
          <View style={[styles.qrContainer, { backgroundColor: 'white' }]}>
            <QRCode
              value={generateQRData()}
              size={220}
              backgroundColor="white"
              color={theme.primary}
              logo={require('@/assets/images/icon.png')}
              logoSize={50}
              logoBackgroundColor="white"
              logoBorderRadius={10}
            />
          </View>
          <ThemedText style={styles.qrLabel}>
            Scannez ce code pour me payer
          </ThemedText>
        </MotiView>

        {/* Amount (Optional) */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100 }}
          style={styles.section}
        >
          <ThemedText style={styles.sectionTitle}>Montant (optionnel)</ThemedText>
          <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              style={[styles.amountInput, { color: theme.onSurface }]}
              placeholderTextColor={theme.onSurface + '40'}
            />
            <ThemedText style={styles.currency}>EUR</ThemedText>
          </View>
        </MotiView>

        {/* Description (Optional) */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 150 }}
          style={styles.section}
        >
          <ThemedText style={styles.sectionTitle}>Description (optionnel)</ThemedText>
          <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Ex: Remboursement dîner"
              style={[styles.input, { color: theme.onSurface }]}
              placeholderTextColor={theme.onSurface + '40'}
              multiline
            />
          </View>
        </MotiView>

        {/* Payment Link */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200 }}
          style={styles.section}
        >
          <ThemedText style={styles.sectionTitle}>Lien de paiement</ThemedText>
          <View style={[styles.linkContainer, { backgroundColor: theme.surfaceVariant }]}>
            <Link2 size={20} color={theme.primary} style={styles.linkIcon} />
            <ThemedText style={styles.linkText} numberOfLines={1}>
              {generatePaymentLink()}
            </ThemedText>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={copyToClipboard}
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
            >
              {copied ? (
                <CheckCircle size={20} color="white" />
              ) : (
                <Copy size={20} color="white" />
              )}
              <ThemedText style={styles.actionButtonText}>
                {copied ? 'Copié !' : 'Copier'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={sharePaymentLink}
              style={[styles.actionButton, { backgroundColor: theme.success }]}
            >
              <Share2 size={20} color="white" />
              <ThemedText style={styles.actionButtonText}>Partager</ThemedText>
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* Info Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 250 }}
          style={[styles.infoCard, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}
        >
          <Download size={24} color={theme.primary} />
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoTitle}>Comment ça marche ?</ThemedText>
            <ThemedText style={styles.infoText}>
              1. Partagez votre QR code ou lien de paiement{'\n'}
              2. La personne scanne le code ou clique sur le lien{'\n'}
              3. Elle confirme et effectue le paiement{'\n'}
              4. Vous recevez l'argent instantanément
            </ThemedText>
          </View>
        </MotiView>

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
  qrSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrContainer: {
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
  },
  qrLabel: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
  },
  currency: {
    fontSize: 16,
    fontWeight: '700',
    opacity: 0.5,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  linkIcon: {
    marginRight: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  infoCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.7,
  },
});
