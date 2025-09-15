import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CreateService } from '@/components/propertyServices/components/CreateService';
import { ServiceRecommendations } from '@/components/propertyServices/components/ServiceRecommendations';
import { propertyServiceAPI } from '@/components/propertyServices/services/PropertyServiceAPI';

const ServicesScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'create' | 'my_services'>('recommendations');

  const mockPropertyType = { type: 'house' as const, hasGarden: true, surface: 120 };
  const mockLocation = 'Paris 16ème';
  const mockSubscribedServices: string[] = [];

  const handleServiceSelect = async (serviceId: string) => {
    try {
      await propertyServiceAPI.subscribeToService({
        serviceId,
        startDate: new Date().toISOString()
      });
      console.log('Service souscrit:', serviceId);
    } catch (error) {
      console.error('Erreur souscription:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'recommendations':
        return (
          <ServiceRecommendations
            propertyType={mockPropertyType}
            location={mockLocation}
            servicesAlreadySubscribed={mockSubscribedServices}
            onServiceSelect={handleServiceSelect}
          />
        );
      case 'create':
        return <CreateService />;
      case 'my_services':
        return (
          <View style={styles.comingSoon}>
            <Ionicons name="construct" size={48} color="#666" />
            <Text style={styles.comingSoonText}>Mes services - Bientôt disponible</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Services Immobiliers</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recommendations' && styles.activeTab]}
          onPress={() => setActiveTab('recommendations')}
        >
          <Ionicons 
            name="bulb" 
            size={20} 
            color={activeTab === 'recommendations' ? 'white' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'recommendations' && styles.activeTabText]}>
            Recommandations
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'create' && styles.activeTab]}
          onPress={() => setActiveTab('create')}
        >
          <Ionicons 
            name="add-circle" 
            size={20} 
            color={activeTab === 'create' ? 'white' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>
            Créer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'my_services' && styles.activeTab]}
          onPress={() => setActiveTab('my_services')}
        >
          <Ionicons 
            name="list" 
            size={20} 
            color={activeTab === 'my_services' ? 'white' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'my_services' && styles.activeTabText]}>
            Mes Services
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  tabContainer: { flexDirection: 'row', backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, marginHorizontal: 4, borderRadius: 8, backgroundColor: '#f5f5f5' },
  activeTab: { backgroundColor: '#25D366' },
  tabText: { fontSize: 14, color: '#666', marginLeft: 8, fontWeight: '500' },
  activeTabText: { color: 'white', fontWeight: '600' },
  content: { flex: 1 },
  comingSoon: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  comingSoonText: { fontSize: 16, color: '#666', marginTop: 16, textAlign: 'center' }
});

export default ServicesScreen;