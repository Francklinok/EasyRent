/**
 * invest/rst/buyback.tsx — Guichet de rachat privé (architecture v2 §8)
 *
 * Nature juridique : une cession de créance, jamais un transfert de token via
 * le marché secondaire. Le prix est toujours calculé par une grille de décote
 * pré-définie selon le temps restant — jamais négocié au cas par cas. L'offre
 * est discrétionnaire : dépend de la liquidité disponible côté plateforme à
 * l'instant T.
 */
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { getRSTClient, PrivateBuybackOffer } from '@/services/api/rstClient';

type Step = 'request' | 'offer' | 'resolved';

export default function BuybackScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>('request');
  const [residualEstimate, setResidualEstimate] = useState('');
  const [monthsRemaining, setMonthsRemaining] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [offer, setOffer] = useState<PrivateBuybackOffer | null>(null);
  const [finalStatus, setFinalStatus] = useState<'accepted' | 'declined' | null>(null);

  const investorId = user?.id || '';

  const handleRequest = async () => {
    const residual = parseFloat(residualEstimate) || 0;
    const months = parseInt(monthsRemaining, 10) || 0;
    if (!projectId || !investorId) { setError('Projet ou investisseur introuvable.'); return; }
    if (residual <= 0) { setError('Merci de renseigner une estimation de valeur résiduelle.'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await getRSTClient().requestBuyback(projectId, {
        holder_id: investorId,
        residual_value_estimate_usd: residual,
        months_remaining: months,
      });
      setOffer(res);
      setStep('offer');
    } catch (err: any) {
      setError(err?.message || "Impossible de calculer une offre de rachat pour l'instant.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!offer) return;
    setLoading(true);
    setError('');
    try {
      const res = await getRSTClient().acceptBuybackOffer(offer.offer_id);
      setOffer(res);
      setFinalStatus('accepted');
      setStep('resolved');
    } catch (err: any) {
      setError(err?.message || "Impossible d'accepter l'offre.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!offer) return;
    setLoading(true);
    setError('');
    try {
      const res = await getRSTClient().declineBuybackOffer(offer.offer_id);
      setOffer(res);
      setFinalStatus('declined');
      setStep('resolved');
    } catch (err: any) {
      setError(err?.message || "Impossible de refuser l'offre.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      <StatusBar barStyle="light-content" />

      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText type="normaltitle" style={{ fontWeight: '800', color: theme.text }}>Guichet de rachat privé</ThemedText>
          <ThemedText type="body" intensity="light" style={{ fontWeight: '700' }}>
            Cession de créance — discrétionnaire
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <ThemedView style={[s.infoBox, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
          <MaterialCommunityIcons name="information" size={16} color={theme.primary} />
          <ThemedText type="body" intensity="light" style={{ flex: 1, lineHeight: 18 }}>
            Ceci n'est pas une vente sur un marché secondaire : vous cédez votre droit contractuel aux
            distributions futures, moyennant un paiement immédiat décoté. Le prix est calculé par une grille
            fixée à l'avance — jamais négocié au cas par cas. La plateforme peut refuser faute de liquidité disponible.
          </ThemedText>
        </ThemedView>

        {step === 'request' && (
          <>
            <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
              <ThemedText type="normal" style={[s.label, { color: theme.text }]}>Valeur résiduelle estimée</ThemedText>
              <ThemedText type="body" intensity="light" style={{ marginBottom: 4 }}>
                Somme des distributions futures projetées jusqu'à échéance (scénario de base)
              </ThemedText>
              <ThemedView style={[s.inputRow, { borderColor: theme.primary }]}>
                <ThemedText type="subtitle" style={{ fontWeight: '800', color: theme.primary }}>$</ThemedText>
                <TextInput
                  value={residualEstimate} onChangeText={setResidualEstimate}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  style={{ flex: 1, fontSize: 18, fontWeight: '700', color: theme.text }}
                  placeholderTextColor={theme.onSurface + '40'}
                />
              </ThemedView>

              <ThemedText type="normal" style={[s.label, { color: theme.text, marginTop: 8 }]}>Mois restants avant échéance</ThemedText>
              <ThemedView style={[s.inputRow, { borderColor: theme.outline + '40' }]}>
                <TextInput
                  value={monthsRemaining} onChangeText={setMonthsRemaining}
                  keyboardType="number-pad"
                  placeholder="ex : 12"
                  style={{ flex: 1, fontSize: 16, fontWeight: '600', color: theme.text }}
                  placeholderTextColor={theme.onSurface + '40'}
                />
                <ThemedText type="normal" style={{ color: theme.onSurface + '50' }}>mois</ThemedText>
              </ThemedView>
            </ThemedView>

            {error !== '' && (
              <ThemedView style={[s.box, { backgroundColor: '#ef444415', borderColor: '#ef444430' }]}>
                <MaterialCommunityIcons name="alert-circle" size={16} color={theme.error} />
                <ThemedText type="body" style={{ color: theme.error, flex: 1 }}>{error}</ThemedText>
              </ThemedView>
            )}

            <TouchableOpacity
              style={[s.cta, { backgroundColor: loading ? theme.outline : theme.primary }]}
              onPress={handleRequest} disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <ThemedText type="normal" style={s.ctaText}>Demander une offre de rachat</ThemedText>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        {step === 'offer' && offer && (
          <>
            <ThemedView style={[s.resultCard, { backgroundColor: theme.primary + '08', borderColor: theme.primary + '30' }]}>
              <ThemedText type="normaltitle" style={{ fontWeight: '800', color: theme.text, textAlign: 'center' }}>
                Offre de rachat calculée
              </ThemedText>
              <ThemedText type="normaltitle" size={28} style={{ fontWeight: '900', color: theme.primary }}>
                ${offer.offer_price_usd.toFixed(2)}
              </ThemedText>
              <ThemedText type="body" intensity="light">
                Décote de {(offer.discount_pct * 100).toFixed(0)}% sur {offer.months_remaining} mois restants
                (valeur résiduelle : ${offer.residual_value_estimate_usd.toFixed(2)})
              </ThemedText>

              {!offer.platform_liquidity_available && (
                <ThemedView style={[s.box, { backgroundColor: theme.warning + '15', borderColor: theme.warning + '35', marginTop: 8 }]}>
                  <MaterialCommunityIcons name="alert" size={16} color={theme.warning} />
                  <ThemedText type="body" style={{ color: theme.text, flex: 1 }}>
                    Liquidité de la plateforme insuffisante à l'instant T pour ce montant — l'offre ne peut pas
                    être acceptée maintenant. Réessayez plus tard.
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>

            {error !== '' && (
              <ThemedView style={[s.box, { backgroundColor: '#ef444415', borderColor: '#ef444430' }]}>
                <MaterialCommunityIcons name="alert-circle" size={16} color={theme.error} />
                <ThemedText type="body" style={{ color: theme.error, flex: 1 }}>{error}</ThemedText>
              </ThemedView>
            )}

            <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={[s.cta, { flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.outline + '50' }]}
                onPress={handleDecline} disabled={loading}
              >
                <ThemedText type="normal" style={{ color: theme.onSurface + '70' }}>Refuser</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.cta, { flex: 2, backgroundColor: (!offer.platform_liquidity_available || loading) ? theme.outline : theme.primary }]}
                onPress={handleAccept} disabled={!offer.platform_liquidity_available || loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <MaterialCommunityIcons name="handshake" size={18} color="#fff" />
                    <ThemedText type="normal" style={s.ctaText}>Accepter l'offre</ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </ThemedView>
          </>
        )}

        {step === 'resolved' && offer && (
          <ThemedView style={[s.resultCard, {
            backgroundColor: finalStatus === 'accepted' ? theme.success + '10' : theme.outline + '10',
            borderColor: finalStatus === 'accepted' ? theme.success + '30' : theme.outline + '30',
          }]}>
            <MaterialCommunityIcons
              name={finalStatus === 'accepted' ? 'check-circle' : 'close-circle-outline'}
              size={56}
              color={finalStatus === 'accepted' ? theme.success : theme.onSurface + '50'}
            />
            <ThemedText type="normaltitle" style={{ fontWeight: '900', color: theme.text, textAlign: 'center' }}>
              {finalStatus === 'accepted' ? 'Cession de créance acceptée' : 'Offre refusée'}
            </ThemedText>
            <ThemedText type="body" intensity="light" style={{ textAlign: 'center', lineHeight: 19 }}>
              {finalStatus === 'accepted'
                ? "Une notification formelle sera envoyée au gestionnaire du SPV. Le paiement sera traité selon les délais de la plateforme."
                : "Vous conservez votre position actuelle. Vous pouvez redemander une offre à tout moment tant que la fenêtre de rachat reste ouverte."}
            </ThemedText>
            <TouchableOpacity
              style={[s.cta, { backgroundColor: theme.primary, width: '100%', marginTop: 8 }]}
              onPress={() => router.replace('/wallet/Wallet?tab=tokens' as any)}
            >
              <ThemedText type="normal" style={s.ctaText}>Retour au portefeuille</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 12, borderWidth: 1, padding: 14 },
  box: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, borderWidth: 1, padding: 12 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
  label: { fontWeight: '800' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, height: 50 },
  resultCard: { borderRadius: 16, borderWidth: 1, padding: 24, alignItems: 'center', gap: 8 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 26 },
  ctaText: { color: '#fff', fontWeight: '800' },
});
