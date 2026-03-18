import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useLanguage } from '@/components/contexts/language';
import { paymentConfigService } from '@/services/PaymentConfigService';
import { BankCardConfig, MOBILE_MONEY_COUNTRIES, CountryMobileMoneyConfig, MobileMoneyOperator } from '@/types/payment';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type PaymentMethod = 'card' | 'mobile_money' | 'wallet';

interface PaymentSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (paymentData: PaymentData) => Promise<void>;
  amount: number;
  currency?: string;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  walletBalance?: number;
}

export interface PaymentData {
  method: PaymentMethod;
  paymentMethodId: string;
  card?: {
    number: string;
    expiry: string;
    cvv: string;
    holder: string;
    last4: string;
    brand: 'visa' | 'mastercard' | 'amex';
  };
  mobileMoney?: {
    phoneNumber: string;
    operator: string;
    country: string;
  };
  saveCard?: boolean;
}

// --- Card Validation Helpers ---
function detectCardBrand(number: string): 'visa' | 'mastercard' | 'amex' | null {
  const cleaned = number.replace(/\s/g, '');
  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  return null;
}

function luhnCheck(num: string): boolean {
  const cleaned = num.replace(/\s/g, '');
  if (!/^\d+$/.test(cleaned) || cleaned.length < 13) return false;
  let sum = 0;
  let alternate = false;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let n = parseInt(cleaned[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

function formatCardNumber(text: string): string {
  const cleaned = text.replace(/\D/g, '').slice(0, 16);
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(text: string): string {
  const cleaned = text.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length > 2) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  return cleaned;
}

function isExpiryValid(expiry: string): boolean {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const cardDate = new Date(year, month);
  return cardDate > now;
}

const CARD_ICONS: Record<string, string> = {
  visa: 'card',
  mastercard: 'card',
  amex: 'card',
};

export default function PaymentSheet({
  visible,
  onClose,
  onConfirm,
  amount,
  currency = 'EUR',
  planName,
  billingCycle,
  walletBalance = 0,
}: PaymentSheetProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const [activeMethod, setActiveMethod] = useState<PaymentMethod>('card');
  const [step, setStep] = useState<'form' | 'confirm' | 'processing' | 'success' | 'error'>('form');

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [savedCard, setSavedCard] = useState<BankCardConfig | null>(null);
  const [useSavedCard, setUseSavedCard] = useState(false);

  // Mobile money fields
  const [mmPhone, setMmPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryMobileMoneyConfig>(MOBILE_MONEY_COUNTRIES[0]);
  const [selectedOperator, setSelectedOperator] = useState<MobileMoneyOperator | null>(null);

  // Load saved card on mount
  useEffect(() => {
    if (visible) {
      paymentConfigService.getBankCardConfig().then(config => {
        if (config) {
          setSavedCard(config);
          setUseSavedCard(true);
        }
      });
      // Reset state
      setStep('form');
    }
  }, [visible]);

  const cardBrand = detectCardBrand(cardNumber);
  const isCardValid =
    useSavedCard && savedCard
      ? true
      : luhnCheck(cardNumber) && isExpiryValid(cardExpiry) && cardCVV.length >= 3 && cardHolder.trim().length > 2;

  const isMobileMoneyValid = mmPhone.length >= 8 && selectedOperator !== null;
  const isWalletValid = walletBalance >= amount;

  const canProceed =
    (activeMethod === 'card' && isCardValid) ||
    (activeMethod === 'mobile_money' && isMobileMoneyValid) ||
    (activeMethod === 'wallet' && isWalletValid);

  const handleConfirm = useCallback(async () => {
    setStep('processing');
    try {
      let paymentData: PaymentData;

      if (activeMethod === 'card') {
        const last4 = useSavedCard && savedCard
          ? savedCard.cardNumber
          : cardNumber.replace(/\s/g, '').slice(-4);
        const brand = useSavedCard && savedCard
          ? savedCard.cardType
          : (cardBrand || 'visa');

        paymentData = {
          method: 'card',
          paymentMethodId: `pm_card_${Date.now()}`,
          card: {
            number: useSavedCard ? `****${savedCard!.cardNumber}` : cardNumber.replace(/\s/g, ''),
            expiry: useSavedCard ? `${savedCard!.expiryMonth}/${savedCard!.expiryYear}` : cardExpiry,
            cvv: useSavedCard ? '***' : cardCVV,
            holder: useSavedCard ? savedCard!.cardHolder : cardHolder,
            last4,
            brand,
          },
          saveCard,
        };

        // Save card if requested
        if (saveCard && !useSavedCard) {
          await paymentConfigService.saveBankCardConfig({
            type: 'bank_card',
            cardNumber: cardNumber.replace(/\s/g, '').slice(-4),
            cardHolder,
            expiryMonth: cardExpiry.split('/')[0],
            expiryYear: cardExpiry.split('/')[1],
            cardType: brand as 'visa' | 'mastercard' | 'amex',
            isDefault: true,
            isConfigured: true,
          });
        }
      } else if (activeMethod === 'mobile_money') {
        paymentData = {
          method: 'mobile_money',
          paymentMethodId: `pm_mm_${Date.now()}`,
          mobileMoney: {
            phoneNumber: mmPhone,
            operator: selectedOperator!.code,
            country: selectedCountry.countryCode,
          },
        };
      } else {
        paymentData = {
          method: 'wallet',
          paymentMethodId: `pm_wallet_${Date.now()}`,
        };
      }

      await onConfirm(paymentData);
      setStep('success');
    } catch {
      setStep('error');
    }
  }, [
    activeMethod, cardNumber, cardExpiry, cardCVV, cardHolder,
    saveCard, useSavedCard, savedCard, cardBrand,
    mmPhone, selectedOperator, selectedCountry,
    onConfirm, amount,
  ]);

  const resetAndClose = () => {
    setStep('form');
    setCardNumber('');
    setCardExpiry('');
    setCardCVV('');
    setCardHolder('');
    setSaveCard(false);
    setUseSavedCard(false);
    setMmPhone('');
    setSelectedOperator(null);
    onClose();
  };

  // --- Method Tab ---
  const MethodTab = ({ method, icon, label }: { method: PaymentMethod; icon: string; label: string }) => (
    <TouchableOpacity
      onPress={() => { setActiveMethod(method); setStep('form'); }}
      style={{
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: activeMethod === method ? theme.primary : 'transparent',
      }}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={activeMethod === method ? theme.primary : theme.onSurfaceVariant}
      />
      <ThemedText
        type="caption"
        style={{
          marginTop: 4,
          color: activeMethod === method ? theme.primary : theme.onSurfaceVariant,
          fontWeight: activeMethod === method ? '600' : '400',
        }}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  const inputStyle = {
    backgroundColor: theme.surfaceVariant,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: theme.onSurface,
    borderWidth: 1,
    borderColor: theme.outline + '30',
    marginBottom: 12,
  };

  // --- Card Form ---
  const renderCardForm = () => (
    <ThemedView backgroundColor="transparent" style={{ gap: 4 }}>
      {/* Saved card option */}
      {savedCard && (
        <TouchableOpacity
          onPress={() => setUseSavedCard(!useSavedCard)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 14,
            borderRadius: 12,
            backgroundColor: useSavedCard ? theme.primary + '15' : theme.surfaceVariant,
            borderWidth: 1,
            borderColor: useSavedCard ? theme.primary : theme.outline + '30',
            marginBottom: 12,
          }}
        >
          <Ionicons
            name={useSavedCard ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={useSavedCard ? theme.primary : theme.onSurfaceVariant}
          />
          <ThemedView backgroundColor="transparent" style={{ marginLeft: 12, flex: 1 }}>
            <ThemedText type="body" intensity="strong">
              •••• •••• •••• {savedCard.cardNumber}
            </ThemedText>
            <ThemedText type="caption" intensity="light">
              {savedCard.cardHolder} - {savedCard.expiryMonth}/{savedCard.expiryYear}
            </ThemedText>
          </ThemedView>
          <ThemedText type="caption" style={{ color: theme.primary, textTransform: 'uppercase' }}>
            {savedCard.cardType}
          </ThemedText>
        </TouchableOpacity>
      )}

      {(!useSavedCard || !savedCard) && (
        <>
          {/* Card Number */}
          <ThemedView backgroundColor="transparent">
            <ThemedText type="caption" intensity="medium" style={{ marginBottom: 6 }}>
              {t('payment.cardNumber')}
            </ThemedText>
            <ThemedView
              style={{
                ...inputStyle,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <TextInput
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={theme.onSurfaceVariant + '60'}
                keyboardType="number-pad"
                maxLength={19}
                style={{ flex: 1, fontSize: 15, color: theme.onSurface }}
              />
              {cardBrand && (
                <ThemedText type="caption" style={{ color: theme.primary, fontWeight: '700', textTransform: 'uppercase' }}>
                  {cardBrand}
                </ThemedText>
              )}
            </ThemedView>
          </ThemedView>

          {/* Expiry + CVV row */}
          <ThemedView backgroundColor="transparent" style={{ flexDirection: 'row', gap: 12 }}>
            <ThemedView backgroundColor="transparent" style={{ flex: 1 }}>
              <ThemedText type="caption" intensity="medium" style={{ marginBottom: 6 }}>
                {t('payment.expiry')}
              </ThemedText>
              <TextInput
                value={cardExpiry}
                onChangeText={(text) => setCardExpiry(formatExpiry(text))}
                placeholder="MM/YY"
                placeholderTextColor={theme.onSurfaceVariant + '60'}
                keyboardType="number-pad"
                maxLength={5}
                style={inputStyle}
              />
            </ThemedView>
            <ThemedView backgroundColor="transparent" style={{ flex: 1 }}>
              <ThemedText type="caption" intensity="medium" style={{ marginBottom: 6 }}>
                CVV
              </ThemedText>
              <TextInput
                value={cardCVV}
                onChangeText={(text) => setCardCVV(text.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                placeholderTextColor={theme.onSurfaceVariant + '60'}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                style={inputStyle}
              />
            </ThemedView>
          </ThemedView>

          {/* Card Holder */}
          <ThemedView backgroundColor="transparent">
            <ThemedText type="caption" intensity="medium" style={{ marginBottom: 6 }}>
              {t('payment.cardHolder')}
            </ThemedText>
            <TextInput
              value={cardHolder}
              onChangeText={setCardHolder}
              placeholder={t('payment.cardHolderPlaceholder')}
              placeholderTextColor={theme.onSurfaceVariant + '60'}
              autoCapitalize="words"
              style={inputStyle}
            />
          </ThemedView>

          {/* Save card toggle */}
          <TouchableOpacity
            onPress={() => setSaveCard(!saveCard)}
            style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}
          >
            <Ionicons
              name={saveCard ? 'checkbox' : 'square-outline'}
              size={20}
              color={saveCard ? theme.primary : theme.onSurfaceVariant}
            />
            <ThemedText type="caption" style={{ marginLeft: 8 }}>
              {t('payment.saveCard')}
            </ThemedText>
          </TouchableOpacity>
        </>
      )}
    </ThemedView>
  );

  // --- Mobile Money Form ---
  const renderMobileMoneyForm = () => (
    <ThemedView backgroundColor="transparent" style={{ gap: 4 }}>
      {/* Country selector */}
      <ThemedText type="caption" intensity="medium" style={{ marginBottom: 6 }}>
        {t('payment.country')}
      </ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {MOBILE_MONEY_COUNTRIES.map(country => (
          <TouchableOpacity
            key={country.countryCode}
            onPress={() => {
              setSelectedCountry(country);
              setSelectedOperator(null);
            }}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              marginRight: 8,
              backgroundColor: selectedCountry.countryCode === country.countryCode
                ? theme.primary + '15'
                : theme.surfaceVariant,
              borderWidth: 1,
              borderColor: selectedCountry.countryCode === country.countryCode
                ? theme.primary
                : theme.outline + '30',
            }}
          >
            <ThemedText type="caption" style={{
              color: selectedCountry.countryCode === country.countryCode ? theme.primary : theme.onSurface,
            }}>
              {country.flag} {country.countryName}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Operator selector */}
      <ThemedText type="caption" intensity="medium" style={{ marginBottom: 6 }}>
        {t('payment.operator')}
      </ThemedText>
      <ThemedView backgroundColor="transparent" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {selectedCountry.operators.map(op => (
          <TouchableOpacity
            key={op.code}
            onPress={() => setSelectedOperator(op)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: selectedOperator?.code === op.code
                ? theme.primary + '15'
                : theme.surfaceVariant,
              borderWidth: 1,
              borderColor: selectedOperator?.code === op.code
                ? theme.primary
                : theme.outline + '30',
            }}
          >
            <ThemedText type="body" style={{
              fontSize: 13,
              color: selectedOperator?.code === op.code ? theme.primary : theme.onSurface,
              fontWeight: selectedOperator?.code === op.code ? '600' : '400',
            }}>
              {op.name}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      {/* Phone number */}
      <ThemedText type="caption" intensity="medium" style={{ marginBottom: 6 }}>
        {t('payment.phoneNumber')}
      </ThemedText>
      <TextInput
        value={mmPhone}
        onChangeText={(text) => setMmPhone(text.replace(/\D/g, ''))}
        placeholder={t('payment.phoneNumberPlaceholder')}
        placeholderTextColor={theme.onSurfaceVariant + '60'}
        keyboardType="phone-pad"
        maxLength={15}
        style={inputStyle}
      />
    </ThemedView>
  );

  // --- Wallet Form ---
  const renderWalletForm = () => (
    <ThemedView backgroundColor="transparent" style={{ alignItems: 'center', paddingVertical: 20 }}>
      <Ionicons name="wallet" size={48} color={theme.primary} />
      <ThemedText type="subtitle" intensity="strong" style={{ marginTop: 12 }}>
        {t('payment.walletBalance')}
      </ThemedText>
      <ThemedText type="title" style={{ color: isWalletValid ? '#00B894' : '#E74C3C', marginTop: 4 }}>
        {walletBalance.toFixed(2)} {currency}
      </ThemedText>
      {!isWalletValid && (
        <ThemedText type="caption" style={{ color: '#E74C3C', marginTop: 8, textAlign: 'center' }}>
          {t('payment.insufficientBalance')}
        </ThemedText>
      )}
      {isWalletValid && (
        <ThemedText type="caption" intensity="light" style={{ marginTop: 8, textAlign: 'center' }}>
          {t('payment.walletDeductMessage', { amount: amount.toFixed(2), currency })}
        </ThemedText>
      )}
    </ThemedView>
  );

  // --- Confirmation Step ---
  const renderConfirmation = () => (
    <ThemedView backgroundColor="transparent" style={{ paddingVertical: 16 }}>
      <ThemedView
        variant="surface"
        style={{ borderRadius: 16, padding: 20, marginBottom: 16 }}
      >
        <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>
          {t('payment.summary')}
        </ThemedText>

        <ThemedView backgroundColor="transparent" style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
          <ThemedText type="body">{t('payment.plan')}</ThemedText>
          <ThemedText type="body" intensity="strong">{planName}</ThemedText>
        </ThemedView>

        <ThemedView backgroundColor="transparent" style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <ThemedText type="body">{t('payment.billing')}</ThemedText>
          <ThemedText type="body" intensity="strong">
            {billingCycle === 'monthly' ? t('premium.monthly') : t('premium.yearly')}
          </ThemedText>
        </ThemedView>

        <ThemedView backgroundColor="transparent" style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <ThemedText type="body">{t('payment.method')}</ThemedText>
          <ThemedText type="body" intensity="strong">
            {activeMethod === 'card'
              ? (useSavedCard && savedCard ? `•••• ${savedCard.cardNumber}` : `${cardBrand?.toUpperCase() || 'CARD'} •••• ${cardNumber.slice(-4)}`)
              : activeMethod === 'mobile_money'
                ? `${selectedOperator?.name} ${mmPhone}`
                : t('payment.wallet')}
          </ThemedText>
        </ThemedView>

        <ThemedView
          style={{
            height: 1,
            backgroundColor: theme.outline + '20',
            marginVertical: 16,
          }}
        />

        <ThemedView backgroundColor="transparent" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <ThemedText type="subtitle" intensity="strong">{t('payment.total')}</ThemedText>
          <ThemedText type="subtitle" intensity="strong" style={{ color: theme.primary }}>
            {amount.toFixed(2)} {currency}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView backgroundColor="transparent" style={{ flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity
          onPress={() => setStep('form')}
          style={{
            flex: 1,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
            backgroundColor: theme.surfaceVariant,
          }}
        >
          <ThemedText type="body">{t('common.back')}</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleConfirm}
          style={{ flex: 2, overflow: 'hidden', borderRadius: 12 }}
        >
          <LinearGradient
            colors={[theme.primary, theme.secondary || theme.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
          >
            <ThemedText type="body" intensity="strong" style={{ color: 'white' }}>
              {t('payment.confirmPay', { amount: amount.toFixed(2), currency })}
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );

  // --- Processing Step ---
  const renderProcessing = () => (
    <ThemedView backgroundColor="transparent" style={{ alignItems: 'center', paddingVertical: 40 }}>
      <ActivityIndicator size="large" color={theme.primary} />
      <ThemedText type="subtitle" intensity="strong" style={{ marginTop: 16 }}>
        {t('payment.processing')}
      </ThemedText>
      <ThemedText type="caption" intensity="light" style={{ marginTop: 8, textAlign: 'center' }}>
        {t('payment.doNotClose')}
      </ThemedText>
    </ThemedView>
  );

  // --- Success Step ---
  const renderSuccess = () => (
    <ThemedView backgroundColor="transparent" style={{ alignItems: 'center', paddingVertical: 40 }}>
      <ThemedView
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        backgroundColor="#00B89415"
      >
        <Ionicons name="checkmark-circle" size={48} color="#00B894" />
      </ThemedView>
      <ThemedText type="subtitle" intensity="strong" style={{ marginTop: 16 }}>
        {t('payment.success')}
      </ThemedText>
      <ThemedText type="caption" intensity="light" style={{ marginTop: 8, textAlign: 'center' }}>
        {t('payment.successMessage')}
      </ThemedText>
      <TouchableOpacity
        onPress={resetAndClose}
        style={{
          marginTop: 24,
          paddingHorizontal: 40,
          paddingVertical: 14,
          borderRadius: 12,
          backgroundColor: theme.primary,
        }}
      >
        <ThemedText type="body" intensity="strong" style={{ color: 'white' }}>
          {t('common.done')}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  // --- Error Step ---
  const renderError = () => (
    <ThemedView backgroundColor="transparent" style={{ alignItems: 'center', paddingVertical: 40 }}>
      <ThemedView
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        backgroundColor="#E74C3C15"
      >
        <Ionicons name="close-circle" size={48} color="#E74C3C" />
      </ThemedView>
      <ThemedText type="subtitle" intensity="strong" style={{ marginTop: 16 }}>
        {t('payment.failed')}
      </ThemedText>
      <ThemedText type="caption" intensity="light" style={{ marginTop: 8, textAlign: 'center' }}>
        {t('payment.failedMessage')}
      </ThemedText>
      <ThemedView backgroundColor="transparent" style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
        <TouchableOpacity
          onPress={resetAndClose}
          style={{
            paddingHorizontal: 24,
            paddingVertical: 14,
            borderRadius: 12,
            backgroundColor: theme.surfaceVariant,
          }}
        >
          <ThemedText type="body">{t('common.cancel')}</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setStep('form')}
          style={{
            paddingHorizontal: 24,
            paddingVertical: 14,
            borderRadius: 12,
            backgroundColor: theme.primary,
          }}
        >
          <ThemedText type="body" intensity="strong" style={{ color: 'white' }}>
            {t('payment.retry')}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={step === 'processing' ? undefined : resetAndClose}
    >
      <ThemedView
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ThemedView
            variant="surface"
            style={{
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: SCREEN_HEIGHT * 0.85,
              paddingBottom: Platform.OS === 'ios' ? 34 : 20,
            }}
          >
            {/* Handle bar */}
            <ThemedView
              style={{
                alignSelf: 'center',
                width: 40,
                height: 4,
                borderRadius: 2,
                marginTop: 12,
                marginBottom: 8,
              }}
              backgroundColor={theme.outline + '40'}
            />

            {/* Header */}
            <ThemedView
              backgroundColor="transparent"
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingBottom: 12,
              }}
            >
              <ThemedView backgroundColor="transparent">
                <ThemedText type="subtitle" intensity="strong">
                  {t('payment.title')}
                </ThemedText>
                <ThemedText type="caption" intensity="light">
                  {amount.toFixed(2)} {currency}/{billingCycle === 'monthly' ? t('premium.month') : t('premium.year')}
                </ThemedText>
              </ThemedView>
              {step !== 'processing' && (
                <TouchableOpacity onPress={resetAndClose}>
                  <Ionicons name="close" size={24} color={theme.onSurface} />
                </TouchableOpacity>
              )}
            </ThemedView>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ paddingHorizontal: 20 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Method tabs - only show in form step */}
              {step === 'form' && (
                <>
                  <ThemedView
                    backgroundColor="transparent"
                    style={{
                      flexDirection: 'row',
                      borderBottomWidth: 1,
                      borderBottomColor: theme.outline + '20',
                      marginBottom: 16,
                    }}
                  >
                    <MethodTab method="card" icon="card" label={t('payment.card')} />
                    <MethodTab method="mobile_money" icon="phone-portrait" label="Mobile Money" />
                    <MethodTab method="wallet" icon="wallet" label={t('payment.wallet')} />
                  </ThemedView>

                  {activeMethod === 'card' && renderCardForm()}
                  {activeMethod === 'mobile_money' && renderMobileMoneyForm()}
                  {activeMethod === 'wallet' && renderWalletForm()}

                  {/* Continue button */}
                  <TouchableOpacity
                    onPress={() => setStep('confirm')}
                    disabled={!canProceed}
                    style={{
                      marginTop: 20,
                      marginBottom: 16,
                      overflow: 'hidden',
                      borderRadius: 12,
                      opacity: canProceed ? 1 : 0.5,
                    }}
                  >
                    <LinearGradient
                      colors={canProceed
                        ? [theme.primary, theme.secondary || theme.primary]
                        : [theme.surfaceVariant, theme.surfaceVariant]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
                    >
                      <ThemedText
                        type="body"
                        intensity="strong"
                        style={{ color: canProceed ? 'white' : theme.onSurfaceVariant }}
                      >
                        {t('payment.continue')}
                      </ThemedText>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Security note */}
                  <ThemedView
                    backgroundColor="transparent"
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}
                  >
                    <Ionicons name="lock-closed" size={12} color={theme.onSurfaceVariant} />
                    <ThemedText type="caption" intensity="light" style={{ marginLeft: 4, fontSize: 11 }}>
                      {t('payment.securePayment')}
                    </ThemedText>
                  </ThemedView>
                </>
              )}

              {step === 'confirm' && renderConfirmation()}
              {step === 'processing' && renderProcessing()}
              {step === 'success' && renderSuccess()}
              {step === 'error' && renderError()}
            </ScrollView>
          </ThemedView>
        </KeyboardAvoidingView>
      </ThemedView>
    </Modal>
  );
}
