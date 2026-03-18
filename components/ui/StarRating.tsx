import React, { useCallback, useMemo } from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useTheme } from '../../hooks/themehook';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showValue?: boolean;
  style?: ViewStyle;
}

const SIZES = {
  small: { star: 10, text: 11, padding: { h: 8, v: 4 } },
  medium: { star: 14, text: 13, padding: { h: 10, v: 6 } },
  large: { star: 20, text: 16, padding: { h: 14, v: 8 } },
};

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'small',
  interactive = false,
  onRatingChange,
  showValue = true,
  style,
}) => {
  const { theme } = useTheme();
  const sizeConfig = SIZES[size];

  const handleStarPress = useCallback((starIndex: number) => {
    if (!interactive || !onRatingChange) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Si on clique sur la même étoile, toggle entre plein et demi
    const newRating = starIndex + 1;
    onRatingChange(newRating);
  }, [interactive, onRatingChange]);

  const stars = useMemo(() => {
    const starElements = [];
    for (let i = 0; i < maxStars; i++) {
      const isFilled = i < Math.floor(rating);
      const isHalf = !isFilled && i < rating;

      starElements.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleStarPress(i)}
          disabled={!interactive}
          activeOpacity={interactive ? 0.7 : 1}
          style={{ marginHorizontal: 1}}
        >
          <ThemedView
          >
            <FontAwesome5
              name={isFilled ? 'star' : isHalf ? 'star-half-alt' : 'star'}
              size={sizeConfig.star}
              color={isFilled || isHalf ? theme.star : theme.star + '40'}
              solid={isFilled}
            />
          </ThemedView>
        </TouchableOpacity>
      );
    }
    return starElements;
  }, [rating, maxStars, interactive, handleStarPress, sizeConfig.star, theme.star]);

  if (!interactive) {
    return (
      <LinearGradient
        colors={[theme.star + '20', theme.star + '10']}
        style={[{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: sizeConfig.padding.h,
          paddingVertical: sizeConfig.padding.v,
          borderRadius: 8,
        }, style]}
      >
        <FontAwesome5 name="star" size={sizeConfig.star} color={theme.star} solid />
        {showValue && (
          <ThemedText style={{
            fontSize: sizeConfig.text,
            fontWeight: '700',
            color: theme.star,
            marginLeft: 3
          }}>
            {rating}
          </ThemedText>
        )}
      </LinearGradient>
    );
  }

  // Mode interactif
  return (
    <ThemedView style={[{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.star + '10',
      paddingHorizontal: sizeConfig.padding.h,
      paddingVertical: sizeConfig.padding.v,
      borderRadius: 12,
      borderWidth: 1,
    }, style]}>
      <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
        {stars}
      </ThemedView>
      {showValue && (
        <ThemedText type ="normaltitle" style={{
          color: theme.star,
          marginLeft: 8
        }}>
          {rating.toFixed(1)}
        </ThemedText>
      )}
    </ThemedView>
  );
};

export default React.memo(StarRating);
