
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
    profession?: PropertyFieldConfig;
    country?: PropertyFieldConfig;
    address?: PropertyFieldConfig;
    // Personal information fields for sale properties
    fullName?: PropertyFieldConfig;
    age?: PropertyFieldConfig;
    dateOfBirth?: PropertyFieldConfig;
    placeOfBirth?: PropertyFieldConfig;
    maritalStatus?: PropertyFieldConfig;
    phone?: PropertyFieldConfig;
    countryOfOrigin?: PropertyFieldConfig;
    countryOfResidence?: PropertyFieldConfig;
    idNumber?: PropertyFieldConfig;
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
    // Personal information
    fullName: {
      show: true,
      label: 'Nom complet *',
      placeholder: 'Votre nom complet',
      required: true
    },
    age: {
      show: true,
      label: 'Âge *',
      placeholder: 'Votre âge',
      required: true
    },
    dateOfBirth: {
      show: true,
      label: 'Date de naissance *',
      placeholder: 'Sélectionnez votre date de naissance',
      required: true
    },
    placeOfBirth: {
      show: true,
      label: 'Lieu de naissance *',
      placeholder: 'Ville/Pays de naissance',
      required: true
    },
    maritalStatus: {
      show: true,
      label: 'Situation civile *',
      placeholder: 'Célibataire, Marié, Divorcé...',
      required: true
    },
    phone: {
      show: true,
      label: 'Téléphone *',
      placeholder: '+228 XX XX XX XX',
      required: true
    },
    countryOfOrigin: {
      show: true,
      label: 'Pays d\'origine *',
      placeholder: 'Votre pays d\'origine',
      required: true
    },
    countryOfResidence: {
      show: true,
      label: 'Pays de résidence *',
      placeholder: 'Votre pays de résidence',
      required: true
    },
    profession: {
      show: true,
      label: 'Profession *',
      placeholder: 'Votre profession',
      required: true
    },
    address: {
      show: true,
      label: 'Adresse complète *',
      placeholder: 'Votre adresse complète',
      required: true
    },
    idNumber: {
      show: true,
      label: 'Numéro de pièce d\'identité *',
      placeholder: 'Numéro de passeport ou ID',
      required: true
    },
    // Investment information
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
    fullName: {
      show: true,
      label: 'Nom *',
      placeholder: 'Votre nom complet',
      required: true
    },
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
  visitOptionalMessage: 'Nous vous recommandons de visiter l\'appartement avant de faire une offre.',
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
    // Section: Informations personnelles
    fullName: {
      show: true,
      label: 'Nom complet *',
      placeholder: 'Votre nom complet',
      required: true
    },
    age: {
      show: true,
      label: 'Âge *',
      placeholder: 'Votre âge',
      required: true
    },
    dateOfBirth: {
      show: true,
      label: 'Date de naissance *',
      placeholder: 'Sélectionnez votre date de naissance',
      required: true
    },
    placeOfBirth: {
      show: true,
      label: 'Lieu de naissance *',
      placeholder: 'Ville/Pays de naissance',
      required: true
    },
    maritalStatus: {
      show: true,
      label: 'Situation civile *',
      placeholder: 'Célibataire, Marié, Divorcé...',
      required: true
    },
    phone: {
      show: true,
      label: 'Téléphone *',
      placeholder: '+228 XX XX XX XX',
      required: true
    },
    countryOfOrigin: {
      show: true,
      label: 'Pays d\'origine *',
      placeholder: 'Votre pays d\'origine',
      required: true
    },
    countryOfResidence: {
      show: true,
      label: 'Pays de résidence *',
      placeholder: 'Votre pays de résidence',
      required: true
    },
    profession: {
      show: true,
      label: 'Profession *',
      placeholder: 'Ex: Médecin, Ingénieur, Commerçant...',
      required: true,
      helpText: 'Votre profession actuelle'
    },
    address: {
      show: true,
      label: 'Adresse complète *',
      placeholder: 'Votre adresse complète',
      required: true
    },
    idNumber: {
      show: true,
      label: 'Numéro de pièce d\'identité *',
      placeholder: 'Numéro de passeport ou ID',
      required: true
    },
    // Section: Informations financières
    budget: {
      show: true,
      label: 'Budget d\'acquisition (FCFA)',
      placeholder: 'Montant maximum que vous pouvez investir',
      required: true,
      helpText: 'Indiquez votre budget maximum pour cet achat'
    },
    financingType: {
      show: true,
      label: 'Mode de financement',
      placeholder: 'Sélectionnez votre mode de financement',
      required: true,
      helpText: 'Comment comptez-vous financer cet achat ?'
    },
    // Section: Projet
    intendedUse: {
      show: true,
      label: 'Utilisation prévue',
      placeholder: 'Résidence principale, Résidence secondaire, Investissement locatif...',
      required: true,
      helpText: 'Comment comptez-vous utiliser ce bien ?'
    }
  },
  validation: {
    minBudget: 500000
  },
  bookingText: {
    title: 'Formulaire d\'offre d\'achat',
    submitButton: 'Soumettre mon offre',
    successMessage: 'Votre offre d\'achat a été transmise au vendeur. Vous recevrez une réponse sous 48h.'
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
    fullName: {
      show: true,
      label: 'Nom *',
      placeholder: 'Votre nom complet',
      required: true
    },
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
  visitOptionalMessage: 'Nous vous recommandons de visiter la villa avant de faire une offre.',
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
    // Section: Informations personnelles
    fullName: {
      show: true,
      label: 'Nom complet *',
      placeholder: 'Votre nom complet',
      required: true
    },
    age: {
      show: true,
      label: 'Âge *',
      placeholder: 'Votre âge',
      required: true
    },
    dateOfBirth: {
      show: true,
      label: 'Date de naissance *',
      placeholder: 'Sélectionnez votre date de naissance',
      required: true
    },
    placeOfBirth: {
      show: true,
      label: 'Lieu de naissance *',
      placeholder: 'Ville/Pays de naissance',
      required: true
    },
    maritalStatus: {
      show: true,
      label: 'Situation civile *',
      placeholder: 'Célibataire, Marié, Divorcé...',
      required: true
    },
    phone: {
      show: true,
      label: 'Téléphone *',
      placeholder: '+228 XX XX XX XX',
      required: true
    },
    countryOfOrigin: {
      show: true,
      label: 'Pays d\'origine *',
      placeholder: 'Votre pays d\'origine',
      required: true
    },
    countryOfResidence: {
      show: true,
      label: 'Pays de résidence *',
      placeholder: 'Votre pays de résidence',
      required: true
    },
    profession: {
      show: true,
      label: 'Profession *',
      placeholder: 'Ex: Médecin, Ingénieur, Commerçant...',
      required: true,
      helpText: 'Votre profession actuelle'
    },
    address: {
      show: true,
      label: 'Adresse complète *',
      placeholder: 'Votre adresse complète',
      required: true
    },
    idNumber: {
      show: true,
      label: 'Numéro de pièce d\'identité *',
      placeholder: 'Numéro de passeport ou ID',
      required: true
    },
    // Section: Informations financières
    budget: {
      show: true,
      label: 'Budget d\'acquisition (FCFA)',
      placeholder: 'Montant maximum que vous pouvez investir',
      required: true,
      helpText: 'Indiquez votre budget maximum pour cet achat'
    },
    financingType: {
      show: true,
      label: 'Mode de financement',
      placeholder: 'Sélectionnez votre mode de financement',
      required: true,
      helpText: 'Comment comptez-vous financer cet achat ?'
    },
    // Section: Projet
    intendedUse: {
      show: true,
      label: 'Utilisation prévue',
      placeholder: 'Résidence principale, Résidence secondaire, Investissement locatif...',
      required: true,
      helpText: 'Comment comptez-vous utiliser ce bien ?'
    },
    specialRequirements: {
      show: true,
      label: 'Critères et exigences particulières',
      placeholder: 'Piscine, jardin, vue mer, garage, sécurité...',
      required: false,
      helpText: 'Décrivez vos critères spécifiques pour cette villa'
    }
  },
  validation: {
    minBudget: 1000000
  },
  bookingText: {
    title: 'Formulaire d\'offre d\'achat',
    submitButton: 'Soumettre mon offre',
    successMessage: 'Votre offre d\'achat a été transmise au vendeur. Vous recevrez une réponse sous 48h.'
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
    fullName: {
      show: true,
      label: 'Nom *',
      placeholder: 'Votre nom complet',
      required: true
    },
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
  visitOptionalMessage: 'Nous vous recommandons de visiter la maison avant de faire une offre.',
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
    // Section: Informations personnelles
    fullName: {
      show: true,
      label: 'Nom complet *',
      placeholder: 'Votre nom complet',
      required: true
    },
    age: {
      show: true,
      label: 'Âge *',
      placeholder: 'Votre âge',
      required: true
    },
    dateOfBirth: {
      show: true,
      label: 'Date de naissance *',
      placeholder: 'Sélectionnez votre date de naissance',
      required: true
    },
    placeOfBirth: {
      show: true,
      label: 'Lieu de naissance *',
      placeholder: 'Ville/Pays de naissance',
      required: true
    },
    maritalStatus: {
      show: true,
      label: 'Situation civile *',
      placeholder: 'Célibataire, Marié, Divorcé...',
      required: true
    },
    phone: {
      show: true,
      label: 'Téléphone *',
      placeholder: '+228 XX XX XX XX',
      required: true
    },
    countryOfOrigin: {
      show: true,
      label: 'Pays d\'origine *',
      placeholder: 'Votre pays d\'origine',
      required: true
    },
    countryOfResidence: {
      show: true,
      label: 'Pays de résidence *',
      placeholder: 'Votre pays de résidence',
      required: true
    },
    profession: {
      show: true,
      label: 'Profession *',
      placeholder: 'Ex: Médecin, Ingénieur, Commerçant...',
      required: true,
      helpText: 'Votre profession actuelle'
    },
    address: {
      show: true,
      label: 'Adresse complète *',
      placeholder: 'Votre adresse complète',
      required: true
    },
    idNumber: {
      show: true,
      label: 'Numéro de pièce d\'identité *',
      placeholder: 'Numéro de passeport ou ID',
      required: true
    },
    // Section: Informations financières
    budget: {
      show: true,
      label: 'Budget d\'acquisition (FCFA)',
      placeholder: 'Montant maximum que vous pouvez investir',
      required: true,
      helpText: 'Indiquez votre budget maximum pour cet achat'
    },
    financingType: {
      show: true,
      label: 'Mode de financement',
      placeholder: 'Sélectionnez votre mode de financement',
      required: true,
      helpText: 'Comment comptez-vous financer cet achat ?'
    },
    // Section: Projet
    intendedUse: {
      show: true,
      label: 'Utilisation prévue',
      placeholder: 'Résidence principale, Résidence secondaire, Investissement locatif...',
      required: true,
      helpText: 'Comment comptez-vous utiliser ce bien ?'
    }
  },
  validation: {
    minBudget: 500000
  },
  bookingText: {
    title: 'Formulaire d\'offre d\'achat',
    submitButton: 'Soumettre mon offre',
    successMessage: 'Votre offre d\'achat a été transmise au vendeur. Vous recevrez une réponse sous 48h.'
  }
};

// Configuration for LAND for SALE
const landSaleConfig: PropertyTypeConfig = {
  displayName: 'Terrain',
  icon: 'image-filter-hdr',
  category: 'land',
  visitRequired: true,
  visitOptionalMessage: 'Nous vous recommandons fortement de visiter le terrain avant de soumettre votre offre.',
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
    // Section: Informations personnelles
    fullName: {
      show: true,
      label: 'Nom complet *',
      placeholder: 'Votre nom complet',
      required: true
    },
    age: {
      show: true,
      label: 'Âge *',
      placeholder: 'Votre âge',
      required: true
    },
    dateOfBirth: {
      show: true,
      label: 'Date de naissance *',
      placeholder: 'Sélectionnez votre date de naissance',
      required: true
    },
    placeOfBirth: {
      show: true,
      label: 'Lieu de naissance *',
      placeholder: 'Ville/Pays de naissance',
      required: true
    },
    maritalStatus: {
      show: true,
      label: 'Situation civile *',
      placeholder: 'Célibataire, Marié, Divorcé...',
      required: true
    },
    phone: {
      show: true,
      label: 'Téléphone *',
      placeholder: '+228 XX XX XX XX',
      required: true
    },
    countryOfOrigin: {
      show: true,
      label: 'Pays d\'origine *',
      placeholder: 'Votre pays d\'origine',
      required: true
    },
    countryOfResidence: {
      show: true,
      label: 'Pays de résidence *',
      placeholder: 'Votre pays de résidence',
      required: true
    },
    profession: {
      show: true,
      label: 'Profession *',
      placeholder: 'Ex: Médecin, Ingénieur, Commerçant...',
      required: true,
      helpText: 'Votre profession actuelle'
    },
    address: {
      show: true,
      label: 'Adresse complète *',
      placeholder: 'Quartier, Ville, Code postal',
      required: true,
      helpText: 'Votre adresse de résidence actuelle'
    },
    idNumber: {
      show: true,
      label: 'Numéro de pièce d\'identité *',
      placeholder: 'Numéro de passeport ou ID',
      required: true
    },
    // Section: Informations financières
    budget: {
      show: true,
      label: 'Budget d\'acquisition (FCFA)',
      placeholder: 'Montant maximum que vous pouvez investir',
      required: true,
      helpText: 'Indiquez votre budget maximum pour cet achat'
    },
    financingType: {
      show: true,
      label: 'Mode de financement',
      placeholder: 'Sélectionnez votre mode de financement',
      required: true,
      helpText: 'Comment comptez-vous financer cet achat ?'
    },
    // Section: Projet d'utilisation
    intendedUse: {
      show: true,
      label: 'Projet d\'utilisation du terrain',
      placeholder: 'Décrivez votre projet : Construction résidentielle, Agriculture, Commerce, Investissement à long terme...',
      required: true,
      helpText: 'Expliquez en détail ce que vous comptez faire de ce terrain'
    },
    constructionPlan: {
      show: true,
      label: 'Plan de construction (si applicable)',
      placeholder: 'Décrivez votre projet de construction : type de bâtiment, superficie prévue, délai de réalisation...',
      required: false,
      helpText: 'Si vous prévoyez de construire, détaillez votre projet'
    }
  },
  validation: {
    minBudget: 100000
  },
  bookingText: {
    title: 'Formulaire d\'offre d\'achat',
    submitButton: 'Soumettre mon offre',
    successMessage: 'Votre offre d\'achat a été transmise au vendeur. Vous recevrez une réponse sous 48h.'
  }
};

// Configuration for LAND for RENT
const landRentConfig: PropertyTypeConfig = {
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
    paymentTiming: 'monthly',
    depositRequired: true,
    depositPercentage: 100,
    cancellationPolicy: 'moderate',
    freeCancellationDays: 14
  },
  fields: {
    fullName: {
      show: true,
      label: 'Nom *',
      placeholder: 'Votre nom complet',
      required: true
    },
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
    depositPercentage: 300, // 3 months deposit for premium properties
    cancellationPolicy: 'strict',
    freeCancellationDays: 7
  },
  fields: {
    fullName: {
      show: true,
      label: 'Nom *',
      placeholder: 'Votre nom complet',
      required: true
    },
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
    // Section: Informations personnelles
    fullName: {
      show: true,
      label: 'Nom complet *',
      placeholder: 'Votre nom complet',
      required: true
    },
    age: {
      show: true,
      label: 'Âge *',
      placeholder: 'Votre âge',
      required: true
    },
    dateOfBirth: {
      show: true,
      label: 'Date de naissance *',
      placeholder: 'Sélectionnez votre date de naissance',
      required: true
    },
    placeOfBirth: {
      show: true,
      label: 'Lieu de naissance *',
      placeholder: 'Ville/Pays de naissance',
      required: true
    },
    maritalStatus: {
      show: true,
      label: 'Situation civile *',
      placeholder: 'Célibataire, Marié, Divorcé...',
      required: true
    },
    phone: {
      show: true,
      label: 'Téléphone *',
      placeholder: '+228 XX XX XX XX',
      required: true
    },
    countryOfOrigin: {
      show: true,
      label: 'Pays d\'origine *',
      placeholder: 'Votre pays d\'origine',
      required: true
    },
    countryOfResidence: {
      show: true,
      label: 'Pays de résidence *',
      placeholder: 'Votre pays de résidence',
      required: true
    },
    profession: {
      show: true,
      label: 'Profession *',
      placeholder: 'Votre profession',
      required: true
    },
    address: {
      show: true,
      label: 'Adresse complète *',
      placeholder: 'Votre adresse complète',
      required: true
    },
    idNumber: {
      show: true,
      label: 'Numéro de pièce d\'identité *',
      placeholder: 'Numéro de passeport ou ID',
      required: true
    },
    // Section: Informations financières
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
  category: 'residential',
  visitRequired: true,
  bookingFlow: {
    flowType: 'visit_optional',
    skipVisitForRent: false,
    skipVisitForSale: false,
    instantBookingAllowed: false,
    directBookingRoute: '/booking/Bookingscreen',
    visitRoute: '/booking/VisitScreen',
    paymentTiming: 'monthly',
    depositRequired: true,
    depositPercentage: 100,
    cancellationPolicy: 'flexible',
    freeCancellationDays: 7,
    visitOptionalMessage: 'Pour un studio, la visite est recommandée mais vous pouvez aussi réserver directement.'
  },
  fields: {
    fullName: {
      show: true,
      label: 'Nom *',
      placeholder: 'Votre nom complet',
      required: true
    },
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
    // Section: Informations personnelles
    fullName: {
      show: true,
      label: 'Nom complet *',
      placeholder: 'Votre nom complet',
      required: true
    },
    age: {
      show: true,
      label: 'Âge *',
      placeholder: 'Votre âge',
      required: true
    },
    dateOfBirth: {
      show: true,
      label: 'Date de naissance *',
      placeholder: 'Sélectionnez votre date de naissance',
      required: true
    },
    placeOfBirth: {
      show: true,
      label: 'Lieu de naissance *',
      placeholder: 'Ville/Pays de naissance',
      required: true
    },
    maritalStatus: {
      show: true,
      label: 'Situation civile *',
      placeholder: 'Célibataire, Marié, Divorcé...',
      required: true
    },
    phone: {
      show: true,
      label: 'Téléphone *',
      placeholder: '+228 XX XX XX XX',
      required: true
    },
    countryOfOrigin: {
      show: true,
      label: 'Pays d\'origine *',
      placeholder: 'Votre pays d\'origine',
      required: true
    },
    countryOfResidence: {
      show: true,
      label: 'Pays de résidence *',
      placeholder: 'Votre pays de résidence',
      required: true
    },
    profession: {
      show: true,
      label: 'Profession *',
      placeholder: 'Votre profession',
      required: true
    },
    address: {
      show: true,
      label: 'Adresse complète *',
      placeholder: 'Votre adresse complète',
      required: true
    },
    idNumber: {
      show: true,
      label: 'Numéro de pièce d\'identité *',
      placeholder: 'Numéro de passeport ou ID',
      required: true
    },
    // Section: Informations financières
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
    depositPercentage: 200,
    cancellationPolicy: 'moderate',
    freeCancellationDays: 7
  },
  fields: {
    fullName: {
      show: true,
      label: 'Nom *',
      placeholder: 'Votre nom complet',
      required: true
    },
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
    // Section: Informations personnelles
    fullName: {
      show: true,
      label: 'Nom complet *',
      placeholder: 'Votre nom complet',
      required: true
    },
    age: {
      show: true,
      label: 'Âge *',
      placeholder: 'Votre âge',
      required: true
    },
    dateOfBirth: {
      show: true,
      label: 'Date de naissance *',
      placeholder: 'Sélectionnez votre date de naissance',
      required: true
    },
    placeOfBirth: {
      show: true,
      label: 'Lieu de naissance *',
      placeholder: 'Ville/Pays de naissance',
      required: true
    },
    maritalStatus: {
      show: true,
      label: 'Situation civile *',
      placeholder: 'Célibataire, Marié, Divorcé...',
      required: true
    },
    phone: {
      show: true,
      label: 'Téléphone *',
      placeholder: '+228 XX XX XX XX',
      required: true
    },
    countryOfOrigin: {
      show: true,
      label: 'Pays d\'origine *',
      placeholder: 'Votre pays d\'origine',
      required: true
    },
    countryOfResidence: {
      show: true,
      label: 'Pays de résidence *',
      placeholder: 'Votre pays de résidence',
      required: true
    },
    profession: {
      show: true,
      label: 'Profession *',
      placeholder: 'Votre profession',
      required: true
    },
    address: {
      show: true,
      label: 'Adresse complète *',
      placeholder: 'Votre adresse complète',
      required: true
    },
    idNumber: {
      show: true,
      label: 'Numéro de pièce d\'identité *',
      placeholder: 'Numéro de passeport ou ID',
      required: true
    },
    // Section: Informations financières
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
  category: 'professional',
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
    depositPercentage: 300, // 3 months for professional
    cancellationPolicy: 'strict',
    freeCancellationDays: 30
  },
  fields: {
    fullName: {
      show: true,
      label: 'Nom *',
      placeholder: 'Votre nom complet',
      required: true
    },
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
  category: 'professional',
  visitRequired: true,
  visitOptionalMessage: 'Une visite est recommandée pour évaluer l\'espace professionnel.',
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
    // Section: Informations personnelles
    fullName: {
      show: true,
      label: 'Nom complet *',
      placeholder: 'Votre nom complet',
      required: true
    },
    age: {
      show: true,
      label: 'Âge *',
      placeholder: 'Votre âge',
      required: true
    },
    dateOfBirth: {
      show: true,
      label: 'Date de naissance *',
      placeholder: 'Sélectionnez votre date de naissance',
      required: true
    },
    placeOfBirth: {
      show: true,
      label: 'Lieu de naissance *',
      placeholder: 'Ville/Pays de naissance',
      required: true
    },
    maritalStatus: {
      show: true,
      label: 'Situation civile *',
      placeholder: 'Célibataire, Marié, Divorcé...',
      required: true
    },
    phone: {
      show: true,
      label: 'Téléphone *',
      placeholder: '+228 XX XX XX XX',
      required: true
    },
    countryOfOrigin: {
      show: true,
      label: 'Pays d\'origine *',
      placeholder: 'Votre pays d\'origine',
      required: true
    },
    countryOfResidence: {
      show: true,
      label: 'Pays de résidence *',
      placeholder: 'Votre pays de résidence',
      required: true
    },
    profession: {
      show: true,
      label: 'Profession / Activité *',
      placeholder: 'Ex: Cabinet d\'avocats, Agence immobilière...',
      required: true,
      helpText: 'Nom de votre entreprise ou type d\'activité'
    },
    address: {
      show: true,
      label: 'Adresse complète *',
      placeholder: 'Adresse de votre siège social',
      required: true
    },
    idNumber: {
      show: true,
      label: 'Numéro de pièce d\'identité *',
      placeholder: 'Numéro de passeport ou ID',
      required: true
    },
    // Section: Informations financières
    budget: {
      show: true,
      label: 'Budget d\'acquisition (FCFA)',
      placeholder: 'Montant maximum pour cet investissement',
      required: true,
      helpText: 'Budget total incluant les frais annexes'
    },
    financingType: {
      show: true,
      label: 'Mode de financement',
      placeholder: 'Crédit professionnel, Fonds propres, Leasing...',
      required: true,
      helpText: 'Comment comptez-vous financer cet achat ?'
    },
    // Section: Projet
    intendedUse: {
      show: true,
      label: 'Utilisation prévue des locaux',
      placeholder: 'Siège social, bureaux opérationnels, centre d\'appels, coworking...',
      required: true,
      helpText: 'Décrivez l\'usage professionnel prévu'
    },
    specialRequirements: {
      show: true,
      label: 'Besoins spécifiques',
      placeholder: 'Aménagements requis, équipements, accès PMR, parking...',
      required: false,
      helpText: 'Décrivez vos exigences techniques'
    }
  },
  validation: {
    minBudget: 500000
  },
  bookingText: {
    title: 'Formulaire d\'offre d\'achat - Bureau',
    submitButton: 'Soumettre mon offre',
    successMessage: 'Votre offre d\'achat a été transmise au vendeur. Vous recevrez une réponse sous 48h.'
  }
};

// Configuration for CHALET for RENT
const chaletRentConfig: PropertyTypeConfig = {
  displayName: 'Chalet',
  icon: 'pine-tree',
  category: 'vacation',
  visitRequired: false,
  visitOptionalMessage: 'Pour un chalet de vacances, la visite n\'est pas obligatoire. Vous pouvez réserver directement.',
  bookingFlow: {
    flowType: 'direct',
    skipVisitForRent: true,
    skipVisitForSale: false,
    instantBookingAllowed: true,
    directBookingRoute: '/booking/Bookingscreen',
    visitRoute: '/booking/VisitScreen',
    paymentTiming: 'upfront',
    depositRequired: true,
    depositPercentage: 50,
    cancellationPolicy: 'moderate',
    freeCancellationDays: 7,
    directBookingMessage: 'Réservez directement votre chalet de vacances.',
    instantBookingMessage: 'Confirmation instantanée disponible.'
  },
  fields: {
    fullName: {
      show: true,
      label: 'Nom *',
      placeholder: 'Votre nom complet',
      required: true
    },
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
  category: 'vacation',
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
    // Section: Informations personnelles
    fullName: {
      show: true,
      label: 'Nom complet *',
      placeholder: 'Votre nom complet',
      required: true
    },
    age: {
      show: true,
      label: 'Âge *',
      placeholder: 'Votre âge',
      required: true
    },
    dateOfBirth: {
      show: true,
      label: 'Date de naissance *',
      placeholder: 'Sélectionnez votre date de naissance',
      required: true
    },
    placeOfBirth: {
      show: true,
      label: 'Lieu de naissance *',
      placeholder: 'Ville/Pays de naissance',
      required: true
    },
    maritalStatus: {
      show: true,
      label: 'Situation civile *',
      placeholder: 'Célibataire, Marié, Divorcé...',
      required: true
    },
    phone: {
      show: true,
      label: 'Téléphone *',
      placeholder: '+228 XX XX XX XX',
      required: true
    },
    countryOfOrigin: {
      show: true,
      label: 'Pays d\'origine *',
      placeholder: 'Votre pays d\'origine',
      required: true
    },
    countryOfResidence: {
      show: true,
      label: 'Pays de résidence *',
      placeholder: 'Votre pays de résidence',
      required: true
    },
    profession: {
      show: true,
      label: 'Profession *',
      placeholder: 'Votre profession',
      required: true
    },
    address: {
      show: true,
      label: 'Adresse complète *',
      placeholder: 'Votre adresse complète',
      required: true
    },
    idNumber: {
      show: true,
      label: 'Numéro de pièce d\'identité *',
      placeholder: 'Numéro de passeport ou ID',
      required: true
    },
    // Section: Informations financières
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
  category: 'professional',
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
    depositPercentage: 600, // 6 months for commercial
    cancellationPolicy: 'strict',
    freeCancellationDays: 30
  },
  fields: {
    fullName: {
      show: true,
      label: 'Nom *',
      placeholder: 'Votre nom complet',
      required: true
    },
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
  category: 'professional',
  visitRequired: true,
  visitOptionalMessage: 'Une visite est recommandée pour évaluer l\'emplacement commercial.',
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
    // Section: Informations personnelles
    fullName: {
      show: true,
      label: 'Nom complet *',
      placeholder: 'Votre nom complet',
      required: true
    },
    age: {
      show: true,
      label: 'Âge *',
      placeholder: 'Votre âge',
      required: true
    },
    dateOfBirth: {
      show: true,
      label: 'Date de naissance *',
      placeholder: 'Sélectionnez votre date de naissance',
      required: true
    },
    placeOfBirth: {
      show: true,
      label: 'Lieu de naissance *',
      placeholder: 'Ville/Pays de naissance',
      required: true
    },
    maritalStatus: {
      show: true,
      label: 'Situation civile *',
      placeholder: 'Célibataire, Marié, Divorcé...',
      required: true
    },
    phone: {
      show: true,
      label: 'Téléphone *',
      placeholder: '+228 XX XX XX XX',
      required: true
    },
    countryOfOrigin: {
      show: true,
      label: 'Pays d\'origine *',
      placeholder: 'Votre pays d\'origine',
      required: true
    },
    countryOfResidence: {
      show: true,
      label: 'Pays de résidence *',
      placeholder: 'Votre pays de résidence',
      required: true
    },
    profession: {
      show: true,
      label: 'Type de commerce / Activité *',
      placeholder: 'Ex: Supermarché, Boutique, Restaurant...',
      required: true,
      helpText: 'Nature de votre activité commerciale'
    },
    address: {
      show: true,
      label: 'Adresse complète *',
      placeholder: 'Adresse actuelle de votre commerce',
      required: true
    },
    idNumber: {
      show: true,
      label: 'Numéro de pièce d\'identité *',
      placeholder: 'Numéro de passeport ou ID',
      required: true
    },
    // Section: Informations financières
    budget: {
      show: true,
      label: 'Budget d\'acquisition (FCFA)',
      placeholder: 'Montant maximum pour cet investissement',
      required: true,
      helpText: 'Budget total incluant les frais annexes'
    },
    financingType: {
      show: true,
      label: 'Mode de financement',
      placeholder: 'Crédit commercial, Fonds propres, Investisseurs...',
      required: true,
      helpText: 'Comment comptez-vous financer cet achat ?'
    },
    // Section: Projet commercial
    intendedUse: {
      show: true,
      label: 'Projet commercial prévu',
      placeholder: 'Ouverture d\'un commerce, investissement locatif, extension d\'activité...',
      required: true,
      helpText: 'Décrivez votre projet commercial pour ce local'
    },
    specialRequirements: {
      show: true,
      label: 'Besoins spécifiques',
      placeholder: 'Vitrine, stockage, cuisine professionnelle, parking client...',
      required: false,
      helpText: 'Décrivez vos besoins techniques et commerciaux'
    }
  },
  validation: {
    minBudget: 500000
  },
  bookingText: {
    title: 'Formulaire d\'offre d\'achat - Local Commercial',
    submitButton: 'Soumettre mon offre',
    successMessage: 'Votre offre d\'achat a été transmise au vendeur. Vous recevrez une réponse sous 48h.'
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

/**
 * Gets the booking flow configuration for a property type and action
 */
export const getBookingFlow = (
  propertyType: PropertyType,
  actionType: ActionType
): BookingFlowConfig => {
  const config = getPropertyConfig(propertyType, actionType);
  return config.bookingFlow;
};

/**
 * Determines if direct booking (skip visit) is allowed for this property
 */
export const canSkipVisit = (
  propertyType: PropertyType,
  actionType: ActionType
): boolean => {
  const flow = getBookingFlow(propertyType, actionType);
  if (actionType === 'rent') {
    return flow.skipVisitForRent;
  }
  return flow.skipVisitForSale;
};

/**
 * Determines if instant booking is available
 */
export const isInstantBookingAllowed = (
  propertyType: PropertyType,
  actionType: ActionType
): boolean => {
  const flow = getBookingFlow(propertyType, actionType);
  return flow.instantBookingAllowed;
};

/**
 * Gets the appropriate booking route based on property type and action
 */
export const getBookingRoute = (
  propertyType: PropertyType,
  actionType: ActionType,
  forceVisit: boolean = false
): '/booking/Bookingscreen' | '/booking/HotelBookingScreen' | '/booking/VisitScreen' => {
  const flow = getBookingFlow(propertyType, actionType);

  // If visit is forced or required, return visit route
  if (forceVisit || !canSkipVisit(propertyType, actionType)) {
    return flow.visitRoute;
  }

  // Otherwise return direct booking route
  return flow.directBookingRoute;
};

/**
 * Gets the payment configuration for a property type
 */
export const getPaymentConfig = (
  propertyType: PropertyType,
  actionType: ActionType
): {
  timing: PaymentTiming;
  depositRequired: boolean;
  depositPercentage?: number;
} => {
  const flow = getBookingFlow(propertyType, actionType);
  return {
    timing: flow.paymentTiming,
    depositRequired: flow.depositRequired,
    depositPercentage: flow.depositPercentage
  };
};


/**
 * Gets the cancellation policy for a property type
 */
export const getCancellationPolicy = (
  propertyType: PropertyType,
  actionType: ActionType
): {
  policy: CancellationPolicy;
  freeCancellationDays?: number;
} => {
  const flow = getBookingFlow(propertyType, actionType);
  return {
    policy: flow.cancellationPolicy,
    freeCancellationDays: flow.freeCancellationDays
  };
};

/**
 * Gets the property category
 */
export const getPropertyCategory = (
  propertyType: PropertyType,
  actionType: ActionType
): PropertyCategory => {
  const config = getPropertyConfig(propertyType, actionType);
  return config.category;
};

/**
 * Checks if property is a vacation type (hotel, chalet for rent)
 */
export const isVacationProperty = (
  propertyType: PropertyType,
  actionType: ActionType
): boolean => {
  const config = getPropertyConfig(propertyType, actionType);
  return config.category === 'vacation' && actionType === 'rent';
};

/**
 * Gets user-friendly message for booking flow
 */
export const getBookingFlowMessage = (
  propertyType: PropertyType,
  actionType: ActionType
): string | undefined => {
  const flow = getBookingFlow(propertyType, actionType);

  if (flow.flowType === 'direct') {
    return flow.directBookingMessage;
  }

  if (flow.flowType === 'visit_optional') {
    return flow.visitOptionalMessage;
  }

  return undefined;
};

/**
 * Determines the navigation route based on property type, action, and activity status
 * This is the main function to use in info/index.tsx for intelligent navigation
 */
export const determineBookingNavigation = (
  propertyType: PropertyType,
  actionType: ActionType,
  existingActivity?: {
    reservationStatus?: string;
    visiteStatus?: string;
    id?: string;
    isPayment?: boolean;
  }
): {
  route: '/booking/Bookingscreen' | '/booking/HotelBookingScreen' | '/booking/VisitScreen' | '/bookingReview/bookingReview' | '/wallet/Wallet' | '/contrat/ContratScreen';
  params?: Record<string, string>;
  message?: string;
} => {
  const config = getPropertyConfig(propertyType, actionType);
  const flow = config.bookingFlow;


  // Handle existing activity status
  if (existingActivity) {
    const { reservationStatus, visiteStatus, id, isPayment } = existingActivity;

    // Payment already done -> show contract download screen
    if (isPayment === true) {
      return {
        route: '/contrat/ContratScreen',
        params: { activityId: id || '', paymentStatus: 'completed' },
        message: 'Votre paiement a été validé. Téléchargez votre contrat.'
      };
    }

    // Reservation accepted -> go to payment

    if (reservationStatus === 'ACCEPTED') {
      if(propertyType !== 'hotel' && propertyType !== 'chalet') {
        return {
          route: '/bookingReview/bookingReview',
          params: { reservationId: id || '' },
          message: 'Votre réservation a été acceptée. Procédez au paiement.'
        };
      } else {
        return {
          route: '/wallet/Wallet',
          message: 'Votre réservation a été acceptée. Vous pouvez maintenant réserver votre séjour.'
        };
      }
    }

    // Reservation pending/draft/refused -> go to booking screen
    if (reservationStatus === 'PENDING' || reservationStatus === 'DRAFT' || reservationStatus === 'REFUSED') {
      return {
        route: flow.directBookingRoute,
        message: reservationStatus === 'REFUSED'
          ? 'Votre précédente demande a été refusée. Vous pouvez soumettre une nouvelle demande.'
          : 'Votre demande de réservation est en cours de traitement.'
      };
    }

    // Visit accepted -> go to booking
    if (visiteStatus === 'ACCEPTED') {
      return {
        route: flow.directBookingRoute,
        message: 'Votre visite a été effectuée. Vous pouvez maintenant réserver.'
      };
    }

    // Visit pending/draft -> go to visit screen
    if (visiteStatus === 'PENDING' || visiteStatus === 'DRAFT') {
      return {
        route: flow.visitRoute,
        message: 'Votre demande de visite est en cours de traitement.'
      };
    }
  }

  // No existing activity - determine based on property type config
  if (canSkipVisit(propertyType, actionType)) {
    return {
      route: flow.directBookingRoute,
      message: flow.directBookingMessage || config.visitOptionalMessage
    };
  }

  // Visit required
  return {
    route: flow.visitRoute,
    message: 'Une visite est requise avant de pouvoir réserver ce bien.'
  };
};

/**
 * List of property types that allow direct booking (no visit required)
 */
export const DIRECT_BOOKING_TYPES: PropertyType[] = ['hotel', 'chalet'];

/**
 * List of hotel-like property types for backward compatibility
 */
export const HOTEL_TYPES = ['Hôtel', 'Hotel', 'Auberge', 'Motel', 'Resort', 'Chambre d\'hôte', 'Guesthouse'];

/**
 * Normalize property type string to PropertyType enum
 */
export const normalizePropertyType = (type: string): PropertyType => {
  if (!type) {
    console.log('[normalizePropertyType] Empty type, defaulting to apartment');
    return 'apartment';
  }

  const normalized = type.toLowerCase().trim();
  console.log('[normalizePropertyType] Input:', type, '-> Normalized:', normalized);

  // Check if it's a hotel type
  if (HOTEL_TYPES.some(h => normalized.includes(h.toLowerCase()))) {
    console.log('[normalizePropertyType] Matched hotel type');
    return 'hotel';
  }

  // Map common variations (French to English)
  const typeMap: Record<string, PropertyType> = {
    // French variations
    'appartement': 'apartment',
    'maison': 'house',
    'terrain': 'land',
    'bureau': 'office',
    'local commercial': 'commercial',
    'local': 'commercial',
    'parcelle': 'land',
    'lotissement': 'land',
    'plot': 'land',
    // English variations (already correct but ensure lowercase)
    'apartment': 'apartment',
    'house': 'house',
    'land': 'land',
    'villa': 'villa',
    'studio': 'studio',
    'loft': 'loft',
    'penthouse': 'penthouse',
    'office': 'office',
    'commercial': 'commercial',
    'hotel': 'hotel',
    'chalet': 'chalet',
    // Sell/Sale action types that might be passed as propertyType by mistake
    'sell': 'apartment', // Fallback - this shouldn't happen
    'sale': 'apartment', // Fallback - this shouldn't happen
    'rent': 'apartment'  // Fallback - this shouldn't happen
  };

  const result = typeMap[normalized];
  if (result) {
    console.log('[normalizePropertyType] Mapped:', normalized, '->', result);
    return result;
  }

  // Check if it's already a valid PropertyType
  const validTypes: PropertyType[] = ['villa', 'apartment', 'house', 'penthouse', 'studio', 'loft', 'office', 'chalet', 'hotel', 'land', 'commercial'];
  if (validTypes.includes(normalized as PropertyType)) {
    console.log('[normalizePropertyType] Already valid type:', normalized);
    return normalized as PropertyType;
  }

  console.log('[normalizePropertyType] Unknown type, defaulting to apartment:', normalized);
  return 'apartment';
};

/**
 * Normalize action type string to ActionType enum
 * Handles variations like 'sell' -> 'sale', 'location' -> 'rent'
 */
export const normalizeActionType = (action: string): ActionType => {
  if (!action) {
    console.log('[normalizeActionType] Empty action, defaulting to rent');
    return 'rent';
  }

  const normalized = action.toLowerCase().trim();
  console.log('[normalizeActionType] Input:', action, '-> Normalized:', normalized);

  // Map variations to standard types
  const actionMap: Record<string, ActionType> = {
    // Sale variations
    'sell': 'sale',
    'sale': 'sale',
    'vente': 'sale',
    'achat': 'sale',
    'buy': 'sale',
    'purchase': 'sale',
    // Rent variations
    'rent': 'rent',
    'location': 'rent',
    'louer': 'rent',
    'rental': 'rent',
    'lease': 'rent'
  };

  const result = actionMap[normalized] || 'rent';
  console.log('[normalizeActionType] Result:', result);
  return result;
};

export default {
  getPropertyConfig,
  isVisitRequired,
  getBookingFlow,
  canSkipVisit,
  isInstantBookingAllowed,
  getBookingRoute,
  getPaymentConfig,
  getCancellationPolicy,
  getPropertyCategory,
  isVacationProperty,
  getBookingFlowMessage,
  determineBookingNavigation,
  normalizePropertyType,
  normalizeActionType,
  DIRECT_BOOKING_TYPES,
  HOTEL_TYPES
};
