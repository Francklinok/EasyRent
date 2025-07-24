import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { ThemedView } from "../ui/ThemedView";
import { ThemedText } from "../ui/ThemedText";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import RevolutionaryAtout from "./RevolutionaryAtout";
import { 
  AtoutItem, 
  PropertyCategory, 
  UpdatedItemType,
  ItemTypeManager,
  AtoutsManager 
} from "./UpdatedItemType";

interface PropertyPublicationScreenProps {
  navigation: any;
  route?: any;
}

const PropertyPublicationScreen: React.FC<PropertyPublicationScreenProps> = ({ 
  navigation, 
  route 
}) => {
  // État du formulaire
  const [propertyData, setPropertyData] = useState<Partial<UpdatedItemType>>({
    type: "Villa",
    propertyCategory: "residential",
    location: "",
    price: "",
    description: "",
    generalInfo: {
      surface: 0,
      rooms: 0,
      bedrooms: 0,
      bathrooms: 0
    }
  });

  const [selectedAtouts, setSelectedAtouts] = useState<AtoutItem[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [attractivenessScore, setAttractivenessScore] = useState(0);

  // Suggestions d'atouts intelligentes
  const [smartSuggestions, setSmartSuggestions] = useState<AtoutItem[]>([]);

  // Effet pour générer des suggestions intelligentes
  useEffect(() => {
    if (propertyData.type && propertyData.location && propertyData.generalInfo?.surface) {
      const tempItem = propertyData as UpdatedItemType;
      const suggestions = ItemTypeManager.generateSmartAtouts(tempItem);
      setSmartSuggestions(suggestions);
    }
  }, [propertyData.type, propertyData.location, propertyData.generalInfo?.surface]);

  // Effet pour calculer le score d'attractivité
  useEffect(() => {
    if (selectedAtouts.length > 0) {
      const tempItem = { ...propertyData, atouts: selectedAtouts } as UpdatedItemType;
      const score = ItemTypeManager.calculateAttractivenessScore(tempItem);
      setAttractivenessScore(score);
    } else {
      setAttractivenessScore(0);
    }
  }, [selectedAtouts]);

  const handleAtoutsChange = (newAtouts: AtoutItem[]) => {
    setSelectedAtouts(newAtouts);
  };

  const handleQuickAddSuggestion = (suggestion: AtoutItem) => {
    if (selectedAtouts.length >= 12) {
      Alert.alert("Limite atteinte", "Vous ne pouvez sélectionner que 12 atouts maximum.");
      return;
    }
    
    const newAtouts = [...selectedAtouts, suggestion];
    setSelectedAtouts(AtoutsManager.sortAtoutsByPriority(newAtouts));
  };

  const validateAndPublish = async () => {
    // Validation des atouts
    const tempItem = { ...propertyData, atouts: selectedAtouts } as UpdatedItemType;
    const validation = ItemTypeManager.validateAtouts(tempItem);
    
    if (!validation.valid && validation.warnings.length > 0) {
      Alert.alert(
        "Attention", 
        validation.warnings.join("\n\n"),
        [
          { text: "Modifier", style: "cancel" },
          { text: "Publier quand même", onPress: publishProperty }
        ]
      );
    } else {
      publishProperty();
    }
  };

  const publishProperty = async () => {
    try {
      const finalPropertyData: UpdatedItemType = {
        ...propertyData,
        id: `property_${Date.now()}`,
        atouts: selectedAtouts,
        customAtoutsCount: selectedAtouts.filter(a => a.type === "custom_text").length,
        lastAtoutsUpdate: new Date().toISOString(),
        aiGenerated: false,
        verifiedAtouts: selectedAtouts.filter(a => 
          a.type === "predefined" && (a as any).verified
        ).map(a => a.id)
      } as UpdatedItemType;

      // Ici vous feriez l'appel API pour sauvegarder
      console.log("Publication de la propriété:", finalPropertyData);
      
      Alert.alert(
        "Succès! 🎉", 
        `Votre propriété a été publiée avec un score d'attractivité de ${attractivenessScore}/100`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
      
    } catch (error) {
      Alert.alert("Erreur", "Une erreur est survenue lors de la publication.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <ThemedView className="p-4">
        
        {/* Header avec progression */}
        <ThemedView className="mb-6 p-4 bg-white rounded-xl shadow-sm">
          <ThemedText type="title" className="text-center mb-3">
            🏠 Publication de Propriété
          </ThemedText>
          
          {/* Barre de progression */}
          <View className="flex-row items-center justify-between mb-4">
            {[1, 2, 3].map((step) => (
              <View key={step} className="flex-row items-center flex-1">
                <View className={`w-8 h-8 rounded-full items-center justify-center ${
                  currentStep >= step ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  <ThemedText className={`text-sm font-bold ${
                    currentStep >= step ? 'text-white' : 'text-gray-500'
                  }`}>
                    {step}
                  </ThemedText>
                </View>
                {step < 3 && (
                  <View className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                )}
              </View>
            ))}
          </View>
          
          <View className="flex-row justify-between">
            <ThemedText className="text-xs text-gray-600">Infos de base</ThemedText>
            <ThemedText className="text-xs text-gray-600">Atouts</ThemedText>
            <ThemedText className="text-xs text-gray-600">Publication</ThemedText>
          </View>
        </ThemedView>

        {/* Score d'attractivité en temps réel */}
        {selectedAtouts.length > 0 && (
          <ThemedView className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
            <View className="w-full bg-green-200 rounded-full h-3 mt-3">
              <View 
                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${attractivenessScore}%` }}
              />
            </View>
            
            <ThemedText className="text-xs text-green-600 mt-2 text-center">
              {attractivenessScore >= 80 ? "🔥 Excellent!" : 
               attractivenessScore >= 60 ? "👍 Bien" : 
               attractivenessScore >= 40 ? "⚠️ Peut mieux faire" : "📈 À améliorer"}
            </ThemedText>
          </ThemedView>
        )}

        {/* Suggestions intelligentes */}
        {smartSuggestions.length > 0 && selectedAtouts.length < 12 && (
          <ThemedView className="mb-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
            <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons name="lightbulb" size={20} color="#8B5CF6" />
              <ThemedText type="subtitle" className="ml-2 text-purple-700">
                💡 Suggestions Intelligentes
              </ThemedText>
            </View>
            
            <ThemedText className="text-sm text-purple-600 mb-3">
              Basées sur vos informations, ces atouts pourraient intéresser vos locataires :
            </ThemedText>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {smartSuggestions.slice(0, 3).map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.id}
                  onPress={() => handleQuickAddSuggestion(suggestion)}
                  className="mr-3 p-3 bg-white rounded-xl border border-purple-200 min-w-48"
                >
                  <View className="flex-row items-center mb-2">
                    <MaterialCommunityIcons 
                      name={suggestion.icon as any} 
                      size={18} 
                      color="#8B5CF6" 
                    />
                    <ThemedText className="ml-2 text-sm font-medium text-purple-700">
                      {suggestion.text}
                    </ThemedText>
                  </View>
                  
                  <View className="flex-row items-center">
                    {Array.from({ length: suggestion.priority || 0 }, (_, i) => (
                      <MaterialCommunityIcons key={i} name="star" size={12} color="#FFD700" />
                    ))}
                    <ThemedText className="ml-2 text-xs text-purple-500">
                      Priorité {suggestion.priority}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ThemedView>
        )}

        {/* Composant principal d'atouts */}
        <RevolutionaryAtout
          propertyCategory={propertyData.propertyCategory}
          selectedAtouts={selectedAtouts}
          onAtoutsChange={handleAtoutsChange}
          editMode={true}
          maxAtouts={12}
        />

        {/* Analyse des atouts sélectionnés */}
        {selectedAtouts.length > 0 && (
          <ThemedView className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <ThemedText type="subtitle" className="mb-3 text-blue-700">
              📈 Analyse de vos Atouts
            </ThemedText>
            
            <View className="space-y-2">
              {/* Répartition par catégorie */}
              <View className="flex-row flex-wrap">
                {Object.entries(
                  selectedAtouts.reduce((acc, atout) => {
                    const cat = atout.category || 'autre';
                    acc[cat] = (acc[cat] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([category, count]) => (
                  <View key={category} className="mr-2 mb-2 px-3 py-1 bg-blue-100 rounded-full">
                    <ThemedText className="text-xs text-blue-700">
                      {category}: {count}
                    </ThemedText>
                  </View>
                ))}
              </View>
              
              {/* Statistiques */}
              <View className="flex-row justify-between pt-2 border-t border-blue-200">
                <View className="items-center">
                  <ThemedText className="text-lg font-bold text-blue-700">
                    {selectedAtouts.filter(a => a.type === "predefined").length}
                  </ThemedText>
                  <ThemedText className="text-xs text-blue-600">Vérifiés</ThemedText>
                </View>
                
                <View className="items-center">
                  <ThemedText className="text-lg font-bold text-blue-700">
                    {selectedAtouts.filter(a => a.type === "custom_text").length}
                  </ThemedText>
                  <ThemedText className="text-xs text-blue-600">Personnalisés</ThemedText>
                </View>
                
                <View className="items-center">
                  <ThemedText className="text-lg font-bold text-blue-700">
                    {Math.round(selectedAtouts.reduce((sum, a) => sum + (a.priority || 0), 0) / selectedAtouts.length * 10) / 10}
                  </ThemedText>
                  <ThemedText className="text-xs text-blue-600">Priorité moy.</ThemedText>
                </View>
              </View>
            </View>
          </ThemedView>
        )}

        {/* Conseils d'optimisation */}
        <ThemedView className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <View className="flex-row items-center mb-3">
            <MaterialCommunityIcons name="school" size={20} color="#F59E0B" />
            <ThemedText type="subtitle" className="ml-2 text-amber-700">
              🎯 Conseils d'Optimisation
            </ThemedText>
          </View>
          
          <View className="space-y-2">
            {selectedAtouts.length < 5 && (
              <ThemedText className="text-sm text-amber-700">
                • Ajoutez plus d'atouts (minimum 5-8 recommandé)
              </ThemedText>
            )}
            
            {selectedAtouts.length > 10 && (
              <ThemedText className="text-sm text-amber-700">
                • Trop d'atouts peuvent diluer l'impact - privilégiez la qualité
              </ThemedText>
            )}
            
            {selectedAtouts.filter(a => a.type === "custom_text").length > selectedAtouts.length * 0.6 && (
              <ThemedText className="text-sm text-amber-700">
                • Utilisez plus d'atouts prédéfinis pour crédibiliser votre annonce
              </ThemedText>
            )}
            
            {selectedAtouts.filter(a => (a.priority || 0) >= 4).length < 2 && (
              <ThemedText className="text-sm text-amber-700">
                • Ajoutez des atouts haute priorité (4-5⭐) pour plus d'impact
              </ThemedText>
            )}
            
            {selectedAtouts.length >= 5 && 
             selectedAtouts.filter(a => a.type === "predefined").length >= selectedAtouts.length * 0.6 &&
             selectedAtouts.filter(a => (a.priority || 0) >= 4).length >= 2 && (
              <ThemedText className="text-sm text-green-700 font-medium">
                ✅ Excellente sélection d'atouts ! Votre annonce sera attractive.
              </ThemedText>
            )}
          </View>
        </ThemedView>

        {/* Actions */}
        <ThemedView className="mt-6 space-y-3">
          {/* Prévisualisation */}
          <TouchableOpacity
            onPress={() => {
              // Ouvrir un modal de prévisualisation
              navigation.navigate('PropertyPreview', { 
                propertyData: { ...propertyData, atouts: selectedAtouts }
              });
            }}
            className="flex-row items-center justify-center p-4 bg-gray-100 rounded-xl"
          >
            <MaterialCommunityIcons name="eye" size={20} color="#6B7280" />
            <ThemedText className="ml-2 text-gray-700 font-medium">
              👀 Prévisualiser l'annonce
            </ThemedText>
          </TouchableOpacity>
          
          {/* Publication */}
          <TouchableOpacity
            onPress={validateAndPublish}
            disabled={selectedAtouts.length === 0}
            className={`flex-row items-center justify-center p-4 rounded-xl ${
              selectedAtouts.length > 0 
                ? 'bg-blue-500' 
                : 'bg-gray-300'
            }`}
          >
            <MaterialCommunityIcons 
              name="publish" 
              size={20} 
              color={selectedAtouts.length > 0 ? "white" : "#9CA3AF"} 
            />
            <ThemedText className={`ml-2 font-bold ${
              selectedAtouts.length > 0 ? 'text-white' : 'text-gray-500'
            }`}>
              🚀 Publier la Propriété
            </ThemedText>
          </TouchableOpacity>
          
          {selectedAtouts.length === 0 && (
            <ThemedText className="text-xs text-gray-500 text-center">
              Sélectionnez au moins un atout pour publier
            </ThemedText>
          )}
        </ThemedView>

        {/* Footer informatif */}
        <ThemedView className="mt-4 p-3 bg-gray-100 rounded-xl">
          <ThemedText className="text-xs text-gray-600 text-center leading-4">
            💡 <ThemedText className="font-bold">Astuce :</ThemedText> Les propriétés avec des atouts bien choisis 
            reçoivent en moyenne 3x plus de demandes de visite !
          </ThemedText>
        </ThemedView>

        {/* Debug info (à supprimer en production) */}
        {__DEV__ && (
          <ThemedView className="mt-4 p-3 bg-red-50 rounded-xl border border-red-200">
            <ThemedText className="text-xs text-red-600 font-mono">
              DEBUG: {selectedAtouts.length} atouts sélectionnés, 
              Score: {attractivenessScore}/100
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
  );
};

// export default PropertyPublicationScreen;flex-row items-center justify-between">
//               <View>
//                 <ThemedText type="subtitle" className="text-green-700">
//                   📊 Score d'Attractivité
//                 </ThemedText>
//                 <ThemedText className="text-sm text-green-600">
//                   Impact sur les locataires potentiels
//                 </ThemedText>
//               </View>
              
//               <View className="items-center">
//                 <ThemedText className="text-3xl font-bold text-green-700">
//                   {attractivenessScore}
//                 </ThemedText>
//                 <ThemedText className="text-xs text-green-600">/100</ThemedText>
//               </View>
//             </View>
            
//             <View className="