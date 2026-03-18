import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { MotiView } from 'moti';
import { useLanguage } from '@/components/contexts/language';
import {
  CreditCard,
  AlertCircle,
  Lock,
  Calendar,
  Shield,
  ChevronLeft,
} from 'lucide-react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import Svg, { Path, G, Rect, Circle, Ellipse } from 'react-native-svg';

// Card Brand Icons
const VisaIcon = ({ size = 40 }: { size?: number }) => (
  <Svg width={size} height={size * 0.65} viewBox="0 0 750 471">
    <G fillRule="evenodd">
      <Rect fill="#0E4595" width="750" height="471" rx="40" ry="40" />
      <Path
        d="M278.198 334.228l33.36-195.763h53.358l-33.384 195.763h-53.334zm246.11-191.54c-10.57-3.966-27.135-8.222-47.822-8.222-52.725 0-89.865 26.551-90.18 64.604-.297 28.129 26.515 43.822 46.754 53.185 20.77 9.597 27.752 15.716 27.652 24.283-.133 13.123-16.586 19.116-31.924 19.116-21.355 0-32.701-2.967-50.225-10.274l-6.877-3.112-7.488 43.823c12.463 5.466 35.508 10.199 59.438 10.445 56.09 0 92.502-26.248 92.916-66.884.2-22.27-14.016-39.216-44.801-53.188-18.65-9.056-30.072-15.099-29.951-24.269 0-8.137 9.668-16.838 30.56-16.838 17.446-.271 30.088 3.534 39.936 7.5l4.781 2.259 7.231-42.428m137.308-4.223h-41.23c-12.773 0-22.332 3.486-27.941 16.234l-79.244 179.402h56.031s9.16-24.121 11.232-29.418c6.123 0 60.555.084 68.336.084 1.596 6.854 6.492 29.334 6.492 29.334h49.512l-43.188-195.636zm-65.416 126.408c4.414-11.279 21.26-54.724 21.26-54.724-.316.521 4.379-11.334 7.074-18.684l3.607 16.878s10.217 46.729 12.352 56.53h-44.293zM209.668 142.465l-52.239 133.496-5.567-27.129c-9.727-31.274-40.025-65.157-73.898-82.12l47.766 171.204 56.456-.063 84.004-195.388h-56.522"
        fill="#fff"
      />
      <Path
        d="M131.92 138.465H45.879l-.682 4.073c66.939 16.204 111.232 55.363 129.618 102.415l-18.71-89.96c-3.23-12.396-12.598-16.095-24.185-16.528"
        fill="#F2AE14"
      />
    </G>
  </Svg>
);

const MastercardIcon = ({ size = 40 }: { size?: number }) => (
  <Svg width={size} height={size * 0.65} viewBox="0 0 750 471">
    <G fillRule="evenodd">
      <Rect fill="#000" width="750" height="471" rx="40" ry="40" />
      <Circle fill="#EB001B" cx="250" cy="235" r="145" />
      <Circle fill="#F79E1B" cx="500" cy="235" r="145" />
      <Path
        d="M375 121.5c37.5 29.5 61.5 75.5 61.5 127s-24 97.5-61.5 127c-37.5-29.5-61.5-75.5-61.5-127s24-97.5 61.5-127z"
        fill="#FF5F00"
      />
    </G>
  </Svg>
);

const AmexIcon = ({ size = 40 }: { size?: number }) => (
  <Svg width={size} height={size * 0.65} viewBox="0 0 750 471">
    <G fillRule="evenodd">
      <Rect fill="#2E77BC" width="750" height="471" rx="40" ry="40" />
      <Path
        d="M0 221.73l36.932-85.963h41.62l21.318 62.62v-62.62h51.666l10.07 34.593 9.768-34.593h148.262v10.272s-13.944-10.272-36.628-10.272l-73.656.168 36.334 85.795H209.19l-7.762-17.662h-25.39l-7.762 17.662h-65.06v-62.784l-21.15 62.784H60.18l-21.15-62.784v62.784H0zm61.183-68.793l-10.203 23.46h20.406l-10.203-23.46zm168.88 68.793h-28.27v-64.963l-23.146 64.963h-20.27l-23.146-64.963v64.963h-56.52l-7.762-17.662h-25.39l-7.762 17.662H0l36.932-85.963h41.62l35.15 80.113V135.767h46.178l19.78 55.92 18.094-55.92h47.009v85.963h27.3z"
        fill="#fff"
        transform="translate(129.5 100)"
      />
      <Path
        d="M750 338.47v-52.497h-31.02c-10.87 0-17.255 5.232-20.407 10.773l-.168.168c-.336.508-.672 1.016-.672 1.524v-12.465H750v-35.432H580.94l-16.587 18.162-15.083-18.162h-98.346v85.797h96.674l16.587-18.33 15.083 18.33 62.386.168v-19.178h9.768c10.07 0 18.5-.84 25.726-5.063v24.073H750zm-186.55-17.662h-50.493v-15.144h45.006v-17.662h-45.006v-14.808h52.837l14.28 23.796-16.624 23.818zm74.495 17.326l-28.27-29.535 28.27-29.871v59.406zm-28.438-55.416h21.15v-32.233h-21.15v32.233zm66.9 38.426h-19.604v-22.444h19.436c5.381 0 9.096 4.055 9.096 10.94-.168 7.557-4.217 11.504-8.928 11.504z"
        fill="#fff"
      />
    </G>
  </Svg>
);

const DiscoverIcon = ({ size = 40 }: { size?: number }) => (
  <Svg width={size} height={size * 0.65} viewBox="0 0 750 471">
    <G fillRule="evenodd">
      <Rect fill="#fff" width="750" height="471" rx="40" ry="40" />
      <Path fill="#F47216" d="M0 280h750v151c0 22-18 40-40 40H40c-22 0-40-18-40-40V280z" />
      <Ellipse fill="#F47216" cx="385" cy="235" rx="80" ry="80" />
      <Path
        d="M124 165h28.8c17 0 31.3 3 43 9 14.4 7.4 23.5 21.7 23.5 40 0 18.7-7.8 33.2-23.4 41.5-10.7 5.8-23.8 9-41.5 9h-30.4V165zm24 80.4h5.7c9.6 0 17.3-1.6 22.8-5 6.4-4 10-11.2 10-21.3 0-9.8-3.7-16.8-10-20.8-5.5-3.5-13.2-5.2-22.8-5.2h-5.7v52.3zm93-80.4h24.4v99.5h-24.4V165zm44 70.4l22.6-3.4c1.4 9.6 8.7 15 19.7 15 10 0 15.8-4.2 15.8-10.8 0-4.4-3-7.6-10.3-9.6l-17.5-4.5c-16.4-4.3-24.3-13.8-24.3-28 0-17.6 14.4-30.2 37.6-30.2 21.5 0 36.5 11.5 38.7 28.5l-22 3.6c-1.5-8.4-7.8-13.6-17.5-13.6-9.2 0-14.3 4.2-14.3 10 0 4.4 3 7.4 10 9.3l17.3 4.5c17.3 4.4 25 13.5 25 28.3 0 18.6-15 30.6-39 30.6-23.2 0-39-12.3-41.8-29.7zm100.4.3c0-30.2 22.4-52 53-52 18.3 0 33 7.7 42 20.6l-17.5 13c-5.8-8.4-14-13.2-25-13.2-16.6 0-28.2 12.5-28.2 31.6 0 19 11.6 31.6 28.2 31.6 11 0 19.2-4.8 25-13.2l17.5 13c-9 12.8-23.7 20.5-42 20.5-30.6 0-53-21.8-53-51.9zm218.2 21.8l22.6 7c-6 21-24.6 34.2-48.4 34.2-30.6 0-53.5-22-53.5-52s22.8-52 53.4-52c23.7 0 42.4 13.3 48.4 34.2l-22.6 7c-3.5-12.3-13-19.4-26-19.4-17.3 0-29 12.5-29 30.2s11.7 30.2 29 30.2c13 0 22.5-7.2 26-19.4zM633 165h60.3v19.5h-35.8v20h35v19.5h-35v21h35.8v19.5H633V165z"
        fill="#000"
      />
    </G>
  </Svg>
);

// Card type icon component
const CardTypeIcon = ({ type, size = 40, highlighted = false }: { type: 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown'; size?: number; highlighted?: boolean }) => {
  const opacity = highlighted ? 1 : 0.4;

  return (
    <View style={{ opacity }}>
      {type === 'visa' && <VisaIcon size={size} />}
      {type === 'mastercard' && <MastercardIcon size={size} />}
      {type === 'amex' && <AmexIcon size={size} />}
      {type === 'discover' && <DiscoverIcon size={size} />}
    </View>
  );
};

// Card logos row component
const CardLogosRow = ({ currentCardType, size = 32 }: { currentCardType: 'visa' | 'mastercard' | 'amex' | 'unknown'; size?: number }) => {
  const cardTypes: Array<'visa' | 'mastercard' | 'amex' | 'discover'> = ['visa', 'mastercard', 'amex', 'discover'];

  return (
    <ThemedView style={cardLogosStyles.container}>
      {cardTypes.map((type) => (
        <CardTypeIcon
          key={type}
          type={type}
          size={size}
          highlighted={currentCardType === type || currentCardType === 'unknown'}
        />
      ))}
    </ThemedView>
  );
};

const cardLogosStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export interface CardData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

interface CardPaymentFormProps {
  onBack?: () => void;
  onConfirm: (cardData: CardData) => void;
  amount?: number;
  currency?: string;
  isLoading?: boolean;
}

export const CardPaymentForm: React.FC<CardPaymentFormProps> = ({
  onBack,
  onConfirm,
  amount = 0,
  currency = 'XOF',
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'amex' | 'unknown'>('unknown');

  // Detect card type from number
  const detectCardType = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    return 'unknown';
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    const groups = cleanValue.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleanValue;
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length >= 2) {
      return cleanValue.slice(0, 2) + '/' + cleanValue.slice(2, 4);
    }
    return cleanValue;
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
      setCardType(detectCardType(formatted));
      if (errors.cardNumber) {
        setErrors(prev => ({ ...prev, cardNumber: '' }));
      }
    }
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiryDate(value.replace('/', ''));
    if (formatted.length <= 5) {
      setExpiryDate(formatted);
      if (errors.expiryDate) {
        setErrors(prev => ({ ...prev, expiryDate: '' }));
      }
    }
  };

  const handleCvvChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    const maxLength = cardType === 'amex' ? 4 : 3;
    if (cleanValue.length <= maxLength) {
      setCvv(cleanValue);
      if (errors.cvv) {
        setErrors(prev => ({ ...prev, cvv: '' }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate card number
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (!cleanCardNumber) {
      newErrors.cardNumber = t('walletComponents.cardNumberRequired');
    } else if (cleanCardNumber.length < 15) {
      newErrors.cardNumber = t('walletComponents.invalidCardNumber');
    }

    // Validate expiry
    if (!expiryDate) {
      newErrors.expiryDate = t('walletComponents.expiryRequired');
    } else {
      const [month, year] = expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;

      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = t('walletComponents.invalidMonth');
      } else if (
        parseInt(year) < currentYear ||
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)
      ) {
        newErrors.expiryDate = t('walletComponents.cardExpired');
      }
    }

    // Validate CVV
    const expectedCvvLength = cardType === 'amex' ? 4 : 3;
    if (!cvv) {
      newErrors.cvv = t('walletComponents.cvvRequired');
    } else if (cvv.length !== expectedCvvLength) {
      newErrors.cvv = t('walletComponents.cvvMustBe', { length: expectedCvvLength });
    }

    // Validate cardholder name
    if (!cardholderName.trim()) {
      newErrors.cardholderName = t('walletComponents.cardholderNameRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateForm()) {
      onConfirm({
        cardNumber: cardNumber.replace(/\s/g, ''),
        expiryDate,
        cvv,
        cardholderName,
      });
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
    <ThemedView style={{ flex: 1, }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ThemedView
          style={[styles.pageContent, { backgroundColor: theme.surface }]}
        >
        

          <ScrollView style={styles.pageBody} showsVerticalScrollIndicator={false}>
            {/* Card Logos */}
            <ThemedView style={styles.cardLogosContainer}>
              <CardLogosRow currentCardType={cardType} size={36} />
            </ThemedView>

            {/* Form Fields */}
            <ThemedView style={styles.formContainer}>
              {/* Card Number */}
              <ThemedView style={styles.inputGroup}>
                <ThemedText type = "normal" style = {{color: theme.text }}>{t('walletComponents.cardNumber')}</ThemedText>
                <ThemedView style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.surfaceVariant,
                    borderColor: errors.cardNumber ? theme.error : theme.outline + '30',
                  }
                ]}>
                  <CreditCard size={20} color={theme.onSurface + '70'} />
                  <TextInput
                    style={[styles.input, { color: theme.onSurface }]}
                    placeholder={t('walletComponents.cardNumberPlaceholder')}
                    placeholderTextColor={theme.onSurface + '40'}
                    value={cardNumber}
                    onChangeText={handleCardNumberChange}
                    keyboardType="number-pad"
                    maxLength={19}
                  />
                </ThemedView>
                {errors.cardNumber && (
                  <ThemedView style={styles.errorRow}>
                    <AlertCircle size={14} color={theme.error} />
                    <ThemedText style={{ color: theme.error }}>
                      {errors.cardNumber}
                    </ThemedText>
                  </ThemedView>
                )}
              </ThemedView>

              {/* Cardholder Name */}
              <ThemedView style={styles.inputGroup}>
                <ThemedText type = "normal" style = {{color: theme.text}}>{t('walletComponents.cardholderName')}</ThemedText>
                <ThemedView style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.surfaceVariant,
                    borderColor: errors.cardholderName ? theme.error : theme.outline + '30',
                  }
                ]}>
                  <TextInput
                    style={[styles.input, { color: theme.onSurface }]}
                    placeholder={t('walletComponents.cardholderNamePlaceholder')}
                    placeholderTextColor={theme.onSurface + '40'}
                    value={cardholderName}
                    onChangeText={(v) => {
                      setCardholderName(v);
                      if (errors.cardholderName) setErrors(prev => ({ ...prev, cardholderName: '' }));
                    }}
                    autoCapitalize="characters"
                  />
                </ThemedView>
                {errors.cardholderName && (
                  <ThemedView style={styles.errorRow}>
                    <AlertCircle size={14} color={theme.error} />
                    <ThemedText style={[styles.errorText, { color: theme.error }]}>
                      {errors.cardholderName}
                    </ThemedText>
                  </ThemedView>
                )}
              </ThemedView>

              {/* Expiry and CVV */}
              <ThemedView style={styles.rowInputs}>
                <ThemedView style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <ThemedText type ="normal" style = {{color: theme.text}}>{t('walletComponents.expiryDate')}</ThemedText>
                  <ThemedView style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: theme.surfaceVariant,
                      borderColor: errors.expiryDate ? theme.error : theme.outline + '30',
                    }
                  ]}>
                    <Calendar size={20} color={theme.onSurface + '60'} />
                    <TextInput
                      style={[styles.input, { color: theme.onSurface }]}
                      placeholder={t('walletComponents.expiryPlaceholder')}
                      placeholderTextColor={theme.onSurface + '40'}
                      value={expiryDate}
                      onChangeText={handleExpiryChange}
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </ThemedView>
                  {errors.expiryDate && (
                    <ThemedView style={styles.errorRow}>
                      <AlertCircle size={14} color={theme.error} />
                      <ThemedText style={[styles.errorText, { color: theme.error }]}>
                        {errors.expiryDate}
                      </ThemedText>
                    </ThemedView>
                  )}
                </ThemedView>

                <ThemedView style={[styles.inputGroup, { flex: 1 }]}>
                  <ThemedText style={{ color: theme.text}}>CVV</ThemedText>
                  <ThemedView style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: theme.surfaceVariant,
                      borderColor: errors.cvv ? theme.error : theme.outline + '30',
                    }
                  ]}>
                    <Lock size={20} color={theme.onSurface + '60'} />
                    <TextInput
                      style={[styles.input, { color: theme.onSurface }]}
                      placeholder={cardType === 'amex' ? '1234' : '123'}
                      placeholderTextColor={theme.onSurface + '40'}
                      value={cvv}
                      onChangeText={handleCvvChange}
                      keyboardType="number-pad"
                      secureTextEntry
                      maxLength={cardType === 'amex' ? 4 : 3}
                    />
                  </ThemedView>
                  {errors.cvv && (
                    <ThemedView style={styles.errorRow}>
                      <AlertCircle size={14} color={theme.error} />
                      <ThemedText style={[styles.errorText, { color: theme.error }]}>
                        {errors.cvv}
                      </ThemedText>
                    </ThemedView>
                  )}
                </ThemedView>
              </ThemedView>

              {/* Security Notice */}
              <ThemedView style={[styles.securityNotice, { backgroundColor: theme.primary + '10' }]}>
                <Shield size={20} color={theme.primary} />
                <ThemedText style={[styles.securityText, { color: theme.text + '99' }]}>
                  {t('walletComponents.securePaymentInfo')}
                </ThemedText>
              </ThemedView>

              {/* Amount Summary */}
              {amount > 0 && (
                <ThemedView style={[styles.summaryBox, { backgroundColor: theme.surfaceVariant }]}>
                  <ThemedText style={styles.summaryLabel}>{t('walletComponents.amountToPay')}</ThemedText>
                  <ThemedText type="subtitle" style={{ color: theme.secondary }}>
                    {formatCurrency(amount)} {currency}
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          </ScrollView>

          {/* Footer */}
          <ThemedView style={styles.pageFooter}>
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={isLoading}
              style={[
                styles.confirmButton,
                { backgroundColor: isLoading ? theme.outline : theme.primary },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Lock size={20} color="white" />
                  <ThemedText type="normal" style={styles.confirmButtonText}>
                    {t('walletComponents.payAmount', { amount: formatCurrency(amount), currency })}
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  pageContent: {
    flex: 1,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  pageBody: {
    flex: 1,
    padding: 14,
  },
  pageFooter: {
    padding: 20,
    paddingBottom: 32,
  },
  cardLogosContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    opacity: 0.8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
  },
  securityText: {
    flex: 1,
    lineHeight: 18,
  },
  summaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  summaryLabel: {
    fontWeight: '600',
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

export default CardPaymentForm;
