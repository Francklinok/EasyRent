import { Property, PropertyType } from '@/types/property';

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Villa de luxe avec piscine',
    description: 'Magnifique villa moderne avec piscine privée, jardin paysager et vue panoramique sur la montagne. Parfaite pour les vacances en famille.',
    price: 2500000,
    currency: 'XAF',
    priceType: 'sale',
    propertyType: 'villa',
    status: 'available',
    location: {
      address: '123 Avenue des Palmiers',
      city: 'Douala',
      region: 'Littoral',
      country: 'Cameroun',
      coordinates: {
        latitude: 4.0511,
        longitude: 9.7679
      }
    },
    features: {
      bedrooms: 4,
      bathrooms: 3,
      area: 350,
      landArea: 800,
      parking: 2,
      pool: true,
      garden: true,
      terrace: true,
      garage: true,
      security: true
    },
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop'
    ],
    owner: {
      id: 'owner1',
      name: 'Jean Dupont',
      phone: '+237 677 123 456',
      email: 'jean.dupont@email.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop'
    },
    amenities: ['wifi', 'airConditioning', 'kitchen', 'laundry', 'balcony'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Appartement moderne centre-ville',
    description: 'Superbe appartement de 2 chambres au cœur de Yaoundé, avec vue sur la ville et finitions haut de gamme.',
    price: 180000,
    currency: 'XAF',
    priceType: 'rent',
    propertyType: 'apartment',
    status: 'available',
    location: {
      address: '45 Rue de la Paix',
      city: 'Yaoundé',
      region: 'Centre',
      country: 'Cameroun',
      coordinates: {
        latitude: 3.8480,
        longitude: 11.5021
      }
    },
    features: {
      bedrooms: 2,
      bathrooms: 2,
      area: 85,
      parking: 1,
      pool: false,
      garden: false,
      terrace: true,
      garage: false,
      security: true
    },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'
    ],
    owner: {
      id: 'owner2',
      name: 'Marie Kamdem',
      phone: '+237 698 765 432',
      email: 'marie.kamdem@email.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop'
    },
    amenities: ['wifi', 'airConditioning', 'kitchen', 'elevator'],
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z'
  },
  {
    id: '3',
    title: 'Maison familiale avec jardin',
    description: 'Charmante maison de 3 chambres avec grand jardin, idéale pour une famille. Quartier calme et sécurisé.',
    price: 1200000,
    currency: 'XAF',
    priceType: 'sale',
    propertyType: 'house',
    status: 'available',
    location: {
      address: '78 Boulevard des Fleurs',
      city: 'Bafoussam',
      region: 'Ouest',
      country: 'Cameroun',
      coordinates: {
        latitude: 5.4781,
        longitude: 10.4174
      }
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      area: 150,
      landArea: 400,
      parking: 2,
      pool: false,
      garden: true,
      terrace: false,
      garage: true,
      security: false
    },
    images: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&h=600&fit=crop'
    ],
    owner: {
      id: 'owner3',
      name: 'Paul Nkomo',
      phone: '+237 655 987 321',
      email: 'paul.nkomo@email.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop'
    },
    amenities: ['wifi', 'garden', 'garage', 'quiet'],
    createdAt: '2024-01-05T09:15:00Z',
    updatedAt: '2024-01-05T09:15:00Z'
  },
  {
    id: '4',
    title: 'Studio meublé étudiant',
    description: 'Studio entièrement meublé près de l\'université, parfait pour étudiant. Cuisine équipée et salle de bain privée.',
    price: 75000,
    currency: 'XAF',
    priceType: 'rent',
    propertyType: 'studio',
    status: 'available',
    location: {
      address: '12 Rue Universitaire',
      city: 'Dschang',
      region: 'Ouest',
      country: 'Cameroun',
      coordinates: {
        latitude: 5.4515,
        longitude: 10.0536
      }
    },
    features: {
      bedrooms: 1,
      bathrooms: 1,
      area: 25,
      parking: 0,
      pool: false,
      garden: false,
      terrace: false,
      garage: false,
      security: true
    },
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop'
    ],
    owner: {
      id: 'owner4',
      name: 'Sophie Mbarga',
      phone: '+237 670 555 888',
      email: 'sophie.mbarga@email.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop'
    },
    amenities: ['wifi', 'furnished', 'kitchen', 'security'],
    createdAt: '2024-01-12T16:45:00Z',
    updatedAt: '2024-01-12T16:45:00Z'
  },
  {
    id: '5',
    title: 'Penthouse vue mer',
    description: 'Somptueux penthouse avec terrasse panoramique et vue imprenable sur l\'océan Atlantique. Finitions de luxe.',
    price: 4500000,
    currency: 'XAF',
    priceType: 'sale',
    propertyType: 'penthouse',
    status: 'available',
    location: {
      address: '1 Avenue de l\'Océan',
      city: 'Kribi',
      region: 'Sud',
      country: 'Cameroun',
      coordinates: {
        latitude: 2.9444,
        longitude: 9.9077
      }
    },
    features: {
      bedrooms: 3,
      bathrooms: 3,
      area: 200,
      parking: 2,
      pool: true,
      garden: false,
      terrace: true,
      garage: true,
      security: true
    },
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1615873968403-89e068629265?w=800&h=600&fit=crop'
    ],
    owner: {
      id: 'owner5',
      name: 'Emmanuel Biya',
      phone: '+237 699 111 222',
      email: 'emmanuel.biya@email.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'
    },
    amenities: ['wifi', 'airConditioning', 'pool', 'oceanView', 'luxury'],
    createdAt: '2024-01-08T11:20:00Z',
    updatedAt: '2024-01-08T11:20:00Z'
  },
  {
    id: '6',
    title: 'Loft industriel rénové',
    description: 'Magnifique loft style industriel avec hauts plafonds et grandes fenêtres. Espace ouvert idéal pour créatifs.',
    price: 250000,
    currency: 'XAF',
    priceType: 'rent',
    propertyType: 'loft',
    status: 'available',
    location: {
      address: '34 Rue des Artistes',
      city: 'Douala',
      region: 'Littoral',
      country: 'Cameroun',
      coordinates: { latitude: 4.0611, longitude: 9.7579 }
    },
    features: {
      bedrooms: 1,
      bathrooms: 1,
      area: 120,
      parking: 1,
      pool: false,
      garden: false,
      terrace: false,
      garage: false,
      security: true
    },
    images: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
    ],
    owner: {
      id: 'owner6',
      name: 'Antoine Fotso',
      phone: '+237 677 333 444',
      email: 'antoine.fotso@email.com',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop'
    },
    amenities: ['wifi', 'openSpace', 'natural-light', 'artistic'],
    createdAt: '2024-01-20T08:30:00Z',
    updatedAt: '2024-01-20T08:30:00Z'
  },
  {
    id: '7',
    title: 'Bureau moderne open space',
    description: 'Espace de bureau lumineux et moderne, idéal pour startup ou PME. Proche de tous les commerces.',
    price: 350000,
    currency: 'XAF',
    priceType: 'rent',
    propertyType: 'office',
    status: 'available',
    location: {
      address: '88 Avenue du Commerce',
      city: 'Yaoundé',
      region: 'Centre',
      country: 'Cameroun',
      coordinates: { latitude: 3.8680, longitude: 11.5221 }
    },
    features: {
      bedrooms: 0,
      bathrooms: 2,
      area: 180,
      parking: 4,
      pool: false,
      garden: false,
      terrace: false,
      garage: false,
      security: true
    },
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop'
    ],
    owner: {
      id: 'owner7',
      name: 'Céline Nguema',
      phone: '+237 698 222 555',
      email: 'celine.nguema@email.com',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop'
    },
    amenities: ['wifi', 'airConditioning', 'meeting-rooms', 'parking'],
    createdAt: '2024-01-18T13:00:00Z',
    updatedAt: '2024-01-18T13:00:00Z'
  },
  {
    id: '8',
    title: 'Terrain constructible 1000m²',
    description: 'Magnifique terrain plat et viabilisé, prêt à construire. Titre foncier disponible. Quartier résidentiel calme.',
    price: 8000000,
    currency: 'XAF',
    priceType: 'sale',
    propertyType: 'land',
    status: 'available',
    location: {
      address: 'Zone Bastos',
      city: 'Yaoundé',
      region: 'Centre',
      country: 'Cameroun',
      coordinates: { latitude: 3.8880, longitude: 11.5121 }
    },
    features: {
      bedrooms: 0,
      bathrooms: 0,
      area: 0,
      landArea: 1000,
      parking: 0,
      pool: false,
      garden: false,
      terrace: false,
      garage: false,
      security: false
    },
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop'
    ],
    owner: {
      id: 'owner8',
      name: 'Jacques Ondoua',
      phone: '+237 655 777 999',
      email: 'jacques.ondoua@email.com',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop'
    },
    amenities: ['titled', 'flat', 'utilities'],
    createdAt: '2024-01-14T10:15:00Z',
    updatedAt: '2024-01-14T10:15:00Z'
  },
  {
    id: '9',
    title: 'Chalet de montagne',
    description: 'Charmant chalet en bois avec vue panoramique sur les montagnes. Parfait pour week-ends et vacances.',
    price: 1800000,
    currency: 'XAF',
    priceType: 'sale',
    propertyType: 'villa',
    status: 'available',
    location: {
      address: 'Mont Cameroun',
      city: 'Buea',
      region: 'Sud-Ouest',
      country: 'Cameroun',
      coordinates: { latitude: 4.1560, longitude: 9.2324 }
    },
    features: {
      bedrooms: 2,
      bathrooms: 1,
      area: 90,
      landArea: 500,
      parking: 2,
      pool: false,
      garden: true,
      terrace: true,
      garage: false,
      security: false
    },
    images: [
      'https://images.unsplash.com/photo-1518732714860-b62714ce0c59?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&h=600&fit=crop'
    ],
    owner: {
      id: 'owner9',
      name: 'Francine Talla',
      phone: '+237 670 444 666',
      email: 'francine.talla@email.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop'
    },
    amenities: ['mountainView', 'fireplace', 'quiet', 'nature'],
    createdAt: '2024-01-16T15:30:00Z',
    updatedAt: '2024-01-16T15:30:00Z'
  },
  {
    id: '10',
    title: 'Appartement 3 pièces rénové',
    description: 'Bel appartement entièrement rénové au 3ème étage avec ascenseur. Cuisine moderne équipée.',
    price: 220000,
    currency: 'XAF',
    priceType: 'rent',
    propertyType: 'apartment',
    status: 'available',
    location: {
      address: '56 Rue du Marché',
      city: 'Douala',
      region: 'Littoral',
      country: 'Cameroun',
      coordinates: { latitude: 4.0411, longitude: 9.7479 }
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      area: 95,
      parking: 1,
      pool: false,
      garden: false,
      terrace: true,
      garage: false,
      security: true
    },
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&h=600&fit=crop'
    ],
    owner: {
      id: 'owner10',
      name: 'David Essomba',
      phone: '+237 677 888 999',
      email: 'david.essomba@email.com',
      avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop'
    },
    amenities: ['wifi', 'airConditioning', 'elevator', 'renovated'],
    createdAt: '2024-01-22T09:45:00Z',
    updatedAt: '2024-01-22T09:45:00Z'
  },
  {
    id: '11',
    title: 'Villa contemporaine avec jardin',
    description: 'Superbe villa de style contemporain avec grand jardin arboré et piscine chauffée. Quartier premium.',
    price: 3200000,
    currency: 'XAF',
    priceType: 'sale',
    propertyType: 'villa',
    status: 'available',
    location: {
      address: '15 Boulevard des Ambassades',
      city: 'Yaoundé',
      region: 'Centre',
      country: 'Cameroun',
      coordinates: { latitude: 3.8780, longitude: 11.5321 }
    },
    features: {
      bedrooms: 5,
      bathrooms: 4,
      area: 420,
      landArea: 1200,
      parking: 3,
      pool: true,
      garden: true,
      terrace: true,
      garage: true,
      security: true
    },
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop'
    ],
    owner: {
      id: 'owner11',
      name: 'Isabelle Kotto',
      phone: '+237 699 333 777',
      email: 'isabelle.kotto@email.com',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop'
    },
    amenities: ['wifi', 'airConditioning', 'pool', 'garden', 'luxury', 'security'],
    createdAt: '2024-01-25T11:00:00Z',
    updatedAt: '2024-01-25T11:00:00Z'
  },
  {
    id: '12',
    title: 'Studio cosy meublé',
    description: 'Petit studio cosy et meublé, idéal pour personne seule ou couple. Proche transports et commerces.',
    price: 90000,
    currency: 'XAF',
    priceType: 'rent',
    propertyType: 'studio',
    status: 'available',
    location: {
      address: '23 Rue de la Gare',
      city: 'Douala',
      region: 'Littoral',
      country: 'Cameroun',
      coordinates: { latitude: 4.0311, longitude: 9.7379 }
    },
    features: {
      bedrooms: 1,
      bathrooms: 1,
      area: 28,
      parking: 0,
      pool: false,
      garden: false,
      terrace: false,
      garage: false,
      security: true
    },
    images: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop'
    ],
    owner: {
      id: 'owner12',
      name: 'Robert Manga',
      phone: '+237 670 111 333',
      email: 'robert.manga@email.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop'
    },
    amenities: ['wifi', 'furnished', 'kitchen', 'closetotransport'],
    createdAt: '2024-01-27T14:20:00Z',
    updatedAt: '2024-01-27T14:20:00Z'
  }
];

export const getPropertiesByType = (type: PropertyType | 'All'): Property[] => {
  if (type === 'All') return mockProperties;
  return mockProperties.filter(property => property.propertyType === type);
};

export const searchProperties = (query: string): Property[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockProperties.filter(property =>
    property.title.toLowerCase().includes(lowercaseQuery) ||
    property.description.toLowerCase().includes(lowercaseQuery) ||
    property.location.city.toLowerCase().includes(lowercaseQuery) ||
    property.location.region.toLowerCase().includes(lowercaseQuery)
  );
};