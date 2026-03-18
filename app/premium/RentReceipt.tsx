import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useUser } from '@/components/contexts/user/UserContext';
import { useLanguage } from '@/components/contexts/language';
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';
import { getGraphQLService } from '@/services/api/graphqlService';
import { router, useLocalSearchParams } from 'expo-router';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PropertyNode {
  id: string;
  title: string;
  address: string;
  ownerCriteria?: {
    monthlyRent?: number;
    currency?: string;
  };
  acquiredBy?: string;
  status?: string;
}

interface ReceiptResult {
  receiptId: string;
  generatedAt: string;
  period: { month: number; year: number };
  owner: { name: string; email: string; phone: string };
  tenant: { name: string; email: string; phone: string };
  property: { id: string; title: string; address: string };
  payment: { amount: number; currency: string; monthlyRent: number };
}

// ─── GraphQL ─────────────────────────────────────────────────────────────────

const PROPERTIES_BY_OWNER_QUERY = `
  query PropertiesByOwner($ownerId: ID) {
    propertiesByOwner(ownerId: $ownerId) {
      edges {
        node {
          id
          title
          address
          ownerCriteria {
            monthlyRent
            currency
          }
          acquiredBy
          status
        }
      }
    }
  }
`;

const GENERATE_RENT_RECEIPT_MUTATION = `
  mutation GenerateRentReceipt(
    $propertyId: ID!
    $tenantId: ID!
    $month: Int!
    $year: Int!
    $amount: Float!
    $currency: String
  ) {
    generateRentReceipt(
      propertyId: $propertyId
      tenantId: $tenantId
      month: $month
      year: $year
      amount: $amount
      currency: $currency
    ) {
      receiptId
      generatedAt
      period { month year }
      owner { name email phone }
      tenant { name email phone }
      property { id title address }
      payment { amount currency monthlyRent }
    }
  }
`;

// ─── Constants ───────────────────────────────────────────────────────────────

const MONTHS_KEYS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

// ─── Component ───────────────────────────────────────────────────────────────

const RentReceiptScreen = () => {
  const { theme } = useTheme();
  const { user } = useUser();
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  const { isPremium, hasAutoRentReceipt, requirePremium } = usePremiumFeatures();

  // State
  const [properties, setProperties] = useState<PropertyNode[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyNode | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ─── Premium gate ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isPremium || !hasAutoRentReceipt) {
      requirePremium(t('rentReceipt.featureName' as any));
    }
  }, [isPremium, hasAutoRentReceipt]);

  // ─── Load properties ────────────────────────────────────────────────────

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setIsLoadingProperties(true);
    setError(null);
    try {
      const result = await getGraphQLService().query(PROPERTIES_BY_OWNER_QUERY, {
        ownerId: user?.id,
      });

      const edges = result?.data?.propertiesByOwner?.edges || [];
      const props: PropertyNode[] = edges
        .map((e: any) => e.node)
        .filter((p: PropertyNode) => p.acquiredBy);
      setProperties(props);

      // Pre-select if propertyId passed via params
      if (params.propertyId) {
        const found = props.find((p: PropertyNode) => p.id === params.propertyId);
        if (found) {
          handleSelectProperty(found);
        }
      }
    } catch (err: any) {
      setError(err?.message || t('rentReceipt.errorLoadingProperties' as any));
    } finally {
      setIsLoadingProperties(false);
    }
  };

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleSelectProperty = (property: PropertyNode) => {
    setSelectedProperty(property);
    setReceipt(null);
    const rent = property.ownerCriteria?.monthlyRent;
    if (rent) {
      setAmount(rent.toString());
    }
    const cur = property.ownerCriteria?.currency;
    if (cur) {
      setCurrency(cur);
    }
  };

  const handleYearChange = (delta: number) => {
    const newYear = selectedYear + delta;
    if (newYear >= 2020 && newYear <= new Date().getFullYear() + 1) {
      setSelectedYear(newYear);
    }
  };

  const handleGenerate = async () => {
    if (!requirePremium(t('rentReceipt.featureName' as any))) return;

    if (!selectedProperty) {
      Alert.alert(t('common.error' as any), t('rentReceipt.selectPropertyFirst' as any));
      return;
    }
    if (!selectedProperty.acquiredBy) {
      Alert.alert(t('common.error' as any), t('rentReceipt.noTenantAssigned' as any));
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert(t('common.error' as any), t('rentReceipt.invalidAmount' as any));
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const result = await getGraphQLService().mutate(GENERATE_RENT_RECEIPT_MUTATION, {
        propertyId: selectedProperty.id,
        tenantId: selectedProperty.acquiredBy,
        month: selectedMonth,
        year: selectedYear,
        amount: parseFloat(amount),
        currency,
      });

      const receiptData = result?.data?.generateRentReceipt;
      if (receiptData) {
        setReceipt(receiptData);
      } else {
        throw new Error(t('rentReceipt.generationFailed' as any));
      }
    } catch (err: any) {
      Alert.alert(t('common.error' as any), err?.message || t('rentReceipt.generationFailed' as any));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareReceipt = () => {
    Alert.alert(
      t('rentReceipt.shareTitle' as any),
      t('rentReceipt.shareComingSoon' as any)
    );
  };

  const handleNewReceipt = () => {
    setReceipt(null);
  };

  // ─── Premium gate render ────────────────────────────────────────────────

  if (!isPremium || !hasAutoRentReceipt) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400 }}
        >
          <ThemedView style={{ alignItems: 'center' }} backgroundColor="transparent">
            <MaterialCommunityIcons name="crown" size={64} color="#FFD700" />
            <ThemedText
              type="normaltitle"
              intensity="strong"
              style={{ marginTop: 16, textAlign: 'center' }}
            >
              {t('rentReceipt.premiumOnly' as any)}
            </ThemedText>
            <ThemedText
              type="body"
              intensity="light"
              style={{ marginTop: 8, textAlign: 'center', lineHeight: 22 }}
            >
              {t('rentReceipt.premiumOnlyDesc' as any)}
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push('/premium/Premium')}
              style={{ marginTop: 24 }}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 32,
                  borderRadius: 12,
                }}
              >
                <ThemedText type="normal" intensity="strong" style={{ color: 'white' }}>
                  {t('premium.upgradeToPremium' as any)}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </ThemedView>
        </MotiView>
      </ThemedView>
    );
  }

  // ─── Receipt preview ───────────────────────────────────────────────────

  if (receipt) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500 }}
          >
            {/* Success header */}
            <ThemedView
              style={{ alignItems: 'center', marginBottom: 24 }}
              backgroundColor="transparent"
            >
              <ThemedView
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
                backgroundColor="#00B89420"
              >
                <Ionicons name="checkmark-circle" size={48} color="#00B894" />
              </ThemedView>
              <ThemedText type="normaltitle" intensity="strong">
                {t('rentReceipt.receiptGenerated' as any)}
              </ThemedText>
              <ThemedText type="caption" intensity="light" style={{ marginTop: 4 }}>
                {t('rentReceipt.receiptId' as any)}: {receipt.receiptId}
              </ThemedText>
            </ThemedView>

            {/* Receipt card */}
            <ThemedView
              variant="surface"
              style={{
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: theme.outline + '30',
              }}
            >
              {/* Period */}
              <ThemedView
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 16,
                  paddingBottom: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.outline + '20',
                }}
              >
                <Ionicons name="calendar" size={20} color={theme.primary} />
                <ThemedText type="body" intensity="strong" style={{ marginLeft: 8 }}>
                  {t(`rentReceipt.month_${MONTHS_KEYS[receipt.period.month - 1]}` as any)}{' '}
                  {receipt.period.year}
                </ThemedText>
              </ThemedView>

              {/* Property info */}
              <ThemedView style={{ marginBottom: 16 }} backgroundColor="transparent">
                <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>
                  {t('rentReceipt.property' as any)}
                </ThemedText>
                <ThemedText type="body" intensity="strong">
                  {receipt.property.title}
                </ThemedText>
                <ThemedText type="caption" intensity="light">
                  {receipt.property.address}
                </ThemedText>
              </ThemedView>

              {/* Owner info */}
              <ThemedView
                style={{
                  marginBottom: 16,
                  paddingBottom: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.outline + '20',
                }}
                backgroundColor="transparent"
              >
                <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>
                  {t('rentReceipt.owner' as any)}
                </ThemedText>
                <ThemedText type="body">{receipt.owner.name}</ThemedText>
                {receipt.owner.email ? (
                  <ThemedText type="caption" intensity="light">
                    {receipt.owner.email}
                  </ThemedText>
                ) : null}
                {receipt.owner.phone ? (
                  <ThemedText type="caption" intensity="light">
                    {receipt.owner.phone}
                  </ThemedText>
                ) : null}
              </ThemedView>

              {/* Tenant info */}
              <ThemedView
                style={{
                  marginBottom: 16,
                  paddingBottom: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.outline + '20',
                }}
                backgroundColor="transparent"
              >
                <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>
                  {t('rentReceipt.tenant' as any)}
                </ThemedText>
                <ThemedText type="body">{receipt.tenant.name}</ThemedText>
                {receipt.tenant.email ? (
                  <ThemedText type="caption" intensity="light">
                    {receipt.tenant.email}
                  </ThemedText>
                ) : null}
                {receipt.tenant.phone ? (
                  <ThemedText type="caption" intensity="light">
                    {receipt.tenant.phone}
                  </ThemedText>
                ) : null}
              </ThemedView>

              {/* Payment info */}
              <ThemedView
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                backgroundColor="transparent"
              >
                <ThemedText type="caption" intensity="light">
                  {t('rentReceipt.amountPaid' as any)}
                </ThemedText>
                <ThemedView
                  style={{ flexDirection: 'row', alignItems: 'baseline' }}
                  backgroundColor="transparent"
                >
                  <ThemedText type="title" intensity="strong" style={{ color: '#00B894' }}>
                    {receipt.payment.amount.toLocaleString()}
                  </ThemedText>
                  <ThemedText
                    type="body"
                    intensity="light"
                    style={{ marginLeft: 4 }}
                  >
                    {receipt.payment.currency}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {/* Generated at */}
              <ThemedText
                type="caption"
                intensity="light"
                style={{ marginTop: 16, textAlign: 'right' }}
              >
                {t('rentReceipt.generatedAt' as any)}:{' '}
                {new Date(receipt.generatedAt).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </ThemedText>
            </ThemedView>

            {/* Action buttons */}
            <TouchableOpacity onPress={handleShareReceipt} style={{ marginBottom: 12 }}>
              <LinearGradient
                colors={['#6C5CE7', '#a855f7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 14,
                  borderRadius: 12,
                }}
              >
                <Ionicons name="share-outline" size={20} color="white" />
                <ThemedText
                  type="normal"
                  intensity="strong"
                  style={{ color: 'white', marginLeft: 8 }}
                >
                  {t('rentReceipt.shareDownload' as any)}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNewReceipt}
              style={{
                paddingVertical: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.outline + '40',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}
            >
              <Ionicons name="add-circle-outline" size={20} color={theme.primary} />
              <ThemedText type="normal" style={{ marginLeft: 8, color: theme.primary }}>
                {t('rentReceipt.generateAnother' as any)}
              </ThemedText>
            </TouchableOpacity>
          </MotiView>
        </ScrollView>
      </ThemedView>
    );
  }

  // ─── Main form ─────────────────────────────────────────────────────────

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {/* Page header */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
        >
          <ThemedView
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
            backgroundColor="transparent"
          >
            <ThemedView
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
              backgroundColor="#FFD70020"
            >
              <MaterialCommunityIcons name="receipt" size={24} color="#FFD700" />
            </ThemedView>
            <ThemedView style={{ flex: 1 }} backgroundColor="transparent">
              <ThemedText type="normaltitle" intensity="strong">
                {t('rentReceipt.title' as any)}
              </ThemedText>
              <ThemedText type="caption" intensity="light">
                {t('rentReceipt.subtitle' as any)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </MotiView>

        {/* Error banner */}
        {error ? (
          <ThemedView
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 12,
              borderRadius: 10,
              marginBottom: 16,
            }}
            backgroundColor="#FF636320"
          >
            <Ionicons name="alert-circle" size={20} color="#FF6363" />
            <ThemedText type="caption" style={{ marginLeft: 8, flex: 1, color: '#FF6363' }}>
              {error}
            </ThemedText>
            <TouchableOpacity onPress={loadProperties}>
              <Ionicons name="refresh" size={18} color="#FF6363" />
            </TouchableOpacity>
          </ThemedView>
        ) : null}

        {/* ── SECTION 1: Property selector ────────────────────────────────── */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 100 }}
        >
          <ThemedView style={{ marginBottom: 24 }} backgroundColor="transparent">
            <ThemedView
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
              backgroundColor="transparent"
            >
              <ThemedView
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
                backgroundColor={theme.primary + '20'}
              >
                <ThemedText type="caption" intensity="strong" style={{ color: theme.primary }}>
                  1
                </ThemedText>
              </ThemedView>
              <ThemedText type="normal" intensity="strong">
                {t('rentReceipt.selectProperty' as any)}
              </ThemedText>
            </ThemedView>

            {isLoadingProperties ? (
              <ThemedView
                style={{ padding: 30, alignItems: 'center' }}
                backgroundColor="transparent"
              >
                <ActivityIndicator size="small" color={theme.primary} />
                <ThemedText type="caption" intensity="light" style={{ marginTop: 8 }}>
                  {t('rentReceipt.loadingProperties' as any)}
                </ThemedText>
              </ThemedView>
            ) : properties.length === 0 ? (
              <ThemedView
                variant="surface"
                style={{
                  padding: 20,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Ionicons name="home-outline" size={32} color={theme.outline} />
                <ThemedText type="body" intensity="light" style={{ marginTop: 8 }}>
                  {t('rentReceipt.noPropertiesWithTenants' as any)}
                </ThemedText>
              </ThemedView>
            ) : (
              properties.map((property) => {
                const isSelected = selectedProperty?.id === property.id;
                return (
                  <TouchableOpacity
                    key={property.id}
                    onPress={() => handleSelectProperty(property)}
                    style={{ marginBottom: 8 }}
                    activeOpacity={0.7}
                  >
                    <ThemedView
                      variant="surface"
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 14,
                        borderRadius: 12,
                        borderWidth: isSelected ? 2 : 1,
                        borderColor: isSelected ? '#FFD700' : theme.outline + '30',
                      }}
                    >
                      <ThemedView
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                        }}
                        backgroundColor={isSelected ? '#FFD70020' : theme.outline + '15'}
                      >
                        <Ionicons
                          name="home"
                          size={20}
                          color={isSelected ? '#FFD700' : theme.outline}
                        />
                      </ThemedView>
                      <ThemedView style={{ flex: 1 }} backgroundColor="transparent">
                        <ThemedText type="body" intensity="strong">
                          {property.title}
                        </ThemedText>
                        <ThemedText type="caption" intensity="light" numberOfLines={1}>
                          {property.address}
                        </ThemedText>
                        {property.ownerCriteria?.monthlyRent ? (
                          <ThemedText type="caption" style={{ color: '#00B894', marginTop: 2 }}>
                            {property.ownerCriteria.monthlyRent.toLocaleString()}{' '}
                            {property.ownerCriteria.currency || 'EUR'}/{t('rentReceipt.month' as any)}
                          </ThemedText>
                        ) : null}
                      </ThemedView>
                      {isSelected ? (
                        <Ionicons name="checkmark-circle" size={24} color="#FFD700" />
                      ) : (
                        <Ionicons name="ellipse-outline" size={24} color={theme.outline + '50'} />
                      )}
                    </ThemedView>
                  </TouchableOpacity>
                );
              })
            )}
          </ThemedView>
        </MotiView>

        {/* ── SECTION 2: Month/Year picker ────────────────────────────────── */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
        >
          <ThemedView style={{ marginBottom: 24 }} backgroundColor="transparent">
            <ThemedView
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
              backgroundColor="transparent"
            >
              <ThemedView
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
                backgroundColor={theme.primary + '20'}
              >
                <ThemedText type="caption" intensity="strong" style={{ color: theme.primary }}>
                  2
                </ThemedText>
              </ThemedView>
              <ThemedText type="normal" intensity="strong">
                {t('rentReceipt.selectPeriod' as any)}
              </ThemedText>
            </ThemedView>

            {/* Year selector */}
            <ThemedView
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
              }}
              backgroundColor="transparent"
            >
              <TouchableOpacity
                onPress={() => handleYearChange(-1)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.outline + '15',
                }}
              >
                <Ionicons name="chevron-back" size={18} color={theme.primary} />
              </TouchableOpacity>
              <ThemedText
                type="subtitle"
                intensity="strong"
                style={{ marginHorizontal: 24, minWidth: 60, textAlign: 'center' }}
              >
                {selectedYear}
              </ThemedText>
              <TouchableOpacity
                onPress={() => handleYearChange(1)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.outline + '15',
                }}
              >
                <Ionicons name="chevron-forward" size={18} color={theme.primary} />
              </TouchableOpacity>
            </ThemedView>

            {/* Month horizontal scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 4, paddingVertical: 4 }}
            >
              {MONTHS_KEYS.map((monthKey, index) => {
                const monthNum = index + 1;
                const isSelected = selectedMonth === monthNum;
                return (
                  <TouchableOpacity
                    key={monthKey}
                    onPress={() => setSelectedMonth(monthNum)}
                    style={{ marginRight: 8 }}
                    activeOpacity={0.7}
                  >
                    <ThemedView
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderRadius: 10,
                        borderWidth: isSelected ? 0 : 1,
                        borderColor: theme.outline + '30',
                        overflow: 'hidden',
                      }}
                      backgroundColor={isSelected ? undefined : 'transparent'}
                    >
                      {isSelected ? (
                        <LinearGradient
                          colors={['#FFD700', '#FFA500']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                          }}
                        />
                      ) : null}
                      <ThemedText
                        type="caption"
                        intensity="strong"
                        style={isSelected ? { color: 'white' } : undefined}
                      >
                        {t(`rentReceipt.month_${monthKey}` as any)}
                      </ThemedText>
                    </ThemedView>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </ThemedView>
        </MotiView>

        {/* ── SECTION 3: Amount input ─────────────────────────────────────── */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 300 }}
        >
          <ThemedView style={{ marginBottom: 32 }} backgroundColor="transparent">
            <ThemedView
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
              backgroundColor="transparent"
            >
              <ThemedView
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
                backgroundColor={theme.primary + '20'}
              >
                <ThemedText type="caption" intensity="strong" style={{ color: theme.primary }}>
                  3
                </ThemedText>
              </ThemedView>
              <ThemedText type="normal" intensity="strong">
                {t('rentReceipt.enterAmount' as any)}
              </ThemedText>
            </ThemedView>

            <ThemedView
              variant="surface"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.outline + '30',
                paddingHorizontal: 16,
                paddingVertical: 4,
              }}
            >
              <Ionicons name="cash-outline" size={20} color={theme.primary} style={{ marginRight: 10 }} />
              <ThemedView style={{ flex: 1 }} backgroundColor="transparent">
                {/* Using a simple approach: render a TextInput-like component */}
                <TouchableOpacity
                  onPress={() => {
                    // Prompt user for amount via Alert with prompt
                    Alert.prompt
                      ? Alert.prompt(
                          t('rentReceipt.enterAmount' as any),
                          t('rentReceipt.enterAmountHint' as any),
                          (text: string) => {
                            if (text && !isNaN(parseFloat(text))) {
                              setAmount(text);
                            }
                          },
                          'plain-text',
                          amount
                        )
                      : Alert.alert(t('rentReceipt.enterAmount' as any), t('rentReceipt.enterAmountHint' as any));
                  }}
                  style={{ paddingVertical: 12 }}
                >
                  <ThemedText
                    type="subtitle"
                    intensity={amount ? 'strong' : 'light'}
                  >
                    {amount || t('rentReceipt.amountPlaceholder' as any)}
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
              <ThemedView
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
                backgroundColor={theme.primary + '15'}
              >
                <ThemedText type="caption" intensity="strong" style={{ color: theme.primary }}>
                  {currency}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {selectedProperty?.ownerCriteria?.monthlyRent ? (
              <ThemedText type="caption" intensity="light" style={{ marginTop: 6, marginLeft: 4 }}>
                {t('rentReceipt.monthlyRentRef' as any)}:{' '}
                {selectedProperty.ownerCriteria.monthlyRent.toLocaleString()}{' '}
                {selectedProperty.ownerCriteria.currency || 'EUR'}
              </ThemedText>
            ) : null}
          </ThemedView>
        </MotiView>

        {/* ── Generate button ─────────────────────────────────────────────── */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 400 }}
        >
          <TouchableOpacity
            onPress={handleGenerate}
            disabled={isGenerating || !selectedProperty}
            activeOpacity={0.8}
            style={{
              borderRadius: 14,
              overflow: 'hidden',
              opacity: !selectedProperty ? 0.5 : 1,
            }}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 16,
                borderRadius: 14,
              }}
            >
              {isGenerating ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <ThemedText
                    type="normal"
                    intensity="strong"
                    style={{ color: 'white', marginLeft: 10 }}
                  >
                    {t('rentReceipt.generating' as any)}
                  </ThemedText>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons name="receipt" size={22} color="white" />
                  <ThemedText
                    type="normal"
                    intensity="strong"
                    style={{ color: 'white', marginLeft: 10 }}
                  >
                    {t('rentReceipt.generateReceipt' as any)}
                  </ThemedText>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </MotiView>

        {/* Summary info */}
        {selectedProperty ? (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 300 }}
          >
            <ThemedView
              variant="surface"
              style={{
                marginTop: 20,
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.outline + '20',
              }}
            >
              <ThemedText type="caption" intensity="light" style={{ marginBottom: 8 }}>
                {t('rentReceipt.summary' as any)}
              </ThemedText>
              <ThemedView
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}
                backgroundColor="transparent"
              >
                <ThemedText type="caption" intensity="light">
                  {t('rentReceipt.property' as any)}
                </ThemedText>
                <ThemedText type="caption" intensity="strong" style={{ maxWidth: '60%' }} numberOfLines={1}>
                  {selectedProperty.title}
                </ThemedText>
              </ThemedView>
              <ThemedView
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}
                backgroundColor="transparent"
              >
                <ThemedText type="caption" intensity="light">
                  {t('rentReceipt.period' as any)}
                </ThemedText>
                <ThemedText type="caption" intensity="strong">
                  {t(`rentReceipt.month_${MONTHS_KEYS[selectedMonth - 1]}` as any)} {selectedYear}
                </ThemedText>
              </ThemedView>
              <ThemedView
                style={{ flexDirection: 'row', justifyContent: 'space-between' }}
                backgroundColor="transparent"
              >
                <ThemedText type="caption" intensity="light">
                  {t('rentReceipt.amount' as any)}
                </ThemedText>
                <ThemedText type="caption" intensity="strong" style={{ color: '#00B894' }}>
                  {amount ? `${parseFloat(amount).toLocaleString()} ${currency}` : '-'}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </MotiView>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
};

export default RentReceiptScreen;
