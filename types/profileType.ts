

// Types et interfaces (remains the same)
export interface UserProfile {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string;
    dateOfBirth: string;
    nationality: string;
    languages: string[];
    address: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
  };
  roles: UserRole[];
  verification: {
    identity: boolean;
    email: boolean;
    phone: boolean;
    address: boolean;
    income: boolean;
    creditScore?: number;
  };
  preferences: {
    currency: string;
    notifications: NotificationPreferences;
    privacy: PrivacySettings;
  };
  statistics: UserStatistics;
  activities: Activity[];
  documents: Document[];
  favorites: Property[];
  messages: Message[];
  appointments: Appointment[];
}

export interface UserRole {
  type: 'buyer' | 'seller' | 'renter' | 'owner' | 'agent' | 'developer';
  isActive: boolean;
  level: 'beginner' | 'intermediate' | 'expert' | 'professional';
  joinDate: string;
  specificData: BuyerData | SellerData | RenterData | OwnerData | AgentData | DeveloperData | any;
}

export interface BuyerData {
  budget: {
    min: number;
    max: number;
    preApproved: boolean;
    mortgageInfo?: {
      lender: string;
      amount: number;
      rate: number;
    };
  };
  searchCriteria: {
    propertyTypes: string[];
    locations: string[];
    features: string[];
    urgency: 'low' | 'medium' | 'high';
  };
  viewingHistory?: PropertyViewing[];
  offers?: Offer[];
}
export interface SellerData {
  properties: Property[];
  marketingPreferences: {
    photoShoots: boolean;
    virtualTours: boolean;
    professionalStaging: boolean;
  };
  pricingStrategy: {
    initialPrice: number;
    minimumPrice: number;
    negotiable: boolean;
  };
}
export interface RenterData {
  rentalBudget: {
    monthlyMax: number;
    depositAvailable: number;
  };
  leasePreferences: {
    duration: string;
    furnished: boolean;
    petsAllowed: boolean;
  };
  rentalHistory: RentalHistory[];
}
export interface OwnerData {
  properties: Property[];
  rentalIncome: {
    monthly: number;
    yearly: number;
    occupancyRate: number;
  };
  tenants: Tenant[];
  maintenanceRequests: MaintenanceRequest[];
}

export interface AgentData {
  agencyName: string;
  licenseNumber: string;
  specialties: string[];
  listings: Property[];
  clients: string[]; // User IDs
}

export interface DeveloperData {
  companyName: string;
  projects: Property[]; // Properties representing projects
  developmentAreas: string[];
  fundsRaised: number;
}
export interface Property {
  id: string;
  type: string;
  address: string;
  price: number;
  images: string[];
  features: string[];
  status: string;
  description: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  energyRating?: string;
  furnished?: boolean;
  parking?: boolean;
  garden?: boolean;
  lastUpdated: string;
}
export interface UserStatistics {
  totalProperties: number;
  successfulTransactions: number;
  averageRating: number;
  totalReviews: number;
  responseTime: string;
  activeListings: number;
  viewsReceived: number;
  contactsReceived: number;
  joinDate: string;
}
export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  status: string;
  relatedProperty?: string;
}
export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
  priceAlerts: boolean;
  newListings: boolean;
}
export interface PrivacySettings {
  showPhone: boolean;
  showEmail: boolean;
  showAddress: boolean;
  allowMessages: boolean;
  profileVisibility: 'public' | 'private' | 'limited';
}
export interface PropertyViewing {
  propertyId: string;
  date: string;
  notes?: string;
}
export interface Offer {
  propertyId: string;
  amount: number;
  date: string;
  status: 'pending' | 'accepted' | 'rejected';
}
export interface RentalHistory {
  propertyId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  landlordContact: string;
}
export interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  propertyId: string;
  leaseStartDate: string;
  leaseEndDate: string;
}
export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dateRequested: string;
  dateCompleted?: string;
}
export interface Document {
  id: string;
  name: string;
  type: 'identity' | 'proofOfAddress' | 'incomeStatement' | 'contract' | 'other';
  url: string;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected';
}
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  propertyId?: string;
}
export interface Appointment {
  id: string;
  type: 'viewing' | 'meeting' | 'call';
  date: string;
  time: string;
  withUser: string; // Other user's name or ID
  propertyId?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}
export const demoUser: UserProfile = {
  id: 'user-001',
  personalInfo: {
    firstName: 'Alexandre',
    lastName: 'Dubois',
    email: 'alexandre.dubois@email.com',
    phone: '+33 6 12 34 56 78',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    dateOfBirth: '1985-03-15',
    nationality: 'Française',
    languages: ['Français', 'Anglais', 'Espagnol'],
    address: {
      street: '15 Avenue des Champs-Élysées',
      city: 'Paris',
      postalCode: '75008',
      country: 'France'
    }
  },
  roles: [
    {
      type: 'buyer',
      isActive: true,
      level: 'intermediate',
      joinDate: '2024-01-15',
      specificData: {
        budget: { min: 300000, max: 450000, preApproved: true },
        searchCriteria: {
          propertyTypes: ['Appartement', 'Maison'],
          locations: ['Paris', 'Lyon', 'Marseille'],
          features: ['Parking', 'Balcon', 'Ascenseur'],
          urgency: 'medium'
        },
        viewingHistory: [
          { propertyId: 'prop-001', date: '2024-06-20' },
          { propertyId: 'prop-002', date: '2024-06-25' },
        ],
        offers: [
          { propertyId: 'prop-003', amount: 380000, date: '2024-07-01', status: 'pending' },
        ]
      } as BuyerData
    },
    {
      type: 'owner',
      isActive: true,
      level: 'expert',
      joinDate: '2023-06-10',
      specificData: {
        properties: [
          {
            id: 'prop-004',
            type: 'Appartement',
            address: '10 Rue de Rivoli, Paris',
            price: 1200,
            images: ['https://source.unsplash.com/random/400x300?apartment1'],
            features: ['2 chambres', '1 salle de bain', 'Meublé'],
            status: 'Loué',
            description: 'Bel appartement au cœur de Paris.',
            area: 50,
            bedrooms: 2,
            bathrooms: 1,
            yearBuilt: 1950,
            furnished: true,
            parking: false,
            garden: false,
            lastUpdated: '2024-05-01'
          }
        ],
        rentalIncome: { monthly: 3200, yearly: 38400, occupancyRate: 95 },
        tenants: [
          { id: 'tenant-001', firstName: 'Marie', lastName: 'Curie', email: 'marie@example.com', propertyId: 'prop-004', leaseStartDate: '2023-09-01', leaseEndDate: '2025-08-31' }
        ],
        maintenanceRequests: []
      } as OwnerData
    },
    {
      type: 'seller',
      isActive: false,
      level: 'beginner',
      joinDate: '2024-02-20',
      specificData: {
        properties: [],
        marketingPreferences: { photoShoots: false, virtualTours: false, professionalStaging: false },
        pricingStrategy: { initialPrice: 0, minimumPrice: 0, negotiable: true }
      } as SellerData
    }
  ],
  verification: {
    identity: true,
    email: true,
    phone: true,
    address: true,
    income: true,
    creditScore: 750
  },
  preferences: {
    currency: 'EUR',
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false,
      priceAlerts: true,
      newListings: true
    },
    privacy: {
      showPhone: true,
      showEmail: false,
      showAddress: false,
      allowMessages: true,
      profileVisibility: 'public'
    }
  },
  statistics: {
    totalProperties: 3,
    successfulTransactions: 7,
    averageRating: 4.8,
    totalReviews: 24,
    responseTime: '< 2h',
    activeListings: 2,
    viewsReceived: 1547,
    contactsReceived: 89,
    joinDate: '2023-06-10'
  },
  activities: [
    {
      id: 'act-001',
      type: 'viewing',
      title: 'Visite programmée',
      description: 'Appartement 3 pièces - Belleville',
      date: '2024-07-08',
      status: 'scheduled'
    },
    {
      id: 'act-002',
      type: 'offer',
      title: 'Offre soumise',
      description: 'Maison 4 pièces - Vincennes',
      date: '2024-07-05',
      status: 'pending'
    },
    {
      id: 'act-003',
      type: 'listing',
      title: 'Annonce publiée',
      description: 'Studio - République',
      date: '2024-07-03',
      status: 'active'
    }
  ],
  documents: [
    {
      id: 'doc-001',
      name: 'Passeport',
      type: 'identity',
      url: '/docs/passport.pdf',
      uploadDate: '2023-08-01',
      status: 'approved'
    },
    {
      id: 'doc-002',
      name: 'Justificatif de domicile',
      type: 'proofOfAddress',
      url: '/docs/proof_of_address.pdf',
      uploadDate: '2023-08-05',
      status: 'pending'
    }
  ],
  favorites: [
    {
      id: 'fav-001',
      type: 'Maison',
      address: '20 Rue du Faubourg Saint-Honoré, Paris',
      price: 950000,
      images: ['https://source.unsplash.com/random/400x300?house'],
      features: ['5 chambres', '3 salles de bain', 'Jardin', 'Piscine'],
      status: 'À vendre',
      description: 'Magnifique maison de ville avec jardin.',
      area: 200,
      bedrooms: 5,
      bathrooms: 3,
      yearBuilt: 1900,
      furnished: false,
      parking: true,
      garden: true,
      lastUpdated: '2024-06-10'
    }
  ],
  messages: [
    {
      id: 'msg-001',
      senderId: 'agent-001',
      receiverId: 'user-001',
      subject: 'Informations sur la propriété',
      content: 'Bonjour Alexandre, je voulais vous fournir plus de détails sur la propriété à Vincennes.',
      timestamp: '2024-07-05T10:30:00Z',
      read: false,
      propertyId: 'prop-002'
    }
  ],
  appointments: [
    {
      id: 'appt-001',
      type: 'viewing',
      date: '2024-07-08',
      time: '14:00',
      withUser: 'Sophie Martin (Agent)',
      propertyId: 'prop-001',
      status: 'scheduled'
    }
  ]
};
