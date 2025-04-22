import React, { useState, useEffect, useRef } from 'react';
import {
  View, ScrollView, Switch, TouchableOpacity, StyleSheet, Animated,
  Dimensions, Text, PanResponder, Pressable, LayoutAnimation, Platform, UIManager
} from 'react-native';
import {
  Users, Bell, Search, Eye, Palette, MapPin, DollarSign, Home, Building,
  TreePine, HelpCircle, Info, LogOut, Lock, Sliders as SlidersIcon, MessageSquare,
  Settings as SettingsIcon, List, BarChart2, Moon, Sun, Maximize2, Volume2, Mic,
  Smartphone, Monitor, Trash2, Menu, Shield, ChevronRight, ChevronDown, X
} from 'lucide-react-native';
import { useTheme } from '@/components/contexts/theme/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { SettingsItem } from '@/components/ui/SettingsItems';
import Reanimated, { 
  useSharedValue, useAnimatedStyle, withSpring, withTiming, 
  interpolateColor, Easing, FadeIn, FadeOut, SlideInRight
} from 'react-native-reanimated';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const AnimatedThemedView = Reanimated.createAnimatedComponent(View);

// --- Structure de Données pour les Paramètres Immobiliers ---
const REAL_ESTATE_SETTINGS_DATA = {
  // Données existantes...
  account: {
    id: 'account', label: 'Mon Compte', icon: Users, sections: [
      { title: 'Profil', items: [
          { id: 'editProfile', label: 'Modifier mon profil', type: 'navigation', icon: Users },
          { id: 'myAddresses', label: 'Mes zones préférées', type: 'navigation', icon: MapPin },
      ]},
      { title: 'Sécurité', items: [
          { id: 'changePassword', label: 'Changer le mot de passe', type: 'navigation', icon: Lock },
          { id: 'twoFactor', label: 'Authentification à 2 facteurs', type: 'toggle', stateKey: 'twoFactorAuth', icon: Shield },
      ]},
      { title: 'Gestion du compte', items: [
          { id: 'deleteAccount', label: 'Supprimer mon compte', type: 'danger_action', icon: Trash2 },
      ]}
    ]
  },
  searchPrefs: {
      id: 'searchPrefs', label: 'Préférences de Recherche', icon: Search, sections: [
          { title: 'Critères par Défaut', items: [
              { id: 'defaultCity', label: 'Ville par défaut', type: 'navigation', icon: Building },
              { id: 'priceRange', label: 'Fourchette de prix', type: 'navigation', icon: DollarSign }
          ] },
          { title: 'Affichage', items: [
              { id: 'mapView', label: 'Vue carte par défaut', type: 'toggle', stateKey: 'defaultMapView', icon: MapPin }
          ] }
      ]
   },
  notifications: {
      id: 'notifications', label: 'Notifications', icon: Bell, sections: [
          { title: 'Alertes Immobilières', items: [
              { id: 'newListings', label: 'Nouvelles annonces', type: 'toggle', stateKey: 'newListingsNotif', icon: Home },
              { id: 'priceDrops', label: 'Baisse de prix', type: 'toggle', stateKey: 'priceDropsNotif', icon: DollarSign }
          ] },
          { title: 'Communications', items: [
              { id: 'messages', label: 'Messages', type: 'toggle', stateKey: 'messagesNotif', icon: MessageSquare }
          ] }
      ]
   },
   privacy: {
       id: 'privacy', label: 'Confidentialité', icon: Eye, sections: [
           { title: 'Visibilité & Partage', items: [
               { id: 'profileVisibility', label: 'Visibilité du profil', type: 'selector', stateKey: 'profilePrivacy', 
                 options: ['Public', 'Limité', 'Privé'], icon: Users }
           ] }
       ]
   },
  appearance: {
      id: 'appearance', label: 'Apparence', icon: Palette, sections: [
          { title: 'Thème', items: [
              { id: 'theme', label: 'Mode', type: 'theme_selector', icon: Palette }
          ] },
          { title: 'Accessibilité', items: [
              { id: 'fontSize', label: 'Taille du texte', type: 'slider', stateKey: 'fontSize', icon: SlidersIcon }
          ] }
      ]
  },
   support: {
       id: 'support', label: 'Aide & Infos', icon: HelpCircle, sections: [
           { title: 'Support', items: [
               { id: 'contactSupport', label: 'Contacter le support', type: 'navigation', icon: MessageSquare },
               { id: 'faq', label: 'FAQ', type: 'navigation', icon: HelpCircle }
           ] }
       ]
   },
};

const SettingsPanel = () => {
  const { theme, toggleTheme } = useTheme();
  const currentUserType = 'buyer'; // À remplacer par la logique réelle
  
  // --- États innovants ---
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedSubsections, setExpandedSubsections] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [quickAccessItems, setQuickAccessItems] = useState(['twoFactorAuth', 'newListingsNotif']);
  const [activeView, setActiveView] = useState('categories'); // 'categories', 'search', 'favorites'
  const [lastTouched, setLastTouched] = useState(null);
  
  // --- Animations ---
  const searchbarHeight = useSharedValue(0);
  const fadeAnim = useSharedValue(1);
  const scrollY = useSharedValue(0);
  
  // --- Filtrage conditionnel ---
  const settingsCategories = Object.values(REAL_ESTATE_SETTINGS_DATA).filter(
      category => !category.condition || category.condition(currentUserType)
  );

  // --- État des préférences ---
  const [settingsState, setSettingsState] = useState(() => {
      const initialState = {};
      settingsCategories.forEach(category => {
          category.sections?.forEach(section => {
              section.items?.forEach(item => {
                  if (item.type === 'toggle' && item.stateKey) initialState[item.stateKey] = false;
                  if (item.type === 'selector' && item.stateKey && item.options) initialState[item.stateKey] = item.options[0];
                  if (item.type === 'slider' && item.stateKey) initialState[item.stateKey] = 50; // Default value for sliders
              });
          });
      });
      initialState.twoFactorAuth = true; // Exemple
      initialState.newListingsNotif = true;
      initialState.fontSize = 50; // 50%
      initialState.profilePrivacy = 'Limité';
      return initialState;
  });

  // --- Styles animés ---
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(1 - (scrollY.value / 100 > 0.4 ? 0.4 : scrollY.value / 100)),
      transform: [{ translateY: -scrollY.value * 0.2 }],
    };
  });
  
  const searchAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: searchbarHeight.value,
      opacity: searchbarHeight.value / 50,
    };
  });

  // --- Gestion de la recherche ---
  const toggleSearch = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (showSearch) {
      searchbarHeight.value = withTiming(0);
      setShowSearch(false);
      setSearchQuery('');
    } else {
      setShowSearch(true);
      searchbarHeight.value = withTiming(50);
    }
  };

  // --- Fonction de recherche ---
  const getFilteredSettings = () => {
    if (!searchQuery.trim()) return [];
    
    const results = [];
    settingsCategories.forEach(category => {
      category.sections?.forEach(section => {
        section.items?.forEach(item => {
          if (item.label.toLowerCase().includes(searchQuery.toLowerCase())) {
            results.push({
              ...item,
              categoryId: category.id,
              categoryLabel: category.label,
              sectionTitle: section.title
            });
          }
        });
      });
    });
    return results;
  };

  // --- Gestion des changements de paramètres ---
  const handleSettingChange = (key, value) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    console.log(`Setting Changed: ${key} = ${value}`);
    setSettingsState(prev => ({ ...prev, [key]: value }));
    setLastTouched(key);
    
    // Simuler un retour visuel de confirmation
    setTimeout(() => setLastTouched(null), 800);
  };

  // --- Gestion des catégories ---
  const toggleCategory = (categoryId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  // --- Gestion des sous-sections ---
  const toggleSubsection = (categoryId, sectionIndex) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const key = `${categoryId}-${sectionIndex}`;
    setExpandedSubsections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // --- Gestion des favoris ---
  const toggleQuickAccess = (itemId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (quickAccessItems.includes(itemId)) {
      setQuickAccessItems(prev => prev.filter(id => id !== itemId));
    } else {
      setQuickAccessItems(prev => [...prev, itemId]);
    }
  };

  // --- Composants d'affichage des éléments ---
  const SettingToggleItem = ({ item, category, section }) => {
    const isHighlighted = lastTouched === item.stateKey;
    
    return (
      <Reanimated.View
        entering={FadeIn.duration(300)}
        style={[
          styles.settingItem,
          isHighlighted && { borderColor: theme.primary, borderWidth: 2 }
        ]}
      >
        <ThemedView variant="surface" style={[styles.itemContent, isHighlighted && styles.highlightedItem]}>
          <View style={styles.itemHeader}>
            <View style={styles.itemTitleRow}>
              {item.icon && 
                <ThemedView variant="surface" style={styles.iconContainer}>
                  <item.icon size={18} color={isHighlighted ? theme.primary : theme.text} />
                </ThemedView>
              }
              <View style={styles.itemTextContainer}>
                <ThemedText style={[styles.settingTitle, isHighlighted && {color: theme.primary}]}>
                  {item.label}
                </ThemedText>
                {category && section && (
                  <ThemedText style={styles.itemPath}>
                    {category.label} › {section.title}
                  </ThemedText>
                )}
              </View>
            </View>
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={styles.starButton}
                onPress={() => toggleQuickAccess(item.stateKey)}
              >
                <ThemedText style={{color: quickAccessItems.includes(item.stateKey) ? theme.primary : theme.subtext}}>
                  ★
                </ThemedText>
              </TouchableOpacity>
              <Switch
                value={settingsState[item.stateKey]}
                onValueChange={(newValue) => handleSettingChange(item.stateKey, newValue)}
                trackColor={{ false: theme.subtext || '#cccccc', true: theme.primary || '#5865f2' }}
                thumbColor={theme.surface || "#f4f3f4"}
                style={styles.switch}
              />
            </View>
          </View>
          {item.description && 
            <ThemedText style={styles.settingDescription}>
              {item.description}
            </ThemedText>
          }
        </ThemedView>
      </Reanimated.View>
    );
  };

  const SettingSelectorItem = ({ item, category, section }) => {
    const isHighlighted = lastTouched === item.stateKey;
    
    return (
      <Reanimated.View
        entering={FadeIn.duration(300)}
      >
        <TouchableOpacity 
          style={[styles.selectorItem, isHighlighted && styles.highlightedItem]}
          onPress={() => {
            // Simulate selector modal
            const currentIndex = item.options.findIndex(opt => opt === settingsState[item.stateKey]);
            const nextIndex = (currentIndex + 1) % item.options.length;
            handleSettingChange(item.stateKey, item.options[nextIndex]);
          }}
        >
          <View style={styles.itemTitleRow}>
            {item.icon && 
              <ThemedView variant="surface" style={styles.iconContainer}>
                <item.icon size={18} color={isHighlighted ? theme.primary : theme.text} />
              </ThemedView>
            }
            <View style={styles.itemTextContainer}>
              <ThemedText style={[styles.settingTitle, isHighlighted && {color: theme.primary}]}>
                {item.label}
              </ThemedText>
              {category && section && (
                <ThemedText style={styles.itemPath}>
                  {category.label} › {section.title}
                </ThemedText>
              )}
            </View>
          </View>
          <View style={styles.selectorValueContainer}>
            <ThemedText style={styles.selectorValue}>
              {settingsState[item.stateKey]}
            </ThemedText>
            <ChevronRight size={16} color={theme.subtext} />
          </View>
        </TouchableOpacity>
      </Reanimated.View>
    );
  };

  const ThemeSelectorItem = ({ item }) => {
    return (
      <ThemedView style={[styles.settingItem, styles.themeSelectorContainer]}>
        <View style={styles.itemHeader}>
          <View style={styles.itemTitleRow}>
            {item.icon && 
              <ThemedView variant="surface" style={styles.iconContainer}>
                <item.icon size={18} color={theme.text} />
              </ThemedView>
            }
            <ThemedText style={styles.settingTitle}>{item.label}</ThemedText>
          </View>
        </View>
        <View style={styles.themeSelectorOptions}>
          <TouchableOpacity
            style={[
              styles.themeOptionButton, 
              theme.mode !== 'dark' && styles.themeOptionActive,
              theme.mode !== 'dark' && { borderColor: theme.primary }
            ]}
            onPress={() => theme.mode !== 'light' && toggleTheme && toggleTheme('light')}
          >
            <Sun size={20} color={theme.mode === 'light' ? theme.primary : theme.text} />
            <ThemedText 
              style={[
                styles.themeOptionLabel, 
                theme.mode !== 'dark' && {color: theme.primary}
              ]}
            >
              Clair
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.themeOptionButton, 
              theme.mode === 'dark' && styles.themeOptionActive,
              theme.mode === 'dark' && { borderColor: theme.primary }
            ]}
            onPress={() => theme.mode !== 'dark' && toggleTheme && toggleTheme('dark')}
          >
            <Moon size={20} color={theme.mode === 'dark' ? theme.primary : theme.text} />
            <ThemedText 
              style={[
                styles.themeOptionLabel, 
                theme.mode === 'dark' && {color: theme.primary}
              ]}
            >
              Sombre
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  };

  const SliderItem = ({ item }) => {
    const isHighlighted = lastTouched === item.stateKey;
    const [localValue, setLocalValue] = useState(settingsState[item.stateKey]);
    
    // Handling dragging with animation
    const dragX = useSharedValue(settingsState[item.stateKey]);
    
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
          const newValue = Math.max(0, Math.min(100, localValue + gesture.dx / 2));
          setLocalValue(newValue);
          dragX.value = newValue;
        },
        onPanResponderRelease: (_, gesture) => {
          const newValue = Math.max(0, Math.min(100, localValue + gesture.dx / 2));
          handleSettingChange(item.stateKey, newValue);
          setLocalValue(newValue);
        },
      })
    ).current;
    
    return (
      <ThemedView style={[styles.settingItem, styles.sliderContainer, isHighlighted && styles.highlightedItem]}>
        <View style={styles.itemHeader}>
          <View style={styles.itemTitleRow}>
            {item.icon && 
              <ThemedView variant="surface" style={styles.iconContainer}>
                <item.icon size={18} color={isHighlighted ? theme.primary : theme.text} />
              </ThemedView>
            }
            <ThemedText style={[styles.settingTitle, isHighlighted && {color: theme.primary}]}>
              {item.label}
            </ThemedText>
          </View>
          <ThemedText style={styles.sliderValue}>{Math.round(localValue)}%</ThemedText>
        </View>
        
        <View style={styles.sliderTrack}>
          <View 
            style={[
              styles.sliderFill, 
              { width: `${localValue}%`, backgroundColor: theme.primary }
            ]} 
          />
          <View 
            {...panResponder.panHandlers}
            style={[
              styles.sliderThumb,
              { left: `${localValue}%`, backgroundColor: theme.primary }
            ]}
          />
        </View>
      </ThemedView>
    );
  };

  // --- Navigation Item ---
  const NavigationItem = ({ item, category, section }) => {
    return (
      <Reanimated.View
        entering={FadeIn.duration(300)}
      >
        <TouchableOpacity 
          style={styles.navigationItem}
          onPress={() => alert(`Naviguer vers ${item.label}`)}
        >
          <View style={styles.itemTitleRow}>
            {item.icon && 
              <ThemedView variant="surface" style={styles.iconContainer}>
                <item.icon size={18} color={theme.text} />
              </ThemedView>
            }
            <View style={styles.itemTextContainer}>
              <ThemedText style={styles.settingTitle}>{item.label}</ThemedText>
              {category && section && (
                <ThemedText style={styles.itemPath}>
                  {category.label} › {section.title}
                </ThemedText>
              )}
            </View>
          </View>
          <ChevronRight size={18} color={theme.subtext} />
        </TouchableOpacity>
      </Reanimated.View>
    );
  };

  // --- Danger Action Item ---
  const DangerActionItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.dangerActionItem} 
        onPress={() => alert(`Action: ${item.label}`)}
      >
        {item.icon && <item.icon size={18} color={theme.danger || '#ed4245'} style={{marginRight: 12}}/>}
        <ThemedText style={{ color: theme.danger || '#ed4245', fontWeight: '500' }}>{item.label}</ThemedText>
      </TouchableOpacity>
    );
  };

  // --- Render Item based on type ---
  const renderItem = (item, category = null, section = null) => {
    switch (item.type) {
      case 'toggle':
        return <SettingToggleItem key={item.id} item={item} category={category} section={section} />;
      case 'navigation':
        return <NavigationItem key={item.id} item={item} category={category} section={section} />;
      case 'selector':
        return <SettingSelectorItem key={item.id} item={item} category={category} section={section} />;
      case 'theme_selector':
        return <ThemeSelectorItem key={item.id} item={item} />;
      case 'slider':
        return <SliderItem key={item.id} item={item} />;
      case 'danger_action':
        return <DangerActionItem key={item.id} item={item} />;
      default:
        return null;
    }
  };

  // --- Header animé avec statistiques rapides ---
  const renderHeader = () => (
    <Reanimated.View style={[styles.headerContainer, headerAnimatedStyle]}>
      <ThemedView variant="surface" style={styles.headerCard}>
        <View style={styles.headerTop}>
          <ThemedText style={styles.headerTitle}>Paramètres</ThemedText>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton} onPress={toggleSearch}>
              {showSearch ? <X size={20} color={theme.text} /> : <Search size={20} color={theme.text} />}
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.quickStatsContainer}>
          <View style={styles.quickStatItem}>
            <Shield size={18} color={theme.primary} />
            <ThemedText style={styles.quickStatLabel}>
              {settingsState.twoFactorAuth ? 'Sécurisé' : 'Non sécurisé'}
            </ThemedText>
          </View>
          <View style={styles.quickStatItem}>
            <Bell size={18} color={theme.primary} />
            <ThemedText style={styles.quickStatLabel}>
              {Object.keys(settingsState).filter(key => key.includes('Notif') && settingsState[key]).length} alertes
            </ThemedText>
          </View>
          <View style={styles.quickStatItem}>
            <Palette size={18} color={theme.primary} />
            <ThemedText style={styles.quickStatLabel}>
              {theme.mode === 'dark' ? 'Mode sombre' : 'Mode clair'}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </Reanimated.View>
  );

  // --- Barre de recherche animée ---
  const renderSearchBar = () => (
    <Reanimated.View style={[styles.searchBarContainer, searchAnimatedStyle]}>
      <ThemedView variant="surface" style={styles.searchInputContainer}>
        <Search size={16} color={theme.subtext} style={styles.searchIcon} />
        <TextInput 
          style={[styles.searchInput, {color: theme.text}]}
          placeholder="Rechercher un paramètre..."
          placeholderTextColor={theme.subtext}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus={showSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <X size={16} color={theme.subtext} />
          </TouchableOpacity>
        )}
      </ThemedView>
    </Reanimated.View>
  );

  // --- Vue des favoris ---
  const renderQuickAccess = () => {
    if (quickAccessItems.length === 0) {
      return (
        <ThemedView style={styles.emptyStateContainer}>
          <ThemedText style={styles.emptyStateText}>
            Marquez des paramètres avec ★ pour les ajouter aux favoris
          </ThemedText>
        </ThemedView>
      );
    }
    
    return (
      <View style={styles.quickAccessContainer}>
        {settingsCategories.map(category => {
          return category.sections?.map((section, sectionIndex) => {
            return section.items?.map(item => {
              if (item.stateKey && quickAccessItems.includes(item.stateKey)) {
                return renderItem(item, category, section);
              }
              return null;
            }).filter(Boolean);
          }).filter(Boolean).flat();
        }).filter(Boolean).flat()}
      </View>
    );
  };

  // --- Vue des résultats de recherche ---
  const renderSearchResults = () => {
    const results = getFilteredSettings();
    
    if (results.length === 0 && searchQuery.length > 0) {
      return (
        <ThemedView style={styles.emptyStateContainer}>
          <ThemedText style={styles.emptyStateText}>
            Aucun résultat trouvé pour "{searchQuery}"
          </ThemedText>
        </ThemedView>
      );
    }
    
    return (
      <View style={styles.searchResultsContainer}>
        {results.map(item => {
          // Find the original category and section
          const category = settingsCategories.find(cat => cat.id === item.categoryId);
          const section = category?.sections?.find(sec => sec.title === item.sectionTitle);
          
          return renderItem(item, category, section);
        })}
      </View>
    );
  };

  // --- Vue principale avec les catégories ---
  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      {settingsCategories.map((category) => (
        <View key={category.id} style={styles.categoryContainer}>
          {/* Catégorie pliable */}
          <TouchableOpacity 
            style={[
              styles.categoryHeader,
              expandedCategory === category.id && styles.expandedCategoryHeader
            ]}
            onPress={() => toggleCategory(category.id)}
          >
            <View style={styles.categoryHeaderLeft}>
              <ThemedView variant="surface" style={styles.categoryIconContainer}>
                <category.icon size={20} color={expandedCategory === category.id ? theme.primary : theme.text} />
              </ThemedView>
              <ThemedText 
                style={[
                  styles.categoryTitle,
                  expandedCategory === category.id && {color: theme.primary, fontWeight: '600'}
                ]}
              >
                {category.label}
              </ThemedText>
            </View>
            <ChevronDown 
              size={18} 
              color={theme.text} 
              style={[
                styles.chevron,
                expandedCategory === category.id && styles.chevronExpanded
              ]} 
            />
          </TouchableOpacity>
          
          {/* Contenu de la catégorie */}
          {expandedCategory === category.id && category.sections?.map((section, sectionIndex) => {
            const sectionKey = `${category.id}-${sectionIndex}`;
            const isSectionExpanded = expandedSubsections[sectionKey] !== false; // Par défaut, les sections sont ouvertes
            
            return (
              <Reanimated.View 
                key={`${category.id}-section-${sectionIndex}`}
                entering={SlideInRight.duration(300).delay(sectionIndex * 50)}
                style={styles.sectionContainer}
              >
                {/* En-tête de section pliable */}
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => toggleSubsection(category.id, sectionIndex)}
                >
                  <ThemedText style={[
                    styles.sectionTitle,
                    isSectionExpanded && {color: theme.primary}
                  ]}>
                    {section.title}
                  </ThemedText>
                  <ChevronDown 
                    size={14} 
                    color={theme.subtext} 
                    style={[
                      styles.miniChevron,
                      isSectionExpanded && styles.chevronExpanded
                    ]} 
                  />
                </TouchableOpacity>
                
                {/* Items de la section */}
                {isSectionExpanded && (
                  <View style={styles.sectionItemsContainer}>
                    {section.items?.map((item) => renderItem(item))}
                  </View>
                )}
              </Reanimated.View>
            );
          })}
        </View>
      ))}
    </View>
  );

  // --- Navbar inférieure ---
  const renderNavbar = () => (
    <ThemedView variant="surface" style={styles.navbar}>
      <TouchableOpacity 
        style={[styles.navbarItem, activeView === 'categories' && styles.activeNavbarItem]}
        onPress={() => setActiveView('categories')}
      >
        <Menu size={22} color={activeView === 'categories' ? theme.primary : theme.text} />
        <ThemedText style={[
          styles.navbarLabel,
          activeView === 'categories' && {color: theme.primary}
        ]}>
          Catégories
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        // style={[styles.navbarItem, activeView === 'search'] && styles.style={[styles.navbarItem, activeView === 'search' && styles.activeNavbarItem]}
        onPress={() => {
          setActiveView('search');
          if (!showSearch) toggleSearch();
        }}
      >
        <Search size={22} color={activeView === 'search' ? theme.primary : theme.text} />
        <ThemedText style={[
          styles.navbarLabel,
          activeView === 'search' && {color: theme.primary}
        ]}>
          Recherche
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navbarItem, activeView === 'favorites' && styles.activeNavbarItem]}
        onPress={() => setActiveView('favorites')}
      >
        <Star size={22} color={activeView === 'favorites' ? theme.primary : theme.text} />
        <ThemedText style={[
          styles.navbarLabel,
          activeView === 'favorites' && {color: theme.primary}
        ]}>
          Favoris
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  // --- Render principal ---
  return (
    <ThemedView variant="background" style={styles.rootContainer}>
      {/* Header avec stats */}
      {renderHeader()}
      
      {/* Barre de recherche animée */}
      {renderSearchBar()}
      
      {/* Contenu principal scrollable */}
      <Reanimated.ScrollView 
        contentContainerStyle={styles.scrollContainer}
        scrollEventThrottle={16}
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Contenu conditionnel basé sur la vue active */}
        {activeView === 'categories' && renderCategories()}
        {activeView === 'search' && showSearch && renderSearchResults()}
        {activeView === 'favorites' && renderQuickAccess()}
        
        {/* Bouton Déconnexion */}
        <TouchableOpacity 
          style={[
            styles.logoutButton, 
            { borderTopColor: theme.border }
          ]}
        >
          <LogOut size={18} color={theme.danger} style={{ marginRight: 12 }} />
          <ThemedText style={[styles.logoutText, { color: theme.danger }]}>Déconnexion</ThemedText>
        </TouchableOpacity>
        
        {/* Espace pour éviter que le navbar ne cache pas le contenu */}
        <View style={styles.bottomSpacer} />
      </Reanimated.ScrollView>
      
      {/* Navbar en bas */}
      {renderNavbar()}
      
      {/* Bouton flottant - Action rapide */}
      <TouchableOpacity style={[styles.floatingActionButton, {backgroundColor: theme.primary}]}>
        <SettingsIcon size={24} color="#fff" />
      </TouchableOpacity>
    </ThemedView>
  );
};

// Styles innovants
const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollContainer: {
    paddingTop: 180, // Espace pour le header
    paddingHorizontal: 16,
    paddingBottom: 100, // Espace pour le navbar
  },
  
  // --- Header Styles ---
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: 16,
    paddingTop: 40, // Pour le status bar
  },
  headerCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  quickStatLabel: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
  },
  
  // --- Search Bar Styles ---
  searchBarContainer: {
    paddingHorizontal: 16,
    position: 'absolute',
    top: 140, // Juste en dessous du header
    left: 0,
    right: 0,
    zIndex: 5,
    overflow: 'hidden', // Pour que l'animation soit propre
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
  },
  clearButton: {
    padding: 6,
  },
  
  // --- Categories Styles ---
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  expandedCategoryHeader: {
    backgroundColor: 'transparent',
    borderColor: '#ddd', // Subtly outlined when expanded
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  chevron: {
    transition: '0.3s'
  },
  chevronExpanded: {
    transform: [{rotate: '180deg'}]
  },
  
  // --- Section Styles ---
  sectionContainer: {
    paddingLeft: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  miniChevron: {
    opacity: 0.6,
  },
  sectionItemsContainer: {
    paddingTop: 4,
    paddingBottom: 12,
  },
  
  // --- Item Styles ---
  settingItem: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  highlightedItem: {
    backgroundColor: 'rgba(88, 101, 242, 0.05)',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontWeight: '500',
    fontSize: 15,
  },
  itemPath: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  settingDescription: {
    fontSize: 13,
    opacity: 0.7,
    paddingLeft: 16 + 36 + 12,
    paddingRight: 16,
    paddingBottom: 14,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    padding: 8,
    marginRight: 4,
  },
  switch: {
    transform: [{scaleX: 0.9}, {scaleY: 0.9}],
  },
  
  // --- Navigation Item ---
  navigationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.05)',
  },
  
  // --- Danger Action ---
  dangerActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 12,
    backgroundColor: 'rgba(237, 66, 69, 0.05)',
  },
  
  // --- Theme Selector ---
  themeSelectorContainer: {
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  themeSelectorOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  themeOptionButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 100,
  },
  themeOptionActive: {
    backgroundColor: 'rgba(88, 101, 242, 0.1)',
  },
  themeOptionLabel: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
  },
  
  // --- Selector Item ---
  selectorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.05)',
  },
  selectorValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorValue: {
    marginRight: 8,
    fontWeight: '500',
    opacity: 0.7,
  },
  
  // --- Slider ---
  sliderContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    borderRadius: 3,
    marginTop: 20,
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    top: -8,
    marginLeft: -11,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sliderValue: {
    fontWeight: '600',
    fontSize: 14,
  },
  
  // --- Quick Access & Search Results ---
  quickAccessContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  searchResultsContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  emptyStateContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: 15,
  },
  
  // --- Bottom Elements ---
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    marginTop: 30,
    borderTopWidth: 1,
    marginHorizontal: -16,
  },
  logoutText: {
    fontWeight: '500',
    fontSize: 15,
  },
  bottomSpacer: {
    height: 70, // Hauteur du navbar
  },
  
  // --- Navbar ---
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    paddingBottom: 8, // Pour le safe area
  },
  navbarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeNavbarItem: {
    backgroundColor: 'rgba(88, 101, 242, 0.1)',
  },
  navbarLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  
  // --- Floating Action Button ---
  floatingActionButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});

// Import manquant au début
import { TextInput } from 'react-native';
import { Star } from 'lucide-react-native';

export default SettingsPanel;