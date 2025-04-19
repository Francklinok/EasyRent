import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '../contexts/theme/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


// Composant pour le plan d'abonnement
const PlanCard = ({ plan, onSelect, isSelected }) => {
    const { theme } = useTheme();
    const borderColor = isSelected ? plan.color : 'transparent';
    
    return (
      <ThemedView
        variant='surface'
        // elevated = "medium"
        // elevated={isSelected ? "medium" : "small"}
        style={{
          borderRadius: 12,
          padding: 16,
          marginHorizontal: 8,
          borderWidth: 2,
          borderColor,
          width: Dimensions.get('window').width - 64,
          maxWidth: 300,
          alignSelf: 'center',
          marginVertical: 8,
        }}
      >
        {plan.popular && (
          <View style={{
            position: 'absolute',
            top: -10,
            right: 20,
            backgroundColor: plan.color,
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 16,
            zIndex: 1
          }}>
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}>
              POPULAIRE
            </Text>
          </View>
        )}
        
        <Text style={{ 
          fontSize: 20, 
          fontWeight: 'bold', 
          color: theme.onSurface,
          marginBottom: 4 
        }}>
          {plan.title}
        </Text>
        
        <Text style={{ 
          fontSize: 22, 
          fontWeight: 'bold', 
          color: plan.color,
          marginBottom: 16 
        }}>
          {plan.price}
        </Text>
        
        {/* Liste des fonctionnalités */}
        {plan.features.map((feature, index) => (
          <ThemedView variant='surface' key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Icon name="check-circle" size={18} color={plan.color} style={{ marginRight: 8 }} />
            <Text style={{ color: theme.onSurfaceVariant }}>{feature}</Text>
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
          <Text style={{ 
            color: isSelected ? '#FFFFFF' : theme.onSurfaceVariant, 
            fontWeight: 'bold' 
          }}>
            {isSelected ? 'SÉLECTIONNÉ' : 'CHOISIR'}
          </Text>
        </TouchableOpacity>
      </ThemedView>
    );
  };
  

  export default PlanCard;