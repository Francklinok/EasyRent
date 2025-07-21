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
    ]
  },
  {
    id: "villa_2",
    avatar: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    price: "1800$",
    availibility: "available",
    stars: 4,
    location: "Cannes",
    review: "Magnifique villa avec jardin tropical, très paisible 🌺",
    type: "Villa",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "tree", name: "Jardin tropical" },
      { icon: "hot-tub", name: "Jacuzzi" },
      { icon: "shield-alt", name: "Sécurité 24h" }
    ]
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
    ]
  },
  {
    id: "villa_4",
    avatar: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
    price: "2100$",
    availibility: "available",
    stars: 4,
    location: "Nice",
    review: "Villa moderne avec terrasse spacieuse, très confortable 🌟",
    type: "Villa",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "snowflake", name: "Climatisation" },
      { icon: "dumbbell", name: "Salle de sport" },
      { icon: "parking", name: "Parking privé" }
    ]
  },

  // === APPARTEMENTS ===
  {
    id: "apt_1",
    avatar: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    price: "850$",
    availibility: "available",
    stars: 4,
    location: "Paris 16ème",
    review: "Appartement moderne en plein cœur de Paris ! 🗼",
    type: "Appartement",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "elevator", name: "Ascenseur" },
      { icon: "subway", name: "Métro proche" },
      { icon: "shopping-cart", name: "Commerces" }
    ]
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
    ]
  },
  {
    id: "apt_3",
    avatar: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
    price: "950$",
    availibility: "not available",
    stars: 4,
    location: "Marseille Vieux‑Port",
    review: "Superbe appartement avec vue sur le port ! ⛵",
    type: "Appartement",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "balcony", name: "Balcon" },
      { icon: "anchor", name: "Vue port" },
      { icon: "utensils", name: "Restaurants" }
    ]
  },

  // === MAISONS ===
  {
    id: "house_1",
    avatar: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
    price: "1400$",
    availibility: "available",
    stars: 4,
    location: "Bordeaux",
    review: "Maison familiale charmante avec grand jardin 🏡",
    type: "Maison",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "tree", name: "Grand jardin" },
      { icon: "fire", name: "Cheminée" },
      { icon: "parking", name: "Garage double" }
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
    ]
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
    ]
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
    ]
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
    ]
  },
  {
    id: "studio_2",
    avatar: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    price: "650$",
    availibility: "available",
    stars: 4,
    location: "Lyon Bellecour",
    review: "Joli studio rénové, très bien équipé 🛏️",
    type: "Studio",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "kitchen", name: "Kitchenette" },
      { icon: "washer", name: "Lave‑linge" },
      { icon: "store", name: "Centre‑ville" }
    ]
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
    ]
  },
  {
    id: "loft_2",
    avatar: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80",
    price: "1650$",
    availibility: "available",
    stars: 4,
    location: "Lille Wazemmes",
    review: "Loft d'artiste avec verrière, très lumineux ! 🎨",
    type: "Loft",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "sun", name: "Verrière" },
      { icon: "paint-brush", name: "Atelier" },
      { icon: "music", name: "Insonorisé" }
    ]
  },

  // === BUREAUX ===
  {
    id: "office_1",
    avatar: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    price: "1200$",
    availibility: "available",
    stars: 4,
    location: "Paris La Défense",
    review: "Bureau moderne dans tour, parfait pour entreprise ! 🏢",
    type: "Bureau",
    features: [
      { icon: "wifi", name: "Wi‑Fi pro" },
      { icon: "phone", name: "Téléphonie" },
      { icon: "printer", name: "Imprimantes" },
      { icon: "meeting-room", name: "Salle réunion" }
    ]
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
    ]
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
    ]
  },
  {
    id: "chalet_2",
    avatar: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80",
    price: "2200$",
    availibility: "available",
    stars: 4,
    location: "Val d'Isère",
    review: "Chalet cosy avec vue magnifique sur les Alpes ! 🏔️",
    type: "Chalet",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "snowflake", name: "Ski‑in/out" },
      { icon: "hot-tub", name: "Jacuzzi" },
      { icon: "utensils", name: "Chef à domicile" }
    ]
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
    ]
  },
  {
    id: "hotel_2",
    avatar: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    price: "280$",
    availibility: "available",
    stars: 4,
    location: "Nice Promenade",
    review: "Hôtel face à la mer, parfait pour vacances ! 🏖️",
    type: "Hôtel",
    features: [
      { icon: "wifi", name: "Wi‑Fi" },
      { icon: "swimming-pool", name: "Piscine" },
      { icon: "umbrella-beach", name: "Plage privée" },
      { icon: "cocktail", name: "Bar" }
    ]
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
    ]
  },
  {
    id: "land_2",
    avatar: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    price: "350$",
    availibility: "available",
    stars: 4,
    location: "Côte d'Azur",
    review: "Terrain constructible proche mer, excellent potentiel ! 🌊",
    type: "Terrain",
    features: [
      { icon: "umbrella-beach", name: "Proche mer" },
      { icon: "hammer", name: "Constructible" },
      { icon: "electricity", name: "Raccordé" },
      { icon: "car", name: "Accès voiture" }
    ]
  },

  // === COMMERCIAL ===
  {
    id: "com_1",
    avatar: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
    price: "2500$",
    availibility: "available",
    stars: 4,
    location: "Paris République",
    review: "Local commercial excellente situation ! 🛍️",
    type: "Commercial",
    features: [
      { icon: "store", name: "Vitrine" },
      { icon: "subway", name: "Métro proche" },
      { icon: "parking", name: "Parking client" },
      { icon: "people", name: "Fort passage" }
    ]
  },
  {
    id: "com_2",
    avatar: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80",
    price: "1800$",
    availibility: "available",
    stars: 4,
    location: "Lyon Bellecour",
    review: "Boutique en centre-ville, emplacement premium ! 💎",
    type: "Commercial",
    features: [
      { icon: "store", name: "Rez-de-chaussée" },
      { icon: "lightbulb", name: "Éclairage LED" },
      { icon: "shield-alt", name: "Sécurité" },
      { icon: "tram", name: "Transports" }
    ]
  }
];

export default data;