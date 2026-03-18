import React, { useState } from 'react';
import {
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
  SafeAreaView,
} from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/themehook';
import { MotiView } from 'moti';
import { useLanguage } from '@/components/contexts/language';
import {
  AlertCircle,
  Shield,
  Mail,
  ExternalLink,
  Info,
  ChevronLeft,
} from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';

export interface PayPalData {
  email: string;
  usePayPalCheckout: boolean;
}

interface PayPalPaymentFormProps {
  onBack?: () => void;
  onConfirm: (paypalData: PayPalData) => void;
  amount?: number;
  currency?: string;
  isLoading?: boolean;
  redirectUrl?: string;
}

export const PayPalPaymentForm: React.FC<PayPalPaymentFormProps> = ({
  onBack,
  onConfirm,
  amount = 0,
  currency = 'XOF',
  isLoading = false,
  redirectUrl,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [usePayPalCheckout, setUsePayPalCheckout] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleConfirm = () => {
    if (!usePayPalCheckout && !email.trim()) {
      setError(t('walletComponents.enterPaypalEmail'));
      return;
    }

    if (!usePayPalCheckout && !validateEmail(email)) {
      setError(t('walletComponents.invalidEmail'));
      return;
    }

    setError(null);
    onConfirm({
      email: usePayPalCheckout ? '' : email,
      usePayPalCheckout,
    });
  };

  const handleOpenPayPal = async () => {
    if (redirectUrl) {
      try {
        await Linking.openURL(redirectUrl);
      } catch (error) {
        console.error('Could not open PayPal:', error);
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const backgroundColor = Array.isArray(theme.background) ? theme.background[0] : theme.background;

  return (
    <ThemedView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
          <ScrollView style={styles.pageBody} showsVerticalScrollIndicator={false}>
            {/* PayPal Logo Section */}
            <ThemedView
              style={styles.paypalBanner}
            >
              <ThemedView style={styles.paypalLogoContainer}>
                <Ionicons name="logo-paypal" size={48} color={  theme.blue700} />
              </ThemedView>
              <ThemedText type="subtitle" intensity="strong" style = {{color: theme.text, marginBottom: 8}}>
                {t('walletComponents.paypalSecurePayment')}
              </ThemedText>
              <ThemedText type="body" intensity = "light" style={[styles.paypalSubtitle, { color: theme.text  }]}>
                {t('walletComponents.paypalSubtitle')}
              </ThemedText>
            </ThemedView>

            {/* Payment Options */}
            <ThemedView style={styles.optionsContainer}>
              <ThemedText type="normal" style = {{color: theme.text}}>{t('walletComponents.paymentMode')}</ThemedText>

              {/* Option 1: PayPal Checkout */}
              <TouchableOpacity
                onPress={() => {
                  setUsePayPalCheckout(true);
                  setError(null);
                }}
                style={[
                  styles.optionCard,
                  {
                    borderColor: usePayPalCheckout ? theme.blue700 : theme.outline + '30',
                  },
                ]}
              >
                <ThemedView style={styles.optionLeft}>
                  <ThemedView style={[
                    styles.radioOuter,
                    { borderColor: usePayPalCheckout ? theme.blue700  : theme.outline }
                  ]}>
                    {usePayPalCheckout && (
                      <ThemedView style={[styles.radioInner, { backgroundColor: theme.blue700  }]} />
                    )}
                  </ThemedView>
                  <ThemedView style={styles.optionInfo}>
                    <ThemedText type="normal" intensity="strong" style = {{color: theme.text}}>{t('walletComponents.paypalLogin')}</ThemedText>
                    <ThemedText type="caption" intensity="light" style={{ color: theme.text }}>
                      {t('walletComponents.paypalLoginDesc')}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                <ExternalLink size={20} color={theme.onSurface + '80'} />
              </TouchableOpacity>

              {/* Option 2: Email PayPal */}
              <TouchableOpacity
                onPress={() => {
                  setUsePayPalCheckout(false);
                  setError(null);
                }}
                style={[
                  styles.optionCard,
                  {
                    borderColor: !usePayPalCheckout ? theme.blue700  : theme.outline + '30',
                  },
                ]}
              >
                <ThemedView style={styles.optionLeft}>
                  <ThemedView style={[
                    styles.radioOuter,
                    { borderColor: !usePayPalCheckout ? theme.blue700  : theme.outline }
                  ]}>
                    {!usePayPalCheckout && (
                      <ThemedView style={[styles.radioInner, { backgroundColor: theme.blue700 }]} />
                    )}
                  </ThemedView>
                  <ThemedView style={styles.optionInfo}>
                    <ThemedText type="normal" intensity="strong" style = {{color: theme.text}}>{t('walletComponents.paypalEmail')}</ThemedText>
                    <ThemedText type="caption" intensity='light' style={{ color: theme.text}}>
                      {t('walletComponents.paypalEmailDesc')}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                <Mail size={20} color={theme.onSurface + '60'} />
              </TouchableOpacity>

              {/* Email Input (if not using checkout) */}
              {!usePayPalCheckout && (
                <MotiView
                  from={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={styles.emailInputContainer}
                >
                  <ThemedText type="body" style = {{color: theme.text}}>{t('walletComponents.paypalEmail')}</ThemedText>
                  <ThemedView style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: theme.surfaceVariant,
                      borderColor: error ? theme.error : theme.outline + '30',
                    }
                  ]}>
                    <Mail size={20} color={theme.onSurface + '60'} />
                    <TextInput
                      style={[styles.input, { color: theme.onSurface }]}
                      placeholder={t('walletComponents.paypalEmailPlaceholder')}
                      placeholderTextColor={theme.onSurface + '40'}
                      value={email}
                      onChangeText={(v) => {
                        setEmail(v);
                        if (error) setError(null);
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </ThemedView>
                  {error && (
                    <ThemedView style={styles.errorRow}>
                      <AlertCircle size={14} color={theme.error} />
                      <ThemedText type="caption" style={{ color: theme.error }}>
                        {error}
                      </ThemedText>
                    </ThemedView>
                  )}
                </MotiView>
              )}
            </ThemedView>

            {/* Info Box */}
            <ThemedView style={[styles.infoBox, { backgroundColor: theme.surfaceVariant }]}>
              <Info size={20} color={theme.primary} />
              <ThemedText type="body" style={{ color: theme.text + '99', flex: 1}}>
                {usePayPalCheckout
                  ? t('walletComponents.paypalRedirectInfo')
                  : t('walletComponents.paypalEmailInfo')}
              </ThemedText>
            </ThemedView>

            {/* Security Notice */}
            <ThemedView style={[styles.securityNotice, { backgroundColor: theme.blue700  + '10' }]}>
              <Shield size={20} color= {theme.blue700 }/>
              <ThemedText type="normal" intensity="strong" style={{ color: theme.text + '99' }}>
                {t('walletComponents.paypalBuyerProtection')}
              </ThemedText>
            </ThemedView>

            {/* Amount Summary */}
            {amount > 0 && (
              <ThemedView style={[styles.summaryBox, { backgroundColor: theme.surfaceVariant }]}>
                <ThemedText type="normal" intensity="strong">{t('walletComponents.amountToPay')}</ThemedText>
                <ThemedText type="subtitle" style={{ color: theme.blue700  }}>
                  {formatCurrency(amount)} {currency}
                </ThemedText>
              </ThemedView>
            )}
          </ScrollView>

          {/* Footer */}
          <ThemedView style={styles.pageFooter}>
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={isLoading}
              style={[
                styles.confirmButton,
                { backgroundColor: isLoading ? theme.outline : theme.blue700  },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="logo-paypal" size={20} color="white" />
                  <ThemedText type="normal" style={styles.confirmButtonText}>
                    {usePayPalCheckout ? t('walletComponents.continueToPaypal') : t('walletComponents.confirmPayment')}
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </ThemedView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  pageContent: {
    flex: 1,
  },
 
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  paypalIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageBody: {
    flex: 1,
    padding: 10,
    paddingTop:0
  },
  pageFooter: {
    padding: 20,
    paddingBottom: 32,
  },
  paypalBanner: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 10,
  },
  paypalLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#003087' + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  paypalTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  paypalSubtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 4,
    opacity: 0.8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionInfo: {
    flex: 1,
    gap: 2,
  },
  emailInputContainer: {
    marginTop: 12,
    gap: 8,
  },
  inputLabel: {
    opacity: 0.8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  summaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  confirmButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '700',
  },
});

export default PayPalPaymentForm;
