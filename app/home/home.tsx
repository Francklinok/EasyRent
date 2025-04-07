

import { View, Text, TouchableOpacity} from 'react-native'
import React from 'react'
import RenHouseAcceuil from '@/components/acceuill/RenHouseAcceuil'
import houseSelleAcceuil from '@/components/acceuill/houseSelleAcceuil'
import landSelleAcceuill from '@/components/acceuill/landSelleAcceuill'
import { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Header from '@/components/head/HeadFile'

interface ComponentProps {
  itemId: string | string[];
}

const Home = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const {id} = params

  const [activeComponent, setActiveComponent] = useState<string>("RenHouseAcceuil")

  const componentMap:{[key:string]:React.ComponentType<ComponentProps> } = {
  "RentHouse":RenHouseAcceuil,
  "SelleHouse":houseSelleAcceuil,
  "SelleLand":landSelleAcceuill
  }

  const ActiveComponent = componentMap[activeComponent]


  return (
    <View>
      <Header/>
      <View className="flex flex-row flex-wrap gap-2 p-2">
      {Object.keys(componentMap).map((key) =>(
         <TouchableOpacity
            key={key}
            onPress={() => setActiveComponent(key)}
            style={{
              backgroundColor: activeComponent === key ? '#e0e0e0' : '#f5f5f5',
              paddingVertical: 6,
              paddingHorizontal: 13,
              borderRadius: 20,
            }}
          >
            <Text className="text-[14px]">{key}</Text>
          </TouchableOpacity>

      ))}
      </View>
      <View className="p-2">
        {ActiveComponent?(
         <ActiveComponent itemId={id} />
        ):(<Text>Aucune donnée disponible</Text>
        )}
      </View>
    </View>
  )
}

export default Home