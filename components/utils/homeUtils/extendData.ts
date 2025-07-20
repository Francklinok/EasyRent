import getEnergyScore from "./energieScore";
import { ItemType, Feature, FeatureIcon } from "@/types/ItemType";
import getFeaturesByLocation from "./getFutureByLocation";
export interface ExtendedItemType extends ItemType {
  // features reste Feature[] (pas FeatureIcon[])
  features: Feature[];
  energyScore: number;
  virtualTourAvailable: boolean;
  distanceToAmenities: {
    schools: number;
    healthcare: number;
    shopping: number;
    transport: number;
  };
}

function getDistanceToAmenities(location: string) {
  return {
    schools: Math.floor(Math.random() * 5) + 1,
    healthcare: Math.floor(Math.random() * 8) + 1,
    shopping: Math.floor(Math.random() * 4) + 1,
    transport: Math.floor(Math.random() * 3) + 1,
  };
}

const enrichItems = (data: ItemType[]): ExtendedItemType[] => {
  return data.map((item) => {
    const energyScore = getEnergyScore(item.location);
    const virtualTourAvailable = Math.random() > 0.3;

    const features: Feature[] = getFeaturesByLocation(item.location);

    return {
      ...item, // propriétés originales
      features, // ajout des propriétés étendues
      energyScore,
      virtualTourAvailable,
      distanceToAmenities: getDistanceToAmenities(item.location),
    };
  });
};

export default enrichItems;
