import React, { useState } from 'react';
import { TouchableOpacity, Alert, ActivityIndicator, ScrollView, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '@/components/contexts/user/UserContext';
import { useActivity } from '@/components/contexts/activity/ActivityContext';
import { router } from 'expo-router';
import { usePremium } from '@/hooks/usePremium';
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { useLanguage } from '@/components/contexts/language';
import PaymentSheet, { PaymentData } from '@/components/premium/PaymentSheet';
import { StatusBar } from 'react-native';

const PREMIUM_PLAN = {
  id: 'premium',
  monthlyPrice: 9.99,
  yearlyPrice: 99,
};

type FeatureItem = { icon: string; key: string };

const OWNER_FEATURES: FeatureItem[] = [
  { icon: 'rocket', key: 'ownerBoostVisibility' },
  { icon: 'stats-chart', key: 'ownerAdvancedStats' },
  { icon: 'trending-up', key: 'ownerMarketAnalysis' },
  { icon: 'person-circle', key: 'ownerTenantScreening' },
  { icon: 'receipt', key: 'ownerAutoRentReceipt' },
  { icon: 'grid', key: 'ownerMultiProperty' },
  { icon: 'alarm', key: 'ownerRentReminder' },
  { icon: 'construct', key: 'ownerMaintenanceTracker' },
  { icon: 'folder', key: 'ownerDocumentVault' },
  { icon: 'pie-chart', key: 'ownerRevenueReport' },
  { icon: 'headset', key: 'ownerPrioritySupport' },
  { icon: 'shield-checkmark', key: 'ownerVerifiedBadge' },
];

const CLIENT_FEATURES: FeatureItem[] = [
  { icon: 'sparkles', key: 'clientSmartRecommendation' },
  { icon: 'person', key: 'clientOwnerInfo' },
  { icon: 'calendar', key: 'clientPriorityVisit' },
  { icon: 'flash', key: 'clientEarlyAccess' },
  { icon: 'notifications', key: 'clientInstantAlerts' },
  { icon: 'bar-chart', key: 'clientPriceHistory' },
  { icon: 'location', key: 'clientNeighborhoodInsights' },
  { icon: 'cube', key: 'clientVirtualTourPriority' },
  { icon: 'chatbubbles', key: 'clientNegotiationAssist' },
  { icon: 'bookmark', key: 'clientSavedSearchUnlimited' },
  { icon: 'document-text', key: 'clientDocumentChecklist' },
  { icon: 'car', key: 'clientMoveAssistant' },
];

const COMMON_FEATURES: FeatureItem[] = [
  { icon: 'eye-off', key: 'commonNoAds' },
  { icon: 'chatbubble-ellipses', key: 'commonPriorityContact' },
  { icon: 'shield-checkmark', key: 'commonVerifiedListings' },
  { icon: 'analytics', key: 'commonAIPredictions' },
  { icon: 'map', key: 'commonPriceHeatmap' },
  { icon: 'time', key: 'commonFullHistory' },
  { icon: 'people', key: 'commonFamilySharing' },
  { icon: 'logo-bitcoin', key: 'commonCryptoPayment' },
];

const FeatureRow = ({
  feature,
  color,
  theme,
  t,
  showCheck,
}: {
  feature: FeatureItem;
  color: string;
  theme: any;
  t: (key: any, params?: Record<string, string>) => string;
  showCheck?: boolean;
}) => (
  <ThemedView
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      paddingVertical: 6,
    }}
    backgroundColor="transparent"
  >
    <ThemedView
      style={{
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}
      backgroundColor={color + '15'}
    >
      <Ionicons name={feature.icon as any} size={16} color={color} />
    </ThemedView>
    <ThemedText type="body" style={{ flex: 1, fontSize: 13 }}>
      {t(`premium.${feature.key}`)}
    </ThemedText>
    {showCheck && <Ionicons name="checkmark-circle" size={20} color="#00B894" />}
  </ThemedView>
);

const SectionHeader = ({
  icon,
  title,
  subtitle,
  color,
  theme,
}: {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  theme: any;
}) => (
  <ThemedView style={{ marginBottom: 12, marginTop: 20 }} backgroundColor="transparent">
    <ThemedView
      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}
      backgroundColor="transparent"
    >
      <Ionicons name={icon as any} size={20} color={color} />
      <ThemedText type="normal" intensity="strong" style={{ marginLeft: 8, color }}>
        {title}
      </ThemedText>
    </ThemedView>
    <ThemedText type="caption" intensity="light">
      {subtitle}
    </ThemedText>
  </ThemedView>
);

const PremiumSubscriptionScreen = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, updateUser, checkPremiumStatus } = useUser();
  const { user: authUser } = useAuth();
  const { addActivity } = useActivity();
  const { t } = useLanguage();
  const { isOwnerRole } = usePremiumFeatures();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSheetVisible, setPaymentSheetVisible] = useState(false);

  const isPremium = checkPremiumStatus();

  const { subscribeToPlan } = usePremium(authUser?.id || user?.id || '');

  const getCurrentPrice = () =>
    billingCycle === 'monthly' ? PREMIUM_PLAN.monthlyPrice : PREMIUM_PLAN.yearlyPrice;

  const getSavingsPercent = () =>
    Math.round(
      ((PREMIUM_PLAN.monthlyPrice * 12 - PREMIUM_PLAN.yearlyPrice) /
        (PREMIUM_PLAN.monthlyPrice * 12)) *
        100
    );

  const handleSubscribe = () => {
    setPaymentSheetVisible(true);
  };

  const handlePaymentConfirm = async (paymentData: PaymentData) => {
    addActivity({
      userId: authUser?.id || user?.id || 'user123',
      type: 'premium',
      title: t('premium.planTitle'),
      description: `${t('premium.planTitle')} - ${billingCycle}`,
      status: 'in_progress',
      metadata: { planId: PREMIUM_PLAN.id, amount: getCurrentPrice(), billingCycle },
    });

    const success = await subscribeToPlan(PREMIUM_PLAN.id, paymentData.method as 'card' | 'crypto' | 'wallet', {
      method: paymentData.method,
      billingCycle,
      paymentMethodId: paymentData.paymentMethodId,
      ...(paymentData.card ? { cardLast4: paymentData.card.last4, cardBrand: paymentData.card.brand } : {}),
      ...(paymentData.mobileMoney ? { mobileMoneyDetails: paymentData.mobileMoney } : {}),
    });

    if (success) {
      updateUser({
        isPremium: true,
        premiumPlan: PREMIUM_PLAN.id,
        premiumExpiry: new Date(
          Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
    } else {
      throw new Error('Subscription failed');
    }
  };

  // Determine which role features to show first based on user role
  const primaryFeatures = isOwnerRole ? OWNER_FEATURES : CLIENT_FEATURES;
  const secondaryFeatures = isOwnerRole ? CLIENT_FEATURES : OWNER_FEATURES;
  const primaryTitle = isOwnerRole ? t('premium.ownerTitle') : t('premium.clientTitle');
  const primarySubtitle = isOwnerRole ? t('premium.ownerSubtitle') : t('premium.clientSubtitle');
  const secondaryTitle = isOwnerRole ? t('premium.clientTitle') : t('premium.ownerTitle');
  const secondarySubtitle = isOwnerRole ? t('premium.clientSubtitle') : t('premium.ownerSubtitle');
  const primaryIcon = isOwnerRole ? 'home' : 'search';
  const secondaryIcon = isOwnerRole ? 'search' : 'home';
  const primaryColor = isOwnerRole ? '#6C5CE7' : '#00B894';
  const secondaryColor = isOwnerRole ? '#00B894' : '#6C5CE7';

  // ===== ALREADY PREMIUM VIEW =====
  if (isPremium) {
    return (
      <ThemedView style={{ flex: 1, paddingTop: 10 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ThemedView style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={{
                borderRadius: 20,
                padding: 24,
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <MaterialCommunityIcons name="crown" size={48} color="white" />
              <ThemedText
                type="title"
                style={{ color: 'white', marginTop: 12, textAlign: 'center' }}
              >
                {t('premium.alreadyPremium')}
              </ThemedText>
              <ThemedText
                type="body"
                style={{ color: 'white', opacity: 0.9, textAlign: 'center', marginTop: 8 }}
              >
                {t('premium.alreadyPremiumDesc')}
              </ThemedText>
              {user?.premiumExpiry && (
                <ThemedText
                  type="caption"
                  style={{ color: 'white', opacity: 0.8, marginTop: 8 }}
                >
                  {t('premium.expiresOn')}:{' '}
                  {new Date(user.premiumExpiry).toLocaleDateString('fr-FR')}
                </ThemedText>
              )}
            </LinearGradient>

            <ThemedText type="normaltitle" style={{ marginBottom: 4 }}>
              {t('premium.yourBenefits')}
            </ThemedText>

            {/* Primary role features */}
            <SectionHeader
              icon={primaryIcon}
              title={primaryTitle}
              subtitle={primarySubtitle}
              color={primaryColor}
              theme={theme}
            />
            {primaryFeatures.map((f, i) => (
              <FeatureRow key={i} feature={f} color={primaryColor} theme={theme} t={t} showCheck />
            ))}

            {/* Secondary role features */}
            <SectionHeader
              icon={secondaryIcon}
              title={secondaryTitle}
              subtitle={secondarySubtitle}
              color={secondaryColor}
              theme={theme}
            />
            {secondaryFeatures.map((f, i) => (
              <FeatureRow key={i} feature={f} color={secondaryColor} theme={theme} t={t} showCheck />
            ))}

            {/* Common features */}
            <SectionHeader
              icon="globe"
              title={t('premium.commonTitle')}
              subtitle={t('premium.commonSubtitle')}
              color={theme.primary}
              theme={theme}
            />
            {COMMON_FEATURES.map((f, i) => (
              <FeatureRow
                key={i}
                feature={f}
                color={theme.primary}
                theme={theme}
                t={t}
                showCheck
              />
            ))}

            <View style={{ height: 40 }} />
          </ThemedView>
        </ScrollView>
      </ThemedView>
    );
  }

  // ===== SUBSCRIPTION VIEW =====
  return (
    <ThemedView style={{ flex: 1, paddingTop: 10 }}>
      {/* Header */}
      <ThemedView
        style={{
          paddingBottom: 20,
          paddingHorizontal: 16,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
        }}
      >
        <ThemedText type="normaltitle" style={{ marginBottom: 20 }}>
          {t('premium.unlockAll')}
        </ThemedText>

        {/* Price display */}
        <ThemedView
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
          backgroundColor="transparent"
        >
          <ThemedView backgroundColor="transparent">
            <ThemedView
              style={{ flexDirection: 'row', alignItems: 'flex-end' }}
              backgroundColor="transparent"
            >
              <ThemedText type="title" intensity="strong">
                {PREMIUM_PLAN.monthlyPrice}€
              </ThemedText>
              <ThemedText type="body" intensity="light" style={{ marginLeft: 4 }}>
                {t('premium.monthlyPrice')}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <ThemedText type="body" style={{ textAlign: 'right' }}>
              {PREMIUM_PLAN.yearlyPrice}€
            </ThemedText>
            <ThemedText type="caption">{t('premium.yearlyPrice')}</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedView>
          {/* Plan title */}
          <ThemedView style={{ marginBottom: 6, paddingHorizontal: 18, marginTop: 16 }}>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <MaterialCommunityIcons name="crown" size={24} color={theme.primary} />
              <ThemedText type="normaltitle" intensity="strong" style={{ marginLeft: 8 }}>
                {t('premium.planTitle')}
              </ThemedText>
            </ThemedView>
            <ThemedText type="caption" style={{ lineHeight: 20 }}>
              {t('premium.planDescription')}
            </ThemedText>
          </ThemedView>

          {/* Features by role */}
          <ThemedView style={{ paddingHorizontal: 20 }}>
            {/* Primary role features (user's role first) */}
            <SectionHeader
              icon={primaryIcon}
              title={primaryTitle}
              subtitle={primarySubtitle}
              color={primaryColor}
              theme={theme}
            />
            {primaryFeatures.map((f, i) => (
              <FeatureRow key={i} feature={f} color={primaryColor} theme={theme} t={t} />
            ))}

            {/* Secondary role features */}
            <SectionHeader
              icon={secondaryIcon}
              title={secondaryTitle}
              subtitle={secondarySubtitle}
              color={secondaryColor}
              theme={theme}
            />
            {secondaryFeatures.map((f, i) => (
              <FeatureRow key={i} feature={f} color={secondaryColor} theme={theme} t={t} />
            ))}

            {/* Common features */}
            <SectionHeader
              icon="globe"
              title={t('premium.commonTitle')}
              subtitle={t('premium.commonSubtitle')}
              color={theme.primary}
              theme={theme}
            />
            {COMMON_FEATURES.map((f, i) => (
              <FeatureRow key={i} feature={f} color={theme.primary} theme={theme} t={t} />
            ))}
          </ThemedView>

          {/* Billing cycle selector */}
          <ThemedView style={{ marginTop: 20, marginBottom: 10, paddingHorizontal: 20 }}>
            {/* Monthly */}
            <TouchableOpacity
              onPress={() => setBillingCycle('monthly')}
              style={{ marginBottom: 10 }}
            >
              <ThemedView
                variant="surface"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 10,
                  borderRadius: 12,
                }}
              >
                <ThemedView
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 2,
                    borderColor: billingCycle === 'monthly' ? theme.primary : theme.outline,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}
                >
                  {billingCycle === 'monthly' && (
                    <ThemedView
                      style={{ width: 12, height: 12 }}
                      backgroundColor={theme.primary}
                    />
                  )}
                </ThemedView>
                <ThemedView style={{ flex: 1,  backgroundColor:'transparent' }}>
                  <ThemedText type="body" intensity="strong">
                    {t('premium.monthly')}
                  </ThemedText>
                  <ThemedText type="caption" intensity="light">
                    {t('premium.monthlyBilling')}
                  </ThemedText>
                </ThemedView>
                <ThemedText type="subtitle" intensity="strong">
                  {PREMIUM_PLAN.monthlyPrice}€
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>

            {/* Yearly */}
            <TouchableOpacity onPress={() => setBillingCycle('yearly')}>
              <ThemedView
                variant="surface"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                   backgroundColor:'transparent'
                }}
              >
                <ThemedView
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 2,
                    borderColor: billingCycle === 'yearly' ? theme.primary : theme.outline,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}
                >
                  {billingCycle === 'yearly' && (
                    <ThemedView
                      style={{ width: 12, height: 12, borderRadius: 6 }}
                      backgroundColor={theme.primary}
                    />
                  )}
                </ThemedView>
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText type="body" intensity="strong">
                    {t('premium.yearly')}
                  </ThemedText>
                  <ThemedText type="caption" intensity="light">
                    {t('premium.savingsPercent', { percent: getSavingsPercent().toString() })}
                  </ThemedText>
                </ThemedView>
                <ThemedText type="subtitle" intensity="strong">
                  {PREMIUM_PLAN.yearlyPrice}€
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {/* Bottom CTA */}
        <ThemedView
          style={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 20,
            borderTopWidth: 1,
            borderTopColor: theme.outline + '20',
          }}
          variant="surface"
        >
          <TouchableOpacity
            onPress={handleSubscribe}
            disabled={isProcessing}
            style={{ overflow: 'hidden', borderRadius: 14 }}
          >
            <ThemedView
              color={theme.primary}
              style={{
                paddingVertical: 16,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor:theme.primary
              }}
            >
              {isProcessing ? (
                <ThemedView
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  backgroundColor="transparent"
                >
                  <ActivityIndicator size="small" color="white" />
                  <ThemedText
                    type="body"
                    intensity="strong"
                    style={{ color: 'white', marginLeft: 10 }}
                  >
                    {t('premium.processing')}
                  </ThemedText>
                </ThemedView>
              ) : (
                <ThemedText type="normal" intensity="strong" style={{ color: 'white' }}>
                  {t('premium.startFreeTrial')}
                </ThemedText>
              )}
            </ThemedView>
          </TouchableOpacity>

          <ThemedText
            type="caption"
            style={{ textAlign: 'center', marginTop: 12, lineHeight: 18 }}
          >
            {t('premium.cancellationNote')}{' '}
            <ThemedText type="caption" style={{ color: theme.primary }}>
              {t('premium.termsOfUse')}
            </ThemedText>
          </ThemedText>
        </ThemedView>
      </ScrollView>

      <PaymentSheet
        visible={paymentSheetVisible}
        onClose={() => setPaymentSheetVisible(false)}
        onConfirm={handlePaymentConfirm}
        amount={getCurrentPrice()}
        currency="EUR"
        planName={t('premium.planTitle')}
        billingCycle={billingCycle}
      />
    </ThemedView>
  );
};

export default PremiumSubscriptionScreen;
