import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, View, StyleSheet } from 'react-native';
import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { router } from 'expo-router';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAuth } from '@/components/contexts/authContext/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { theme } = useTheme();
  const { isOwner } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.surface,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 70,
          backgroundColor: theme.surface,
          borderTopWidth: 1,
          borderTopColor: theme.outline,
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          paddingTop: 5,
        },
      }}
      tabBar={(props) => {
        const { state, descriptors, navigation } = props;

        const renderTab = (route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
            >
              {options.tabBarIcon?.({
                focused: isFocused,
                color: isFocused ? theme.primary: theme.text + "90",
                size: 28
              })}
            </TouchableOpacity>
          );
        };

      
        // Filter out hidden tabs: 'OwnerDashboard' if not owner
        const hiddenTabs = [...(!isOwner ? ['OwnerDashboard'] : [])];
        const visibleRoutes = state.routes.filter(r => !hiddenTabs.includes(r.name));

        // Find indices: Home, Search, then after create button: Dashboard(if owner), ChatList, Settings
        const homeRoute = visibleRoutes.find(r => r.name === 'index');
        const searchRoute = visibleRoutes.find(r => r.name === 'Search');
        const dashboardRoute = visibleRoutes.find(r => r.name === 'OwnerDashboard');
        const chatRoute = visibleRoutes.find(r => r.name === 'ChatList');
        const settingsRoute = visibleRoutes.find(r => r.name === 'Settings');

        const getOriginalIndex = (route: any) => state.routes.findIndex(r => r.name === route.name);

        return (
          <ThemedView style={[styles.tabBarContainer, { backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.outline }]}>
            <ThemedView style={styles.tabBar}>
              {/* Home */}
              {homeRoute && renderTab(homeRoute, getOriginalIndex(homeRoute))}

              {/* Search */}
              {searchRoute && renderTab(searchRoute, getOriginalIndex(searchRoute))}

              {/* Create Button */}
              <TouchableOpacity
                onPress={() => router.push('/creation')}
                style={styles.createButton}
              >
                <ThemedView
                  style={[
                    styles.createButtonInner,
                    { backgroundColor: theme.primary + "90" }
                  ]}
                >
                  <MaterialIcons name="add" size={28} color="white" />
                </ThemedView>
              </TouchableOpacity>

              {/* Dashboard (only if owner) */}
              {dashboardRoute && renderTab(dashboardRoute, getOriginalIndex(dashboardRoute))}

              {/* ChatList */}
              {chatRoute && renderTab(chatRoute, getOriginalIndex(chatRoute))}

              {/* Settings */}
              {settingsRoute && renderTab(settingsRoute, getOriginalIndex(settingsRoute))}
            </ThemedView>
          </ThemedView>
        );
      }}
    >

      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="Search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <AntDesign name="search" size={26} color={color} />,
        }}
      />

      <Tabs.Screen
        name="OwnerDashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <MaterialIcons name="dashboard" size={26} color={color} />,
          tabBarButton: isOwner ? HapticTab : () => null,
        }}
      />

      <Tabs.Screen
        name="ChatList"
        options={{
          title: 'ChatList',
          tabBarIcon: ({ color }) => <MaterialIcons name="message" size={26} color={color}/>,
        }}
      />

      <Tabs.Screen
        name="Settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons
              name="settings"
              size={26}
              color={color}
              style={{
                opacity: focused ? 1 : 0.7,
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 0,
    left: 0,
    right: 0,
    height: 90,
    paddingBottom:40,
  },
  tabBar: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  createButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonInner: {
    borderRadius: 28,
    width:50,
    height:50,
    justifyContent: 'center',
    alignItems: 'center',
    // shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    marginTop: -10,
  },
});
