import { View, Text} from "react-native"
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Fontisto from '@expo/vector-icons/Fontisto';
export default function Criteria(){
    return (
        <View className = "flex">
        <View className = " pl-10 ">
        <Text className = "text-[20px] font-bold pb-2">Critere du Loueur </Text>
        <View>
        <View className = "flex flex-row gap-8 p-4">
            <MaterialIcons name="hourglass-empty" size={34} color="black" className = "mt-2"/>
            <View className = "flex flex-col gap-2 ">
                <Text className = "text-[16px]">
                    Durer de Location minimum
                </Text>
                <Text className = "text-[18px] text-green-700 ">3 ans</Text>
            </View>

            </View>
            <View className = "flex flex-row gap-8 p-4">
            <AntDesign name="creditcard" size={24} color="black" />
            <View className = "flex flex-col gap-2 ">
                <Text className = "text-[16px]">Solvabiliter</Text>
                <Text className = "text-[18px] text-green-700 "> 3 Fois le montant du loyer</Text>
            </View>

            </View>
            <View className = "flex flex-row gap-8 p-4">
            <Fontisto name="world-o" size={24} color="black" />
            <View className = "flex flex-col gap-2 ">
                <Text className = "text-[16px]">Garant Resident</Text>
                <Text className = "text-[18px] text-green-700 ">Aux USA</Text>
            </View>

            </View>
        </View>

        </View>
        <View className="flex gap-6 mt-2">
         <Text className="pl-10 text-[20px] font-bold pb-2">Situation Demandée</Text>
        <View className="flex flex-row flex-wrap gap-3 ">
            <Text className="text-[16px] w-[22%] h-10 text-center bg-gray-100 p-1 rounded-lg">Étudiant</Text>
            <Text className="text-[16px] w-[22%]  h-10 text-center bg-gray-100 p-1 rounded-lg">Salarié</Text>
            <Text className="text-[16px] w-[22%]  h-10 text-center bg-gray-100 p-1 rounded-lg">Chercheur</Text>
            <Text className="text-[16px] w-[22%]  h-10 text-center bg-gray-100 p-1 rounded-lg">Jeune actif</Text>
            <Text className="text-[16px] w-[22%]  h-10 text-center bg-gray-100 p-1 rounded-lg">Stagiaire</Text>
        </View>
        </View>

        </View>

    )

}
