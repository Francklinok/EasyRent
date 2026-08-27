import React, { useState } from 'react';
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { getInvestmentPipelineService, RSTRequestInput } from '@/services/api/investmentPipelineService';
import { useLanguage } from '@/components/contexts/language/LanguageContext';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { useOwnerPropertiesV2 } from '@/hooks/usePropertiesV2';

const CURRENCIES = ['XAF', 'USD', 'EUR'] as const;

const RSTRequestScreen = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ propertyId?: string; propertyTitle?: string }>();
  const [loading, setLoading] = useState(false);

  // Entering this screen from the creation menu (no propertyId in params)
  // requires picking one of the owner's existing properties first — same
  // pattern as urbanReuse/create.tsx. Entering from a property card
  // (OwnerDashboardScreen) already carries propertyId, so the picker never
  // shows in that case.
  const [selectedPropertyId, setSelectedPropertyId] = useState(params.propertyId || '');
  const [selectedPropertyTitle, setSelectedPropertyTitle] = useState(params.propertyTitle || '');
  const needsPropertyPicker = !params.propertyId;
  const { properties: ownerProperties, loading: loadingProperties } = useOwnerPropertiesV2(needsPropertyPicker ? (user?.id || '') : '');

  const [form, setForm] = useState<{
    workCostEstimate: string;
    currency: 'XAF' | 'USD' | 'EUR';
    estimatedMonthlyRent: string;
    estimatedSalePrice: string;
    objective: 'rental' | 'sale';
    renovationDurationMonths: string;
    projectDescription: string;
    // Proposed financing terms — a starting point for platform review, not
    // binding. The admin can adjust these before the request is approved
    // and sent to the RST microservice (see rst-request/create.tsx bridge
    // in investmentPipelineRoutes.ts, which used to hardcode 70%/130%).
    revenueSharePct: string;
    targetAnnualYield: string;
    maxReturnPct: string;
  }>({
    workCostEstimate: '',
    currency: 'XAF',
    estimatedMonthlyRent: '',
    estimatedSalePrice: '',
    objective: 'rental',
    renovationDurationMonths: '',
    projectDescription: '',
    revenueSharePct: '',
    targetAnnualYield: '',
    maxReturnPct: '',
  });

  const inputStyle = {
    borderWidth: 1,
    borderColor: theme.outline + '60',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: theme.text,
    backgroundColor: theme.surfaceVariant,
    fontSize: 14,
  } as const;

  const handleSubmit = async () => {
    if (!selectedPropertyId) {
      Alert.alert('Erreur', t('rstRequest.errNoProperty'));
      return;
    }
    if (!form.workCostEstimate || !form.renovationDurationMonths || !form.projectDescription) {
      Alert.alert('Champs manquants', t('rstRequest.errMissingFields'));
      return;
    }
    if (form.objective === 'rental' && !form.estimatedMonthlyRent) {
      Alert.alert('Champs manquants', t('rstRequest.errRentRequired'));
      return;
    }
    if (form.objective === 'sale' && !form.estimatedSalePrice) {
      Alert.alert('Champs manquants', t('rstRequest.errSaleRequired'));
      return;
    }

    try {
      setLoading(true);
      const input: RSTRequestInput = {
        propertyId: selectedPropertyId,
        workCostEstimate: parseFloat(form.workCostEstimate),
        currency: form.currency,
        estimatedMonthlyRent: parseFloat(form.estimatedMonthlyRent) || 0,
        estimatedSalePrice: form.estimatedSalePrice ? parseFloat(form.estimatedSalePrice) : undefined,
        objective: form.objective,
        renovationDurationMonths: parseInt(form.renovationDurationMonths),
        projectDescription: form.projectDescription,
        proposedTerms: (form.revenueSharePct || form.targetAnnualYield || form.maxReturnPct) ? {
          revenueSharePct: form.revenueSharePct ? parseFloat(form.revenueSharePct) : undefined,
          targetAnnualYield: form.targetAnnualYield ? parseFloat(form.targetAnnualYield) : undefined,
          maxReturnPct: form.maxReturnPct ? parseFloat(form.maxReturnPct) : undefined,
        } : undefined,
      };
      await getInvestmentPipelineService().submitRSTRequest(input);
      Alert.alert(
        t('rstRequest.successTitle'),
        t('rstRequest.successMsg'),
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ThemedView style={{ flex: 1 }}>
        {/* Header */}
        <ThemedView
          style={{
            paddingTop: insets.top + 12,
            paddingBottom: 12,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.outline + '20',
          }}
        >

          <ThemedView style={{ flex: 1 }}>
            <ThemedText type="subtitle" intensity="strong">{t('rstRequest.title')}</ThemedText>
            {selectedPropertyTitle && (
              <ThemedText type="caption" intensity="light" numberOfLines={1}>
                {selectedPropertyTitle}
              </ThemedText>
            )}
          </ThemedView>
        </ThemedView>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40, gap: 20, paddingTop: 20 }}
        >
          {/* Info banner */}
          <ThemedView
            style={{
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.outline + '40',
              backgroundColor: '#10b981' + '08',
              flexDirection: 'row',
              gap: 10,
            }}
          >
            <MaterialCommunityIcons name="information-outline" size={22} color="#10b981" />
            <ThemedView style={{ flex: 1 }} backgroundColor="transparent">
              <ThemedText type = "normal" style={{ fontWeight: '700', marginBottom: 4 }}>
                {t('rstRequest.howTitle')}
              </ThemedText>
              <ThemedText type = "normal" intensity = "light" style={{ lineHeight: 18 }}>
                {t('rstRequest.howDesc')}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Property picker — only shown when no propertyId came through
              route params (i.e. entering from the creation menu rather than
              a property card). Same inline-picker pattern as
              urbanReuse/create.tsx. */}
          {needsPropertyPicker && (
            <ThemedView style={{ gap: 8 }}>
              <ThemedText type="normaltitle" intensity="strong">Propriété à financer</ThemedText>
              {loadingProperties ? (
                <ActivityIndicator color="#10b981" style={{ marginVertical: 12 }} />
              ) : ownerProperties.length === 0 ? (
                <ThemedText type ="body" style={{  color: theme.onSurface + '70', marginVertical: 8 }}>
                  Aucune propriété trouvée pour votre compte.
                </ThemedText>
              ) : (
                <ThemedView>
                  <ScrollView 
                    showsHorizontalScrollIndicator ={false}
                    contentContainerStyle={{
                      gap: 8,
                    }}
                    >
                    {ownerProperties.map((p: any) => (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => { setSelectedPropertyId(p.id); setSelectedPropertyTitle(p.title); }}
                      style={{
                        flexDirection: 'row', alignItems: 'center', gap: 28,
                        borderWidth: 1, borderRadius: 10, padding: 6,
                        borderColor: selectedPropertyId === p.id ? '#10b981' : theme.outline + '60',
                      }}
                    >

                        <ThemedView>
                         {p.images.map((image:any) => (
                            <Image
                              source={{ uri: image }}
                              style={{ width: 180, height: 85, borderRadius: 8 }}
                            />
                          ))}

                        </ThemedView>
                       <ThemedView>
                        <ThemedText type ="normal" style={{ flex: 1, fontWeight:'700' }}>
                        {p.title}
                      </ThemedText>
                      <ThemedView style ={{flexDirection:"row", gap:8 }}>
                       <MaterialIcons name="location-on" size={16} color={theme.error} />
                       <ThemedText type ="body" style={{ flex: 1, fontWeight: selectedPropertyId === p.id ? '700' : '600' }}>
                        {p.address}
                      </ThemedText>
                      </ThemedView>
                     
                       <ThemedText type ="body" intensity ="light" style={{ flex: 1, fontWeight: '700' }}>
                        {p.actionType}
                      </ThemedText>

                       </ThemedView>
                      {selectedPropertyId === p.id && <MaterialCommunityIcons name="check-circle" size={18} color="#10b981" />}
                    </TouchableOpacity>
                  ))}

                  </ScrollView>
                  
                </ThemedView>
              )}
            </ThemedView>
          )}

          {/* Objective */}
          <ThemedView style={{ gap: 8 }}>
            <ThemedText type="normaltitle" intensity="strong">{t('rstRequest.objective')}</ThemedText>
            <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
              {([
                { value: 'rental' as const, label: t('rstRequest.objRental'), icon: 'home-account', desc: t('rstRequest.objRentalDesc') },
                { value: 'sale' as const, label: t('rstRequest.objSale'), icon: 'currency-usd', desc: t('rstRequest.objSaleDesc') },
              ]).map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setForm(p => ({ ...p, objective: opt.value }))}
                  style={{
                    flex: 1, padding: 14, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', gap: 6,
                    borderColor: form.objective === opt.value ? '#10b981' + '40' : theme.outline + '60',
                    backgroundColor: form.objective === opt.value ? theme.surface + '12' : theme.surface,
                  }}
                >
                  <MaterialCommunityIcons
                    name={opt.icon as any}
                    size={24}
                    color={form.objective === opt.value ? '#10b981' : theme.onSurface + '80'}
                  />
                  <ThemedText style={{ fontWeight: '700', fontSize: 14, color: form.objective === opt.value ? '#10b981' : theme.text }}>
                    {opt.label}
                  </ThemedText>
                  <ThemedText type = "body" intensity = "light">{opt.desc}</ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ThemedView>

          {/* Currency */}
          <ThemedView style={{ gap: 8 }}>
            <ThemedText type="normaltitle" intensity="strong">{t('rstRequest.currency')}</ThemedText>
            <ThemedView style={{ flexDirection: 'row', gap: 8 }}>
              {CURRENCIES.map(cur => (
                <TouchableOpacity
                  key={cur}
                  onPress={() => setForm(p => ({ ...p, currency: cur }))}
                  style={{
                    flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, alignItems: 'center',
                    borderColor: form.currency === cur ? '#10b981' : theme.outline + '60',
                    backgroundColor: form.currency === cur ? '#10b981' + '12' : theme.surface,
                  }}
                >
                  <ThemedText style={{ fontWeight: '700', color: form.currency === cur ? '#10b981' : theme.text }}>
                    {cur}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ThemedView>

          {/* Work cost */}
          <ThemedView style={{ gap: 8 }}>
            <ThemedText type="normaltitle" intensity="strong">{`${t('rstRequest.workCost')} (${form.currency}) *`}</ThemedText>
            <TextInput
              value={form.workCostEstimate}
              onChangeText={v => setForm(p => ({ ...p, workCostEstimate: v }))}
              keyboardType="numeric"
              placeholder="ex: 5 000 000"
              style={inputStyle}
              placeholderTextColor={theme.text + '80'}
            />
          </ThemedView>

          {/* Duration */}
          <ThemedView style={{ gap: 8 }}>
            <ThemedText type="normaltitle" intensity="strong">{t('rstRequest.duration')}</ThemedText>
            <TextInput
              value={form.renovationDurationMonths}
              onChangeText={v => setForm(p => ({ ...p, renovationDurationMonths: v }))}
              keyboardType="numeric"
              placeholder="ex: 6"
              style={inputStyle}
              placeholderTextColor={theme.text + '80'}
            />
          </ThemedView>

          {/* Monthly rent (rental objective) */}
          {form.objective === 'rental' && (
            <ThemedView style={{ gap: 8 }}>
              <ThemedText type="normaltitle" intensity="strong">{`${t('rstRequest.monthlyRent')} (${form.currency}) *`}</ThemedText>
              <TextInput
                value={form.estimatedMonthlyRent}
                onChangeText={v => setForm(p => ({ ...p, estimatedMonthlyRent: v }))}
                keyboardType="numeric"
                placeholder="ex: 150 000"
                style={inputStyle}
                placeholderTextColor={theme.text + '80'}
              />
            </ThemedView>
          )}

          {/* Sale price (sale objective) */}
          {form.objective === 'sale' && (
            <ThemedView style={{ gap: 8 }}>
              <ThemedText type="normaltitle" intensity="strong">{`${t('rstRequest.salePrice')} (${form.currency}) *`}</ThemedText>
              <TextInput
                value={form.estimatedSalePrice}
                onChangeText={v => setForm(p => ({ ...p, estimatedSalePrice: v }))}
                keyboardType="numeric"
                placeholder="ex: 20 000 000"
                style={inputStyle}
                placeholderTextColor={theme.text + '80'}
              />
            </ThemedView>
          )}

          {/* Description */}
          <ThemedView style={{ gap: 8 }}>
            <ThemedText type="normaltitle" intensity="strong">{t('rstRequest.description')}</ThemedText>
            <TextInput
              value={form.projectDescription}
              onChangeText={v => setForm(p => ({ ...p, projectDescription: v }))}
              multiline
              numberOfLines={5}
              placeholder={t('rstRequest.descPlaceholder')}
              style={[inputStyle, { height: 120, textAlignVertical: 'top' }]}
              placeholderTextColor={theme.text + '80'}
            />
          </ThemedView>

          {/* Proposed financing terms — optional, negotiable. Left blank,
              the platform applies its own default terms at approval. */}
          <ThemedView style={{ gap: 10 }}>
            <ThemedView style={{ gap: 4 }}>
              <ThemedText type="normaltitle" intensity="strong">{t('rstRequest.termsTitle')}</ThemedText>
              <ThemedText type = "body" intensity ="light" style={{ lineHeight: 16 }}>
                {t('rstRequest.termsDesc')}
              </ThemedText>
            </ThemedView>

            <ThemedView style={{ gap: 8 }}>
              <ThemedText type="normal" intensity="strong">{t('rstRequest.revenueSharePct')}</ThemedText>
              <TextInput
                value={form.revenueSharePct}
                onChangeText={v => setForm(p => ({ ...p, revenueSharePct: v }))}
                keyboardType="numeric"
                placeholder="ex: 60"
                style={inputStyle}
                placeholderTextColor={theme.text + '80'}
              />
            </ThemedView>

            <ThemedView style={{ flexDirection: 'row', gap: 4 }}>
              <ThemedView style={{ flex: 1, gap: 8 }}>
                <ThemedText type="normal" intensity="strong">{t('rstRequest.targetAnnualYield')}</ThemedText>
                <TextInput
                  value={form.targetAnnualYield}
                  onChangeText={v => setForm(p => ({ ...p, targetAnnualYield: v }))}
                  keyboardType="numeric"
                  placeholder="ex: 10"
                  style={inputStyle}
                  placeholderTextColor={theme.text + '80'}
                />
              </ThemedView>
              <ThemedView style={{ flex: 1, gap: 8 }}>
                <ThemedText type="normal" intensity="strong">{t('rstRequest.maxReturnPct')}</ThemedText>
                <TextInput
                  value={form.maxReturnPct}
                  onChangeText={v => setForm(p => ({ ...p, maxReturnPct: v }))}
                  keyboardType="numeric"
                  placeholder="ex: 130"
                  style={inputStyle}
                  placeholderTextColor={theme.text + '80'}
                />
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Platform note */}
          <ThemedView
            style={{
              padding: 12,
              borderRadius: 10,
              backgroundColor: theme.surfaceVariant,
              flexDirection: 'row',
              gap: 8,
            }}
          >
            <MaterialCommunityIcons name="shield-check-outline" size={18} color={theme.success + '80'} />
            <ThemedText type = "body" intensity ="light" style={{ flex: 1, lineHeight: 18 }}>
              {t('rstRequest.platformNote')}
            </ThemedText>
          </ThemedView>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#10b981' + '60' : '#10b981',
              padding: 16,
              borderRadius: 14,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <MaterialCommunityIcons name="send-check" size={20} color="white" />
            )}
            <ThemedText style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
              {loading ? t('rstRequest.submitting') : t('rstRequest.submitBtn')}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

export default RSTRequestScreen;
