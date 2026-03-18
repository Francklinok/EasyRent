/**
 * SimulatePaymentScreen.tsx
 *
 * Page de test — exécute simulatePayment() sur une activité réelle.
 * Accès : naviguer vers /dev/SimulatePaymentScreen
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { getActivityService, Activity } from '@/services/api/activityService';
import { simulatePayment, formatXOF } from '@/utils/simulatePayment';

// ─── Types internes ────────────────────────────────────────────────────────────

type LogLevel = 'info' | 'success' | 'error' | 'warn';

interface LogEntry {
  id: number;
  level: LogLevel;
  message: string;
  ts: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LOG_COLORS: Record<LogLevel, string> = {
  info:    '#2196F3',
  success: '#4CAF50',
  error:   '#F44336',
  warn:    '#FF9800',
};

const LOG_ICONS: Record<LogLevel, string> = {
  info:    'information-circle-outline',
  success: 'checkmark-circle-outline',
  error:   'close-circle-outline',
  warn:    'warning-outline',
};

function now() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ─── Composant principal ───────────────────────────────────────────────────────

export default function SimulatePaymentScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const activityService = getActivityService();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [manualId, setManualId] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [contractUri, setContractUri] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logCounter = useRef(0);
  const scrollRef = useRef<ScrollView>(null);

  // ─── Log helper ─────────────────────────────────────────────────────────────

  const addLog = (level: LogLevel, message: string) => {
    const entry: LogEntry = { id: logCounter.current++, level, message, ts: now() };
    setLogs(prev => [...prev, entry]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  // ─── Charge les activités de l'utilisateur ────────────────────────────────

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        addLog('info', `Chargement des activités pour ${user.fullName || user.id}...`);
        const conn = await activityService.getUserActivities(user.id, { limit: 20 });
        const edges = conn?.edges?.map(e => e.node) ?? [];

        // Garde uniquement les réservations acceptées non payées + les déjà payées
        const relevant = edges.filter(a =>
          a.reservationStatus?.toLowerCase() === 'accepted' || (a as any).isPayment === true
        );
        setActivities(relevant);

        if (relevant.length === 0) {
          addLog('warn', 'Aucune activité éligible trouvée — affichage de toutes les activités');
          setActivities(edges); // fallback : affiche tout
        } else {
          addLog('success', `${relevant.length} activité(s) trouvée(s)`);
          // Pré-sélectionne la première non payée
          const pending = relevant.find(a => !(a as any).isPayment);
          if (pending) {
            setSelectedActivity(pending);
            addLog('info', `Pré-sélection : ${(pending as any).property?.title || pending.id}`);
          }
        }
      } catch (err: any) {
        addLog('error', `Erreur chargement : ${err?.message || String(err)}`);
      } finally {
        setLoadingActivities(false);
      }
    })();
  }, [user?.id]);

  // ─── Exécute la simulation ─────────────────────────────────────────────────

  const run = async () => {
    const activityId = selectedActivity?.id || manualId.trim();
    const rawAmount = selectedActivity?.property?.ownerCriteria?.depositAmount
      || selectedActivity?.property?.ownerCriteria?.monthlyRent
      || selectedActivity?.amount
      || Number(manualAmount) || 0;

    if (!activityId) {
      addLog('error', 'Aucun activityId sélectionné ou saisi');
      return;
    }

    setRunning(true);
    setDone(false);
    setContractUri(null);
    addLog('info', '─────────────────────────────────');
    addLog('info', `Démarrage simulation...`);
    addLog('info', `  activityId : ${activityId}`);
    addLog('info', `  montant    : ${formatXOF(rawAmount)}`);

    addLog('info', '[1/4] Délai réseau simulé (800 ms)...');

    const result = await simulatePayment({
      activityId,
      amount: rawAmount,
      delayMs: 800,
      onLog: (msg) => {
        const level: LogLevel = msg.startsWith('✅') || msg.startsWith('🎉') ? 'success'
          : msg.startsWith('⚠️') ? 'warn'
          : msg.startsWith('❌') ? 'error'
          : 'info';
        addLog(level, msg);
      },
    });

    if (!result.success) {
      addLog('error', `Échec : ${result.message}`);
    }

    addLog(result.success ? 'success' : 'error',
      `Terminé en ${result.durationMs} ms`);
    addLog('info', '─────────────────────────────────');

    setContractUri(result.contractUri);
    setDone(true);
    setRunning(false);

    // Met à jour l'activité sélectionnée comme payée localement
    if (result.success && selectedActivity) {
      setSelectedActivity(prev => prev ? { ...prev, isPayment: true } as any : prev);
    }
  };

  // ─── Render activité ───────────────────────────────────────────────────────

  const renderActivityCard = (a: Activity) => {
    const isPaid = (a as any).isPayment === true;
    const isSelected = selectedActivity?.id === a.id;
    const amount = a.amount || (a.property as any)?.ownerCriteria?.monthlyRent || 0;

    return (
      <TouchableOpacity
        key={a.id}
        onPress={() => { if (!isPaid) { setSelectedActivity(a); setDone(false); } }}
        disabled={isPaid}
        style={[
          styles.actCard,
          {
            borderColor: isSelected ? '#1B5E20' : isPaid ? '#A5D6A7' : theme.outline + '50',
            backgroundColor: isSelected ? '#E8F5E9' : isPaid ? '#F1F8E9' : theme.surface,
            opacity: isPaid ? 0.75 : 1,
          },
        ]}
      >
        <ThemedView style={styles.actCardRow}>
          <Ionicons
            name={isPaid ? 'checkmark-circle' : isSelected ? 'radio-button-on' : 'radio-button-off'}
            size={20}
            color={isPaid ? '#1B5E20' : isSelected ? '#1B5E20' : theme.outline}
          />
          <ThemedView style={{ flex: 1, marginLeft: 10 }}>
            <ThemedText style={{ fontWeight: '700', fontSize: 13, color: isSelected ? '#1B5E20' : theme.text }} numberOfLines={1}>
              {(a as any).property?.title || 'Propriété sans titre'}
            </ThemedText>
            <ThemedText style={{ fontSize: 11, color: theme.text + '70', marginTop: 2 }}>
              ID: {a.id}
            </ThemedText>
          </ThemedView>
          <ThemedView style={{ alignItems: 'flex-end' }}>
            <ThemedText style={{ fontWeight: '700', color: '#1B5E20', fontSize: 12 }}>
              {amount > 0 ? formatXOF(amount) : '—'}
            </ThemedText>
            <ThemedText style={{ fontSize: 10, color: isPaid ? '#1B5E20' : '#FF9800', marginTop: 2, fontWeight: '600' }}>
              {isPaid ? '✓ Payé' : 'En attente'}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  // ─── Render principal ──────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>

      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <ThemedText style={{ fontWeight: '800', fontSize: 16, flex: 1 }}>
          Simulation de paiement
        </ThemedText>
        <ThemedView style={styles.devBadge}>
          <ThemedText style={{ color: '#FF9800', fontSize: 10, fontWeight: '700' }}>DEV</ThemedText>
        </ThemedView>
      </ThemedView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* ── Section 1 : Activités ── */}
        <ThemedText style={styles.sectionTitle}>1. Sélectionner une activité</ThemedText>

        {loadingActivities ? (
          <ThemedView style={styles.centered}>
            <ActivityIndicator color="#1B5E20" />
            <ThemedText style={{ color: theme.text + '70', marginTop: 8, fontSize: 13 }}>
              Chargement depuis le backend...
            </ThemedText>
          </ThemedView>
        ) : activities.length > 0 ? (
          activities.map(renderActivityCard)
        ) : (
          <ThemedView style={[styles.emptyBox, { borderColor: theme.outline + '40' }]}>
            <Ionicons name="calendar-outline" size={32} color={theme.text + '40'} />
            <ThemedText style={{ color: theme.text + '60', marginTop: 8, fontSize: 13, textAlign: 'center' }}>
              Aucune réservation acceptée trouvée.{'\n'}Utilisez la saisie manuelle ci-dessous.
            </ThemedText>
          </ThemedView>
        )}

        {/* ── Section 2 : Saisie manuelle ── */}
        <ThemedText style={[styles.sectionTitle, { marginTop: 20 }]}>
          2. Ou saisir manuellement
        </ThemedText>

        <ThemedView style={[styles.inputBox, { borderColor: theme.outline + '40' }]}>
          <ThemedText style={styles.inputLabel}>Activity ID</ThemedText>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.outline + '40', backgroundColor: theme.surface }]}
            placeholder="ex: 683b4c2f..."
            placeholderTextColor={theme.text + '40'}
            value={manualId}
            onChangeText={v => { setManualId(v); setSelectedActivity(null); }}
            autoCapitalize="none"
          />

          <ThemedText style={[styles.inputLabel, { marginTop: 12 }]}>Montant (XOF)</ThemedText>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.outline + '40', backgroundColor: theme.surface }]}
            placeholder="ex: 150000"
            placeholderTextColor={theme.text + '40'}
            value={manualAmount}
            onChangeText={setManualAmount}
            keyboardType="numeric"
          />
        </ThemedView>

        {/* ── Résumé de la sélection ── */}
        {(selectedActivity || manualId.trim()) && (
          <ThemedView style={[styles.summaryBox, { borderColor: '#A5D6A7', backgroundColor: '#F1F8E9' }]}>
            <ThemedText style={{ fontWeight: '700', color: '#1B5E20', marginBottom: 4, fontSize: 13 }}>
              Prêt à simuler
            </ThemedText>
            <ThemedText style={{ color: '#388E3C', fontSize: 12 }}>
              ID : {selectedActivity?.id || manualId}
            </ThemedText>
            <ThemedText style={{ color: '#388E3C', fontSize: 12 }}>
              Montant : {formatXOF(
                selectedActivity?.amount ||
                (selectedActivity?.property as any)?.ownerCriteria?.monthlyRent ||
                Number(manualAmount) || 0
              )}
            </ThemedText>
          </ThemedView>
        )}

        {/* ── Bouton lancer ── */}
        <TouchableOpacity
          onPress={run}
          disabled={running || (!selectedActivity && !manualId.trim())}
          style={[styles.runBtn, {
            backgroundColor: running ? '#A5D6A7' :
              (!selectedActivity && !manualId.trim()) ? theme.outline + '60' : '#1B5E20',
          }]}
        >
          {running ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Ionicons name="play-circle-outline" size={22} color="white" />
          )}
          <ThemedText style={{ color: 'white', fontWeight: '700', marginLeft: 10, fontSize: 15 }}>
            {running ? 'Simulation en cours...' : 'Lancer la simulation'}
          </ThemedText>
        </TouchableOpacity>

        {/* ── Logs ── */}
        <ThemedText style={[styles.sectionTitle, { marginTop: 24 }]}>
          3. Logs d'exécution
        </ThemedText>

        <ThemedView style={[styles.logBox, { backgroundColor: '#0D1117', borderColor: '#30363D' }]}>
          <ScrollView
            ref={scrollRef}
            style={{ maxHeight: 280 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {logs.length === 0 ? (
              <ThemedText style={{ color: '#8B949E', fontSize: 12, fontFamily: 'monospace', padding: 12 }}>
                En attente du lancement...
              </ThemedText>
            ) : (
              logs.map(log => (
                <ThemedView key={log.id} style={styles.logLine}>
                  <ThemedText style={{ color: '#8B949E', fontSize: 10, fontFamily: 'monospace', marginRight: 6 }}>
                    {log.ts}
                  </ThemedText>
                  <Ionicons
                    name={LOG_ICONS[log.level] as any}
                    size={12}
                    color={LOG_COLORS[log.level]}
                    style={{ marginRight: 6 }}
                  />
                  <ThemedText style={{ color: LOG_COLORS[log.level], fontSize: 12, fontFamily: 'monospace', flex: 1 }}>
                    {log.message}
                  </ThemedText>
                </ThemedView>
              ))
            )}
          </ScrollView>

          {/* Bouton vider les logs */}
          {logs.length > 0 && (
            <TouchableOpacity
              onPress={() => setLogs([])}
              style={{ alignItems: 'flex-end', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#30363D' }}
            >
              <ThemedText style={{ color: '#8B949E', fontSize: 11 }}>Vider les logs</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>

        {/* ── Résultat : bouton voir contrat ── */}
        {done && contractUri && (
          <TouchableOpacity
            onPress={() => {
              const targetId = selectedActivity?.id || manualId.trim();
              router.push({
                pathname: '/contrat/ContratScreen',
                params: { activityId: targetId, paymentStatus: 'completed' },
              } as any);
            }}
            style={styles.contractBtn}
          >
            <Ionicons name="document-text-outline" size={22} color="white" />
            <ThemedText style={{ color: 'white', fontWeight: '700', marginLeft: 10, fontSize: 15 }}>
              Voir le contrat généré
            </ThemedText>
          </TouchableOpacity>
        )}

        {done && !contractUri && (
          <ThemedView style={[styles.errorBox, { borderColor: '#F44336' }]}>
            <Ionicons name="close-circle-outline" size={20} color="#F44336" />
            <ThemedText style={{ color: '#F44336', marginLeft: 8, fontSize: 13 }}>
              La simulation a échoué — voir les logs ci-dessus
            </ThemedText>
          </ThemedView>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  backBtn: {
    padding: 4,
  },
  devBadge: {
    backgroundColor: '#FF9800' + '20',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#FF9800' + '50',
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.6,
  },
  actCard: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  actCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  inputBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.6,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  summaryBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  runBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 16,
  },
  logBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  logLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  contractBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    backgroundColor: '#1B5E20',
    marginTop: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  centered: {
    alignItems: 'center',
    padding: 24,
  },
});
