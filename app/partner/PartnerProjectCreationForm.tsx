import React, { useState } from 'react';
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { getInvestmentPipelineService, SPVProjectInput } from '@/services/api/investmentPipelineService';
import { useLanguage } from '@/components/contexts/language/LanguageContext';

const PartnerProjectCreationForm = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  // Guard: only partner role
  const isPartner = user?.role === 'partner' || user?.role === 'admin' || user?.role === 'super_admin';

  const [form, setForm] = useState({
    companyName: '',
    companyRegistration: '',
    jurisdiction: 'France',
    totalShares: '10000',
    sharePrice: '100',
    currency: 'USD' as 'XAF' | 'USD' | 'EUR',
    minimumInvestment: '500',
    maximumInvestment: '',
    maxInvestors: '500',
    tokenStandard: 'ERC-3643',
    annualYieldPct: '',
    occupancyRate: '95',
    durationMonths: '24',
    projectDescription: '',
    // SPV properties
    properties: [] as Array<{ name: string; address: string; estimatedValue: string }>,
  });

  const totalValuation = (parseFloat(form.totalShares) || 0) * (parseFloat(form.sharePrice) || 0);

  const inputStyle = {
    borderWidth: 1,
    borderColor: theme.outline + '40',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: theme.text,
    backgroundColor: theme.surface,
    fontSize: 14,
  } as const;

  const addProperty = () =>
    setForm(p => ({ ...p, properties: [...p.properties, { name: '', address: '', estimatedValue: '' }] }));

  const removeProperty = (idx: number) =>
    setForm(p => ({ ...p, properties: p.properties.filter((_, i) => i !== idx) }));

  const updateProperty = (idx: number, key: 'name' | 'address' | 'estimatedValue', val: string) =>
    setForm(p => ({
      ...p,
      properties: p.properties.map((prop, i) => (i === idx ? { ...prop, [key]: val } : prop)),
    }));

  const handleSubmit = async () => {
    if (!isPartner) {
      Alert.alert(t('partnerCreationForm.accessDeniedTitle'), t('partnerCreationForm.accessDeniedMsg'));
      return;
    }
    if (!form.companyName || !form.totalShares || !form.sharePrice || !form.projectDescription) {
      Alert.alert(t('partnerCreationForm.missingFieldsTitle'), t('partnerCreationForm.missingFieldsMsg'));
      return;
    }
    if (form.projectDescription.length < 30) {
      Alert.alert(t('partnerCreationForm.descTooShortTitle'), t('partnerCreationForm.descTooShortMsg'));
      return;
    }

    try {
      setLoading(true);
      const input: SPVProjectInput = {
        companyName: form.companyName,
        companyRegistration: form.companyRegistration || undefined,
        jurisdiction: form.jurisdiction || 'France',
        totalShares: parseInt(form.totalShares),
        sharePrice: parseFloat(form.sharePrice),
        currency: form.currency,
        minimumInvestment: parseFloat(form.minimumInvestment) || 500,
        maximumInvestment: form.maximumInvestment ? parseFloat(form.maximumInvestment) : undefined,
        maxInvestors: parseInt(form.maxInvestors) || 500,
        tokenStandard: form.tokenStandard || 'ERC-3643',
        annualYieldPct: form.annualYieldPct ? parseFloat(form.annualYieldPct) : undefined,
        occupancyRate: parseFloat(form.occupancyRate) || 95,
        durationMonths: parseInt(form.durationMonths) || 24,
        projectDescription: form.projectDescription,
        spvProperties: form.properties.map(p => ({
          name: p.name,
          address: p.address,
          estimatedValue: p.estimatedValue ? parseFloat(p.estimatedValue) : undefined,
        })),
      };
      await getInvestmentPipelineService().submitSPVProject(input);
      Alert.alert(
        t('partnerCreationForm.successTitle'),
        t('partnerCreationForm.successMsg'),
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert(t('partnerCreationForm.errorTitle'), error.message || t('partnerCreationForm.errorMsg'));
    } finally {
      setLoading(false);
    }
  };

  if (!isPartner) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 16 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', top: insets.top + 12, left: 20 }}>
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <MaterialCommunityIcons name="shield-lock-outline" size={64} color={theme.onSurface + '30'} />
        <ThemedText type="subtitle" intensity="strong" style={{ textAlign: 'center' }}>
          Accès réservé aux partenaires
        </ThemedText>
        <ThemedText type="caption" intensity="light" style={{ textAlign: 'center', lineHeight: 20 }}>
          La création de projets SPV est réservée aux partenaires vérifiés par la plateforme. Contactez-nous pour demander le statut partenaire.
        </ThemedText>
      </ThemedView>
    );
  }

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
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <ThemedView style={{ flex: 1 }}>
            <ThemedText type="subtitle" intensity="strong">{t('partnerCreationForm.title')}</ThemedText>
            <ThemedView
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                backgroundColor: theme.secondary + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start', marginTop: 2,
              }}
            >
              <MaterialCommunityIcons name="shield-check" size={10} color={theme.secondary as string} />
              <ThemedText style={{ fontSize: 10, fontWeight: '700', color: theme.secondary as string }}>{t('partnerCreationForm.badge')}</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40, gap: 20, paddingTop: 20 }}
        >
          {/* Info */}
          <ThemedView
            style={{
              padding: 14, borderRadius: 12, borderWidth: 1,
              borderColor: (theme.secondary as string) + '40',
              backgroundColor: (theme.secondary as string) + '08',
              flexDirection: 'row', gap: 10,
            }}
          >
            <MaterialCommunityIcons name="office-building" size={20} color={theme.secondary as string} />
            <ThemedView style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 13, color: theme.secondary as string, fontWeight: '700', marginBottom: 4 }}>
                Tokenisation SPV
              </ThemedText>
              <ThemedText style={{ fontSize: 12, color: theme.onSurface + '80', lineHeight: 18 }}>
                Créez une société (SPV), divisez-la en tokens, et ouvrez l'investissement à notre communauté. Validation plateforme obligatoire avant publication.
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Company info */}
          <ThemedView style={{ gap: 10 }}>
            <ThemedText type="normal" intensity="normal" style={{ fontWeight: '700' }}>{t('partnerCreationForm.sectionSociety')}</ThemedText>
            <ThemedView style={{ gap: 8 }}>
              <ThemedText type="caption" intensity="light">{t('partnerCreationForm.companyName')}</ThemedText>
              <TextInput
                value={form.companyName}
                onChangeText={v => setForm(p => ({ ...p, companyName: v }))}
                placeholder="ex: SCI Abidjan Premium"
                style={inputStyle}
                placeholderTextColor={theme.text + '60'}
              />
            </ThemedView>
            <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
              <ThemedView style={{ flex: 1, gap: 8 }}>
                <ThemedText type="caption" intensity="light">{t('partnerCreationForm.registrationNumber')}</ThemedText>
                <TextInput
                  value={form.companyRegistration}
                  onChangeText={v => setForm(p => ({ ...p, companyRegistration: v }))}
                  placeholder="ex: CI-ABJ-2024-001"
                  style={inputStyle}
                  placeholderTextColor={theme.text + '60'}
                />
              </ThemedView>
              <ThemedView style={{ flex: 1, gap: 8 }}>
                <ThemedText type="caption" intensity="light">{t('partnerCreationForm.jurisdiction')}</ThemedText>
                <TextInput
                  value={form.jurisdiction}
                  onChangeText={v => setForm(p => ({ ...p, jurisdiction: v }))}
                  placeholder="France"
                  style={inputStyle}
                  placeholderTextColor={theme.text + '60'}
                />
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Token structure */}
          <ThemedView style={{ gap: 10 }}>
            <ThemedText type="normal" intensity="normal" style={{ fontWeight: '700' }}>{t('partnerCreationForm.sectionTokens')}</ThemedText>

            {/* Devise */}
            <ThemedView style={{ gap: 6 }}>
              <ThemedText type="caption" intensity="light">{t('partnerCreationForm.currency')}</ThemedText>
              <ThemedView style={{ flexDirection: 'row', gap: 8 }}>
                {(['XAF', 'USD', 'EUR'] as const).map(cur => (
                  <TouchableOpacity
                    key={cur}
                    onPress={() => setForm(p => ({ ...p, currency: cur }))}
                    style={{
                      flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, alignItems: 'center',
                      borderColor: form.currency === cur ? theme.secondary : theme.outline + '30',
                      backgroundColor: form.currency === cur ? (theme.secondary as string) + '15' : theme.surface,
                    }}
                  >
                    <ThemedText style={{ fontWeight: '700', color: form.currency === cur ? theme.secondary as string : theme.text }}>
                      {cur}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
            </ThemedView>

            <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
              <ThemedView style={{ flex: 1, gap: 6 }}>
                <ThemedText type="caption" intensity="light">{t('partnerCreationForm.totalTokens')}</ThemedText>
                <TextInput
                  value={form.totalShares}
                  onChangeText={v => setForm(p => ({ ...p, totalShares: v }))}
                  keyboardType="numeric"
                  placeholder="10 000"
                  style={inputStyle}
                  placeholderTextColor={theme.text + '60'}
                />
              </ThemedView>
              <ThemedView style={{ flex: 1, gap: 6 }}>
                <ThemedText type="caption" intensity="light">{t('partnerCreationForm.pricePerToken')} ({form.currency}) *</ThemedText>
                <TextInput
                  value={form.sharePrice}
                  onChangeText={v => setForm(p => ({ ...p, sharePrice: v }))}
                  keyboardType="numeric"
                  placeholder="100"
                  style={inputStyle}
                  placeholderTextColor={theme.text + '60'}
                />
              </ThemedView>
            </ThemedView>

            {totalValuation > 0 && (
              <ThemedView
                style={{
                  padding: 10, borderRadius: 8,
                  backgroundColor: (theme.secondary as string) + '15',
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                }}
              >
                <MaterialCommunityIcons name="calculator-variant" size={16} color={theme.secondary as string} />
                <ThemedText style={{ fontSize: 13, color: theme.secondary as string, fontWeight: '700' }}>
                  Valorisation totale : {totalValuation.toLocaleString('fr-FR')} {form.currency}
                </ThemedText>
              </ThemedView>
            )}

            <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
              <ThemedView style={{ flex: 1, gap: 6 }}>
                <ThemedText type="caption" intensity="light">{t('partnerCreationForm.minInvest')}</ThemedText>
                <TextInput
                  value={form.minimumInvestment}
                  onChangeText={v => setForm(p => ({ ...p, minimumInvestment: v }))}
                  keyboardType="numeric"
                  placeholder="500"
                  style={inputStyle}
                  placeholderTextColor={theme.text + '60'}
                />
              </ThemedView>
              <ThemedView style={{ flex: 1, gap: 6 }}>
                <ThemedText type="caption" intensity="light">{t('partnerCreationForm.maxInvest')}</ThemedText>
                <TextInput
                  value={form.maximumInvestment}
                  onChangeText={v => setForm(p => ({ ...p, maximumInvestment: v }))}
                  keyboardType="numeric"
                  placeholder="illimité"
                  style={inputStyle}
                  placeholderTextColor={theme.text + '60'}
                />
              </ThemedView>
            </ThemedView>

            <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
              <ThemedView style={{ flex: 1, gap: 6 }}>
                <ThemedText type="caption" intensity="light">{t('partnerCreationForm.annualYield')}</ThemedText>
                <TextInput
                  value={form.annualYieldPct}
                  onChangeText={v => setForm(p => ({ ...p, annualYieldPct: v }))}
                  keyboardType="numeric"
                  placeholder="ex: 8"
                  style={inputStyle}
                  placeholderTextColor={theme.text + '60'}
                />
              </ThemedView>
              <ThemedView style={{ flex: 1, gap: 6 }}>
                <ThemedText type="caption" intensity="light">{t('partnerCreationForm.duration')}</ThemedText>
                <TextInput
                  value={form.durationMonths}
                  onChangeText={v => setForm(p => ({ ...p, durationMonths: v }))}
                  keyboardType="numeric"
                  placeholder="24"
                  style={inputStyle}
                  placeholderTextColor={theme.text + '60'}
                />
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* SPV Properties */}
          <ThemedView style={{ gap: 10 }}>
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <ThemedText type="normal" intensity="normal" style={{ fontWeight: '700' }}>
                Biens de la société SPV
              </ThemedText>
              <TouchableOpacity
                onPress={addProperty}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 4,
                  backgroundColor: (theme.secondary as string) + '20',
                  paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
                }}
              >
                <MaterialCommunityIcons name="plus" size={14} color={theme.secondary as string} />
                <ThemedText style={{ fontSize: 12, fontWeight: '700', color: theme.secondary as string }}>{t('partnerCreationForm.addToken')}</ThemedText>
              </TouchableOpacity>
            </ThemedView>

            {form.properties.map((prop, idx) => (
              <ThemedView
                key={idx}
                style={{ padding: 12, borderRadius: 10, borderWidth: 1, borderColor: theme.outline + '20', gap: 8 }}
              >
                <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <ThemedText style={{ fontWeight: '700', fontSize: 13 }}>Bien {idx + 1}</ThemedText>
                  <TouchableOpacity onPress={() => removeProperty(idx)}>
                    <MaterialCommunityIcons name="close-circle" size={18} color={theme.error ?? '#EF4444'} />
                  </TouchableOpacity>
                </ThemedView>
                <TextInput
                  value={prop.name}
                  onChangeText={v => updateProperty(idx, 'name', v)}
                  placeholder="Nom du bien"
                  style={inputStyle}
                  placeholderTextColor={theme.text + '60'}
                />
                <TextInput
                  value={prop.address}
                  onChangeText={v => updateProperty(idx, 'address', v)}
                  placeholder="Adresse"
                  style={inputStyle}
                  placeholderTextColor={theme.text + '60'}
                />
                <TextInput
                  value={prop.estimatedValue}
                  onChangeText={v => updateProperty(idx, 'estimatedValue', v)}
                  keyboardType="numeric"
                  placeholder={`Valeur estimée (${form.currency})`}
                  style={inputStyle}
                  placeholderTextColor={theme.text + '60'}
                />
              </ThemedView>
            ))}
          </ThemedView>

          {/* Description */}
          <ThemedView style={{ gap: 8 }}>
            <ThemedText type="normal" intensity="normal" style={{ fontWeight: '700' }}>{t('partnerCreationForm.description')}</ThemedText>
            <TextInput
              value={form.projectDescription}
              onChangeText={v => setForm(p => ({ ...p, projectDescription: v }))}
              multiline
              numberOfLines={6}
              placeholder="Décrivez la structure du SPV, les biens concernés, la stratégie d'investissement, les garanties offertes..."
              style={[inputStyle, { height: 140, textAlignVertical: 'top' }]}
              placeholderTextColor={theme.text + '60'}
            />
          </ThemedView>

          {/* Platform note */}
          <ThemedView
            style={{ padding: 12, borderRadius: 10, backgroundColor: theme.surfaceVariant, flexDirection: 'row', gap: 8 }}
          >
            <MaterialCommunityIcons name="scale-balance" size={18} color={theme.onSurface + '60'} />
            <ThemedText style={{ flex: 1, fontSize: 12, color: theme.onSurface + '60', lineHeight: 18 }}>
              Votre projet sera soumis à une validation juridique et financière par la plateforme. La tokenisation et la publication sur INVEST ne seront effectuées qu'après approbation.
            </ThemedText>
          </ThemedView>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: loading ? (theme.secondary as string) + '60' : theme.secondary as string,
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
              <MaterialCommunityIcons name="office-building-plus" size={20} color="white" />
            )}
            <ThemedText style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
              {loading ? t('partnerCreationForm.submitting') : t('partnerCreationForm.submitBtn')}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

export default PartnerProjectCreationForm;
