import { MutableRefObject } from "react";
import * as Haptics from "expo-haptics";

type Props = {
  id: string;
  lottieRef: MutableRefObject<any>; // ou MutableRefObject<LottieView | null>
  favorites: string[];
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
};

const toggleFavorite = ({ id, lottieRef, favorites, setFavorites }: Props) => {
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
};

export default toggleFavorite;
