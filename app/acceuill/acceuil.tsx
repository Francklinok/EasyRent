import { View, Text, StyleSheet} from "react-native";
import EvilIcons from '@expo/vector-icons/EvilIcons';
import Header from "../head/HeadFile";
import FirstSection from "../body/FirstSection";

const Accueill = () =>{
    return (
        <View>     
          <Header/>  
          <FirstSection/>
        </View>
    )
}

export default Accueill;
