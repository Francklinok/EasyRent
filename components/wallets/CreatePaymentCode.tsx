import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert, Share } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import {
  ArrowLeft,
  Home,
  Calendar,
  FileText,
  Copy,
  Share2,
  CheckCircle2,
  QrCode as QrCodeIcon,
  AlertCircle
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';

interface CreatePaymentCodeProps {
  onBack: () => void;
  onCreate: (paymentData: any) => Promise<{ code: string; id: string }>;
  formatAmount: (amount: number) => string;
}

export const CreatePaymentCode: React.FC<CreatePaymentCodeProps> = ({
  onBack,
  onCreate,
  formatAmount
}) => {
  const { theme } = useTheme();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [propertyRef, setPropertyRef] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentCode, setPaymentCode] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generatePaymentCode = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    if (!description) {
      Alert.alert('Erreur', 'Veuillez entrer une description');
      return;
    }

    try {
      setLoading(true);

      const paymentData = {
        amount: parseFloat(amount),
        description,
        propertyRef: propertyRef || undefined,
        tenantEmail: tenantEmail || undefined,
        dueDate: dueDate || undefined,
        type: 'rent',
        status: 'pending',
        allowedMethods: ['mobile_money', 'card', 'bank', 'paypal', 'wallet']
      };

      const result = await onCreate(paymentData);

      setPaymentCode(result.code);
      setPaymentId(result.id);

      Alert.alert(
        'Code créé avec succès !',
        `Code de paiement : ${result.code}\n\nPartagez ce code avec votre locataire.`
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer le code de paiement');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (paymentCode) {
      await Clipboard.setStringAsync(paymentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Alert.alert('Copié', 'Le code a été copié dans le presse-papiers');
    }
  };

  const shareCode = async () => {
    if (paymentCode && amount) {
      try {
        await Share.share({
          message: `Paiement de loyer\n\nMontant: ${formatAmount(parseFloat(amount))}\nDescription: ${description}\n\nCode de paiement: ${paymentCode}\n\nUtilisez ce code pour payer via l'application.`,
          title: 'Code de paiement'
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setPropertyRef('');
    setTenantEmail('');
    setDueDate('');
    setPaymentCode(null);
    setPaymentId(null);
  };

  if (paymentCode) {
    // Vue du code généré
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <ArrowLeft size={24} color={theme.onSurface} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Code de paiement</ThemedText>
            <View style={{ width: 40 }} />
          </View>

          {/* Success Icon */}
          <MotiView
            from={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' }}
            style={styles.successIconContainer}
          >
            <View style={[styles.successIcon, { backgroundColor: theme.success + '20' }]}>
              <CheckCircle2 size={64} color={theme.success} />
            </View>
          </MotiView>

          {/* Payment Code Display */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
            style={styles.codeSection}
          >
            <ThemedText style={styles.codeLabel}>Code de paiement</ThemedText>
            <View style={[styles.codeContainer, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
              <ThemedText style={[styles.codeText, { color: theme.primary }]}>
                {paymentCode}
              </ThemedText>
            </View>
          </MotiView>

          {/* QR Code */}
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 300 }}
            style={styles.qrSection}
          >
            <View style={[styles.qrContainer, { backgroundColor: 'white' }]}>
              <QRCode
                value={JSON.stringify({
                  type: 'payment',
                  code: paymentCode,
                  amount: parseFloat(amount),
                  description,
                  id: paymentId
                })}
                size={200}
                backgroundColor="white"
                color={theme.primary}
                logo={require('@/assets/images/icon.png')}
                logoSize={40}
                logoBackgroundColor="white"
                logoBorderRadius={8}
              />
            </View>
            <ThemedText style={styles.qrLabel}>
              Scannez ce code pour payer
            </ThemedText>
          </MotiView>

          {/* Payment Details */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400 }}
            style={[styles.detailsCard, { backgroundColor: theme.surfaceVariant }]}
          >
            <ThemedText style={styles.detailsTitle}>Détails du paiement</ThemedText>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Montant</ThemedText>
              <ThemedText style={styles.detailValue}>{formatAmount(parseFloat(amount))}</ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Description</ThemedText>
              <ThemedText style={styles.detailValue}>{description}</ThemedText>
            </View>

            {propertyRef && (
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Propriété</ThemedText>
                <ThemedText style={styles.detailValue}>{propertyRef}</ThemedText>
              </View>
            )}

            {tenantEmail && (
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Locataire</ThemedText>
                <ThemedText style={styles.detailValue}>{tenantEmail}</ThemedText>
              </View>
            )}

            {dueDate && (
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Date limite</ThemedText>
                <ThemedText style={styles.detailValue}>{dueDate}</ThemedText>
              </View>
            )}
          </MotiView>

          {/* Action Buttons */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 500 }}
            style={styles.actionsContainer}
          >
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={copyCode}
                style={[styles.actionButton, { backgroundColor: theme.primary }]}
              >
                {copied ? (
                  <CheckCircle2 size={20} color="white" />
                ) : (
                  <Copy size={20} color="white" />
                )}
                <ThemedText style={styles.actionButtonText}>
                  {copied ? 'Copié !' : 'Copier'}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={shareCode}
                style={[styles.actionButton, { backgroundColor: theme.success }]}
              >
                <Share2 size={20} color="white" />
                <ThemedText style={styles.actionButtonText}>Partager</ThemedText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={resetForm}
              style={[styles.newCodeButton, { borderColor: theme.primary }]}
            >
              <ThemedText style={[styles.newCodeButtonText, { color: theme.primary }]}>
                Créer un nouveau code
              </ThemedText>
            </TouchableOpacity>
          </MotiView>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Formulaire de création
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.onSurface} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Créer code de paiement</ThemedText>
          <View style={{ width: 40 }} />
        </View>

        {/* Info Banner */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={[styles.infoBanner, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }]}
        >
          <AlertCircle size={20} color={theme.primary} />
          <ThemedText style={styles.infoText}>
            Générez un code unique que votre locataire pourra utiliser pour payer
          </ThemedText>
        </MotiView>

        {/* Amount Input */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100 }}
          style={styles.inputSection}
        >
          <ThemedText style={styles.inputLabel}>Montant du loyer</ThemedText>
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

        {/* Description Input */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 150 }}
          style={styles.inputSection}
        >
          <ThemedText style={styles.inputLabel}>
            <FileText size={16} color={theme.onSurface} /> Description
          </ThemedText>
          <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Ex: Loyer Janvier 2025"
              style={[styles.input, { color: theme.onSurface }]}
              placeholderTextColor={theme.onSurface + '40'}
            />
          </View>
        </MotiView>

        {/* Property Reference (optional) */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200 }}
          style={styles.inputSection}
        >
          <ThemedText style={styles.inputLabel}>
            <Home size={16} color={theme.onSurface} /> Référence propriété (optionnel)
          </ThemedText>
          <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
            <TextInput
              value={propertyRef}
              onChangeText={setPropertyRef}
              placeholder="Ex: APT-123"
              style={[styles.input, { color: theme.onSurface }]}
              placeholderTextColor={theme.onSurface + '40'}
            />
          </View>
        </MotiView>

        {/* Tenant Email (optional) */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 250 }}
          style={styles.inputSection}
        >
          <ThemedText style={styles.inputLabel}>Email locataire (optionnel)</ThemedText>
          <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
            <TextInput
              value={tenantEmail}
              onChangeText={setTenantEmail}
              placeholder="locataire@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, { color: theme.onSurface }]}
              placeholderTextColor={theme.onSurface + '40'}
            />
          </View>
        </MotiView>

        {/* Due Date (optional) */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300 }}
          style={styles.inputSection}
        >
          <ThemedText style={styles.inputLabel}>
            <Calendar size={16} color={theme.onSurface} /> Date limite (optionnel)
          </ThemedText>
          <View style={[styles.inputContainer, { borderColor: theme.outline + '30' }]}>
            <TextInput
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD"
              style={[styles.input, { color: theme.onSurface }]}
              placeholderTextColor={theme.onSurface + '40'}
            />
          </View>
        </MotiView>

        {/* Generate Button */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 350 }}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            onPress={generatePaymentCode}
            disabled={loading || !amount || !description}
            style={{ width: '100%' }}
          >
            <LinearGradient
              colors={
                loading || !amount || !description
                  ? [theme.outline + '40', theme.outline + '40']
                  : [theme.primary, theme.primary + 'DD']
              }
              style={styles.generateButton}
            >
              <QrCodeIcon size={24} color="white" />
              <ThemedText style={styles.generateButtonText}>
                {loading ? 'Génération...' : 'Générer le code de paiement'}
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
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
  buttonContainer: {
    marginTop: 16,
  },
  generateButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  codeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.7,
  },
  codeContainer: {
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  codeText: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrContainer: {
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 12,
  },
  qrLabel: {
    fontSize: 14,
    opacity: 0.6,
  },
  detailsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
  newCodeButton: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  newCodeButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
