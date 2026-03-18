import React, { useMemo } from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useTheme } from '../../hooks/themehook';
import * as Haptics from 'expo-haptics';

interface PropertyStarRatingProps {
  rating: number | undefined;
  reviewCount?: number;
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  style?: ViewStyle;
  showReviewCount?: boolean;
}

const SIZES = {
  small: { star: 12, text: 10, ratingText: 11, padding: { h: 6, v: 3 } },
  medium: { star: 14, text: 12, ratingText: 13, padding: { h: 8, v: 4 } },
  large: { star: 18, text: 14, ratingText: 16, padding: { h: 12, v: 6 } },
};

/**
 * Composant PropertyStarRating - Affiche les étoiles comme le Play Store
 * Affiche: ⭐⭐⭐⭐⭐ 4.5 (128 avis)
 */
export const PropertyStarRating: React.FC<PropertyStarRatingProps> = ({
  rating = 0,
  reviewCount = 0,
  size = 'small',
  interactive = false,
  onRatingChange,
  style,
  showReviewCount = true,
}) => {
  const { theme } = useTheme();
  const sizeConfig = SIZES[size];

  // Normaliser le rating entre 0 et 5
  const normalizedRating = Math.min(Math.max(rating || 0, 0), 5);

  // Calculer le nombre d'étoiles pleines, demi-étoile et vides
  const fullStars = Math.floor(normalizedRating);
  const hasHalfStar = normalizedRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  // Générer les étoiles
  const starsArray = useMemo(() => {
    const stars = [];

    // Étoiles pleines
    for (let i = 0; i < fullStars; i++) {
      stars.push({ type: 'full', key: `full-${i}` });
    }

    // Demi-étoile
    if (hasHalfStar) {
      stars.push({ type: 'half', key: 'half' });
    }

    // Étoiles vides
    for (let i = 0; i < emptyStars; i++) {
      stars.push({ type: 'empty', key: `empty-${i}` });
    }

    return stars;
  }, [fullStars, hasHalfStar, emptyStars]);

  const handleStarPress = (index: number) => {
    if (!interactive || !onRatingChange) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRatingChange(index + 1);
  };

  const renderStar = (star: typeof starsArray[0], index: number) => {
    const getStarColor = () => {
      switch (star.type) {
        case 'full':
          return '#FCD34D'; // Jaune doré pour les pleines
        case 'half':
          return '#FCD34D'; // Jaune doré pour la demi
        case 'empty':
          return theme.outline + '40'; // Gris transparent pour les vides
        default:
          return theme.outline;
      }
    };

    return (
      <TouchableOpacity
        key={star.key}
        onPress={() => handleStarPress(index)}
        disabled={!interactive}
        activeOpacity={interactive ? 0.7 : 1}
      >
        {star.type === 'half' ? (
          <ThemedView
            style={{
              position: 'relative',
              width: sizeConfig.star,
              height: sizeConfig.star,
            }}
            backgroundColor="transparent"
          >
            {/* Étoile vide en arrière-plan */}
            <MaterialCommunityIcons
              name="star-outline"
              size={sizeConfig.star}
              color={theme.outline + '40'}
              style={{ position: 'absolute' }}
            />
            {/* Demi-étoile pleine au-dessus */}
            <ThemedView
              style={{
                position: 'absolute',
                overflow: 'hidden',
                width: sizeConfig.star / 2,
                height: sizeConfig.star,
              }}
              backgroundColor="transparent"
            >
              <MaterialCommunityIcons
                name="star"
                size={sizeConfig.star}
                color={'#FCD34D'}
              />
            </ThemedView>
          </ThemedView>
        ) : (
          <MaterialCommunityIcons
            name={star.type === 'full' ? 'star' : 'star-outline'}
            size={sizeConfig.star}
            color={getStarColor()}
          />
        )}
      </TouchableOpacity>
    );
  };

  // Si le rating est 0 ou non disponible ET pas interactive → "Pas d'avis"
  // Si interactive → afficher les 5 étoiles vides cliquables pour recueillir un avis
  if ((rating === 0 || rating === undefined) && !interactive) {
    return (
      <ThemedView
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: sizeConfig.padding.h,
            paddingVertical: sizeConfig.padding.v,
          },
          style,
        ]}
        backgroundColor="transparent"
      >
        <ThemedText
          style={{
            fontSize: sizeConfig.ratingText,
            color: theme.outline,
            fontWeight: '500',
          }}
        >
          Pas d'avis
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        style,
      ]}
      backgroundColor="transparent"
    >
      {/* Conteneur des étoiles */}
      <ThemedView
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 2,
        }}
        backgroundColor="transparent"
      >
        {starsArray.map((star, index) => renderStar(star, index))}
      </ThemedView>

      {/* Valeur numérique du rating */}
      <ThemedText
        style={{
          fontSize: sizeConfig.ratingText,
          fontWeight: '700',
          color: theme.text,
          marginLeft: 2,
        }}
      >
        {normalizedRating.toFixed(1)}
      </ThemedText>

      {/* Nombre d'avis (optionnel) */}
      {showReviewCount && reviewCount > 0 && (
        <ThemedText
          style={{
            fontSize: sizeConfig.text,
            color: theme.outline,
            marginLeft: 2,
          }}
        >
          ({reviewCount})
        </ThemedText>
      )}
    </ThemedView>
  );
};

export default PropertyStarRating;
