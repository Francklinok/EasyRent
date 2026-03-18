import React, { useState } from 'react';
import { TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert, Share } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { MotiView } from 'moti';
import {
  ArrowLeft,
  Copy,
  Share2,
  Link2,
  Download,
  CheckCircle
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useLanguage } from '@/components/contexts/language';

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
  const { t } = useLanguage();
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

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(generatePaymentLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert(t('walletComponents.copied'), t('walletComponents.linkCopied'));
  };

  const sharePaymentLink = async () => {
    try {
      await Share.share({
        message: `${t('walletComponents.shareMessage')} ${generatePaymentLink()}`,
        title: t('walletComponents.shareTitle')
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Amount (Optional) */}
        <ThemedView
          style={styles.section}
        >
          <ThemedText type="normal"  style={styles.sectionTitle}>{t('walletComponents.amountOptional')}</ThemedText>
          <ThemedView style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              style={[styles.amountInput]}
              placeholderTextColor={theme.onSurface + '40'}
            />
            <ThemedText type="normal" intensity="strong" style={styles.currency}>EUR</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Description (Optional) */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 150 }}
          style={styles.section}
        >
          <ThemedText type="normal" style={styles.sectionTitle}>{t('walletComponents.descriptionOptional')}</ThemedText>
          <ThemedView style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t('walletComponents.descriptionPlaceholder')}
              style={[styles.input, { color: theme.onSurface }]}
              placeholderTextColor={theme.onSurface + '40'}
              multiline
            />
          </ThemedView>
        </MotiView>

        {/* Payment Link */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200 }}
          style={styles.section}
        >
          <ThemedText type="normal" style={styles.sectionTitle}>{t('walletComponents.paymentLink')}</ThemedText>
          <ThemedView style={[styles.linkContainer, { backgroundColor: theme.surfaceVariant }]}>
            <Link2 size={20} color={theme.primary} style={styles.linkIcon} />
            <ThemedText type="caption" style={styles.linkText} numberOfLines={1}>
              {generatePaymentLink()}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.actionButtons}>
            <TouchableOpacity
              onPress={copyToClipboard}
              style={[styles.actionButton, { backgroundColor: theme.secondary }]}
            >
              {copied ? (
                <CheckCircle size={20} color="white" />
              ) : (
                <Copy size={20} color="white" />
              )}
              <ThemedText type="normal" intensity = "strong" style={styles.actionButtonText}>
                {copied ? t('walletComponents.copied') : t('walletComponents.copy')}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={sharePaymentLink}
              style={[styles.actionButton, { backgroundColor: theme.success }]}
            >
              <Share2 size={20} color="white" />
              <ThemedText type="normal" intensity = "strong" style={styles.actionButtonText}>{t('walletComponents.share')}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </MotiView>

        {/* Info Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 250 }}
          style={[styles.infoCard, { borderColor: theme.primary + '30' }]}
        >
          <Download size={24} color={theme.primary} />
          <ThemedView style={styles.infoContent}>
            <ThemedText type="normal" intensity="strong" style={styles.infoTitle}>{t('walletComponents.howItWorks')}</ThemedText>
            <ThemedText type="body" style={styles.infoText}>
              {t('walletComponents.howItWorksSteps')}
            </ThemedText>
          </ThemedView>
        </MotiView>

        <ThemedView style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop:10
  },

  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 8,
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
  },
  amountInput: {
    flex: 1,
  },
  currency: {
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
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
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
    marginBottom: 8,
  },
  infoText: {
    lineHeight: 20,
    opacity: 0.7,
  },
});
