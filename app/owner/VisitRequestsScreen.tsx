import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { BackButton } from '@/components/ui/BackButton';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { getBookingService } from '@/services/api/bookingService';
import VisitRequestActions from '@/components/visit/VisitRequestActions';

interface VisitRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  clientName: string;
  clientId: string;
  visitDate: string;
  visitTime: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
}

const VisitRequestsScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const bookingService = getBookingService();

  const loadVisitRequests = async () => {
    if (!user?.id) return;

    try {
      const requests = await bookingService.getOwnerRequests(user.id);

      const formattedRequests: VisitRequest[] = requests
        .filter((req: any) => {
          const isPending = req.isVisiteAccepted === null;
          const hasVisitDate = req.visitDate && req.visitDate !== '';
          return isPending && hasVisitDate;
        })
        .map((req: any) => ({
          id: req.id || req._id,
          propertyId: req.propertyId,
          propertyTitle: req.property?.title || 'Propriete',
          clientName: req.client?.name || 'Client',
          clientId: req.clientId,
          visitDate: req.visitDate,
          visitTime: req.visitTime || '14:00',
          message: req.message,
          status: 'pending'
        }));

      setVisitRequests(formattedRequests);
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
      Alert.alert('Erreur', 'Impossible de charger les demandes');
    }
  };

  useEffect(() => {
    loadVisitRequests();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVisitRequests();
    setRefreshing(false);
  };

  const handleResponse = (visitId: string, accepted: boolean) => {
    setVisitRequests(prev => prev.filter(req => req.id !== visitId));
  };

  const pendingRequests = visitRequests.filter(req => req.status === 'pending');

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <BackButton />
          <ThemedView style={{ flex: 1, marginLeft: 12 }}>
            <ThemedText type="title" intensity="strong" style={{ fontSize: 24 }}>
              Demandes de visite
            </ThemedText>
            <ThemedText style={{ fontSize: 14, color: theme.onSurface + '70', marginTop: 4 }}>
              {pendingRequests.length} en attente
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {pendingRequests.map(request => (
          <ThemedView key={request.id} style={{ marginBottom: 12 }}>
            {request.message && (
              <ThemedView style={{
                backgroundColor: theme.surfaceVariant,
                borderRadius: 12,
                padding: 12,
                marginBottom: 8
              }}>
                <ThemedText style={{ fontSize: 13, color: theme.onSurface + '80' }}>
                  {request.clientName}
                </ThemedText>
                <ThemedText style={{ fontSize: 14, marginTop: 4 }}>
                  {request.message}
                </ThemedText>
              </ThemedView>
            )}
            <VisitRequestActions
              visitId={request.id}
              propertyId={request.propertyId}
              clientId={request.clientId}
              ownerId={user?.id || ''}
              currentUserId={user?.id || ''}
              visitDate={request.visitDate}
              visitTime={request.visitTime}
              propertyTitle={request.propertyTitle}
              status={request.status}
              onAccept={() => handleResponse(request.id, true)}
              onReject={() => handleResponse(request.id, false)}
            />
          </ThemedView>
        ))}

        {visitRequests.length === 0 && (
          <ThemedView style={{ alignItems: 'center', paddingVertical: 60 }}>
            <ThemedText style={{ fontSize: 16, color: theme.onSurface + '60' }}>
              Aucune demande de visite
            </ThemedText>
          </ThemedView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default VisitRequestsScreen;
