import { View,Text } from "react-native"
import SearchComponent from "@/components/search/Searchcomponent"
import Header from "@/components/head/HeadFile"

export default function Search() {
  return (
    <View>
        <Header/>
        <SearchComponent/>
    </View>
  )
}

