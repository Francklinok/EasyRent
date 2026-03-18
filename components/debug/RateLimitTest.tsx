import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import { RateLimitIndicator } from '../ui/RateLimitIndicator';
import { authService } from '../services/authService';
import { useTheme } from '../../hooks/themehook';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Composant de test pour le système de rate limiting
 * Utilisé uniquement en développement pour tester le comportement
 */
export const RateLimitTest = () => {
  const { theme } = useTheme();
  const [status, setStatus] = useState({
    requestsInWindow: 0,
    maxRequests: 10,
    canMakeRequest: true
  });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const updateStatus = () => {
    const newStatus = authService.getRateLimitStatus('/login');
    setStatus(newStatus);
  };

  useEffect(() => {
    // Mettre à jour le statut toutes les secondes
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const simulateRequest = async () => {
    addLog('Tentative de requête...');
    try {
      // Simuler une requête de login
      await authService.login('test@example.com', 'password');
    } catch (error: any) {
      if (error.message?.includes('Trop de requêtes')) {
        addLog('❌ Rate limit atteint !');
      } else {
        addLog(`❌ Erreur: ${error.message}`);
      }
    } finally {
      updateStatus();
    }
  };

  const simulateMultipleRequests = async () => {
    addLog('Démarrage de 5 requêtes simultanées...');
    const promises = Array(5).fill(null).map(() => simulateRequest());
    await Promise.allSettled(promises);
    addLog('Toutes les requêtes terminées');
    updateStatus();
  };

  const handleReset = () => {
    authService.resetRateLimit('/login');
    addLog('✅ Rate limit réinitialisé');
    updateStatus();
  };

  const handleResetAll = () => {
    authService.resetRateLimit();
    setLogs([]);
    addLog('✅ Tous les rate limits réinitialisés');
    updateStatus();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <ThemedView style={{ padding: 16 }}>
        <ThemedText
          type="title"
          intensity="strong"
          style={{ color: theme.onSurface, marginBottom: 16 }}
        >
          Test Rate Limiting 🧪
        </ThemedText>

        {/* Status Indicator */}
        <RateLimitIndicator
          requestsInWindow={status.requestsInWindow}
          maxRequests={status.maxRequests}
        />

        {/* Status Details */}
        <ThemedView
          style={{
            backgroundColor: theme.surface,
            borderRadius: 12,
            padding: 16,
            marginVertical: 16,
            borderWidth: 1,
            borderColor: theme.outline + '30'
          }}
        >
          <ThemedText
            type="normal"
            intensity="strong"
            style={{ color: theme.onSurface, marginBottom: 12 }}
          >
            Statut actuel
          </ThemedText>

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText style={{ color: theme.onSurface + '80' }}>
                Requêtes dans la fenêtre
              </ThemedText>
              <ThemedText
                type="normal"
                intensity="strong"
                style={{ color: theme.primary }}
              >
                {status.requestsInWindow} / {status.maxRequests}
              </ThemedText>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText style={{ color: theme.onSurface + '80' }}>
                Peut faire requête
              </ThemedText>
              <MaterialCommunityIcons
                name={status.canMakeRequest ? 'check-circle' : 'close-circle'}
                size={20}
                color={status.canMakeRequest ? theme.success : theme.error}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText style={{ color: theme.onSurface + '80' }}>
                Utilisation
              </ThemedText>
              <ThemedText
                style={{
                  color:
                    (status.requestsInWindow / status.maxRequests) * 100 > 90
                      ? theme.error
                      : (status.requestsInWindow / status.maxRequests) * 100 > 70
                      ? theme.warning
                      : theme.success
                }}
              >
                {Math.round((status.requestsInWindow / status.maxRequests) * 100)}%
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Action Buttons */}
        <ThemedView style={{ gap: 12, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={simulateRequest}
            disabled={!status.canMakeRequest}
            style={{
              backgroundColor: status.canMakeRequest ? theme.primary : theme.outline + '40',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <MaterialCommunityIcons
              name="send"
              size={20}
              color={status.canMakeRequest ? 'white' : theme.onSurface + '50'}
            />
            <ThemedText
              type="normal"
              intensity="strong"
              style={{
                color: status.canMakeRequest ? 'white' : theme.onSurface + '50'
              }}
            >
              Faire 1 requête
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={simulateMultipleRequests}
            style={{
              backgroundColor: theme.warning,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <MaterialCommunityIcons name="lightning-bolt" size={20} color="white" />
            <ThemedText type="normal" intensity="strong" style={{ color: 'white' }}>
              Faire 5 requêtes simultanées
            </ThemedText>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={handleReset}
              style={{
                flex: 1,
                backgroundColor: theme.success,
                borderRadius: 12,
                padding: 16,
                alignItems: 'center'
              }}
            >
              <ThemedText type="normal" intensity="strong" style={{ color: 'white' }}>
                Reset /login
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleResetAll}
              style={{
                flex: 1,
                backgroundColor: theme.error,
                borderRadius: 12,
                padding: 16,
                alignItems: 'center'
              }}
            >
              <ThemedText type="normal" intensity="strong" style={{ color: 'white' }}>
                Reset tout
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Logs */}
        <ThemedView
          style={{
            backgroundColor: theme.surface,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.outline + '30'
          }}
        >
          <ThemedText
            type="normal"
            intensity="strong"
            style={{ color: theme.onSurface, marginBottom: 12 }}
          >
            Logs (10 derniers)
          </ThemedText>

          {logs.length === 0 ? (
            <ThemedText style={{ color: theme.onSurface + '60', fontStyle: 'italic' }}>
              Aucun log pour le moment
            </ThemedText>
          ) : (
            <View style={{ gap: 4 }}>
              {logs.map((log, index) => (
                <ThemedText
                  key={index}
                  style={{
                    color: theme.onSurface + '90',
                    fontSize: 12,
                    fontFamily: 'monospace'
                  }}
                >
                  {log}
                </ThemedText>
              ))}
            </View>
          )}
        </ThemedView>

        {/* Info */}
        <ThemedView
          style={{
            backgroundColor: theme.primary + '10',
            borderRadius: 12,
            padding: 16,
            marginTop: 16,
            borderWidth: 1,
            borderColor: theme.primary + '30'
          }}
        >
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
            <MaterialCommunityIcons name="information" size={20} color={theme.primary} />
            <ThemedText
              type="normal"
              intensity="strong"
              style={{ color: theme.primary }}
            >
              Informations
            </ThemedText>
          </View>
          <ThemedText style={{ color: theme.onSurface + '80', fontSize: 12, lineHeight: 18 }}>
            • Max 10 requêtes par minute{'\n'}
            • Fenêtre glissante de 60 secondes{'\n'}
            • Retry automatique avec backoff exponentiel{'\n'}
            • Les requêtes échouées ne comptent pas dans le quota
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
};
