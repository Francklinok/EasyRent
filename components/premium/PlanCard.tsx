import React from 'react';
import { TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../contexts/theme/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemedText } from '../ui/ThemedText';

// Composant pour le plan d'abonnement
const PlanCard = ({ plan, onSelect, isSelected }) => {
    const { theme } = useTheme();
    const borderColor = isSelected ? theme.outline : 'transparent';
    
    return (
      <ThemedView
        variant="surfaceVariant"
        // elevated = "medium"
        // elevated={isSelected ? "medium" : "small"}
        style={{
          borderRadius: 12,
          padding: 16,
          marginHorizontal: 2,
          borderWidth: 1,
          borderColor,
          width: Dimensions.get('window').width - 84,
          maxWidth: 250,
          alignSelf: 'center',
          marginVertical: 8,
        }}
      >
        {plan.popular && (
          <ThemedView style={{
            position: 'absolute',
            top: -10,
            right: 20,
            backgroundColor: plan.color,
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 16,
            zIndex: 1
          }}>
            <ThemedText intensity='strong' style={{ color:theme.surface }}>
              POPULAIRE
            </ThemedText>
          </ThemedView>
        )}
        
        <ThemedText type = 'subtitle' intensity='strong' style={{ 
          color: theme.onSurface,
          marginBottom: 4 
        }}>
          {plan.title}
        </ThemedText>
        
        <ThemedText type = "subtitle" style={{ 
          color: plan.color,
          marginBottom: 16 
        }}>
          {plan.price}
        </ThemedText>
        
        {/* Liste des fonctionnalités */}
        {plan.features.map((feature, index) => (
          <ThemedView variant="surfaceVariant" key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Icon name="check-circle" size={18} color={plan.color} style={{ marginRight: 8 }} />
            <ThemedText style={{ color: theme.onSurface }}>{feature}</ThemedText>
          </ThemedView>
        ))}
        
        <TouchableOpacity
          style={{
            backgroundColor: isSelected ? plan.color : theme.surfaceVariant,
            borderRadius: 8,
            paddingVertical: 12,
            alignItems: 'center',
            marginTop: 16
          }}
          onPress={() => onSelect(plan.id)}
        >
          <ThemedText type='body' intensity  ="strong" style={{ 
            color: isSelected ? theme.primary : theme.onSurfaceVariant, 
          }}>
            {isSelected ? 'SÉLECTIONNÉ' : 'CHOISIR'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  };
  

  export default PlanCard;