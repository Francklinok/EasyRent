import React, { useState, useRef } from "react";
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
import Svg, {
  Text as SvgText,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import NotificationBadge from "@/components/utils/Notification";
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
};

const Header = ({
  leftElement,
  rightElement,
  style = {},
  onTransactionSelect,
}: HeaderProps) => {
  const { theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<"VENTE" | "LOCATION">("VENTE");

  const insets = useSafeAreaInsets();
  const statusBarHeight =
    Platform.OS === "android" ? RNStatusBar.currentHeight || 0 : 0;

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleSelect = (transaction: "VENTE" | "LOCATION") => {
    setSelectedTransaction(transaction);
    onTransactionSelect?.(transaction);
    setMenuOpen(false);
  };

  // Logo par défaut
  const defaultLeftElement = (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 15 }}
      style={{ flexDirection: "row", alignItems: "center" }}
    >
      <LinearGradient
        colors={[theme.primary, theme.secondary || theme.primary]}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 8,
        }}
      >
        <MaterialCommunityIcons name="home-variant" size={20} color="white" />
      </LinearGradient>
      <ThemedText
        style={{
          fontSize: 22,
          fontWeight: "800",
          color: theme.primary,
          letterSpacing: -0.5,
        }}
      >
        EasyRent
      </ThemedText>
    </MotiView>
  );

  // Élément par défaut à droite
  const defaultRightElement = (
    <ThemedView style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: theme.surfaceVariant,
 }}>
      {/* Notification */}
      <MotiView
        from={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 200, type: "spring" }}
      >
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.outline,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: theme.outline,
          }}
        >
          <Ionicons name="notifications-outline" size={20} color={theme.primary} />
          <ThemedView
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: theme.error,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ThemedText style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>3</ThemedText>
          </ThemedView>
        </TouchableOpacity>
      </MotiView>

      {/* Menu transaction */}
      <ThemedView style={{ zIndex: 9999, elevation: 9999 ,backgroundColor: theme.surfaceVariant }}>
        <MotiView
          from={{ opacity: 0, translateX: 20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ delay: 300, type: "spring" }}
        >
          <TouchableOpacity
            onPress={toggleMenu}
            style={[
              styles.menuButton,
              {
                backgroundColor: theme.primary,
                borderColor: theme.primary,
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              },
            ]}
            activeOpacity={0.9}
          >
            <ThemedText
              style={{ color: "white", fontWeight: "700", fontSize: 13 }}
            >
              {selectedTransaction === "VENTE" ? "Vente" : "Location"}
            </ThemedText>
            <Ionicons
              name={menuOpen ? "chevron-up" : "chevron-down"}
              size={16}
              color="white"
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        </MotiView>

        {/* Menu popup */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <Pressable
                onPress={() => setMenuOpen(false)}
                style={styles.overlay}
              />

              <MotiView
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "timing", duration: 150 }}
                style={[
                  styles.popupMenu,
                  {
                    backgroundColor: theme.surfaceVariant,
                    shadowColor: theme.shadowColor || "#000",
                    borderColor: theme.outline,
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleSelect("VENTE")}
                  style={styles.menuItem}
                  activeOpacity={0.7}
                >
                  <ThemedText
                    style={{
                      color:
                        selectedTransaction === "VENTE"
                          ? theme.primary
                          : theme.typography.body,
                      fontWeight:
                        selectedTransaction === "VENTE" ? "700" : "400",
                    }}
                  >
                    Vente
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleSelect("LOCATION")}
                  style={styles.menuItem}
                  activeOpacity={0.7}
                >
                  <ThemedText
                    style={{
                      color:
                        selectedTransaction === "LOCATION"
                          ? theme.primary
                          : theme.typography.body,
                      fontWeight:
                        selectedTransaction === "LOCATION" ? "700" : "400",
                    }}
                  >
                    Location
                  </ThemedText>
                </TouchableOpacity>
              </MotiView>
            </>
          )}
        </AnimatePresence>
      </ThemedView>
    </ThemedView>
  );

  return (
    <SafeAreaView
      style={{
        paddingTop: Platform.OS === "android" ? statusBarHeight : 70,
        zIndex: 9998,
        elevation: 9998,
      }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={Platform.OS === "android"}
      />
      <BlurView intensity={95} tint="light" style={{ borderRadius: 0 }}>
        <LinearGradient
          colors={[theme.surface + "F0", theme.surfaceVariant + "E0"]}
          style={[
            {
              paddingTop: insets.top > 0 ? 0 : 8,
              paddingBottom: 12,
              paddingHorizontal: 16,
              zIndex: 9998,
              elevation: 9998,
              borderBottomWidth: 1,
              borderBottomColor: theme.outline + "30",
            },
            style,
          ]}
        >
          <ThemedView
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              zIndex: 9998,
              elevation: 9998,
              backgroundColor: "transparent",
            }}
          >
            {leftElement !== undefined ? leftElement : defaultLeftElement}
            {rightElement !== undefined ? rightElement : defaultRightElement}
          </ThemedView>
        </LinearGradient>
      </BlurView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  overlay: {
    position: "absolute",
    top: 35,
    left: -200,
    right: -200,
    bottom: -500,
    backgroundColor: "transparent",
    zIndex: 9998,
  },
  popupMenu: {
    position: "absolute",
    top: 45,
    right: 0,
    width: 120,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 4,
    zIndex: 9999,
    elevation: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
});

export default Header;
