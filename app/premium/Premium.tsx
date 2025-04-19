import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '@/components/contexts/theme/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PlanCard from '@/components/premium/PlanCard';
// Composant pour la souscription premium


const PremiumPlans = [
  {
    id: 'basic',
    title: 'Basic',
    price: '4,99€ / mois',
    features: [
      'Navigation sans publicités',
      'Contact direct avec les vendeurs',
    ],
    icon: 'star-outline',
  },
  {
    id: 'pro',
    title: 'Pro',
    price: '9,99€ / mois',
    features: [
      'Toutes les fonctionnalités de Basic',
      'Accès aux statistiques du marché',
      'Planification de visites',
    ],
    icon: 'star-half-full',
  },
  {
    id: 'ultimate',
    title: 'Ultimate',
    price: '14,99€ / mois',
    features: [
      'Toutes les fonctionnalités de Pro',
      'Accès prioritaire aux annonces',
      'Support client prioritaire',
    ],
    icon: 'star',
  },
];


 const PremiumSubscriptionScreen = () => {
    const { theme } = useTheme();
    const [selectedPlan, setSelectedPlan] = useState(null);
  
    const handleSelectPlan = (planId) => {
      setSelectedPlan(planId);
    };
  
    const handleSubscribe = () => {
      // Logic for subscribing to the selected plan
      console.log(`Subscribing to plan: ${selectedPlan}`);
    };
  
    return (
      <ThemedView 
        variant="default" 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Header */}
          <ThemedView
            variant="primary"
            style={{
              padding: 24,
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
              alignItems: 'center'
            }}
          >
            <Icon name="crown" size={48} color={theme.onPrimary} />
            <Text style={{ 
              fontSize: 28, 
              fontWeight: 'bold', 
              color: theme.onPrimary,
              marginTop: 12 
            }}>
              Passez à Premium
            </Text>
            <Text style={{ 
              fontSize: 16, 
              color: theme.onPrimary,
              opacity: 0.9,
              textAlign: 'center',
              marginTop: 8,
              maxWidth: 300
            }}>
              Débloquez toutes les fonctionnalités et trouvez votre propriété idéale plus rapidement
            </Text>
          </ThemedView>
  
          {/* Plans Carousel */}
          <View style={{ marginTop: 24 }}>
            <FlatList
              horizontal
              data={PremiumPlans}
              renderItem={({ item }) => (
                <PlanCard 
                  plan={item} 
                  onSelect={handleSelectPlan}
                  isSelected={selectedPlan === item.id}
                />
              )}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              snapToAlignment="center"
              decelerationRate="fast"
              snapToInterval={Dimensions.get('window').width - 48}
              contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 8 }}
            />
          </View>
  
          {/* Features section */}
          <ThemedView
            variant="surface"
            bordered
            style={{
              margin: 16,
              padding: 16,
              borderRadius: 12
            }}
          >
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: theme.onSurface,
              marginBottom: 16
            }}>
              Pourquoi passer à Premium ?
            </Text>
  
            {[
              { icon: 'lightning-bolt', text: 'Accès prioritaire aux nouvelles annonces' },
              { icon: 'eye-off', text: 'Navigation sans publicités' },
              { icon: 'chart-line', text: 'Accès aux statistiques du marché immobilier' },
              { icon: 'message-text', text: 'Contact direct avec les vendeurs' },
              { icon: 'calendar-check', text: 'Planification de visites simplifiée' }
            ].map((feature, index) => (
              <View key={index} style={{ 
                flexDirection: 'row', 
                alignItems: 'center',
                marginBottom: 12
              }}>
                <ThemedView
                  variant="primary"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12
                  }}
                >
                  <Icon name={feature.icon} size={20} color={theme.onPrimary} />
                </ThemedView>
                <Text style={{ flex: 1, color: theme.onSurface }}>{feature.text}</Text>
              </View>
            ))}
          </ThemedView>
  
          {/* Testimonials carousel placeholder */}
          <ThemedView
            variant="surfaceVariant"
            style={{
              margin: 16,
              padding: 16,
              borderRadius: 12
            }}
          >
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: theme.onSurfaceVariant,
              marginBottom: 8,
              textAlign: 'center'
            }}>
              Plus de 10 000 utilisateurs satisfaits
            </Text>
            <Text style={{ 
              color: theme.onSurfaceVariant,
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              "Grâce à l'abonnement Premium, j'ai trouvé ma maison idéale en seulement 2 semaines !"
            </Text>
          </ThemedView>
  
          {/* Subscribe button */}
          <View style={{ padding: 16 }}>
            <TouchableOpacity
              style={{
                backgroundColor: selectedPlan ? theme.primary : theme.surfaceVariant,
                paddingVertical: 16,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 16
              }}
              onPress={handleSubscribe}
              disabled={!selectedPlan}
            >
              <Text style={{ 
                color: selectedPlan ? theme.onPrimary : theme.onSurfaceVariant, 
                fontWeight: 'bold',
                fontSize: 16
              }}>
                {selectedPlan ? 'S ABONNER MAINTENANT' : 'SÉLECTIONNEZ UN PLAN'}
              </Text>
            </TouchableOpacity>
            
            <Text style={{ 
              textAlign: 'center', 
              color: theme.onSurfaceVariant,
              fontSize: 12
            }}>
              Vous pouvez annuler votre abonnement à tout moment.
              En vous abonnant, vous acceptez nos conditions d'utilisation.
            </Text>
          </View>
        </ScrollView>
      </ThemedView>
    );
  };

  export default PremiumSubscriptionScreen