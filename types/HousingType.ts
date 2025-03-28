

export interface Housing {
    id: string;
    title: string;
    description: string;
    price: number;
    surface: number;
    rooms: number;
    bathrooms: number;
    country: string;
    city: string;
    type: 'apartment' | 'house' | 'villa' | 'studio';
    amenities: string[];
    location: {
      latitude: number;
      longitude: number;
    };
    proximityScore: {
      transport: number;
      schools: number;
      healthcare: number;
      shopping: number;
    };
    images: string[];
  }
  