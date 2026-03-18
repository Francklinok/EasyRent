import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { getBookingService } from '@/services/api/bookingService';
import VisitRequestActions from '@/components/visit/VisitRequestActions';

interface Request {
  id: string;
  type: 'visit' | 'reservation';
  propertyId: string;
  propertyTitle: string;
  clientId: string;
  clientName: string;
  date: string;
  time?: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
}

interface ExtensionRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  clientId: string;
  clientName: string;
  paymentDeadline?: string;
  extensionRequestedDays?: number;
  extensionRequestedDate?: string;
  extensionStatus: string;
  createdAt: string;
}

const RequestsManagementScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [extensionRequests, setExtensionRequests] = useState<ExtensionRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'visit' | 'reservation'>('all');
  const [extensionLoading, setExtensionLoading] = useState<string | null>(null);
  const bookingService = getBookingService();

  const loadRequests = async () => {
    if (!user?.id) return;
    try {
      const [data, extensions] = await Promise.all([
        bookingService.getOwnerRequests(user.id),
        bookingService.getOwnerExtensionRequests(user.id),
      ]);

      const formattedRequests: Request[] = data.map((item: any) => ({
        id: item.id,
        type: item.isReservation ? 'reservation' : 'visit',
        propertyId: item.propertyId,
        propertyTitle: item.propertyTitle,
        clientId: item.clientId,
        clientName: item.clientName,
        date: item.date,
        time: item.time,
        status: (item.status || 'pending') as 'pending' | 'accepted' | 'rejected',
        message: item.message,
      }));

      setRequests(formattedRequests);
      setExtensionRequests(extensions);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExtensionResponse = async (activityId: string, accepted: boolean) => {
    try {
      setExtensionLoading(activityId);
      await bookingService.respondToExtensionRequest(activityId, accepted);
      setExtensionRequests(prev => prev.filter(e => e.id !== activityId));
      Alert.alert(
        accepted ? 'Prolongation accordée' : 'Prolongation refusée',
        accepted
          ? 'Le délai de paiement du client a été mis à jour.'
          : 'Le client sera notifié. Une grâce de 24h peut s\'appliquer si le délai était expiré.'
      );
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Une erreur est survenue.');
    } finally {
      setExtensionLoading(null);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user?.id]);

  const handleResponse = (requestId: string) => {
    setRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const filteredRequests = requests.filter(req =>
    (filter === 'all' || req.type === filter) && req.status === 'pending'
  );

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <ThemedView style={{ flex: 1}}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadRequests();
            }}
          />
        }
      >
        <ThemedView style={{ padding: 16, paddingTop:10 }}>
          <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
            Demandes
          </ThemedText>
          <ThemedText style={{ color: theme.onSurface + '70', marginBottom: 20 }}>
            {pendingCount} en attente
          </ThemedText>

          {/* Extension requests */}
          {extensionRequests.length > 0 && (
            <ThemedView style={{ marginBottom: 20 }}>
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <MaterialCommunityIcons name="clock-alert-outline" size={18} color={theme.warning} />
                <ThemedText style={{ fontWeight: '700', color: theme.warning }}>
                  Demandes de prolongation ({extensionRequests.length})
                </ThemedText>
              </ThemedView>
              {extensionRequests.map((ext) => {
                const requestedLabel = ext.extensionRequestedDays
                  ? `+${ext.extensionRequestedDays} jour(s)`
                  : ext.extensionRequestedDate
                    ? `Jusqu'au ${new Date(Number(ext.extensionRequestedDate)).toLocaleDateString('fr-FR')}`
                    : 'Prolongation demandée';
                const isLoading = extensionLoading === ext.id;
                return (
                  <View key={ext.id} style={{ marginBottom: 12 }}>
                    <ThemedView style={{
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: theme.warning + '40',
                      overflow: 'hidden',
                    }}>
                      <View style={{
                        flexDirection: 'row', alignItems: 'center',
                        backgroundColor: theme.warning + '12',
                        paddingHorizontal: 12, paddingVertical: 8, gap: 8,
                      }}>
                        <MaterialCommunityIcons name="timer-sand" size={15} color={theme.warning} />
                        <ThemedText style={{ fontWeight: '700', color: theme.warning, fontSize: 13, flex: 1 }}>
                          Prolongation — {ext.propertyTitle}
                        </ThemedText>
                      </View>
                      <View style={{ padding: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <MaterialCommunityIcons name="account-outline" size={14} color={theme.onSurface + '70'} />
                          <ThemedText style={{ fontSize: 13, color: theme.onSurface + '80' }}>{ext.clientName}</ThemedText>
                        </View>
                        <ThemedText style={{ fontSize: 13, color: theme.onSurface, marginBottom: 12 }}>
                          Demande: <ThemedText style={{ fontWeight: '600' }}>{requestedLabel}</ThemedText>
                        </ThemedText>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                          <TouchableOpacity
                            onPress={() => handleExtensionResponse(ext.id, false)}
                            disabled={isLoading}
                            style={{
                              flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1,
                              borderColor: theme.error + '60', alignItems: 'center',
                              opacity: isLoading ? 0.5 : 1,
                            }}
                          >
                            <ThemedText style={{ color: theme.error, fontWeight: '600', fontSize: 13 }}>
                              Refuser
                            </ThemedText>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleExtensionResponse(ext.id, true)}
                            disabled={isLoading}
                            style={{
                              flex: 1, paddingVertical: 10, borderRadius: 10,
                              backgroundColor: theme.success ? theme.success + '20' : '#22c55e20',
                              borderWidth: 1, borderColor: theme.success ? theme.success + '60' : '#22c55e60',
                              alignItems: 'center', opacity: isLoading ? 0.5 : 1,
                            }}
                          >
                            <ThemedText style={{ color: theme.success ?? '#22c55e', fontWeight: '600', fontSize: 13 }}>
                              {isLoading ? '...' : 'Accorder'}
                            </ThemedText>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </ThemedView>
                  </View>
                );
              })}
            </ThemedView>
          )}

          <ThemedView style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
            {(['all', 'visit', 'reservation'] as const).map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: filter === f ? theme.primary : theme.surfaceVariant
                }}
              >
                <ThemedText style={{ color: filter === f ? 'white' : theme.onSurface }}>
                  {f === 'all' ? 'Tout' : f === 'visit' ? 'Visites' : 'Reservations'}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>

          {filteredRequests.map((req) => {
            const isReservation = req.type === 'reservation';
            const typeColor = isReservation ? theme.success : theme.primary;
            const typeIcon = isReservation ? 'bookmark-outline' : 'eye-outline';
            const typeLabel = isReservation ? 'Réservation' : 'Visite';
            return (
              <View key={req.id} style={{ marginBottom: 16 }}>
                <ThemedView style={{
                  borderRadius: 14,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: typeColor + '30',
                }}>
                  {/* Colored header band */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: typeColor + '12',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    gap: 8,
                  }}>
                    <MaterialCommunityIcons name={typeIcon as any} size={16} color={typeColor} />
                    <ThemedText style={{ fontWeight: '700', color: typeColor, fontSize: 13, flex: 1 }}>
                      {typeLabel}
                    </ThemedText>
                    <ThemedText style={{ fontSize: 11, color: theme.onSurface + '55' }}>
                      {new Date(req.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      {req.time ? ` · ${req.time}` : ''}
                    </ThemedText>
                  </View>

                  {/* Body */}
                  <View style={{ padding: 12 }}>
                    <ThemedText style={{ fontWeight: '600', fontSize: 14, marginBottom: 2 }} numberOfLines={1}>
                      {req.propertyTitle}
                    </ThemedText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <MaterialCommunityIcons name="account-outline" size={14} color={theme.onSurface + '70'} />
                      <ThemedText style={{ fontSize: 13, color: theme.onSurface + '80' }}>
                        {req.clientName}
                      </ThemedText>
                    </View>

                    {req.message ? (
                      <View style={{
                        backgroundColor: theme.surfaceVariant,
                        borderRadius: 8,
                        padding: 8,
                        marginTop: 4,
                      }}>
                        <ThemedText style={{ fontSize: 12, fontStyle: 'italic', color: theme.onSurface + '70' }} numberOfLines={3}>
                          "{req.message}"
                        </ThemedText>
                      </View>
                    ) : null}
                  </View>

                  {/* Accept / Reject actions */}
                  <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
                    <VisitRequestActions
                      visitId={req.id}
                      propertyId={req.propertyId}
                      clientId={req.clientId}
                      ownerId={user?.id || ''}
                      currentUserId={user?.id || ''}
                      visitDate={req.date}
                      visitTime={req.time}
                      propertyTitle={req.propertyTitle}
                      isReservation={isReservation}
                      status={req.status}
                      onAccept={() => handleResponse(req.id)}
                      onReject={() => handleResponse(req.id)}
                    />
                  </View>
                </ThemedView>
              </View>
            );
          })}

          {filteredRequests.length === 0 && (
            <ThemedView style={{ alignItems: 'center', paddingVertical: 40 }}>
              <MaterialCommunityIcons name="inbox" size={48} color={theme.onSurface + '40'} />
              <ThemedText style={{ marginTop: 12, color: theme.onSurface + '60' }}>
                Aucune demande
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
};

export default RequestsManagementScreen;
