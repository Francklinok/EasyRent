

export interface StarBreakdown {
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

export const calculateAverageRating = (breakdown: Partial<StarBreakdown>): number => {
  const data = {
    fiveStar: breakdown.fiveStar || 0,
    fourStar: breakdown.fourStar || 0,
    threeStar: breakdown.threeStar || 0,
    twoStar: breakdown.twoStar || 0,
    oneStar: breakdown.oneStar || 0,
  };

  const total =
    data.fiveStar * 5 +
    data.fourStar * 4 +
    data.threeStar * 3 +
    data.twoStar * 2 +
    data.oneStar * 1;

  const count =
    data.fiveStar + data.fourStar + data.threeStar + data.twoStar + data.oneStar;

  return count === 0 ? 0 : total / count;
};

export const getRatingDescription = (rating: number): string => {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 4) return 'Très bon';
  if (rating >= 3.5) return 'Bon';
  if (rating >= 3) return 'Acceptable';
  if (rating >= 2) return 'Moyen';
  if (rating >= 1) return 'Faible';
  return 'Pas d\'avis';
};


export const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return '#22c55e';
  if (rating >= 4) return '#3b82f6';
  if (rating >= 3.5) return '#10b981'; 
  if (rating >= 3) return '#f59e0b'; 
  if (rating >= 2) return '#f97316'; 
  return '#ef4444'; 
};


export const formatReviewCount = (count: number): string => {
  if (count === 0) return 'Pas d\'avis';
  if (count === 1) return '1 avis';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M avis`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K avis`;
  return `${count} avis`;
};


export const generateStarArray = (rating: number) => {
  const normalized = Math.min(Math.max(rating || 0, 0), 5);
  const fullStars = Math.floor(normalized);
  const hasHalfStar = normalized % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const stars: Array<'full' | 'half' | 'empty'> = [];

  for (let i = 0; i < fullStars; i++) stars.push('full');
  if (hasHalfStar) stars.push('half');
  for (let i = 0; i < emptyStars; i++) stars.push('empty');

  return stars;
};


export const calculatePercentage = (count: number, total: number): number => {
  if (total === 0) return 0;
  return (count / total) * 100;
};

export const isValidRating = (rating: any): boolean => {
  return typeof rating === 'number' && rating >= 0 && rating <= 5;
};


export const roundRating = (rating: number, decimals: number = 1): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(rating * factor) / factor;
};


export const createRatingSummary = (rating: number, reviewCount: number) => {
  return {
    rating: roundRating(rating, 1),
    reviewCount,
    description: getRatingDescription(rating),
    color: getRatingColor(rating),
    formattedCount: formatReviewCount(reviewCount),
  };
};
