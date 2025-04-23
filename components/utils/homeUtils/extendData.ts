import getFeaturesByLocation from "./getFutureByLocation";
import getEnergyScore from "./energieScore";
import { ItemType, FeatureIcon } from "@/types/ItemType";

export interface ExtendedItemType extends ItemType {
  features: FeatureIcon[];
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
    transport: Math.floor(Math.random() * 3) + 1
  };
}

const enrichItems = (data: ItemType[]): ExtendedItemType[] => {
  return data.map(item => {
    const energyScore = getEnergyScore(item.location);
    const virtualTourAvailable = Math.random() > 0.3;

    return {
      ...item,
      features: getFeaturesByLocation(item.location),
      energyScore,
      virtualTourAvailable,
      distanceToAmenities: getDistanceToAmenities(item.location)
    };
  });
};

export default enrichItems;
