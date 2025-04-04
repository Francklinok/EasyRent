import { View} from "react-native";
import Home from "../home/home";
import "@/global.css"
import 'react-native-get-random-values';

// import './shim.js';

export default function App (){
  return (
    <View className = " p-1">
      <Home/>   
    </View>
  );
};

