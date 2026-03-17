import { useState, useCallback, useMemo } from 'react';
import {
  getRatingDescription,
  getRatingColor,
  formatReviewCount,
  generateStarArray,
  roundRating,
} from '@/components/utils/ratingUtils';
import {
  getRatingRange,
  isGoodRating,
  isExcellentRating,
  getRatingInfo,
} from '@/constants/ratingConfig';

interface UseRatingReturn {
  rating: number;
  reviewCount: number;
  ratingDescription: string;
  ratingColor: string;
  formattedReviewCount: string;
  starsArray: Array<'full' | 'half' | 'empty'>;
  ratingInfo: { label: string; emoji: string };
  ratingRange: ReturnType<typeof getRatingRange>;
  isGood: boolean;
  isExcellent: boolean;
  roundedRating: number;
  setRating: (rating: number) => void;
  setReviewCount: (count: number) => void;
  addReview: () => void;
  resetRating: () => void;
}


export const useRating = (
  initialRating: number = 0,
  initialReviewCount: number = 0
): UseRatingReturn => {
  const [rating, setRating] = useState(initialRating);
  const [reviewCount, setReviewCount] = useState(initialReviewCount);

  const memoizedData = useMemo(() => {
    const rounded = roundRating(rating, 1);
    const description = getRatingDescription(rating);
    const color = getRatingColor(rating);
    const formatted = formatReviewCount(reviewCount);
    const starsArr = generateStarArray(rating);
    const info = getRatingInfo(rating);
    const range = getRatingRange(rating);
    const good = isGoodRating(rating);
    const excellent = isExcellentRating(rating);

    return {
      ratingDescription: description,
      ratingColor: color,
      formattedReviewCount: formatted,
      starsArray: starsArr,
      ratingInfo: info,
      ratingRange: range,
      isGood: good,
      isExcellent: excellent,
      roundedRating: rounded,
    };
  }, [rating, reviewCount]);

  // Handlers
  const addReview = useCallback(() => {
    setReviewCount((prev) => prev + 1);
  }, []);

  const resetRating = useCallback(() => {
    setRating(0);
    setReviewCount(0);
  }, []);

  return {
    rating,
    reviewCount,
    ...memoizedData,
    setRating,
    setReviewCount,
    addReview,
    resetRating,
  };
};

export default useRating;
