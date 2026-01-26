
export type PropertyType =
  | 'villa' | 'apartment' | 'house' | 'penthouse'
  | 'studio' | 'loft' | 'office' | 'chalet'
  | 'hotel' | 'land' | 'commercial';
export type ActionType = 'sale' | 'rent';

// Booking flow types for navigation control
export type BookingFlowType = 'direct' | 'visit_required' | 'visit_optional';

// Payment timing for reservations
export type PaymentTiming = 'upfront' | 'on_arrival' | 'monthly' | 'negotiable';

// Cancellation policy strictness
export type CancellationPolicy = 'flexible' | 'moderate' | 'strict' | 'non_refundable';

// Property category for grouping similar behaviors
export type PropertyCategory = 'residential' | 'vacation' | 'professional' | 'land' | 'investment';

export interface PropertyFieldConfig {
  show: boolean;
  label: string;
  placeholder: string;
  required: boolean;
  helpText?: string;
}

// Advanced booking flow configuration
export interface BookingFlowConfig {
  // Core flow control
  flowType: BookingFlowType;
  skipVisitForRent: boolean;
  skipVisitForSale: boolean;
  instantBookingAllowed: boolean;

  // Navigation targets
  directBookingRoute: '/booking/Bookingscreen' | '/booking/HotelBookingScreen';
  visitRoute: '/booking/VisitScreen';

  // Payment configuration
  paymentTiming: PaymentTiming;
  depositRequired: boolean;
  depositPercentage?: number; // Percentage of total for deposit

  // Cancellation
  cancellationPolicy: CancellationPolicy;
  freeCancellationDays?: number; // Days before for free cancellation

  // User messaging
  visitOptionalMessage?: string;
  directBookingMessage?: string;
  instantBookingMessage?: string;
}

export interface PropertyTypeConfig {
  displayName: string;
  icon: string;
  category: PropertyCategory;
  visitRequired: boolean;
  visitOptionalMessage?: string; // Message if the visit is optional

  // Advanced booking flow configuration
  bookingFlow: BookingFlowConfig;

  fields: {
    // Booking fields
    startDate?: PropertyFieldConfig;
    endDate?: PropertyFieldConfig;
    checkInDate?: PropertyFieldConfig;
    checkOutDate?: PropertyFieldConfig;
    numberOfNights?: PropertyFieldConfig;
    numberOfOccupants?: PropertyFieldConfig;
    numberOfGuests?: PropertyFieldConfig;
    numberOfRooms?: PropertyFieldConfig;
    roomType?: PropertyFieldConfig;
    hasGuarantor?: PropertyFieldConfig;
    monthlyIncome?: PropertyFieldConfig;
    budget?: PropertyFieldConfig;
    financingType?: PropertyFieldConfig;
    intendedUse?: PropertyFieldConfig; // For land plots
    constructionPlan?: PropertyFieldConfig;
    specialRequirements?: PropertyFieldConfig;
  };
  validation: {
    minBudget?: number;
    maxOccupants?: number;
    incomeMultiplier?: number; // Rent multiplier for income
  };
  bookingText: {
    title: string;
    submitButton: string;
    successMessage: string;
  };
}

// Configuration for HOTEL for RENT
const hotelRentConfig: PropertyTypeConfig = {
  displayName: 'Hôtel',
  icon: 'office-building',
  category: 'vacation',
  visitRequired: false,
  visitOptionalMessage: 'Pour un hôtel, la visite n\'est pas obligatoire. Vous pouvez réserver directement ou visiter avant si vous le souhaitez.',
  bookingFlow: {
    flowType: 'direct',
    skipVisitForRent: true,
    skipVisitForSale: false,
    instantBookingAllowed: true,
    directBookingRoute: '/booking/HotelBookingScreen',
    visitRoute: '/booking/VisitScreen',
    paymentTiming: 'on_arrival',
    depositRequired: true,
    depositPercentage: 30,
    cancellationPolicy: 'moderate',
    freeCancellationDays: 2,
    directBookingMessage: 'Réservez directement votre chambre d\'hôtel sans visite préalable.',
    instantBookingMessage: 'Confirmation instantanée de votre réservation.'
  },
  fields: {
    checkInDate: {
      show: true,
      label: 'Date d\'arrivée',
      placeholder: 'Sélectionnez votre date d\'arrivée',
      required: true,
      helpText: 'Date de début de votre séjour'
    },
    checkOutDate: {
      show: true,
      label: 'Date de départ',
      placeholder: 'Sélectionnez votre date de départ',
      required: true,
      helpText: 'Date de fin de votre séjour'
    },
    numberOfGuests: {
      show: true,
      label: 'Nombre de personnes',
      placeholder: 'Nombre de voyageurs',
      required: true
    },
    numberOfRooms: {
      show: true,
      label: 'Nombre de chambres',
      placeholder: 'Chambres souhaitées',
      required: true
    },
    roomType: {
      show: true,
      label: 'Type de chambre',
      placeholder: 'Standard, Deluxe, Suite...',
      required: false
    },
    specialRequirements: {
      show: true,
      label: 'Demandes spéciales',
      placeholder: 'Lit bébé, vue mer, étage élevé...',
      required: false
    }
  },
  validation: {
    maxOccupants: 10
  },
  bookingText: {
    title: 'Réserver votre séjour',
    submitButton: 'Confirmer la réservation',
    successMessage: 'Votre réservation d\'hôtel a été envoyée avec succès !'
  }
};

// Configuration for HOTEL for SALE
const hotelSaleConfig: PropertyTypeConfig = {
  displayName: 'Hôtel',
  icon: 'office-building',
  category: 'investment',
  visitRequired: true,
  bookingFlow: {
    flowType: 'visit_required',
    skipVisitForRent: true,
    skipVisitForSale: false,
    instantBookingAllowed: false,
    directBookingRoute: '/booking/Bookingscreen',
    visitRoute: '/booking/VisitScreen',
    paymentTiming: 'negotiable',
    depositRequired: true,
    depositPercentage: 10,
    cancellationPolicy: 'strict',
    freeCancellationDays: 0
  },
  fields: {
    budget: {
      show: true,
      label: 'Budget d\'investissement (€)',
      placeholder: 'Votre budget d\'achat',
      required: true
    },
    financingType: {
      show: true,
      label: 'Type de financement',
      placeholder: 'Crédit, Comptant...',
      required: true
    },
    intendedUse: {
      show: true,
      label: 'Usage prévu',
      placeholder: 'Exploitation hôtelière, reconversion...',
      required: true,
      helpText: 'Comment comptez-vous utiliser cet hôtel ?'
    },
    specialRequirements: {
      show: true,
      label: 'Exigences particulières',
      placeholder: 'Capacité minimale, équipements...',
      required: false
    }
  },
  validation: {},
  bookingText: {
    title: 'Manifester votre intérêt',
    submitButton: 'Envoyer ma proposition',
    successMessage: 'Votre manifestation d\'intérêt a été envoyée !'
  }
};

// Configuration for APARTMENT for RENT
const apartmentRentConfig: PropertyTypeConfig = {
  displayName: 'Appartement',
  icon: 'home-city',
  category: 'residential',
  visitRequired: true,
  bookingFlow: {
    flowType: 'visit_required',
    skipVisitForRent: false,
    skipVisitForSale: false,
    instantBookingAllowed: false,
    directBookingRoute: '/booking/Bookingscreen',
    visitRoute: '/booking/VisitScreen',
    paymentTiming: 'monthly',
    depositRequired: true,
    depositPercentage: 100, // 1 month deposit
    cancellationPolicy: 'moderate',
    freeCancellationDays: 7
  },
  fields: {
    startDate: {
      show: true,
      label: 'Date de début du bail',
      placeholder: 'Date d\'emménagement',
      required: true
    },
    endDate: {
      show: true,
      label: 'Date de fin du bail',
      placeholder: 'Date de fin souhaitée',
      required: true
    },
    numberOfOccupants: {
      show: true,
      label: 'Nombre d\'occupants',
      placeholder: 'Personnes vivant dans l\'appartement',
      required: true
    },
    hasGuarantor: {
      show: true,
      label: 'Garant',
      placeholder: 'Avez-vous un garant ?',
      required: true,
      helpText: 'Un garant peut renforcer votre dossier'
    },
    monthlyIncome: {
      show: true,
      label: 'Revenu mensuel net (€)',
      placeholder: 'Votre revenu mensuel',
      required: true,
      helpText: 'Doit être au moins 3x le loyer'
    }
  },
  validation: {
    incomeMultiplier: 3,
    maxOccupants: 8
  },
  bookingText: {
    title: 'Réserver cet appartement',
    submitButton: 'Soumettre ma candidature',
    successMessage: 'Votre demande de location a été envoyée !'
  }
};

// Configuration for APARTMENT for SALE
const apartmentSaleConfig: PropertyTypeConfig = {
  displayName: 'Appartement',
  icon: 'home-city',
  category: 'residential',
  visitRequired: true,
  bookingFlow: {
    flowType: 'visit_required',
    skipVisitForRent: false,
    skipVisitForSale: false,
    instantBookingAllowed: false,
    directBookingRoute: '/booking/Bookingscreen',
    visitRoute: '/booking/VisitScreen',
    paymentTiming: 'negotiable',
    depositRequired: true,
    depositPercentage: 10,
    cancellationPolicy: 'strict',
    freeCancellationDays: 0
  },
  fields: {
    budget: {
      show: true,
      label: 'Budget maximum (€)',
      placeholder: 'Votre budget d\'achat',
      required: true
    },
    financingType: {
      show: true,
      label: 'Type de financement',
      placeholder: 'Crédit, Comptant, Mixte',
      required: true
    }
  },
  validation: {},
  bookingText: {
    title: 'Acheter cet appartement',
    submitButton: 'Envoyer mon offre',
    successMessage: 'Votre offre d\'achat a été transmise !'
  }
};

// Configuration for VILLA for RENT
const villaRentConfig: PropertyTypeConfig = {
  displayName: 'Villa',
  icon: 'home-variant',
  category: 'residential',
  visitRequired: true,
  bookingFlow: {
    flowType: 'visit_required',
    skipVisitForRent: false,
    skipVisitForSale: false,
    instantBookingAllowed: false,
    directBookingRoute: '/booking/Bookingscreen',
    visitRoute: '/booking/VisitScreen',
    paymentTiming: 'monthly',
    depositRequired: true,
    depositPercentage: 200, // 2 months deposit for villas
    cancellationPolicy: 'moderate',
    freeCancellationDays: 7
  },
  fields: {
    startDate: {
      show: true,
      label: 'Date de début',
      placeholder: 'Date d\'emménagement',
      required: true
    },
    endDate: {
      show: true,
      label: 'Date de fin',
      placeholder: 'Date de fin du bail',
      required: true
    },
    numberOfOccupants: {
      show: true,
      label: 'Nombre d\'occupants',
      placeholder: 'Personnes vivant dans la villa',
      required: true
    },
    hasGuarantor: {
      show: true,
      label: 'Garant',
      placeholder: 'Avez-vous un garant ?',
      required: true
    },
    monthlyIncome: {
      show: true,
      label: 'Revenu mensuel net (€)',
      placeholder: 'Votre revenu mensuel',
      required: true,
      helpText: 'Doit être au moins 3x le loyer'
    },
    specialRequirements: {
      show: true,
      label: 'Exigences particulières',
      placeholder: 'Piscine, jardin, garage...',
      required: false
    }
  },
  validation: {
    incomeMultiplier: 3,
    maxOccupants: 12
  },
  bookingText: {
    title: 'Réserver cette villa',
    submitButton: 'Soumettre ma candidature',
    successMessage: 'Votre demande de location a été envoyée !'
  }
};

// Configuration for VILLA for SALE
const villaSaleConfig: PropertyTypeConfig = {
  displayName: 'Villa',
  icon: 'home-variant',
  category: 'residential',
  visitRequired: true,
  bookingFlow: {
    flowType: 'visit_required',
    skipVisitForRent: false,
    skipVisitForSale: false,
    instantBookingAllowed: false,
    directBookingRoute: '/booking/Bookingscreen',
    visitRoute: '/booking/VisitScreen',
    paymentTiming: 'negotiable',
    depositRequired: true,
    depositPercentage: 10,
    cancellationPolicy: 'strict',
    freeCancellationDays: 0
  },
  fields: {
    budget: {
      show: true,
      label: 'Budget maximum (€)',
      placeholder: 'Votre budget d\'achat',
      required: true
    },
    financingType: {
      show: true,
      label: 'Type de financement',
      placeholder: 'Crédit, Comptant, Mixte',
      required: true
    },
    specialRequirements: {
      show: true,
      label: 'Critères recherchés',
      placeholder: 'Piscine, vue mer, terrain...',
      required: false
    }
  },
  validation: {},
  bookingText: {
    title: 'Acheter cette villa',
    submitButton: 'Envoyer mon offre',
    successMessage: 'Votre offre d\'achat a été transmise !'
  }
};

// Configuration for HOUSE for RENT
const houseRentConfig: PropertyTypeConfig = {
  displayName: 'Maison',
  icon: 'home',
  category: 'residential',
  visitRequired: true,
  bookingFlow: {
    flowType: 'visit_required',
    skipVisitForRent: false,
    skipVisitForSale: false,
    instantBookingAllowed: false,
    directBookingRoute: '/booking/Bookingscreen',
    visitRoute: '/booking/VisitScreen',
    paymentTiming: 'monthly',
    depositRequired: true,
    depositPercentage: 100,
    cancellationPolicy: 'moderate',
    freeCancellationDays: 7
  },
  fields: {
    startDate: {
      show: true,
      label: 'Date de début du bail',
      placeholder: 'Date d\'emménagement',
      required: true
    },
    endDate: {
      show: true,
      label: 'Date de fin du bail',
      placeholder: 'Date de fin souhaitée',
      required: true
    },
    numberOfOccupants: {
      show: true,
      label: 'Nombre d\'occupants',
      placeholder: 'Personnes vivant dans la maison',
      required: true
    },
    hasGuarantor: {
      show: true,
      label: 'Garant',
      placeholder: 'Avez-vous un garant ?',
      required: true
    },
    monthlyIncome: {
      show: true,
      label: 'Revenu mensuel net (€)',
      placeholder: 'Votre revenu mensuel',
      required: true,
      helpText: 'Doit être au moins 3x le loyer'
    }
  },
  validation: {
    incomeMultiplier: 3,
    maxOccupants: 10
  },
  bookingText: {
    title: 'Réserver cette maison',
    submitButton: 'Soumettre ma candidature',
    successMessage: 'Votre demande de location a été envoyée !'
  }
};

// Configuration for HOUSE for SALE
const houseSaleConfig: PropertyTypeConfig = {
  displayName: 'Maison',
  icon: 'home',
  category: 'residential',
  visitRequired: true,
  bookingFlow: {
    flowType: 'visit_required',
    skipVisitForRent: false,
    skipVisitForSale: false,
    instantBookingAllowed: false,
    directBookingRoute: '/booking/Bookingscreen',
    visitRoute: '/booking/VisitScreen',
    paymentTiming: 'negotiable',
    depositRequired: true,
    depositPercentage: 10,
    cancellationPolicy: 'strict',
    freeCancellationDays: 0
  },
  fields: {
    budget: {
      show: true,
      label: 'Budget maximum (€)',
      placeholder: 'Votre budget d\'achat',
      required: true
    },
    financingType: {
      show: true,
      label: 'Type de financement',
      placeholder: 'Crédit, Comptant, Mixte',
      required: true
    }
  },
  validation: {},
  bookingText: {
    title: 'Acheter cette maison',
    submitButton: 'Envoyer mon offre',
    successMessage: 'Votre offre d\'achat a été transmise !'
  }
};

// Configuration for LAND for SALE
const landSaleConfig: PropertyTypeConfig = {
  displayName: 'Terrain',
  icon: 'image-filter-hdr',
  category: 'land',
  visitRequired: true,
  bookingFlow: {
    flowType: 'visit_required',
    skipVisitForRent: false,
    skipVisitForSale: false,
    instantBookingAllowed: false,
    directBookingRoute: '/booking/Bookingscreen',
    visitRoute: '/booking/VisitScreen',
    paymentTiming: 'negotiable',
    depositRequired: true,
    depositPercentage: 10,
    cancellationPolicy: 'strict',
    freeCancellationDays: 0
  },
  fields: {
    budget: {
      show: true,
      label: 'Budget maximum (€)',
      placeholder: 'Votre budget d\'achat',
      required: true
    },
    financingType: {
      show: true,
      label: 'Type de financement',
      placeholder: 'Crédit, Comptant, Mixte',
      required: true
    },
    intendedUse: {
      show: true,
      label: 'Usage prévu du terrain',
      placeholder: 'Construction, Agriculture, Investissement...',
      required: true,
      helpText: 'Comment comptez-vous utiliser ce terrain ?'
    },
    constructionPlan: {
      show: true,
      label: 'Projet de construction',
      placeholder: 'Villa, Immeuble, Usage commercial...',
      required: false,
      helpText: 'Si vous prévoyez de construire'
    }
  },
  validation: {},
  bookingText: {
    title: 'Acheter ce terrain',
    submitButton: 'Envoyer mon offre',
    successMessage: 'Votre offre d\'achat a été transmise !'
  }
};

// Configuration for LAND for RENT
const landRentConfig: PropertyTypeConfig = {
  displayName: 'Terrain',
  icon: 'image-filter-hdr',
  visitRequired: true,
  fields: {
    startDate: {
      show: true,
      label: 'Date de début de location',
      placeholder: 'Date de début',
      required: true
    },
    endDate: {
      show: true,
      label: 'Date de fin de location',
      placeholder: 'Date de fin',
      required: true
    },
    intendedUse: {
      show: true,
      label: 'Usage prévu du terrain',
      placeholder: 'Agriculture, Événements, Parking...',
      required: true,
      helpText: 'Comment comptez-vous utiliser ce terrain ?'
    },
    monthlyIncome: {
      show: true,
      label: 'Revenu mensuel (€)',
      placeholder: 'Votre revenu mensuel',
      required: true
    }
  },
  validation: {
    incomeMultiplier: 2
  },
  bookingText: {
    title: 'Louer ce terrain',
    submitButton: 'Soumettre ma demande',
    successMessage: 'Votre demande de location a été envoyée !'
  }
};

// Configuration for PENTHOUSE for RENT
const penthouseRentConfig: PropertyTypeConfig = {
  displayName: 'Penthouse',
  icon: 'office-building-marker',
  visitRequired: true,
  fields: {
    startDate: {
      show: true,
      label: 'Date de début du bail',
      placeholder: 'Date d\'emménagement',
      required: true
    },
    endDate: {
      show: true,
      label: 'Date de fin du bail',
      placeholder: 'Date de fin souhaitée',
      required: true
    },
    numberOfOccupants: {
      show: true,
      label: 'Nombre d\'occupants',
      placeholder: 'Personnes vivant dans le penthouse',
      required: true
    },
    hasGuarantor: {
      show: true,
      label: 'Garant',
      placeholder: 'Avez-vous un garant ?',
      required: true,
      helpText: 'Un garant est souvent requis pour ce type de bien premium'
    },
    monthlyIncome: {
      show: true,
      label: 'Revenu mensuel net (€)',
      placeholder: 'Votre revenu mensuel',
      required: true,
      helpText: 'Doit être au moins 4x le loyer'
    }
  },
  validation: {
    incomeMultiplier: 4,
    maxOccupants: 6
  },
  bookingText: {
    title: 'Réserver ce penthouse',
    submitButton: 'Soumettre ma candidature',
    successMessage: 'Votre demande de location a été envoyée !'
  }
};

// Configuration for PENTHOUSE for SALE
const penthouseSaleConfig: PropertyTypeConfig = {
  displayName: 'Penthouse',
  icon: 'office-building-marker',
  visitRequired: true,
  fields: {
    budget: {
      show: true,
      label: 'Budget maximum (€)',
      placeholder: 'Votre budget d\'achat',
      required: true
    },
    financingType: {
      show: true,
      label: 'Type de financement',
      placeholder: 'Crédit, Comptant, Mixte',
      required: true
    },
    specialRequirements: {
      show: true,
      label: 'Critères recherchés',
      placeholder: 'Terrasse, vue panoramique, jacuzzi...',
      required: false
    }
  },
  validation: {},
  bookingText: {
    title: 'Acheter ce penthouse',
    submitButton: 'Envoyer mon offre',
    successMessage: 'Votre offre d\'achat a été transmise !'
  }
};

// Configuration for STUDIO for RENT
const studioRentConfig: PropertyTypeConfig = {
  displayName: 'Studio',
  icon: 'door',
  visitRequired: true,
  fields: {
    startDate: {
      show: true,
      label: 'Date de début du bail',
      placeholder: 'Date d\'emménagement',
      required: true
    },
    endDate: {
      show: true,
      label: 'Date de fin du bail',
      placeholder: 'Date de fin souhaitée',
      required: true
    },
    numberOfOccupants: {
      show: true,
      label: 'Nombre d\'occupants',
      placeholder: 'Personnes vivant dans le studio',
      required: true
    },
    hasGuarantor: {
      show: true,
      label: 'Garant',
      placeholder: 'Avez-vous un garant ?',
      required: true
    },
    monthlyIncome: {
      show: true,
      label: 'Revenu mensuel net (€)',
      placeholder: 'Votre revenu mensuel',
      required: true,
      helpText: 'Doit être au moins 3x le loyer'
    }
  },
  validation: {
    incomeMultiplier: 3,
    maxOccupants: 2
  },
  bookingText: {
    title: 'Réserver ce studio',
    submitButton: 'Soumettre ma candidature',
    successMessage: 'Votre demande de location a été envoyée !'
  }
};

// Configuration for STUDIO for SALE
const studioSaleConfig: PropertyTypeConfig = {
  displayName: 'Studio',
  icon: 'door',
  visitRequired: true,
  fields: {
    budget: {
      show: true,
      label: 'Budget maximum (€)',
      placeholder: 'Votre budget d\'achat',
      required: true
    },
    financingType: {
      show: true,
      label: 'Type de financement',
      placeholder: 'Crédit, Comptant, Mixte',
      required: true
    }
  },
  validation: {},
  bookingText: {
    title: 'Acheter ce studio',
    submitButton: 'Envoyer mon offre',
    successMessage: 'Votre offre d\'achat a été transmise !'
  }
};

// Configuration for LOFT for RENT
const loftRentConfig: PropertyTypeConfig = {
  displayName: 'Loft',
  icon: 'warehouse',
  visitRequired: true,
  fields: {
    startDate: {
      show: true,
      label: 'Date de début du bail',
      placeholder: 'Date d\'emménagement',
      required: true
    },
    endDate: {
      show: true,
      label: 'Date de fin du bail',
      placeholder: 'Date de fin souhaitée',
      required: true
    },
    numberOfOccupants: {
      show: true,
      label: 'Nombre d\'occupants',
      placeholder: 'Personnes vivant dans le loft',
      required: true
    },
    hasGuarantor: {
      show: true,
      label: 'Garant',
      placeholder: 'Avez-vous un garant ?',
      required: true
    },
    monthlyIncome: {
      show: true,
      label: 'Revenu mensuel net (€)',
      placeholder: 'Votre revenu mensuel',
      required: true,
      helpText: 'Doit être au moins 3x le loyer'
    },
    specialRequirements: {
      show: true,
      label: 'Exigences particulières',
      placeholder: 'Mezzanine, hauteur sous plafond...',
      required: false
    }
  },
  validation: {
    incomeMultiplier: 3,
    maxOccupants: 6
  },
  bookingText: {
    title: 'Réserver ce loft',
    submitButton: 'Soumettre ma candidature',
    successMessage: 'Votre demande de location a été envoyée !'
  }
};

// Configuration for LOFT for SALE
const loftSaleConfig: PropertyTypeConfig = {
  displayName: 'Loft',
  icon: 'warehouse',
  visitRequired: true,
  fields: {
    budget: {
      show: true,
      label: 'Budget maximum (€)',
      placeholder: 'Votre budget d\'achat',
      required: true
    },
    financingType: {
      show: true,
      label: 'Type de financement',
      placeholder: 'Crédit, Comptant, Mixte',
      required: true
    },
    specialRequirements: {
      show: true,
      label: 'Critères recherchés',
      placeholder: 'Hauteur, verrière, espaces ouverts...',
      required: false
    }
  },
  validation: {},
  bookingText: {
    title: 'Acheter ce loft',
    submitButton: 'Envoyer mon offre',
    successMessage: 'Votre offre d\'achat a été transmise !'
  }
};

// Configuration for OFFICE for RENT
const officeRentConfig: PropertyTypeConfig = {
  displayName: 'Bureau',
  icon: 'briefcase',
  visitRequired: true,
  fields: {
    startDate: {
      show: true,
      label: 'Date de début du bail',
      placeholder: 'Date d\'entrée dans les locaux',
      required: true
    },
    endDate: {
      show: true,
      label: 'Date de fin du bail',
      placeholder: 'Date de fin souhaitée',
      required: true
    },
    numberOfOccupants: {
      show: true,
      label: 'Nombre d\'employés',
      placeholder: 'Personnes travaillant dans le bureau',
      required: true
    },
    intendedUse: {
      show: true,
      label: 'Activité professionnelle',
      placeholder: 'Type d\'activité exercée',
      required: true,
      helpText: 'Décrivez votre activité professionnelle'
    },
    specialRequirements: {
      show: true,
      label: 'Besoins spécifiques',
      placeholder: 'Salle de réunion, parking, accès PMR...',
      required: false
    }
  },
  validation: {
    maxOccupants: 50
  },
  bookingText: {
    title: 'Louer ce bureau',
    submitButton: 'Soumettre ma demande',
    successMessage: 'Votre demande de location a été envoyée !'
  }
};

// Configuration for OFFICE for SALE
const officeSaleConfig: PropertyTypeConfig = {
  displayName: 'Bureau',
  icon: 'briefcase',
  visitRequired: true,
  fields: {
    budget: {
      show: true,
      label: 'Budget maximum (€)',
      placeholder: 'Votre budget d\'achat',
      required: true
    },
    financingType: {
      show: true,
      label: 'Type de financement',
      placeholder: 'Crédit professionnel, Comptant...',
      required: true
    },
    intendedUse: {
      show: true,
      label: 'Usage prévu',
      placeholder: 'Siège social, bureaux, coworking...',
      required: true
    }
  },
  validation: {},
  bookingText: {
    title: 'Acheter ce bureau',
    submitButton: 'Envoyer mon offre',
    successMessage: 'Votre offre d\'achat a été transmise !'
  }
};

// Configuration for CHALET for RENT
const chaletRentConfig: PropertyTypeConfig = {
  displayName: 'Chalet',
  icon: 'pine-tree',
  visitRequired: false,
  visitOptionalMessage: 'Pour un chalet de vacances, la visite n\'est pas obligatoire. Vous pouvez réserver directement.',
  fields: {
    checkInDate: {
      show: true,
      label: 'Date d\'arrivée',
      placeholder: 'Date d\'arrivée au chalet',
      required: true
    },
    checkOutDate: {
      show: true,
      label: 'Date de départ',
      placeholder: 'Date de départ du chalet',
      required: true
    },
    numberOfGuests: {
      show: true,
      label: 'Nombre de personnes',
      placeholder: 'Nombre de vacanciers',
      required: true
    },
    specialRequirements: {
      show: true,
      label: 'Demandes spéciales',
      placeholder: 'Animaux, équipements ski, jacuzzi...',
      required: false
    }
  },
  validation: {
    maxOccupants: 12
  },
  bookingText: {
    title: 'Réserver ce chalet',
    submitButton: 'Confirmer la réservation',
    successMessage: 'Votre réservation de chalet a été envoyée !'
  }
};

// Configuration for CHALET for SALE
const chaletSaleConfig: PropertyTypeConfig = {
  displayName: 'Chalet',
  icon: 'pine-tree',
  visitRequired: true,
  fields: {
    budget: {
      show: true,
      label: 'Budget maximum (€)',
      placeholder: 'Votre budget d\'achat',
      required: true
    },
    financingType: {
      show: true,
      label: 'Type de financement',
      placeholder: 'Crédit, Comptant, Mixte',
      required: true
    },
    specialRequirements: {
      show: true,
      label: 'Critères recherchés',
      placeholder: 'Pistes de ski, vue montagne, sauna...',
      required: false
    }
  },
  validation: {},
  bookingText: {
    title: 'Acheter ce chalet',
    submitButton: 'Envoyer mon offre',
    successMessage: 'Votre offre d\'achat a été transmise !'
  }
};

// Configuration for COMMERCIAL SPACE for RENT
const commercialRentConfig: PropertyTypeConfig = {
  displayName: 'Local Commercial',
  icon: 'store',
  visitRequired: true,
  fields: {
    startDate: {
      show: true,
      label: 'Date de début du bail',
      placeholder: 'Date d\'ouverture prévue',
      required: true
    },
    endDate: {
      show: true,
      label: 'Date de fin du bail',
      placeholder: 'Durée du bail commercial',
      required: true
    },
    intendedUse: {
      show: true,
      label: 'Activité commerciale',
      placeholder: 'Restaurant, boutique, salon...',
      required: true,
      helpText: 'Type de commerce que vous souhaitez exercer'
    },
    specialRequirements: {
      show: true,
      label: 'Besoins spécifiques',
      placeholder: 'Extraction, vitrine, réserve...',
      required: false
    }
  },
  validation: {},
  bookingText: {
    title: 'Louer ce local commercial',
    submitButton: 'Soumettre ma demande',
    successMessage: 'Votre demande de location a été envoyée !'
  }
};

// Configuration for COMMERCIAL SPACE for SALE
const commercialSaleConfig: PropertyTypeConfig = {
  displayName: 'Local Commercial',
  icon: 'store',
  visitRequired: true,
  fields: {
    budget: {
      show: true,
      label: 'Budget maximum (€)',
      placeholder: 'Votre budget d\'achat',
      required: true
    },
    financingType: {
      show: true,
      label: 'Type de financement',
      placeholder: 'Crédit professionnel, Comptant...',
      required: true
    },
    intendedUse: {
      show: true,
      label: 'Usage prévu',
      placeholder: 'Commerce, investissement locatif...',
      required: true
    }
  },
  validation: {},
  bookingText: {
    title: 'Acheter ce local commercial',
    submitButton: 'Envoyer mon offre',
    successMessage: 'Votre offre d\'achat a été transmise !'
  }
};

// Complete configuration mapping
const propertyTypeConfigs: Record<string, PropertyTypeConfig> = {
  // Residential
  'villa-rent': villaRentConfig,
  'villa-sale': villaSaleConfig,
  'apartment-rent': apartmentRentConfig,
  'apartment-sale': apartmentSaleConfig,
  'house-rent': houseRentConfig,
  'house-sale': houseSaleConfig,
  'penthouse-rent': penthouseRentConfig,
  'penthouse-sale': penthouseSaleConfig,
  'studio-rent': studioRentConfig,
  'studio-sale': studioSaleConfig,
  'loft-rent': loftRentConfig,
  'loft-sale': loftSaleConfig,
  // Vacation
  'hotel-rent': hotelRentConfig,
  'hotel-sale': hotelSaleConfig,
  'chalet-rent': chaletRentConfig,
  'chalet-sale': chaletSaleConfig,
  // Professional
  'office-rent': officeRentConfig,
  'office-sale': officeSaleConfig,
  'commercial-rent': commercialRentConfig,
  'commercial-sale': commercialSaleConfig,
  // Land
  'land-rent': landRentConfig,
  'land-sale': landSaleConfig
};

/**
 * Gets the configuration for a property type and action
 */
export const getPropertyConfig = (
  propertyType: PropertyType,
  actionType: ActionType
): PropertyTypeConfig => {
  const key = `${propertyType}-${actionType}`;
  return propertyTypeConfigs[key] || apartmentRentConfig;
};

/**
 * Determines if a visit is required for this property type
 */
export const isVisitRequired = (
  propertyType: PropertyType,
  actionType: ActionType
): boolean => {
  const config = getPropertyConfig(propertyType, actionType);
  return config.visitRequired;
};

export default {
  getPropertyConfig,
  isVisitRequired
};
