import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from "react-native";
import {
  Shield,
  Wallet,
  ArrowLeft,
  History,
  Fingerprint,
  Key,
  DollarSign,
  Bell,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react-native";
import { useTheme } from "@/components/contexts/theme/themehook";
import { ThemedView } from "../ui/ThemedView";
import { ThemedText } from "../ui/ThemedText";

const currencies = ["EUR", "USD", "GBP", "JPY"];
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

type Props = {
  setCurrentSection: (section: string) => void;
  selectedCurrency: string;
  setSelectedCurrency: React.Dispatch<React.SetStateAction<string>>;
};

const RenderSecuritySettings: React.FC<Props> = ({
  setCurrentSection,
  selectedCurrency,
  setSelectedCurrency,
}) => {
  const { theme } = useTheme();

  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (modalType: string) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const renderSecurityContent = () => (
    <>
      {/* 2FA */}
      <ThemedView variant="surface" style={styles.securityItem} bordered>
        <ThemedView style={styles.securityItemHeader}>
          <Shield size={20} color={theme.primary} />
          <ThemedText
            type="title"
            style={[styles.securityItemTitle, { color: theme.onSurface }]}
          >
            Authentification à deux facteurs
          </ThemedText>
        </ThemedView>
        <ThemedText
          style={[styles.securityItemDescription, { color: theme.onSurface }]}
        >
          Renforcez la sécurité de votre compte en ajoutant une deuxième
          couche d'authentification.
        </ThemedText>
      </ThemedView>

      {/* Biométrie */}
      <ThemedView variant="surface" style={styles.securityItem} bordered>
        <ThemedView style={styles.securityItemHeader}>
          <Fingerprint size={20} color={theme.accent} />
          <ThemedText
            type="title"
            style={[styles.securityItemTitle, { color: theme.onSurface }]}
          >
            Authentification biométrique
          </ThemedText>
        </ThemedView>
        <ThemedText
          style={[styles.securityItemDescription, { color: theme.onSurface }]}
        >
          Utilisez votre empreinte digitale ou reconnaissance faciale pour
          accéder rapidement à votre portefeuille.
        </ThemedText>
      </ThemedView>

      {/* Code PIN */}
      <ThemedView variant="surface" style={styles.securityItem} bordered>
        <ThemedView style={styles.securityItemHeader}>
          <Key size={20} color={theme.secondary} />
          <ThemedText
            type="title"
            style={[styles.securityItemTitle, { color: theme.onSurface }]}
          >
            Code PIN de sécurité
          </ThemedText>
        </ThemedView>
        <ThemedText
          style={[styles.securityItemDescription, { color: theme.onSurface }]}
        >
          Définissez un code PIN pour sécuriser les transactions.
        </ThemedText>
      </ThemedView>
    </>
  );

  const renderCurrencyContent = () => (
    <ThemedView variant="surface" style={styles.securityItem} bordered>
      <ThemedText
        style={[
          styles.securityItemDescription,
          { color: theme.onSurface },
        ]}
      >
        Choisissez votre devise par défaut :
      </ThemedText>
      <View style={styles.currencySelector}>
        {currencies.map((currency) => (
          <TouchableOpacity
            key={currency}
            onPress={() => setSelectedCurrency(currency)}
            style={[
              styles.currencyOption,
              {
                backgroundColor:
                  selectedCurrency === currency
                    ? theme.primary
                    : "transparent",
                borderColor: theme.outline,
              },
            ]}
          >
            <Text
              style={{
                color:
                  selectedCurrency === currency
                    ? "#fff"
                    : theme.onSurface,
              }}
            >
              {currency}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ThemedView>
  );

  const renderNotificationsContent = () => (
    <ThemedView variant="surface" style={styles.securityItem} bordered>
      <ThemedText
        style={[styles.securityItemDescription, { color: theme.onSurface }]}
      >
        Paramètres de notifications à venir.
      </ThemedText>
    </ThemedView>
  );

  const getModalTitle = () => {
    switch (activeModal) {
      case "security":
        return "Sécurité et authentification";
      case "currency":
        return "Devise et préférences";
      case "notifications":
        return "Notifications";
      default:
        return "";
    }
  };

  const getModalContent = () => {
    switch (activeModal) {
      case "security":
        return renderSecurityContent();
      case "currency":
        return renderCurrencyContent();
      case "notifications":
        return renderNotificationsContent();
      default:
        return null;
    }
  };

  return (
    <ScrollView className="w-full h-full">
      <ThemedView variant="default" style={styles.sectionContainer}>
        <ThemedView style={styles.sectionHeader}>
          <TouchableOpacity
            onPress={() => setCurrentSection("main")}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color={theme.onSurface} />
          </TouchableOpacity>
          <ThemedText
            style={[styles.sectionHeaderTitle, { color: theme.onSurface }]}
          >
            Paramètres
          </ThemedText>
        </ThemedView>

        {/* Section Sécurité */}
        <TouchableOpacity
          onPress={() => openModal("security")}
          style={[styles.sectionToggle, { borderColor: theme.outline }]}
        >
          <Shield size={20} color={theme.primary} />
          <ThemedText style={{ flex: 1, marginLeft: 8, color: theme.onSurface }}>
            Sécurité et authentification
          </ThemedText>
          <ChevronDown size={20} color={theme.onSurface} />
        </TouchableOpacity>

        {/* Section Devise */}
        <TouchableOpacity
          onPress={() => openModal("currency")}
          style={[styles.sectionToggle, { borderColor: theme.outline }]}
        >
          <DollarSign size={20} color={theme.secondary} />
          <ThemedText style={{ flex: 1, marginLeft: 8, color: theme.onSurface }}>
            Devise et préférences
          </ThemedText>
          <ChevronDown size={20} color={theme.onSurface} />
        </TouchableOpacity>

        {/* Section Notifications */}
        <TouchableOpacity
          onPress={() => openModal("notifications")}
          style={[styles.sectionToggle, { borderColor: theme.outline }]}
        >
          <Bell size={20} color={theme.accent} />
          <ThemedText style={{ flex: 1, marginLeft: 8, color: theme.onSurface }}>
            Notifications
          </ThemedText>
          <ChevronDown size={20} color={theme.onSurface} />
        </TouchableOpacity>
      </ThemedView>

      {/* Modal */}
      <Modal
        visible={activeModal !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.surface }]}>
            <ThemedView style={styles.modalContent}>
              <ThemedView style={styles.modalHeader}>
                <ThemedText style={[styles.modalTitle, { color: theme.onSurface }]}>
                  {getModalTitle()}
                </ThemedText>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <X size={24} color={theme.onSurface} />
                </TouchableOpacity>
              </ThemedView>
              
              <ScrollView style={styles.modalScrollView}>
                {getModalContent()}
              </ScrollView>
            </ThemedView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  sectionToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  securityItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  securityItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  securityItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  securityItemDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  currencySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  currencyOption: {
    width: "23%",
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  // Styles pour la modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.8,
    borderRadius: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalScrollView: {
    flex: 1,
  },
});

export default RenderSecuritySettings;