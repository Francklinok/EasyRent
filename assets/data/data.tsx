import { ItemType, FeatureIcon } from "@/types/ItemType";

const data: ItemType[] = [
  // === VILLAS ===
  {
    id: "villa_1",
    avatar: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    price: "2500$",
    availibility: "available",
    stars: 5,
    location: "Monaco",
    review: "Villa exceptionnelle avec vue mer, service haut de gamme ! ✨",
    type: "Villa",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "swimming-pool", name: "Piscine privée" },
      { icon: "car", name: "Garage" },
      { icon: "umbrella-beach", name: "Plage privée" },
      { icon: "utensils", name: "Chef privé" }
    ],
     owner: {
      name: "Sophie Dubois",
      phone: "+33 6 12 34 56 78",
      email: "sophie.dubois@monaco-estates.com",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b15e?w=150&q=80"
    },
    description: "Magnifique villa de luxe située sur les hauteurs de Monaco, offrant une vue panoramique exceptionnelle sur la Méditerranée. Cette propriété d'exception dispose d'une architecture moderne et de finitions haut de gamme. L'espace extérieur comprend une piscine à débordement, un jardin paysager et un accès direct à une plage privée.",
    generalInfo: {
      rooms: 8,
      bedrooms: 4,
      bathrooms: 3,
      toilets: 4,
      surface: 350,
      furnished: true,
      pets: false,
      smoking: false
    },
    propertyAvailability: {
      startDate: "2024-03-01",
      endDate: "2024-12-31",
      type: "scheduled"
    },
    equipments: [
      { id: "1", name: "Lits king size", icon: "bed", lib: "FontAwesome5", category: "comfort" },
      { id: "2", name: "TV 85 pouces", icon: "tv", lib: "FontAwesome5", category: "entertainment" },
      { id: "3", name: "Wi-Fi fibre", icon: "wifi", lib: "FontAwesome5", category: "other" },
      { id: "4", name: "Climatisation", icon: "fan", lib: "FontAwesome5", category: "comfort" },
      { id: "5", name: "Cuisine équipée", icon: "fridge", lib: "MaterialCommunityIcons", category: "kitchen" },
      { id: "6", name: "Lave-vaisselle", icon: "dishwasher", lib: "MaterialCommunityIcons", category: "kitchen" },
      { id: "7", name: "Jacuzzi", icon: "hot-tub", lib: "MaterialCommunityIcons", category: "comfort" },
      { id: "8", name: "Système sécurité", icon: "shield-home", lib: "MaterialCommunityIcons", category: "security" },
      { id: "9", name: "Piscine chauffée", icon: "pool", lib: "MaterialCommunityIcons", category: "comfort" },
      { id: "10", name: "Garage 2 places", icon: "car", lib: "FontAwesome5", category: "other" }
    ],
    ownerCriteria: {
      minimumDuration: "6 mois",
      solvability: "4 fois le montant du loyer",
      guarantorRequired: true,
      guarantorLocation: "France ou Monaco",
      acceptedSituations: ["Cadre supérieur", "Chef d'entreprise", "Profession libérale"],
      requiredDocuments: {
        tenant: ["Pièce d'identité", "3 derniers bulletins de salaire", "Avis d'imposition", "RIB"],
        guarantor: ["Pièce d'identité", "Justificatifs de revenus", "Avis d'imposition", "RIB"]
      }
    },
    services: [
      { key: "concierge", title: "Service de conciergerie", description: "Conciergerie 24h/24", icon: "concierge-bell", included: true, available: true },
      { key: "housekeeping", title: "Ménage hebdomadaire", description: "Service de ménage professionnel", icon: "broom", price: "200€/semaine", included: false, available: true },
      { key: "chef", title: "Chef à domicile", description: "Chef privé sur demande", icon: "chef-hat", price: "150€/repas", included: false, available: true },
      { key: "security", title: "Sécurité renforcée", description: "Surveillance 24h/24", icon: "security", included: true, available: true }
    ],
    atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],
  },
  {
    id: "villa_2",
    avatar: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    price: "1800$",
    availibility: "available",
    stars: 0,
    location: "Cannes",
    review: "Magnifique villa avec jardin tropical, très paisible 🌺",
    type: "Villa",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "tree", name: "Jardin tropical" },
      { icon: "hot-tub", name: "Jacuzzi" },
      { icon: "shield-alt", name: "Sécurité 24h" }
    ],
     owner: {
      name: "Marc Leblanc",
      phone: "+33 6 87 65 43 21",
      email: "marc.leblanc@cannes-villas.fr",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80"
    },
    description: "Villa de charme nichée dans un écrin de verdure tropicale à Cannes. Cette propriété offre un cadre paisible et luxueux avec ses jardins exotiques et sa piscine naturelle. Idéale pour des vacances relaxantes ou un séjour prolongé sur la Côte d'Azur.",
    generalInfo: {
      rooms: 6,
      bedrooms: 3,
      bathrooms: 2,
      toilets: 3,
      surface: 280,
      furnished: true,
      pets: true,
      smoking: false
    },
    propertyAvailability: {
      startDate: "2024-04-15",
      type: "immediate"
    },
    equipments: [
      { id: "1", name: "Lits doubles", icon: "bed", lib: "FontAwesome5", category: "comfort" },
      { id: "2", name: "Smart TV", icon: "tv", lib: "FontAwesome5", category: "entertainment" },
      { id: "3", name: "Wi-Fi haut débit", icon: "wifi", lib: "FontAwesome5", category: "other" },
      { id: "4", name: "Climatisation centralisée", icon: "fan", lib: "FontAwesome5", category: "comfort" },
      { id: "5", name: "Cuisine américaine", icon: "fridge", lib: "MaterialCommunityIcons", category: "kitchen" },
      { id: "6", name: "Jacuzzi extérieur", icon: "hot-tub", lib: "MaterialCommunityIcons", category: "comfort" },
      { id: "7", name: "Système d'alarme", icon: "shield-home", lib: "MaterialCommunityIcons", category: "security" },
      { id: "8", name: "Piscine avec cascade", icon: "pool", lib: "MaterialCommunityIcons", category: "comfort" }
    ],
    ownerCriteria: {
      minimumDuration: "3 mois",
      solvability: "3 fois le montant du loyer",
      guarantorRequired: false,
      acceptedSituations: ["Salarié", "Profession libérale", "Retraité", "Entrepreneur"],
      requiredDocuments: {
        tenant: ["Pièce d'identité", "Justificatifs de revenus", "RIB"],
        guarantor: []
      }
    },
    services: [
      { key: "garden", title: "Entretien jardin", description: "Jardinier 2 fois/semaine", icon: "leaf", included: true, available: true },
      { key: "pool", title: "Entretien piscine", description: "Nettoyage piscine hebdomadaire", icon: "pool", included: true, available: true },
      { key: "housekeeping", title: "Ménage", description: "Service de ménage", icon: "broom", price: "120€/semaine", included: false, available: true }
    ],
    atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],
  },
  {
    id: "villa_3",
    avatar: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    price: "3200$",
    availibility: "not available",
    stars: 5,
    location: "Saint‑Tropez",
    review: "Villa de luxe incroyable, parfaite pour les vacances ! 🏖️",
    type: "Villa",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "swimming-pool", name: "Piscine infinity" },
      { icon: "wine-glass", name: "Cave à vin" },
      { icon: "mountain", name: "Vue panoramique" }
    ],
     owner: {
      name: "Marc Leblanc",
      phone: "+33 6 87 65 43 21",
      email: "marc.leblanc@cannes-villas.fr",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80"
    },
    description: "Villa de charme nichée dans un écrin de verdure tropicale à Cannes. Cette propriété offre un cadre paisible et luxueux avec ses jardins exotiques et sa piscine naturelle. Idéale pour des vacances relaxantes ou un séjour prolongé sur la Côte d'Azur.",
    generalInfo: {
      rooms: 6,
      bedrooms: 3,
      bathrooms: 2,
      toilets: 3,
      surface: 280,
      furnished: true,
      pets: true,
      smoking: false
    },
    propertyAvailability: {
      startDate: "2024-04-15",
      type: "immediate"
    },
    equipments: [
      { id: "1", name: "Lits doubles", icon: "bed", lib: "FontAwesome5", category: "comfort" },
      { id: "2", name: "Smart TV", icon: "tv", lib: "FontAwesome5", category: "entertainment" },
      { id: "3", name: "Wi-Fi haut débit", icon: "wifi", lib: "FontAwesome5", category: "other" },
      { id: "4", name: "Climatisation centralisée", icon: "fan", lib: "FontAwesome5", category: "comfort" },
      { id: "5", name: "Cuisine américaine", icon: "fridge", lib: "MaterialCommunityIcons", category: "kitchen" },
      { id: "6", name: "Jacuzzi extérieur", icon: "hot-tub", lib: "MaterialCommunityIcons", category: "comfort" },
      { id: "7", name: "Système d'alarme", icon: "shield-home", lib: "MaterialCommunityIcons", category: "security" },
      { id: "8", name: "Piscine avec cascade", icon: "pool", lib: "MaterialCommunityIcons", category: "comfort" }
    ],
    ownerCriteria: {
      minimumDuration: "3 mois",
      solvability: "3 fois le montant du loyer",
      guarantorRequired: false,
      acceptedSituations: ["Salarié", "Profession libérale", "Retraité", "Entrepreneur"],
      requiredDocuments: {
        tenant: ["Pièce d'identité", "Justificatifs de revenus", "RIB"],
        guarantor: []
      }
    },
    services: [
      { key: "garden", title: "Entretien jardin", description: "Jardinier 2 fois/semaine", icon: "leaf", included: true, available: true },
      { key: "pool", title: "Entretien piscine", description: "Nettoyage piscine hebdomadaire", icon: "pool", included: true, available: true },
      { key: "housekeeping", title: "Ménage", description: "Service de ménage", icon: "broom", price: "120€/semaine", included: false, available: true }
    ],
    atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],
  },
  {
    id: "villa_4",
    avatar: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
    price: "2100$",
    availibility: "available",
    stars: 0,
    location: "Nice",
    review: "Villa moderne avec terrasse spacieuse, très confortable 🌟",
    type: "Villa",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "snowflake", name: "Climatisation" },
      { icon: "dumbbell", name: "Salle de sport" },
      { icon: "parking", name: "Parking privé" }
    ],
     owner: {
      name: "Marc Leblanc",
      phone: "+33 6 87 65 43 21",
      email: "marc.leblanc@cannes-villas.fr",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80"
    },
    description: "Villa de charme nichée dans un écrin de verdure tropicale à Cannes. Cette propriété offre un cadre paisible et luxueux avec ses jardins exotiques et sa piscine naturelle. Idéale pour des vacances relaxantes ou un séjour prolongé sur la Côte d'Azur.",
    generalInfo: {
      rooms: 6,
      bedrooms: 3,
      bathrooms: 2,
      toilets: 3,
      surface: 280,
      furnished: true,
      pets: true,
      smoking: false
    },
    propertyAvailability: {
      startDate: "2024-04-15",
      type: "immediate"
    },
    equipments: [
      { id: "1", name: "Lits doubles", icon: "bed", lib: "FontAwesome5", category: "comfort" },
      { id: "2", name: "Smart TV", icon: "tv", lib: "FontAwesome5", category: "entertainment" },
      { id: "3", name: "Wi-Fi haut débit", icon: "wifi", lib: "FontAwesome5", category: "other" },
      { id: "4", name: "Climatisation centralisée", icon: "fan", lib: "FontAwesome5", category: "comfort" },
      { id: "5", name: "Cuisine américaine", icon: "fridge", lib: "MaterialCommunityIcons", category: "kitchen" },
      { id: "6", name: "Jacuzzi extérieur", icon: "hot-tub", lib: "MaterialCommunityIcons", category: "comfort" },
      { id: "7", name: "Système d'alarme", icon: "shield-home", lib: "MaterialCommunityIcons", category: "security" },
      { id: "8", name: "Piscine avec cascade", icon: "pool", lib: "MaterialCommunityIcons", category: "comfort" }
    ],
    ownerCriteria: {
      minimumDuration: "3 mois",
      solvability: "3 fois le montant du loyer",
      guarantorRequired: false,
      acceptedSituations: ["Salarié", "Profession libérale", "Retraité", "Entrepreneur"],
      requiredDocuments: {
        tenant: ["Pièce d'identité", "Justificatifs de revenus", "RIB"],
        guarantor: []
      }
    },
    services: [
      { key: "garden", title: "Entretien jardin", description: "Jardinier 2 fois/semaine", icon: "leaf", included: true, available: true },
      { key: "pool", title: "Entretien piscine", description: "Nettoyage piscine hebdomadaire", icon: "pool", included: true, available: true },
      { key: "housekeeping", title: "Ménage", description: "Service de ménage", icon: "broom", price: "120€/semaine", included: false, available: true }
    ],
    atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],
  },

  // === APPARTEMENTS ===
  {
    id: "apt_1",
    avatar: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    price: "850$",
    availibility: "available",
    stars: 0,
    location: "Paris 16ème",
    review: "Appartement moderne en plein cœur de Paris ! 🗼",
    type: "Appartement",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "elevator", name: "Ascenseur" },
      { icon: "subway", name: "Métro proche" },
      { icon: "shopping-cart", name: "Commerces" }
    ],
     owner: {
      name: "Catherine Martin",
      phone: "+33 1 42 33 44 55",
      email: "c.martin@paris-invest.com",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80"
    },
    description: "Superbe appartement haussmannien entièrement rénové dans le prestigieux 16ème arrondissement. Situé au 4ème étage avec ascenseur, il offre une vue dégagée et un accès privilégié aux commodités parisiennes. Métro Trocadéro à 3 minutes à pied.",
    generalInfo: {
      rooms: 4,
      bedrooms: 2,
      bathrooms: 1,
      toilets: 2,
      surface: 85,
      floor: 4,
      totalFloors: 6,
      furnished: true,
      pets: false,
      smoking: false
    },
    propertyAvailability: {
      startDate: "2024-02-01",
      endDate: "2025-01-31",
      type: "scheduled"
    },
    equipments: [
      { id: "1", name: "Lits avec matelas premium", icon: "bed", lib: "FontAwesome5", category: "comfort" },
      { id: "2", name: "TV connectée", icon: "tv", lib: "FontAwesome5", category: "entertainment" },
      { id: "3", name: "Fibre optique", icon: "wifi", lib: "FontAwesome5", category: "other" },
      { id: "4", name: "Chauffage individuel", icon: "heater", lib: "MaterialCommunityIcons", category: "comfort" },
      { id: "5", name: "Cuisine équipée Bosch", icon: "fridge", lib: "MaterialCommunityIcons", category: "kitchen" },
      { id: "6", name: "Lave-linge séchant", icon: "washing-machine", lib: "MaterialCommunityIcons", category: "other" },
      { id: "7", name: "Interphone vidéo", icon: "shield-home", lib: "MaterialCommunityIcons", category: "security" }
    ],
    ownerCriteria: {
      minimumDuration: "1 an",
      solvability: "3 fois le montant du loyer",
      guarantorRequired: true,
      guarantorLocation: "France",
      acceptedSituations: ["Salarié CDI", "Fonctionnaire", "Profession libérale", "Étudiant avec garant"],
      requiredDocuments: {
        tenant: ["Pièce d'identité", "3 derniers bulletins de salaire", "Contrat de travail", "RIB"],
        guarantor: ["Pièce d'identité", "Avis d'imposition", "Justificatifs de revenus"]
      }
    },
    services: [
      { key: "internet", title: "Internet fibre", description: "Connexion très haut débit", icon: "wifi", included: true, available: true },
      { key: "maintenance", title: "Maintenance", description: "Interventions techniques", icon: "wrench", included: true, available: true },
      { key: "cleaning", title: "Ménage mensuel", description: "Nettoyage parties communes", icon: "broom", price: "80€/mois", included: false, available: true }
    ],
    atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],
  },
  {
    id: "apt_2",
    avatar: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    price: "1200$",
    availibility: "available",
    stars: 5,
    location: "Lyon Part‑Dieu",
    review: "Appartement haut standing avec vue sur la ville 🌆",
    type: "Appartement",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "snowflake", name: "Climatisation" },
      { icon: "concierge-bell", name: "Conciergerie" },
      { icon: "parking", name: "Parking souterrain" }
    ],
     owner: {
      name: "Catherine Martin",
      phone: "+33 1 42 33 44 55",
      email: "c.martin@paris-invest.com",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80"
    },
    description: "Superbe appartement haussmannien entièrement rénové dans le prestigieux 16ème arrondissement. Situé au 4ème étage avec ascenseur, il offre une vue dégagée et un accès privilégié aux commodités parisiennes. Métro Trocadéro à 3 minutes à pied.",
    generalInfo: {
      rooms: 4,
      bedrooms: 2,
      bathrooms: 1,
      toilets: 2,
      surface: 85,
      floor: 4,
      totalFloors: 6,
      furnished: true,
      pets: false,
      smoking: false
    },
    propertyAvailability: {
      startDate: "2024-02-01",
      endDate: "2025-01-31",
      type: "scheduled"
    },
    equipments: [
      { id: "1", name: "Lits avec matelas premium", icon: "bed", lib: "FontAwesome5", category: "comfort" },
      { id: "2", name: "TV connectée", icon: "tv", lib: "FontAwesome5", category: "entertainment" },
      { id: "3", name: "Fibre optique", icon: "wifi", lib: "FontAwesome5", category: "other" },
      { id: "4", name: "Chauffage individuel", icon: "heater", lib: "MaterialCommunityIcons", category: "comfort" },
      { id: "5", name: "Cuisine équipée Bosch", icon: "fridge", lib: "MaterialCommunityIcons", category: "kitchen" },
      { id: "6", name: "Lave-linge séchant", icon: "washing-machine", lib: "MaterialCommunityIcons", category: "other" },
      { id: "7", name: "Interphone vidéo", icon: "shield-home", lib: "MaterialCommunityIcons", category: "security" }
    ],
    ownerCriteria: {
      minimumDuration: "1 an",
      solvability: "3 fois le montant du loyer",
      guarantorRequired: true,
      guarantorLocation: "France",
      acceptedSituations: ["Salarié CDI", "Fonctionnaire", "Profession libérale", "Étudiant avec garant"],
      requiredDocuments: {
        tenant: ["Pièce d'identité", "3 derniers bulletins de salaire", "Contrat de travail", "RIB"],
        guarantor: ["Pièce d'identité", "Avis d'imposition", "Justificatifs de revenus"]
      }
    },
    services: [
      { key: "internet", title: "Internet fibre", description: "Connexion très haut débit", icon: "wifi", included: true, available: true },
      { key: "maintenance", title: "Maintenance", description: "Interventions techniques", icon: "wrench", included: true, available: true },
      { key: "cleaning", title: "Ménage mensuel", description: "Nettoyage parties communes", icon: "broom", price: "80€/mois", included: false, available: true }
    ],
    atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],
  },
  {
    id: "apt_3",
    avatar: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
    price: "950$",
    availibility: "not available",
    stars: 0,
    location: "Marseille Vieux‑Port",
    review: "Superbe appartement avec vue sur le port ! ⛵",
    type: "Appartement",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "balcony", name: "Balcon" },
      { icon: "anchor", name: "Vue port" },
      { icon: "utensils", name: "Restaurants" }
    ],
     owner: {
      name: "Catherine Martin",
      phone: "+33 1 42 33 44 55",
      email: "c.martin@paris-invest.com",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80"
    },
    description: "Superbe appartement haussmannien entièrement rénové dans le prestigieux 16ème arrondissement. Situé au 4ème étage avec ascenseur, il offre une vue dégagée et un accès privilégié aux commodités parisiennes. Métro Trocadéro à 3 minutes à pied.",
    generalInfo: {
      rooms: 4,
      bedrooms: 2,
      bathrooms: 1,
      toilets: 2,
      surface: 85,
      floor: 4,
      totalFloors: 6,
      furnished: true,
      pets: false,
      smoking: false
    },
    propertyAvailability: {
      startDate: "2024-02-01",
      endDate: "2025-01-31",
      type: "scheduled"
    },
    equipments: [
      { id: "1", name: "Lits avec matelas premium", icon: "bed", lib: "FontAwesome5", category: "comfort" },
      { id: "2", name: "TV connectée", icon: "tv", lib: "FontAwesome5", category: "entertainment" },
      { id: "3", name: "Fibre optique", icon: "wifi", lib: "FontAwesome5", category: "other" },
      { id: "4", name: "Chauffage individuel", icon: "heater", lib: "MaterialCommunityIcons", category: "comfort" },
      { id: "5", name: "Cuisine équipée Bosch", icon: "fridge", lib: "MaterialCommunityIcons", category: "kitchen" },
      { id: "6", name: "Lave-linge séchant", icon: "washing-machine", lib: "MaterialCommunityIcons", category: "other" },
      { id: "7", name: "Interphone vidéo", icon: "shield-home", lib: "MaterialCommunityIcons", category: "security" }
    ],
    ownerCriteria: {
      minimumDuration: "1 an",
      solvability: "3 fois le montant du loyer",
      guarantorRequired: true,
      guarantorLocation: "France",
      acceptedSituations: ["Salarié CDI", "Fonctionnaire", "Profession libérale", "Étudiant avec garant"],
      requiredDocuments: {
        tenant: ["Pièce d'identité", "3 derniers bulletins de salaire", "Contrat de travail", "RIB"],
        guarantor: ["Pièce d'identité", "Avis d'imposition", "Justificatifs de revenus"]
      }
    },
    services: [
      { key: "internet", title: "Internet fibre", description: "Connexion très haut débit", icon: "wifi", included: true, available: true },
      { key: "maintenance", title: "Maintenance", description: "Interventions techniques", icon: "wrench", included: true, available: true },
      { key: "cleaning", title: "Ménage mensuel", description: "Nettoyage parties communes", icon: "broom", price: "80€/mois", included: false, available: true }
    ],
    atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],
  },

  // === MAISONS ===
  {
    id: "house_1",
    avatar: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
    price: "1400$",
    availibility: "available",
    stars: 0,
    location: "Bordeaux",
    review: "Maison familiale charmante avec grand jardin 🏡",
    type: "Maison",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "tree", name: "Grand jardin" },
      { icon: "fire", name: "Cheminée" },
      { icon: "parking", name: "Garage double" }
    ], owner: {
      name: "Pierre et Marie Dupont",
      phone: "+33 5 56 78 90 12",
      email: "dupont.family@bordeaux-homes.fr",
      avatar: "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=150&q=80"
    },
    description: "Charmante maison familiale de style bordelais avec un grand jardin arboré. Parfaite pour une famille souhaitant profiter d'un cadre calme tout en restant proche du centre-ville. La maison dispose d'une belle cheminée et d'un garage double.",
    generalInfo: {
      rooms: 6,
      bedrooms: 3,
      bathrooms: 2,
      toilets: 2,
      surface: 150,
      furnished: false,
      pets: true,
      smoking: false
    },
    propertyAvailability: {
      startDate: "2024-05-01",
      type: "flexible"
    },
    equipments: [
      { id: "1", name: "Chauffage gaz", icon: "heater", lib: "MaterialCommunityIcons", category: "comfort" },
      { id: "2", name: "Cheminée insert", icon: "fireplace", lib: "MaterialCommunityIcons", category: "comfort" },
      { id: "3", name: "Cuisine aménagée", icon: "fridge", lib: "MaterialCommunityIcons", category: "kitchen" },
      { id: "4", name: "Garage 2 voitures", icon: "car", lib: "FontAwesome5", category: "other" },
      { id: "5", name: "Jardin 500m²", icon: "tree", lib: "FontAwesome5", category: "other" },
      { id: "6", name: "Portail automatique", icon: "shield-home", lib: "MaterialCommunityIcons", category: "security" }
    ],
    ownerCriteria: {
      minimumDuration: "2 ans",
      solvability: "3 fois le montant du loyer",
      guarantorRequired: false,
      acceptedSituations: ["Famille", "Couple", "Salarié", "Fonctionnaire"],
      requiredDocuments: {
        tenant: ["Pièce d'identité", "Justificatifs de revenus", "Assurance habitation"],
        guarantor: []
      }
    },
    services: [
      { key: "garden", title: "Conseil jardinage", description: "Conseils d'entretien jardin", icon: "leaf", included: true, available: true },
      { key: "maintenance", title: "Dépannage", description: "Interventions d'urgence", icon: "wrench", included: true, available: true }
    ]
  },
  {
    id: "house_2",
    avatar: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80",
    price: "1100$",
    availibility: "available",
    stars: 3,
    location: "Toulouse",
    review: "Maison traditionnelle bien située, calme et agréable 🌳",
    type: "Maison",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "home", name: "3 chambres" },
      { icon: "car", name: "Parking" },
      { icon: "playground", name: "Aire de jeux" }
    ],
     owner: {
      name: "Pierre et Marie Dupont",
      phone: "+33 5 56 78 90 12",
      email: "dupont.family@bordeaux-homes.fr",
      avatar: "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=150&q=80"
    },
    description: "Charmante maison familiale de style bordelais avec un grand jardin arboré. Parfaite pour une famille souhaitant profiter d'un cadre calme tout en restant proche du centre-ville. La maison dispose d'une belle cheminée et d'un garage double.",
    generalInfo: {
      rooms: 6,
      bedrooms: 3,
      bathrooms: 2,
      toilets: 2,
      surface: 150,
      furnished: false,
      pets: true,
      smoking: false
    },
    propertyAvailability: {
      startDate: "2024-05-01",
      type: "flexible"
    },
    equipments: [
      { id: "1", name: "Chauffage gaz", icon: "heater", lib: "MaterialCommunityIcons", category: "comfort" },
      { id: "2", name: "Cheminée insert", icon: "fireplace", lib: "MaterialCommunityIcons", category: "comfort" },
      { id: "3", name: "Cuisine aménagée", icon: "fridge", lib: "MaterialCommunityIcons", category: "kitchen" },
      { id: "4", name: "Garage 2 voitures", icon: "car", lib: "FontAwesome5", category: "other" },
      { id: "5", name: "Jardin 500m²", icon: "tree", lib: "FontAwesome5", category: "other" },
      { id: "6", name: "Portail automatique", icon: "shield-home", lib: "MaterialCommunityIcons", category: "security" }
    ],
    ownerCriteria: {
      minimumDuration: "2 ans",
      solvability: "3 fois le montant du loyer",
      guarantorRequired: false,
      acceptedSituations: ["Famille", "Couple", "Salarié", "Fonctionnaire"],
      requiredDocuments: {
        tenant: ["Pièce d'identité", "Justificatifs de revenus", "Assurance habitation"],
        guarantor: []
      }
    },
    services: [
      { key: "garden", title: "Conseil jardinage", description: "Conseils d'entretien jardin", icon: "leaf", included: true, available: true },
      { key: "maintenance", title: "Dépannage", description: "Interventions d'urgence", icon: "wrench", included: true, available: true }
    ],
    atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],
  },
  {
    id: "house_3",
    avatar: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    price: "1650$",
    availibility: "available",
    stars: 5,
    location: "Strasbourg",
    review: "Maison d'architecte exceptionnelle, design moderne ! 🎨",
    type: "Maison",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "lightbulb", name: "Domotique" },
      { icon: "leaf", name: "Écologique" },
      { icon: "solar-panel", name: "Panneaux solaires" }
    ],
     owner: {
      name: "Pierre et Marie Dupont",
      phone: "+33 5 56 78 90 12",
      email: "dupont.family@bordeaux-homes.fr",
      avatar: "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=150&q=80"
    },
    description: "Charmante maison familiale de style bordelais avec un grand jardin arboré. Parfaite pour une famille souhaitant profiter d'un cadre calme tout en restant proche du centre-ville. La maison dispose d'une belle cheminée et d'un garage double.",
    generalInfo: {
      rooms: 6,
      bedrooms: 3,
      bathrooms: 2,
      toilets: 2,
      surface: 150,
      furnished: false,
      pets: true,
      smoking: false
    },
    propertyAvailability: {
      startDate: "2024-05-01",
      type: "flexible"
    },
    equipments: [
      { id: "1", name: "Chauffage gaz", icon: "heater", lib: "MaterialCommunityIcons", category: "comfort" },
      { id: "2", name: "Cheminée insert", icon: "fireplace", lib: "MaterialCommunityIcons", category: "comfort" },
      { id: "3", name: "Cuisine aménagée", icon: "fridge", lib: "MaterialCommunityIcons", category: "kitchen" },
      { id: "4", name: "Garage 2 voitures", icon: "car", lib: "FontAwesome5", category: "other" },
      { id: "5", name: "Jardin 500m²", icon: "tree", lib: "FontAwesome5", category: "other" },
      { id: "6", name: "Portail automatique", icon: "shield-home", lib: "MaterialCommunityIcons", category: "security" }
    ],
    ownerCriteria: {
      minimumDuration: "2 ans",
      solvability: "3 fois le montant du loyer",
      guarantorRequired: false,
      acceptedSituations: ["Famille", "Couple", "Salarié", "Fonctionnaire"],
      requiredDocuments: {
        tenant: ["Pièce d'identité", "Justificatifs de revenus", "Assurance habitation"],
        guarantor: []
      }
    },
    services: [
      { key: "garden", title: "Conseil jardinage", description: "Conseils d'entretien jardin", icon: "leaf", included: true, available: true },
      { key: "maintenance", title: "Dépannage", description: "Interventions d'urgence", icon: "wrench", included: true, available: true }
    ]
  },

  // === PENTHOUSES ===
  {
    id: "pent_1",
    avatar: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    price: "4500$",
    availibility: "available",
    stars: 5,
    location: "Paris La Défense",
    review: "Penthouse de luxe avec terrasse panoramique ! 🏙️",
    type: "Penthouse",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "city", name: "Vue 360°" },
      { icon: "hot-tub", name: "Jacuzzi terrasse" },
      { icon: "concierge-bell", name: "Conciergerie VIP" }
    ], owner: {
      name: "Pierre et Marie Dupont",
      phone: "+33 5 56 78 90 12",
      email: "dupont.family@bordeaux-homes.fr",
      avatar: "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=150&q=80"
    },
    description: "Charmante maison familiale de style bordelais avec un grand jardin arboré. Parfaite pour une famille souhaitant profiter d'un cadre calme tout en restant proche du centre-ville. La maison dispose d'une belle cheminée et d'un garage double.",
    generalInfo: {
      rooms: 6,
      bedrooms: 3,
      bathrooms: 2,
      toilets: 2,
      surface: 150,
      furnished: false,
      pets: true,
      smoking: false
    },
    propertyAvailability: {
      startDate: "2024-05-01",
      type: "flexible"
    },
    equipments: [
      { id: "1", name: "Chauffage gaz", icon: "heater", lib: "MaterialCommunityIcons", category: "comfort" },
      { id: "2", name: "Cheminée insert", icon: "fireplace", lib: "MaterialCommunityIcons", category: "comfort" },
      { id: "3", name: "Cuisine aménagée", icon: "fridge", lib: "MaterialCommunityIcons", category: "kitchen" },
      { id: "4", name: "Garage 2 voitures", icon: "car", lib: "FontAwesome5", category: "other" },
      { id: "5", name: "Jardin 500m²", icon: "tree", lib: "FontAwesome5", category: "other" },
      { id: "6", name: "Portail automatique", icon: "shield-home", lib: "MaterialCommunityIcons", category: "security" }
    ],
    ownerCriteria: {
      minimumDuration: "2 ans",
      solvability: "3 fois le montant du loyer",
      guarantorRequired: false,
      acceptedSituations: ["Famille", "Couple", "Salarié", "Fonctionnaire"],
      requiredDocuments: {
        tenant: ["Pièce d'identité", "Justificatifs de revenus", "Assurance habitation"],
        guarantor: []
      }
    },
    services: [
      { key: "garden", title: "Conseil jardinage", description: "Conseils d'entretien jardin", icon: "leaf", included: true, available: true },
      { key: "maintenance", title: "Dépannage", description: "Interventions d'urgence", icon: "wrench", included: true, available: true }
    ],
    atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],
  },
  {
    id: "pent_2",
    avatar: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    price: "3800$",
    availibility: "not available",
    stars: 5,
    location: "Monaco Monte‑Carlo",
    review: "Penthouse exceptionnel face au casino ! 🎰",
    type: "Penthouse",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "gem", name: "Finitions luxe" },
      { icon: "champagne-glasses", name: "Bar privé" },
      { icon: "valet-parking", name: "Voiturier" }
    ],
     owner: {
      name: "Pierre et Marie Dupont",
      phone: "+33 5 56 78 90 12",
      email: "dupont.family@bordeaux-homes.fr",
      avatar: "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=150&q=80"
    },
    description: "Charmante maison familiale de style bordelais avec un grand jardin arboré. Parfaite pour une famille souhaitant profiter d'un cadre calme tout en restant proche du centre-ville. La maison dispose d'une belle cheminée et d'un garage double.",
    generalInfo: {
      rooms: 6,
      bedrooms: 3,
      bathrooms: 2,
      toilets: 2,
      surface: 150,
      furnished: false,
      pets: true,
      smoking: false
    },
    propertyAvailability: {
      startDate: "2024-05-01",
      type: "flexible"
    },
    equipments: [
      { id: "1", name: "Chauffage gaz", icon: "heater", lib: "MaterialCommunityIcons", category: "comfort" },
      { id: "2", name: "Cheminée insert", icon: "fireplace", lib: "MaterialCommunityIcons", category: "comfort" },
      { id: "3", name: "Cuisine aménagée", icon: "fridge", lib: "MaterialCommunityIcons", category: "kitchen" },
      { id: "4", name: "Garage 2 voitures", icon: "car", lib: "FontAwesome5", category: "other" },
      { id: "5", name: "Jardin 500m²", icon: "tree", lib: "FontAwesome5", category: "other" },
      { id: "6", name: "Portail automatique", icon: "shield-home", lib: "MaterialCommunityIcons", category: "security" }
    ],
    ownerCriteria: {
      minimumDuration: "2 ans",
      solvability: "3 fois le montant du loyer",
      guarantorRequired: false,
      acceptedSituations: ["Famille", "Couple", "Salarié", "Fonctionnaire"],
      requiredDocuments: {
        tenant: ["Pièce d'identité", "Justificatifs de revenus", "Assurance habitation"],
        guarantor: []
      }
    },
    services: [
      { key: "garden", title: "Conseil jardinage", description: "Conseils d'entretien jardin", icon: "leaf", included: true, available: true },
      { key: "maintenance", title: "Dépannage", description: "Interventions d'urgence", icon: "wrench", included: true, available: true }
    ],
    atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],
  },

  // === STUDIOS ===
  {
    id: "studio_1",
    avatar: "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&q=80",
    price: "580$",
    availibility: "available",
    stars: 3,
    location: "Paris Bastille",
    review: "Studio moderne et fonctionnel, parfait pour étudiants ! 📚",
    type: "Studio",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "bed", name: "Lit escamotable" },
      { icon: "subway", name: "Métro 2 min" },
      { icon: "coffee", name: "Cafés proches" }
    ],owner: {
      name: "Jean-Luc Moreau",
      phone: "+33 1 48 55 66 77",
      email: "jl.moreau@student-paris.com",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80"
    },
    description: "Studio parfaitement optimisé pour étudiants dans le quartier dynamique de Bastille. Entièrement meublé avec lit escamotable pour maximiser l'espace. Idéal pour un séjour d'études à Paris avec tous les commerces et transports à proximité.",
    generalInfo: {
      rooms: 1,
      bedrooms: 0,
      bathrooms: 1,
      toilets: 1,
      surface: 22,
      floor: 2,
      totalFloors: 5,
      furnished: true,
      pets: false,
      smoking: false
    },
  propertyAvailability: {
      startDate: "2024-09-01",
      endDate: "2025-06-30",
      type: "scheduled"
    },
    equipments: [
      { id: "1", name: "Lit escamotable", icon: "bed", lib: "FontAwesome5", category: "comfort" },
      { id: "2", name: "TV 32 pouces", icon: "tv", lib: "FontAwesome5", category: "entertainment" },
      { id: "3", name: "Wi-Fi étudiant", icon: "wifi", lib: "FontAwesome5", category: "other" },
      { id: "4", name: "Kitchenette équipée", icon: "microwave", lib: "MaterialCommunityIcons", category: "kitchen" },
      { id: "5", name: "Douche italienne", icon: "shower", lib: "FontAwesome5", category: "bathroom" },
      { id: "6", name: "Rangements optimisés", icon: "hanger", lib: "MaterialCommunityIcons", category: "other" }
    ],
    ownerCriteria: {
      minimumDuration: "Année scolaire",
      solvability: "Garant obligatoire",
      guarantorRequired: true,
      guarantorLocation: "France",
      acceptedSituations: ["Étudiant", "Stagiaire", "Jeune actif"],
      requiredDocuments: {
        tenant: ["Pièce d'identité", "Certificat de scolarité", "RIB"],
        guarantor: ["Pièce d'identité", "3 derniers bulletins de salaire", "Avis d'imposition"]
      }
    },
    services: [
      { key: "internet", title: "Internet étudiant", description: "Connexion adaptée aux études", icon: "wifi", included: true, available: true },
      { key: "laundry", title: "Laverie", description: "Laverie en rez-de-chaussée", icon: "washing-machine", price: "5€/cycle", included: false, available: true },
      { key: "support", title: "Support étudiant", description: "Assistance pour démarches", icon: "phone", included: true, available: true }
    ],
    atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],
  },
  {
    id: "studio_2",
    avatar: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    price: "650$",
    availibility: "available",
    stars: 0,
    location: "Lyon Bellecour",
    review: "Joli studio rénové, très bien équipé 🛏️",
    type: "Studio",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "kitchen", name: "Kitchenette" },
      { icon: "washer", name: "Lave‑linge" },
      { icon: "store", name: "Centre‑ville" }
    ],owner: {
      name: "Jean-Luc Moreau",
      phone: "+33 1 48 55 66 77",
      email: "jl.moreau@student-paris.com",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80"
    },
    description: "Studio parfaitement optimisé pour étudiants dans le quartier dynamique de Bastille. Entièrement meublé avec lit escamotable pour maximiser l'espace. Idéal pour un séjour d'études à Paris avec tous les commerces et transports à proximité.",
    generalInfo: {
      rooms: 1,
      bedrooms: 0,
      bathrooms: 1,
      toilets: 1,
      surface: 22,
      floor: 2,
      totalFloors: 5,
      furnished: true,
      pets: false,
      smoking: false
    },
    propertyAvailability: {
      startDate: "2024-09-01",
      endDate: "2025-06-30",
      type: "scheduled"
    },
    equipments: [
      { id: "1", name: "Lit escamotable", icon: "bed", lib: "FontAwesome5", category: "comfort" },
      { id: "2", name: "TV 32 pouces", icon: "tv", lib: "FontAwesome5", category: "entertainment" },
      { id: "3", name: "Wi-Fi étudiant", icon: "wifi", lib: "FontAwesome5", category: "other" },
      { id: "4", name: "Kitchenette équipée", icon: "microwave", lib: "MaterialCommunityIcons", category: "kitchen" },
      { id: "5", name: "Douche italienne", icon: "shower", lib: "FontAwesome5", category: "bathroom" },
      { id: "6", name: "Rangements optimisés", icon: "hanger", lib: "MaterialCommunityIcons", category: "other" }
    ],
    ownerCriteria: {
      minimumDuration: "Année scolaire",
      solvability: "Garant obligatoire",
      guarantorRequired: true,
      guarantorLocation: "France",
      acceptedSituations: ["Étudiant", "Stagiaire", "Jeune actif"],
      requiredDocuments: {
        tenant: ["Pièce d'identité", "Certificat de scolarité", "RIB"],
        guarantor: ["Pièce d'identité", "3 derniers bulletins de salaire", "Avis d'imposition"]
      }
    },
    services: [
      { key: "internet", title: "Internet étudiant", description: "Connexion adaptée aux études", icon: "wifi", included: true, available: true },
      { key: "laundry", title: "Laverie", description: "Laverie en rez-de-chaussée", icon: "washing-machine", price: "5€/cycle", included: false, available: true },
      { key: "support", title: "Support étudiant", description: "Assistance pour démarches", icon: "phone", included: true, available: true }
    ],
    atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],
  },

  // === LOFTS ===
  {
    id: "loft_1",
    avatar: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
    price: "1900$",
    availibility: "available",
    stars: 5,
    location: "Paris Marais",
    review: "Loft industriel magnifique, caractère unique ! 🏭",
    type: "Loft",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "stairs", name: "Mezzanine" },
      { icon: "palette", name: "Style industriel" },
      { icon: "lightbulb", name: "Éclairage design" }
    ],owner: {
      name: "Jean-Luc Moreau",
      phone: "+33 1 48 55 66 77",
      email: "jl.moreau@student-paris.com",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80"
    },
    description: "Studio parfaitement optimisé pour étudiants dans le quartier dynamique de Bastille. Entièrement meublé avec lit escamotable pour maximiser l'espace. Idéal pour un séjour d'études à Paris avec tous les commerces et transports à proximité.",
    generalInfo: {
      rooms: 1,
      bedrooms: 0,
      bathrooms: 1,
      toilets: 1,
      surface: 22,
      floor: 2,
      totalFloors: 5,
      furnished: true,
      pets: false,
      smoking: false
    },
    propertyAvailability: {
      startDate: "2024-09-01",
      endDate: "2025-06-30",
      type: "scheduled"
    },
    equipments: [
      { id: "1", name: "Lit escamotable", icon: "bed", lib: "FontAwesome5", category: "comfort" },
      { id: "2", name: "TV 32 pouces", icon: "tv", lib: "FontAwesome5", category: "entertainment" },
      { id: "3", name: "Wi-Fi étudiant", icon: "wifi", lib: "FontAwesome5", category: "other" },
      { id: "4", name: "Kitchenette équipée", icon: "microwave", lib: "MaterialCommunityIcons", category: "kitchen" },
      { id: "5", name: "Douche italienne", icon: "shower", lib: "FontAwesome5", category: "bathroom" },
      { id: "6", name: "Rangements optimisés", icon: "hanger", lib: "MaterialCommunityIcons", category: "other" }
    ],
    ownerCriteria: {
      minimumDuration: "Année scolaire",
      solvability: "Garant obligatoire",
      guarantorRequired: true,
      guarantorLocation: "France",
      acceptedSituations: ["Étudiant", "Stagiaire", "Jeune actif"],
      requiredDocuments: {
        tenant: ["Pièce d'identité", "Certificat de scolarité", "RIB"],
        guarantor: ["Pièce d'identité", "3 derniers bulletins de salaire", "Avis d'imposition"]
      }
    },
    services: [
      { key: "internet", title: "Internet étudiant", description: "Connexion adaptée aux études", icon: "wifi", included: true, available: true },
      { key: "laundry", title: "Laverie", description: "Laverie en rez-de-chaussée", icon: "washing-machine", price: "5€/cycle", included: false, available: true },
      { key: "support", title: "Support étudiant", description: "Assistance pour démarches", icon: "phone", included: true, available: true }
    ],
    atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],
  },
  {
    id: "loft_2",
    avatar: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80",
    price: "1650$",
    availibility: "available",
    stars: 0,
    location: "Lille Wazemmes",
    review: "Loft d'artiste avec verrière, très lumineux ! 🎨",
    type: "Loft",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "sun", name: "Verrière" },
      { icon: "paint-brush", name: "Atelier" },
      { icon: "music", name: "Insonorisé" }
    ],owner: {
      name: "Jean-Luc Moreau",
      phone: "+33 1 48 55 66 77",
      email: "jl.moreau@student-paris.com",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80"
    },
    description: "Studio parfaitement optimisé pour étudiants dans le quartier dynamique de Bastille. Entièrement meublé avec lit escamotable pour maximiser l'espace. Idéal pour un séjour d'études à Paris avec tous les commerces et transports à proximité.",
    generalInfo: {
      rooms: 1,
      bedrooms: 0,
      bathrooms: 1,
      toilets: 1,
      surface: 22,
      floor: 2,
      totalFloors: 5,
      furnished: true,
      pets: false,
      smoking: false
    },
    propertyAvailability: {
      startDate: "2024-09-01",
      endDate: "2025-06-30",
      type: "scheduled"
    },
    equipments: [
      { id: "1", name: "Lit escamotable", icon: "bed", lib: "FontAwesome5", category: "comfort" },
      { id: "2", name: "TV 32 pouces", icon: "tv", lib: "FontAwesome5", category: "entertainment" },
      { id: "3", name: "Wi-Fi étudiant", icon: "wifi", lib: "FontAwesome5", category: "other" },
      { id: "4", name: "Kitchenette équipée", icon: "microwave", lib: "MaterialCommunityIcons", category: "kitchen" },
      { id: "5", name: "Douche italienne", icon: "shower", lib: "FontAwesome5", category: "bathroom" },
      { id: "6", name: "Rangements optimisés", icon: "hanger", lib: "MaterialCommunityIcons", category: "other" }
    ],
    ownerCriteria: {
      minimumDuration: "Année scolaire",
      solvability: "Garant obligatoire",
      guarantorRequired: true,
      guarantorLocation: "France",
      acceptedSituations: ["Étudiant", "Stagiaire", "Jeune actif"],
      requiredDocuments: {
        tenant: ["Pièce d'identité", "Certificat de scolarité", "RIB"],
        guarantor: ["Pièce d'identité", "3 derniers bulletins de salaire", "Avis d'imposition"]
      }
    },
    services: [
      { key: "internet", title: "Internet étudiant", description: "Connexion adaptée aux études", icon: "wifi", included: true, available: true },
      { key: "laundry", title: "Laverie", description: "Laverie en rez-de-chaussée", icon: "washing-machine", price: "5€/cycle", included: false, available: true },
      { key: "support", title: "Support étudiant", description: "Assistance pour démarches", icon: "phone", included: true, available: true }
    ],
    atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],
  },

  // === BUREAUX ===
  {
    id: "office_1",
    avatar: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    price: "1200$",
    availibility: "available",
    stars: 0,
    location: "Paris La Défense",
    review: "Bureau moderne dans tour, parfait pour entreprise ! 🏢",
    type: "Bureau",
    features: [
      { icon: "wifi", name: "Wi‑Fi pro" },
      { icon: "phone", name: "Téléphonie" },
      { icon: "printer", name: "Imprimantes" },
      { icon: "meeting-room", name: "Salle réunion" }
    ],owner: {
      name: "Société PARIS BUSINESS",
      phone: "+33 1 41 22 33 44",
      email: "contact@paris-business.com",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&q=80"
    },
    description: "Espace de bureau professionnel au cœur de La Défense. Idéal pour entreprises en croissance avec tous les services inclus : réception, salles de réunion, connexion très haut débit et services de conciergerie d'entreprise.",
    generalInfo: {
      rooms: 5,
      bedrooms: 0,
      bathrooms: 2,
      toilets: 2,
      surface: 120,
      floor: 15,
      totalFloors: 30,
      furnished: true,
      pets: false,
      smoking: false
    },
    propertyAvailability: {
      startDate: "2024-03-15",
      type: "immediate"
    },
    equipments: [
      { id: "1", name: "Mobilier bureau", icon: "desk", lib: "MaterialCommunityIcons", category: "other" },
      { id: "2", name: "Écrans 4K", icon: "tv", lib: "FontAwesome5", category: "entertainment" },
      { id: "3", name: "Fibre dédiée", icon: "wifi", lib: "FontAwesome5", category: "other" },
      { id: "4", name: "Climatisation", icon: "fan", lib: "FontAwesome5", category: "comfort" },
      { id: "5", name: "Système téléphonique", icon: "phone", lib: "FontAwesome5", category: "other" },
      { id: "6", name: "Salle de réunion", icon: "users", lib: "FontAwesome5", category: "other" },
      { id: "7", name: "Sécurité 24h", icon: "shield-home", lib: "MaterialCommunityIcons", category: "security" }
    ],
    ownerCriteria: {
      minimumDuration: "1 an",
      solvability: "Bilan comptable",
      guarantorRequired: false,
      acceptedSituations: ["Entreprise", "Start-up", "Profession libérale", "Consultant"],
      requiredDocuments: {
        tenant: ["Kbis", "Bilan comptable", "Pièce d'identité dirigeant", "RIB entreprise"],
        guarantor: []
      }
    },
    services: [
      { key: "reception", title: "Accueil", description: "Service de réception", icon: "concierge-bell", included: true, available: true },
      { key: "meeting", title: "Salle de réunion", description: "Réservation salles", icon: "users", included: true, available: true },
      { key: "it", title: "Support IT", description: "Assistance informatique", icon: "laptop", price: "50€/intervention", included: false, available: true },
      { key: "catering", title: "Restauration", description: "Service traiteur", icon: "utensils", price: "Variable", included: false, available: true }
    ],
    atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],
  },
  {
    id: "office_2",
    avatar: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80",
    price: "850$",
    availibility: "available",
    stars: 3,
    location: "Lyon Part‑Dieu",
    review: "Espace de travail flexible, bon rapport qualité‑prix 💼",
    type: "Bureau",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "coffee", name: "Espace café" },
      { icon: "parking", name: "Parking" },
      { icon: "subway", name: "Métro proche" }
    ],owner: {
      name: "Société PARIS BUSINESS",
      phone: "+33 1 41 22 33 44",
      email: "contact@paris-business.com",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&q=80"
    },
    description: "Espace de bureau professionnel au cœur de La Défense. Idéal pour entreprises en croissance avec tous les services inclus : réception, salles de réunion, connexion très haut débit et services de conciergerie d'entreprise.",
    generalInfo: {
      rooms: 5,
      bedrooms: 0,
      bathrooms: 2,
      toilets: 2,
      surface: 120,
      floor: 15,
      totalFloors: 30,
      furnished: true,
      pets: false,
      smoking: false
    },
    propertyAvailability: {
      startDate: "2024-03-15",
      type: "immediate"
    },
    equipments: [
      { id: "1", name: "Mobilier bureau", icon: "desk", lib: "MaterialCommunityIcons", category: "other" },
      { id: "2", name: "Écrans 4K", icon: "tv", lib: "FontAwesome5", category: "entertainment" },
      { id: "3", name: "Fibre dédiée", icon: "wifi", lib: "FontAwesome5", category: "other" },
      { id: "4", name: "Climatisation", icon: "fan", lib: "FontAwesome5", category: "comfort" },
      { id: "5", name: "Système téléphonique", icon: "phone", lib: "FontAwesome5", category: "other" },
      { id: "6", name: "Salle de réunion", icon: "users", lib: "FontAwesome5", category: "other" },
      { id: "7", name: "Sécurité 24h", icon: "shield-home", lib: "MaterialCommunityIcons", category: "security" }
    ],
    ownerCriteria: {
      minimumDuration: "1 an",
      solvability: "Bilan comptable",
      guarantorRequired: false,
      acceptedSituations: ["Entreprise", "Start-up", "Profession libérale", "Consultant"],
      requiredDocuments: {
        tenant: ["Kbis", "Bilan comptable", "Pièce d'identité dirigeant", "RIB entreprise"],
        guarantor: []
      }
    },
    services: [
      { key: "reception", title: "Accueil", description: "Service de réception", icon: "concierge-bell", included: true, available: true },
      { key: "meeting", title: "Salle de réunion", description: "Réservation salles", icon: "users", included: true, available: true },
      { key: "it", title: "Support IT", description: "Assistance informatique", icon: "laptop", price: "50€/intervention", included: false, available: true },
      { key: "catering", title: "Restauration", description: "Service traiteur", icon: "utensils", price: "Variable", included: false, available: true }
    ],
    atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],
  },

  // === CHALETS ===
  {
    id: "chalet_1",
    avatar: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    price: "2800$",
    availibility: "available",
    stars: 5,
    location: "Chamonix",
    review: "Chalet authentique face au Mont‑Blanc ! ⛷️",
    type: "Chalet",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "fire", name: "Cheminée" },
      { icon: "skiing", name: "Pistes à pied" },
      { icon: "hot-tub", name: "Sauna" }
    ],owner: {
      name: "Société PARIS BUSINESS",
      phone: "+33 1 41 22 33 44",
      email: "contact@paris-business.com",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&q=80"
    },
    description: "Espace de bureau professionnel au cœur de La Défense. Idéal pour entreprises en croissance avec tous les services inclus : réception, salles de réunion, connexion très haut débit et services de conciergerie d'entreprise.",
    generalInfo: {
      rooms: 5,
      bedrooms: 0,
      bathrooms: 2,
      toilets: 2,
      surface: 120,
      floor: 15,
      totalFloors: 30,
      furnished: true,
      pets: false,
      smoking: false
    },
    propertyAvailability: {
      startDate: "2024-03-15",
      type: "immediate"
    },
    equipments: [
      { id: "1", name: "Mobilier bureau", icon: "desk", lib: "MaterialCommunityIcons", category: "other" },
      { id: "2", name: "Écrans 4K", icon: "tv", lib: "FontAwesome5", category: "entertainment" },
      { id: "3", name: "Fibre dédiée", icon: "wifi", lib: "FontAwesome5", category: "other" },
      { id: "4", name: "Climatisation", icon: "fan", lib: "FontAwesome5", category: "comfort" },
      { id: "5", name: "Système téléphonique", icon: "phone", lib: "FontAwesome5", category: "other" },
      { id: "6", name: "Salle de réunion", icon: "users", lib: "FontAwesome5", category: "other" },
      { id: "7", name: "Sécurité 24h", icon: "shield-home", lib: "MaterialCommunityIcons", category: "security" }
    ],
    ownerCriteria: {
      minimumDuration: "1 an",
      solvability: "Bilan comptable",
      guarantorRequired: false,
      acceptedSituations: ["Entreprise", "Start-up", "Profession libérale", "Consultant"],
      requiredDocuments: {
        tenant: ["Kbis", "Bilan comptable", "Pièce d'identité dirigeant", "RIB entreprise"],
        guarantor: []
      }
    },
    services: [
      { key: "reception", title: "Accueil", description: "Service de réception", icon: "concierge-bell", included: true, available: true },
      { key: "meeting", title: "Salle de réunion", description: "Réservation salles", icon: "users", included: true, available: true },
      { key: "it", title: "Support IT", description: "Assistance informatique", icon: "laptop", price: "50€/intervention", included: false, available: true },
      { key: "catering", title: "Restauration", description: "Service traiteur", icon: "utensils", price: "Variable", included: false, available: true }
    ],
    atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],
  },
  {
    id: "chalet_2",
    avatar: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80",
    price: "2200$",
    availibility: "available",
    stars: 0,
    location: "Val d'Isère",
    review: "Chalet cosy avec vue magnifique sur les Alpes ! 🏔️",
    type: "Chalet",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "snowflake", name: "Ski‑in/out" },
      { icon: "hot-tub", name: "Jacuzzi" },
      { icon: "utensils", name: "Chef à domicile" }
    ],owner: {
      name: "Société PARIS BUSINESS",
      phone: "+33 1 41 22 33 44",
      email: "contact@paris-business.com",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&q=80"
    },
    description: "Espace de bureau professionnel au cœur de La Défense. Idéal pour entreprises en croissance avec tous les services inclus : réception, salles de réunion, connexion très haut débit et services de conciergerie d'entreprise.",
    generalInfo: {
      rooms: 5,
      bedrooms: 0,
      bathrooms: 2,
      toilets: 2,
      surface: 120,
      floor: 15,
      totalFloors: 30,
      furnished: true,
      pets: false,
      smoking: false
    },
    propertyAvailability: {
      startDate: "2024-03-15",
      type: "immediate"
    },
    equipments: [
      { id: "1", name: "Mobilier bureau", icon: "desk", lib: "MaterialCommunityIcons", category: "other" },
      { id: "2", name: "Écrans 4K", icon: "tv", lib: "FontAwesome5", category: "entertainment" },
      { id: "3", name: "Fibre dédiée", icon: "wifi", lib: "FontAwesome5", category: "other" },
      { id: "4", name: "Climatisation", icon: "fan", lib: "FontAwesome5", category: "comfort" },
      { id: "5", name: "Système téléphonique", icon: "phone", lib: "FontAwesome5", category: "other" },
      { id: "6", name: "Salle de réunion", icon: "users", lib: "FontAwesome5", category: "other" },
      { id: "7", name: "Sécurité 24h", icon: "shield-home", lib: "MaterialCommunityIcons", category: "security" }
    ],
    ownerCriteria: {
      minimumDuration: "1 an",
      solvability: "Bilan comptable",
      guarantorRequired: false,
      acceptedSituations: ["Entreprise", "Start-up", "Profession libérale", "Consultant"],
      requiredDocuments: {
        tenant: ["Kbis", "Bilan comptable", "Pièce d'identité dirigeant", "RIB entreprise"],
        guarantor: []
      }
    },
    services: [
      { key: "reception", title: "Accueil", description: "Service de réception", icon: "concierge-bell", included: true, available: true },
      { key: "meeting", title: "Salle de réunion", description: "Réservation salles", icon: "users", included: true, available: true },
      { key: "it", title: "Support IT", description: "Assistance informatique", icon: "laptop", price: "50€/intervention", included: false, available: true },
      { key: "catering", title: "Restauration", description: "Service traiteur", icon: "utensils", price: "Variable", included: false, available: true }
    ],
    atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],
  },

  // === HÔTELS ===
  {
    id: "hotel_1",
    avatar: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    price: "450$",
    availibility: "available",
    stars: 5,
    location: "Paris Champs‑Élysées",
    review: "Hôtel de luxe, service exceptionnel ! 🎩",
    type: "Hôtel",
    features: [
      { icon: "wifi", name: "Wi‑Fi gratuit" },
      { icon: "concierge-bell", name: "Conciergerie" },
      { icon: "spa", name: "Spa" },
      { icon: "utensils", name: "Restaurant étoilé" }
    ],
    owner: {
      name: "Société PARIS BUSINESS",
      phone: "+33 1 41 22 33 44",
      email: "contact@paris-business.com",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&q=80"
    },
    description: "Espace de bureau professionnel au cœur de La Défense. Idéal pour entreprises en croissance avec tous les services inclus : réception, salles de réunion, connexion très haut débit et services de conciergerie d'entreprise.",
    generalInfo: {
      rooms: 5,
      bedrooms: 0,
      bathrooms: 2,
      toilets: 2,
      surface: 120,
      floor: 15,
      totalFloors: 30,
      furnished: true,
      pets: false,
      smoking: false
    },
    propertyAvailability: {
      startDate: "2024-03-15",
      type: "immediate"
    },
    equipments: [
      { id: "1", name: "Mobilier bureau", icon: "desk", lib: "MaterialCommunityIcons", category: "other" },
      { id: "2", name: "Écrans 4K", icon: "tv", lib: "FontAwesome5", category: "entertainment" },
      { id: "3", name: "Fibre dédiée", icon: "wifi", lib: "FontAwesome5", category: "other" },
      { id: "4", name: "Climatisation", icon: "fan", lib: "FontAwesome5", category: "comfort" },
      { id: "5", name: "Système téléphonique", icon: "phone", lib: "FontAwesome5", category: "other" },
      { id: "6", name: "Salle de réunion", icon: "users", lib: "FontAwesome5", category: "other" },
      { id: "7", name: "Sécurité 24h", icon: "shield-home", lib: "MaterialCommunityIcons", category: "security" }
    ],
    ownerCriteria: {
      minimumDuration: "1 an",
      solvability: "Bilan comptable",
      guarantorRequired: false,
      acceptedSituations: ["Entreprise", "Start-up", "Profession libérale", "Consultant"],
      requiredDocuments: {
        tenant: ["Kbis", "Bilan comptable", "Pièce d'identité dirigeant", "RIB entreprise"],
        guarantor: []
      }
    },
    services: [
      { key: "reception", title: "Accueil", description: "Service de réception", icon: "concierge-bell", included: true, available: true },
      { key: "meeting", title: "Salle de réunion", description: "Réservation salles", icon: "users", included: true, available: true },
      { key: "it", title: "Support IT", description: "Assistance informatique", icon: "laptop", price: "50€/intervention", included: false, available: true },
      { key: "catering", title: "Restauration", description: "Service traiteur", icon: "utensils", price: "Variable", included: false, available: true }
    ],
    atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],
  },
  {
    id: "hotel_2",
    avatar: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    price: "280$",
    availibility: "available",
    stars: 0,
    location: "Nice Promenade",
    review: "Hôtel face à la mer, parfait pour vacances ! 🏖️",
    type: "Hôtel",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "swimming-pool", name: "Piscine" },
      { icon: "umbrella-beach", name: "Plage privée" },
      { icon: "cocktail", name: "Bar" }
    ],owner: {
      name: "Société PARIS BUSINESS",
      phone: "+33 1 41 22 33 44",
      email: "contact@paris-business.com",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&q=80"
    },
    description: "Espace de bureau professionnel au cœur de La Défense. Idéal pour entreprises en croissance avec tous les services inclus : réception, salles de réunion, connexion très haut débit et services de conciergerie d'entreprise.",
    generalInfo: {
      rooms: 5,
      bedrooms: 0,
      bathrooms: 2,
      toilets: 2,
      surface: 120,
      floor: 15,
      totalFloors: 30,
      furnished: true,
      pets: false,
      smoking: false
    },
    propertyAvailability: {
      startDate: "2024-03-15",
      type: "immediate"
    },
    equipments: [
      { id: "1", name: "Mobilier bureau", icon: "desk", lib: "MaterialCommunityIcons", category: "other" },
      { id: "2", name: "Écrans 4K", icon: "tv", lib: "FontAwesome5", category: "entertainment" },
      { id: "3", name: "Fibre dédiée", icon: "wifi", lib: "FontAwesome5", category: "other" },
      { id: "4", name: "Climatisation", icon: "fan", lib: "FontAwesome5", category: "comfort" },
      { id: "5", name: "Système téléphonique", icon: "phone", lib: "FontAwesome5", category: "other" },
      { id: "6", name: "Salle de réunion", icon: "users", lib: "FontAwesome5", category: "other" },
      { id: "7", name: "Sécurité 24h", icon: "shield-home", lib: "MaterialCommunityIcons", category: "security" }
    ],
    ownerCriteria: {
      minimumDuration: "1 an",
      solvability: "Bilan comptable",
      guarantorRequired: false,
      acceptedSituations: ["Entreprise", "Start-up", "Profession libérale", "Consultant"],
      requiredDocuments: {
        tenant: ["Kbis", "Bilan comptable", "Pièce d'identité dirigeant", "RIB entreprise"],
        guarantor: []
      }
    },
    services: [
      { key: "reception", title: "Accueil", description: "Service de réception", icon: "concierge-bell", included: true, available: true },
      { key: "meeting", title: "Salle de réunion", description: "Réservation salles", icon: "users", included: true, available: true },
      { key: "it", title: "Support IT", description: "Assistance informatique", icon: "laptop", price: "50€/intervention", included: false, available: true },
      { key: "catering", title: "Restauration", description: "Service traiteur", icon: "utensils", price: "Variable", included: false, available: true }
    ],
    atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],
  },

  // === TERRAINS ===
  {
    id: "land_1",
    avatar: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
    price: "180$",
    availibility: "available",
    stars: 3,
    location: "Provence",
    review: "Beau terrain avec vue, idéal pour construire ! 🏗️",
    type: "Terrain",
    features: [
      { icon: "tree", name: "Arboré" },
      { icon: "mountain", name: "Vue montagne" },
      { icon: "road", name: "Accès facile" },
      { icon: "water", name: "Point d'eau" }
    ],owner: {
  name: "Agence Immobilière TERRA NOVA",
  phone: "+228 90 12 34 56",
  email: "contact@terranova.com",
  avatar: "https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=150&q=80"
},
description: "Terrain nu de 1200 m² situé en zone résidentielle, parfait pour la construction de villas ou de bâtiments commerciaux. Emplacement stratégique avec accès direct à la route principale et proche des commodités.",
generalInfo: {
  surface: 1200,              // Surface en m²
  constructible: true,        // Terrain constructible
  waterAccess: true,          // Accès à l'eau
  electricityAccess: true,    // Accès à l'électricité
  fenced: false,              // Terrain clôturé ?
  roadAccess: true,           // Accès route goudronnée
  documents: ["Titre foncier", "Plan de lotissement"]
},
propertyAvailability: {
  startDate: "2024-09-01",
  type: "immediate"           // Disponible immédiatement
},
equipments: [
  { id: "1", name: "Route goudronnée", icon: "road", lib: "FontAwesome5", category: "access" },
  { id: "2", name: "Bornage effectué", icon: "map-marker-alt", lib: "FontAwesome5", category: "legal" },
  { id: "3", name: "Raccordement eau", icon: "tint", lib: "FontAwesome5", category: "utilities" },
  { id: "4", name: "Raccordement électricité", icon: "bolt", lib: "FontAwesome5", category: "utilities" },
  { id: "5", name: "Proximité commerces", icon: "store", lib: "FontAwesome5", category: "location" },
  { id: "6", name: "Sécurité", icon: "shield-home", lib: "MaterialCommunityIcons", category: "security" }
],
ownerCriteria: {
  minimumDuration: "Libre (Vente ou Location)",
  solvability: "Capacité de financement",
  guarantorRequired: false,
  acceptedSituations: ["Particulier", "Promoteur immobilier", "Entreprise de construction"],
  requiredDocuments: {
    tenant: ["Pièce d'identité", "Justificatif de financement"],
    guarantor: []
  }
},
services: [
  { key: "survey", title: "Topographie", description: "Étude topographique du terrain", icon: "map", included: false, price: "Sur demande", available: true },
  { key: "legal", title: "Assistance juridique", description: "Vérification et rédaction des actes", icon: "balance-scale", included: false, price: "Sur devis", available: true },
  { key: "fencing", title: "Clôture", description: "Construction d'une clôture", icon: "draw-polygon", included: false, price: "Selon surface", available: true },
  { key: "cleaning", title: "Débroussaillage", description: "Nettoyage du terrain", icon: "tree", included: false, price: "Sur demande", available: true }
],
atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],

  },
  {
    id: "land_2",
    avatar: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    price: "350$",
    availibility: "available",
    stars: 0,
    location: "Côte d'Azur",
    review: "Terrain constructible proche mer, excellent potentiel ! 🌊",
    type: "Terrain",
    features: [
      { icon: "umbrella-beach", name: "Proche mer" },
      { icon: "hammer", name: "Constructible" },
      { icon: "electricity", name: "Raccordé" },
      { icon: "car", name: "Accès voiture" }
    ],owner: {
  name: "Agence Immobilière TERRA NOVA",
  phone: "+228 90 12 34 56",
  email: "contact@terranova.com",
  avatar: "https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=150&q=80"
},
description: "Terrain nu de 1200 m² situé en zone résidentielle, parfait pour la construction de villas ou de bâtiments commerciaux. Emplacement stratégique avec accès direct à la route principale et proche des commodités.",
generalInfo: {
  surface: 1200,              
  constructible: true,       
  waterAccess: true,          
  electricityAccess: true,    
  fenced: false,             
  roadAccess: true,          
  documents: ["Titre foncier", "Plan de lotissement"]
},
propertyAvailability: {
  startDate: "2024-09-01",
  type: "immediate"           
},
equipments: [
  { id: "1", name: "Route goudronnée", icon: "road", lib: "FontAwesome5", category: "access" },
  { id: "2", name: "Bornage effectué", icon: "map-marker-alt", lib: "FontAwesome5", category: "legal" },
  { id: "3", name: "Raccordement eau", icon: "tint", lib: "FontAwesome5", category: "utilities" },
  { id: "4", name: "Raccordement électricité", icon: "bolt", lib: "FontAwesome5", category: "utilities" },
  { id: "5", name: "Proximité commerces", icon: "store", lib: "FontAwesome5", category: "location" },
  { id: "6", name: "Sécurité", icon: "shield-home", lib: "MaterialCommunityIcons", category: "security" }
],
ownerCriteria: {
  minimumDuration: "Libre (Vente ou Location)",
  solvability: "Capacité de financement",
  guarantorRequired: false,
  acceptedSituations: ["Particulier", "Promoteur immobilier", "Entreprise de construction"],
  requiredDocuments: {
    tenant: ["Pièce d'identité", "Justificatif de financement"],
    guarantor: []
  }
},
services: [
  { key: "survey", title: "Topographie", description: "Étude topographique du terrain", icon: "map", included: false, price: "Sur demande", available: true },
  { key: "legal", title: "Assistance juridique", description: "Vérification et rédaction des actes", icon: "balance-scale", included: false, price: "Sur devis", available: true },
  { key: "fencing", title: "Clôture", description: "Construction d'une clôture", icon: "draw-polygon", included: false, price: "Selon surface", available: true },
  { key: "cleaning", title: "Débroussaillage", description: "Nettoyage du terrain", icon: "tree", included: false, price: "Sur demande", available: true }
],
atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],

  },

  // === COMMERCIAL ===
  {
    id: "com_1",
    avatar: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
    price: "2500$",
    availibility: "available",
    stars: 0,
    location: "Paris République",
    review: "Local commercial excellente situation ! 🛍️",
    type: "Commercial",
    features: [
      { icon: "store", name: "Vitrine" },
      { icon: "subway", name: "Métro proche" },
      { icon: "parking", name: "Parking client" },
      { icon: "people", name: "Fort passage" }
    ],
    owner: {
      name: "Société PARIS BUSINESS",
      phone: "+33 1 41 22 33 44",
      email: "contact@paris-business.com",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&q=80"
    },
    description: "Espace de bureau professionnel au cœur de La Défense. Idéal pour entreprises en croissance avec tous les services inclus : réception, salles de réunion, connexion très haut débit et services de conciergerie d'entreprise.",
    generalInfo: {
      rooms: 5,
      bedrooms: 0,
      bathrooms: 2,
      toilets: 2,
      surface: 120,
      floor: 15,
      totalFloors: 30,
      furnished: true,
      pets: false,
      smoking: false
    },
    propertyAvailability: {
      startDate: "2024-03-15",
      type: "immediate"
    },
    equipments: [
      { id: "1", name: "Mobilier bureau", icon: "desk", lib: "MaterialCommunityIcons", category: "other" },
      { id: "2", name: "Écrans 4K", icon: "tv", lib: "FontAwesome5", category: "entertainment" },
      { id: "3", name: "Fibre dédiée", icon: "wifi", lib: "FontAwesome5", category: "other" },
      { id: "4", name: "Climatisation", icon: "fan", lib: "FontAwesome5", category: "comfort" },
      { id: "5", name: "Système téléphonique", icon: "phone", lib: "FontAwesome5", category: "other" },
      { id: "6", name: "Salle de réunion", icon: "users", lib: "FontAwesome5", category: "other" },
      { id: "7", name: "Sécurité 24h", icon: "shield-home", lib: "MaterialCommunityIcons", category: "security" }
    ],
    ownerCriteria: {
      minimumDuration: "1 an",
      solvability: "Bilan comptable",
      guarantorRequired: false,
      acceptedSituations: ["Entreprise", "Start-up", "Profession libérale", "Consultant"],
      requiredDocuments: {
        tenant: ["Kbis", "Bilan comptable", "Pièce d'identité dirigeant", "RIB entreprise"],
        guarantor: []
      }
    },
    services: [
      { key: "reception", title: "Accueil", description: "Service de réception", icon: "concierge-bell", included: true, available: true },
      { key: "meeting", title: "Salle de réunion", description: "Réservation salles", icon: "users", included: true, available: true },
      { key: "it", title: "Support IT", description: "Assistance informatique", icon: "laptop", price: "50€/intervention", included: false, available: true },
      { key: "catering", title: "Restauration", description: "Service traiteur", icon: "utensils", price: "Variable", included: false, available: true }
    ],
    atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],
  },
  {
    id: "com_2",
    avatar: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80",
    price: "1800$",
    availibility: "available",
    stars: 0,
    location: "Lyon Bellecour",
    review: "Boutique en centre-ville, emplacement premium ! 💎",
    type: "Commercial",
    features: [
      { icon: "store", name: "Rez-de-chaussée" },
      { icon: "lightbulb", name: "Éclairage LED" },
      { icon: "shield-alt", name: "Sécurité" },
      { icon: "tram", name: "Transports" }
    ],
    owner: {
      name: "Société PARIS BUSINESS",
      phone: "+33 1 41 22 33 44",
      email: "contact@paris-business.com",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&q=80"
    },
    description: "Espace de bureau professionnel au cœur de La Défense. Idéal pour entreprises en croissance avec tous les services inclus : réception, salles de réunion, connexion très haut débit et services de conciergerie d'entreprise.",
    generalInfo: {
      rooms: 5,
      bedrooms: 0,
      bathrooms: 2,
      toilets: 2,
      surface: 120,
      floor: 15,
      totalFloors: 30,
      furnished: true,
      pets: false,
      smoking: false
    },
    propertyAvailability: {
      startDate: "2024-03-15",
      type: "immediate"
    },
    equipments: [
      { id: "1", name: "Mobilier bureau", icon: "desk", lib: "MaterialCommunityIcons", category: "other" },
      { id: "2", name: "Écrans 4K", icon: "tv", lib: "FontAwesome5", category: "entertainment" },
      { id: "3", name: "Fibre dédiée", icon: "wifi", lib: "FontAwesome5", category: "other" },
      { id: "4", name: "Climatisation", icon: "fan", lib: "FontAwesome5", category: "comfort" },
      { id: "5", name: "Système téléphonique", icon: "phone", lib: "FontAwesome5", category: "other" },
      { id: "6", name: "Salle de réunion", icon: "users", lib: "FontAwesome5", category: "other" },
      { id: "7", name: "Sécurité 24h", icon: "shield-home", lib: "MaterialCommunityIcons", category: "security" }
    ],
    ownerCriteria: {
      minimumDuration: "1 an",
      solvability: "Bilan comptable",
      guarantorRequired: false,
      acceptedSituations: ["Entreprise", "Start-up", "Profession libérale", "Consultant"],
      requiredDocuments: {
        tenant: ["Kbis", "Bilan comptable", "Pièce d'identité dirigeant", "RIB entreprise"],
        guarantor: []
      }
    },
    services: [
      { key: "reception", title: "Accueil", description: "Service de réception", icon: "concierge-bell", included: true, available: true },
      { key: "meeting", title: "Salle de réunion", description: "Réservation salles", icon: "users", included: true, available: true },
      { key: "it", title: "Support IT", description: "Assistance informatique", icon: "laptop", price: "50€/intervention", included: false, available: true },
      { key: "catering", title: "Restauration", description: "Service traiteur", icon: "utensils", price: "Variable", included: false, available: true }
    ],
    atouts: [
    {
      id: "res_05",
      type: "predefined",
      icon: "water",
      text: "Vue mer/lac exceptionnelle",
      lib: "MaterialCommunityIcons",
      category: "location",
      verified: true,
      priority: 5
    },
    {
      id: "res_23",
      type: "predefined", 
      icon: "swimming-pool",
      text: "Piscine à débordement",
      lib: "MaterialCommunityIcons",
      category: "outdoor",
      verified: true,
      priority: 5
    },
    {
      id: "custom_1640995200000",
      type: "custom_text",
      text: "Ascenseur panoramique avec vue à 360°",
      category: "custom",
      priority: 4
    },
    {
      id: "custom_icon_1640995201000",
      type: "custom_icon",
      text: "Héliport privé homologué",
      icon: "helicopter",
      lib: "FontAwesome5",
      category: "custom",
      priority: 5,
      customIcon: false
    }
  ],
  }
];

export default data;
