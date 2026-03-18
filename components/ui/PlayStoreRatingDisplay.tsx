import React, { useMemo } from 'react';
import { ViewStyle, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useTheme } from '../../hooks/themehook';
import * as Haptics from 'expo-haptics';

interface PlayStoreRatingDisplayProps {
  rating: number | undefined;
  reviewCount?: number;
  style?: ViewStyle;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  ratingBreakdown?: {
    fiveStar?: number;
    fourStar?: number;
    threeStar?: number;
    twoStar?: number;
    oneStar?: number;
  };
}

/**
 * Composant PlayStoreRatingDisplay - Affiche les avis comme le Play Store
 * Affiche:
 * - Le rating principal en grand avec description
 * - La barre de progression par étoile
 * - Le nombre total d'avis
 */
export const PlayStoreRatingDisplay: React.FC<PlayStoreRatingDisplayProps> = ({
  rating = 0,
  reviewCount = 0,
  style,
  interactive = false,
  onRatingChange,
  ratingBreakdown,
}) => {
  const { theme } = useTheme();

  const normalizedRating = Math.min(Math.max(rating || 0, 0), 5);

  // Générer les étoiles principales
  const fullStars = Math.floor(normalizedRating);
  const hasHalfStar = normalizedRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  // Description du rating
  const getRatingDescription = (rating: number): string => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4) return 'Très bon';
    if (rating >= 3.5) return 'Bon';
    if (rating >= 3) return 'Acceptable';
    if (rating >= 2) return 'Moyen';
    if (rating >= 1) return 'Faible';
    return 'Pas d\'avis';
  };

  // Générer les étoiles
  const starsArray = useMemo(() => {
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }
    if (hasHalfStar) stars.push('half');
    for (let i = 0; i < emptyStars; i++) {
      stars.push('empty');
    }
    return stars;
  }, [fullStars, hasHalfStar, emptyStars]);

  const handleStarPress = (index: number) => {
    if (!interactive || !onRatingChange) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRatingChange(index + 1);
  };

  // Calculer les pourcentages de la barre
  const calculateBarPercentage = (count: number): number => {
    if (!reviewCount || reviewCount === 0) return 0;
    return (count / reviewCount) * 100;
  };

  // Si pas d'avis
  if (!rating || rating === 0) {
    return (
      <ThemedView style={[{ padding: 16 }, style]} backgroundColor="transparent">
        <ThemedView
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 32,
          }}
          backgroundColor="transparent"
        >
          <MaterialCommunityIcons
            name="star-outline"
            size={48}
            color={theme.outline + '40'}
          />
          <ThemedText
            style={{
              fontSize: 16,
              fontWeight: '600',
              marginTop: 12,
              color: theme.outline,
            }}
          >
            Pas d'avis pour le moment
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[{ padding: 16 }, style]} backgroundColor="transparent">
      {/* Section principale du rating */}
      <ThemedView
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.outline + '20',
        }}
        backgroundColor="transparent"
      >
        {/* Côté gauche: Grand rating et description */}
        <ThemedView style={{ flex: 1 }} backgroundColor="transparent">
          {/* Rating principal */}
          <ThemedView
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            backgroundColor="transparent"
          >
            <ThemedText
              style={{
                fontSize: 42,
                fontWeight: '800',
                color: theme.text,
              }}
            >
              {normalizedRating.toFixed(1)}
            </ThemedText>
            <ThemedView
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                backgroundColor: theme.primary + '20',
                borderRadius: 8,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: theme.primary,
                }}
              >
                {getRatingDescription(normalizedRating)}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Étoiles et nombre d'avis */}
          <ThemedView
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginTop: 8,
            }}
            backgroundColor="transparent"
          >
            <ThemedView
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 2,
              }}
              backgroundColor="transparent"
            >
              {starsArray.map((star, index) => (
                <TouchableOpacity
                  key={`star-${index}`}
                  onPress={() => handleStarPress(index)}
                  disabled={!interactive}
                >
                  {star === 'half' ? (
                    <ThemedView
                      style={{
                        position: 'relative',
                        width: 16,
                        height: 16,
                      }}
                      backgroundColor="transparent"
                    >
                      <MaterialCommunityIcons
                        name="star-outline"
                        size={16}
                        color={theme.outline + '40'}
                        style={{ position: 'absolute' }}
                      />
                      <ThemedView
                        style={{
                          position: 'absolute',
                          overflow: 'hidden',
                          width: 8,
                          height: 16,
                        }}
                        backgroundColor="transparent"
                      >
                        <MaterialCommunityIcons
                          name="star"
                          size={16}
                          color="#FCD34D"
                        />
                      </ThemedView>
                    </ThemedView>
                  ) : (
                    <MaterialCommunityIcons
                      name={star === 'full' ? 'star' : 'star-outline'}
                      size={16}
                      color={
                        star === 'full' ? '#FCD34D' : theme.outline + '40'
                      }
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ThemedView>

            <ThemedText
              style={{
                fontSize: 13,
                color: theme.outline,
              }}
            >
              {reviewCount} avis
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Barre de répartition des avis (optionnel) */}
      {ratingBreakdown && (
        <ThemedView style={{ gap: 10 }} backgroundColor="transparent">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count =
              stars === 5
                ? ratingBreakdown.fiveStar || 0
                : stars === 4
                ? ratingBreakdown.fourStar || 0
                : stars === 3
                ? ratingBreakdown.threeStar || 0
                : stars === 2
                ? ratingBreakdown.twoStar || 0
                : ratingBreakdown.oneStar || 0;

            const percentage = calculateBarPercentage(count);

            return (
              <ThemedView
                key={`rating-${stars}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
                backgroundColor="transparent"
              >
                {/* Label étoile */}
                <ThemedView
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    width: 60,
                  }}
                  backgroundColor="transparent"
                >
                  <ThemedText
                    style={{
                      fontSize: 12,
                      color: theme.outline,
                      fontWeight: '600',
                    }}
                  >
                    {stars}
                  </ThemedText>
                  <MaterialCommunityIcons
                    name="star"
                    size={12}
                    color="#FCD34D"
                  />
                </ThemedView>

                {/* Barre de progression */}
                <ThemedView
                  style={{
                    flex: 1,
                    height: 6,
                    backgroundColor: theme.outline + '20',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <LinearGradient
                    colors={[theme.primary, theme.primary + 'DD']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      height: '100%',
                      width: `${percentage}%`,
                    }}
                  />
                </ThemedView>

                {/* Nombre d'avis */}
                <ThemedText
                  style={{
                    fontSize: 12,
                    color: theme.outline,
                    width: 35,
                    textAlign: 'right',
                  }}
                >
                  {count}
                </ThemedText>
              </ThemedView>
            );
          })}
        </ThemedView>
      )}
    </ThemedView>
  );
};

export default PlayStoreRatingDisplay;
