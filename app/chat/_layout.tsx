// import { Stack } from "expo-router";

// export default function OnboardingLayout() {
//   const screenOptions = {
//     headerShown: false,
//   };
//   return <Stack screenOptions={screenOptions} />;
// }
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet } from "react-native";

export default function ChatLayout() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header personnalisé */}
      {/* <CustomHeader /> */}

      {/* Stack pour la navigation */}
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Adapte selon ton design
  },
  content: {
    flex: 1, 
    marginTop: 0, // Gère bien l'espace sous le header
  },
});
