import { PropertyCategory,PredefinedAtout,AtoutItem,CustomTextAtout,CustomIconAtout,ATOUTS_SYSTEM } from "@/types/ItemType";

export class AtoutsManager {
  
  /**
   * Récupère les atouts prédéfinis par catégorie de propriété
   */
  static getPredefinedAtouts(category: PropertyCategory): PredefinedAtout[] {
    return ATOUTS_SYSTEM[category] || [];
  }
  
  /**
   * Recherche d'atouts par mots-clés
   */
  static searchAtouts(query: string, category?: PropertyCategory): AtoutItem[] {
    const atouts = category 
      ? this.getPredefinedAtouts(category)
      : Object.values(ATOUTS_SYSTEM).flat();
    
    return atouts.filter(atout => 
      atout.text.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  /**
   * Crée un atout personnalisé (texte libre)
   */
  static createCustomTextAtout(text: string, priority: number = 3): CustomTextAtout {
    return {
      id: `custom_${Date.now()}`,
      type: "custom_text",
      text: text.trim(),
      category: "custom",
      priority
    };
  }
  
  /**
   * Crée un atout personnalisé avec icône
   */
  static createCustomIconAtout(
    text: string, 
    icon: string, 
    lib: "FontAwesome5" | "MaterialCommunityIcons" = "FontAwesome5",
    priority: number = 3
  ): CustomIconAtout {
    return {
      id: `custom_icon_${Date.now()}`,
      type: "custom_icon",
      text: text.trim(),
      icon,
      lib,
      category: "custom",
      priority,
      customIcon: false
    };
  }
  
  /**
   * Filtre et trie les atouts par priorité
   */
  static sortAtoutsByPriority(atouts: AtoutItem[]): AtoutItem[] {
    return atouts.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }
  
  /**
   * Valide un atout personnalisé
   */
  static validateCustomAtout(text: string): { valid: boolean; error?: string } {
    if (!text || text.trim().length < 3) {
      return { valid: false, error: "L'atout doit contenir au moins 3 caractères" };
    }
    if (text.length > 100) {
      return { valid: false, error: "L'atout ne peut pas dépasser 100 caractères" };
    }
    return { valid: true };
  }
  
  /**
   * Convertit les anciens formats vers le nouveau système
   */
  static migrateOldFeatures(oldFeatures: any[]): AtoutItem[] {
    return oldFeatures.map((feature, index) => {
      if (typeof feature === 'string') {
        // Ancien format: juste du texte
        return this.createCustomTextAtout(feature);
      } else if (feature.icon && feature.name) {
        // Ancien format: {icon, name}
        return this.createCustomIconAtout(feature.name, feature.icon);
      }
      return this.createCustomTextAtout(`Atout ${index + 1}`);
    });
  }
}