import { View } from "react-native"
import AdvancedHousingSearch from "@/components/searchScreen/Searchcomponent"
import Header from "@/components/ui/header"
import { ThemedView } from "@/components/ui/ThemedView"

export default function Search(){
  return (
    <ThemedView variant= "surface">
        {/* <Header/> */}
        <AdvancedHousingSearch/>
    </ThemedView>
  )
}
