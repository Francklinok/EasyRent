import { Service, PropertyType, ServiceRecommendation } from '../types/ServiceTypes';

export class RecommendationEngine {
  private services: Service[] = [
    {
      id: '1',
      providerId: 'provider1',
      categoryId: 'jardinage',
      title: 'Jardinage professionnel',
      description: 'Entretien complet de votre jardin',
      images: [],
      priceType: 'monthly',
      basePrice: 80,
      contractType: 'long_term',
      availability: { days: ['Lun', 'Mer', 'Ven'], hours: { start: '09:00', end: '17:00' }, zones: ['Paris'] },
      propertyTypes: [{ type: 'house', hasGarden: true }],
      mandatory: false,
      tags: ['jardinage', 'tonte', 'taille'],
      status: 'active'
    },
    {
      id: '2',
      providerId: 'provider2',
      categoryId: 'menage',
      title: 'Ménage hebdomadaire',
      description: 'Service de ménage professionnel',
      images: [],
      priceType: 'hourly',
      basePrice: 25,
      contractType: 'both',
      availability: { days: ['Mar', 'Jeu', 'Sam'], hours: { start: '08:00', end: '18:00' }, zones: ['Paris'] },
      propertyTypes: [{ type: 'apartment' }, { type: 'house' }],
      mandatory: false,
      tags: ['menage', 'nettoyage', 'entretien'],
      status: 'active'
    },
    {
      id: '3',
      providerId: 'provider3',
      categoryId: 'assurance',
      title: 'Assurance habitation',
      description: 'Protection complète de votre logement',
      images: [],
      priceType: 'monthly',
      basePrice: 35,
      contractType: 'long_term',
      availability: { days: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'], hours: { start: '09:00', end: '18:00' }, zones: ['France'] },
      propertyTypes: [{ type: 'apartment' }, { type: 'house' }, { type: 'studio' }],
      mandatory: true,
      tags: ['assurance', 'protection', 'habitation'],
      status: 'active'
    }
  ];

  recommend(input: {
    propertyType: PropertyType;
    location: string;
    servicesAlreadySubscribed: string[];
  }): ServiceRecommendation[] {
    const recommendations: ServiceRecommendation[] = [];

    this.services.forEach(service => {
      if (input.servicesAlreadySubscribed.includes(service.id)) return;

      let score = 0;
      let reason = '';
      let priority: 'high' | 'medium' | 'low' = 'low';
      let timing: 'immediate' | 'after_move' | 'seasonal' = 'after_move';

      // Logique pour maison avec jardin
      if (input.propertyType.type === 'house' && input.propertyType.hasGarden && service.tags.includes('jardinage')) {
        score = 0.9;
        reason = 'Recommandé pour maison avec jardin';
        priority = 'high';
        timing = 'immediate';
      }

      // Logique pour appartement
      if (input.propertyType.type === 'apartment' && (service.tags.includes('assurance') || service.tags.includes('menage'))) {
        score = 0.8;
        reason = 'Essentiel pour appartement';
        priority = service.tags.includes('assurance') ? 'high' : 'medium';
        timing = 'immediate';
      }

      // Services obligatoires
      if (service.mandatory) {
        score = 1.0;
        reason = 'Service obligatoire';
        priority = 'high';
        timing = 'immediate';
      }

      if (score > 0) {
        recommendations.push({
          service,
          score,
          reason,
          priority,
          timing
        });
      }
    });

    return recommendations.sort((a, b) => b.score - a.score);
  }

  getSmartRecommendations(location: string): ServiceRecommendation[] {
    return [
      {
        service: this.services[0],
        score: 0.8,
        reason: 'Vos voisins utilisent ce service de jardinage',
        priority: 'medium',
        timing: 'after_move'
      }
    ];
  }
}