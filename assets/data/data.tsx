
// import { ItemType } from "@/types/ItemType";

// const data: ItemType[] = [
//   {
//     id: "1",
//     avatar: require("../images/1.jpg"),
//     price: "430$",
//     availibility: "available",
//     stars: 3,
//     location: "Florida",
//     review: "Très bel endroit, propre et bien situé ! 👍",
//   },
//   {
//     id: "2",
//     avatar: require("../images/2.jpg"),
//     price: "780.22$",
//     availibility: "not available",
//     stars: 5,
//     location: "Texas",
//     review: "Expérience incroyable, je recommande fortement ! ⭐⭐⭐⭐⭐",
//   },
//   {
//     id: "3",
//     avatar: require("../images/3.jpg"),
//     price: "1000$",
//     availibility: "available",
//     stars: 3,
//     location: "New York City",
//     review: "Bien mais un peu cher pour la qualité du service. 🤔",
//   },
//   {
//     id: "4",
//     avatar: require("../images/4.jpg"),
//     price: "700$",
//     availibility: "available",
//     stars: 4,
//     location: "California",
//     review: "Superbe vue et quartier calme, parfait pour se détendre ! 🌅",
//   },
// ];

// export default data;
// Mettre à jour l'interface ItemType dans "@/types/ItemType"

// Mettre à jour votre fichier de données
import { ItemType, FeatureIcon } from "@/types/ItemType";

const data: ItemType[] = [
  {
    id: "1",
    avatar: require("../images/1.jpg"),
    price: "430$",
    availibility: "available",
    stars: 3,
    location: "Florida",
    review: "Très bel endroit, propre et bien situé ! 👍",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "snowflake", name: "Climatisation" },
      { icon: "parking", name: "Parking" }
    ]
  },
  {
    id: "2",
    avatar: require("../images/2.jpg"),
    price: "780.22$",
    availibility: "not available",
    stars: 5,
    location: "Texas",
    review: "Expérience incroyable, je recommande fortement ! ⭐⭐⭐⭐⭐",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "robot", name: "Assistant IA" },
      { icon: "swimming-pool", name: "Piscine" },
      { icon: "utensils", name: "Restaurant" }
    ]
  },
  {
    id: "3",
    avatar: require("../images/3.jpg"),
    price: "1000$",
    availibility: "available",
    stars: 3,
    location: "New York City",
    review: "Bien mais un peu cher pour la qualité du service. 🤔",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "shield-alt", name: "Sécurité" },
      { icon: "subway", name: "Proximité métro" }
    ]
  },
  {
    id: "4",
    avatar: require("../images/4.jpg"),
    price: "700$",
    availibility: "available",
    stars: 4,
    location: "California",
    review: "Superbe vue et quartier calme, parfait pour se détendre ! 🌅",
    features: [
      { icon: "wifi", name: "Wi-Fi" },
      { icon: "umbrella-beach", name: "Plage" },
      { icon: "mountain", name: "Vue panoramique" },
      { icon: "tree", name: "Nature" }
    ]
  },
];

export default data;