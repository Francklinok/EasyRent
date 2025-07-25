
import { View, Text, FlatList } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Fontisto from "@expo/vector-icons/Fontisto";
import { ThemedView } from "../ui/ThemedView";
import { ThemedText } from "../ui/ThemedText";
import { OwnerCriteria } from "@/types/ItemType";
import { useTheme } from "../contexts/theme/themehook";
interface ItemDataProps {
  itemData?: {
    ownerCriteria?: OwnerCriteria;

  }
}


export default function Criteria({itemData}:ItemDataProps) {
  const   {theme} = useTheme()
  const   item = itemData
  if(!item ||  !item.ownerCriteria){
    return (
      <ThemedView className = "items-center pt-10">
          <ThemedText>Critères non disponibles</ThemedText>
      </ThemedView>
    )
  }

  const  criteriaList = [
    {
      id: "1",
      icon: <MaterialIcons name="hourglass-empty" size={24} color="black" />,
      title: "Durée de location minimum",
      value: item.ownerCriteria.minimumDuration,
    },
      {
      id: "2",
      icon: <AntDesign name="creditcard" size={24} color="black" />,
      title: "Solvabilité",
      value: item.ownerCriteria.solvability,
    },
    {
      id: "3",
      icon: <Fontisto name="world-o" size={24} color="black" />,
      title: "Garant Résident",
      value: item.ownerCriteria.guarantorLocation,
    },
  ];
  
  const situations = item.ownerCriteria.acceptedSituations ?? [];
  const documents = [
    {
      type: "Locataire",
      docs: item.ownerCriteria.requiredDocuments.tenant,
    },
    {
      type: "Garant",
      docs: item.ownerCriteria.requiredDocuments.guarantor,
    },
  ];



  return (
    <ThemedView className="flex h-full px-6 py-2 pb-12 ">
      {/* Section Critères */}
      <ThemedText type = "body" className = "p-2">Critères du Loueur</ThemedText>
      <ThemedView variant = "surfaceVariant" className="rounded-xl p-4">
        {criteriaList.map((item) => (
          <ThemedView variant = "surfaceVariant" key={item.id} className="flex flex-row items-center gap-4 py-3 border-b border-gray-200">
            {item.icon}
            <ThemedView variant = "surfaceVariant">
              <ThemedText className="text-base">{item.title}</ThemedText>
              <ThemedText className="text-lg text-green-700 font-semibold">{item.value}</ThemedText>
            </ThemedView>
          </ThemedView>
        ))}
      </ThemedView>

      {/* Section Situation Demandée */}
      <ThemedText type = "body" className = "p-2">Situation Demandée</ThemedText>
      <ThemedView  className="flex flex-row flex-wrap gap-3">
        {situations.map((situation, index) => (
          <ThemedText   key={index} className=" p-2 rounded-lg text-center w-[30%]" style = {{backgroundColor:theme.surfaceVariant }}>
            {situation}
          </ThemedText>
        ))}
      </ThemedView>

      {/* Section Documents à Fournir */}
      <ThemedText type = "body" className = "p-2">Documents à Fournir</ThemedText>
      <ThemedView bordered className=" rounded-xl  p-4">
        {documents.map((section, index) => (
          <ThemedView variant="surfaceVariant" key={index} className="mb-4">
            <ThemedText className="text-lg font-semibold px-3 py-1 rounded-md">{section.type}</ThemedText>
            {section.docs.map((doc, docIndex) => (
              <ThemedText key={docIndex} className="text-base pl-4 mt-1">
                - {doc}
              </ThemedText>
            ))}
          </ThemedView>
        ))}
      </ThemedView>
    </ThemedView>
  );
}
