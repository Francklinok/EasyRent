import React from "react";
import { View, Text, FlatList } from "react-native";
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { ThemedView } from "../ui/ThemedView";
import { ThemedText } from "../ui/ThemedText";
import { AtoutItem } from "@/types/ItemType";
import { AtoutsManager } from "@/utils/atoutUtils";
import { useTheme } from "@/components/contexts/theme/themehook";

// Garder les atouts par défaut comme fallback (compatibilité)
const defaultFeatures = [
  { id: "1", icon: "map-marker-alt", text: "Emplacement idéal", lib: "FontAwesome5" },
  { id: "2", icon: "city", text: "Quartier calme et sécurisé", lib: "FontAwesome5" },
  { id: "3", icon: "weather-sunny", text: "Luminosité optimale", lib: "MaterialCommunityIcons" },
  { id: "4", icon: "fridge-outline", text: "Cuisine équipée", lib: "MaterialCommunityIcons" },
  { id: "5", icon: "sofa", text: "Salon spacieux", lib: "MaterialCommunityIcons" },
  { id: "6", icon: "bed", text: "Chambres avec rangements", lib: "FontAwesome5" },
  { id: "7", icon: "shower", text: "Salle de bain moderne", lib: "FontAwesome5" },
  { id: "8", icon: "wardrobe-outline", text: "Dressing intégré", lib: "MaterialCommunityIcons" },
  { id: "9", icon: "snowflake", text: "Climatisation et chauffage", lib: "FontAwesome5" },
  { id: "10", icon: "wifi", text: "Internet fibre optique", lib: "FontAwesome5" },
];

interface AtoutProps {
  itemData?: any;
}

const Atout = ({ itemData }: AtoutProps) => {
  const  {theme} = useTheme()
  // Vérification de disponibilité des données
  if (!itemData) {
    return (
      <ThemedView className="items-center pt-10">
        <ThemedText>Données non disponibles</ThemedText>
      </ThemedView>
    );
  }

  // LOGIQUE RÉVOLUTIONNAIRE : Détection automatique du format
  const getAtoutsData = () => {
    // 1. NOUVEAU FORMAT : itemData.atouts (format révolutionnaire)
    if (itemData.atouts && Array.isArray(itemData.atouts)) {
      console.log("🚀 Utilisation du nouveau format d'atouts révolutionnaire");
      return itemData.atouts;
    }

    // 2. ANCIEN FORMAT : itemData.features (rétrocompatibilité)
    if (itemData.features && Array.isArray(itemData.features)) {
      console.log("🔄 Migration de l'ancien format vers le nouveau");
      // Migration automatique des anciens features
      return AtoutsManager.migrateOldFeatures(itemData.features);
    }

    // 3. FALLBACK : Pas d'atouts spécifiques
    console.log("⚠️ Aucun atout spécifique, utilisation des atouts par défaut");
    return [];
  };

  const atoutsData = getAtoutsData();

  // Si aucun atout n'est disponible
  if (atoutsData.length === 0) {
    return (
      <ThemedView className="p-4 rounded-xl shadow-md h-full">
        <ThemedText type="title" className="mb-4 text-center">
          ✨ Atouts du logement
        </ThemedText>

        {/* Informations sur le logement */}
        {itemData && (
          <ThemedView className="mb-4 p-3 rounded-lg">
            <ThemedText type="subtitle" className="mb-2 text-center">
              {itemData.type} - {itemData.location}
            </ThemedText>
            {itemData.price && (
              <ThemedText className="font-bold text-center text-green-600 text-lg">
                💰 {itemData.price}
              </ThemedText>
            )}
            <View className="flex-row justify-center mt-2 space-x-4">
              {itemData.stars && (
                <ThemedText >
                  ⭐ {itemData.stars}/5
                </ThemedText>
              )}
              {itemData.generalInfo?.surface && (
                <ThemedText>
                  📏 {itemData.generalInfo.surface}m²
                </ThemedText>
              )}
            </View>
          </ThemedView>
        )}

        <ThemedView className="items-center py-8">
          <MaterialCommunityIcons name="information-outline" size={48} color={theme.surface} />
          <ThemedText className="mt-2 text-gray-500 text-center">
            Aucun atout spécifique renseigné pour cette propriété
          </ThemedText>
          <ThemedText className="mt-1 text-xs text-gray-400 text-center">
            Le propriétaire peut ajouter des atouts lors de la publication
          </ThemedText>
        </ThemedView>

        {/* Statut de disponibilité */}
        {itemData?.availibility !== undefined && (
          <ThemedView className={`mt-4 p-3 rounded-xl ${
            itemData.availibility === 'available' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <ThemedText className={`text-center font-medium ${
              itemData.availibility === 'available' ? 'text-green-700' : 'text-red-700'
            }`}>
              {itemData.availibility === 'available' ? "✅ Disponible" : "❌ Non disponible"}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    );
  }

  // Fonction pour récupérer le bon composant d'icône
  const getIconComponent = (atout: AtoutItem) => {
    // Pour les atouts de type texte uniquement
    if (atout.type === "custom_text") {
      return <MaterialCommunityIcons name="star" size={24} color={theme.star} />;
    }

    // Pour les atouts avec icônes
    const iconSize = 24;
    const iconColor = theme.primary;

    try {
      if (atout.lib === "FontAwesome5") {
        return <FontAwesome5 name={atout.icon as any} size={iconSize} color={iconColor} />;
      } else if (atout.lib === "MaterialCommunityIcons") {
        return <MaterialCommunityIcons name={atout.icon as any} size={iconSize} color={iconColor} />;
      } else if (atout.lib === "Ionicons") {
        return <Ionicons name={atout.icon as any} size={iconSize} color={iconColor} />;
      }
    } catch (error) {
      console.warn(`Icône non trouvée: ${atout.icon} dans ${atout.lib}`);
      // Fallback vers une icône par défaut
      return <MaterialCommunityIcons name="star" size={iconSize} color={theme.star} />;
    }

    // Fallback par défaut
    return <MaterialCommunityIcons name="check-circle" size={iconSize} color={iconColor} />;
  };

  // Tri des atouts par priorité (du plus important au moins important)
  const sortedAtouts = AtoutsManager.sortAtoutsByPriority([...atoutsData]);

  return (
    <ThemedView className="p-4 rounded-xl shadow-md h-full pb-16">
      <ThemedText type="subtitle" className="mb-4 text-center">
        ✨ Atouts Exceptionnels
      </ThemedText>
      
      {/* Informations sur le logement */}
      {itemData && (
        <ThemedView className="mb-4 p-4 ">
          <ThemedText type="body" className="mb-2 text-center">
            {itemData.type} - {itemData.location}
          </ThemedText>
          {itemData.price && (
            <ThemedText variant = "primary" intensity="strong" className="text-center">
              💰 {itemData.price}
            </ThemedText>
          )}
          <ThemedView className="flex-row justify-center mt-2 space-x-4">
            {itemData.stars && (
              <ThemedText >
                ⭐ {itemData.stars}/5
              </ThemedText>
            )}
            {itemData.generalInfo?.surface && (
              <ThemedText>
                📏 {itemData.generalInfo.surface}m²
              </ThemedText>
            )}
          </ThemedView>
        </ThemedView>
      )}

      {/* Badge indiquant le nombre d'atouts */}
      <ThemedView className="mb-4">
        <ThemedView className="flex-row justify-between items-center">
          <ThemedText>
            {sortedAtouts.length} atout{sortedAtouts.length > 1 ? 's' : ''} sélectionné{sortedAtouts.length > 1 ? 's' : ''}
          </ThemedText>
          
          {/* Indicateur de qualité basé sur les priorités */}
          <ThemedView className="flex-row items-center">
            {Array.from({ 
              length: Math.round(
                sortedAtouts.reduce((sum, a) => sum + (a.priority || 0), 0) / sortedAtouts.length
              ) 
            }, (_, i) => (
              <MaterialCommunityIcons key={i} name="star" size={14} color={theme.star} />
            ))}
            <ThemedText className="text-xs text-gray-500 ml-1">
              Qualité
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
      
      {/* Liste des atouts avec le nouveau système */}
      <FlatList
        key="atouts-2-columns"
        data={sortedAtouts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ThemedView variant = "surfaceVariant" bordered className="flex-row items-center mb-4 w-[48%] p-3 bg-white rounded-lg ">
            <ThemedView className="mr-3">
              {getIconComponent(item)}
            </ThemedView>
            
            <ThemedView variant = "surfaceVariant"  className="flex-1">
              <ThemedText >
                {item.text}
              </ThemedText>
              
              {/* Badges pour les différents types */}
              <ThemedView variant = "surfaceVariant" className="flex-col ">
                {item.type === "custom_text" && (
                  <ThemedView className=" py-0.5 w-16 items-center  rounded-full" style = {{backgroundColor:theme.blue200}}>
                    <ThemedText style = {{color:theme.surface}}>
                      UNIQUE
                    </ThemedText>
                  </ThemedView>
                )}
                
                {item.type === "predefined" && (item as any).verified && (
                  <ThemedView className=" w-16  items-center  rounded-full"style = {{backgroundColor:theme.success}}>
                    <ThemedText style = {{color:theme.surface}} >
                      ✓ VÉRIFIÉ
                    </ThemedText>
                  </ThemedView>
                )}
                
                {/* Étoiles de priorité pour les atouts importants */}
                {item.priority && item.priority >= 4 && (
                  <ThemedView variant = "surfaceVariant" className="flex-row pt-2">
                    {Array.from({ length: Math.min(item.priority, 5) }, (_, i) => (
                      <MaterialCommunityIcons key={i} name="star" size={10} color={theme.star} />
                    ))}
                  </ThemedView>
                )}
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}
      />

      {/* Statistiques des atouts */}
      <ThemedView className="mt-4 p-3 bg-gray-50 rounded-xl">
        <ThemedView className="flex-row justify-between">
          <ThemedView className="items-center">
            <ThemedText className="text-lg font-bold text-blue-600">
              {sortedAtouts.filter(a => a.type === "predefined").length}
            </ThemedText>
            <ThemedText >Vérifiés</ThemedText>
          </ThemedView>
          
          <ThemedView className="items-center">
            <ThemedText className="text-lg font-bold text-purple-600">
              {sortedAtouts.filter(a => a.type === "custom_text" || a.type === "custom_icon").length}
            </ThemedText>
            <ThemedText >Uniques</ThemedText>
          </ThemedView>
          
          <ThemedView className="items-center">
            <ThemedText>
              {sortedAtouts.filter(a => (a.priority || 0) >= 4).length}
            </ThemedText>
            <ThemedText>Premium</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
      
      {/* Statut de disponibilité */}
      {itemData?.availibility !== undefined && (
        <ThemedView className={`mt-4 p-3 rounded-xl items-center`}
        style = {{backgroundColor: itemData.availibility === 'available' ? theme.success:theme.error}}>
          <ThemedText style = {{color:theme.surface}}>
            {itemData.availibility === 'available' ? "✅ Disponible immédiatement" : "❌ Non disponible"}
          </ThemedText>
        </ThemedView>
      )}

      {/* Debug info en développement */}
      {__DEV__ && (
        <ThemedView className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
          <ThemedText className="text-xs text-yellow-800">
            🔧 DEV: {sortedAtouts.length} atouts • Format: {
              itemData.atouts ? "Nouveau" : itemData.features ? "Ancien migré" : "Défaut"
            }
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
};

export default Atout;