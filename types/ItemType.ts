import { ImageSourcePropType } from "react-native";

export interface ItemType {
  id: string;
  avatar: ImageSourcePropType;
  location: string;
  price: string;
  availibility: string;
  stars: number;
  review: string;
}
