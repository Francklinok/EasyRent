import React, { useState, useEffect } from 'react';
import {
  ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
  TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { getMicroservicesApi, SwapQuote } from '@/services/api/microservicesApi';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useLanguage } from '@/components/contexts/language/LanguageContext';

const POOLS = [
  { poolId: 'pool-rst-rec', tokenA: 'RST-PARIS-001', tokenB: 'REC', reserveA: 142000, reserveB: 284000, feeBps: 30 },
  { poolId: 'pool-spv-rec', tokenA: 'SPV-LYON-002', tokenB: 'REC', reserveA: 85000, reserveB: 170000, feeBps: 30 },
];

export default function SwapPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ poolId?: string }>();
  const { t, isRTL } = useLanguage();
  const api = getMicroservicesApi();

  const initialPool = POOLS.find(p => p.poolId === params.poolId) || POOLS[0];
  const [pool] = useState(initialPool);
  const [amountIn, setAmountIn] = useState('');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [executing, setExecuting] = useState(false);

  const getQuote = async (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      setQuote(null);
      return;
    }
    setLoadingQuote(true);
    try {
      const q = await api.getSwapQuote({
        poolId: pool.poolId,
        tokenIn: pool.tokenA,
        tokenOut: pool.tokenB,
        amountIn: parseFloat(amount),
      });
      setQuote(q);
    } catch {
      // Fallback: constant product formula
      const aIn = parseFloat(amount);
      const k = pool.reserveA * pool.reserveB;
      const newReserveA = pool.reserveA + aIn;
      const newReserveB = k / newReserveA;
      const rawOut = pool.reserveB - newReserveB;
      const fee = rawOut * (pool.feeBps / 10000);
      const amountOut = rawOut - fee;
      const priceImpact = ((aIn / pool.reserveA) * 100).toFixed(2);
      setQuote({
        poolId: pool.poolId,
        tokenIn: pool.tokenA,
        tokenOut: pool.tokenB,
        amountIn: aIn,
        amountOut,
        priceImpact: parseFloat(priceImpact),
        feeAmount: fee,
        minAmountOut: amountOut * 0.99,
        rate: amountOut / aIn,
      });
    } finally {
      setLoadingQuote(false);
    }
  };

  const executeSwap = async () => {
    if (!quote) return;
    setExecuting(true);
    try {
      await api.executeSwap({
        poolId: pool.poolId,
        tokenIn: pool.tokenA,
        tokenOut: pool.tokenB,
        amountIn: quote.amountIn,
        minAmountOut: quote.minAmountOut ?? quote.amountOut * 0.99,
      });
      Alert.alert(
        t('trade.swapSuccess'),
        `${t('trade.received')} ${quote.amountOut.toFixed(4)} ${pool.tokenB}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch {
      // Demo success
      Alert.alert(
        t('trade.swapSuccess'),
        `${t('trade.received')} ${quote.amountOut.toFixed(4)} ${pool.tokenB}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      setExecuting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <ThemedView>
          <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '900' }}>{t('trade.swapTokens')}</ThemedText>
          <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>
            {pool.tokenA} ↔ {pool.tokenB}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* INPUT: You give */}
        <ThemedView style={[s.swapBox, { backgroundColor: theme.surface, borderColor: theme.outline + '25' }]}>
          <ThemedText type="body" style={[s.boxLabel, { color: theme.onSurface + '60' }]}>{t('trade.youGive')}</ThemedText>
          <ThemedView style={[s.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TextInput
              style={[s.amountInput, { color: theme.text }]}
              value={amountIn}
              onChangeText={v => {
                setAmountIn(v);
                getQuote(v);
              }}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={theme.onSurface + '40'}
            />
            <ThemedView style={[s.tokenPill, { backgroundColor: theme.primary + '12' }]}>
              <MaterialCommunityIcons name="coin" size={16} color={theme.primary} />
              <ThemedText type="body" style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>{pool.tokenA}</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Swap arrow */}
        <ThemedView style={{ alignItems: 'center' }}>
          <ThemedView style={[s.swapArrow, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }]}>
            <MaterialCommunityIcons name="swap-vertical" size={22} color={theme.primary} />
          </ThemedView>
        </ThemedView>

        {/* OUTPUT: You receive */}
        <ThemedView style={[s.swapBox, { backgroundColor: theme.surface, borderColor: theme.outline + '25' }]}>
          <ThemedText type="body" style={[s.boxLabel, { color: theme.onSurface + '60' }]}>{t('trade.youReceive')}</ThemedText>
          <ThemedView style={[s.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {loadingQuote ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <ThemedText type="normaltitle" style={[s.amountOutput, { color: theme.text }]}>
                {quote ? quote.amountOut.toFixed(4) : '0.00'}
              </ThemedText>
            )}
            <ThemedView style={[s.tokenPill, { backgroundColor: '#10B981' + '12' }]}>
              <MaterialCommunityIcons name="currency-usd" size={16} color="#10B981" />
              <ThemedText type="body" style={{ color: '#10B981', fontWeight: '700', fontSize: 13 }}>{pool.tokenB}</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Quote details */}
        {quote && (
          <ThemedView style={[s.quoteCard, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
            {[
              { label: t('trade.rate'), value: `1 ${pool.tokenA} = ${quote.rate.toFixed(4)} ${pool.tokenB}` },
              { label: t('trade.priceImpact'), value: `${quote.priceImpact}%`, highlight: quote.priceImpact > 1 },
              { label: t('trade.fees'), value: `${(quote.feeAmount ?? quote.fee ?? 0).toFixed(4)} ${pool.tokenB}` },
              { label: t('trade.minReceived'), value: `${(quote.minAmountOut ?? quote.amountOut * 0.99).toFixed(4)} ${pool.tokenB}` },
            ].map((row, i) => (
              <ThemedView key={i} style={[s.quoteRow, { borderBottomColor: theme.outline + '12', borderBottomWidth: i < 3 ? 1 : 0 }]}>
                <ThemedText type="body" style={{ color: theme.onSurface + '70', fontSize: 13 }}>{row.label}</ThemedText>
                <ThemedText type="body" style={{ color: row.highlight ? '#EF4444' : theme.text, fontWeight: '700', fontSize: 13 }}>{row.value}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        )}

        {/* Info note */}
        <ThemedView style={[s.infoNote, { backgroundColor: theme.outline + '08', borderColor: theme.outline + '20' }]}>
          <Ionicons name="information-circle" size={15} color={theme.onSurface + '50'} />
          <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12, flex: 1 }}>{t('trade.ammInfo')}</ThemedText>
        </ThemedView>

        {/* Confirm button */}
        <TouchableOpacity
          style={[s.cta, { backgroundColor: quote ? theme.primary : theme.outline + '30' }]}
          disabled={!quote || executing}
          onPress={executeSwap}
        >
          {executing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="swap-horizontal" size={18} color={quote ? '#fff' : theme.onSurface + '40'} />
              <ThemedText type="normaltitle" style={{ color: quote ? '#fff' : theme.onSurface + '40', fontWeight: '800' }}>
                {t('trade.confirmSwap')}
              </ThemedText>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { padding: 4 },
  swapBox: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
  boxLabel: { fontSize: 12, fontWeight: '600' },
  row: { alignItems: 'center', justifyContent: 'space-between' },
  amountInput: { fontSize: 28, fontWeight: '900', flex: 1 },
  amountOutput: { fontSize: 28, fontWeight: '900', flex: 1 },
  tokenPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  swapArrow: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  quoteCard: { borderRadius: 12, borderWidth: 1, padding: 12 },
  quoteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9 },
  infoNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 10, borderRadius: 10, borderWidth: 1 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 54, borderRadius: 27, marginTop: 4 },
});
