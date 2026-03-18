import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
  Alert, TextInput, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { useLanguage } from '@/components/contexts/language/LanguageContext';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { getKYCService, KYCStatus, KYCStatusResponse } from '@/services/api/kycService';

type Step = 'status' | 'personal' | 'document' | 'address';

export default function KYCScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const kycService = getKYCService();

  const [kycStatus, setKycStatus] = useState<KYCStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [step, setStep] = useState<Step>('status');
  const [submitting, setSubmitting] = useState(false);

  // Personal info form
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [dob, setDob] = useState('');
  const [nationality, setNationality] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');

  // Document form
  const [docType, setDocType] = useState<'national_id' | 'passport' | 'drivers_license'>('national_id');
  const [docCountry, setDocCountry] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [docFrontUrl, setDocFrontUrl] = useState('');

  // Address form
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const load = useCallback(async () => {
    try {
      const status = await kycService.getMyKYCStatus();
      setKycStatus(status);
    } catch {
      setKycStatus(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const statusColor = kycStatus ? kycService.getStatusColor(kycStatus.status) : '#9ca3af';

  const STATUS_ICON: Record<KYCStatus, string> = {
    verified: 'shield-check',
    pending: 'clock-outline',
    under_review: 'magnify',
    rejected: 'shield-off',
    expired: 'calendar-remove',
    suspended: 'shield-alert',
    unverified: 'shield-outline',
  };

  const handleSubmitPersonal = async () => {
    if (!firstName || !lastName || !dob || !nationality || !phone) {
      Alert.alert(t('common.error'), t('kyc.fillAllFields'));
      return;
    }
    setSubmitting(true);
    try {
      const result = await kycService.submitPersonalInfo({
        firstName, lastName, dateOfBirth: dob,
        nationality, gender, phoneNumber: phone,
      });
      if (result.success) {
        Alert.alert(t('common.success'), result.message, [
          { text: 'OK', onPress: () => setStep('document') },
        ]);
        load();
      } else {
        Alert.alert(t('common.error'), result.errors?.join('\n') || result.message);
      }
    } catch {
      Alert.alert(t('common.error'), t('kyc.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitDocument = async () => {
    if (!docCountry || !docFrontUrl) {
      Alert.alert(t('common.error'), t('kyc.fillAllFields'));
      return;
    }
    setSubmitting(true);
    try {
      const result = await kycService.submitDocument({
        type: docType,
        issuingCountry: docCountry,
        frontImageUrl: docFrontUrl,
        documentNumber: docNumber,
      });
      Alert.alert(t('common.success'), result.message, [
        { text: 'OK', onPress: () => setStep('address') },
      ]);
      load();
    } catch {
      Alert.alert(t('common.error'), t('kyc.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAddress = async () => {
    if (!street || !city || !country) {
      Alert.alert(t('common.error'), t('kyc.fillAllFields'));
      return;
    }
    setSubmitting(true);
    try {
      const result = await kycService.submitAddress({
        type: 'residential',
        streetAddress: street,
        city, country, postalCode,
        isPrimary: true,
      });
      if (result.success) {
        Alert.alert(t('common.success'), result.message, [
          { text: 'OK', onPress: () => { setStep('status'); load(); } },
        ]);
      } else {
        Alert.alert(t('common.error'), result.errors?.join('\n') || result.message);
      }
    } catch {
      Alert.alert(t('common.error'), t('kyc.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = [s.input, { backgroundColor: theme.surface, borderColor: theme.outline + '40', color: theme.text }];

  const renderStatusScreen = () => (
    <>
      {/* Status Card */}
      <ThemedView style={[s.statusCard, { backgroundColor: theme.surface, borderColor: statusColor + '40' }]}>
        <ThemedView style={[s.statusIcon, { backgroundColor: statusColor + '15' }]}>
          <MaterialCommunityIcons
            name={(STATUS_ICON[kycStatus?.status || 'unverified'] || 'shield-outline') as any}
            size={40}
            color={statusColor}
          />
        </ThemedView>
        <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '800', textAlign: 'center' }}>
          {t(`kyc.status_${kycStatus?.status || 'unverified'}`)}
        </ThemedText>
        <ThemedView style={[s.statusBadge, { backgroundColor: statusColor + '15' }]}>
          <ThemedText type="body" style={{ color: statusColor, fontWeight: '700', fontSize: 12 }}>
            {t(`kyc.level_${kycStatus?.verificationLevel || 'basic'}`)}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Progress */}
      {kycStatus?.progress && (
        <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
          <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '800', marginBottom: 12 }}>
            {t('kyc.progress')} — {kycStatus.progress.overallProgress}%
          </ThemedText>
          <ThemedView style={[s.progressTrack, { backgroundColor: theme.outline + '25' }]}>
            <ThemedView style={[s.progressFill, {
              width: `${kycStatus.progress.overallProgress}%` as any,
              backgroundColor: statusColor,
            }]} />
          </ThemedView>
          <ThemedView style={{ gap: 8, marginTop: 12 }}>
            {[
              { key: 'emailVerified', label: t('kyc.emailVerified') },
              { key: 'phoneVerified', label: t('kyc.phoneVerified') },
              { key: 'identityVerified', label: t('kyc.identityVerified') },
              { key: 'addressVerified', label: t('kyc.addressVerified') },
            ].map(item => {
              const done = (kycStatus.progress as any)[item.key];
              return (
                <ThemedView key={item.key} style={s.progressRow}>
                  <Ionicons
                    name={done ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={done ? '#22c55e' : theme.outline}
                  />
                  <ThemedText type="body" style={{ color: done ? theme.text : theme.onSurface + '60' }}>
                    {item.label}
                  </ThemedText>
                </ThemedView>
              );
            })}
          </ThemedView>
        </ThemedView>
      )}

      {/* Next Steps */}
      {kycStatus?.nextSteps && kycStatus.nextSteps.length > 0 && (
        <ThemedView style={[s.card, { backgroundColor: theme.primary + '08', borderColor: theme.primary + '25' }]}>
          <ThemedText type="normaltitle" style={{ color: theme.primary, fontWeight: '800', marginBottom: 8 }}>
            {t('kyc.nextSteps')}
          </ThemedText>
          {kycStatus.nextSteps.map((step, i) => (
            <ThemedView key={i} style={s.progressRow}>
              <MaterialCommunityIcons name="arrow-right-circle" size={16} color={theme.primary} />
              <ThemedText type="body" style={{ color: theme.text, flex: 1, fontSize: 13 }}>{step}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      )}

      {/* Start KYC Button */}
      {(!kycStatus || kycStatus.status === 'unverified' || kycStatus.status === 'rejected') && (
        <TouchableOpacity
          style={[s.cta, { backgroundColor: theme.primary }]}
          onPress={() => setStep('personal')}
        >
          <MaterialCommunityIcons name="shield-check" size={18} color="#fff" />
          <ThemedText type="normaltitle" style={{ color: '#fff', fontWeight: '800' }}>
            {t('kyc.startVerification')}
          </ThemedText>
        </TouchableOpacity>
      )}
    </>
  );

  const renderPersonalForm = () => (
    <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
      <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '800', marginBottom: 4 }}>
        {t('kyc.personalInfo')}
      </ThemedText>
      <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 13, marginBottom: 16 }}>
        {t('kyc.personalInfoDesc')}
      </ThemedText>

      {[
        { label: t('auth.firstName'), value: firstName, setter: setFirstName, placeholder: 'Jean' },
        { label: t('auth.lastName'), value: lastName, setter: setLastName, placeholder: 'Dupont' },
        { label: t('kyc.dateOfBirth'), value: dob, setter: setDob, placeholder: '1990-01-15' },
        { label: t('kyc.nationality'), value: nationality, setter: setNationality, placeholder: 'Française' },
        { label: t('auth.phone'), value: phone, setter: setPhone, placeholder: '+33 6 00 00 00 00' },
      ].map(field => (
        <ThemedView key={field.label} style={{ marginBottom: 12 }}>
          <ThemedText type="body" style={{ color: theme.onSurface + '70', marginBottom: 4, fontSize: 13 }}>
            {field.label}
          </ThemedText>
          <TextInput
            value={field.value}
            onChangeText={field.setter}
            placeholder={field.placeholder}
            placeholderTextColor={theme.onSurface + '40'}
            style={inputStyle}
          />
        </ThemedView>
      ))}

      {/* Gender */}
      <ThemedText type="body" style={{ color: theme.onSurface + '70', marginBottom: 8, fontSize: 13 }}>
        {t('kyc.gender')}
      </ThemedText>
      <ThemedView style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {(['male', 'female', 'other'] as const).map(g => (
          <TouchableOpacity
            key={g}
            style={[s.genderBtn, {
              backgroundColor: gender === g ? theme.primary : theme.surface,
              borderColor: gender === g ? theme.primary : theme.outline + '40',
            }]}
            onPress={() => setGender(g)}
          >
            <ThemedText type="body" style={{ color: gender === g ? '#fff' : theme.text, fontSize: 13, fontWeight: '600' }}>
              {t(`kyc.gender_${g}`)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      <TouchableOpacity
        style={[s.cta, { backgroundColor: submitting ? theme.outline : theme.primary }]}
        onPress={handleSubmitPersonal}
        disabled={submitting}
      >
        {submitting
          ? <ActivityIndicator color="#fff" />
          : <ThemedText type="normaltitle" style={{ color: '#fff', fontWeight: '800' }}>{t('common.next')}</ThemedText>
        }
      </TouchableOpacity>
    </ThemedView>
  );

  const renderDocumentForm = () => (
    <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
      <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '800', marginBottom: 4 }}>
        {t('kyc.identityDocument')}
      </ThemedText>
      <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 13, marginBottom: 16 }}>
        {t('kyc.identityDocumentDesc')}
      </ThemedText>

      {/* Doc type */}
      <ThemedText type="body" style={{ color: theme.onSurface + '70', marginBottom: 8, fontSize: 13 }}>
        {t('kyc.documentType')}
      </ThemedText>
      <ThemedView style={{ flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['national_id', 'passport', 'drivers_license'] as const).map(dt => (
          <TouchableOpacity
            key={dt}
            style={[s.docTypeBtn, {
              backgroundColor: docType === dt ? theme.primary + '15' : theme.surface,
              borderColor: docType === dt ? theme.primary : theme.outline + '30',
            }]}
            onPress={() => setDocType(dt)}
          >
            <ThemedText type="body" style={{ color: docType === dt ? theme.primary : theme.text, fontSize: 12, fontWeight: '700' }}>
              {t(`kyc.docType_${dt}`)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      {[
        { label: t('kyc.issuingCountry'), value: docCountry, setter: setDocCountry, placeholder: 'France' },
        { label: t('kyc.documentNumber'), value: docNumber, setter: setDocNumber, placeholder: 'AB123456' },
        { label: t('kyc.frontImageUrl'), value: docFrontUrl, setter: setDocFrontUrl, placeholder: 'https://...' },
      ].map(field => (
        <ThemedView key={field.label} style={{ marginBottom: 12 }}>
          <ThemedText type="body" style={{ color: theme.onSurface + '70', marginBottom: 4, fontSize: 13 }}>
            {field.label}
          </ThemedText>
          <TextInput
            value={field.value}
            onChangeText={field.setter}
            placeholder={field.placeholder}
            placeholderTextColor={theme.onSurface + '40'}
            style={inputStyle}
            autoCapitalize="none"
          />
        </ThemedView>
      ))}

      <TouchableOpacity
        style={[s.cta, { backgroundColor: submitting ? theme.outline : theme.primary }]}
        onPress={handleSubmitDocument}
        disabled={submitting}
      >
        {submitting
          ? <ActivityIndicator color="#fff" />
          : <ThemedText type="normaltitle" style={{ color: '#fff', fontWeight: '800' }}>{t('common.next')}</ThemedText>
        }
      </TouchableOpacity>
    </ThemedView>
  );

  const renderAddressForm = () => (
    <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
      <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '800', marginBottom: 4 }}>
        {t('kyc.address')}
      </ThemedText>
      <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 13, marginBottom: 16 }}>
        {t('kyc.addressDesc')}
      </ThemedText>

      {[
        { label: t('property.address'), value: street, setter: setStreet, placeholder: '12 Rue de la Paix' },
        { label: t('property.city'), value: city, setter: setCity, placeholder: 'Paris' },
        { label: t('property.country'), value: country, setter: setCountry, placeholder: 'France' },
        { label: t('kyc.postalCode'), value: postalCode, setter: setPostalCode, placeholder: '75001' },
      ].map(field => (
        <ThemedView key={field.label} style={{ marginBottom: 12 }}>
          <ThemedText type="body" style={{ color: theme.onSurface + '70', marginBottom: 4, fontSize: 13 }}>
            {field.label}
          </ThemedText>
          <TextInput
            value={field.value}
            onChangeText={field.setter}
            placeholder={field.placeholder}
            placeholderTextColor={theme.onSurface + '40'}
            style={inputStyle}
          />
        </ThemedView>
      ))}

      <TouchableOpacity
        style={[s.cta, { backgroundColor: submitting ? theme.outline : theme.primary }]}
        onPress={handleSubmitAddress}
        disabled={submitting}
      >
        {submitting
          ? <ActivityIndicator color="#fff" />
          : <ThemedText type="normaltitle" style={{ color: '#fff', fontWeight: '800' }}>{t('kyc.submitKYC')}</ThemedText>
        }
      </TouchableOpacity>
    </ThemedView>
  );

  const STEPS: { id: Step; label: string }[] = [
    { id: 'status', label: t('kyc.stepStatus') },
    { id: 'personal', label: t('kyc.stepPersonal') },
    { id: 'document', label: t('kyc.stepDocument') },
    { id: 'address', label: t('kyc.stepAddress') },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => step === 'status' ? router.back() : setStep('status')} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '900' }}>
            {t('kyc.title')}
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>
            {t('kyc.subtitle')}
          </ThemedText>
        </ThemedView>
        {kycStatus?.status === 'verified' && (
          <ThemedView style={[s.verifiedBadge, { backgroundColor: '#22c55e15' }]}>
            <MaterialCommunityIcons name="shield-check" size={16} color="#22c55e" />
            <ThemedText type="body" style={{ color: '#22c55e', fontWeight: '700', fontSize: 12 }}>
              {t('kyc.verified')}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {/* Step indicator (only when filling forms) */}
      {step !== 'status' && (
        <ThemedView style={[s.stepBar, { backgroundColor: theme.surface }]}>
          {STEPS.filter(s => s.id !== 'status').map((st, i) => {
            const stepOrder = ['personal', 'document', 'address'];
            const currentIdx = stepOrder.indexOf(step);
            const thisIdx = stepOrder.indexOf(st.id);
            const done = thisIdx < currentIdx;
            const active = thisIdx === currentIdx;
            return (
              <ThemedView key={st.id} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                <ThemedView style={[s.stepDot, {
                  backgroundColor: done ? '#22c55e' : active ? theme.primary : theme.outline + '30',
                }]}>
                  {done
                    ? <Ionicons name="checkmark" size={12} color="#fff" />
                    : <ThemedText type="body" style={{ color: active ? '#fff' : theme.onSurface + '50', fontSize: 11, fontWeight: '700' }}>
                        {i + 1}
                      </ThemedText>
                  }
                </ThemedView>
                <ThemedText type="body" style={{ color: active ? theme.primary : theme.onSurface + '50', fontSize: 10, fontWeight: active ? '700' : '400' }}>
                  {st.label}
                </ThemedText>
              </ThemedView>
            );
          })}
        </ThemedView>
      )}

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.primary} />}
        contentContainerStyle={{ padding: 16, gap: 16 }}
      >
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {step === 'status' && renderStatusScreen()}
            {step === 'personal' && renderPersonalForm()}
            {step === 'document' && renderDocumentForm()}
            {step === 'address' && renderAddressForm()}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { padding: 4 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  stepBar: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 16 },
  stepDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statusCard: { borderRadius: 16, borderWidth: 1, padding: 24, alignItems: 'center', gap: 12 },
  statusIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16 },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, borderRadius: 25, marginTop: 8 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  genderBtn: { flex: 1, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  docTypeBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
});
