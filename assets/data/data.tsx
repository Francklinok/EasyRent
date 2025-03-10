
// const data = [
//   {
//     avatar: require("../images/1.jpg"),  
//     price: "430$",
//     availibilty: "available",
//     stars: "3",
//     location: "Florida",
//     review: "Très bel endroit, propre et bien situé ! 👍"
//   },

//   {
//     avatar: require("../images/2.jpg"), 
//     price: "780.22$",
//     availibilty: "not available",
//     stars: "5",
//     location: "Texas",
//     review: "Expérience incroyable, je recommande fortement ! ⭐⭐⭐⭐⭐"
//   },

//   {
//     avatar: require("../images/3.jpg"), 
//     price: "1000$",
//     availibilty: "available",
//     stars: "3",
//     location: "New York City",
//     review: "Bien mais un peu cher pour la qualité du service. 🤔"
//   },
  
//   {
//     avatar: require("../images/4.jpg"), 
//     price: "700$",
//     availibilty: "available",
//     stars: "4",
//     location: "California",
//     review: "Superbe vue et quartier calme, parfait pour se détendre ! 🌅"
//   },
// ];

// export default data;


import { ItemType } from "@/types/ItemType";

const data: ItemType[] = [
  {
    id: "1",
    avatar: require("../images/1.jpg"),
    price: "430$",
    availibility: "available",
    stars: 3,
    location: "Florida",
    review: "Très bel endroit, propre et bien situé ! 👍",
  },
  {
    id: "2",
    avatar: require("../images/2.jpg"),
    price: "780.22$",
    availibility: "not available",
    stars: 5,
    location: "Texas",
    review: "Expérience incroyable, je recommande fortement ! ⭐⭐⭐⭐⭐",
  },
  {
    id: "3",
    avatar: require("../images/3.jpg"),
    price: "1000$",
    availibility: "available",
    stars: 3,
    location: "New York City",
    review: "Bien mais un peu cher pour la qualité du service. 🤔",
  },
  {
    id: "4",
    avatar: require("../images/4.jpg"),
    price: "700$",
    availibility: "available",
    stars: 4,
    location: "California",
    review: "Superbe vue et quartier calme, parfait pour se détendre ! 🌅",
  },
];

export default data;
