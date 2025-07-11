
import { useState } from 'react';
import { PropertyItem } from '@/types/property';

export const useInventory = (sampleInventory: PropertyItem[]) => {
  const [inventory] = useState<PropertyItem[]>(sampleInventory);
  const [currentSection, setCurrentSection] = useState('main');
  const [viewMode, setViewMode] = useState('grid');
  const [filtersPanelVisible, setFiltersPanelVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    status: [],
    type: [],
    price: []
  });
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);
  const [quickViewVisible, setQuickViewVisible] = useState(false);

  const currency = 'EUR';

  const filteredInventory = inventory.filter(item => {
    if (activeFilters.status.length > 0 && !activeFilters.status.includes(item.status)) {
      return false;
    }
    
    if (activeFilters.type.length > 0 && !activeFilters.type.includes(item.type)) {
      return false;
    }
    
    if (activeFilters.price.length > 0) {
      const price = item.price.sale || 0;
      if (!activeFilters.price.some(range => {
        if (range === 'low' && price < 250000) return true;
        if (range === 'medium' && price >= 250000 && price < 500000) return true;
        if (range === 'high' && price >= 500000) return true;
        return false;
      })) {
        return false;
      }
    }
    
    return true;
  });

  const inventoryByType = {
    house: filteredInventory.filter(item => item.type === 'house'),
    apartment: filteredInventory.filter(item => item.type === 'apartment'),
    land: filteredInventory.filter(item => item.type === 'land'),
    commercial: filteredInventory.filter(item => item.type === 'commercial')
  };

  const openQuickView = (property: PropertyItem) => {
    setSelectedProperty(property);
    setQuickViewVisible(true);
  };

  const closeQuickView = () => {
    setQuickViewVisible(false);
    setTimeout(() => setSelectedProperty(null), 300);
  };

  const toggleFilter = (category: string, value: string) => {
    setActiveFilters(prev => {
      const filters = [...prev[category]];
      const index = filters.indexOf(value);
      
      if (index === -1) {
        filters.push(value);
      } else {
        filters.splice(index, 1);
      }
      
      return {
        ...prev,
        [category]: filters
      };
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({
      status: [],
      type: [],
      price: []
    });
  };

  return {
    inventory,
    currentSection,
    setCurrentSection,
    viewMode,
    setViewMode,
    filtersPanelVisible,
    setFiltersPanelVisible,
    activeFilters,
    toggleFilter,
    clearAllFilters,
    selectedProperty,
    quickViewVisible,
    openQuickView,
    closeQuickView,
    filteredInventory,
    inventoryByType,
    currency
  };
};
