import { Tabs, router } from 'expo-router';
import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/ui/HapticTab';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import {
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
} from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_WIDE = SCREEN_WIDTH >= 768;

// ─── Individual tab button ───────────────────────────────────────────────────
function TabBtn({
  icon,
  focused,
  onPress,
  badge,
}: {
  icon: React.ReactNode;
  focused: boolean;
  onPress: () => void;
  badge?: number;
}) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.tabBtn, IS_WIDE && styles.tabBtnWide]}
    >
      <View style={[styles.tabBtnInner, focused && { backgroundColor: theme.text + '12' }]}>
        {icon}
        {badge != null && badge > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.primary }]}>
          </View>
        )}
      </View>
      {/* Active indicator — thin dot on bottom (mobile) or left bar (wide) */}
      {focused && !IS_WIDE && (
        <View style={[styles.activeDot, { backgroundColor: theme.primary }]} />
      )}
      {focused && IS_WIDE && (
        <View style={[styles.activeBarWide, { backgroundColor: theme.primary }]} />
      )}
    </TouchableOpacity>
  );
}

// ─── Custom tab bar ──────────────────────────────────────────────────────────
function XTabBar({ state, descriptors, navigation }: any) {
  const { theme } = useTheme();
  const { isOwner } = useAuth();
  const insets = useSafeAreaInsets();

  const iconColor = (focused: boolean) =>
    focused ? theme.text : theme.text + '55';
  const iconSize = 26;

  // Icon map keyed by route name
  const getIcon = (name: string, focused: boolean) => {
    const color = iconColor(focused);
    switch (name) {
      case 'index':
        return focused
          ? <MaterialCommunityIcons name="home" size={iconSize} color={color} />
          : <MaterialCommunityIcons name="home-outline" size={iconSize} color={color} />;
      case 'Search':
        return <MaterialIcons name="search" size={iconSize} color={color} />;
      case 'Wallet':
        return focused
          ? <MaterialCommunityIcons name="wallet" size={iconSize} color={color} />
          : <MaterialCommunityIcons name="wallet-outline" size={iconSize} color={color} />;
      case 'Invest':
        return focused
          ? <MaterialCommunityIcons name="chart-line" size={iconSize} color={color} />
          : <MaterialCommunityIcons name="chart-line-variant" size={iconSize} color={color} />;
      case 'OwnerDashboard':
        return focused
          ? <MaterialIcons name="dashboard" size={iconSize} color={color} />
          : <MaterialIcons name="dashboard-customize" size={iconSize} color={color} />;
      case 'ChatList':
        return focused
          ? <MaterialCommunityIcons name="message" size={iconSize} color={color} />
          : <MaterialCommunityIcons name="message-outline" size={iconSize} color={color} />;
      case 'Settings':
        return focused
          ? <Ionicons name="person" size={iconSize} color={color} />
          : <Ionicons name="person-outline" size={iconSize} color={color} />;
      default:
        return <MaterialIcons name="circle" size={iconSize} color={color} />;
    }
  };

  // Search moved to the home header (next to the advanced-filters icon),
  // and Invest moved to the home header's stats strip ("Investir" tile) —
  // both routes still exist (Tabs.Screen below), just no longer get their
  // own bottom-bar button, same mechanism as hiding OwnerDashboard.
  const hiddenTabs = ['Search', 'Invest', ...(!isOwner ? ['OwnerDashboard'] : [])];
  const visibleRoutes = state.routes.filter((r: any) => !hiddenTabs.includes(r.name));

  const getOriginalIndex = (route: any) =>
    state.routes.findIndex((r: any) => r.name === route.name);

  // Order: Home, Wallet, Invest, [Dashboard], Chat, Profile — Invest is
  // filtered out by hiddenTabs above (moved to the home header), so it
  // never actually reaches `sorted`/the split below.
  const order = ['index', 'Wallet', 'Invest', 'OwnerDashboard', 'ChatList', 'Settings'];
  const sorted = order
    .map((name) => visibleRoutes.find((r: any) => r.name === name))
    .filter(Boolean);

  // Split: left-of-FAB and right-of-FAB, roughly balanced either side.
  const leftRoutes = sorted.slice(0, Math.ceil(sorted.length / 2));
  const rightRoutes = sorted.slice(Math.ceil(sorted.length / 2));

  const renderTab = (route: any) => {
    const idx = getOriginalIndex(route);
    const focused = state.index === idx;
    return (
      <TabBtn
        key={route.key}
        focused={focused}
        icon={getIcon(route.name, focused)}
        onPress={() => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        }}
      />
    );
  };

  if (IS_WIDE) {
    // ── Wide/tablet: vertical sidebar ──────────────────────────────────────
    return (
      <View
        style={[
          styles.sidebar,
          {
            backgroundColor: theme.surface,
            borderRightColor: theme.outline + '30',
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 8,
          },
        ]}
      >
        {/* Logo mark */}
        <View style={styles.logoMark}>
          <FontAwesome5 name="home" size={22} color={theme.primary} />
        </View>

        {sorted.map(renderTab)}

        {/* FAB */}
        <TouchableOpacity
          onPress={() => router.push('/creation')}
          style={[styles.fabSidebar, { backgroundColor: theme.primary }]}
          activeOpacity={0.85}
        >
          <MaterialIcons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  // ── Mobile: bottom bar ────────────────────────────────────────────────────
  return (
    <View
      style={[
        styles.bottomBar,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.outline + '25',
          paddingBottom: insets.bottom || 8,
        },
      ]}
    >
      <View style={styles.bottomInner}>
        {leftRoutes.map(renderTab)}

        {/* FAB in centre */}
        <TouchableOpacity
          onPress={() => router.push('/creation')}
          style={styles.fabWrap}
          activeOpacity={0.85}
        >
          <View style={[styles.fab, { backgroundColor: theme.primary }]}>
            <MaterialIcons name="add" size={22} color="#fff" />
          </View>
        </TouchableOpacity>

        {rightRoutes.map(renderTab)}
      </View>
    </View>
  );
}

// ─── Layout ──────────────────────────────────────────────────────────────────
export default function TabLayout() {
  const { theme } = useTheme();
  const { isOwner } = useAuth();

  const screenOpts = {
    headerShown: false,
    tabBarButton: HapticTab,
    tabBarActiveTintColor: theme.text,
    tabBarInactiveTintColor: theme.text + '55',
  };

  return (
    <Tabs screenOptions={screenOpts} tabBar={(props) => <XTabBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons
              name={focused ? 'home' : 'home'}
              size={26}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Search"
        options={{
          title: 'Recherche',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="search" size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Wallet"
        options={{
          title: 'Portefeuille',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'wallet' : 'wallet-outline'}
              size={26}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Invest"
        options={{
          title: 'Investir',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chart-line" size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="OwnerDashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="dashboard" size={26} color={color} />
          ),
          tabBarButton: isOwner ? HapticTab : () => null,
        }}
      />

      <Tabs.Screen
        name="ChatList"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'message' : 'message-outline'}
              size={26}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Settings"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={26}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Bottom bar ──
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bottomInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 6,
    paddingHorizontal: 4,
    minHeight: 52,
  },

  // ── Sidebar (wide) ──
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 72,
    alignItems: 'center',
    borderRightWidth: StyleSheet.hairlineWidth,
    zIndex: 100,
    gap: 4,
  },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  // ── Tab button ──
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
    position: 'relative',
  },
  tabBtnWide: {
    flex: 0,
    width: 54,
    height: 54,
    borderRadius: 27,
    marginVertical: 2,
  },
  tabBtnInner: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Active indicators ──
  activeDot: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  activeBarWide: {
    position: 'absolute',
    left: 0,
    top: '25%',
    width: 3,
    height: '50%',
    borderRadius: 2,
  },

  // ── Badge ──
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // ── FAB (bottom) ──
  fabWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },

  // ── FAB (sidebar) ──
  fabSidebar: {
    marginTop: 12,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
