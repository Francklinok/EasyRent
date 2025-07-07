

// // Types et interfaces (remains the same)
// export interface UserProfile {
//   id: string;
//   personalInfo: {
//     firstName: string;
//     lastName: string;
//     email: string;
//     phone: string;
//     avatar: string;
//     dateOfBirth: string;
//     nationality: string;
//     languages: string[];
//     address: {
//       street: string;
//       city: string;
//       postalCode: string;
//       country: string;
//     };
//   };
//   roles: UserRole[];
//   verification: {
//     identity: boolean;
//     email: boolean;
//     phone: boolean;
//     address: boolean;
//     income: boolean;
//     creditScore?: number;
//   };
//   preferences: {
//     currency: string;
//     notifications: NotificationPreferences;
//     privacy: PrivacySettings;
//   };
//   statistics: UserStatistics;
//   activities: Activity[];
//   documents: Document[];
//   favorites: Property[];
//   messages: Message[];
//   appointments: Appointment[];
// }

// export interface UserRole {
//   type: 'buyer' | 'seller' | 'renter' | 'owner' | 'agent' | 'developer';
//   isActive: boolean;
//   level: 'beginner' | 'intermediate' | 'expert' | 'professional';
//   joinDate: string;
//   specificData: BuyerData | SellerData | RenterData | OwnerData | AgentData | DeveloperData | any;
// }

// export interface BuyerData {
//   budget: {
//     min: number;
//     max: number;
//     preApproved: boolean;
//     mortgageInfo?: {
//       lender: string;
//       amount: number;
//       rate: number;
//     };
//   };
//   searchCriteria: {
//     propertyTypes: string[];
//     locations: string[];
//     features: string[];
//     urgency: 'low' | 'medium' | 'high';
//   };
//   viewingHistory?: PropertyViewing[];
//   offers?: Offer[];
// }
// export interface SellerData {
//   properties: Property[];
//   marketingPreferences: {
//     photoShoots: boolean;
//     virtualTours: boolean;
//     professionalStaging: boolean;
//   };
//   pricingStrategy: {
//     initialPrice: number;
//     minimumPrice: number;
//     negotiable: boolean;
//   };
// }
// export interface RenterData {
//   rentalBudget: {
//     monthlyMax: number;
//     depositAvailable: number;
//   };
//   leasePreferences: {
//     duration: string;
//     furnished: boolean;
//     petsAllowed: boolean;
//   };
//   rentalHistory: RentalHistory[];
// }
// export interface OwnerData {
//   properties: Property[];
//   rentalIncome: {
//     monthly: number;
//     yearly: number;
//     occupancyRate: number;
//   };
//   tenants: Tenant[];
//   maintenanceRequests: MaintenanceRequest[];
// }

// export interface AgentData {
//   agencyName: string;
//   licenseNumber: string;
//   specialties: string[];
//   listings: Property[];
//   clients: string[]; // User IDs
// }

// export interface DeveloperData {
//   companyName: string;
//   projects: Property[]; // Properties representing projects
//   developmentAreas: string[];
//   fundsRaised: number;
// }
// export interface Property {
//   id: string;
//   type: string;
//   address: string;
//   price: number;
//   images: string[];
//   features: string[];
//   status: string;
//   description: string;
//   area: number;
//   bedrooms?: number;
//   bathrooms?: number;
//   yearBuilt?: number;
//   energyRating?: string;
//   furnished?: boolean;
//   parking?: boolean;
//   garden?: boolean;
//   lastUpdated: string;
// }
// export interface UserStatistics {
//   totalProperties: number;
//   successfulTransactions: number;
//   averageRating: number;
//   totalReviews: number;
//   responseTime: string;
//   activeListings: number;
//   viewsReceived: number;
//   contactsReceived: number;
//   joinDate: string;
// }
// export interface Activity {
//   id: string;
//   type: string;
//   title: string;
//   description: string;
//   date: string;
//   status: string;
//   relatedProperty?: string;
// }
// export interface NotificationPreferences {
//   email: boolean;
//   sms: boolean;
//   push: boolean;
//   marketing: boolean;
//   priceAlerts: boolean;
//   newListings: boolean;
// }
// export interface PrivacySettings {
//   showPhone: boolean;
//   showEmail: boolean;
//   showAddress: boolean;
//   allowMessages: boolean;
//   profileVisibility: 'public' | 'private' | 'limited';
// }
// export interface PropertyViewing {
//   propertyId: string;
//   date: string;
//   notes?: string;
// }
// export interface Offer {
//   propertyId: string;
//   amount: number;
//   date: string;
//   status: 'pending' | 'accepted' | 'rejected';
// }
// export interface RentalHistory {
//   propertyId: string;
//   startDate: string;
//   endDate: string;
//   rentAmount: number;
//   landlordContact: string;
// }
// export interface Tenant {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   propertyId: string;
//   leaseStartDate: string;
//   leaseEndDate: string;
// }
// export interface MaintenanceRequest {
//   id: string;
//   propertyId: string;
//   description: string;
//   status: 'pending' | 'in-progress' | 'completed';
//   dateRequested: string;
//   dateCompleted?: string;
// }
// export interface Document {
//   id: string;
//   name: string;
//   type: 'identity' | 'proofOfAddress' | 'incomeStatement' | 'contract' | 'other';
//   url: string;
//   uploadDate: string;
//   status: 'pending' | 'approved' | 'rejected';
// }
// export interface Message {
//   id: string;
//   senderId: string;
//   receiverId: string;
//   subject: string;
//   content: string;
//   timestamp: string;
//   read: boolean;
//   propertyId?: string;
// }
// export interface Appointment {
//   id: string;
//   type: 'viewing' | 'meeting' | 'call';
//   date: string;
//   time: string;
//   withUser: string; // Other user's name or ID
//   propertyId?: string;
//   status: 'scheduled' | 'completed' | 'cancelled';
// }
// export const demoUser: UserProfile = {
//   id: 'user-001',
//   personalInfo: {
//     firstName: 'Alexandre',
//     lastName: 'Dubois',
//     email: 'alexandre.dubois@email.com',
//     phone: '+33 6 12 34 56 78',
//     avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
//     dateOfBirth: '1985-03-15',
//     nationality: 'Française',
//     languages: ['Français', 'Anglais', 'Espagnol'],
//     address: {
//       street: '15 Avenue des Champs-Élysées',
//       city: 'Paris',
//       postalCode: '75008',
//       country: 'France'
//     }
//   },
//   roles: [
//     {
//       type: 'buyer',
//       isActive: true,
//       level: 'intermediate',
//       joinDate: '2024-01-15',
//       specificData: {
//         budget: { min: 300000, max: 450000, preApproved: true },
//         searchCriteria: {
//           propertyTypes: ['Appartement', 'Maison'],
//           locations: ['Paris', 'Lyon', 'Marseille'],
//           features: ['Parking', 'Balcon', 'Ascenseur'],
//           urgency: 'medium'
//         },
//         viewingHistory: [
//           { propertyId: 'prop-001', date: '2024-06-20' },
//           { propertyId: 'prop-002', date: '2024-06-25' },
//         ],
//         offers: [
//           { propertyId: 'prop-003', amount: 380000, date: '2024-07-01', status: 'pending' },
//         ]
//       } as BuyerData
//     },
//     {
//       type: 'owner',
//       isActive: true,
//       level: 'expert',
//       joinDate: '2023-06-10',
//       specificData: {
//         properties: [
//           {
//             id: 'prop-004',
//             type: 'Appartement',
//             address: '10 Rue de Rivoli, Paris',
//             price: 1200,
//             images: ['https://source.unsplash.com/random/400x300?apartment1'],
//             features: ['2 chambres', '1 salle de bain', 'Meublé'],
//             status: 'Loué',
//             description: 'Bel appartement au cœur de Paris.',
//             area: 50,
//             bedrooms: 2,
//             bathrooms: 1,
//             yearBuilt: 1950,
//             furnished: true,
//             parking: false,
//             garden: false,
//             lastUpdated: '2024-05-01'
//           }
//         ],
//         rentalIncome: { monthly: 3200, yearly: 38400, occupancyRate: 95 },
//         tenants: [
//           { id: 'tenant-001', firstName: 'Marie', lastName: 'Curie', email: 'marie@example.com', propertyId: 'prop-004', leaseStartDate: '2023-09-01', leaseEndDate: '2025-08-31' }
//         ],
//         maintenanceRequests: []
//       } as OwnerData
//     },
//     {
//       type: 'seller',
//       isActive: false,
//       level: 'beginner',
//       joinDate: '2024-02-20',
//       specificData: {
//         properties: [],
//         marketingPreferences: { photoShoots: false, virtualTours: false, professionalStaging: false },
//         pricingStrategy: { initialPrice: 0, minimumPrice: 0, negotiable: true }
//       } as SellerData
//     }
//   ],
//   verification: {
//     identity: true,
//     email: true,
//     phone: true,
//     address: true,
//     income: true,
//     creditScore: 750
//   },
//   preferences: {
//     currency: 'EUR',
//     notifications: {
//       email: true,
//       sms: false,
//       push: true,
//       marketing: false,
//       priceAlerts: true,
//       newListings: true
//     },
//     privacy: {
//       showPhone: true,
//       showEmail: false,
//       showAddress: false,
//       allowMessages: true,
//       profileVisibility: 'public'
//     }
//   },
//   statistics: {
//     totalProperties: 3,
//     successfulTransactions: 7,
//     averageRating: 4.8,
//     totalReviews: 24,
//     responseTime: '< 2h',
//     activeListings: 2,
//     viewsReceived: 1547,
//     contactsReceived: 89,
//     joinDate: '2023-06-10'
//   },
//   activities: [
//     {
//       id: 'act-001',
//       type: 'viewing',
//       title: 'Visite programmée',
//       description: 'Appartement 3 pièces - Belleville',
//       date: '2024-07-08',
//       status: 'scheduled'
//     },
//     {
//       id: 'act-002',
//       type: 'offer',
//       title: 'Offre soumise',
//       description: 'Maison 4 pièces - Vincennes',
//       date: '2024-07-05',
//       status: 'pending'
//     },
//     {
//       id: 'act-003',
//       type: 'listing',
//       title: 'Annonce publiée',
//       description: 'Studio - République',
//       date: '2024-07-03',
//       status: 'active'
//     }
//   ],
//   documents: [
//     {
//       id: 'doc-001',
//       name: 'Passeport',
//       type: 'identity',
//       url: '/docs/passport.pdf',
//       uploadDate: '2023-08-01',
//       status: 'approved'
//     },
//     {
//       id: 'doc-002',
//       name: 'Justificatif de domicile',
//       type: 'proofOfAddress',
//       url: '/docs/proof_of_address.pdf',
//       uploadDate: '2023-08-05',
//       status: 'pending'
//     }
//   ],
//   favorites: [
//     {
//       id: 'fav-001',
//       type: 'Maison',
//       address: '20 Rue du Faubourg Saint-Honoré, Paris',
//       price: 950000,
//       images: ['https://source.unsplash.com/random/400x300?house'],
//       features: ['5 chambres', '3 salles de bain', 'Jardin', 'Piscine'],
//       status: 'À vendre',
//       description: 'Magnifique maison de ville avec jardin.',
//       area: 200,
//       bedrooms: 5,
//       bathrooms: 3,
//       yearBuilt: 1900,
//       furnished: false,
//       parking: true,
//       garden: true,
//       lastUpdated: '2024-06-10'
//     }
//   ],
//   messages: [
//     {
//       id: 'msg-001',
//       senderId: 'agent-001',
//       receiverId: 'user-001',
//       subject: 'Informations sur la propriété',
//       content: 'Bonjour Alexandre, je voulais vous fournir plus de détails sur la propriété à Vincennes.',
//       timestamp: '2024-07-05T10:30:00Z',
//       read: false,
//       propertyId: 'prop-002'
//     }
//   ],
//   appointments: [
//     {
//       id: 'appt-001',
//       type: 'viewing',
//       date: '2024-07-08',
//       time: '14:00',
//       withUser: 'Sophie Martin (Agent)',
//       propertyId: 'prop-001',
//       status: 'scheduled'
//     }
//   ]
// };

// Types et interfaces (updated for better UI alignment)
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
  appointments: Appointment[]; // Top-level appointments for general schedule
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
  // New/renamed fields to align with UI component
  savedSearches?: SavedSearch[]; // Collection of user's saved search configurations
  propertyViewings?: PropertyViewing[]; // A more detailed record of viewings
  offersMade?: Offer[]; // Offers made by the buyer
}

export interface SellerData {
  // Renamed for clarity in UI component
  listedProperties?: Property[]; // Properties the user is selling
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
  offersReceived?: Offer[]; // Offers received on their listed properties
  successfulSalesCount: number; // Statistic for seller
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
  maintenanceRequests?: MaintenanceRequest[]; // Maintenance requests made by the renter
  // Add saved searches for renters if they search for rentals
  savedRentalSearches?: SavedSearch[];
}

export interface OwnerData {
  // Renamed for clarity in UI component
  ownedProperties: Property[]; // Properties owned by the user (for rental or personal)
  rentalIncome: {
    monthly: number;
    yearly: number;
    occupancyRate: number;
  };
  tenants: Tenant[];
  maintenanceRequests: MaintenanceRequest[]; // Maintenance requests for their properties
  publishedRentalListings: Property[]; // Properties they have listed for rent
}

export interface AgentData {
  agencyName: string;
  licenseNumber: string;
  specialties: string[];
  // Renamed for clarity in UI component
  mandates: Mandate[]; // Properties they have mandates to sell/rent
  clients: string[]; // User IDs of their clients
  appointments: Appointment[]; // Appointments specific to the agent's role
  successfulTransactionsCount: number;
}

export interface DeveloperData {
  companyName: string;
  projects: DevelopmentProject[]; // Properties representing projects
  developmentAreas: string[];
  fundsRaised: number;
  unitsSold: number;
}

export interface Property {
  id: string;
  type: string;
  address: string;
  price: number;
  images: string[];
  features: string[];
  status: string; // e.g., 'active', 'sold', 'rented', 'pending'
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
  location?: { lat: number; lng: number }; // Added for potential map integration
}

export interface UserStatistics {
  totalPropertiesManaged: number; // Can be owned, listed, or developed
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
  type: string; // e.g., 'viewing', 'offer', 'listing', 'contract_signed'
  title: string;
  description: string;
  date: string;
  status: string; // e.g., 'scheduled', 'completed', 'pending', 'active'
  relatedPropertyId?: string;
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
  propertyName: string; // Added for display in UI
  date: string;
  time: string; // Added for display in UI
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'; // Added status
}

export interface Offer {
  id: string; // Added ID for unique keys
  propertyId: string;
  propertyAddress: string; // Added for display in UI
  amount: number;
  date: string;
  status: 'pending' | 'accepted' | 'rejected' | 'negotiating';
  buyerName: string; // Added for display in UI
}

export interface RentalHistory {
  propertyId: string;
  propertyName: string; // Added for display in UI
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
  propertyName: string; // Added for display in UI
  leaseStartDate: string;
  leaseEndDate: string;
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  propertyName: string; // Added for display in UI
  issue: string; // Renamed description to issue for clarity
  description: string; // More detailed description
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
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
  type: 'viewing' | 'meeting' | 'call' | 'signing';
  date: string;
  time: string;
  withUser: string; // Other user's name or ID
  propertyId?: string;
  propertyAddress?: string; // Added for display
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface SavedSearch {
  id: string;
  name: string;
  location: string;
  budget?: { min: number; max: number };
  propertyType?: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
  lastRunDate: string;
}

export interface Mandate {
  id: string;
  propertyId: string;
  propertyAddress: string;
  type: 'sale' | 'rental';
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'completed';
}

export interface DevelopmentProject {
  id: string;
  name: string;
  location: string;
  unitsAvailable: number;
  status: 'planning' | 'construction' | 'completed';
  estimatedCompletion: string;
}

// --- Updated demoUser with more realistic and complete data based on UI needs ---
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
        savedSearches: [
          { id: 'ss-001', name: 'Appart Paris 3P', location: 'Paris', budget: { min: 350000, max: 400000 }, propertyType: ['Appartement'], frequency: 'daily', lastRunDate: '2025-07-07' },
          { id: 'ss-002', name: 'Maison Lyon', location: 'Lyon', budget: { min: 400000, max: 500000 }, propertyType: ['Maison'], frequency: 'weekly', lastRunDate: '2025-07-05' },
        ],
        propertyViewings: [
          { propertyId: 'prop-001', propertyName: 'Appartement Saint-Germain', date: '2025-06-20', time: '10:00', status: 'completed' },
          { propertyId: 'prop-002', propertyName: 'Maison Neuilly', date: '2025-07-10', time: '15:30', status: 'scheduled' },
          { propertyId: 'prop-003', propertyName: 'Studio Marais', date: '2025-07-12', time: '11:00', status: 'scheduled' },
        ],
        offersMade: [
          { id: 'off-001', propertyId: 'prop-001', propertyAddress: '12 Rue des Beaux-Arts, Paris', amount: 380000, date: '2025-07-01', status: 'pending', buyerName: 'Alexandre Dubois' },
        ]
      } as BuyerData
    },
    {
      type: 'owner',
      isActive: true,
      level: 'expert',
      joinDate: '2023-06-10',
      specificData: {
        ownedProperties: [
          {
            id: 'prop-004',
            type: 'Appartement',
            address: '10 Rue de Rivoli, Paris',
            price: 550000, // This is purchase price for owned, not rental price
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
            lastUpdated: '2025-05-01'
          }
        ],
        rentalIncome: { monthly: 1200, yearly: 14400, occupancyRate: 95 },
        tenants: [
          { id: 'tenant-001', firstName: 'Marie', lastName: 'Curie', email: 'marie@example.com', propertyId: 'prop-004', propertyName: '10 Rue de Rivoli, Paris', leaseStartDate: '2023-09-01', leaseEndDate: '2025-08-31' }
        ],
        maintenanceRequests: [
          { id: 'maint-001', propertyId: 'prop-004', propertyName: '10 Rue de Rivoli, Paris', issue: 'Robinet qui fuit', description: 'Le robinet de la cuisine fuit constamment.', status: 'pending', dateRequested: '2025-06-28' }
        ],
        publishedRentalListings: [
          {
            id: 'prop-005',
            type: 'Studio',
            address: '25 Rue du Temple, Paris',
            price: 850, // Rental price
            images: ['https://source.unsplash.com/random/400x300?studio'],
            features: ['1 pièce', 'Meublé', 'Proche métro'],
            status: 'active',
            description: 'Joli studio bien situé.',
            area: 25,
            bedrooms: 0,
            bathrooms: 1,
            yearBuilt: 1980,
            furnished: true,
            parking: false,
            garden: false,
            lastUpdated: '2025-07-01'
          }
        ]
      } as OwnerData
    },
    {
      type: 'seller',
      isActive: true, // Changed to active for demonstration
      level: 'beginner',
      joinDate: '2024-02-20',
      specificData: {
        listedProperties: [
          {
            id: 'prop-006',
            type: 'Maison',
            address: '5 Allée des Rossignols, Lyon',
            price: 750000,
            images: ['https://source.unsplash.com/random/400x300?house-lyon'],
            features: ['4 chambres', '2 salles de bain', 'Jardin'],
            status: 'active',
            description: 'Belle maison familiale avec grand jardin.',
            area: 180,
            bedrooms: 4,
            bathrooms: 2,
            yearBuilt: 1995,
            furnished: false,
            parking: true,
            garden: true,
            lastUpdated: '2025-06-15'
          }
        ],
        marketingPreferences: { photoShoots: true, virtualTours: true, professionalStaging: false },
        pricingStrategy: { initialPrice: 780000, minimumPrice: 700000, negotiable: true },
        offersReceived: [
          { id: 'off-002', propertyId: 'prop-006', propertyAddress: '5 Allée des Rossignols, Lyon', amount: 720000, date: '2025-07-03', status: 'pending', buyerName: 'Jean Valjean' },
          { id: 'off-003', propertyId: 'prop-006', propertyAddress: '5 Allée des Rossignols, Lyon', amount: 750000, date: '2025-07-06', status: 'accepted', buyerName: 'Cosette Pontmercy' },
        ],
        successfulSalesCount: 1,
      } as SellerData
    },
    {
      type: 'renter',
      isActive: true,
      level: 'intermediate',
      joinDate: '2024-03-01',
      specificData: {
        rentalBudget: { monthlyMax: 1500, depositAvailable: 3000 },
        leasePreferences: { duration: '1 an', furnished: true, petsAllowed: false },
        rentalHistory: [
          { propertyId: 'prop-007', propertyName: 'Appartement Haussmannien, Bordeaux', startDate: '2022-09-01', endDate: '2024-08-31', rentAmount: 1100, landlordContact: 'Mme. Durand' }
        ],
        maintenanceRequests: [
          { id: 'maint-002', propertyId: 'prop-007', propertyName: 'Appartement Haussmannien, Bordeaux', issue: 'Problème de chauffage', description: 'Le chauffage ne fonctionne pas correctement dans le salon.', status: 'in-progress', dateRequested: '2025-07-01' }
        ],
        savedRentalSearches: [
          { id: 'rss-001', name: 'Appart Rennes 2P', location: 'Rennes', budget: { min: 800, max: 1000 }, propertyType: ['Appartement'], frequency: 'weekly', lastRunDate: '2025-07-04' }
        ]
      } as RenterData
    },
    {
      type: 'agent',
      isActive: true,
      level: 'professional',
      joinDate: '2021-01-01',
      specificData: {
        agencyName: 'Agence Immobilière Prestige',
        licenseNumber: 'AGNT-001-FR',
        specialties: ['Vente Luxe', 'Location Commerciale'],
        mandates: [
          { id: 'mand-001', propertyId: 'prop-008', propertyAddress: '3 Rue de la Paix, Paris', type: 'sale', startDate: '2025-01-01', endDate: '2025-12-31', status: 'active' },
          { id: 'mand-002', propertyId: 'prop-009', propertyAddress: '1 Grand Place, Lille', type: 'rental', startDate: '2025-03-01', endDate: '2026-02-28', status: 'active' },
        ],
        clients: ['client-A', 'client-B'],
        appointments: [
          { id: 'appt-002', type: 'viewing', date: '2025-07-08', time: '11:00', withUser: 'Client Dupont', propertyId: 'prop-008', propertyAddress: '3 Rue de la Paix, Paris', status: 'scheduled' },
          { id: 'appt-003', type: 'meeting', date: '2025-07-09', time: '10:00', withUser: 'Propriétaire Martin', status: 'scheduled' },
        ],
        successfulTransactionsCount: 15,
      } as AgentData
    },
    {
      type: 'developer',
      isActive: true,
      level: 'expert',
      joinDate: '2020-05-01',
      specificData: {
        companyName: 'Urban Innovations SARL',
        projects: [
          { id: 'dev-proj-001', name: 'Résidence Verte', location: 'Nantes', unitsAvailable: 50, status: 'construction', estimatedCompletion: '2026-06-30' },
          { id: 'dev-proj-002', name: 'Les Docks Réinventés', location: 'Marseille', unitsAvailable: 120, status: 'planning', estimatedCompletion: '2027-12-31' },
        ],
        developmentAreas: ['Logements Résidentiels', 'Bureaux'],
        fundsRaised: 50000000,
        unitsSold: 75,
      } as DeveloperData
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
    totalPropertiesManaged: 3, // Combined (owned, listed, developed)
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
      date: '2025-07-08',
      status: 'scheduled',
      relatedPropertyId: 'prop-002'
    },
    {
      id: 'act-002',
      type: 'offer',
      title: 'Offre soumise',
      description: 'Maison 4 pièces - Vincennes',
      date: '2025-07-05',
      status: 'pending',
      relatedPropertyId: 'prop-001'
    },
    {
      id: 'act-003',
      type: 'listing',
      title: 'Annonce publiée',
      description: 'Studio - République',
      date: '2025-07-03',
      status: 'active',
      relatedPropertyId: 'prop-005'
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
      lastUpdated: '2025-06-10'
    }
  ],
  messages: [
    {
      id: 'msg-001',
      senderId: 'agent-001',
      receiverId: 'user-001',
      subject: 'Informations sur la propriété',
      content: 'Bonjour Alexandre, je voulais vous fournir plus de détails sur la propriété à Vincennes.',
      timestamp: '2025-07-05T10:30:00Z',
      read: false,
      propertyId: 'prop-002'
    }
  ],
  appointments: [ // Top-level appointments, general to user, can be for any role
    {
      id: 'appt-001',
      type: 'viewing',
      date: '2025-07-08',
      time: '14:00',
      withUser: 'Sophie Martin (Agent)',
      propertyId: 'prop-001',
      propertyAddress: '7 Rue des Fleurs, Paris',
      status: 'scheduled'
    }
  ]
};