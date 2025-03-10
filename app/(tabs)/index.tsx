import { View} from "react-native";
import Accueill from "@/components/acceuill/acceuil";
import Header from "@/components/head/HeadFile";
import "@/global.css"

 export default function App (){
  return (
    <View className = "p-6 ">
      <Header/>
      <Accueill/>
    </View>
  );
};


