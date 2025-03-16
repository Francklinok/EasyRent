import { View,Text } from "react-native";
import Header from "@/components/head/HeadFile";
import Accueill from "@/components/acceuill/acceuil";


export default function Home(){
    return (
        <View>
        <Header/>
        <Accueill/>
        </View>

    )
}