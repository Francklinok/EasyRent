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
import Svg, {
  Text as SvgText,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";
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
    <Svg height="35" width="150">
      <Defs>
        <SvgLinearGradient id="textGradient" x1="0" y1="1" x2="1" y2="0">
          <Stop offset="0" stopColor="#88B4DB" stopOpacity="1" />
          <Stop offset="1" stopColor="green" stopOpacity="0.5" />
        </SvgLinearGradient>
      </Defs>
      <SvgText
        x="8"
        y="25"
        fontSize="25"
        fontWeight="bold"
        fill="url(#textGradient)"
      >
        EasyRent
      </SvgText>
    </Svg>
  );

  // Élément par défaut à droite
  const defaultRightElement = (
    <ThemedView style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
      {/* Notification */}
      <ThemedView>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={20} color={theme.star} />
        </TouchableOpacity>
        <ThemedView style={{ position: "absolute", top: 2, right: 2 }}>
          <NotificationBadge count={1} />
        </ThemedView>
      </ThemedView>

      {/* Menu transaction */}
      <ThemedView style={{ zIndex: 9999, elevation: 9999 }}>
        <TouchableOpacity
          onPress={toggleMenu}
          style={[
            styles.menuButton,
            { backgroundColor: theme.surface, borderColor: theme.outline },
          ]}
          activeOpacity={0.8}
        >
          <ThemedText
            style={{ color: theme.primary, fontWeight: "600", fontSize: 14 }}
          >
            {selectedTransaction === "VENTE" ? "Vente" : "Location"}
          </ThemedText>
          <Ionicons
            name={menuOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color={theme.primary}
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>

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
        height: 90,
      }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={Platform.OS === "android"}
      />
      <ThemedView
        style={[
          {
            paddingTop: insets.top > 0 ? 0 : 8,
            height: 60,
            paddingHorizontal: 15,
            zIndex: 9998,
            elevation: 9998,
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
          }}
        >
          {leftElement !== undefined ? leftElement : defaultLeftElement}
          {rightElement !== undefined ? rightElement : defaultRightElement}
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
    top: 0,
    right: 80,
    width: 90,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 1,
    zIndex: 9999,
    elevation: 10,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  menuItem: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
});

export default Header;
