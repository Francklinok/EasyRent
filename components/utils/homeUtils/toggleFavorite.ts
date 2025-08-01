import { MutableRefObject } from "react";
import * as Haptics from "expo-haptics";

type Props = {
  id: string;
  lottieRef: MutableRefObject<any>;
  favorites: string[];
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
  toggleFavoriteContext?: (itemId: string) => Promise<void>;
};

const toggleFavorite = ({ id, lottieRef, favorites, setFavorites, toggleFavoriteContext }: Props) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const isFavorite = favorites.includes(id);

  setFavorites(prev =>
    isFavorite
      ? prev.filter(itemId => itemId !== id)
      : [...prev, id]
  );

  if (lottieRef.current && !isFavorite) {
    lottieRef.current.play(0, 60);
  }
  
  // Update context if available
  if (toggleFavoriteContext) {
    toggleFavoriteContext(id);
  }
};

export default toggleFavorite;
