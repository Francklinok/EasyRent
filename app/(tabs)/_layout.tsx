import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Image } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AntDesign} from "@expo/vector-icons";
import EvilIcons from '@expo/vector-icons/EvilIcons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="Search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <AntDesign name="search1" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="ChatList"
        options={{
          title: 'ChatList',
          tabBarIcon: ({ color }) => <AntDesign name="message1" size={28} color={color}/>,
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Image
              source={{ uri:'https://randomuser.me/api/portraits/men/32.jpg' }} // 👉 URL de la photo
              style={{
                width: 28,
                height: 28,
                borderRadius: 14, // cercle
                borderWidth: focused ? 2 : 0, // effet story Insta
                borderColor: focused ? '#FF4081' : 'transparent',
              }}
            />
          ),
        }}
      />

    </Tabs> 
  );
}
