import React, { useMemo } from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useTheme } from '../../hooks/themehook';
import * as Haptics from 'expo-haptics';
import { getRatingColor, getRatingDescription, generateStarArray } from '@/components/utils/ratingUtils';

interface CompactRatingDisplayProps {
  rating: number | undefined;
  reviewCount?: number;
  size?: 'tiny' | 'small' | 'medium';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  style?: ViewStyle;
  hideText?: boolean;
}

const SIZES = {
  tiny: { star: 10, text: 9, gap: 2 },
  small: { star: 12, text: 10, gap: 2 },
  medium: { star: 14, text: 11, gap: 3 },
};

/**
 * CompactRatingDisplay - Affichage compact des avis
 * Idéal pour les listes et grilles
 * Format: ⭐⭐⭐⭐⭐ 4.5
 */
export const CompactRatingDisplay: React.FC<CompactRatingDisplayProps> = ({
  rating = 0,
  reviewCount,
  size = 'small',
  interactive = false,
  onRatingChange,
  style,
  hideText = false,
}) => {
  const { theme } = useTheme();
  const sizeConfig = SIZES[size];
  const normalizedRating = Math.min(Math.max(rating || 0, 0), 5);

  const starsArray = useMemo(() => generateStarArray(normalizedRating), [normalizedRating]);

  const handleStarPress = (index: number) => {
    if (!interactive || !onRatingChange) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRatingChange(index + 1);
  };

  const renderStar = (star: typeof starsArray[0], index: number) => {
    return (
      <TouchableOpacity
        key={`star-${index}`}
        onPress={() => handleStarPress(index)}
        disabled={!interactive}
        activeOpacity={interactive ? 0.7 : 1}
      >
        {star === 'half' ? (
          <ThemedView
            style={{
              position: 'relative',
              width: sizeConfig.star,
              height: sizeConfig.star,
            }}
            backgroundColor="transparent"
          >
            <MaterialCommunityIcons
              name="star-outline"
              size={sizeConfig.star}
              color={theme.outline + '40'}
              style={{ position: 'absolute' }}
            />
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
                color="#FCD34D"
              />
            </ThemedView>
          </ThemedView>
        ) : (
          <MaterialCommunityIcons
            name={star === 'full' ? 'star' : 'star-outline'}
            size={sizeConfig.star}
            color={star === 'full' ? '#FCD34D' : theme.outline + '40'}
          />
        )}
      </TouchableOpacity>
    );
  };

  if (!rating || rating === 0) {
    return (
      <ThemedView
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: sizeConfig.gap,
          },
          style,
        ]}
        backgroundColor="transparent"
      >
        <ThemedText
          style={{
            fontSize: sizeConfig.text,
            color: theme.outline,
          }}
        >
          N/A
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
          gap: sizeConfig.gap,
        },
        style,
      ]}
      backgroundColor="transparent"
    >
      {/* Étoiles */}
      <ThemedView
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1,
        }}
        backgroundColor="transparent"
      >
        {starsArray.map((star, index) => renderStar(star, index))}
      </ThemedView>

      {/* Texte du rating */}
      {!hideText && (
        <ThemedText
          style={{
            fontSize: sizeConfig.text,
            fontWeight: '700',
            color: theme.text,
          }}
        >
          {normalizedRating.toFixed(1)}
        </ThemedText>
      )}

      {/* Optionnel: nombre d'avis */}
      {reviewCount && reviewCount > 0 && (
        <ThemedText
          style={{
            fontSize: sizeConfig.text - 1,
            color: theme.outline,
          }}
        >
          ({reviewCount})
        </ThemedText>
      )}
    </ThemedView>
  );
};

export default CompactRatingDisplay;
