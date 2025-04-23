// Function to associate features with each property type with enhanced options
import { FeatureIcon } from "@/types/ItemType";


const getFeaturesByLocation = (location: string): FeatureIcon[] => {
  const baseFeatures = [{ icon: "wifi", name: "Wi-Fi" }];
  
  switch (location) {
    case "Florida":
      return [
        ...baseFeatures,
        { icon: "snowflake", name: "Climatisation" },
        { icon: "umbrella-beach", name: "Plage" },
        { icon: "hot-tub", name: "Spa" }
      ];
    case "Texas":
      return [
        ...baseFeatures,
        { icon: "robot", name: "Assistant IA" },
        { icon: "horse", name: "Ranch" },
        { icon: "solar-panel", name: "Panneaux solaires" }
      ];
    case "New York City":
      return [
        ...baseFeatures,
        { icon: "subway", name: "Métro" },
        { icon: "city", name: "Centre-ville" },
        { icon: "concierge-bell", name: "Conciergerie" }
      ];
    case "California":
      return [
        ...baseFeatures,
        { icon: "mountain", name: "Vue" },
        { icon: "tree", name: "Nature" },
        { icon: "wine-glass-alt", name: "Vignoble" }
      ];
    default:
      return [
        ...baseFeatures,
        { icon: "home", name: "Confort" },
        { icon: "parking", name: "Parking" }
      ];
  }
};
export default getFeaturesByLocation;