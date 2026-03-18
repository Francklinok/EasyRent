/**
 * Constantes et configurations pour le système de ratings
 */

export const RATING_CONFIG = {
  // Couleurs des étoiles
  STAR_COLOR_FULL: '#FCD34D', // Or/jaune
  STAR_COLOR_EMPTY: '#9CA3AF', // Gris

  // Descriptions de ratings
  RATING_DESCRIPTIONS: {
    5: { label: 'Excellent', emoji: '😍' },
    4.5: { label: 'Très bon', emoji: '😊' },
    4: { label: 'Très bon', emoji: '😊' },
    3.5: { label: 'Bon', emoji: '🙂' },
    3: { label: 'Bon', emoji: '🙂' },
    2.5: { label: 'Moyen', emoji: '😐' },
    2: { label: 'Moyen', emoji: '😐' },
    1.5: { label: 'Faible', emoji: '😞' },
    1: { label: 'Faible', emoji: '😞' },
    0: { label: 'Pas d\'avis', emoji: '❓' },
  } as Record<number, { label: string; emoji: string }>,

  // Plages de ratings
  RATING_RANGES: {
    EXCELLENT: { min: 4.5, max: 5, color: '#22c55e' }, // Vert
    VERY_GOOD: { min: 4, max: 4.5, color: '#3b82f6' }, // Bleu
    GOOD: { min: 3.5, max: 4, color: '#10b981' }, // Vert tendre
    ACCEPTABLE: { min: 3, max: 3.5, color: '#f59e0b' }, // Amber
    AVERAGE: { min: 2, max: 3, color: '#f97316' }, // Orange
    POOR: { min: 0, max: 2, color: '#ef4444' }, // Rouge
  },

  // Messages personnalisés
  MESSAGES: {
    NO_REVIEWS: 'Aucun avis pour le moment',
    BE_FIRST: 'Soyez le premier à noter',
    RATING_UPDATED: 'Votre note a été enregistrée',
    LOADING_REVIEWS: 'Chargement des avis...',
    ERROR_LOADING: 'Erreur lors du chargement des avis',
  },

  // Formats de nombre
  FORMAT: {
    MAX_REVIEW_COUNT_TO_SHOW: 1000000, // Au-delà, afficher en millions
    DECIMAL_PLACES: 1,
  },

  // Animations
  ANIMATIONS: {
    DURATION_SHORT: 200,
    DURATION_MEDIUM: 300,
    DURATION_LONG: 500,
  },
} as const;

/**
 * Obtient la description et l'emoji pour un rating
 */
export const getRatingInfo = (rating: number) => {
  const roundedRating = Math.round(rating * 2) / 2; // Arrondir à 0.5 près
  return RATING_CONFIG.RATING_DESCRIPTIONS[roundedRating] || 
         RATING_CONFIG.RATING_DESCRIPTIONS[0];
};

/**
 * Obtient la plage (range) pour un rating
 */
export const getRatingRange = (rating: number) => {
  const ranges = RATING_CONFIG.RATING_RANGES;
  
  if (rating >= ranges.EXCELLENT.min) return ranges.EXCELLENT;
  if (rating >= ranges.VERY_GOOD.min) return ranges.VERY_GOOD;
  if (rating >= ranges.GOOD.min) return ranges.GOOD;
  if (rating >= ranges.ACCEPTABLE.min) return ranges.ACCEPTABLE;
  if (rating >= ranges.AVERAGE.min) return ranges.AVERAGE;
  
  return ranges.POOR;
};

/**
 * Valide si un rating est dans une bonne plage
 */
export const isGoodRating = (rating: number): boolean => {
  return rating >= 3.5;
};

/**
 * Valide si un rating est excellent
 */
export const isExcellentRating = (rating: number): boolean => {
  return rating >= 4.5;
};

/**
 * Calcule le texte d'une barre de rating pour accessibilité
 */
export const getAccessibilityLabel = (rating: number, count: number = 0): string => {
  const rounded = Math.round(rating * 10) / 10;
  const base = `${rounded} étoiles sur 5`;
  
  if (count > 0) {
    return `${base}, ${count} avis`;
  }
  
  return base;
};

/**
 * Couleurs par niveau de rating
 */
export const RATING_COLORS = {
  EXCELLENT: '#22c55e', // Vert
  VERY_GOOD: '#3b82f6', // Bleu
  GOOD: '#10b981',      // Vert tendre  
  ACCEPTABLE: '#f59e0b', // Amber
  AVERAGE: '#f97316',   // Orange
  POOR: '#ef4444',      // Rouge
} as const;

/**
 * Sizes de composants
 */
export const STAR_SIZES = {
  tiny: { star: 10, text: 9, gap: 2 },
  small: { star: 12, text: 10, gap: 2 },
  medium: { star: 14, text: 11, gap: 3 },
  large: { star: 20, text: 16, gap: 4 },
} as const;

/**
 * Types d'export pour les types
 */
export type RatingRange = typeof RATING_CONFIG.RATING_RANGES[keyof typeof RATING_CONFIG.RATING_RANGES];
export type StarSize = keyof typeof STAR_SIZES;
