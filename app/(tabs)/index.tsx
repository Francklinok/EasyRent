import { View} from "react-native";
import Home from "../home/home";
import "@/global.css"
import 'react-native-get-random-values';
// import { ThemeToggle } from "@/components/ui/Theme";
import ThemeToggle from "@/components/ui/ThemeToggle";
export default function App (){
  return (
    <View className = " p-1">
      {/* <ThemeToggle/> */}
      <Home/>   
    </View>
  );
};

