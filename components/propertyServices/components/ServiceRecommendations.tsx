import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceRecommendation } from '../types/ServiceTypes';
import { RecommendationEngine } from '../engine/RecommendationEngine';
import { propertyServiceAPI } from '../services/PropertyServiceAPI';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
interface Props {
  propertyType: any;
  location: string;
  servicesAlreadySubscribed: string[];
  onServiceSelect: (serviceId: string) => void;
}

export const ServiceRecommendations: React.FC<Props> = ({
  propertyType,
  location,
  servicesAlreadySubscribed,
  onServiceSelect
}) => {
  const [recommendations, setRecommendations] = useState<ServiceRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState<'immediate' | 'after_move'>('immediate');
  const { theme } = useTheme();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const backendRecs = await propertyServiceAPI.getRecommendations({
          propertyType: propertyType.type,
          location,
          preferences: []
        });
        setRecommendations(backendRecs as ServiceRecommendation[]);
      } catch (error) {
        // Fallback to local engine if API fails
        const engine = new RecommendationEngine();
        const recs = engine.recommend({
          propertyType,
          location,
          servicesAlreadySubscribed
        });
        setRecommendations(recs);
      }
    };
    
    fetchRecommendations();
  }, [propertyType, location, servicesAlreadySubscribed]);

  const filteredRecommendations = recommendations.filter(rec => rec.timing === activeTab);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.error;
      case 'medium': return theme.star;
      case 'low': return theme.success;
      default: return theme.border;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Services recommandés</ThemedText>
      
      <ThemedView style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'immediate' && styles.activeTab]}
          onPress={() => setActiveTab('immediate')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'immediate' && styles.activeTabText]}>
            Immédiat
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'after_move' && styles.activeTab]}
          onPress={() => setActiveTab('after_move')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'after_move' && styles.activeTabText]}>
            Après emménagement
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ScrollView style={styles.recommendationsList}>
        {filteredRecommendations.map((recommendation, index) => (
          <ThemedView key={index} style={styles.recommendationCard}>
            <ThemedView style={styles.cardHeader}>
              <ThemedView style={styles.serviceInfo}>
                <ThemedText style={styles.serviceTitle}>{recommendation.service.title}</ThemedText>
                <ThemedText style={styles.serviceDescription}>{recommendation.service.description}</ThemedText>
              </ThemedView>
              <ThemedView style={[styles.priorityBadge, { backgroundColor: getPriorityColor(recommendation.priority) }]}>
                <ThemedText style={styles.priorityText}>{recommendation.priority.toUpperCase()}</ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedText style={styles.reason}>{recommendation.reason}</ThemedText>
            
            <ThemedView style={styles.priceContainer}>
              <ThemedText style={styles.price}>
                {recommendation.service.basePrice}€
                <ThemedText style={styles.priceType}>
                  /{recommendation.service.priceType === 'hourly' ? 'h' : 
                    recommendation.service.priceType === 'monthly' ? 'mois' : ''}
                </ThemedText>
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.cardActions}>
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={() => onServiceSelect(recommendation.service.id)}
              >
                <ThemedText style={styles.selectButtonText}>Sélectionner</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        ))}
      </ScrollView>

      {filteredRecommendations.length === 0 && (
        <ThemedView style={styles.emptyState}>
          <Ionicons name="checkmark-circle" size={48} color={theme.success} />
          <ThemedText style={styles.emptyStateText}>
            Aucune recommandation pour cette période
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', padding: 20, color: '#333' },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
  tab: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: 'white', marginHorizontal: 2, borderRadius: 8 },
  activeTab: { backgroundColor: '#25D366' },
  tabText: { fontSize: 14, color: '#666' },
  activeTabText: { color: 'white', fontWeight: '600' },
  recommendationsList: { flex: 1, paddingHorizontal: 20 },
  recommendationCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  serviceInfo: { flex: 1 },
  serviceTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  serviceDescription: { fontSize: 14, color: '#666' },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  priorityText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  reason: { fontSize: 14, color: '#25D366', fontWeight: '500', marginBottom: 12 },
  priceContainer: { marginBottom: 16 },
  price: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  priceType: { fontSize: 14, color: '#666', fontWeight: 'normal' },
  cardActions: { alignItems: 'center' },
  selectButton: { backgroundColor: '#25D366', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, width: '100%' },
  selectButtonText: { color: 'white', fontWeight: '600', textAlign: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyStateText: { fontSize: 16, color: '#666', marginTop: 12, textAlign: 'center' }
});