import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import Octicons from '@expo/vector-icons/Octicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ItemData from '@/components/info/index';
import Atout from '@/components/info/atoutFils';
import Criteria from '@/components/info/criteriaFile';
import Services from '@/components/info/servicesFiles';
import Equipment from '@/components/info/equipmentFiles';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
import { BackButton } from '@/components/ui/BackButton';

interface ComponentProps {
  itemId: string | string[];
}

export default function Info() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();
  const [activeComponent, setActiveComponent] = useState<string>('Description');
 const  {theme} = useTheme()
  const componentMap: Record<string, React.ComponentType<ComponentProps>> = useMemo(
    () => ({
      Description: ItemData,
      Criteria: Criteria,
      Atout: Atout,
      Equipment: Equipment,
      Services: Services,
    }),
    []
  );

  const ActiveComponent = componentMap[activeComponent];

  return (
    <SafeAreaView className="flex-1 " style={{ paddingTop: StatusBar.currentHeight }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* HEADER */}
      <ThemedView className="flex-row items-center px-2 py-1 " style = {{borderBottomWidth:1, borderBottomColor: theme.outline}}>
        <ThemedView className = "pr-4">
       <BackButton/>
 
        </ThemedView>


        <Image
          source={{ uri: 'https://via.placeholder.com/150' }}
          className="w-14 h-14 rounded-full mr-3 border "
          
        />

        <ThemedView className="flex-1">
          <ThemedText>{name || 'Utilisateur'}</ThemedText>
          <ThemedText>
            Taux de réponse{' '}
            <ThemedText intensity = 'strong' variant = "primary">100%</ThemedText>
          </ThemedText>
        </ThemedView>

        <ThemedView className="flex-row  gap-4  pr-4">
          <Octicons name="verified" size={22} color={theme.blue700} />
          <AntDesign name="message1" size={22} color={theme.blue700} />
        </ThemedView>
      </ThemedView>

      {/* CONTENU */}
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>        

        {/* Navigation Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 22,
            paddingVertical: 8,
            gap: 4,
          }}
        >
          {Object.keys(componentMap).map((key) => {
            const isActive = activeComponent === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setActiveComponent(key)}
                className={`px-2 py-2 rounded-full`}
                style = {{backgroundColor:   isActive ? theme.primary : theme.blue100}}
              >
                <ThemedText   style = {{color:   isActive ? theme.surface : theme.onSurface}}
  >
                  {key}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Contenu dynamique */}
        <ThemedView className="px-2">
          {ActiveComponent ? (
            <ActiveComponent itemId={id} />
          ) : (
            <ThemedText>Aucune donnée disponible</ThemedText>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}
