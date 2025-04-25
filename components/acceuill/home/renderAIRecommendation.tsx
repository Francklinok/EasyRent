 
 import React from "react";
 import { TouchableOpacity} from "react-native";
 import {  MaterialCommunityIcons } from "@expo/vector-icons";
 import { LinearGradient } from "expo-linear-gradient";
 import { BlurView } from "expo-blur";
 import { MotiView, MotiText } from "moti";
 import { ThemedText } from "@/components/ui/ThemedText";
 import { ThemedView } from "@/components/ui/ThemedView";
import { useTheme } from "@/components/contexts/theme/themehook";

 
type Props = {
  showAIRecommendations:boolean,
  setShowAIRecommendations: React.Dispatch<React.SetStateAction<boolean>>;
}


 const RenderAIRecommendation:React.FC<Props> = ({showAIRecommendations,setShowAIRecommendations}) => {
    if (!showAIRecommendations) return null;
    
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', delay: 300 }}
        className="mx-2 mb-6"
      >
        <TouchableOpacity
          onPress={() => setShowAIRecommendations(false)}
          activeOpacity={0.9}
        >
          <BlurView
            intensity={ 30 }
            tint={"dark" }
            className="rounded-3xl overflow-hidden border"
            style={{ borderColor: 'rgba(147, 197, 253, 0.3)'}}
          >
            <LinearGradient
              colors={
                ['rgba(30, 58, 138, 0.4)', 'rgba(37, 99, 235, 0.1)'] }
        
              className="px-4 py-4"
            >
              <ThemedView className="flex-row items-center gap-3" style={{ backgroundColor: 'transparent' }}>
                <ThemedView 
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor:'rgba(96, 165, 250, 0.3)'}}
                >
                  <MaterialCommunityIcons name="robot-excited" size={24} color={"#60a5fa"} />
                </ThemedView>
                <ThemedView style={{ backgroundColor: 'transparent' }}>
                  <ThemedText style={{ fontWeight: '700', color:"#60a5fa"}}>
                    Assistant RenHome AI
                  </ThemedText>
                  <ThemedText style={{ fontSize: 12, color:"#93c5fd"}}>
                    Recommandations personnalisées
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              
              <ThemedView 
                className="mt-3 p-3 rounded-xl"
                style={{ backgroundColor:'rgba(30, 58, 138, 0.3)'}}
              >
                <ThemedText className="leading-5" style={{ color:"#bfdbfe"  }}>
                  Basé sur vos préférences, nous avons sélectionné 3 propriétés qui correspondent à vos critères. 
                  Notre analyse IA suggère que la propriété à "California" correspond le mieux à votre style de vie.
                </ThemedText>
              </ThemedView>

              <ThemedView className="mt-3 flex-row justify-between" style={{ backgroundColor: 'transparent' }}>
                <TouchableOpacity 
                  className="px-3 py-2 rounded-lg border"
                  style={{ 
                    backgroundColor:'rgba(37, 99, 235, 0.2)',
                    borderColor:'rgba(37, 99, 235, 0.3)'
                  }}
                >
                  <ThemedText style={{ color:"#93c5fd",  fontWeight: '600', fontSize: 12 }}>
                    Voir les suggestions
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="px-3 py-2 rounded-lg"
                  style={{ 
                    backgroundColor: 'rgba(37, 99, 235, 0.4)',
                  }}
                >
                  <ThemedText style={{ color: '#ffffff', fontWeight: '600', fontSize: 12 }}>
                    Affiner mes critères
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>
      </MotiView>
    );
  };

  export default RenderAIRecommendation;