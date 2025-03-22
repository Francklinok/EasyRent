
import { View, Text, FlatList } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Fontisto from "@expo/vector-icons/Fontisto";

const criteriaList = [
  {
    id: "1",
    icon: <MaterialIcons name="hourglass-empty" size={34} color="black" />,
    title: "Durée de Location minimum",
    value: "3 ans",
  },
  {
    id: "2",
    icon: <AntDesign name="creditcard" size={28} color="black" />,
    title: "Solvabilité",
    value: "3 fois le montant du loyer",
  },
  {
    id: "3",
    icon: <Fontisto name="world-o" size={28} color="black" />,
    title: "Garant Résident",
    value: "Aux USA",
  },
];

const situations = ["Étudiant", "Salarié", "Chercheur", "Jeune actif", "Stagiaire"];
const documents = [
  {
    type: "Locataire",
    docs: ["Pièce d'identité", "RIB", "Passeport", "Attestation de scolarité"],
  },
  {
    type: "Garant",
    docs: ["Pièce d'identité", "RIB", "Passeport", "Attestation de scolarité"],
  },
];

export default function Criteria() {
  return (
    <View className="flex h-full px-6 py-4 bg-gray-50">
      {/* Section Critères */}
      <Text className="text-xl font-bold mb-4">Critères du Loueur</Text>
      <View className="bg-white rounded-xl shadow-md p-4">
        {criteriaList.map((item) => (
          <View key={item.id} className="flex flex-row items-center gap-4 py-3 border-b border-gray-200">
            {item.icon}
            <View>
              <Text className="text-base">{item.title}</Text>
              <Text className="text-lg text-green-700 font-semibold">{item.value}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Section Situation Demandée */}
      <Text className="text-xl font-bold mt-6 mb-4">Situation Demandée</Text>
      <View className="flex flex-row flex-wrap gap-3">
        {situations.map((situation, index) => (
          <Text key={index} className="text-base bg-gray-100 p-2 rounded-lg text-center w-[30%] shadow-sm">
            {situation}
          </Text>
        ))}
      </View>

      {/* Section Documents à Fournir */}
      <Text className="text-xl font-bold mt-6 mb-4">Documents à Fournir</Text>
      <View className="bg-white rounded-xl shadow-md p-4">
        {documents.map((section, index) => (
          <View key={index} className="mb-4">
            <Text className="text-lg font-semibold bg-gray-100 px-3 py-1 rounded-md">{section.type}</Text>
            {section.docs.map((doc, docIndex) => (
              <Text key={docIndex} className="text-base pl-4 mt-1">
                - {doc}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
