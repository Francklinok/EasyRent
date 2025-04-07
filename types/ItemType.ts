import { ImageSourcePropType } from "react-native";

export interface ItemType {
  id: string;
  avatar: ImageSourcePropType;
  location: string;
  price: string;
  availibility: string;
  stars: number;
  review: string;
  features?: FeatureIcon[]; // Ajout de la propriété optionnelle features

  // features:string;
}

export interface FeatureIcon {
  icon: string;
  name: string;
}

