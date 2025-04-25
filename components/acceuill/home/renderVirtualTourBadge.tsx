
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";
import { MaterialCommunityIcons } from "@expo/vector-icons";


const RenderVirtualTourBadge = (available: boolean) => {
    if (!available) return null;
    
    return (
      <ThemedView 
        className="absolute top-1 right-14 px-1 py-1 rounded-lg flex-row items-center gap-1"
        style={{ 
          backgroundColor:'rgba(30, 64, 175, 0.7)',
          borderWidth: 1,
          borderColor: 'rgba(37, 99, 235, 0.2)',
        }}
      >
        <MaterialCommunityIcons 
          name="rotate-3d-variant" 
          size={14} 
          color={'#1e40af'} 
        />
        <ThemedText 
          style={{ 
            color: '#93c5fd', 
            fontWeight: '600', 
            fontSize: 10 
          }}
        >
          VISITE 3D
        </ThemedText>
      </ThemedView>
    );
  };
export  default RenderVirtualTourBadge;