import React, { useState, useRef, memo } from "react";
import {
  TouchableOpacity,
  View,
  Platform,
  StatusBar as RNStatusBar,
  Pressable,
  StyleSheet,
} from "react-native";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { ReactNode } from "react";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/themehook";
import { MotiView, AnimatePresence } from "moti";
import { useNotifications } from "@/components/contexts/notifications/NotificationContext";
import NotificationSystem from "@/components/notifications/NotificationSystem";
import ActivityHeader from "@/components/activity/ActivityHeader";
import { Activity } from "@/services/api/activityService";

export type HeaderProps = {
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  style?: object;
  onTransactionSelect?: (type: "VENTE" | "LOCATION") => void;
  showStatusBar?: boolean;
  statusBarStyle?: "default" | "dark-content" | "light-content";
  backgroundColor?: string;
  userId?: string;
  onActivityPress?: (activity: Activity) => void;
  showActivityIndicator?: boolean;
};

const Header = memo(({
  leftElement,
  rightElement,
  style = {},
  onTransactionSelect,
  showStatusBar = true,
  statusBarStyle = "dark-content",
  backgroundColor,
  userId = "user123", // Default user ID, should come from auth context
  onActivityPress,
  showActivityIndicator = true,
}: HeaderProps) => {
  const { theme } = useTheme();
  const { notifications, unreadCount, addNotification, markAsRead } = useNotifications();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<"VENTE" | "LOCATION">("VENTE");

  // Expose global notification function
  React.useEffect(() => {
    (global as any).addGlobalNotification = addNotification;
    return () => {
      delete (global as any).addGlobalNotification;
    };
  }, [addNotification]);

  const insets = useSafeAreaInsets();

  // const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleSelect = (transaction: "VENTE" | "LOCATION") => {
    setSelectedTransaction(transaction);
    onTransactionSelect?.(transaction);
    setMenuOpen(false);
  };

  // Logo par défaut optimisé
  const defaultLeftElement = (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 15, stiffness: 300 }}
      style={styles.logoContainer}
    >

      {/* <LinearGradient
        colors={[theme.primary, theme.outline || theme.outline]}
        style={styles.logoGradient}
      >
        <MaterialCommunityIcons name="home-variant" size={16} color="white" /> */}
      {/* </LinearGradient> */}
      <ThemedText type ="title" intensity="strong" variant = "primary">
        EasyRent
      </ThemedText>
    </MotiView>
  );

  // Élément par défaut à droite optimisé
  const defaultRightElement = (
    <ThemedView style={[styles.rightContainer, { backgroundColor: "transparent" }]}>
      {/* Single Notification Icon */}
      <MotiView
        from={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 100, type: "spring", stiffness: 400 }}
      >
        <TouchableOpacity
          onPress={() => setShowNotifications(true)}
          style={[
            styles.notificationButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.outline + "40",
            },
          ]}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={20} color={theme.primary} />
          {unreadCount > 0 && (
            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 200, type: "spring", stiffness: 600 }}
              style={[styles.badge, { backgroundColor: theme.error }]}
            >
              <ThemedText style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </ThemedText>
            </MotiView>
          )}
        </TouchableOpacity>
      </MotiView>
    </ThemedView>
  );

  return (
    <>
      {/* StatusBar visible - NE PAS masquer */}
      {showStatusBar && (
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={backgroundColor || "transparent"}
          translucent={true}
        />
      )}
      
      {/* Header principal avec marge pour StatusBar */}
      <SafeAreaView style={styles.safeArea}>
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
        >
          <BlurView 
            intensity={80} 
            tint="light" 
            style={styles.blurContainer}
          >
            <LinearGradient
              colors={[
                theme.surface + "F5",
                theme.surfaceVariant + "E8"
              ]}
              style={[
                styles.headerContent,
                {
                  paddingTop: Platform.OS === 'android' ? 8 : Math.max(insets.top - 10, 0),
                  borderBottomColor: theme.outline + "25",
                },
                style,
              ]}
            >
              <ThemedView style={styles.headerInner}>
                {leftElement !== undefined ? leftElement : defaultLeftElement}
                {rightElement !== undefined ? rightElement : defaultRightElement}
              </ThemedView>
            </LinearGradient>
          </BlurView>
        </MotiView>
      </SafeAreaView>
      
      {/* Global Notification System */}
      <NotificationSystem 
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
      />
    </>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "transparent",
    zIndex: 1000,
    height: 60
  },
  blurContainer: {
    borderRadius: 0,

  },
  headerContent: {
    paddingBottom: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    minHeight: 60
  },
  headerInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
    minHeight: 44,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoGradient: {
    width: 40,
    height: 40,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  badgeText: {
    color: "white",
    fontSize: 9,
    fontWeight: "bold",
  },
  // menuContainer: {
  //   zIndex: 1001,
  // },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  menuButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 12,
    marginRight: 3,
  },
  overlay: {
    position: "absolute",
    top: 45,
    left: -300,
    right: -50,
    bottom: -600,
    backgroundColor: "transparent",
    zIndex: 1000,
  },
  popupMenu: {
    position: "absolute",
    top: 48,
    right: 0,
    minWidth: 140,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 8,
    zIndex: 1002,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
});


Header.displayName = "Header";

export default Header;