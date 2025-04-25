// import { ThemedView } from "@/components/ui/ThemedView";
// import { FontAwesome5, MaterialIcons} from "@expo/vector-icons";
// import { ThemedText } from "@/components/ui/ThemedText";
// import { ItemType, FeatureIcon } from "@/types/ItemType";
// import { useDarkMode, useThemeColors } from "@/components/contexts/theme/themehook";
// import { useTheme } from "@/components/contexts/theme/themehook";
// interface ExtendedItemType extends ItemType {
//   features: FeatureIcon[];
//   energyScore: number; // Score énergétique de 0 à 100
//   virtualTourAvailable: boolean;
//   distanceToAmenities: {
//     schools: number;
//     healthcare: number;
//     shopping: number;
//     transport: number;
//   };
//   aiRecommendation: string; // Recommandation personnalisée par IA
// }


// const RenderNeighborhoodInfo = (item: ExtendedItemType) => {
//   const  {theme} =  useTheme()
//   return (
//     <ThemedView 
//       className=" flex-row justify-between items-center p-1 rounded-lg border"
//       style={{
//         backgroundColor:'rgba(55, 65, 81, 0.2)' ,
//         borderColor: 'rgba(75, 85, 99, 0.3)',
//       }}
//     >
//       <ThemedView className="flex-row items-center gap-1">
//         <MaterialIcons name="school" size={14} color={theme.subtext} />
//         <ThemedText style={{ fontSize: 10, color: theme.subtext }}>
//           {item.distanceToAmenities.schools}km
//         </ThemedText>
//       </ThemedView>
      
//       <ThemedView className="flex-row items-center gap-1">
//         <FontAwesome5 name="hospital" size={14} color={theme.subtext} />
//         <ThemedText style={{ fontSize: 10, color: theme.subtext }}>
//           {item.distanceToAmenities.healthcare}km
//         </ThemedText>
//       </ThemedView>
      
//       <ThemedView className="flex-row items-center gap-1">
//         <FontAwesome5 name="shopping-cart" size={14} color={theme.subtext} />
//         <ThemedText style={{ fontSize: 10, color: theme.subtext }}>
//           {item.distanceToAmenities.shopping}km
//         </ThemedText>
//       </ThemedView>
      
//       <ThemedView className="flex-row items-center gap-1">
//         <MaterialIcons name="train" size={14} color={theme.subtext} />
//         <ThemedText style={{ fontSize: 10, color: theme.subtext }}>
//           {item.distanceToAmenities.transport}km
//         </ThemedText>
//       </ThemedView>
//     </ThemedView>
//   )};
// export default  RenderNeighborhoodInfo

import { ThemedView } from "@/components/ui/ThemedView";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ui/ThemedText";
import { ItemType, FeatureIcon } from "@/types/ItemType";
import { useTheme } from "@/components/contexts/theme/themehook";

interface ExtendedItemType extends ItemType {
  features: FeatureIcon[];
  energyScore: number; // Score énergétique de 0 à 100
  virtualTourAvailable: boolean;
  distanceToAmenities?: {
    schools: number;
    healthcare: number;
    shopping: number;
    transport: number;
  };
  aiRecommendation: string; // Recommandation personnalisée par IA
}

const RenderNeighborhoodInfo = (item: ExtendedItemType) => {
  const { theme } = useTheme();

  const schools = item.distanceToAmenities?.schools ?? "N/A";
  const healthcare = item.distanceToAmenities?.healthcare ?? "N/A";
  const shopping = item.distanceToAmenities?.shopping ?? "N/A";
  const transport = item.distanceToAmenities?.transport ?? "N/A";

  return (
    <ThemedView
      className="flex-row justify-between items-center p-1 rounded-lg border"
      style={{
        backgroundColor: "rgba(55, 65, 81, 0.2)",
        borderColor: "rgba(75, 85, 99, 0.3)",
      }}
    >
      <ThemedView className="flex-row items-center gap-1">
        <MaterialIcons name="school" size={14} color={theme.subtext} />
        <ThemedText style={{ fontSize: 10, color: theme.subtext }}>
          {schools}km
        </ThemedText>
      </ThemedView>

      <ThemedView className="flex-row items-center gap-1">
        <FontAwesome5 name="hospital" size={14} color={theme.subtext} />
        <ThemedText style={{ fontSize: 10, color: theme.subtext }}>
          {healthcare}km
        </ThemedText>
      </ThemedView>

      <ThemedView className="flex-row items-center gap-1">
        <FontAwesome5 name="shopping-cart" size={14} color={theme.subtext} />
        <ThemedText style={{ fontSize: 10, color: theme.subtext }}>
          {shopping}km
        </ThemedText>
      </ThemedView>

      <ThemedView className="flex-row items-center gap-1">
        <MaterialIcons name="train" size={14} color={theme.subtext} />
        <ThemedText style={{ fontSize: 10, color: theme.subtext }}>
          {transport}km
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
};

export default RenderNeighborhoodInfo;
