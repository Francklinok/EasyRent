import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import { 
  ChevronRight, 
  Home, 
  Calendar as CalendarIcon, 
  CreditCard, 
  MessageCircle, 
  Bell, 
  FilePlus, 
  Camera, 
  MapPin,
  Eye,
  Share2,
  Edit,
  Clock,
  Heart,
  DollarSign
} from 'lucide-react-native';

import Header from '../ui/header';

interface PropertyListing {
  id: string;
  title: string;
  address: string;
  price: number;
  propertyType: 'house' | 'apartment' | 'land' | 'commercial';
  size: number; // m²
  description: string;
  features: string[];
  photos: string[];
  dateAdded: string;
  status: 'active' | 'pending' | 'sold';
  views: number;
  favorites: number;
  inquiries: InquiryMessage[];
}

interface InquiryMessage {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerProfilePic: string;
  date: string;
  message: string;
  read: boolean;
  propertyId: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  buyerId: string;
  buyerName: string;
  buyerProfilePic: string;
  propertyId: string;
  propertyTitle: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface SalesDocument {
  id: string;
  title: string;
  type: 'listing' | 'contract' | 'diagnostic' | 'certificate';
  propertyId: string;
  dateAdded: string;
  fileUrl: string;
}

interface SellerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePic: string;
  joinDate: string;
  listings: PropertyListing[];
  appointments: Appointment[];
  documents: SalesDocument[];
  preferences: {
    notifyOnInquiry: boolean;
    notifyOnViewing: boolean;
    shareContactInfo: boolean;
  };
}

// Sample seller data
const seller: SellerProfile = {
  id: 'seller-001',
  name: 'Thomas Dubois',
  email: 'thomas.dubois@email.com',
  phone: '+33 6 23 45 67 89',
  profilePic: 'https://randomuser.me/api/portraits/men/42.jpg',
  joinDate: '2024-11-15',
  listings: [
    {
      id: 'prop-101',
      title: 'Villa avec jardin proche centre-ville',
      address: '25 Rue des Lilas, Bordeaux, 33000',
      price: 385000,
      propertyType: 'house',
      size: 145,
      description: 'Belle villa familiale de 4 chambres avec jardin paysager et terrasse ensoleillée. Proche des commerces et écoles.',
      features: ['4 chambres', '2 salles de bain', 'Jardin 300m²', 'Garage double', 'Cuisine équipée', 'Chauffage central'],
      photos: [
        'https://example.com/property101-1.jpg',
        'https://example.com/property101-2.jpg',
        'https://example.com/property101-3.jpg'
      ],
      dateAdded: '2025-03-10',
      status: 'active',
      views: 345,
      favorites: 28,
      inquiries: [
        {
          id: 'inq-201',
          buyerId: 'buyer-301',
          buyerName: 'Marie Laurent',
          buyerProfilePic: 'https://randomuser.me/api/portraits/women/23.jpg',
          date: '2025-04-02',
          message: 'Bonjour, je suis intéressée par votre villa. Est-il possible de visiter ce weekend ?',
          read: true,
          propertyId: 'prop-101'
        },
        {
          id: 'inq-202',
          buyerId: 'buyer-302',
          buyerName: 'Pierre Mercier',
          buyerProfilePic: 'https://randomuser.me/api/portraits/men/67.jpg',
          date: '2025-04-05',
          message: 'Bonjour, la villa est-elle dans un quartier calme ? Peut-on visiter prochainement ?',
          read: false,
          propertyId: 'prop-101'
        }
      ]
    },
    {
      id: 'prop-102',
      title: 'Terrain constructible vue mer',
      address: 'Route des Plages, Biarritz, 64200',
      price: 250000,
      propertyType: 'land',
      size: 800,
      description: 'Magnifique terrain constructible avec vue mer. Possibilité de construire jusqu\'à 240m² de surface habitable. Environnement calme.',
      features: ['COS 0.3', 'Viabilisé', 'Vue mer', 'Exposition sud', 'Non inondable'],
      photos: [
        'https://example.com/property102-1.jpg',
        'https://example.com/property102-2.jpg'
      ],
      dateAdded: '2025-02-25',
      status: 'pending',
      views: 187,
      favorites: 15,
      inquiries: [
        {
          id: 'inq-203',
          buyerId: 'buyer-303',
          buyerName: 'Julien Blanc',
          buyerProfilePic: 'https://randomuser.me/api/portraits/men/33.jpg',
          date: '2025-03-20',
          message: 'Bonjour, je souhaite savoir si le terrain est viabilisé et si des études de sol ont été réalisées.',
          read: true,
          propertyId: 'prop-102'
        }
      ]
    }
  ],
  appointments: [
    {
      id: 'app-001',
      date: '2025-04-08',
      time: '14:30',
      buyerId: 'buyer-301',
      buyerName: 'Marie Laurent',
      buyerProfilePic: 'https://randomuser.me/api/portraits/women/23.jpg',
      propertyId: 'prop-101',
      propertyTitle: 'Villa avec jardin proche centre-ville',
      status: 'scheduled'
    },
    {
      id: 'app-002',
      date: '2025-04-12',
      time: '10:00',
      buyerId: 'buyer-302',
      buyerName: 'Pierre Mercier',
      buyerProfilePic: 'https://randomuser.me/api/portraits/men/67.jpg',
      propertyId: 'prop-101',
      propertyTitle: 'Villa avec jardin proche centre-ville',
      status: 'scheduled'
    },
    {
      id: 'app-003',
      date: '2025-04-01',
      time: '16:00',
      buyerId: 'buyer-303',
      buyerName: 'Julien Blanc',
      buyerProfilePic: 'https://randomuser.me/api/portraits/men/33.jpg',
      propertyId: 'prop-102',
      propertyTitle: 'Terrain constructible vue mer',
      status: 'completed'
    }
  ],
  documents: [
    {
      id: 'doc-101',
      title: 'Diagnostics Villa Bordeaux',
      type: 'diagnostic',
      propertyId: 'prop-101',
      dateAdded: '2025-03-08',
      fileUrl: '/documents/diag_prop101.pdf'
    },
    {
      id: 'doc-102',
      title: 'Certificat d\'urbanisme - Terrain Biarritz',
      type: 'certificate',
      propertyId: 'prop-102',
      dateAdded: '2025-02-20',
      fileUrl: '/documents/cert_prop102.pdf'
    },
    {
      id: 'doc-103',
      title: 'Photos professionnelles - Villa Bordeaux',
      type: 'listing',
      propertyId: 'prop-101',
      dateAdded: '2025-03-10',
      fileUrl: '/documents/photos_prop101.zip'
    }
  ],
  preferences: {
    notifyOnInquiry: true,
    notifyOnViewing: true,
    shareContactInfo: false
  }
};

const SellerProfileFile = () => {
  const [showPropertyModal, setShowPropertyModal] = useState<boolean>(false);
  const [showInquiryModal, setShowInquiryModal] = useState<boolean>(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryMessage | null>(null);

  // Count unread inquiries
  const unreadInquiries = seller.listings
    .flatMap(listing => listing.inquiries)
    .filter(inquiry => !inquiry.read).length;

  // Count upcoming appointments
  const upcomingAppointments = seller.appointments
    .filter(app => app.status === 'scheduled').length;

  // Calculate performance metrics
  const totalViews = seller.listings.reduce((sum, listing) => sum + listing.views, 0);
  const totalFavorites = seller.listings.reduce((sum, listing) => sum + listing.favorites, 0);
  const activeListings = seller.listings.filter(listing => listing.status === 'active').length;
  const pendingListings = seller.listings.filter(listing => listing.status === 'pending').length;
  const soldListings = seller.listings.filter(listing => listing.status === 'sold').length;

  const openPropertyDetails = (property: PropertyListing) => {
    setSelectedProperty(property);
    setShowPropertyModal(true);
  };

  const openInquiry = (inquiry: InquiryMessage) => {
    setSelectedInquiry(inquiry);
    setShowInquiryModal(true);
  };

  return (
    <ScrollView className="flex bg-white">
      <Header />
      
      {/* Seller Profile Section */}
      <View className="flex items-center mt-6 px-4">
        <Image
          source={{ uri: seller.profilePic }}
          className="w-24 h-24 rounded-full border-4 border-blue-500"
        />
        <Text className="text-xl font-bold mt-3">{seller.name}</Text>
        <Text className="text-sm text-gray-500">Vendeur</Text>
        <Text className="text-sm text-gray-700 mt-2">{seller.email}</Text>
      </View>

      {/* Quick Stats */}
      <View className="mt-6 mx-4 bg-blue-600 rounded-xl p-4 shadow-lg">
        <Text className="text-white font-semibold text-lg mb-2">Tableau de Bord</Text>
        
        <View className="flex flex-row justify-between items-center mb-2">
          <Text className="text-blue-100">Annonces actives:</Text>
          <Text className="text-white font-medium">{activeListings}</Text>
        </View>
        
        <View className="flex flex-row justify-between items-center mb-2">
          <Text className="text-blue-100">Vues totales:</Text>
          <Text className="text-white font-medium">{totalViews}</Text>
        </View>
        
        <View className="flex flex-row justify-between items-center mb-2">
          <Text className="text-blue-100">Favoris:</Text>
          <Text className="text-white font-medium">{totalFavorites}</Text>
        </View>
        
        <View className="flex flex-row justify-between items-center">
          <Text className="text-blue-100">Rendez-vous à venir:</Text>
          <Text className="text-white font-medium">{upcomingAppointments}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="mt-6 px-4 flex flex-row justify-around">
        <TouchableOpacity className="items-center">
          <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
            <Home color="#2563EB" size={24} />
          </View>
          <Text className="text-xs mt-1 text-gray-700">Mes biens</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center">
            <MessageCircle color="#7C3AED" size={24} />
          </View>
          <Text className="text-xs mt-1 text-gray-700">Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center" onPress={() => setShowDocumentsModal(true)}>
          <View className="w-12 h-12 bg-amber-100 rounded-full items-center justify-center">
            <FilePlus color="#D97706" size={24} />
          </View>
          <Text className="text-xs mt-1 text-gray-700">Documents</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center">
            <CalendarIcon color="#059669" size={24} />
          </View>
          <Text className="text-xs mt-1 text-gray-700">Visites</Text>
        </TouchableOpacity>
      </View>

      {/* My Properties Section */}
      <View className="mt-6 px-4">
        <Text className="text-lg font-semibold text-blue-600 mb-2">Mes Annonces</Text>
        
        <View className="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
          {seller.listings.map((property) => (
            <TouchableOpacity 
              key={property.id}
              className="flex flex-row items-center p-4 border-b border-gray-200"
              onPress={() => openPropertyDetails(property)}
            >
              <View className={`w-3 h-3 rounded-full mr-3 ${
                property.status === 'active' ? 'bg-green-500' : 
                property.status === 'pending' ? 'bg-amber-500' : 'bg-blue-500'
              }`} />
              
              <View className="flex-1">
                <Text className="font-medium text-gray-800">{property.title}</Text>
                <Text className="text-sm text-gray-600">
                  {property.propertyType === 'house' ? 'Maison' : 
                   property.propertyType === 'apartment' ? 'Appartement' : 
                   property.propertyType === 'land' ? 'Terrain' : 'Local Commercial'} • {property.size} m²
                </Text>
              </View>
              
              <View className="mr-2">
                <Text className="font-medium text-blue-600">{property.price.toLocaleString()} €</Text>
                <View className="flex flex-row items-center">
                  <Eye size={12} color="#6B7280" />
                  <Text className="text-xs ml-1 text-gray-500">{property.views}</Text>
                </View>
              </View>
              
              <ChevronRight color="#6B7280" size={20} />
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity className="mt-3 bg-blue-600 py-3 rounded-lg items-center">
          <Text className="text-white font-medium">Ajouter une annonce</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Appointments */}
      <View className="mt-6 px-4">
        <Text className="text-lg font-semibold text-blue-600 mb-2">Visites à venir</Text>
        
        <View className="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
          {seller.appointments
            .filter(app => app.status === 'scheduled')
            .map((appointment) => (
              <View 
                key={appointment.id}
                className="flex flex-row items-center p-4 border-b border-gray-200"
              >
                <Image
                  source={{ uri: appointment.buyerProfilePic }}
                  className="w-10 h-10 rounded-full mr-3"
                />
                
                <View className="flex-1">
                  <Text className="font-medium text-gray-800">{appointment.buyerName}</Text>
                  <Text className="text-sm text-gray-600">{appointment.propertyTitle}</Text>
                </View>
                
                <View className="mr-2 items-end">
                  <Text className="font-medium text-blue-600">{appointment.date}</Text>
                  <Text className="text-xs text-gray-500">{appointment.time}</Text>
                </View>
              </View>
            ))}
            
          {seller.appointments.filter(app => app.status === 'scheduled').length === 0 && (
            <View className="p-4">
              <Text className="text-gray-500 text-center">Aucune visite planifiée</Text>
            </View>
          )}
        </View>
      </View>

      {/* Recent Inquiries */}
      <View className="mt-6 px-4 mb-8">
        <View className="flex flex-row justify-between items-center mb-2">
          <Text className="text-lg font-semibold text-blue-600">Messages Récents</Text>
          {unreadInquiries > 0 && (
            <View className="bg-red-500 rounded-full px-2 py-1">
              <Text className="text-xs text-white font-medium">{unreadInquiries} non lus</Text>
            </View>
          )}
        </View>
        
        <View className="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
          {seller.listings
            .flatMap(listing => listing.inquiries.map(inquiry => ({...inquiry, propertyTitle: listing.title})))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3)
            .map((inquiry) => (
              <TouchableOpacity 
                key={inquiry.id}
                className="p-4 border-b border-gray-200"
                onPress={() => openInquiry(inquiry)}
              >
                <View className="flex flex-row justify-between">
                  <View className="flex flex-row items-center">
                    <Image
                      source={{ uri: inquiry.buyerProfilePic }}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <Text className={`font-medium ${inquiry.read ? 'text-gray-800' : 'text-blue-700'}`}>
                      {inquiry.buyerName}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-500">{inquiry.date}</Text>
                </View>
                <Text className="text-sm text-gray-500 mt-1">{(inquiry as any).propertyTitle}</Text>
                <Text className="text-sm text-gray-600 mt-1" numberOfLines={1}>
                  {inquiry.message}
                </Text>
              </TouchableOpacity>
            ))}
            
          {seller.listings.flatMap(listing => listing.inquiries).length === 0 && (
            <View className="p-4">
              <Text className="text-gray-500 text-center">Aucun message</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity className="mt-3 bg-gray-200 py-3 rounded-lg items-center">
          <Text className="text-gray-800 font-medium">Voir tous les messages</Text>
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
              <Text className="text-xl font-bold text-gray-800">Détails de l'annonce</Text>
              <TouchableOpacity onPress={() => setShowPropertyModal(false)}>
                <Text className="text-blue-600 font-medium">Fermer</Text>
              </TouchableOpacity>
            </View>
            
            {selectedProperty && (
              <ScrollView>
                <Text className="text-lg font-medium text-gray-800">{selectedProperty.title}</Text>
                <Text className="text-gray-600 mb-3">{selectedProperty.address}</Text>
                
                <View className="bg-gray-100 p-3 rounded-lg mb-4">
                  <View className="flex flex-row justify-between mb-1">
                    <Text className="text-gray-700">Type:</Text>
                    <Text className="font-medium text-gray-800">
                      {selectedProperty.propertyType === 'house' ? 'Maison' : 
                       selectedProperty.propertyType === 'apartment' ? 'Appartement' : 
                       selectedProperty.propertyType === 'land' ? 'Terrain' : 'Local Commercial'}
                    </Text>
                  </View>
                  
                  <View className="flex flex-row justify-between mb-1">
                    <Text className="text-gray-700">Prix:</Text>
                    <Text className="font-medium text-gray-800">{selectedProperty.price.toLocaleString()} €</Text>
                  </View>
                  
                  <View className="flex flex-row justify-between mb-1">
                    <Text className="text-gray-700">Surface:</Text>
                    <Text className="font-medium text-gray-800">{selectedProperty.size} m²</Text>
                  </View>
                  
                  <View className="flex flex-row justify-between mb-1">
                    <Text className="text-gray-700">Date d'ajout:</Text>
                    <Text className="font-medium text-gray-800">{selectedProperty.dateAdded}</Text>
                  </View>
                  
                  <View className="flex flex-row justify-between">
                    <Text className="text-gray-700">Statut:</Text>
                    <Text className={`font-medium ${
                      selectedProperty.status === 'active' ? 'text-green-600' : 
                      selectedProperty.status === 'pending' ? 'text-amber-600' : 'text-blue-600'
                    }`}>
                      {selectedProperty.status === 'active' ? 'Active' : 
                       selectedProperty.status === 'pending' ? 'En attente' : 'Vendu'}
                    </Text>
                  </View>
                </View>
                
                <Text className="text-gray-800 mb-3">{selectedProperty.description}</Text>
                
                <Text className="text-lg font-medium text-gray-800 mb-2">Caractéristiques</Text>
                <View className="flex flex-row flex-wrap mb-4">
                  {selectedProperty.features.map((feature, index) => (
                    <View key={index} className="bg-blue-50 rounded-full px-3 py-1 mr-2 mb-2">
                      <Text className="text-blue-700 text-sm">{feature}</Text>
                    </View>
                  ))}
                </View>
                
                <Text className="text-lg font-medium text-gray-800 mb-2">Statistiques</Text>
                <View className="bg-gray-100 p-3 rounded-lg mb-4">
                  <View className="flex flex-row justify-between mb-1">
                    <Text className="text-gray-700">Vues:</Text>
                    <Text className="font-medium text-gray-800">{selectedProperty.views}</Text>
                  </View>
                  
                  <View className="flex flex-row justify-between mb-1">
                    <Text className="text-gray-700">Favoris:</Text>
                    <Text className="font-medium text-gray-800">{selectedProperty.favorites}</Text>
                  </View>
                  
                  <View className="flex flex-row justify-between">
                    <Text className="text-gray-700">Messages:</Text>
                    <Text className="font-medium text-gray-800">{selectedProperty.inquiries.length}</Text>
                  </View>
                </View>
                
                <View className="flex flex-row justify-around mt-4 mb-6">
                  <TouchableOpacity className="bg-blue-600 py-3 px-4 rounded-lg flex-1 mr-2 items-center">
                    <Text className="text-white font-medium">Modifier</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity className="bg-green-600 py-3 px-4 rounded-lg flex-1 ml-2 items-center">
                    <Text className="text-white font-medium">Promouvoir</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Inquiry Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showInquiryModal}
        onRequestClose={() => setShowInquiryModal(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-3xl p-5 h-2/3">
            <View className="flex flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">Message</Text>
              <TouchableOpacity onPress={() => setShowInquiryModal(false)}>
                <Text className="text-blue-600 font-medium">Fermer</Text>
              </TouchableOpacity>
            </View>
            
            {selectedInquiry && (
              <View className="flex-1">
                <View className="flex flex-row items-center mb-4">
                  <Image
                    source={{ uri: selectedInquiry.buyerProfilePic }}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  <View>
                    <Text className="font-medium text-gray-800">{selectedInquiry.buyerName}</Text>
                    <Text className="text-sm text-gray-500">{selectedInquiry.date}</Text>
                  </View>
                </View>
                
                <View className="bg-gray-100 p-4 rounded-lg mb-4">
                  <Text className="text-gray-800">{selectedInquiry.message}</Text>
                </View>
                
                <View className="flex flex-row justify-around mt-auto mb-6">
                  <TouchableOpacity className="bg-blue-600 py-3 px-4 rounded-lg flex-1 mr-2 items-center">
                    <Text className="text-white font-medium">Répondre</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity className="bg-green-600 py-3 px-4 rounded-lg flex-1 ml-2 items-center">
                    <Text className="text-white font-medium">Planifier visite</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
                <Text className="text-blue-600 font-medium">Fermer</Text>
              </TouchableOpacity>
            </View>
            
            <View className="flex flex-row mb-4">
              <TouchableOpacity className="flex-1 items-center py-2 border-b-2 border-blue-600">
                <Text className="text-blue-600 font-medium">Tous</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 items-center py-2 border-b-2 border-gray-200">
                <Text className="text-gray-500">Diagnostics</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 items-center py-2 border-b-2 border-gray-200">
                <Text className="text-gray-500">Contrats</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={seller.documents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity className="flex flex-row items-center p-3 bg-gray-50 rounded-lg mb-2">
                  <View className={`w-10 h-10 rounded-lg mr-3 items-center justify-center ${
                    item.type === 'listing' ? 'bg-blue-100' :
                    item.type === 'contract' ? 'bg-purple-100' :
                    item.type === 'diagnostic' ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    <FilePlus 
                      size={24} 
                      color={
                        item.type === 'listing' ? '#1D4ED8' :
                        item.type === 'contract' ? '#7E22CE' :
                        item.type === 'diagnostic' ? '#DC2626' :
                        '#059669'
                      }
                      
                        />
                      </View>
                      
                      <View className="flex-1">
                        <Text className="font-medium text-gray-800">{item.title}</Text>
                        <Text className="text-xs text-gray-500">{item.dateAdded}</Text>
                      </View>
                      
                      <TouchableOpacity className="p-2">
                        <Share2 size={20} color="#6B7280" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  )}
                />
                
                <TouchableOpacity className="mt-4 bg-blue-600 py-3 rounded-lg items-center">
                  <Text className="text-white font-medium">Ajouter un document</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
    
          {/* Bottom Navigation */}
          {/* <View className="h-16 bg-white border-t border-gray-200 flex flex-row justify-around items-center">
            <TouchableOpacity className="items-center">
              <Home color="#2563EB" size={24} />
              <Text className="text-xs text-blue-600">Accueil</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="items-center">
              <MessageCircle color="#6B7280" size={24} />
              <Text className="text-xs text-gray-500">Messages</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="items-center">
              <CalendarIcon color="#6B7280" size={24} />
              <Text className="text-xs text-gray-500">Visites</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="items-center">
              <CreditCard color="#6B7280" size={24} />
              <Text className="text-xs text-gray-500">Paiements</Text>
            </TouchableOpacity>
          </View> */}
        </ScrollView>
      );
    };
    
    export default SellerProfileFile;