import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { TouchableOpacity } from "react-native";
// import { MaterialCommunityIcons } from "@expo/vector-icons";

export function BackButton({ onBack }: { onBack?: () => void }) {
  return (
    <TouchableOpacity
      onPress={() => {
        if (onBack) {
          onBack();
        } else if (router.canGoBack()) {
          router.back();
        } else {
        //   router.replace("/auth");
        }
      }}
      style={{
        borderWidth: 2,
        borderColor: "#b8b8b7",
        borderRadius: 16,
        padding: 6,
      }}
    >
      <MaterialIcons name="keyboard-backspace" size={22} color={"#b8b8b7"} />
      {/* <MaterialCommunityIcons name="chevron-left" size={28} color="#111827" /> */}
    </TouchableOpacity>
  );
}