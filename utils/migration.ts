import { AtoutsManager } from "./atoutUtils";
import { PropertyCategory } from "@/types/ItemType";
import { AtoutItem } from "@/types/ItemType";
import { ItemType } from "@/types/ItemType";

export class ItemTypeManager {
  
  /**
   * Migre un ancien ItemType vers le nouveau format
   */
  static migrateToNewFormat(oldItem: any): ItemType {
    const newItem: ItemType = {
      ...oldItem,
      propertyCategory: this.inferPropertyCategory(oldItem.type),
      lastAtoutsUpdate: new Date().toISOString()
    };
    
    // Migration des features vers atouts
    if (oldItem.features && !oldItem.atouts) {
      newItem.atouts = AtoutsManager.migrateOldFeatures(oldItem.features);
      newItem.customAtoutsCount = newItem.atouts.filter(a => a.type === "custom_text").length;
    }
    
    return newItem;
  }
  
  /**
   * Infère la catégorie de propriété à partir du type
   */
  static inferPropertyCategory(type: string): PropertyCategory {
    const typeMap: Record<string, PropertyCategory> = {
      "Villa": "residential",
      "Appartement": "residential", 
      "Maison": "residential",
      "Penthouse": "residential",
      "Studio": "residential",
      "Bureau": "commercial",
      "Commercial": "commercial",
      "Terrain": "land",
      "Château": "special"
    };
    
    return typeMap[type] || "residential";
  }
  
  /**
   * Génère des atouts intelligents basés sur les données de la propriété
   */
  static generateSmartAtouts(itemData: ItemType): AtoutItem[] {
    const suggestions: AtoutItem[] = [];
    const category = itemData.propertyCategory || "residential";
    
    // Suggestions basées sur les infos générales
    if (itemData.generalInfo.surface > 200) {
      suggestions.push({
        id: "smart_space",
        type: "predefined",
        icon: "cube",
        text: "Volumes exceptionnels",
        lib: "FontAwesome5",
        category: "design",
        verified: false,
        priority: 4
      });
    }
    
    if (itemData.stars >= 4) {
      suggestions.push({
        id: "smart_quality",
        type: "predefined", 
        icon: "gem",
        text: "Qualité premium certifiée",
        lib: "FontAwesome5",
        category: "design",
        verified: false,
        priority: 5
      });
    }
    
    // Suggestions basées sur la localisation
    if (itemData.location.toLowerCase().includes("mer") || 
        itemData.location.toLowerCase().includes("plage")) {
      suggestions.push({
        id: "smart_sea",
        type: "predefined",
        icon: "water",
        text: "Proximité mer exceptionnelle", 
        lib: "MaterialCommunityIcons",
        category: "location",
        verified: false,
        priority: 5
      });
    }
    
    return suggestions;
  }
  
  /**
   * Valide la cohérence des atouts d'une propriété
   */
  static validateAtouts(itemData: ItemType): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    if (!itemData.atouts || itemData.atouts.length === 0) {
      warnings.push("Aucun atout défini - cela peut réduire l'attractivité");
    }
    
    if (itemData.atouts && itemData.atouts.length > 15) {
      warnings.push("Trop d'atouts peuvent diluer l'impact - privilégiez la qualité");
    }
    
    const customAtouts = itemData.atouts?.filter(a => a.type === "custom_text") || [];
    if (customAtouts.length > itemData.atouts!.length * 0.6) {
      warnings.push("Trop d'atouts personnalisés - utilisez plus d'atouts prédéfinis vérifiés");
    }
    
    return {
      valid: warnings.length === 0,
      warnings
    };
  }
  
  /**
   * Génère un score d'attractivité basé sur les atouts
   */
  static calculateAttractivenessScore(itemData: ItemType): number {
    if (!itemData.atouts) return 0;
    
    let score = 0;
    
    itemData.atouts.forEach(atout => {
      // Score de base selon la priorité
      score += (atout.priority || 1) * 10;
      
      // Bonus pour les atouts vérifiés
      if (atout.type === "predefined" && atout.verified) {
        score += 15;
      }
      
      // Bonus pour la diversité des catégories
      // (implémentation simplifiée)
      score += 5;
    });
    
    // Normalisation sur 100
    return Math.min(100, Math.round(score / itemData.atouts.length));
  }
}

// Réexportation pour compatibilité
// export type { 
//   AtoutItem,
//   PropertyCategory,
//   AtoutType
// } from "./AtoutsSystem";

// export { AtoutsManager } from "./AtoutsSystem";