import { useTheme } from "../../../autre/info/Theme";
import { Modal, View, StyleSheet } from "react-native";
import { ThemedCard } from "./ThemeCard";
import { ThemeSelector } from "../../../autre/info/Theme";

type ThemeSelectorModalProps = {
  visible: boolean;
  onClose: () => void;
} & Omit<ThemeSelectorProps, 'onClose'>;

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  visible,
  onClose,
  ...props
}) => {
  const { theme } = useTheme();
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ThemedCard
          style={styles.modalContent}
          withShadow
        >
          <ThemeSelector onClose={onClose} {...props} />
        </ThemedCard>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  modalContent: {
    width: width > 500 ? 480 : width - 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
