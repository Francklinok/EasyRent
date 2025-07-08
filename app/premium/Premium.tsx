import React, { useRef, useState } from 'react';
import { View, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/components/contexts/theme/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import PlanCard from '@/components/premium/PlanCard';
import { BackButton } from '@/components/ui/BackButton';

const PremiumPlans = [
  {
    id: 'basic',
    title: 'Basic',
    price: '4,99€ / mois',
    features: ['Navigation sans publicités', 'Contact direct avec les vendeurs'],
    icon: 'star-outline',
  },
  {
    id: 'pro',
    title: 'Pro',
    price: '9,99€ / mois',
    features: ['Toutes les fonctionnalités de Basic', 'Accès aux statistiques du marché', 'Planification de visites'],
    icon: 'star-half-full',
  },
  {
    id: 'ultimate',
    title: 'Ultimate',
    price: '14,99€ / mois',
    features: ['Toutes les fonctionnalités de Pro', 'Accès prioritaire aux annonces', 'Support client prioritaire'],
    icon: 'star',
  },
];

const CARD_WIDTH = Dimensions.get('window').width - 80;

const PremiumSubscriptionScreen = () => {
  const { theme } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSelectPlan = (planId: string) => setSelectedPlan(planId);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  return (
    <ThemedView variant="default" style={{ flex: 1, paddingBottom: 80 }}>
      <FlatList
        ListHeaderComponent={
          <>
            <ThemedView
              variant="primary"
              style={{
                padding: 24,
                borderBottomLeftRadius: 24,
                borderBottomRightRadius: 24,
                alignItems: 'center',
              }}
            >
              {/* Ligne avec BackButton à gauche et icône au centre */}
              <View style={{ width: '100%', height: 48, justifyContent: 'center' }}>
                {/* BackButton aligné à gauche */}
                <View style={{ position: 'absolute', left: 0 }}>
                  <BackButton />
                </View>

                {/* Icône centrée */}
                <View style={{ alignItems: 'center' }}>
                  <Icon name="crown" size={48} color={theme.surface} />
                </View>
              </View>

              <ThemedText type="title" intensity="strong" style={{ color: theme.surface, marginTop: 12 }}>
                Passez à Premium
              </ThemedText>
              <ThemedText style={{ color: theme.surface, opacity: 0.9, textAlign: 'center', marginTop: 8, maxWidth: 300 }}>
                Débloquez toutes les fonctionnalités et trouvez votre propriété idéale plus rapidement
              </ThemedText>
            </ThemedView>

            <ThemedView style={{ marginTop: 24 }}>
              <FlatList
                horizontal
                data={PremiumPlans}
                renderItem={({ item }) => (
                  <PlanCard
                    plan={item}
                    onSelect={handleSelectPlan}
                    isSelected={selectedPlan === item.id}
                    style={{ width: CARD_WIDTH, marginHorizontal: 8 }}
                  />
                )}
                keyExtractor={(item) => item.id}
                snapToAlignment="center"
                snapToInterval={CARD_WIDTH + 16}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              />
              <ThemedView style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
                {PremiumPlans.map((_, index) => (
                  <ThemedView
                    key={index}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 50,
                      marginHorizontal: 4,
                      backgroundColor: index === currentIndex ? theme.primary : theme.onSurface,
                    }}
                  />
                ))}
              </ThemedView>
            </ThemedView>
          </>
        }
        ListFooterComponent={
          <>
            <ThemedView variant="surface" bordered style={{ margin: 16, padding: 16, borderRadius: 12 }}>
              <ThemedText type="subtitle" intensity="strong" style={{ color: theme.onSurface, marginBottom: 16 }}>
                Pourquoi passer à Premium ?
              </ThemedText>
              {[
                { icon: 'lightning-bolt', text: 'Accès prioritaire aux nouvelles annonces' },
                { icon: 'eye-off', text: 'Navigation sans publicités' },
                { icon: 'chart-line', text: 'Accès aux statistiques du marché immobilier' },
                { icon: 'message-text', text: 'Contact direct avec les vendeurs' },
                { icon: 'calendar-check', text: 'Planification de visites simplifiée' },
              ].map((feature, index) => (
                <ThemedView key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <ThemedView
                    variant="primary"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Icon name={feature.icon} size={20} color={theme.surface} />
                  </ThemedView>
                  <ThemedText style={{ flex: 1, color: theme.onSurface }}>{feature.text}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>

            <ThemedView variant="surfaceVariant" style={{ margin: 16, padding: 16, borderRadius: 12 }}>
              <ThemedText type="subtitle" intensity="strong" style={{ color: theme.surfaceVariant, marginBottom: 8, textAlign: 'center' }}>
                Plus de 10 000 utilisateurs satisfaits
              </ThemedText>
              <ThemedText style={{ color: theme.surfaceVariant, textAlign: 'center', fontStyle: 'italic' }}>
                "Grâce à l'abonnement Premium, j'ai trouvé ma maison idéale en seulement 2 semaines !"
              </ThemedText>
            </ThemedView>

            <ThemedView style={{ padding: 16 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: selectedPlan ? theme.primary : theme.surfaceVariant,
                  paddingVertical: 16,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginBottom: 24,
                }}
                onPress={() => console.log('Subscribe to', selectedPlan)}
                disabled={!selectedPlan}
              >
                <ThemedText type="subtitle" intensity="strong" style={{ color: selectedPlan ? theme.surface : theme.surfaceVariant }}>
                  {selectedPlan ? 'S ABONNER MAINTENANT' : 'SÉLECTIONNEZ UN PLAN'}
                </ThemedText>
              </TouchableOpacity>
              <ThemedText style={{ textAlign: 'center', color: theme.surfaceVariant }}>
                Vous pouvez annuler votre abonnement à tout moment. En vous abonnant, vous acceptez nos conditions d'utilisation.
              </ThemedText>
            </ThemedView>
          </>
        }
        data={[]}
        renderItem={null}
      />
    </ThemedView>
  );
};

export default PremiumSubscriptionScreen;
