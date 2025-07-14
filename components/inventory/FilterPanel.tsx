
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedScrollView } from '@/components/ui/ScrolleView';
import {
  X,
  Home as HomeIcon,
  Map as MapIcon,
  DollarSign as DollarSignIcon,
  Tag as TagIcon
} from 'lucide-react-native';
import { useTheme } from '@/components/contexts/theme/themehook';
import { getStatusColor, getStatusLabel } from '@/utils/inventory';
import { PropertyStatus } from '@/types/property';

interface FilterPanelProps {
  visible: boolean;
  onClose: () => void;
  activeFilters: any;
  toggleFilter: (category: string, value: string) => void;
  clearAllFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ 
  visible, 
  onClose, 
  activeFilters, 
  toggleFilter, 
  clearAllFilters 
}) => {
  const { theme } = useTheme();

  return (
    
  <ThemedView
      className={`absolute top-0 left-0 w-[300px] h-full z-[100] border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
        visible ? 'translate-x-0' : '-translate-x-[300px]'
      }`} 
      variant="default"
    >  
      <ThemedView className="flex-row justify-between items-center p-4 border-b border-gray-200">
        <ThemedText variant="default" className="text-lg font-bold">
          Filtres
        </ThemedText>
        <TouchableOpacity
          className="w-9 h-9 rounded-full items-center justify-center"
          onPress={onClose}
        >
          <X size={20} color={theme.onSurface} />
        </TouchableOpacity>
      </ThemedView>

      <ThemedScrollView className="flex-1 p-4">
        {/* Filtre par statut */}
        <ThemedView className="mb-6">
          <ThemedText variant="default" className="text-base font-semibold mb-3">
            Statut
          </ThemedText>

          <ThemedView className="flex-row flex-wrap">
            {(['available', 'rented', 'sold', 'pending'] as PropertyStatus[]).map(status => (
              <TouchableOpacity
                key={status}
                className={`flex-row items-center py-2 px-3 rounded-full border mr-2 mb-2 ${
                  activeFilters.status.includes(status) 
                    ? 'border-transparent' 
                    : 'border-gray-300'
                }`}
                style={
                  activeFilters.status.includes(status) 
                    ? {
                        backgroundColor: getStatusColor(status),
                        borderColor: getStatusColor(status)
                      }
                    : {}
                }
                onPress={() => toggleFilter('status', status)}
              >
                <ThemedText
                  className={`text-sm ml-1.5 ${
                    activeFilters.status.includes(status) ? 'text-white' : ''
                  }`}
                >
                  {getStatusLabel(status)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Filtre par type */}
        <ThemedView className="mb-6">
          <ThemedText variant="default" className="text-base font-semibold mb-3">
            Type
          </ThemedText>

          <ThemedView className="flex-row flex-wrap">
            <TouchableOpacity
              className={`flex-row items-center py-2 px-3 rounded-full border mr-2 mb-2 ${
                activeFilters.type.includes('house') 
                  ? 'border-transparent' 
                  : 'border-gray-300'
              }`}
              style={
                activeFilters.type.includes('house') 
                  ? {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary
                    }
                  : {}
              }
              onPress={() => toggleFilter('type', 'house')}
            >
              <HomeIcon 
                size={16} 
                color={activeFilters.type.includes('house') ?  theme.surface : theme.primary} 
              />
              <ThemedText
                className={`text-sm ml-1.5 ${
                  activeFilters.type.includes('house') ? 'text-white' : ''
                }`}
              >
                Maisons
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-row items-center py-2 px-3 rounded-full border mr-2 mb-2 ${
                activeFilters.type.includes('apartment') 
                  ? 'border-transparent' 
                  : 'border-gray-300'
              }`}
              style={
                activeFilters.type.includes('apartment') 
                  ? {
                      backgroundColor: theme.secondary,
                      borderColor: theme.secondary
                    }
                  : {}
              }
              onPress={() => toggleFilter('type', 'apartment')}
            >
              <HomeIcon 
                size={16} 
                color={activeFilters.type.includes('apartment') ? theme.surface : theme.secondary} 
              />
              <ThemedText
                className={`text-sm ml-1.5 ${
                  activeFilters.type.includes('apartment') ? 'text-white' : ''
                }`}
              >
                Appartements
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-row items-center py-2 px-3 rounded-full border mr-2 mb-2 ${
                activeFilters.type.includes('land') 
                  ? 'border-transparent' 
                  : 'border-gray-300'
              }`}
              style={
                activeFilters.type.includes('land') 
                  ? {
                      backgroundColor: theme.accent,
                      borderColor: theme.accent
                    }
                  : {}
              }
              onPress={() => toggleFilter('type', 'land')}
            >
              <MapIcon 
                size={16} 
                color={activeFilters.type.includes('land') ?  theme.surface : theme.accent} 
              />
              <ThemedText
                className={`text-sm ml-1.5 ${
                  activeFilters.type.includes('land') ? 'text-white' : ''
                }`}
              >
                Terrains
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-row items-center py-2 px-3 rounded-full border mr-2 mb-2 ${
                activeFilters.type.includes('commercial') 
                  ? 'border-transparent' 
                  : 'border-gray-300'
              }`}
              style={
                activeFilters.type.includes('commercial') 
                  ? {
                      backgroundColor: theme.onSurface,
                      borderColor: theme.onSurface
                    }
                  : {}
              }
              onPress={() => toggleFilter('type', 'commercial')}
            >
              <DollarSignIcon 
                size={16} 
                color={activeFilters.type.includes('commercial') ?  theme.surface : theme.onSurface} 
              />
              <ThemedText
                className={`text-sm ml-1.5 ${
                  activeFilters.type.includes('commercial') ? 'text-white' : ''
                }`}
              >
                Commercial
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {/* Filtre par prix */}
        <ThemedView className="mb-6">
          <ThemedText variant="default" className="text-base font-semibold mb-3">
            Prix
          </ThemedText>

          <ThemedView className="flex-row flex-wrap">
            <TouchableOpacity
              className={`flex-row items-center py-2 px-3 rounded-full border mr-2 mb-2 ${
                activeFilters.price.includes('low') 
                  ? 'border-transparent' 
                  : 'border-gray-300'
              }`}
              style={
                activeFilters.price.includes('low') 
                  ? {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary
                    }
                  : {}
              }
              onPress={() => toggleFilter('price', 'low')}
            >
              <TagIcon 
                size={16} 
                color={activeFilters.price.includes('low') ?  theme.surface : theme.primary} 
              />
              <ThemedText
                className={`text-sm ml-1.5 ${
                  activeFilters.price.includes('low') ? 'text-white' : ''
                }`}
              >
                - 250k€
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-row items-center py-2 px-3 rounded-full border mr-2 mb-2 ${
                activeFilters.price.includes('medium') 
                  ? 'border-transparent' 
                  : 'border-gray-300'
              }`}
              style={
                activeFilters.price.includes('medium') 
                  ? {
                      backgroundColor: theme.secondary,
                      borderColor: theme.secondary
                    }
                  : {}
              }
              onPress={() => toggleFilter('price', 'medium')}
            >
              <TagIcon
                size={16} 
                color={activeFilters.price.includes('medium') ? theme.surface : theme.secondary} 
              />
              <ThemedText
                className={`text-sm ml-1.5 ${
                  activeFilters.price.includes('medium') ? 'text-white' : ''
                }`}
              >
                250k€ - 500k€
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-row items-center py-2 px-3 rounded-full border mr-2 mb-2 ${
                activeFilters.price.includes('high') 
                  ? 'border-transparent' 
                  : 'border-gray-300'
              }`}
              style={
                activeFilters.price.includes('high') 
                  ? {
                      backgroundColor: theme.accent,
                      borderColor: theme.accent
                    }
                  : {}
              }
              onPress={() => toggleFilter('price', 'high')}
            >
              <TagIcon
                size={16} 
                color={activeFilters.price.includes('high') ? theme.surface : theme.accent} 
              />
              <ThemedText
                className={`text-sm ml-1.5 ${
                  activeFilters.price.includes('high') ? 'text-white' : ''
                }`}
              >
                500k€ +
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedScrollView>

      <ThemedView className="flex-row justify-between p-4 border-t border-gray-200">
        <TouchableOpacity
          className="py-2 px-4 rounded border border-blue-500"
          onPress={clearAllFilters}
        >
          <ThemedText variant="primary" className="font-medium">
            Effacer les filtres
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          className="py-2 px-4 rounded bg-blue-500"
          onPress={onClose}
        >
          <ThemedText className="text-white font-medium">
            Appliquer
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
};