

// import React from 'react';
// import { View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar } from 'react-native';
// import Octicons from '@expo/vector-icons/Octicons';
// import AntDesign from '@expo/vector-icons/AntDesign';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { useNavigation } from '@react-navigation/native';
// import { useRouter } from 'expo-router';

// type RootStackParamList = {
//   InfoHead: undefined;
//   Criteria: undefined;
//   Atout: undefined;
//   Equipment: undefined;
//   Services: undefined;
// };

// type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// const InfoHead = () => {
//   const router = useRouter();

//   // const navigation = useNavigation<NavigationProp>();

//   return (
//     <SafeAreaView className="bg-white" style={{ paddingTop: StatusBar.currentHeight }}>
//       <StatusBar barStyle="dark-content" backgroundColor="white" />
//       <View className="flex flex-col gap-4">
//         {/* En-tête avec avatar, nom et icônes */}
//         <View className="flex-row p-4 justify-between bg-white shadow-md rounded-t-lg">
//           {/* Partie Avatar à gauche */}
//           <View className="p-2">
//             <Image 
//               // Remplacez par la source réelle ou utilisez le commentaire pour passer par props
//               source={{ uri: 'https://via.placeholder.com/150' }}
//               className="w-12 h-12 rounded-full mr-4" 
//             />
//           </View>

//           {/* Partie Nom au centre */}
//           <View className="flex flex-col justify-center">
//             <Text className="text-lg font-semibold">Jacques</Text> 
//             <Text className="text-[12px] font-semibold">
//               Taux de réponse{' '}
//               <Text className="text-green-600 text-[14px] font-bold">100%</Text>
//             </Text> 
//           </View>

//           {/* Partie Icônes à droite */}
//           <View className="flex flex-row gap-6 items-center pr-5">
//             <Octicons name="verified" size={24} color="black" />
//             <AntDesign name="message1" size={24} color="black" />
//           </View>
//         </View>

//         {/* Boutons de navigation pour les différents critères */}
//         <View className="flex flex-col p-2">
//           <View className="flex flex-row gap-2 mb-2">
//             <View className="flex flex-row gap-4">
//             <TouchableOpacity onPress={() => router.push('./info/index')}>
//               <Text className="text-[14px] rounded-[20px] p-2 bg-gray-100">
//                 Description générale
//               </Text>
//               </TouchableOpacity>

//             </View>
//             <View className="flex flex-row gap-4">
//               <TouchableOpacity onPress={() => router.push('./info/crireria')}>
//                 <Text className="text-[14px] rounded-[20px] p-2 bg-gray-100">
//                   Critère de logement
//                 </Text>
//               </TouchableOpacity>
//             </View>
//             <View className="flex flex-row gap-4">
//               <TouchableOpacity onPress={() => router.push('./info/atoutFils')}>
//                 <Text className="text-[14px] rounded-[20px] p-2 bg-gray-100">
//                   Atout du logement
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//           <View className="flex flex-row">
//             <View className="flex flex-row gap-4 mb-2">
//               <TouchableOpacity onPress={() => router.push('./info/equipmentFiles')}>
//                 <Text className="text-[14px] rounded-[20px] p-2 bg-gray-100">
//                   Équipement
//                 </Text>
//               </TouchableOpacity>
//             </View>
//             <View className="flex flex-row gap-4 mb-2">
//               <TouchableOpacity onPress={() => router.push('./info/servicesFile')}>
//                 <Text className="text-[14px] rounded-[20px] p-2 bg-gray-100">
//                   Service
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default InfoHead;
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar } from 'react-native';
import Octicons from '@expo/vector-icons/Octicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';

const InfoHead = () => {
  const router = useRouter();
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  const handleClick = (component: string) => {
    setActiveComponent(component);
    router.push(`./info/${component}`);
  };

  return (
    <SafeAreaView className="bg-white" style={{ paddingTop: StatusBar.currentHeight }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View className="flex flex-col gap-4">
        {/* En-tête avec avatar, nom et icônes */}
        <View className="flex-row p-4 justify-between bg-white shadow-md rounded-t-lg">
          {/* Partie Avatar à gauche */}
          <View className="p-2">
            <Image 
              source={{ uri: 'https://via.placeholder.com/150' }}
              className="w-12 h-12 rounded-full mr-4" 
            />
          </View>

          {/* Partie Nom au centre */}
          <View className="flex flex-col justify-center">
            <Text className="text-lg font-semibold">Jacques</Text> 
            <Text className="text-[12px] font-semibold">
              Taux de réponse{' '}
              <Text className="text-green-600 text-[14px] font-bold">100%</Text>
            </Text> 
          </View>

          {/* Partie Icônes à droite */}
          <View className="flex flex-row gap-6 items-center pr-5">
            <Octicons name="verified" size={24} color="black" />
            <AntDesign name="message1" size={24} color="black" />
          </View>
        </View>

        {/* Boutons de navigation pour les différents critères */}
        <View className="flex flex-col p-2">
          <View className="flex flex-row gap-2 mb-2">
            <TouchableOpacity 
              onPress={() => handleClick('index')}
              style={{
                backgroundColor: activeComponent === 'index' ? '#e0e0e0' : '#f5f5f5',
              }}
            >
              <Text className="text-[14px] rounded-[20px] p-2">
                Description générale
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => handleClick('criteria')}
              style={{
                backgroundColor: activeComponent === 'criteria' ? '#e0e0e0' : '#f5f5f5',
              }}
            >
              <Text className="text-[14px] rounded-[20px] p-2">
                Critère de logement
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => handleClick('atoutFils')}
              style={{
                backgroundColor: activeComponent === 'atoutFils' ? '#e0e0e0' : '#f5f5f5',
              }}
            >
              <Text className="text-[14px] rounded-[20px] p-2">
                Atout du logement
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex flex-row gap-4 mb-2">
            <TouchableOpacity 
              onPress={() => handleClick('equipmentFiles')}
              style={{
                backgroundColor: activeComponent === 'equipmentFiles' ? '#e0e0e0' : '#f5f5f5',
              }}
            >
              <Text className="text-[14px] rounded-[20px] p-2">
                Équipement
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => handleClick('servicesFile')}
              style={{
                backgroundColor: activeComponent === 'servicesFile' ? '#e0e0e0' : '#f5f5f5',
              }}
            >
              <Text className="text-[14px] rounded-[20px] p-2">
                Service
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default InfoHead;
