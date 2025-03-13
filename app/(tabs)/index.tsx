import { View} from "react-native";
import Accueill from "@/components/acceuill/acceuil";
import Header from "@/components/head/HeadFile";
import Message from "./message";
import "@/global.css"

 export default function App (){
  return (
    <View className = " p-1">
      <Header/>
      <Accueill/>
      <Message/>
    </View>
  );
};


