import React, { useState, useRef, memo } from "react";
import {
  TouchableOpacity,
  View,
  Platform,
  StatusBar as RNStatusBar,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView, StatusBar } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { ReactNode } from "react";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/components/contexts/theme/themehook";
import { MotiView, AnimatePresence } from "moti";

export type HeaderProps = {
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  style?: any;
  onTransactionSelect?: (type: "VENTE" | "LOCATION") => void;
  showStatusBar?: boolean;
  statusBarStyle?: "default" | "dark-content" | "light-content";
  backgroundColor?: string;
};

const Header = memo(({
  leftElement,
  rightElement,
  style = {},
  onTransactionSelect,
  showStatusBar = true,
  statusBarStyle = "dark-content",
  backgroundColor,
}: HeaderProps) => {
  const { theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<"VENTE" | "LOCATION">("VENTE");

  const insets = useSafeAreaInsets();

  const toggleMenu = () => setMenuOpen((prev) => !prev);

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
      <LinearGradient
        colors={[theme.primary, theme.secondary || theme.primary]}
        style={styles.logoGradient}
      >
        <MaterialCommunityIcons name="home-variant" size={20} color="white" />
      </LinearGradient>
      <ThemedText style={[styles.logoText, { color: theme.primary }]}>
        EasyRent
      </ThemedText>
    </MotiView>
  );

  // Élément par défaut à droite optimisé
  const defaultRightElement = (
    <ThemedView style={[styles.rightContainer, { backgroundColor: "transparent" }]}>
      {/* Notification avec badge animé */}
      <MotiView
        from={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 200, type: "spring", stiffness: 400 }}
      >
        <TouchableOpacity
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
          <MotiView
            from={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 400, type: "spring", stiffness: 600 }}
            style={[styles.badge, { backgroundColor: theme.error }]}
          >
            <ThemedText style={styles.badgeText}>3</ThemedText>
          </MotiView>
        </TouchableOpacity>
      </MotiView>

      {/* Menu transaction avec z-index optimisé */}
      <ThemedView style={{backgroundColor: theme.surfaceVariant }}>
        <MotiView
          from={{ opacity: 0, translateX: 20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ delay: 300, type: "spring", stiffness: 300 }}
        >
          <TouchableOpacity
            onPress={toggleMenu}
            style={[
              styles.menuButton,
              {
                backgroundColor: theme.primary,
                shadowColor: theme.primary,
              },
            ]}
            activeOpacity={0.9}
          >
            <ThemedText style={styles.menuButtonText}>
              {selectedTransaction === "VENTE" ? "Vente" : "Location"}
            </ThemedText>
            <MotiView
              animate={{ rotate: menuOpen ? "180deg" : "0deg" }}
              transition={{ type: "timing", duration: 200 }}
            >
              <Ionicons name="chevron-down" size={16} color="white" />
            </MotiView>
          </TouchableOpacity>
        </MotiView>

        {/* Menu popup amélioré */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <Pressable
                onPress={() => setMenuOpen(false)}
                style={styles.overlay}
              />

              <MotiView
                from={{ opacity: 0, scale: 0.9, translateY: -10 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                exit={{ opacity: 0, scale: 0.9, translateY: -10 }}
                transition={{ type: "timing", duration: 200 }}
                style={[
                  styles.popupMenu,
                  {
                    backgroundColor: theme.surface,
                    shadowColor: theme.shadowColor || "#000",
                    borderColor: theme.outline + "20",
                  },
                ]}
              >
                {["VENTE", "LOCATION"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => handleSelect(type as "VENTE" | "LOCATION")}
                    style={[
                      styles.menuItem,
                      selectedTransaction === type && {
                        backgroundColor: theme.primary + "10",
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <ThemedText
                      style={{
                        color:
                          selectedTransaction === type
                            ? theme.primary
                            : theme.typography.body,
                        fontWeight: selectedTransaction === type ? "700" : "500",
                      }}
                    >
                      {type === "VENTE" ? "Vente" : "Location"}
                    </ThemedText>
                    {selectedTransaction === type && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={theme.primary}
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </MotiView>
            </>
          )}
        </AnimatePresence>
      </ThemedView>
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
                  paddingTop: insets.top + 8, // Respect de la StatusBar
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
    </>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "transparent",
    zIndex: 1000,
  },
  blurContainer: {
    borderRadius: 0,
  },
  headerContent: {
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  headerInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
    minHeight: 44, // Hauteur minimum pour faciliter les interactions
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  // menuContainer: {
  //   zIndex: 1001,
  // },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
    marginRight: 4,
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


// export const HeaderExample = () => {
//   const handleTransactionSelect = (type: "VENTE" | "LOCATION") => {
//     console.log("Transaction sélectionnée:", type);
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
//       <Header
//         onTransactionSelect={handleTransactionSelect}
//         showStatusBar={true}
//         statusBarStyle="dark-content"
//       />
      
//       {/* Contenu de votre app */}
//       <View style={{ flex: 1, padding: 20 }}>
//         <ThemedText style={{ fontSize: 18, textAlign: "center", marginTop: 50 }}>
//           Votre contenu d'application ici...
//         </ThemedText>
//         <ThemedText style={{ textAlign: "center", marginTop: 20, opacity: 0.7 }}>
//           La StatusBar est maintenant visible avec les indicateurs système !
//         </ThemedText>
//       </View>
//     </View>
//   );
// };

Header.displayName = "Header";

export default Header;