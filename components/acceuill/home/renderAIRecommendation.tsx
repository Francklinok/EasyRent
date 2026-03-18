 
 import React from "react";
 import { TouchableOpacity} from "react-native";
 import {  MaterialCommunityIcons } from "@expo/vector-icons";
 import { LinearGradient } from "expo-linear-gradient";
 import { BlurView } from "expo-blur";
 import { MotiView, MotiText } from "moti";
 import { ThemedText } from "@/components/ui/ThemedText";
 import { ThemedView } from "@/components/ui/ThemedView";
import { useTheme } from "@/hooks/themehook";
import { useLanguage } from '@/components/contexts/language';

 
type Props = {
  showAIRecommendations:boolean,
  setShowAIRecommendations: React.Dispatch<React.SetStateAction<boolean>>;
}


 const RenderAIRecommendation:React.FC<Props> = ({showAIRecommendations,setShowAIRecommendations}) => {
    if (!showAIRecommendations) return null;
    const { t } = useLanguage();
    
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', delay: 300 }}
        className="mx-2 mb-2"
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
        
              className="px-4 py-2"
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
                    {t('homeComponents.aiAssistant')}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 12, color:"#93c5fd"}}>
                    {t('homeComponents.personalizedRecommendations')}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              
              <ThemedView 
                className="mt-3 p-4 rounded-xl "
                style={{ backgroundColor:'rgba(30, 58, 138, 0.3)'}}
              >
                <ThemedText  type ='caption' className="leading-1  w-70 text-wrap text-justify" style={{ color:"#bfdbfe"  }}>
                  {t('homeComponents.aiRecommendationText')}
                </ThemedText>
              </ThemedView>

              <ThemedView className="mt-3  mb-2 flex-row justify-between" style={{ backgroundColor: 'transparent' }}>
                <TouchableOpacity 
                  className="px-2 py-1 rounded-lg border"
                  style={{ 
                    backgroundColor:'rgba(37, 99, 235, 0.2)',
                    borderColor:'rgba(37, 99, 235, 0.3)'
                  }}
                >
                  <ThemedText style={{ color:"#93c5fd",  fontWeight: '600', fontSize: 12 }}>
                    {t('homeComponents.viewSuggestions')}
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="px-3 py-1 rounded-lg"
                  style={{ 
                    backgroundColor: 'rgba(37, 99, 235, 0.4)',
                  }}
                >
                  <ThemedText style={{ color: '#ffffff', fontWeight: '600', fontSize: 12 }}>
                    {t('homeComponents.refineCriteria')}
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