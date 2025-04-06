import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type ServicesProps = {
  activeContracts: string[];
  onSignContract: (serviceKey: string) => void;
};

const Services = ({ activeContracts = [], onSignContract }: ServicesProps) => {
  const navigation = useNavigation();

  const services = [
    {
      key: 'telemedicine',
      title: 'Téléconsultation Médicale',
      description: 'Consultations à distance avec des médecins disponibles 24/7.',
      icon: 'medical-bag',
      action: () => navigation.navigate('Telemedicine'),
    },
    {
      key: 'insurance',
      title: 'Assurance Santé',
      description: 'Souscris à une assurance santé pour ta tranquillité d’esprit.',
      icon: 'shield-check',
      action: () => navigation.navigate('Insurance'),
    },
    {
      key: 'delivery',
      title: 'Assistance Domicile',
      description: 'Services de dépannage à domicile disponibles à tout moment.',
      icon: 'wrench',
      action: () => navigation.navigate('Assistance'),
    },
    {
      key: 'moving',
      title: 'Aide au Déménagement',
      description: 'Partenariats avec des services de déménagement et installation.',
      icon: 'truck-fast',
      action: () => navigation.navigate('Moving'),
    },
    {
      key: 'security',
      title: 'Sécurité à Domicile',
      description: 'Système de sécurité intelligent pour une maison sûre.',
      icon: 'security',
      action: () => navigation.navigate('Security'),
    },
    {
      key: 'wellness',
      title: 'Bien-être et Relaxation',
      description: 'Séances de méditation et de yoga en ligne pour ton bien-être.',
      icon: 'spa',
      action: () => navigation.navigate('Wellness'),
    },
  ];

  return (
    <ScrollView className="flex bg-gray-100 p-3">
      {services.map((service, index) => (
        <TouchableOpacity
          key={index}
          onPress={service.action}
          className="bg-white p-5 rounded-lg shadow-lg mb-4 transform transition-all duration-300 hover:scale-105"
        >
          <View className="flex-row items-center space-x-4">
            <MaterialCommunityIcons
              name={service.icon}
              size={40}
              color="#4A90E2"
              style={{
                padding: 5,
                backgroundColor: '#E6F0FF',
                borderRadius: 10,
                marginRight: 6,
              }}
            />
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">{service.title}</Text>
              <Text className="text-sm text-gray-600 mt-1">{service.description}</Text>
            </View>
            {activeContracts.includes(service.key) ? (
              <Text className="text-sm text-green-500">Contrat signé</Text>
            ) : (
              <TouchableOpacity
                onPress={() => onSignContract(service.key)}
                className="bg-blue-500 p-2 rounded-lg text-white text-sm"
              >
                Signer le contrat
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default Services;


