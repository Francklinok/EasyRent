
import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView, TouchableOpacity, TextInput, StyleSheet,
  Alert, ActivityIndicator, StatusBar, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { useLanguage } from '@/components/contexts/language';
import { getMicroservicesApi, RECVault } from '@/services/api/microservicesApi';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';

type ActionTab = 'overview' | 'deposit' | 'repay' | 'withdraw';

const ratioColor = (r: number) => r >= 200 ? '#22c55e' : r >= 150 ? '#f59e0b' : "#dc2626";
const getRatioLabel = (r: number, t: any) => r >= 200 ? t('vaultDetail.safe') : r >= 150 ? t('vaultDetail.warning') : t('vaultDetail.danger');

const DEMO_VAULT: RECVault = {
  id: '1', vaultId: 'vault-001', ownerId: 'user-1', propertyId: 'prop-1',
  collateralToken: 'RST-SIPOA01', collateralAmount: 5000, collateralPriceUsd: 1.0,
  recMinted: 2000, collateralizationRatio: 250, liquidationThreshold: 130,
  status: 'active', createdAt: '2026-01-15', updatedAt: '2026-03-01',
};

export default function VaultDetail() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { vaultId } = useLocalSearchParams<{ vaultId: string }>();
  const api = getMicroservicesApi();

  const [vault, setVault] = useState<RECVault | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ActionTab>('overview');
  const [actionLoading, setActionLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await api.getVault(vaultId || '');
      setVault(data);
    } catch {
      setVault(DEMO_VAULT);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [vaultId]);

  useEffect(() => { load(); }, [load]);

  if (loading || !vault) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  const collateralValueUsd = vault.collateralAmount * vault?.collateralPriceUsd;
  const debtRatio = vault.collateralizationRatio;
  const canWithdraw = vault.recMinted === 0;
  const isLiquidated = vault.status === 'liquidated';

  const inputStyle = {
    backgroundColor: theme.surfaceVariant,
    borderRadius: 10, padding: 12,
    color: theme.text, fontSize: 16,
    borderWidth: 1, borderColor: theme.outline + '30',
    marginTop: 8,
  };

  // ─── Action: Deposit collateral ──────────────────
  const handleDeposit = async () => {
    const amount = parseFloat(inputValue);
    if (!amount || amount <= 0) return;
    setActionLoading(true);
    try {
      const updated = await api.depositCollateral(vault.vaultId, amount, vault.collateralPriceUsd);
      setVault(updated);
      setInputValue('');
      setActiveTab('overview');
      Alert.alert(t('common.success'), t('vaultDetail.depositSuccess', { amount: amount.toLocaleString(), token: vault.collateralToken }));
    } catch {
      // Demo: simulate
      setVault(prev => prev ? {
        ...prev,
        collateralAmount: prev.collateralAmount + amount,
        collateralizationRatio: ((prev.collateralAmount + amount) * prev.collateralPriceUsd / prev.recMinted) * 100,
      } : prev);
      setInputValue('');
      setActiveTab('overview');
      Alert.alert(t('common.success') + ' (démo)', `${amount.toLocaleString()} ${vault.collateralToken} ajoutés.`);
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Action: Repay REC ───────────────────────────
  const handleRepay = async () => {
    const amount = parseFloat(inputValue);
    if (!amount || amount <= 0 || amount > vault.recMinted) return;
    setActionLoading(true);
    try {
      const updated = await api.repayREC(vault.vaultId, amount, vault.collateralPriceUsd);
      setVault(updated);
      setInputValue('');
      setActiveTab('overview');
      Alert.alert(t('common.success'), `${amount.toFixed(2)} REC remboursés.`);
    } catch {
      // Demo
      const newREC = vault.recMinted - amount;
      setVault(prev => prev ? {
        ...prev,
        recMinted: newREC,
        collateralizationRatio: newREC > 0 ? (collateralValueUsd / newREC) * 100 : 9999,
      } : prev);
      setInputValue('');
      setActiveTab('overview');
      Alert.alert(t('common.success') + ' (démo)', `${amount.toFixed(2)} REC remboursés.`);
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Action: Withdraw collateral ────────────────
  const handleWithdraw = async () => {
    if (!canWithdraw) {
      Alert.alert(t('vaultDetail.activeDebt'), t('vaultDetail.withdrawBlockedDesc'));
      return;
    }
    setActionLoading(true);
    try {
      await (api as any).withdrawCollateral?.(vault.vaultId);
      setVault(prev => prev ? { ...prev, status: 'closed', collateralAmount: 0, recMinted: 0 } : prev);
      Alert.alert(t('vaultDetail.statusClosed'), t('vaultDetail.withdrawReadyDesc', { amount: vault.collateralAmount.toLocaleString(), token: vault.collateralToken }));
      setActiveTab('overview');
    } catch {
      setVault(prev => prev ? { ...prev, status: 'closed', collateralAmount: 0, recMinted: 0 } : prev);
      Alert.alert(t('vaultDetail.statusClosed') + ' (démo)', `${vault.collateralAmount.toLocaleString()} ${vault.collateralToken} retournés.`);
      setActiveTab('overview');
    } finally {
      setActionLoading(false);
    }
  };

  const TABS: { id: ActionTab; label: string; icon: string; disabled?: boolean }[] = [
    { id: 'overview', label: t('vaultDetail.tabOverview'), icon: 'bank-outline' },
    { id: 'deposit', label: t('vaultDetail.tabDeposit'), icon: 'plus-circle', disabled: isLiquidated },
    { id: 'repay', label: t('vaultDetail.tabRepay'), icon: 'arrow-down-circle', disabled: isLiquidated || vault.recMinted === 0 },
    { id: 'withdraw', label: t('vaultDetail.tabWithdraw'), icon: 'arrow-up-circle', disabled: !canWithdraw || isLiquidated },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: theme.surface }]}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText type="normaltitle" style={[s.headerTitle, { color: theme.text }]}>{vault.collateralToken}</ThemedText>
          <ThemedText style={[s.headerSub, { color: theme.onSurface + '60' }]}>
            Vault {vault.vaultId} · {vault.status === 'active' ? t('vaultDetail.statusActive') : vault.status === 'liquidated' ? t('vaultDetail.statusLiquidated') : t('vaultDetail.statusClosed')}
          </ThemedText>
        </ThemedView>
        <ThemedView style={[s.ratioBadge, { backgroundColor: ratioColor(debtRatio) + '20' }]}>
          <ThemedText style={[s.ratioBadgeText, { color: ratioColor(debtRatio) }]}>
            {getRatioLabel(debtRatio, t)} · {debtRatio.toFixed(0)}%
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.primary} />}
        contentContainerStyle={{ padding: 16, gap: 14 }}
      >
        {/* Status banner */}
        {isLiquidated && (
          <ThemedView style={[s.alertBanner, { backgroundColor: theme.error + '12', borderColor: theme.error + '30' }]}>
            <MaterialCommunityIcons name="alert-circle" size={18} color={theme.error} />
            <ThemedText type="body" style={{ color: theme.error, fontWeight: '700', flex: 1 }}>
              {t('vaultDetail.liquidatedBanner')}
            </ThemedText>
          </ThemedView>
        )}

        {/* Key metrics */}
        <ThemedView style={[s.metricsCard, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
          <ThemedView style={s.metricRow}>
            <ThemedView style={s.metric}>
              <ThemedText type="normaltitle" style={[s.metricVal, { color: theme.text }]}>
                {vault.collateralAmount.toLocaleString()}
              </ThemedText>
              <ThemedText style={[s.metricLabel, { color: theme.onSurface + '60' }]}>{t('vaultDetail.collateral')}</ThemedText>
              <ThemedText style={[s.metricSub, { color: theme.onSurface + '45' }]}>{vault.collateralToken}</ThemedText>
            </ThemedView>
            <MaterialCommunityIcons name="arrow-right" size={20} color={theme.onSurface + '40'} />
            <ThemedView style={s.metric}>
              <ThemedText style={[s.metricVal, { color: theme.primary }]}>
                {vault.recMinted.toLocaleString()} REC
              </ThemedText>
              <ThemedText style={[s.metricLabel, { color: theme.onSurface + '60' }]}>{t('vaultDetail.recMinted')}</ThemedText>
              <ThemedText style={[s.metricSub, { color: theme.onSurface + '45' }]}>{t('vaultDetail.activeDebt')}</ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={[s.divider, { backgroundColor: theme.outline + '20' }]} />

          <ThemedView style={s.statRow}>
            <ThemedView style={s.stat}>
              <ThemedText type="normal" style={[s.statVal, { color: theme.text }]}>${collateralValueUsd.toLocaleString()}</ThemedText>
              <ThemedText style={[s.statLabel, { color: theme.onSurface + '55' }]}>{t('vaultDetail.usdValue')}</ThemedText>
            </ThemedView>
            <ThemedView style={[s.statDiv, { backgroundColor: theme.outline + '25' }]} />
            <ThemedView style={s.stat}>
              <ThemedText type="normal" style={[s.statVal, { color: ratioColor(debtRatio) }]}>{debtRatio.toFixed(0)}%</ThemedText>
              <ThemedText style={[s.statLabel, { color: theme.onSurface + '55' }]}>{t('vaultDetail.collRatio')}</ThemedText>
            </ThemedView>
            <ThemedView style={[s.statDiv, { backgroundColor: theme.outline + '25' }]} />
            <ThemedView style={s.stat}>
              <ThemedText type="normal" style={[s.statVal, { color: theme.error }]}>{vault.liquidationThreshold}%</ThemedText>
              <ThemedText style={[s.statLabel, { color: theme.onSurface + '55' }]}>{t('vaultDetail.liquidation')}</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Health bar */}
          <ThemedView>
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
              <ThemedText style={{ fontSize: 11, color: theme.onSurface + '60' }}>{t('vaultDetail.vaultHealth')}</ThemedText>
              <ThemedText style={{ fontSize: 11, fontWeight: '700', color: ratioColor(debtRatio) }}>
                {getRatioLabel(debtRatio, t)}
              </ThemedText>
            </ThemedView>
            <ThemedView style={[s.healthTrack, { backgroundColor: theme.outline + '25' }]}>
              <ThemedView style={[s.healthFill, {
                width: `${Math.min(100, (debtRatio / 300) * 100)}%`,
                backgroundColor: ratioColor(debtRatio),
              }]} />
            </ThemedView>
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <ThemedText style={{ fontSize: 10, color: theme.error }}>{t('vaultDetail.dangerThreshold', { threshold: vault?.liquidationThreshold?.toString() || '' })}</ThemedText>
              <ThemedText style={{ fontSize: 10, color: theme.success }}>{t('vaultDetail.safeThreshold')}</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Action tabs */}
        <ThemedView style={[s.tabsRow, { backgroundColor: theme.surfaceVariant }]}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.id}
              disabled={tab.disabled}
              onPress={() => setActiveTab(tab.id)}
              style={[s.tabBtn, {
                backgroundColor: activeTab === tab.id ? theme.primary : 'transparent',
                opacity: tab.disabled ? 0.4 : 1,
              }]}
            >
              <MaterialCommunityIcons
                name={tab.icon as any}
                size={14}
                color={activeTab === tab.id ? '#fff' : theme.onSurface + '70'}
              />
              <ThemedText style={{ fontSize: 11, fontWeight: '700', color: activeTab === tab.id ? '#fff' : theme.onSurface + '70' }}>
                {tab.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>

        {/* ── Aperçu ── */}
        {activeTab === 'overview' && (
          <ThemedView style={{ gap: 12 }}>
            {/* Trade REC CTA */}
            <TouchableOpacity
              style={[s.ctaCard, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}
              onPress={() => router.push({ pathname: '/trade', params: { tokenSymbol: 'REC', action: 'sell' } } as any)}
            >
              <ThemedView style={[s.ctaIcon, { backgroundColor: theme.primary + '20' }]}>
                <MaterialCommunityIcons name="swap-horizontal" size={22} color={theme.primary} />
              </ThemedView>
              <ThemedView style={{ flex: 1 }}>
                <ThemedText style={{ fontWeight: '800', color: theme.primary, fontSize: 14 }}>{t('vaultDetail.tradeREC')}</ThemedText>
                <ThemedText style={{ color: theme.onSurface + '65', fontSize: 12, marginTop: 2 }}>{t('vaultDetail.tradeRECDesc')}</ThemedText>
              </ThemedView>
              <MaterialCommunityIcons name="chevron-right" size={20} color={theme.primary} />
            </TouchableOpacity>

            {/* Info grid */}
            <ThemedView style={[s.infoCard, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
              {[
                { label: t('vaultDetail.vaultId'), value: vault.vaultId },
                { label: t('vaultDetail.property'), value: vault.propertyId },
                { label: t('vaultDetail.createdAt'), value: vault.createdAt ? new Date(vault.createdAt).toLocaleDateString('fr-FR') : '-' },
                { label: t('vaultDetail.updatedAt'), value: vault.updatedAt ? new Date(vault.updatedAt).toLocaleDateString('fr-FR') : '-' },
                { label: t('vaultDetail.oraclePrice'), value: `$${vault?.collateralPriceUsd?.toFixed(2)} ${t('vaultDetail.perToken')}` },
              ].map(({ label, value }) => (
                <ThemedView key={label} style={s.infoRow}>
                  <ThemedText style={{ color: theme.onSurface + '60' }}>{label}</ThemedText>
                  <ThemedText style={[s.infoValue, { color: theme.text }]}>{value}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>

            {/* Liquidation warning */}
            {debtRatio < 160 && !isLiquidated && (
              <ThemedView style={[s.alertBanner, { backgroundColor: theme.star + '12', borderColor: theme.star + '30' }]}>
                <MaterialCommunityIcons name="alert" size={16} color={theme.star} />
                <ThemedText style={{ color: theme.star, fontWeight: '700', flex: 1, fontSize: 12 }}>
                  {t('vaultDetail.liquidationWarning', { threshold: vault?.liquidationThreshold?.toString() || '' })}
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        )}

        {/* ── Déposer collatéral ── */}
        {activeTab === 'deposit' && (
          <ThemedView style={[s.actionCard, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <MaterialCommunityIcons name="plus-circle" size={20} color={theme.primary} />
              <ThemedText style={{ fontWeight: '800', fontSize: 15, color: theme.text }}>{t('vaultDetail.depositTitle')}</ThemedText>
            </ThemedView>
            <ThemedText style={{ color: theme.onSurface + '65', fontSize: 13, lineHeight: 18, marginBottom: 12 }}>
              {t('vaultDetail.depositDesc', { token: vault.collateralToken })}
            </ThemedText>

            <ThemedText style={{ fontWeight: '600', fontSize: 13, color: theme.text, marginBottom: 4 }}>{t('vaultDetail.depositQtyLabel', { token: vault.collateralToken })}</ThemedText>
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="numeric"
              placeholder="ex: 500"
              style={inputStyle}
              placeholderTextColor={theme.text + '60'}
            />

            {parseFloat(inputValue) > 0 && (
              <ThemedView style={[s.previewMini, { backgroundColor: theme.primary + '08', borderColor: theme.primary + '20' }]}>
                <ThemedText style={{ color: theme.onSurface + '70', fontSize: 12 }}>
                  {t('vaultDetail.depositPreviewCollateral', { amount: (vault.collateralAmount + parseFloat(inputValue)).toLocaleString() })}
                </ThemedText>
                <ThemedText style={{ color: theme.primary, fontWeight: '700', fontSize: 12 }}>
                  {t('vaultDetail.depositPreviewRatio', { ratio: (((vault.collateralAmount + parseFloat(inputValue)) * vault?.collateralPriceUsd / vault.recMinted) * 100).toFixed(0) })}
                </ThemedText>
              </ThemedView>
            )}

            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: theme.primary, opacity: actionLoading ? 0.7 : 1, marginTop: 12 }]}
              disabled={actionLoading || !parseFloat(inputValue)}
              onPress={handleDeposit}
            >
              {actionLoading ? <ActivityIndicator color="#fff" size={18} /> : (
                <>
                  <MaterialCommunityIcons name="plus" size={16} color="#fff" />
                  <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>{t('vaultDetail.depositBtn')}</ThemedText>
                </>
              )}
            </TouchableOpacity>
          </ThemedView>
        )}

        {/* ── Rembourser REC ── */}
        {activeTab === 'repay' && (
          <ThemedView style={[s.actionCard, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <MaterialCommunityIcons name="arrow-down-circle" size={20} color={theme.success} />
              <ThemedText style={{ fontWeight: '800', fontSize: 15, color: theme.text }}>{t('vaultDetail.repayTitle')}</ThemedText>
            </ThemedView>
            <ThemedText style={{ color: theme.onSurface + '65', fontSize: 13, lineHeight: 18, marginBottom: 12 }}>
              {t('vaultDetail.repayDesc', { amount: vault.recMinted.toLocaleString() })}
            </ThemedText>

            <ThemedText style={{ fontWeight: '600', fontSize: 13, color: theme.text, marginBottom: 4 }}>{t('vaultDetail.repayQtyLabel')}</ThemedText>
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="numeric"
              placeholder={`Max ${vault.recMinted.toLocaleString()}`}
              style={inputStyle}
              placeholderTextColor={theme.text + '60'}
            />

            {/* Quick repay buttons */}
            <ThemedView style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              {[25, 50, 100].map(pct => (
                <TouchableOpacity
                  key={pct}
                  style={[s.pctBtn, { borderColor: theme.success + '50', backgroundColor: theme.success + '10' }]}
                  onPress={() => setInputValue(String((vault.recMinted * pct / 100).toFixed(2)))}
                >
                  <ThemedText style={{ color: theme.success, fontWeight: '700', fontSize: 12 }}>
                    {pct === 100 ? t('vaultDetail.repayAll') : `${pct}%`}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>

            {parseFloat(inputValue) > 0 && parseFloat(inputValue) <= vault.recMinted && (
              <ThemedView style={[s.previewMini, { backgroundColor: theme.success + '08', borderColor: theme.success + '20' }]}>
                <ThemedText style={{ color: theme.onSurface + '70', fontSize: 12 }}>
                  {t('vaultDetail.repayPreviewRemaining', { amount: (vault.recMinted - parseFloat(inputValue)).toFixed(2) })}
                </ThemedText>
                {parseFloat(inputValue) >= vault.recMinted && (
                  <ThemedText style={{ color: theme.success, fontWeight: '700', fontSize: 12 }}>{t('vaultDetail.repayPreviewFull')}</ThemedText>
                )}
              </ThemedView>
            )}

            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: theme.success, opacity: actionLoading ? 0.7 : 1, marginTop: 12 }]}
              disabled={actionLoading || !parseFloat(inputValue) || parseFloat(inputValue) > vault.recMinted}
              onPress={handleRepay}
            >
              {actionLoading ? <ActivityIndicator color="#fff" size={18} /> : (
                <>
                  <MaterialCommunityIcons name="arrow-down" size={16} color="#fff" />
                  <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>{t('vaultDetail.repayBtn')}</ThemedText>
                </>
              )}
            </TouchableOpacity>
          </ThemedView>
        )}

        {/* ── Retirer collatéral ── */}
        {activeTab === 'withdraw' && (
          <ThemedView style={[s.actionCard, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <MaterialCommunityIcons name="arrow-up-circle" size={20} color={theme.secondary} />
              <ThemedText style={{ fontWeight: '800', fontSize: 15, color: theme.text }}>{t('vaultDetail.withdrawTitle')}</ThemedText>
            </ThemedView>

            {canWithdraw ? (
              <>
                <ThemedText style={{ color: theme.onSurface + '65', fontSize: 13, lineHeight: 18, marginBottom: 16 }}>
                  Votre dette est entièrement remboursée.{'\n'}
                  Vous pouvez récupérer vos{' '}
                  <ThemedText style={{ fontWeight: '800', color: theme.text }}>
                    {vault.collateralAmount.toLocaleString()} {vault.collateralToken}
                  </ThemedText>{' '}
                  dans votre Wallet et fermer ce vault.
                </ThemedText>

                <ThemedView style={[s.withdrawHighlight, { backgroundColor: theme.secondary + '10', borderColor: theme.secondary + '25' }]}>
                  <MaterialCommunityIcons name="wallet-plus" size={20} color={theme.secondary} />
                  <ThemedText style={{ color: theme.secondary, fontWeight: '700', fontSize: 14 }}>
                    {vault.collateralAmount.toLocaleString()} {vault.collateralToken}
                  </ThemedText>
                  <ThemedText style={{ color: theme.onSurface + '60', fontSize: 12 }}>{t('vaultDetail.withdrawReturnedLabel')}</ThemedText>
                </ThemedView>

                <TouchableOpacity
                  style={[s.actionBtn, { backgroundColor: theme.secondary, opacity: actionLoading ? 0.7 : 1, marginTop: 12 }]}
                  disabled={actionLoading}
                  onPress={handleWithdraw}
                >
                  {actionLoading ? <ActivityIndicator color="#fff" size={18} /> : (
                    <>
                      <MaterialCommunityIcons name="arrow-up" size={16} color="#fff" />
                      <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>{t('vaultDetail.withdrawBtn')}</ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <ThemedView style={{ gap: 12 }}>
                <ThemedText style={{ color: theme.onSurface + '65', fontSize: 13, lineHeight: 18 }}>
                  {t('vaultDetail.withdrawBlockedDesc')}
                </ThemedText>
                <ThemedView style={[s.alertBanner, { backgroundColor: theme.star + '10', borderColor: theme.star + '25' }]}>
                  <MaterialCommunityIcons name="lock" size={16} color={theme.star} />
                  <ThemedText style={{ color: theme.star, fontWeight: '700', flex: 1, fontSize: 12 }}>
                    {t('vaultDetail.withdrawDebtLock', { amount: vault.recMinted.toLocaleString() })}
                  </ThemedText>
                </ThemedView>
                <TouchableOpacity
                  style={[s.actionBtn, { backgroundColor: theme.success }]}
                  onPress={() => setActiveTab('repay')}
                >
                  <MaterialCommunityIcons name="arrow-down-circle" size={16} color="#fff" />
                  <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>{t('vaultDetail.withdrawGoRepay')}</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            )}
          </ThemedView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontWeight: '800' },
  headerSub: { fontSize: 11, marginTop: 1 },
  ratioBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  ratioBadgeText: { fontSize: 11, fontWeight: '800' },
  metricsCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  metricRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  metric: { alignItems: 'center', flex: 1 },
  metricVal: { fontWeight: '800' },
  metricLabel: { fontSize: 11, marginTop: 3 },
  metricSub: { fontSize: 10, marginTop: 1 },
  divider: { height: 1 },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontWeight: '800' },
  statLabel: { fontSize: 10, marginTop: 2, textAlign: 'center' },
  statDiv: { width: 1, height: 28, marginHorizontal: 4 },
  healthTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  healthFill: { height: '100%', borderRadius: 4 },
  tabsRow: { flexDirection: 'row', borderRadius: 12, padding: 4, gap: 4 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 9 },
  alertBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  ctaCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  ctaIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  infoCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoValue: { fontWeight: '600' },
  actionCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 8 },
  previewMini: { padding: 10, borderRadius: 10, borderWidth: 1, gap: 4, marginTop: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, borderRadius: 25 },
  pctBtn: { flex: 1, height: 34, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  withdrawHighlight: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1 },
});
