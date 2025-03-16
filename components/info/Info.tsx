import { View, Text } from "react-native"
import InfoHead from "./InfoHead"
import ItemData from "./itemFile"

type MessageHeaderProps = {
    name: string; // Le nom du contact
    image: string; // L'avatar du contact
  }
  

const InfoComponent= () =>{
    return (
    <View>
        <InfoHead />
        <ItemData/>

    </View>
    )
}

export default InfoComponent