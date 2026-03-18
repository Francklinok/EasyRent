/**
 * Exemple d'intégration complète des composants de rating
 * Ce fichier montre comment utiliser les différents composants dans votre app
 */

import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import PropertyStarRating from '@/components/ui/PropertyStarRating';
import PlayStoreRatingDisplay from '@/components/ui/PlayStoreRatingDisplay';
import CompactRatingDisplay from '@/components/ui/CompactRatingDisplay';

/**
 * Exemple 1: Affichage dans une liste de propriétés
 */
export const PropertyListExample = () => {
  return (
    <ThemedView style={{ padding: 16 }} backgroundColor="transparent">
      <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
        Liste de Propriétés
      </ThemedText>

      {/* Chaque item */}
      <ThemedView style={{ marginBottom: 12, padding: 12, borderRadius: 8 }}>
        <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <ThemedText style={{ fontWeight: '600' }}>Appartement 3P</ThemedText>
          <PropertyStarRating rating={4.5} size="small" showReviewCount={false} />
        </ThemedView>
        <ThemedText style={{ color: '#999', marginTop: 4 }}>
          75 m² • Marseille
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
};

/**
 * Exemple 2: Affichage dans une grille compacte
 */
export const PropertyGridExample = () => {
  return (
    <ThemedView style={{ padding: 16 }} backgroundColor="transparent">
      <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
        Grille de Propriétés
      </ThemedText>

      <ThemedView style={{ flexDirection: 'row', gap: 12 }}>
        {/* Card 1 */}
        <ThemedView style={{ flex: 1, padding: 8, borderRadius: 8 }}>
          <ThemedText style={{ marginBottom: 8 }}>Villa Luxe</ThemedText>
          <CompactRatingDisplay rating={4.8} size="small" />
        </ThemedView>

        {/* Card 2 */}
        <ThemedView style={{ flex: 1, padding: 8, borderRadius: 8 }}>
          <ThemedText style={{ marginBottom: 8 }}>Studio</ThemedText>
          <CompactRatingDisplay rating={3.5} size="small" />
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};

/**
 * Exemple 3: Page de détails propriété (style Play Store)
 */
export const PropertyDetailsExample = () => {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        Magnifique Maison
      </ThemedText>

      <PlayStoreRatingDisplay
        rating={4.5}
        reviewCount={128}
        ratingBreakdown={{
          fiveStar: 100,
          fourStar: 20,
          threeStar: 5,
          twoStar: 2,
          oneStar: 1,
        }}
      />

      <ThemedView style={{ marginTop: 24 }}>
        <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
          Description
        </ThemedText>
        <ThemedText style={{ lineHeight: 20 }}>
          Une belle maison avec jardin, proche de tous les commerces...
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
};

/**
 * Exemple 4: Affichage avec mode interactif (notation)
 */
export const RatingInteractiveExample = () => {
  const [userRating, setUserRating] = useState(0);

  return (
    <ThemedView style={{ padding: 16 }} backgroundColor="transparent">
      <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Noter cette propriété
      </ThemedText>

      <PropertyStarRating
        rating={userRating}
        size="large"
        interactive={true}
        onRatingChange={(newRating) => {
          setUserRating(newRating);
          console.log(`Propriété notée: ${newRating}/5`);
        }}
        showReviewCount={false}
      />

      {userRating > 0 && (
        <ThemedText style={{ marginTop: 12, fontSize: 14, color: '#888' }}>
          Vous avez noté: {userRating}/5 étoiles
        </ThemedText>
      )}
    </ThemedView>
  );
};

/**
 * Exemple 5: Affichage sans avis
 */
export const NoRatingExample = () => {
  return (
    <ThemedView style={{ padding: 16 }} backgroundColor="transparent">
      <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
        Nouvelle Propriété (Sans avis)
      </ThemedText>

      <PropertyStarRating rating={0} size="medium" />

      <ThemedText style={{ marginTop: 12, color: '#999' }}>
        Soyez le premier à noter cette propriété
      </ThemedText>
    </ThemedView>
  );
};

/**
 * Exemple 6: Intégration dans RenderItem (comme dans votre code)
 */
export const RenderItemIntegrationExample = ({ item }: { item: any }) => {
  return (
    <ThemedView style={{ padding: 12, borderRadius: 12 }}>
      {/* Image serait ici */}

      <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <ThemedText style={{ fontWeight: 'bold', flex: 1 }} numberOfLines={1}>
          {item.title}
        </ThemedText>
        <PropertyStarRating
          rating={item.stars}
          size="small"
          showReviewCount={false}
        />
      </ThemedView>

      <ThemedText style={{ color: '#999', marginTop: 4 }}>
        {item.location}
      </ThemedText>
    </ThemedView>
  );
};

export default {
  PropertyListExample,
  PropertyGridExample,
  PropertyDetailsExample,
  RatingInteractiveExample,
  NoRatingExample,
  RenderItemIntegrationExample,
};
