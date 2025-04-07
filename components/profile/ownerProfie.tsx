import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CreditCard, 
  Package, 
  Bell, 
  Home, 
  Users, 
  FilePlus, 
  Wrench , 
  MessageCircle 
} from 'lucide-react-native';
import Header from '../head/HeadFile';

// Interfaces
interface Property {
  id: string;
  address: string;
  type: 'apartment' | 'house' | 'commercial';
  area: number; // m²
  bedrooms?: number;
  status: 'occupied' | 'vacant' | 'maintenance';
  currentTenant?: Tenant | null;
  rentalAmount: number;
  lastInspection: string;
  nextInspection: string;
  maintenanceRequests: MaintenanceRequest[];
}

interface Tenant {
  id: string;
  name: string;
  profilePic: string;
  contactNumber: string;
  email: string;
  leaseStart: string;
  leaseEnd: string;
  paymentHistory: PaymentRecord[];
}

interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'late';
  method: string;
}

interface MaintenanceRequest {
  id: string;
  propertyId: string;
  date: string;
  description: string;
  status: 'new' | 'scheduled' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledDate?: string;
  estimatedCost?: number;
  completedDate?: string;
  feedback?: string;
}

interface Document {
  id: string;
  title: string;
  type: 'lease' | 'tax' | 'insurance' | 'maintenance' | 'inspection';
  relatedProperty?: string;
  date: string;
  fileUrl: string;
}

interface Notification {
  id: number;
  date: string;
  title: string;
  message: string;
  type: 'payment' | 'lease' | 'maintenance' | 'document' | 'general';
  read: boolean;
  propertyId?: string;
}

interface OwnerProfile {
  id: string;
  name: string;
  role: string;
  profilePic: string;
  contactNumber: string;
  email: string;
  properties: Property[];
  documents: Document[];
  notifications: Notification[];
  bankInfo: {
    bankName: string;
    accountNumber: string;
    taxId: string;
  };
}

// Owner profile data
const owner: OwnerProfile = {
  id: 'own-001',
  name: 'Sophie Martin',
  role: 'Propriétaire',
  profilePic: 'https://randomuser.me/api/portraits/women/45.jpg',
  contactNumber: '+33 6 12 34 56 78',
  email: 'sophie.martin@email.com',
  properties: [
    {
      id: 'prop-001',
      address: '123 Avenue République, Paris',
      type: 'apartment',
      area: 65,
      bedrooms: 2,
      status: 'occupied',
      currentTenant: {
        id: 'ten-001',
        name: 'Jean Dupont',
        profilePic: 'https://randomuser.me/api/portraits/men/32.jpg',
        contactNumber: '+33 6 98 76 54 32',
        email: 'jean.dupont@email.com',
        leaseStart: '2025-01-15',
        leaseEnd: '2026-01-14',
        paymentHistory: [
          { id: 'pay-001', date: '2025-04-05', amount: 1250, status: 'paid', method: 'Virement bancaire' },
          { id: 'pay-002', date: '2025-03-05', amount: 1250, status: 'paid', method: 'Virement bancaire' },
          { id: 'pay-003', date: '2025-02-05', amount: 1250, status: 'paid', method: 'Virement bancaire' },
        ]
      },
      rentalAmount: 1250,
      lastInspection: '2024-12-10',
      nextInspection: '2025-06-10',
      maintenanceRequests: [
        {
          id: 'maint-001',
          propertyId: 'prop-001',
          date: '2025-03-20',
          description: 'Problème de robinet qui fuit dans la salle de bain',
          status: 'completed',
          priority: 'medium',
          scheduledDate: '2025-03-22',
          estimatedCost: 120,
          completedDate: '2025-03-22',
          feedback: 'Réparation effectuée, pièce défectueuse remplacée'
        }
      ]
    },
    {
      id: 'prop-002',
      address: '45 Rue des Fleurs, Lyon',
      type: 'house',
      area: 120,
      bedrooms: 3,
      status: 'vacant',
      rentalAmount: 1850,
      lastInspection: '2025-02-15',
      nextInspection: '2025-05-15',
      maintenanceRequests: [
        {
          id: 'maint-002',
          propertyId: 'prop-002',
          date: '2025-02-20',
          description: 'Remise en état avant location - peinture et nettoyage',
          status: 'in-progress',
          priority: 'high',
          scheduledDate: '2025-04-10',
          estimatedCost: 1500
        }
      ]
    }
  ],
  documents: [
    { 
      id: 'doc-001', 
      title: 'Contrat de bail - Jean Dupont', 
      type: 'lease', 
      relatedProperty: 'prop-001', 
      date: '2025-01-15', 
      fileUrl: '/documents/lease_jdupont.pdf' 
    },
    { 
      id: 'doc-002', 
      title: 'Assurance Multirisque Habitation - 123 Ave République', 
      type: 'insurance', 
      relatedProperty: 'prop-001', 
      date: '2025-01-10', 
      fileUrl: '/documents/insurance_prop001.pdf' 
    },
    { 
      id: 'doc-003', 
      title: 'Déclaration revenus fonciers 2024', 
      type: 'tax', 
      date: '2025-04-01', 
      fileUrl: '/documents/tax_2024.pdf' 
    }
  ],
  notifications: [
    { 
      id: 1, 
      date: '2025-04-06', 
      title: 'Paiement reçu', 
      message: 'Le loyer de Jean Dupont a été reçu (1250€).', 
      type: 'payment', 
      read: false,
      propertyId: 'prop-001'
    },
    { 
      id: 2, 
      date: '2025-04-02', 
      title: 'Inspection à planifier', 
      message: 'N\'oubliez pas de planifier l\'inspection semestrielle pour la propriété de Lyon.', 
      type: 'maintenance',
      read: true,
      propertyId: 'prop-002'
    },
    { 
      id: 3, 
      date: '2025-03-30', 
      title: 'Demande de maintenance', 
      message: 'Nouvelle demande de maintenance pour la propriété de Paris: problème de chauffage.', 
      type: 'maintenance',
      read: true,
      propertyId: 'prop-001'
    }
  ],
  bankInfo: {
    bankName: 'Crédit Agricole',
    accountNumber: 'FR76 XXXX XXXX XXXX XXXX',
    taxId: '123456789012345'
  }
};

const OwnerProfileFile = () => {
  const [showPropertyModal, setShowPropertyModal] = useState<boolean>(false);
  const [showTenantModal, setShowTenantModal] = useState<boolean>(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState<boolean>(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Calculate total rental income
  const totalMonthlyIncome = owner?.properties.reduce((total, property) => {
    return property.status === 'occupied' ? total + property.rentalAmount : total;
  }, 0);

  // Filter properties by status
  const occupiedProperties = owner?.properties?.filter(property => property.status === 'occupied');
  const vacantProperties = owner?.properties?.filter(property => property.status === 'vacant');

  // Calculate occupancy rate
  const occupancyRate = owner?.properties?.length > 0 
    ? (occupiedProperties.length / owner?.properties?.length) * 100 
    : 0;

  // Get unread notifications count
  const unreadNotifications = owner?.notifications?.filter(notification => !notification.read).length;

  // Get active maintenance requests
  const activeMaintenanceRequests = owner?.properties
    .flatMap(property => property?.maintenanceRequests)
    .filter(request => request.status !== 'completed');

  const openPropertyDetails = (property: Property) => {
    setSelectedProperty(property);
    setShowPropertyModal(true);
  };

  const openTenantDetails = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowTenantModal(true);
  };

  return (
    <ScrollView className="flex bg-white">
      <Header />
      
      {/* Owner Profile Section */}
      <View className="flex items-center mt-6 px-4">
        <Image
          source={{ uri: owner?.profilePic }}
          className="w-24 h-24 rounded-full border-4 border-teal-500"
        />
        <Text className="text-xl font-bold mt-3">{owner?.name}</Text>
        <Text className="text-sm text-gray-500">{owner?.role}</Text>
        <Text className="text-sm text-gray-700 mt-2">{owner?.email}</Text>
      </View>

      {/* Quick Actions */}
      <View className="mt-6 px-4 flex flex-row justify-around">
        <TouchableOpacity className="items-center">
          <View className="w-12 h-12 bg-teal-100 rounded-full items-center justify-center">
            <Home color="#0D9488" size={24} />
          </View>
          <Text className="text-xs mt-1 text-gray-700">Propriétés</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
            <Users color="#3B82F6" size={24} />
          </View>
          <Text className="text-xs mt-1 text-gray-700">Locataires</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center" onPress={() => setShowDocumentsModal(true)}>
          <View className="w-12 h-12 bg-amber-100 rounded-full items-center justify-center">
            <FilePlus color="#D97706" size={24} />
          </View>
          <Text className="text-xs mt-1 text-gray-700">Documents</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center" onPress={() => setShowMaintenanceModal(true)}>
          <View className="w-12 h-12 bg-rose-100 rounded-full items-center justify-center">
            <Wrench  color="#E11D48" size={24} />
          </View>
          <Text className="text-xs mt-1 text-gray-700">Maintenance</Text>
        </TouchableOpacity>
      </View>

      {/* Dashboard Summary Card */}
      <View className="mt-6 mx-4 bg-teal-600 rounded-xl p-4 shadow-lg">
        <Text className="text-white font-semibold text-lg mb-2">Tableau de Bord</Text>
        
        <View className="flex flex-row justify-between items-center mb-2">
          <Text className="text-teal-100">Revenus mensuels:</Text>
          <Text className="text-white font-medium">{totalMonthlyIncome} €</Text>
        </View>
        
        <View className="flex flex-row justify-between items-center mb-2">
          <Text className="text-teal-100">Taux d'occupation:</Text>
          <Text className="text-white font-medium">{occupancyRate.toFixed(0)}%</Text>
        </View>
        
        <View className="flex flex-row justify-between items-center mb-2">
          <Text className="text-teal-100">Propriétés occupées:</Text>
          <Text className="text-white font-medium">{occupiedProperties.length}/{owner.properties.length}</Text>
        </View>
        
        <View className="flex flex-row justify-between items-center">
          <Text className="text-teal-100">Demandes de maintenance:</Text>
          <Text className="text-white font-medium">{activeMaintenanceRequests.length}</Text>
        </View>
      </View>

      {/* Properties Section */}
      <View className="mt-6 px-4">
        <Text className="text-lg font-semibold text-teal-600 mb-2">Vos Propriétés</Text>
        
        <View className="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
          {owner.properties.map((property, index) => (
            <TouchableOpacity 
              key={property.id}
              className="flex flex-row items-center p-4 border-b border-gray-200"
              onPress={() => openPropertyDetails(property)}
            >
              <View className={`w-3 h-3 rounded-full mr-3 ${
                property.status === 'occupied' ? 'bg-green-500' : 
                property.status === 'vacant' ? 'bg-amber-500' : 'bg-red-500'
              }`} />
              
              <View className="flex-1">
                <Text className="font-medium text-gray-800">{property?.address}</Text>
                <Text className="text-sm text-gray-600">
                  {property?.type === 'apartment' ? 'Appartement' : 
                   property?.type === 'house' ? 'Maison' : 'Local Commercial'} • {property?.area} m²
                  {property?.bedrooms ? ` • ${property?.bedrooms} chambres` : ''}
                </Text>
              </View>
              
              <View className="mr-2">
                <Text className="font-medium text-teal-600">{property?.rentalAmount} €</Text>
                <Text className="text-xs text-right text-gray-500">
                  {property?.status === 'occupied' ? 'Occupé' : 
                   property?.status === 'vacant' ? 'Vacant' : 'En maintenance'}
                </Text>
              </View>
              
              <ChevronRight color="#6B7280" size={20} />
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity className="mt-3 bg-teal-600 py-3 rounded-lg items-center">
          <Text className="text-white font-medium">Ajouter une propriété</Text>
        </TouchableOpacity>
      </View>

      {/* Tenant Section */}
      <View className="mt-6 px-4">
        <Text className="text-lg font-semibold text-teal-600 mb-2">Vos Locataires</Text>
        
        <View className="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
          {occupiedProperties.map((property) => 
            property.currentTenant ? (
              <TouchableOpacity 
                key={property.currentTenant.id}
                className="flex flex-row items-center p-4 border-b border-gray-200"
                onPress={() => openTenantDetails(property?.currentTenant!)}
              >
                <Image
                  source={{ uri: property?.currentTenant.profilePic }}
                  className="w-10 h-10 rounded-full mr-3"
                />
                
                <View className="flex-1">
                  <Text className="font-medium text-gray-800">{property?.currentTenant.name}</Text>
                  <Text className="text-sm text-gray-600">{property?.address}</Text>
                </View>
                
                <View className="mr-2">
                  <Text className="font-medium text-teal-600">{property?.rentalAmount} €</Text>
                  <Text className="text-xs text-right text-gray-500">
                    Bail: {property.currentTenant.leaseEnd.split('-')[0]}
                  </Text>
                </View>
                
                <ChevronRight color="#6B7280" size={20} />
              </TouchableOpacity>
            ) : null
          )}
          
          {occupiedProperties.length === 0 && (
            <View className="p-4">
              <Text className="text-gray-500 text-center">Aucun locataire actif</Text>
            </View>
          )}
        </View>
      </View>

      {/* Recent Notifications */}
      <View className="mt-6 px-4 mb-8">
        <View className="flex flex-row justify-between items-center mb-2">
          <Text className="text-lg font-semibold text-teal-600">Notifications Récentes</Text>
          {unreadNotifications > 0 && (
            <View className="bg-red-500 rounded-full px-2 py-1">
              <Text className="text-xs text-white font-medium">{unreadNotifications} nouvelles</Text>
            </View>
          )}
        </View>
        
        <View className="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
          {owner.notifications.slice(0, 3).map((notification) => (
            <View key={notification.id} className="p-4 border-b border-gray-200">
              <View className="flex flex-row justify-between">
                <Text className={`font-medium ${notification?.read ? 'text-gray-800' : 'text-teal-700'}`}>
                  {notification.title}
                </Text>
                <Text className="text-xs text-gray-500">{notification?.date}</Text>
              </View>
              <Text className="text-sm text-gray-600 mt-1">{notification?.message}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity className="mt-3 bg-gray-200 py-3 rounded-lg items-center">
          <Text className="text-gray-800 font-medium">Voir toutes les notifications</Text>
        </TouchableOpacity>
      </View>

      {/* Property Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPropertyModal}
        onRequestClose={() => setShowPropertyModal(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-3xl p-5 h-3/4">
            <View className="flex flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">Détails de la Propriété</Text>
              <TouchableOpacity onPress={() => setShowPropertyModal(false)}>
                <Text className="text-teal-600 font-medium">Fermer</Text>
              </TouchableOpacity>
            </View>
            
            {selectedProperty && (
              <ScrollView>
                <Text className="text-lg font-medium text-gray-800">{selectedProperty.address}</Text>
                <Text className="text-gray-600 mb-3">
                  {selectedProperty.type === 'apartment' ? 'Appartement' : 
                   selectedProperty.type === 'house' ? 'Maison' : 'Local Commercial'} • {selectedProperty.area} m²
                  {selectedProperty.bedrooms ? ` • ${selectedProperty.bedrooms} chambres` : ''}
                </Text>
                
                <View className="bg-gray-100 p-3 rounded-lg mb-4">
                  <View className="flex flex-row justify-between mb-1">
                    <Text className="text-gray-700">Statut:</Text>
                    <Text className={`font-medium ${
                      selectedProperty.status === 'occupied' ? 'text-green-600' : 
                      selectedProperty.status === 'vacant' ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {selectedProperty.status === 'occupied' ? 'Occupé' : 
                       selectedProperty.status === 'vacant' ? 'Vacant' : 'En maintenance'}
                    </Text>
                  </View>
                  
                  <View className="flex flex-row justify-between mb-1">
                    <Text className="text-gray-700">Loyer mensuel:</Text>
                    <Text className="font-medium text-gray-800">{selectedProperty.rentalAmount} €</Text>
                  </View>
                  
                  <View className="flex flex-row justify-between mb-1">
                    <Text className="text-gray-700">Dernière inspection:</Text>
                    <Text className="font-medium text-gray-800">{selectedProperty.lastInspection}</Text>
                  </View>
                  
                  <View className="flex flex-row justify-between">
                    <Text className="text-gray-700">Prochaine inspection:</Text>
                    <Text className="font-medium text-gray-800">{selectedProperty.nextInspection}</Text>
                  </View>
                </View>
                
                {selectedProperty.currentTenant && (
                  <View className="mb-4">
                    <Text className="text-lg font-medium text-gray-800 mb-2">Locataire actuel</Text>
                    <TouchableOpacity 
                      className="flex flex-row items-center p-3 bg-teal-50 rounded-lg"
                      onPress={() => {
                        setShowPropertyModal(false);
                        setSelectedTenant(selectedProperty.currentTenant!);
                        setShowTenantModal(true);
                      }}
                    >
                      <Image
                        source={{ uri: selectedProperty.currentTenant.profilePic }}
                        className="w-12 h-12 rounded-full mr-3"
                      />
                      
                      <View className="flex-1">
                        <Text className="font-medium text-gray-800">{selectedProperty.currentTenant.name}</Text>
                        <Text className="text-sm text-gray-600">
                          Bail: {selectedProperty.currentTenant.leaseStart} au {selectedProperty.currentTenant.leaseEnd}
                        </Text>
                      </View>
                      <ChevronRight color="#0D9488" size={20} />
                    </TouchableOpacity>
                  </View>
                )}
                
                <Text className="text-lg font-medium text-gray-800 mb-2">Demandes de maintenance</Text>
                {selectedProperty.maintenanceRequests.length > 0 ? (
                  selectedProperty.maintenanceRequests.map(request => (
                    <View key={request.id} className="p-3 bg-gray-100 rounded-lg mb-2">
                      <View className="flex flex-row justify-between">
                        <Text className="font-medium text-gray-800">{request.date}</Text>
                        <View className={`px-2 py-1 rounded ${
                          request?.status === 'new' ? 'bg-blue-100' : 
                          request?.status === 'scheduled' ? 'bg-amber-100' :
                          request?.status === 'in-progress' ? 'bg-orange-100' : 'bg-green-100'
                        }`}>
                          <Text className={`text-xs ${
                            request?.status === 'new' ? 'text-blue-800' : 
                            request?.status === 'scheduled' ? 'text-amber-800' :
                            request?.status === 'in-progress' ? 'text-orange-800' : 'text-green-800'
                          }`}>
                            {request?.status === 'new' ? 'Nouveau' : 
                             request?.status === 'scheduled' ? 'Planifié' :
                             request?.status === 'in-progress' ? 'En cours' : 'Complété'}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-gray-700 mt-1">{request?.description}</Text>
                      {request?.estimatedCost && (
                        <Text className="text-gray-600 mt-1">Coût estimé: {request?.estimatedCost} €</Text>
                      )}
                    </View>
                  ))
                ) : (
                  <Text className="text-gray-500 text-center p-3 bg-gray-100 rounded-lg">
                    Aucune demande de maintenance
                  </Text>
                )}
                
                <View className="flex flex-row justify-around mt-4 mb-6">
                  <TouchableOpacity className="bg-teal-600 py-3 px-4 rounded-lg flex-1 mr-2 items-center">
                    <Text className="text-white font-medium">Modifier</Text>
                  </TouchableOpacity>
                  
                  {selectedProperty?.status === 'vacant' && (
                    <TouchableOpacity className="bg-blue-600 py-3 px-4 rounded-lg flex-1 ml-2 items-center">
                      <Text className="text-white font-medium">Publier Annonce</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Tenant Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTenantModal}
        onRequestClose={() => setShowTenantModal(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-3xl p-5 h-3/4">
            <View className="flex flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">Détails du Locataire</Text>
              <TouchableOpacity onPress={() => setShowTenantModal(false)}>
                <Text className="text-teal-600 font-medium">Fermer</Text>
              </TouchableOpacity>
            </View>
            
            {selectedTenant && (
              <ScrollView>
                <View className="flex items-center mb-4">
                  <Image
                    source={{ uri: selectedTenant?.profilePic }}
                    className="w-20 h-20 rounded-full mb-2"
                  />
                  <Text className="text-lg font-medium text-gray-800">{selectedTenant?.name}</Text>
                </View>
                
                <View className="bg-gray-100 p-3 rounded-lg mb-4">
                  <View className="flex flex-row justify-between mb-1">
                    <Text className="text-gray-700">Email:</Text>
                    <Text className="font-medium text-gray-800">{selectedTenant?.email}</Text>
                  </View>
                  
                  <View className="flex flex-row justify-between mb-1">
                    <Text className="text-gray-700">Téléphone:</Text>
                    <Text className="font-medium text-gray-800">{selectedTenant?.contactNumber}</Text>
                  </View>
                  
                  <View className="flex flex-row justify-between mb-1">
                    <Text className="text-gray-700">Début du bail:</Text>
                    <Text className="font-medium text-gray-800">{selectedTenant?.leaseStart}</Text>
                  </View>
                  
                  <View className="flex flex-row justify-between">
                    <Text className="text-gray-700">Fin du bail:</Text>
                    <Text className="font-medium text-gray-800">{selectedTenant?.leaseEnd}</Text>
                  </View>
                </View>
                
                <Text className="text-lg font-medium text-gray-800 mb-2">Historique des paiements</Text>
                {selectedTenant.paymentHistory.map(payment => (
                  <View key={payment?.id} className="flex flex-row justify-between items-center py-3 border-b border-gray-200">
                    <Text className="text-gray-700">{payment?.date}</Text>
                    <View className="flex flex-row items-center">
                      <Text className="font-medium mr-2">{payment?.amount} €</Text>
                      <View className={`px-2 py-1 rounded ${
                        payment?.status === 'paid' ? 'bg-green-100' :
                        payment?.status === 'pending' ? 'bg-amber-100' : 'bg-red-100'
                      }`}>
                        <Text className={`text-xs ${
                          payment?.status === 'paid' ? 'text-green-800' :
                          payment?.status === 'pending' ? 'text-amber-800' : 'text-red-800'
                        }`}>
                          {payment?.status === 'paid' ? 'Payé' :
                           payment?.status === 'pending' ? 'En attente' : 'En retard'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
                
                <View className="flex flex-row justify-around mt-4 mb-6">
                  <TouchableOpacity className="bg-teal-600 py-3 px-4 rounded-lg flex-1 mr-2 items-center">
                    <Text className="text-white font-medium">Contacter</Text>
                </TouchableOpacity>
                
                <TouchableOpacity className="bg-blue-600 py-3 px-4 rounded-lg flex-1 ml-2 items-center">
                    <Text className="text-white font-medium">Documents</Text>
                </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Documents Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDocumentsModal}
        onRequestClose={() => setShowDocumentsModal(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-3xl p-5 h-3/4">
            <View className="flex flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">Documents</Text>
              <TouchableOpacity onPress={() => setShowDocumentsModal(false)}>
                <Text className="text-teal-600 font-medium">Fermer</Text>
              </TouchableOpacity>
            </View>
            
            <View className="flex flex-row mb-4">
              <TouchableOpacity className="flex-1 items-center py-2 border-b-2 border-teal-600">
                <Text className="text-teal-600 font-medium">Tous</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 items-center py-2 border-b-2 border-gray-200">
                <Text className="text-gray-500">Baux</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 items-center py-2 border-b-2 border-gray-200">
                <Text className="text-gray-500">Assurances</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 items-center py-2 border-b-2 border-gray-200">
                <Text className="text-gray-500">Impôts</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={owner.documents}
              keyExtractor={(item) => item?.id}
              renderItem={({ item }) => (
                <TouchableOpacity className="flex flex-row items-center p-3 bg-gray-50 rounded-lg mb-2">
                  <View className={`w-10 h-10 rounded-lg mr-3 items-center justify-center ${
                    item?.type === 'lease' ? 'bg-blue-100' :
                    item?.type === 'insurance' ? 'bg-green-100' :
                    item?.type === 'tax' ? 'bg-amber-100' :
                    item?.type === 'maintenance' ? 'bg-red-100' : 'bg-purple-100'
                  }`}>
                    <FilePlus 
                      size={24} 
                      color={
                        item?.type === 'lease' ? '#1D4ED8' :
                        item?.type === 'insurance' ? '#059669' :
                        item?.type === 'tax' ? '#D97706' :
                        item?.type === 'maintenance' ? '#DC2626' : '#7E22CE'
                      } 
                    />
                  </View>
                  
                  <View className="flex-1">
                    <Text className="font-medium text-gray-800">{item?.title}</Text>
                    <Text className="text-sm text-gray-600">{item?.date}</Text>
                  </View>
                  
                  <ChevronRight color="#6B7280" size={20} />
                </TouchableOpacity>
              )}
            />
            
            <TouchableOpacity className="mt-3 bg-teal-600 py-3 rounded-lg items-center">
              <Text className="text-white font-medium">Ajouter un document</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Maintenance Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showMaintenanceModal}
        onRequestClose={() => setShowMaintenanceModal(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-3xl p-5 h-3/4">
            <View className="flex flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">Demandes de maintenance</Text>
              <TouchableOpacity onPress={() => setShowMaintenanceModal(false)}>
                <Text className="text-teal-600 font-medium">Fermer</Text>
              </TouchableOpacity>
            </View>
            
            <View className="flex flex-row mb-4">
              <TouchableOpacity className="flex-1 items-center py-2 border-b-2 border-teal-600">
                <Text className="text-teal-600 font-medium">Actives</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 items-center py-2 border-b-2 border-gray-200">
                <Text className="text-gray-500">Complétées</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={activeMaintenanceRequests}
              keyExtractor={(item) => item?.id}
              renderItem={({ item }) => {
                // Find property for this maintenance request
                const property = owner.properties.find(p => p.id === item?.propertyId);
                
                return (
                  <View className="p-3 bg-gray-50 rounded-lg mb-3">
                    <View className="flex flex-row justify-between items-center mb-1">
                      <Text className="font-medium text-gray-800">
                        {property ? property.address.split(',')[0] : 'Propriété inconnue'}
                      </Text>
                      <View className={`px-2 py-1 rounded ${
                        item?.priority === 'low' ? 'bg-blue-100' :
                        item?.priority === 'medium' ? 'bg-amber-100' :
                        item?.priority === 'high' ? 'bg-orange-100' : 'bg-red-100'
                      }`}>
                        <Text className={`text-xs ${
                          item?.priority === 'low' ? 'text-blue-800' :
                          item?.priority === 'medium' ? 'text-amber-800' :
                          item?.priority === 'high' ? 'text-orange-800' : 'text-red-800'
                        }`}>
                          {item?.priority === 'low' ? 'Basse' :
                           item?.priority === 'medium' ? 'Moyenne' :
                           item?.priority === 'high' ? 'Haute' : 'Urgente'}
                        </Text>
                      </View>
                    </View>
                    
                    <Text className="text-gray-600 text-sm mb-1">{item?.date}</Text>
                    <Text className="text-gray-800 mb-2">{item?.description}</Text>
                    
                    <View className="flex flex-row justify-between items-center">
                      <View className={`px-2 py-1 rounded ${
                        item?.status === 'new' ? 'bg-purple-100' :
                        item?.status === 'scheduled' ? 'bg-blue-100' :
                        'bg-green-100'
                      }`}>
                        <Text className={`text-xs ${
                          item?.status === 'new' ? 'text-purple-800' :
                          item?.status === 'scheduled' ? 'text-blue-800' :
                          'text-green-800'
                        }`}>
                          {item?.status === 'new' ? 'Nouvelle' :
                           item?.status === 'scheduled' ? 'Planifiée' :
                           'En cours'}
                        </Text>
                      </View>
                      {item?.estimatedCost && (
                        <Text className="text-gray-700 font-medium">{item?.estimatedCost} €</Text>
                      )}
                    </View>
                    
                    <View className="flex flex-row mt-3">
                      <TouchableOpacity className="flex-1 bg-teal-600 py-2 rounded-lg items-center mr-2">
                        <Text className="text-white">Mettre à jour</Text>
                      </TouchableOpacity>
                      <TouchableOpacity className="flex-1 bg-white border border-teal-600 py-2 rounded-lg items-center ml-2">
                        <Text className="text-teal-600">Détails</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={
                <Text className="text-gray-500 text-center p-4">Aucune demande de maintenance active</Text>
              }
            />
            
            <TouchableOpacity className="mt-3 bg-teal-600 py-3 rounded-lg items-center">
              <Text className="text-white font-medium">Nouvelle demande</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex flex-row justify-around pt-2 pb-6">
        <TouchableOpacity className="items-center">
          <Home color="#0D9488" size={24} />
          <Text className="text-xs text-teal-600">Accueil</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <CalendarIcon color="#6B7280" size={24} />
          <Text className="text-xs text-gray-500">Calendrier</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <CreditCard color="#6B7280" size={24} />
          <Text className="text-xs text-gray-500">Finances</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <MessageCircle color="#6B7280" size={24} />
          <Text className="text-xs text-gray-500">Messages</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <Bell color="#6B7280" size={24} />
          <Text className="text-xs text-gray-500">Notifications</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default OwnerProfileFile;