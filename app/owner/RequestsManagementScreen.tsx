import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, TouchableOpacity, View } from 'react-native';
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

const RequestsManagementScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'visit' | 'reservation'>('all');
  const bookingService = getBookingService();

  const loadRequests = async () => {
    if (!user?.id) return;
    try {
      const data = await bookingService.getOwnerRequests(user.id);

      const formattedRequests: Request[] = data.map((item: any) => ({
        id: item.id || item._id,
        type: item.visitDate ? 'visit' : 'reservation',
        propertyId: item.propertyId?._id || item.propertyId || '',
        propertyTitle: item.propertyId?.title || 'Propriete',
        clientId: item.clientId?._id || item.clientId || '',
        clientName: item.clientId?.fullName || item.clientId?.email || 'Client',
        date: item.visitDate || item.createdAt,
        time: item.visitTime,
        status: item.isVisitAccepted === true ? 'accepted' :
                item.isVisitAccepted === false ? 'rejected' : 'pending',
        message: item.message
      }));

      setRequests(formattedRequests);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setRefreshing(false);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
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
        <ThemedView style={{ padding: 16 }}>
          <ThemedText type="title" style={{ fontSize: 24, marginBottom: 8 }}>
            Demandes
          </ThemedText>
          <ThemedText style={{ color: theme.onSurface + '70', marginBottom: 20 }}>
            {pendingCount} en attente
          </ThemedText>

          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
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
          </View>

          {filteredRequests.map((req) => (
            <View key={req.id} style={{ marginBottom: 12 }}>
              <ThemedView style={{
                backgroundColor: theme.surfaceVariant,
                borderRadius: 12,
                padding: 12,
                marginBottom: 4
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <ThemedText style={{ fontWeight: '600', flex: 1 }}>{req.propertyTitle}</ThemedText>
                  <View style={{
                    backgroundColor: req.type === 'visit' ? theme.primary + '20' : theme.success + '20',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 8
                  }}>
                    <ThemedText style={{ fontSize: 11 }}>
                      {req.type === 'visit' ? 'Visite' : 'Reservation'}
                    </ThemedText>
                  </View>
                </View>

                <ThemedText style={{ fontSize: 13, color: theme.onSurface + '80' }}>
                  {req.clientName}
                </ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60', marginTop: 2 }}>
                  {new Date(req.date).toLocaleDateString('fr-FR')} {req.time && `a ${req.time}`}
                </ThemedText>

                {req.message && (
                  <ThemedText style={{ fontSize: 12, marginTop: 8, fontStyle: 'italic', color: theme.onSurface + '70' }}>
                    "{req.message}"
                  </ThemedText>
                )}
              </ThemedView>

              <VisitRequestActions
                visitId={req.id}
                propertyId={req.propertyId}
                clientId={req.clientId}
                ownerId={user?.id || ''}
                currentUserId={user?.id || ''}
                visitDate={req.date}
                visitTime={req.time}
                propertyTitle={req.propertyTitle}
                isReservation={req.type === 'reservation'}
                status={req.status}
                onAccept={() => handleResponse(req.id)}
                onReject={() => handleResponse(req.id)}
              />
            </View>
          ))}

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
    </SafeAreaView>
  );
};

export default RequestsManagementScreen;
