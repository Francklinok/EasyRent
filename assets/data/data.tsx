import { ItemType, FeatureIcon } from "@/types/ItemType";

const data: ItemType[] = [
  // === VILLAS ===
  {
    id: "villa_1",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/10939532127561869708_0",
    price: "2500$",
    availibility: "available",
    stars: 5,
    location: "Monaco",
    review: "Villa exceptionnelle avec vue mer, service haut de gamme ! ✨",
    type: "Villa",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "swimming-pool", name: "Piscine privée" },
      { icon: "car", name: "Garage" },
      { icon: "umbrella-beach", name: "Plage privée" },
      { icon: "utensils", name: "Chef privé" }
    ]
  },
  {
    id: "villa_2",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/10988673832593707750_0",
    price: "1800$",
    availibility: "available",
    stars: 4,
    location: "Cannes",
    review: "Magnifique villa avec jardin tropical, très paisible 🌺",
    type: "Villa",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "tree", name: "Jardin tropical" },
      { icon: "hot-tub", name: "Jacuzzi" },
      { icon: "shield-alt", name: "Sécurité 24h" }
    ]
  },
  {
    id: "villa_3",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/15475773575473773381_0",
    price: "3200$",
    availibility: "not available",
    stars: 5,
    location: "Saint-Tropez",
    review: "Villa de luxe incroyable, parfaite pour les vacances ! 🏖️",
    type: "Villa",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "swimming-pool", name: "Piscine infinity" },
      { icon: "wine-glass", name: "Cave à vin" },
      { icon: "mountain", name: "Vue panoramique" }
    ]
  },
  {
    id: "villa_4",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/376976537715212659_0",
    price: "2100$",
    availibility: "available",
    stars: 4,
    location: "Nice",
    review: "Villa moderne avec terrasse spacieuse, très confortable 🌟",
    type: "Villa",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "snowflake", name: "Climatisation" },
      { icon: "dumbbell", name: "Salle de sport" },
      { icon: "parking", name: "Parking privé" }
    ]
  },

  // === APPARTEMENTS ===
  {
    id: "apt_1",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/2539376670525203021_0",
    price: "850$",
    availibility: "available",
    stars: 4,
    location: "Paris 16ème",
    review: "Appartement moderne en plein cœur de Paris ! 🗼",
    type: "Appartement",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "elevator", name: "Ascenseur" },
      { icon: "subway", name: "Métro proche" },
      { icon: "shopping-cart", name: "Commerces" }
    ]
  },
  {
    id: "apt_2",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/8461669723175923763_0",
    price: "1200$",
    availibility: "available",
    stars: 5,
    location: "Lyon Part-Dieu",
    review: "Appartement haut standing avec vue sur la ville 🌆",
    type: "Appartement",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "snowflake", name: "Climatisation" },
      { icon: "concierge-bell", name: "Conciergerie" },
      { icon: "parking", name: "Parking souterrain" }
    ]
  },
  {
    id: "apt_3",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/10037853504073340740_0",
    price: "950$",
    availibility: "not available",
    stars: 4,
    location: "Marseille Vieux-Port",
    review: "Superbe appartement avec vue sur le port ! ⛵",
    type: "Appartement",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "balcony", name: "Balcon" },
      { icon: "anchor", name: "Vue port" },
      { icon: "utensils", name: "Restaurants" }
    ]
  },

  // === MAISONS ===
  {
    id: "house_1",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/12268530381852002230_0",
    price: "1400$",
    availibility: "available",
    stars: 4,
    location: "Bordeaux",
    review: "Maison familiale charmante avec grand jardin 🏡",
    type: "Maison",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "tree", name: "Grand jardin" },
      { icon: "fire", name: "Cheminée" },
      { icon: "parking", name: "Garage double" }
    ]
  },
  {
    id: "house_2",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/2580137789122596246_0",
    price: "1100$",
    availibility: "available",
    stars: 3,
    location: "Toulouse",
    review: "Maison traditionnelle bien située, calme et agréable 🌳",
    type: "Maison",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "home", name: "3 chambres" },
      { icon: "car", name: "Parking" },
      { icon: "playground", name: "Aire de jeux" }
    ]
  },
  {
    id: "house_3",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/3074469939646803983_0",
    price: "1650$",
    availibility: "available",
    stars: 5,
    location: "Strasbourg",
    review: "Maison d'architecte exceptionnelle, design moderne ! 🎨",
    type: "Maison",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "lightbulb", name: "Domotique" },
      { icon: "leaf", name: "Écologique" },
      { icon: "solar-panel", name: "Panneaux solaires" }
    ]
  },

  // === PENTHOUSES ===
  {
    id: "pent_1",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/8411369785669641642_0",
    price: "4500$",
    availibility: "available",
    stars: 5,
    location: "Paris La Défense",
    review: "Penthouse de luxe avec terrasse panoramique ! 🏙️",
    type: "Penthouse",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "city", name: "Vue 360°" },
      { icon: "hot-tub", name: "Jacuzzi terrasse" },
      { icon: "concierge-bell", name: "Conciergerie VIP" }
    ]
  },
  {
    id: "pent_2",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/11834009563185896930_0",
    price: "3800$",
    availibility: "not available",
    stars: 5,
    location: "Monaco Monte-Carlo",
    review: "Penthouse exceptionnel face au casino ! 🎰",
    type: "Penthouse",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "gem", name: "Finitions luxe" },
      { icon: "champagne-glasses", name: "Bar privé" },
      { icon: "valet-parking", name: "Voiturier" }
    ]
  },
  {
    id: "pent_3",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/4465858121247400679_0",
    price: "5200$",
    availibility: "available",
    stars: 5,
    location: "Cannes Croisette",
    review: "Penthouse face à la mer, absolument magique ! 🌊",
    type: "Penthouse",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "umbrella-beach", name: "Plage privée" },
      { icon: "helicopter", name: "Héliport" },
      { icon: "spa", name: "Spa privé" }
    ]
  },

  // === STUDIOS ===
  {
    id: "studio_1",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/6907908755788859053_0",
    price: "580$",
    availibility: "available",
    stars: 3,
    location: "Paris Bastille",
    review: "Studio moderne et fonctionnel, parfait pour étudiants ! 📚",
    type: "Studio",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "bed", name: "Lit escamotable" },
      { icon: "subway", name: "Métro 2min" },
      { icon: "coffee", name: "Cafés proches" }
    ]
  },
  {
    id: "studio_2",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/17859932747377814431_0",
    price: "650$",
    availibility: "available",
    stars: 4,
    location: "Lyon Bellecour",
    review: "Joli studio rénové, très bien équipé 🛏️",
    type: "Studio",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "kitchen", name: "Kitchenette" },
      { icon: "washer", name: "Lave-linge" },
      { icon: "store", name: "Centre-ville" }
    ]
  },
  {
    id: "studio_3",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/10070368541943641704_0",
    price: "720$",
    availibility: "not available",
    stars: 4,
    location: "Nice Centre",
    review: "Studio avec balcon, proche de tout ! ☀️",
    type: "Studio",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "balcony", name: "Balcon" },
      { icon: "beach", name: "Plage 5min" },
      { icon: "tram", name: "Tram proche" }
    ]
  },

  // === LOFTS ===
  {
    id: "loft_1",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/6638432744866290863_0",
    price: "1900$",
    availibility: "available",
    stars: 5,
    location: "Paris Marais",
    review: "Loft industriel magnifique, caractère unique ! 🏭",
    type: "Loft",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "stairs", name: "Mezzanine" },
      { icon: "palette", name: "Style industriel" },
      { icon: "lightbulb", name: "Éclairage design" }
    ]
  },
  {
    id: "loft_2",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/2277579195738512833_0",
    price: "1650$",
    availibility: "available",
    stars: 4,
    location: "Lille Wazemmes",
    review: "Loft d'artiste avec verrière, très lumineux ! 🎨",
    type: "Loft",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "sun", name: "Verrière" },
      { icon: "paint-brush", name: "Atelier" },
      { icon: "music", name: "Insonorisé" }
    ]
  },
  {
    id: "loft_3",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/5601976637739570381_0",
    price: "2200$",
    availibility: "available",
    stars: 5,
    location: "Lyon Confluence",
    review: "Loft contemporain avec vue sur Rhône ! 🌊",
    type: "Loft",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "water", name: "Vue fleuve" },
      { icon: "cube", name: "Design moderne" },
      { icon: "elevator", name: "Ascenseur privé" }
    ]
  },

  // === BUREAUX ===
  {
    id: "office_1",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/1358083255822510208_0",
    price: "1200$",
    availibility: "available",
    stars: 4,
    location: "Paris La Défense",
    review: "Bureau moderne dans tour, parfait pour entreprise ! 🏢",
    type: "Bureau",
    features: [
      { icon: "wifi", name: "Wi-Fi pro" },
      { icon: "phone", name: "Téléphonie" },
      { icon: "printer", name: "Imprimantes" },
      { icon: "meeting-room", name: "Salle réunion" }
    ]
  },
  {
    id: "office_2",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/351231639025811087_0",
    price: "850$",
    availibility: "available",
    stars: 3,
    location: "Lyon Part-Dieu",
    review: "Espace de travail flexible, bon rapport qualité-prix 💼",
    type: "Bureau",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "coffee", name: "Espace café" },
      { icon: "parking", name: "Parking" },
      { icon: "subway", name: "Métro proche" }
    ]
  },
  {
    id: "office_3",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/14754712175660795185_0",
    price: "1500$",
    availibility: "not available",
    stars: 5,
    location: "Marseille Euromed",
    review: "Bureau haut de gamme avec services premium ! ⭐",
    type: "Bureau",
    features: [
      { icon: "wifi", name: "Fibre optique" },
      { icon: "concierge-bell", name: "Conciergerie" },
      { icon: "shield-alt", name: "Sécurité" },
      { icon: "restaurant", name: "Restaurant" }
    ]
  },

  // === CHALETS ===
  {
    id: "chalet_1",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/12705209402833337432_0",
    price: "2800$",
    availibility: "available",
    stars: 5,
    location: "Chamonix",
    review: "Chalet authentique face au Mont-Blanc ! ⛷️",
    type: "Chalet",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "fire", name: "Cheminée" },
      { icon: "skiing", name: "Pistes à pied" },
      { icon: "hot-tub", name: "Sauna" }
    ]
  },
  {
    id: "chalet_2",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/15788520824795481796_0",
    price: "2200$",
    availibility: "available",
    stars: 4,
    location: "Val d'Isère",
    review: "Chalet cosy avec vue magnifique sur les Alpes ! 🏔️",
    type: "Chalet",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "snowflake", name: "Ski-in/out" },
      { icon: "hot-tub", name: "Jacuzzi" },
      { icon: "utensils", name: "Chef à domicile" }
    ]
  },
  {
    id: "chalet_3",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/16870117687110986998_0",
    price: "1800$",
    availibility: "available",
    stars: 4,
    location: "Les Gets",
    review: "Chalet traditionnel familial, très chaleureux ! 👨‍👩‍👧‍👦",
    type: "Chalet",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "tree", name: "Jardin" },
      { icon: "playground", name: "Aire de jeux" },
      { icon: "parking", name: "Garage" }
    ]
  },

  // === HÔTELS ===
  {
    id: "hotel_1",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/8198998468814765848_0",
    price: "450$",
    availibility: "available",
    stars: 5,
    location: "Paris Champs-Élysées",
    review: "Hôtel de luxe, service exceptionnel ! 🎩",
    type: "Hôtel",
    features: [
      { icon: "wifi", name: "Wi-Fi gratuit" },
      { icon: "concierge-bell", name: "Conciergerie" },
      { icon: "spa", name: "Spa" },
      { icon: "utensils", name: "Restaurant étoilé" }
    ]
  },
  {
    id: "hotel_2",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/12222481016559989262_0",
    price: "280$",
    availibility: "available",
    stars: 4,
    location: "Nice Promenade",
    review: "Hôtel face à la mer, parfait pour vacances ! 🏖️",
    type: "Hôtel",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "swimming-pool", name: "Piscine" },
      { icon: "umbrella-beach", name: "Plage privée" },
      { icon: "cocktail", name: "Bar" }
    ]
  },
  {
    id: "hotel_3",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/2419842217751766953_0",
    price: "320$",
    availibility: "not available",
    stars: 4,
    location: "Lyon Presqu'île",
    review: "Hôtel boutique design, très moderne ! 🎨",
    type: "Hôtel",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "dumbbell", name: "Fitness" },
      { icon: "coffee", name: "Bar lounge" },
      { icon: "car", name: "Voiturier" }
    ]
  },

  // === TERRAINS ===
  {
    id: "land_1",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/13391605841836178352_0",
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
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/10731810103363802751_0",
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
  {
    id: "land_3",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/15475773575473771222_0",
    price: "120$",
    availibility: "available",
    stars: 3,
    location: "Dordogne",
    review: "Grand terrain nature, parfait pour projet équestre ! 🐴",
    type: "Terrain",
    features: [
      { icon: "tree", name: "Boisé" },
      { icon: "horse", name: "Usage équestre" },
      { icon: "nature", name: "Écologique" },
      { icon: "fence", name: "Clôturé" }
    ]
  },

  // === COMMERCIAL ===
  {
    id: "com_1",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/14110616675660951222_0",
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
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/421213592723646738_0",
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
  },
  {
    id: "com_3",
    avatar: "http://googleusercontent.com/image_collection/image_retrieval/729384539155721259_0",
    price: "3200$",
    availibility: "not available",
    stars: 5,
    location: "Cannes Croisette",
    review: "Local haut de gamme face mer, prestige absolu ! ✨",
    type: "Commercial",
    features: [
      { icon: "umbrella-beach", name: "Face mer" },
      { icon: "gem", name: "Luxe" },
      { icon: "valet-parking", name: "Voiturier" },
      { icon: "champagne-glasses", name: "Clientèle VIP" }
    ]
  }
];

export default data;