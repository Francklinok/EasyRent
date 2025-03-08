
// import { View, Text, StyleSheet, FlatList, Image } from "react-native";
// import data from "./data"; // Assurez-vous que le fichier "data.js" ou "data.ts" existe et est correct
// // import tw from "twrnc"; // Importation de twrnc

// const FirstSection = () => {
//   return (
//     <View className = 'bg-red-00'>
//       <FlatList
//         data={data}
//         keyExtractor={(item, index) => index.toString()}
//         renderItem={({ item }) => (
//           <View >
//             {/* Affichage de l'image avec require() */}
//             <Image source={item.avatar}/>
//             <View >
//               <Text>{item.location}</Text>
//               <Text>{item.price}</Text>
//               <Text>{item.availibilty}</Text>
//               <Text>{item.stars}</Text>
//             </View>
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// export default FirstSection;

// // // // const styles = StyleSheet.create({
// // // //   itemContainer: {
// // // //     marginBottom: 20, // Espacement entre les éléments
// // // //     alignItems: 'center', // Centrer l'image
// // // //     paddingHorizontal: 0, // Ajouter un peu d'espace autour du contenu
// // // //   },
// // // //   image: {
// // // //     width: 350,  // Taille de l'image
// // // //     height: 250, // Taille de l'image
// // // //     borderRadius: 20, // Rendre l'image ronde
// // // //     objectFit:'cover',
// // // //   },
// // // //   textContainer: {
// // // //     backgroundColor:'red',
// // // //     flexDirection:'row',
// // // //     justifyContent:"space-between",
// // // //     marginTop: 10, 
// // // //     padding:10,
// // // //     width:300, 
// // // //     fontSize:16,
// // // //     fontFamily:"Roboto",
// // // //     fontWeight:800,
// // // //   },
// // // // });
// // // import { View, Text, FlatList, Image } from "react-native";
// // // import tw from "twrnc"; // Importation de twrnc
// // // import data from "./data"; // Assurez-vous que le fichier "data.ts" est correct

// // // const FirstSection = () => {
// // //   return (
// // //     <View style={tw`p-4`}>
// // //       <FlatList
// // //         data={data}
// // //         keyExtractor={(item, index) => index.toString()}
// // //         renderItem={({ item }) => (
// // //           <View style={tw`mb-5 bg-white p-4 rounded-xl shadow-lg`}>
// // //             {/* Image */}
// // //             <Image source={item.avatar} style={tw`w-80 h-60 rounded-lg`} />
            
// // //             {/* Texte */}
// // //             <View style={tw`mt-4`}>
// // //               <Text style={tw`text-lg font-bold text-gray-800`}>{item.location}</Text>
// // //               <Text style={tw`text-gray-600`}>{item.price}</Text>
// // //               <Text style={tw`text-gray-500`}>{item.availibilty}</Text>
// // //               <Text style={tw`text-yellow-500 text-lg`}>⭐ {item.stars}</Text>
// // //             </View>
// // //           </View>
// // //         )}
// // //       />
// // //     </View>
// // //   );
// // // };

// // // export default FirstSection;
// // import { View, Text, Image, FlatList } from "react-native";
// // import { create } from "tailwindcss-react-native"; // Import Tailwind

// // const tw = create(); // Initialiser Tailwind

// // import data from "./data"; // Assurez-vous que le fichier "data.ts" est correct

// // const FirstSection = () => {
// //   return (
// //     <View style={tw`p-4`}>
// //       <FlatList
// //         data={data}
// //         keyExtractor={(item, index) => index.toString()}
// //         renderItem={({ item }) => (
// //           <View style={tw`mb-5 bg-white p-4 rounded-xl shadow-lg`}>
// //             {/* Image */}
// //             <Image source={item.avatar} style={tw`w-80 h-60 rounded-lg`} />
            
// //             {/* Texte */}
// //             <View style={tw`mt-4`}>
// //               <Text style={tw`text-lg font-bold text-gray-800`}>{item.location}</Text>
// //               <Text style={tw`text-gray-600`}>{item.price}</Text>
// //               <Text style={tw`text-gray-500`}>{item.availibilty}</Text>
// //               <Text style={tw`text-yellow-500 text-lg`}>⭐ {item.stars}</Text>
// //             </View>
// //           </View>
// //         )}
// //       />
// //     </View>
// //   );
// // };

// // export default FirstSection;
import React from "react";
import { View, Text, FlatList, Image } from "react-native";
import data from "../../components/data/data"; // Assurez-vous que le fichier "data.js" ou "data.ts" existe et est correct

const FirstSection = () => {
  return (
    <View className="bg-red-800">
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View className="mb-5 p-4 bg-white rounded-xl shadow-lg">
            {/* Affichage de l'image avec require() */}
            <Image source={item.avatar} className="w-80 h-60 rounded-lg" />
            <View className="mt-4">
              <Text className="text-lg font-bold text-gray-800">{item.location}</Text>
              <Text className="text-gray-600">{item.price}</Text>
              <Text className="text-gray-500">{item.availibilty}</Text>
              <Text className="text-yellow-500 text-lg">⭐ {item.stars}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default FirstSection;
