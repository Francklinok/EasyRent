import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { getMicroservicesApi, SPVProject } from '@/services/api/microservicesApi';
import  { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
const TABS = ['Aperçu', 'Société', 'Rendement'];

export default function SPVDetail() {
  const { theme } = useTheme();
  const router = useRouter();
  const { spvId } = useLocalSearchParams<{ spvId: string }>();
  const api = getMicroservicesApi();

  const [project, setProject] = useState<SPVProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (!spvId) return;
    api.getSPVProject(spvId)
      .then(setProject)
      .catch(() => setProject(DEMO_SPV))
      .finally(() => setLoading(false));
  }, [spvId]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color= {theme.secondary} size="large" />
      </SafeAreaView>
    );
  }

  if (!project) return null;

  const soldShares = project.totalShares - project.availableShares;
  const pct = Math.min(100, (soldShares / project.totalShares) * 100);
  const totalRaised = soldShares * project.sharePrice;

  return (
    <SafeAreaView style={{ flex: 1}}>
      <StatusBar barStyle="light-content" />

      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: theme.surface }]}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText type = "normaltitle" style={[s.headerTitle, { color: theme.text }]} numberOfLines={1}>{project.propertyAddress}</ThemedText>
          <ThemedText type= "caption" style={[s.headerSub, { color: theme.secondary}]}>{project.companyName}</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Onglets */}
      <ThemedView style={[s.tabs, { borderBottomColor: theme.outline + '20' }]}>
        {TABS.map((t, i) => (
          <TouchableOpacity key={t} onPress={() => setTab(i)} style={[s.tab, i === tab && s.tabActive]}>
            <ThemedText type= "body" style={[s.tabText, { color: i === tab ? theme.secondary : theme.onSurface + '60' }]}>{t}</ThemedText>
            {i === tab && <View style={[s.tabIndicator, { backgroundColor: theme.secondary }]} />}
          </TouchableOpacity>
        ))}
      </ThemedView>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>

        {/* ── Onglet 0 : Aperçu ── */}
        {tab === 0 && (
          <>
            {/* Progression financement */}
            <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
              <ThemedView style={s.cardTitleRow}>
                <MaterialCommunityIcons name="chart-donut" size={16} color= {theme.secondary} />
                <ThemedText type ="normal" style={[s.cardTitle, { color: theme.text }]}>Souscription en cours</ThemedText>
              </ThemedView>
              <ThemedView style={s.progressHeaderRow}>
                <ThemedText type = "caption" style={ { color: theme.onSurface + '60' }}>
                  {soldShares.toLocaleString()} parts vendues
                </ThemedText>
                <ThemedText type= "caption" style={[s.progressPct, { color:theme.secondary }]}>{pct.toFixed(1)}%</ThemedText>
              </ThemedView>
              <ThemedView style={[s.progressTrack, { backgroundColor: theme.outline + '25' }]}>
                <ThemedView style={[s.progressFill, { width: `${pct}%`, backgroundColor: theme.secondary }]} />
              </ThemedView>
              <ThemedView style={s.progressFooter}>
                <ThemedText style={[s.progressSub, { color: theme.onSurface + '50' }]}>
                  ${totalRaised.toLocaleString()} levés / ${project.totalValue.toLocaleString()} objectif
                </ThemedText>
                <ThemedText style={[s.progressSub, { color: theme.onSurface + '50' }]}>
                  {project.currentInvestors} / {project.maxInvestors} investisseurs
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Métriques clés */}
            <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
              <ThemedText type ="normal" style={[s.cardTitle, { color: theme.text }]}>Métriques clés</ThemedText>
              <ThemedView style={s.metricsGrid}>
                {[
                  { label: 'Valorisation totale', value: `$${(project.totalValue / 1e6).toFixed(2)}M`, icon: 'office-building' },
                  { label: 'Prix / part', value: `$${project.sharePrice}`, icon: 'tag' },
                  { label: 'Parts disponibles', value: project.availableShares.toLocaleString(), icon: 'ticket-percent' },
                  { label: 'Invest. minimum', value: `$${project.minimumInvestment}`, icon: 'cash-minus' },
                  { label: 'Rendement annuel', value: `${project.annualYieldPct.toFixed(1)}%`, icon: 'trending-up' },
                  { label: 'Taux d\'occupation', value: `${project.occupancyRate}%`, icon: 'home-account' },
                ].map((m, i) => (
                  <ThemedView key={i} style={[s.metricBox, { borderColor: theme.outline + '15' }]}>
                    <MaterialCommunityIcons name={m.icon as any} size={16} color={ theme.secondary} />
                    <ThemedText type ="normal" style={[s.metricVal, { color: theme.text }]}>{m.value}</ThemedText>
                    <ThemedText style={[s.metricLabel, { color: theme.onSurface + '55' }]}>{m.label}</ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
            </ThemedView>

            {/* Token standard */}
            <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
              <ThemedView style={s.cardTitleRow}>
                <MaterialCommunityIcons name="shield-check" size={16} color={theme.secondary} />
                <ThemedText type ="normal" style={[s.cardTitle, { color: theme.text }]}>Conformité & Token</ThemedText>
              </ThemedView>
              {[
                ['Standard token', project.tokenStandard, 'shield-account'],
                ['Juridiction', project.jurisdiction, 'earth'],
                ['KYC requis', 'Oui — vérification identité', 'card-account-details'],
                ['Transferts', 'Whitelist uniquement (ERC-3643)', 'swap-horizontal'],
              ].map(([label, value, icon], i) => (
                <ThemedView key={i} style={[s.infoRow, { borderBottomColor: theme.outline + '10' }]}>
                  <MaterialCommunityIcons name={icon as any} size={14} color={theme.onSurface + '50'} />
                  <ThemedText type = "caption" style={[s.infoLabel, { color: theme.onSurface + '60' }]}>{label}</ThemedText>
                  <ThemedText type = "caption" style={[s.infoValue, { color: theme.text }]}>{value}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>

            {/* CTA */}
            {project.status === 'active' && (
              <TouchableOpacity
                style={[s.ctaBtn, { backgroundColor:theme.secondary }]}
                onPress={() => router.push({ pathname: '/invest/spv/subscribe', params: { spvId: project.spvId } } as any)}
              >
                <MaterialCommunityIcons name="bank-plus" size={20} color="#fff" />
                <ThemedText type= "normal" style={s.ctaBtnText}>Acheter des parts de {project.companyName}</ThemedText>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* ── Onglet 1 : Société ── */}
        {tab === 1 && (
          <>
            <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
              <ThemedView style={s.cardTitleRow}>
                <MaterialCommunityIcons name="domain" size={16} color= {theme.secondary} />
                <ThemedText type ="normal" style={[s.cardTitle, { color: theme.text }]}>Structure légale SPV</ThemedText>
              </ThemedView>
              <ThemedView style={[s.spvInfoBox, { backgroundColor: theme.secondary + '08', borderColor:theme.secondary + '20' }]}>
                <ThemedText type= "body" style={[s.spvInfoText, { color: theme.onSurface + '80' }]}>
                  Cette propriété est détenue par une <Text style={{ fontWeight: '800' }}>Société à Vocation Spéciale (SPV)</Text> enregistrée légalement.
                  Les parts que vous achetez correspondent à des <Text style={{ fontWeight: '800' }}>actions tokenisées de cette société</Text>, vous conférant des droits réels sur le bien.
                </ThemedText>
              </ThemedView>
              {[
                ['Raison sociale', project.companyName, 'office-building'],
                ['Immatriculation', project.companyRegistration, 'file-document'],
                ['Pays d\'enregistrement', project.jurisdiction, 'earth'],
                ['Standard token', `${project.tokenStandard} (sécurité token)`, 'shield-check'],
                ['Investisseurs max', `${project.maxInvestors} actionnaires`, 'account-group'],
              ].map(([label, value, icon], i) => (
                <ThemedView key={i} style={[s.infoRow, { borderBottomColor: theme.outline + '10' }]}>
                  <MaterialCommunityIcons name={icon as any} size={14} color={theme.onSurface + '50'} />
                  <ThemedText type= "caption" style={[s.infoLabel, { color: theme.onSurface + '60' }]}>{label}</ThemedText>
                  <ThemedText type= "caption" style={[s.infoValue, { color: theme.text }]}>{value}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>

            <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
              <ThemedView style={s.cardTitleRow}>
                <MaterialCommunityIcons name="scale-balance" size={16} color={theme.secondary} />
                <ThemedText type ="normal" style={[s.cardTitle, { color: theme.text }]}>Droits des actionnaires</ThemedText>
              </ThemedView>
              {[
                { icon: 'cash-multiple', text: 'Revenus locatifs proportionnels à vos parts' },
                { icon: 'trending-up', text: 'Plus-value potentielle à la revente du bien' },
                { icon: 'vote', text: 'Droit de vote aux assemblées générales de la société' },
                { icon: 'swap-horizontal', text: 'Transfert de parts sur le marché secondaire (whitelist)' },
                { icon: 'file-document-outline', text: 'Accès aux rapports financiers annuels' },
              ].map((d, i) => (
                <ThemedView key={i} style={s.rightRow}>
                  <MaterialCommunityIcons name={d.icon as any} size={16} color={theme.secondary} />
                  <ThemedText type ="caption" style={[s.rightText, { color: theme.onSurface + '80' }]}>{d.text}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          </>
        )}

        {/* ── Onglet 2 : Rendement ── */}
        {tab === 2 && (
          <>
            <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
              <ThemedView style={s.cardTitleRow}>
                <MaterialCommunityIcons name="chart-line" size={16} color={theme.secondary} />
                <ThemedText type ="normal" style={[s.cardTitle, { color: theme.text }]}>Performances & rendement</ThemedText>
              </ThemedView>
              {[
                ['Rendement locatif annuel', `${project.annualYieldPct.toFixed(1)}%`, theme.success],
                ['Taux d\'occupation actuel', `${project.occupancyRate}%`, project.occupancyRate >= 90 ? '#22c55e' : '#f59e0b'],
                ['Score ESG', project.esgScore ? `${project.esgScore}/100` : 'N/A', theme.secondary],
                ['Valorisation du bien', `$${(project.totalValue / 1e6).toFixed(2)}M`, theme.text],
              ].map(([label, value, color], i) => (
                <ThemedView key={i} style={[s.perfRow, { borderBottomColor: theme.outline + '10' }]}>
                  <ThemedText type ="body" style={{ color: theme.onSurface + '65' }}>{label}</ThemedText>
                  <ThemedText type = "normal" style={[s.perfValue, { color: color as string }]}>{value}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>

            <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
              <ThemedView style={s.cardTitleRow}>
                <MaterialCommunityIcons name="calculator" size={16} color= {theme.secondary} />
                <ThemedText type ="normal" style={[s.cardTitle, { color: theme.text }]}>Simulation (pour $1 000 investis)</ThemedText>
              </ThemedView>
              {(() => {
                const invested = 1000;
                const shares = Math.floor(invested / project.sharePrice);
                const pctOwned = (shares / project.totalShares) * 100;
                const annualIncome = (project.annualYieldPct / 100) * project.totalValue * (pctOwned / 100);
                return (
                  <ThemedView style={[s.simBox, { backgroundColor:theme.secondary + '08', borderColor:theme.secondary + '20' }]}>
                    {[
                      [`Parts achetées`, `${shares} parts`],
                      [`% de la société`, `${pctOwned.toFixed(4)}%`],
                      [`Revenu annuel estimé`, `$${annualIncome.toFixed(2)}`],
                      [`Revenu mensuel estimé`, `$${(annualIncome / 12).toFixed(2)}`],
                    ].map(([label, value], i) => (
                      <ThemedView key={i} style={s.simRow}>
                        <ThemedText type ="body" style={ { color: theme.onSurface + '60' }}>{label}</ThemedText>
                        <ThemedText type ="body" style={[s.simValue, { color: theme.secondary }]}>{value}</ThemedText>
                      </ThemedView>
                    ))}
                  </ThemedView>
                );
              })()}
              <ThemedText type ="caption" style={[s.disclaimer, { color: theme.onSurface + '45' }]}>
                * Simulation basée sur les données actuelles. Les rendements passés ne préjugent pas des rendements futurs.
              </ThemedText>
            </ThemedView>
          </>
        )}

        <ThemedView style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const DEMO_SPV: SPVProject = {
  id: '1', spvId: 'spv-001', propertyId: 'prop-1',
  propertyAddress: '12 Rue des Ambassadeurs, Paris 8e',
  totalValue: 2500000, currency: 'USD',
  totalShares: 25000, availableShares: 8500,
  sharePrice: 100, minimumInvestment: 500,
  maxInvestors: 500, currentInvestors: 312,
  jurisdiction: 'France', tokenStandard: 'ERC-3643',
  status: 'active', companyName: 'SCI Paris Prestige',
  companyRegistration: 'FR-892345678',
  esgScore: 82, annualYieldPct: 5.8, occupancyRate: 96,
  createdAt: '2025-10-01', activatedAt: '2025-11-01',
};

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontWeight: '800' },
  headerSub: { fontWeight: '700', marginTop: 1 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14, position: 'relative' },
  tabActive: {},
  tabText: { fontWeight: '700' },
  tabIndicator: { position: 'absolute', bottom: 0, left: 16, right: 16, height: 2, borderRadius: 1 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontWeight: '800' },
  progressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressPct: { fontWeight: '800' },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  progressSub: { fontSize: 10 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metricBox: { width: '47%', borderRadius: 10, borderWidth: 1, padding: 10, gap: 4, alignItems: 'center' },
  metricVal: { fontWeight: '800' },
  metricLabel: { fontSize: 10, textAlign: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 9, borderBottomWidth: 1 },
  infoLabel: { flex: 1 },
  infoValue: {  fontWeight: '700' },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 52, borderRadius: 26 },
  ctaBtnText: { color: '#fff',  fontWeight: '800' },
  spvInfoBox: { borderRadius: 10, borderWidth: 1, padding: 12 },
  spvInfoText: { lineHeight: 19 },
  rightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 6 },
  rightText: { flex: 1, lineHeight: 19 },
  perfRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  perfValue: { fontWeight: '800' },
  simBox: { borderRadius: 10, borderWidth: 1, padding: 14, gap: 10 },
  simRow: { flexDirection: 'row', justifyContent: 'space-between' },
  simValue: {  fontWeight: '800' },
  disclaimer: { lineHeight: 15 },
});
