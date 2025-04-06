
import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
// Import Lucide React Native icons properly
import { ChevronRight, Calendar as CalendarIcon, CreditCard, Package, Bell, Shield, Video, Home } from 'lucide-react-native';
import Services from '../info/servicesFiles';
import Header from '../head/HeadFile';

// Define proper TypeScript interfaces
interface PaymentHistory {
  date: string;
  amount: number;
  status: string;
}

interface ApartmentDetails {
  address: string;
  leaseStart: string;
  leaseEnd: string;
  monthlyRent: number;
  nextPaymentDate: string;
  paymentHistory: PaymentHistory[];
}

interface DeliveryAddress {
  name: string;
  street: string;
  city: string;
  postalCode: string;
  specialInstructions: string;
}

interface Notification {
  id: number;
  date: string;
  title: string;
  message: string;
}

interface UserProfile {
  name: string;
  role: string;
  profilePic: string;
  contracts: string[];
  apartmentDetails: ApartmentDetails;
  deliveryAddress: DeliveryAddress;
  notifications: Notification[];
}

interface Service {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

// Enhanced user profile with additional information
const user: UserProfile = {
  name: 'Jean Dupont',
  role: 'Locataire',
  profilePic: 'https://randomuser.me/api/portraits/men/32.jpg',
  contracts: ['telemedicine', 'insurance'],
  apartmentDetails: {
    address: '123 Avenue République, Paris',
    leaseStart: '2025-01-15',
    leaseEnd: '2026-01-14',
    monthlyRent: 1250,
    nextPaymentDate: '2025-05-05',
    paymentHistory: [
      { date: '2025-04-05', amount: 1250, status: 'paid' },
      { date: '2025-03-05', amount: 1250, status: 'paid' },
      { date: '2025-02-05', amount: 1250, status: 'paid' },
    ]
  },
  deliveryAddress: {
    name: 'Jean Dupont',
    street: '123 Avenue République',
    city: 'Paris',
    postalCode: '75011',
    specialInstructions: 'Code: 1234, Étage 4, Appartement 402'
  },
  notifications: [
    { id: 1, date: '2025-04-01', title: 'Rappel Paiement', message: 'Le paiement de votre loyer est prévu pour le 5 avril.' },
    { id: 2, date: '2025-03-28', title: 'Inspection Annuelle', message: 'L\'inspection annuelle de l\'appartement est prévue pour le 15 avril.' }
  ]
};

// Available services data
const availableServices: Service[] = [
  { 
    id: 'telemedicine', 
    name: 'Télémédecine', 
    icon: <Video color="#4F46E5" size={24} />,
    description: 'Consultations médicales à distance avec nos médecins partenaires'
  },
  { 
    id: 'insurance', 
    name: 'Assurance Habitation', 
    icon: <Shield color="#4F46E5" size={24} />,
    description: 'Protection complète pour votre appartement et vos biens'
  },
  { 
    id: 'delivery', 
    name: 'Livraison à Domicile', 
    icon: <Package color="#4F46E5" size={24} />,
    description: 'Service de livraison prioritaire pour tous vos achats en ligne'
  },
  { 
    id: 'maintenance', 
    name: 'Service de Maintenance', 
    icon: <Home color="#4F46E5" size={24} />,
    description: 'Intervention rapide pour tout problème technique dans votre logement'
  }
];

const ProfileFile: React.FC = () => {
  const [contracts, setContracts] = useState<string[]>(user.contracts);
  const [showLeaseCalendar, setShowLeaseCalendar] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showServicesModal, setShowServicesModal] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Function to sign a contract and update state
  const handleSignContract = (serviceKey: string): void => {
    setContracts(prevContracts => [...prevContracts, serviceKey]);
  };

  // Get important lease dates for calendar marking
  const getMarkedDates = () => {
    const markedDates: Record<string, any> = {};
    
    // Lease start and end dates
    markedDates[user.apartmentDetails.leaseStart] = { 
      marked: true, 
      dotColor: '#4F46E5',
      selected: true,
      selectedColor: '#C7D2FE'
    };
    
    markedDates[user.apartmentDetails.leaseEnd] = { 
      marked: true, 
      dotColor: '#EF4444',
      selected: true,
      selectedColor: '#FEE2E2'
    };
    
    // Payment dates
    markedDates[user.apartmentDetails.nextPaymentDate] = { 
      marked: true, 
      dotColor: '#10B981',
      selected: true,
      selectedColor: '#D1FAE5'
    };
    
    // Add past payments
    user.apartmentDetails.paymentHistory.forEach(payment => {
      markedDates[payment.date] = { 
        marked: true, 
        dotColor: '#10B981',
        selected: true,
        selectedColor: '#D1FAE5' 
      };
    });
    
    return markedDates;
  };

  // Function to get service by ID
  const getServiceById = (id: string): Service | undefined => {
    return availableServices.find(service => service.id === id);
  };

  return (
    <ScrollView className="flex bg-white">
      <Header />
      
      {/* User Profile Section */}
      <View className="flex items-center mt-6 px-4">
        <Image
          source={{ uri: user.profilePic }}
          className="w-24 h-24 rounded-full border-4 border-indigo-500"
        />
        <Text className="text-xl font-bold mt-3">{user.name}</Text>
        <Text className="text-sm text-gray-500">{user.role}</Text>
        <Text className="text-sm text-gray-700 mt-2">{user.apartmentDetails.address}</Text>
      </View>

      {/* Quick Actions */}
      <View className="mt-6 px-4 flex flex-row justify-around">
        <TouchableOpacity 
          className="items-center" 
          onPress={() => setShowLeaseCalendar(true)}
        >
          <View className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center">
            <CalendarIcon color="#4F46E5" size={24} />
          </View>
          <Text className="text-xs mt-1 text-gray-700">Calendrier</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="items-center"
          onPress={() => setShowPaymentModal(true)}
        >
          <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center">
            <CreditCard color="#10B981" size={24} />
          </View>
          <Text className="text-xs mt-1 text-gray-700">Paiements</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
            <Bell color="#3B82F6" size={24} />
          </View>
          <Text className="text-xs mt-1 text-gray-700">Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="items-center"
          onPress={() => setShowServicesModal(true)}
        >
          <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center">
            <Package color="#8B5CF6" size={24} />
          </View>
          <Text className="text-xs mt-1 text-gray-700">Services</Text>
        </TouchableOpacity>
      </View>

      {/* Lease Information Card */} 

      <View className="mt-6 mx-4 bg-indigo-500 rounded-xl p-4 shadow-lg">
        <Text className="text-white font-semibold text-lg mb-2">Contrat de Location</Text>
        <View className="flex flex-row justify-between items-center mb-2">
          <Text className="text-indigo-100">Début du bail:</Text>
          <Text className="text-white font-medium">{user.apartmentDetails.leaseStart}</Text>
        </View>
        <View className="flex flex-row justify-between items-center mb-2">
          <Text className="text-indigo-100">Fin du bail:</Text>
          <Text className="text-white font-medium">{user.apartmentDetails.leaseEnd}</Text>
        </View>
        <View className="flex flex-row justify-between items-center">
          <Text className="text-indigo-100">Loyer mensuel:</Text>
          <Text className="text-white font-medium">{user.apartmentDetails.monthlyRent} €</Text>
        </View>
        <TouchableOpacity 
          className="mt-3 bg-white bg-opacity-20 py-2 rounded-lg items-center"
          onPress={() => setShowLeaseCalendar(true)}
        >
          <Text className="text-white font-medium">Voir Calendrier</Text>
        </TouchableOpacity>
      </View>

      {/* Active Services Section */}
      <View className="mt-6 px-4">
        <Text className="text-lg font-semibold text-indigo-600 mb-2">Vos Services Actifs</Text>
        <View className="bg-indigo-50 rounded-lg shadow-sm overflow-hidden">
          {contracts.length > 0 ? (
            contracts.map((contractId, index) => {
              const service = getServiceById(contractId);
              return service ? (
                <View key={index} className="flex flex-row items-center p-4 border-b border-indigo-100">
                  <View className="mr-3">
                    {service.icon}
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-800">{service.name}</Text>
                    <Text className="text-sm text-gray-600">{service.description}</Text>
                  </View>
                  <ChevronRight color="#6B7280" size={20} />
                </View>
              ) : null;
            })
          ) : (
            <View className="p-4">
              <Text className="text-gray-500 text-center">Aucun service actif</Text>
            </View>
          )}
        </View>
      </View>

      {/* Available Services Button */}
      <TouchableOpacity 
        className="mx-4 mt-4 mb-8 bg-indigo-600 py-3 rounded-lg items-center"
        onPress={() => setShowServicesModal(true)}
      >
        <Text className="text-white font-medium">Découvrir Tous les Services</Text>
      </TouchableOpacity>

      {/* Calendar Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showLeaseCalendar}
        onRequestClose={() => setShowLeaseCalendar(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-3xl p-5 h-2/3">
            <View className="flex flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">Calendrier du Bail</Text>
              <TouchableOpacity onPress={() => setShowLeaseCalendar(false)}>
                <Text className="text-indigo-600 font-medium">Fermer</Text>
              </TouchableOpacity>
            </View>
            
            <Calendar
              markedDates={getMarkedDates()}
              theme={{
                todayTextColor: '#4F46E5',
                arrowColor: '#4F46E5',
                dotColor: '#4F46E5',
                selectedDayBackgroundColor: '#4F46E5',
              }}
            />
            
            <View className="mt-4">
              <Text className="font-medium text-gray-800 mb-2">Dates importantes:</Text>
              <View className="flex flex-row items-center mb-1">
                <View className="w-3 h-3 rounded-full bg-indigo-600 mr-2" />
                <Text>Début du bail: {user.apartmentDetails.leaseStart}</Text>
              </View>
              <View className="flex flex-row items-center mb-1">
                <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                <Text>Fin du bail: {user.apartmentDetails.leaseEnd}</Text>
              </View>
              <View className="flex flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                <Text>Paiements du loyer</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPaymentModal}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-3xl p-5 h-2/3">
            <View className="flex flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">Paiements</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Text className="text-indigo-600 font-medium">Fermer</Text>
              </TouchableOpacity>
            </View>
            
            <View className="bg-green-50 p-4 rounded-lg mb-4">
              <Text className="text-sm text-gray-600">Prochain paiement</Text>
              <Text className="text-lg font-bold text-gray-800">{user.apartmentDetails.monthlyRent} € - {user.apartmentDetails.nextPaymentDate}</Text>
              <TouchableOpacity className="mt-2 bg-green-600 py-2 rounded-lg items-center">
                <Text className="text-white font-medium">Payer Maintenant</Text>
              </TouchableOpacity>
            </View>
            
            <Text className="font-medium text-gray-800 mb-2">Historique des paiements:</Text>
            <FlatList
              data={user.apartmentDetails.paymentHistory}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View className="flex flex-row justify-between items-center py-3 border-b border-gray-200">
                  <Text>{item.date}</Text>
                  <View className="flex flex-row items-center">
                    <Text className="font-medium mr-2">{item.amount} €</Text>
                    <View className="px-2 py-1 bg-green-100 rounded">
                      <Text className="text-xs text-green-800">Payé</Text>
                    </View>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Services Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showServicesModal}
        onRequestClose={() => setShowServicesModal(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-3xl p-5 h-3/4">
            <View className="flex flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">Tous les Services</Text>
              <TouchableOpacity onPress={() => setShowServicesModal(false)}>
                <Text className="text-indigo-600 font-medium">Fermer</Text>
              </TouchableOpacity>
            </View>
            
            {availableServices.map((service) => {
              const isActive = contracts.includes(service.id);
              
              return (
                <TouchableOpacity 
                  key={service.id}
                  className={`mb-3 p-4 rounded-lg ${isActive ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50 border border-gray-200'}`}
                  onPress={() => {
                    if (!isActive) {
                      setSelectedService(service);
                      setShowServicesModal(false);
                      // Show confirmation dialog here in a real app
                      handleSignContract(service.id);
                    }
                  }}
                >
                  <View className="flex flex-row items-center">
                    <View className="mr-3">
                      {service.icon}
                    </View>
                    <View className="flex-1">
                      <Text className="font-medium text-gray-800">{service.name}</Text>
                      <Text className="text-sm text-gray-600">{service.description}</Text>
                    </View>
                    {isActive ? (
                      <View className="px-2 py-1 bg-indigo-100 rounded">
                        <Text className="text-xs text-indigo-800">Actif</Text>
                      </View>
                    ) : (
                      <View className="px-2 py-1 bg-gray-200 rounded">
                        <Text className="text-xs text-gray-800">Souscrire</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default ProfileFile;