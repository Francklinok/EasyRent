import { Housing } from "@/types/HousingType";

const housingData: Housing = {
    id: '1',
    title: 'Beautiful Apartment in Paris',
    description: 'A spacious apartment in the heart of Paris.',
    price: 1200,
    surface: 80,
    rooms: 3,
    bathrooms: 1,
    country: 'France',
    city: 'Paris',
    type: 'apartment',
    amenities: ['Wi-Fi', 'Elevator', 'Balcony'],
    location: {
      latitude: 48.8566,
      longitude: 2.3522,
    },
    proximityScore: {
      transport: 9,
      schools: 8,
      healthcare: 7,
      shopping: 9,
    },
    images: [
      'https://example.com/image1.jpg', // Remplace par une URL d'image valide
      'https://example.com/image2.jpg',
    ],
  };
  
  export default housingData 
  // Pour afficher la carte, il suffit d'appeler la fonction renderHousingCard
  