import { Feature, FeatureIcon } from "@/types/ItemType";

const getFeaturesByLocation = (location: string): Feature[] => {
  const baseFeatures: Feature[] = [{ icon: "wifi", name: "Wi-Fi" }];

  switch (location) {
    case "Florida":
      return [
        ...baseFeatures,
        { icon: "snowflake", name: "Climatisation" },
        { icon: "umbrella-beach", name: "Plage" },
        { icon: "hot-tub", name: "Spa" },
      ];
    case "Texas":
      return [
        ...baseFeatures,
        // 'robot' n'est pas dans FeatureIcon, à vérifier ou remplacer par un valide
        { icon: "horse", name: "Ranch" },
        { icon: "solar-panel", name: "Panneaux solaires" },
      ];
    case "New York City":
      return [
        ...baseFeatures,
        { icon: "subway", name: "Métro" },
        { icon: "city", name: "Centre-ville" },
        { icon: "concierge-bell", name: "Conciergerie" },
      ];
    case "California":
      return [
        ...baseFeatures,
        { icon: "mountain", name: "Vue" },
        { icon: "tree", name: "Nature" },
        // 'wine-glass-alt' n'existe pas dans ta liste, remplace par 'wine-glass'
        { icon: "wine-glass", name: "Vignoble" },
      ];
    default:
      return [
        ...baseFeatures,
        { icon: "home", name: "Confort" },
        { icon: "parking", name: "Parking" },
      ];
  }
};

export default getFeaturesByLocation;
