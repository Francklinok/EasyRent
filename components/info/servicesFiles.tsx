


 import React from 'react';
 import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
 import { useNavigation } from '@react-navigation/native';
 
 const Services = () => {
   const navigation = useNavigation();
 
   // Services data
   const services = [
     {
       title: 'Téléconsultation Médicale',
       description: 'Consultations à distance avec des médecins disponibles 24/7.',
    //    icon: require('@/assets/images/telemedicine.svg'),
    //    action: () => navigation.navigate('Telemedicine')
     },
     {
       title: 'Assurance Santé',
       description: 'Souscris à une assurance santé pour ta tranquillité d’esprit.',
    //    icon: require('@/assets/images/insurance.jpg'),
    //    action: () => navigation.navigate('Insurance')
     },
     {
       title: 'Assistance Domicile',
       description: 'Services de dépannage à domicile disponibles à tout moment.',
    //    icon: require('@/assets/images/assistance.png'),
    //    action: () => navigation.navigate('Assistance')
     },
     {
       title: 'Aide au Déménagement',
       description: 'Partenariats avec des services de déménagement et installation.',
    //    icon: require('@/assets/images/demenagement.png'),
    //    action: () => navigation.navigate('Moving')
     },
     {
       title: 'Sécurité à Domicile',
       description: 'Système de sécurité intelligent pour une maison sûre.',
    //    icon: require('@/assets/images/security.png'),
    //    action: () => navigation.navigate('Security')
     },
     {
       title: 'Bien-être et Relaxation',
       description: 'Séances de méditation et de yoga en ligne pour ton bien-être.',
    //    icon: require('@/assets/wellness.png'),
    //    action: () => navigation.navigate('Wellness')
     }
   ];
 
   return (
     <ScrollView className="bg-gray-100 p-4">
       <Text className="text-center text-2xl font-bold text-blue-600 mb-6">Nos Services</Text>
 
       {services.map((service, index) => (
         <TouchableOpacity
           key={index}
        //    onPress={service.action}
           className="bg-white p-4 rounded-lg shadow-md mb-4"
         >
           <View className="flex-row items-center">
             {/* <Image source={service.icon} className="w-12 h-12 mr-4" /> */}
             <View>
               <Text className="text-lg font-semibold text-gray-800">{service.title}</Text>
               <Text className="text-sm text-gray-600">{service.description}</Text>
             </View>
           </View>
         </TouchableOpacity>
       ))}
     </ScrollView>
   );
 };
 
 export default Services;
 