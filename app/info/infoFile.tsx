import { useRoute } from "@react-navigation/native"
import { View,Text } from "react-native"
import { useLocalSearchParams, useRouter } from 'expo-router';


const Info = () =>{
    const route  = useRoute()
    const params = useLocalSearchParams()

    const {id, name} =  params 
    return (
        <View>
            <Text>{name}</Text>
            <Text> Salut tout le monde </Text>
            <Text>{id}</Text>
        </View>
    )
}

export default Info