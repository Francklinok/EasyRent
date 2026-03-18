# Guide des Composants d'Affichage des Avis (Ratings)

## Vue d'ensemble

Ce guide explique comment utiliser les 3 composants principaux pour afficher les avis/ratings dans votre application, comme le Play Store.

---

## 1. **PropertyStarRating** - Affichage Standard

### Utilisation
```tsx
import PropertyStarRating from '@/components/ui/PropertyStarRating';

<PropertyStarRating
  rating={item.stars}
  size="small"
  interactive={false}
  onRatingChange={(newRating) => console.log(newRating)}
  showReviewCount={false}
/>
```

### Props
- `rating: number` - Rating entre 0 et 5
- `reviewCount?: number` - Nombre d'avis (optionnel)
- `size?: 'small' | 'medium' | 'large'` - Taille des étoiles
- `interactive?: boolean` - Permettre à l'utilisateur de noter
- `onRatingChange?: (rating: number) => void` - Callback quand le rating change
- `showReviewCount?: boolean` - Afficher le nombre d'avis
- `style?: ViewStyle` - Styles personnalisés

### Format d'affichage
```
⭐⭐⭐⭐⭐ 4.5 (128)
```

### Cas d'usage
- Listes de propriétés
- Cartes de propriétés
- Affichage rapide du rating

---

## 2. **PlayStoreRatingDisplay** - Affichage Détaillé (Style Play Store)

### Utilisation
```tsx
import PlayStoreRatingDisplay from '@/components/ui/PlayStoreRatingDisplay';

<PlayStoreRatingDisplay
  rating={item.stars}
  reviewCount={128}
  ratingBreakdown={{
    fiveStar: 100,
    fourStar: 20,
    threeStar: 5,
    twoStar: 2,
    oneStar: 1,
  }}
/>
```

### Props
- `rating: number` - Rating entre 0 et 5
- `reviewCount?: number` - Nombre total d'avis
- `interactive?: boolean` - Mode interactif
- `onRatingChange?: (rating: number) => void` - Callback au changement
- `ratingBreakdown?: StarBreakdown` - Répartition des avis par étoile
- `style?: ViewStyle` - Styles personnalisés

### Format d'affichage
```
┌─────────────────────────────┐
│      4.5  [Excellent]       │
│ ⭐⭐⭐⭐⭐ 128 avis          │
├─────────────────────────────┤
│ 5 ⭐ ████████░░ 100         │
│ 4 ⭐ ███░░░░░░░ 20          │
│ 3 ⭐ ██░░░░░░░░ 5           │
│ 2 ⭐ █░░░░░░░░░ 2           │
│ 1 ⭐ █░░░░░░░░░ 1           │
└─────────────────────────────┘
```

### Cas d'usage
- Pages de détails de propriété
- Vue détaillée des avis
- Statistiques complètes du rating

---

## 3. **CompactRatingDisplay** - Affichage Compact

### Utilisation
```tsx
import CompactRatingDisplay from '@/components/ui/CompactRatingDisplay';

<CompactRatingDisplay
  rating={item.stars}
  reviewCount={128}
  size="small"
  hideText={false}
/>
```

### Props
- `rating: number` - Rating entre 0 et 5
- `reviewCount?: number` - Nombre d'avis (optionnel)
- `size?: 'tiny' | 'small' | 'medium'` - Taille
- `interactive?: boolean` - Mode interactif
- `onRatingChange?: (rating: number) => void` - Callback
- `hideText?: boolean` - Masquer le texte du rating
- `style?: ViewStyle` - Styles personnalisés

### Format d'affichage
```
⭐⭐⭐⭐⭐ 4.5 (128)
```

### Cas d'usage
- Grilles compactes
- Listes avec peu d'espace
- En-têtes de listes

---

## Utilitaires Helpers (`ratingUtils.ts`)

### Fonctions disponibles

#### 1. `getRatingDescription(rating: number)`
Retourne une description textuelle du rating:
- >= 4.5: "Excellent"
- >= 4: "Très bon"
- >= 3.5: "Bon"
- >= 3: "Acceptable"
- >= 2: "Moyen"
- >= 1: "Faible"

```tsx
import { getRatingDescription } from '@/utils/ratingUtils';

const desc = getRatingDescription(4.5); // "Excellent"
```

#### 2. `getRatingColor(rating: number)`
Retourne une couleur basée sur le rating:
```tsx
import { getRatingColor } from '@/utils/ratingUtils';

const color = getRatingColor(4.5); // "#22c55e" (vert)
```

#### 3. `formatReviewCount(count: number)`
Formate le nombre d'avis:
```tsx
import { formatReviewCount } from '@/utils/ratingUtils';

formatReviewCount(1500); // "1.5K avis"
formatReviewCount(100);  // "100 avis"
```

#### 4. `generateStarArray(rating: number)`
Génère un tableau de stars ('full', 'half', 'empty'):
```tsx
import { generateStarArray } from '@/utils/ratingUtils';

const stars = generateStarArray(4.5);
// ['full', 'full', 'full', 'full', 'half']
```

#### 5. `calculateAverageRating(breakdown: StarBreakdown)`
Calcule le rating moyen à partir d'une répartition:
```tsx
import { calculateAverageRating } from '@/utils/ratingUtils';

const avg = calculateAverageRating({
  fiveStar: 100,
  fourStar: 20,
  threeStar: 5,
  twoStar: 2,
  oneStar: 1,
}); // 4.5
```

---

## Exemple d'Intégration Complète

```tsx
import PropertyStarRating from '@/components/ui/PropertyStarRating';
import PlayStoreRatingDisplay from '@/components/ui/PlayStoreRatingDisplay';
import CompactRatingDisplay from '@/components/ui/CompactRatingDisplay';

// Liste compacte
<CompactRatingDisplay rating={item.stars} size="small" />

// Carte propriété
<PropertyStarRating rating={item.stars} size="medium" />

// Page détails
<PlayStoreRatingDisplay
  rating={item.stars}
  reviewCount={item.reviewCount}
  ratingBreakdown={item.ratingBreakdown}
/>
```

---

## Notes Techniques

- **Étoiles**: Utilisent `MaterialCommunityIcons` 
- **Couleur jaune**: `#FCD34D` (or/jaune standard)
- **Demi-étoiles**: Implémentées avec masquage positional
- **Validation**: Le rating est automatiquement clampé entre 0 et 5
- **Haptic Feedback**: Ajouté au mode interactif

---

## Compatibilité

- ✅ React Native
- ✅ Expo
- ✅ Compatible avec `ThemedView` et `ThemedText`
- ✅ Support du thème clair/sombre
