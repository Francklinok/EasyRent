import { View } from "react-native"
import AdvancedHousingSearch from "../searchScreen/Searchcomponent"
import Header from "@/components/head/HeadFile"

export default function Search(){
  return (
    <View>
        <Header/>
        <AdvancedHousingSearch/>
    </View>
  )
}
