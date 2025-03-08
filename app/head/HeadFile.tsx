

import { View, Text, StyleSheet } from "react-native";
import EvilIcons from "@expo/vector-icons/EvilIcons";
// import LinearGradient from "react-native-linear-gradient";

const Header = () => {
  return (
    <View style={styles.container}>
      {/* Gradient en arrière-plan */}
      {/* <LinearGradient
        colors={["#FFFFFF", "#0000FF"]} // Dégradé blanc → bleu
        style={styles.gradient}
      /> */}

      {/* Contenu du header */}
      <View style={styles.head}>
        <Text style={styles.message}>Discover</Text>
        <EvilIcons name="search" size={40} color="black" style={styles.icon} />
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    height: 100, // Hauteur du header
    width: "100%", // Prend toute la largeur

  },

//   gradient: {
//     ...StyleSheet.absoluteFillObject, // Remplit tout le `container`
//   },

  head: {
    flexDirection: "row",
    paddingHorizontal: 10,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 40, // Pour éviter l’encoche sur les téléphones récents
  },

  message: {
    fontSize: 30,
    color: "red",
    fontWeight: "bold",
  },

  icon: {
    marginRight: 8,
  },
});
