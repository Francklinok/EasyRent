import React, { useState, useEffect, useRef } from 'react';
import { 
  ScrollView, 
  TouchableOpacity, 
  Text, 
  Switch, 
  Animated, 
  View, 
  Alert,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { 
  useTheme, 
  useThemeControls, 
  useCustomThemes, 
  useThemeConfig, 
  useThemeTransition,
  useThemeInfo,
  useThemedStyles 
} from '@/components/contexts/theme/themehook';
import { 
  ChevronRight, 
  Check, 
  Plus, 
  Trash2, 
  Sun, 
  Moon, 
  Monitor, 
  PaintBucket, 
  Settings, 
  RefreshCw,
  Palette,
  Eye,
  Download,
  Upload,
  Copy,
  Star,
  Edit3
} from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemeColors } from '@/components/contexts/theme/themeTypes';

// Configuration des animations pour Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type SectionKey = 'appearance' | 'themes' | 'settings' | 'customThemes' | 'preview' | 'export';
type ThemeName = string;

interface ColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
  title: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onColorChange, title }) => {
  const { theme } = useTheme();
  const predefinedColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];

  return (
    <ThemedView style={{ marginBottom: 16 }}>
      <ThemedText style={{ 
        color: theme.text, 
        fontWeight: 'bold', 
        marginBottom: 8,
        fontSize: 14
      }}>
        {title}
      </ThemedText>
      <ThemedView style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
      }}>
        {predefinedColors.map((presetColor) => (
          <TouchableOpacity
            key={presetColor}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: presetColor,
              borderWidth: color === presetColor ? 3 : 1,
              borderColor: color === presetColor ? theme.primary : theme.outline
            }}
            onPress={() => onColorChange(presetColor)}
          />
        ))}
      </ThemedView>
    </ThemedView>
  );
};

const ThemeSwitcher = () => {
  const { theme } = useTheme();

  const { 
    toggleTheme, 
    setTheme, 
    currentTheme, 
    setLightTheme, 
    setDarkTheme, 
    setSystemTheme 
  } = useThemeControls();
  
  const { 
    customThemes, 
    addCustomTheme, 
    removeCustomTheme, 
    updateCustomTheme,
    allThemes, 
    hasCustomThemes 
  } = useCustomThemes();
  const { 
    themeConfig, 
    setThemeConfig, 
    enableSystemTheme, 
    disableSystemTheme, 
    toggleSystemTheme 
  } = useThemeConfig();
  const { isAnimatingTheme, animationDuration } = useThemeTransition();
  const { isDark, isSystemTheme, themeDisplayName } = useThemeInfo();
  const themedStyles = useThemedStyles();
  
  const [isExpanded, setIsExpanded] = useState<Record<SectionKey, boolean>>({
    appearance: true,
    themes: false,
    settings: false,
    customThemes: false,
    preview: false,
    export: false
  });
  
  const [animatedBg] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [isCreatingTheme, setIsCreatingTheme] = useState(false);
  const [newThemeColors, setNewThemeColors] = useState<Partial<ThemeColors>>({
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    accent: '#45B7D1',
    background: '#2C3E50',
    text: '#FFFFFF',
    subtext: '#BDC3C7',
  });
  const [favoriteThemes, setFavoriteThemes] = useState<Set<string>>(new Set());
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Animation de transition lors du changement de thème
  useEffect(() => {
    if (isAnimatingTheme) {
      Animated.sequence([
        Animated.timing(animatedBg, {
          toValue: 1,
          duration: animationDuration / 2,
          useNativeDriver: false
        }),
        Animated.timing(animatedBg, {
          toValue: 0,
          duration: animationDuration / 2,
          useNativeDriver: false
        })
      ]).start();
      
      // Animation de pulsation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: animationDuration / 4,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: animationDuration / 4,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [isAnimatingTheme, animationDuration]);
  
  const toggleSection = (section: SectionKey) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const renderThemePreview = (themeName: ThemeName, themeColors: ThemeColors) => {
    const isActive = currentTheme === themeName;
    const isFavorite = favoriteThemes.has(themeName);
    
    return (
      <Animated.View
        key={themeName}
        style={{
          transform: [{ scale: isActive ? scaleAnim : 1 }]
        }}
      >
        <TouchableOpacity 
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              padding: 12,
              marginVertical: 4,
              borderRadius: 12,
              borderWidth: 2,
              elevation: isActive ? 4 : 1,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: isActive ? 2 : 1,
              },
              shadowOpacity: isActive ? 0.25 : 0.1,
              shadowRadius: isActive ? 3.84 : 2,
            },
            isActive ? {
              backgroundColor: theme.states.pressed,
              borderColor: theme.primary
            } : {
              backgroundColor: theme.surface,
              borderColor: theme.outline
            }
          ]}
          onPress={() => {
            console.log('Theme preview pressed:', themeName);
            setTheme(themeName);
          }}
          onLongPress={() => {
            Alert.alert(
              'Options du thème',
              `Que voulez-vous faire avec le thème "${themeName}" ?`,
              [
                { text: 'Annuler', style: 'cancel' },
                { 
                  text: isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris',
                  onPress: () => toggleFavorite(themeName)
                },
                { text: 'Dupliquer', onPress: () => duplicateTheme(themeName, themeColors) },
                ...(themeName.startsWith('custom_') ? [
                  { text: 'Supprimer', style: 'destructive' as const, onPress: () => confirmDeleteTheme(themeName) }
                ] : [])
              ]
            );
          }}
          activeOpacity={0.7}
        >
          <ThemedView 
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              marginRight: 12,
              overflow: 'hidden',
              borderWidth: 2,
              borderColor: theme.outline
            }}
          >
            <ThemedView style={{
              flex: 1,
              flexDirection: 'row'
            }}>
              <ThemedView style={{ 
                flex: 1, 
                backgroundColor: Array.isArray(themeColors.background) ? themeColors.background[0] : themeColors.background 
              }} />
              <ThemedView style={{ 
                flex: 1, 
                backgroundColor: themeColors.primary 
              }} />
            </ThemedView>
            <ThemedView style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '30%',
              backgroundColor: themeColors.secondary,
              opacity: 0.8
            }} />
          </ThemedView>
          
          <ThemedView style={{ flex: 1 }}>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ThemedText style={{ 
                fontWeight: isActive ? 'bold' : '600',
                color: theme.text,
                fontSize: 16
              }}>
                {themeName.charAt(0).toUpperCase() + themeName.slice(1).replace('_', ' ')}
              </ThemedText>
              {isFavorite && (
                <Star 
                  size={16} 
                  color={theme.warning} 
                  fill={theme.warning} 
                  style={{ marginLeft: 8 }} 
                />
              )}
            </ThemedView>
            {isActive && (
              <ThemedText style={{ 
                color: theme.primary, 
                fontSize: 12,
                marginTop: 2,
                fontWeight: '500'
              }}>
                Thème actuel
              </ThemedText>
            )}
            <ThemedText style={{ 
              color: theme.subtext, 
              fontSize: 10,
              marginTop: 1
            }}>
              {isDark ? 'Mode sombre' : 'Mode clair'}
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={{ alignItems: 'center' }}>
            {isActive && <Check size={24} color={theme.primary} />}
            {themeName.startsWith('custom_') && (
              <TouchableOpacity
                style={{
                  marginTop: 4,
                  padding: 4,
                  borderRadius: 4,
                  backgroundColor: theme.surfaceVariant
                }}
                onPress={() => editCustomTheme(themeName)}
              >
                <Edit3 size={14} color={theme.text} />
              </TouchableOpacity>
            )}
          </ThemedView>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  const toggleFavorite = (themeName: string) => {
    setFavoriteThemes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(themeName)) {
        newSet.delete(themeName);
      } else {
        newSet.add(themeName);
      }
      return newSet;
    });
  };
  
  const duplicateTheme = (themeName: string, themeColors: ThemeColors) => {
    const newThemeName = `${themeName}_copy_${Date.now()}`;
    addCustomTheme(newThemeName, themeColors);
    Alert.alert('Succès', `Thème "${newThemeName}" créé avec succès!`);
  };
  
  const confirmDeleteTheme = (themeName: string) => {
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer le thème "${themeName}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => removeCustomTheme(themeName)
        }
      ]
    );
  };
  
  const editCustomTheme = (themeName: string) => {
    // Ouvre l'éditeur de thème personnalisé
    setIsCreatingTheme(true);
    const existingTheme = customThemes[themeName];
    if (existingTheme) {
      setNewThemeColors(existingTheme);
    }
  };
  
  const createSampleCustomTheme = () => {
    const newThemeName = `custom_${Date.now()}`;
    const sampleColors: Partial<ThemeColors> = {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      accent: '#45B7D1',
      background: '#2C3E50',
      text: '#FFFFFF',
      subtext: '#BDC3C7',
    };
    
    addCustomTheme(newThemeName, sampleColors);
    Alert.alert('Succès', `Thème "${newThemeName}" créé avec succès!`);
  };
  
  const saveCustomTheme = () => {
    const themeName = `custom_theme_${Date.now()}`;
    addCustomTheme(themeName, newThemeColors);
    setIsCreatingTheme(false);
    setNewThemeColors({
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      accent: '#45B7D1',
      background: '#2C3E50',
      text: '#FFFFFF',
      subtext: '#BDC3C7',
    });
    Alert.alert('Succès', `Thème "${themeName}" créé avec succès!`);
  };
  
  const exportThemeSettings = () => {
    const settings = {
      currentTheme,
      themeConfig,
      customThemes,
      favoriteThemes: Array.from(favoriteThemes)
    };
    
    // Ici vous pouvez ajouter la logique d'export
    console.log('Exporting theme settings:', settings);
    Alert.alert('Export', 'Paramètres du thème exportés avec succès!');
  };
  
  const importThemeSettings = () => {
    // A ajouter la logique d'import
    Alert.alert('Import', 'Fonctionnalité d\'import à implémenter');
  };
  
  const renderQuickActions = () => (
    <ThemedView style={{
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 16,
      backgroundColor: theme.surface,
      borderRadius: 12,
      marginBottom: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    }}>
      <TouchableOpacity
        style={{
          alignItems: 'center',
          padding: 8,
          borderRadius: 8,
          backgroundColor: theme.surfaceVariant
        }}
        onPress={toggleTheme}
      >
        <RefreshCw size={20} color={theme.primary} />
        <ThemedText style={{ 
          color: theme.text, 
          fontSize: 12, 
          marginTop: 4,
          fontWeight: '500'
        }}>
          Basculer
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={{
          alignItems: 'center',
          padding: 8,
          borderRadius: 8,
          backgroundColor: theme.surfaceVariant
        }}
        onPress={() => setIsCreatingTheme(true)}
      >
        <Plus size={20} color={theme.secondary} />
        <ThemedText style={{ 
          color: theme.text, 
          fontSize: 12, 
          marginTop: 4,
          fontWeight: '500'
        }}>
          Créer
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={{
          alignItems: 'center',
          padding: 8,
          borderRadius: 8,
          backgroundColor: theme.surfaceVariant
        }}
        onPress={exportThemeSettings}
      >
        <Download size={20} color={theme.accent} />
        <ThemedText style={{ 
          color: theme.text, 
          fontSize: 12, 
          marginTop: 4,
          fontWeight: '500'
        }}>
          Exporter
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={{
          alignItems: 'center',
          padding: 8,
          borderRadius: 8,
          backgroundColor: theme.surfaceVariant
        }}
        onPress={importThemeSettings}
      >
        <Upload size={20} color={theme.info} />
        <ThemedText style={{ 
          color: theme.text, 
          fontSize: 12, 
          marginTop: 4,
          fontWeight: '500'
        }}>
          Importer
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
  
  return (
    <ScrollView 
      ref={scrollViewRef}
      style={[themedStyles.container]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Animation d'arrière-plan */}
      <Animated.View 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.primary,
          opacity: animatedBg.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.1]
          })
        }}
      />
      
      <ThemedView style={{ padding: 16 }}>
        <ThemedText style={{ 
          fontSize: 28, 
          fontWeight: 'bold',  
          marginBottom: 8,
          color: theme.text
        }}>
          Paramètres d'apparence
        </ThemedText>
        
        <ThemedText style={{ 
          fontSize: 16, 
          color: theme.subtext,
          marginBottom: 24
        }}>
          Thème actuel: {themeDisplayName} {isDark ? '(Sombre)' : '(Clair)'}
        </ThemedText>
        
        {/* Actions rapides */}
        {renderQuickActions()}
        
        {/* Section Apparence */}
        <TouchableOpacity 
          style={[
            themedStyles.surface,
            {
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: theme.outline,
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }
          ]}
          onPress={() => toggleSection('appearance')}
          activeOpacity={0.7}
        >
          <PaintBucket size={24} color={theme.primary} style={{ marginRight: 12 }} />
          <ThemedText style={{ 
            flex: 1, 
            fontWeight: 'bold',
            color: theme.text,
            fontSize: 16
          }}>
            Apparence
          </ThemedText>
          <Animated.View style={{
            transform: [{ 
              rotate: isExpanded.appearance ? '90deg' : '0deg' 
            }]
          }}>
            <ChevronRight size={20} color={theme.text} />
          </Animated.View>
        </TouchableOpacity>
        
        {isExpanded.appearance && (
          <ThemedView style={[
            themedStyles.surface,
            {
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: theme.outline
            }
          ]}>
            <ThemedView style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              marginBottom: 24,
              gap: 8
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: 'center',
                  padding: 16,
                  backgroundColor: !isDark && !isSystemTheme ? theme.primary : theme.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: !isDark && !isSystemTheme ? theme.primary : theme.outline,
                  elevation: !isDark && !isSystemTheme ? 3 : 1,
                }}
                onPress={() => setLightTheme()}
              >
                <Sun size={24} color={!isDark && !isSystemTheme ? theme.onSurface : theme.text} />
                <ThemedText style={{ 
                  color: !isDark && !isSystemTheme ? theme.onSurface : theme.text,
                  marginTop: 8,
                  fontWeight: !isDark && !isSystemTheme ? 'bold' : '500'
                }}>
                  Clair
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: 'center',
                  padding: 16,
                  backgroundColor: isDark && !isSystemTheme ? theme.primary : theme.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark && !isSystemTheme ? theme.primary : theme.outline,
                  elevation: isDark && !isSystemTheme ? 3 : 1,
                }}
                onPress={() => setDarkTheme()}
              >
                <Moon size={24} color={isDark && !isSystemTheme ? theme.onSurface : theme.text} />
                <ThemedText style={{ 
                  color: isDark && !isSystemTheme ? theme.onSurface : theme.text,
                  marginTop: 8,
                  fontWeight: isDark && !isSystemTheme ? 'bold' : '500'
                }}>
                  Sombre
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: 'center',
                  padding: 16,
                  backgroundColor: isSystemTheme ? theme.primary : theme.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isSystemTheme ? theme.primary : theme.outline,
                  elevation: isSystemTheme ? 3 : 1,
                }}
                onPress={() => setSystemTheme()}
              >
                <Monitor size={24} color={isSystemTheme ? theme.onSurface : theme.text} />
                <ThemedText style={{ 
                  color: isSystemTheme ? theme.onSurface : theme.text,
                  marginTop: 8,
                  fontWeight: isSystemTheme ? 'bold' : '500'
                }}>
                  Système
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
            
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: theme.outline
              }}
              onPress={toggleTheme}
            >
              <RefreshCw size={20} color={theme.primary} style={{ marginRight: 12 }} />
              <ThemedText style={{ 
                color: theme.text, 
                flex: 1,
                fontSize: 16,
                fontWeight: '500'
              }}>
                Basculer le thème
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
        
        {/* Section Thèmes */}
        <TouchableOpacity 
          style={[
            themedStyles.surface,
            {
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: theme.outline,
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }
          ]}
          onPress={() => toggleSection('themes')}
          activeOpacity={0.7}
        >
          <Palette size={24} color={theme.secondary} style={{ marginRight: 12 }} />
          <ThemedText style={{ 
            flex: 1, 
            fontWeight: 'bold',
            color: theme.text,
            fontSize: 16
          }}>
            Thèmes disponibles
          </ThemedText>
          <Animated.View style={{
            transform: [{ 
              rotate: isExpanded.themes ? '90deg' : '0deg' 
            }]
          }}>
            <ChevronRight size={20} color={theme.text} />
          </Animated.View>
        </TouchableOpacity>
        
        {isExpanded.themes && (
          <ThemedView style={[
            themedStyles.surface,
            {
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: theme.outline
            }
          ]}>
            {Object.entries(allThemes).map(([name, colors]) => 
              renderThemePreview(name, colors)
            )}
          </ThemedView>
        )}
        
        {/* Section Thèmes Personnalisés */}
        <TouchableOpacity 
          style={[
            themedStyles.surface,
            {
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: theme.outline,
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }
          ]}
          onPress={() => toggleSection('customThemes')}
          activeOpacity={0.7}
        >
          <PaintBucket size={24} color={theme.accent} style={{ marginRight: 12 }} />
          <ThemedText style={{ 
            flex: 1, 
            fontWeight: 'bold',
            color: theme.text,
            fontSize: 16
          }}>
            Thèmes personnalisés
          </ThemedText>
          {hasCustomThemes && (
            <ThemedView style={{
              backgroundColor: theme.primary,
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginRight: 8
            }}>
              <ThemedText style={{ 
                color: theme.onSurface, 
                fontSize: 12,
                fontWeight: 'bold'
              }}>
                {Object.keys(customThemes).length}
              </ThemedText>
            </ThemedView>
          )}
          <Animated.View style={{
            transform: [{ 
              rotate: isExpanded.customThemes ? '90deg' : '0deg' 
            }]
          }}>
            <ChevronRight size={20} color={theme.text} />
          </Animated.View>
        </TouchableOpacity>
        
        {isExpanded.customThemes && (
          <ThemedView style={[
            themedStyles.surface,
            {
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: theme.outline
            }
          ]}>
            {Object.entries(customThemes).length > 0 ? (
              Object.entries(customThemes).map(([name, colors]) => 
                renderThemePreview(name, colors)
              )
            ) : (
              <ThemedView style={{ 
                alignItems: 'center', 
                padding: 32 
              }}>
                <PaintBucket size={48} color={theme.subtext} style={{ marginBottom: 16 }} />
                <ThemedText style={{ 
                  color: theme.subtext,
                  textAlign: 'center',
                  fontSize: 16,
                  marginBottom: 8
                }}>
                  Aucun thème personnalisé
                </ThemedText>
                <ThemedText style={{ 
                  color: theme.subtext,
                  textAlign: 'center',
                  fontSize: 14
                }}>
                  Créez votre premier thème personnalisé
                </ThemedText>
              </ThemedView>
            )}
            
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
                backgroundColor: theme.primary,
                borderRadius: 12,
                marginTop: 16,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
              }}
              onPress={createSampleCustomTheme}
            >
              <Plus size={20} color={theme.onSurface} style={{ marginRight: 8 }} />
              <ThemedText style={{ 
                color: theme.onSurface, 
                fontWeight: 'bold',
                fontSize: 16
              }}>
                Créer un thème personnalisé
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
        
        {/* Section Paramètres avancés */}
        <TouchableOpacity 
          style={[
            themedStyles.surface,
            {
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: theme.outline,
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }
          ]}
          onPress={() => toggleSection('settings')}
          activeOpacity={0.7}
        >
          <Settings size={24} color={theme.info} style={{ marginRight: 12 }} />
          <ThemedText style={{ 
            flex: 1, 
            fontWeight: 'bold',
            color: theme.text,
            fontSize: 16
          }}>
            Paramètres avancés
          </ThemedText>
          <Animated.View style={{
            transform: [{ 
              rotate: isExpanded.settings ? '90deg' : '0deg' 
            }]
          }}>
            <ChevronRight size={20} color={theme.text} />
          </Animated.View>
        </TouchableOpacity>
        
        {isExpanded.settings && (
          <ThemedView style={[
            themedStyles.surface,
            {
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: theme.outline
            }
          ]}>
            <ThemedView style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              paddingVertical: 8
            }}>
              <ThemedText style={{ 
                color: theme.text,
                fontSize: 16,
                fontWeight: '500'
              }}>
                Thème système automatique
              </ThemedText>
              <Switch
                value={themeConfig.systemTheme}
                onValueChange={toggleSystemTheme}
                trackColor={{ false: theme.outline, true: theme.primary }}
                thumbColor={themeConfig.systemTheme ? theme.onSurface : theme.text}
                ios_backgroundColor={theme.outline}
              />
            </ThemedView>
            
            <ThemedView style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              paddingVertical: 8
            }}>
              <ThemedText style={{ 
                color: theme.text,
                fontSize: 16,
                fontWeight: '500'
              }}>
                Animations de transition
              </ThemedText>
              <Switch
                value={themeConfig.animations}
                onValueChange={(value) => setThemeConfig({ ...themeConfig, animations: value })}
                trackColor={{ false: theme.outline, true: theme.primary }}
                thumbColor={themeConfig.animations ? theme.onSurface : theme.text}
                ios_backgroundColor={theme.outline}
              />
            </ThemedView>
            
            <ThemedView style={{ marginBottom: 16 }}>
              <ThemedText style={{ 
                color: theme.text,
                fontSize: 16,
                fontWeight: '500',
                marginBottom: 8
              }}>
                Durée des animations: {Math.round(animationDuration)}ms
              </ThemedText>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={100}
                maximumValue={1000}
                value={animationDuration}
                onValueChange={(value) => setThemeConfig({ ...themeConfig, animationDuration: value })}
                minimumTrackTintColor={theme.primary}
                maximumTrackTintColor={theme.outline}
                thumbStyle={{ backgroundColor: theme.primary }}
                trackStyle={{ backgroundColor: theme.outline }}
                disabled={!themeConfig.animations}
              />
            </ThemedView>
            
            <ThemedView style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              paddingVertical: 8
            }}>
              <ThemedText style={{ 
                color: theme.text,
                fontSize: 16,
                fontWeight: '500'
              }}>
                Thème haute performance
              </ThemedText>
              <Switch
                value={themeConfig.highPerformance}
                onValueChange={(value) => setThemeConfig({ ...themeConfig, highPerformance: value })}
                trackColor={{ false: theme.outline, true: theme.primary }}
                thumbColor={themeConfig.highPerformance ? theme.onSurface : theme.text}
                ios_backgroundColor={theme.outline}
              />
            </ThemedView>
            
            <ThemedText style={{ 
              color: theme.subtext,
              fontSize: 12,
              fontStyle: 'italic',
              textAlign: 'center',
              marginTop: 8
            }}>
              Le mode haute performance désactive certaines animations pour améliorer les performances
            </ThemedText>
          </ThemedView>
        )}
        
        {/* Section Aperçu */}
        <TouchableOpacity 
          style={[
            themedStyles.surface,
            {
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: theme.outline,
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }
          ]}
          onPress={() => toggleSection('preview')}
          activeOpacity={0.7}
        >
          <Eye size={24} color={theme.success} style={{ marginRight: 12 }} />
          <ThemedText style={{ 
            flex: 1, 
            fontWeight: 'bold',
            color: theme.text,
            fontSize: 16
          }}>
            Aperçu du thème
          </ThemedText>
          <Animated.View style={{
            transform: [{ 
              rotate: isExpanded.preview ? '90deg' : '0deg' 
            }]
          }}>
            <ChevronRight size={20} color={theme.text} />
          </Animated.View>
        </TouchableOpacity>
        
        {isExpanded.preview && (
          <ThemedView style={[
            themedStyles.surface,
            {
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: theme.outline
            }
          ]}>
            <ThemedView style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: 16
            }}>
              {[
                { key: 'primary', label: 'Primaire', color: theme.primary },
                { key: 'secondary', label: 'Secondaire', color: theme.secondary },
                { key: 'accent', label: 'Accent', color: theme.accent },
                { key: 'background', label: 'Arrière-plan', color: theme.background },
                { key: 'surface', label: 'Surface', color: theme.surface },
                { key: 'text', label: 'Texte', color: theme.text },
                { key: 'subtext', label: 'Sous-texte', color: theme.subtext },
                { key: 'success', label: 'Succès', color: theme.success },
                { key: 'warning', label: 'Avertissement', color: theme.warning },
                { key: 'error', label: 'Erreur', color: theme.error },
                { key: 'info', label: 'Information', color: theme.info }
              ].map(({ key, label, color }) => (
                <ThemedView key={key} style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.surfaceVariant,
                  borderRadius: 8,
                  padding: 8,
                  minWidth: '45%'
                }}>
                  <ThemedView style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: color,
                    marginRight: 8,
                    borderWidth: 1,
                    borderColor: theme.outline
                  }} />
                  <ThemedText style={{
                    color: theme.text,
                    fontSize: 12,
                    fontWeight: '500'
                  }}>
                    {label}
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
            
            <ThemedView style={{
              backgroundColor: theme.surfaceVariant,
              borderRadius: 12,
              padding: 16,
              marginTop: 16
            }}>
              <ThemedText style={{
                color: theme.text,
                fontSize: 16,
                fontWeight: 'bold',
                marginBottom: 8
              }}>
                Exemple d'interface
              </ThemedText>
              <ThemedText style={{
                color: theme.subtext,
                fontSize: 14,
                marginBottom: 12
              }}>
                Voici un aperçu de l'interface avec le thème actuel
              </ThemedText>
              <ThemedView style={{
                flexDirection: 'row',
                gap: 8,
                marginBottom: 12
              }}>
                <TouchableOpacity style={{
                  backgroundColor: theme.primary,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  flex: 1
                }}>
                  <ThemedText style={{
                    color: theme.onSurface,
                    textAlign: 'center',
                    fontWeight: '500'
                  }}>
                    Bouton principal
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={{
                  backgroundColor: theme.secondary,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  flex: 1
                }}>
                  <ThemedText style={{
                    color: theme.text,
                    textAlign: 'center',
                    fontWeight: '500'
                  }}>
                    Bouton secondaire
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
              <ThemedView style={{
                backgroundColor: theme.surface,
                borderRadius: 8,
                padding: 12,
                borderWidth: 1,
                borderColor: theme.outline
              }}>
                <ThemedText style={{
                  color: theme.text,
                  fontSize: 14,
                  fontWeight: '500'
                }}>
                  Carte d'exemple
                </ThemedText>
                <ThemedText style={{
                  color: theme.subtext,
                  fontSize: 12,
                  marginTop: 4
                }}>
                  Contenu de la carte avec le thème appliqué
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}
        
        {/* Section Export/Import */}
        <TouchableOpacity 
          style={[
            themedStyles.surface,
            {
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: theme.outline,
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }
          ]}
          onPress={() => toggleSection('export')}
          activeOpacity={0.7}
        >
          <Download size={24} color={theme.warning} style={{ marginRight: 12 }} />
          <ThemedText style={{ 
            flex: 1, 
            fontWeight: 'bold',
            color: theme.text,
            fontSize: 16
          }}>
            Export/Import
          </ThemedText>
          <Animated.View style={{
            transform: [{ 
              rotate: isExpanded.export ? '90deg' : '0deg' 
            }]
          }}>
            <ChevronRight size={20} color={theme.text} />
          </Animated.View>
        </TouchableOpacity>
        
        {isExpanded.export && (
          <ThemedView style={[
            themedStyles.surface,
            {
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: theme.outline
            }
          ]}>
            <ThemedView style={{
              flexDirection: 'row',
              gap: 12,
              marginBottom: 16
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.success,
                  padding: 12,
                  borderRadius: 8,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                }}
                onPress={exportThemeSettings}
              >
                <Download size={18} color={theme.onSurface} style={{ marginRight: 8 }} />
                <ThemedText style={{
                  color: theme.onSurface,
                  fontWeight: '500'
                }}>
                  Exporter
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.info,
                  padding: 12,
                  borderRadius: 8,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                }}
                onPress={importThemeSettings}
              >
                <Upload size={18} color={theme.onSurface} style={{ marginRight: 8 }} />
                <ThemedText style={{
                  color: theme.onSurface,
                  fontWeight: '500'
                }}>
                  Importer
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
            
            <ThemedText style={{
              color: theme.subtext,
              fontSize: 12,
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              Sauvegardez et restaurez vos paramètres de thème
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
      
      {/* Modal de création de thème personnalisé */}
      {isCreatingTheme && (
        <ThemedView style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
          zIndex: 1000
        }}>
          <Animated.View style={{
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            maxHeight: '80%',
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            transform: [{ scale: fadeAnim }]
          }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <ThemedText style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: theme.text,
                marginBottom: 16,
                textAlign: 'center'
              }}>
                Créer un thème personnalisé
              </ThemedText>
              
              <ColorPicker
                title="Couleur primaire"
                color={newThemeColors.primary || '#FF6B6B'}
                onColorChange={(color) => setNewThemeColors({ ...newThemeColors, primary: color })}
              />
              
              <ColorPicker
                title="Couleur secondaire"
                color={newThemeColors.secondary || '#4ECDC4'}
                onColorChange={(color) => setNewThemeColors({ ...newThemeColors, secondary: color })}
              />
              
              <ColorPicker
                title="Couleur d'accent"
                color={newThemeColors.accent || '#45B7D1'}
                onColorChange={(color) => setNewThemeColors({ ...newThemeColors, accent: color })}
              />
              
              <ColorPicker
                title="Arrière-plan"
                color={newThemeColors.background || '#2C3E50'}
                onColorChange={(color) => setNewThemeColors({ ...newThemeColors, background: color })}
              />
              
              <ColorPicker
                title="Couleur du texte"
                color={newThemeColors.text || '#FFFFFF'}
                onColorChange={(color) => setNewThemeColors({ ...newThemeColors, text: color })}
              />
              
              <ColorPicker
                title="Couleur du sous-texte"
                color={newThemeColors.subtext || '#BDC3C7'}
                onColorChange={(color) => setNewThemeColors({ ...newThemeColors, subtext: color })}
              />
              
              <ThemedView style={{
                flexDirection: 'row',
                gap: 12,
                marginTop: 24
              }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: theme.outline,
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center'
                  }}
                  onPress={() => setIsCreatingTheme(false)}
                >
                  <ThemedText style={{
                    color: theme.text,
                    fontWeight: '500'
                  }}>
                    Annuler
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: theme.primary,
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                  }}
                  onPress={saveCustomTheme}
                >
                  <ThemedText style={{
                    color: theme.onSurface,
                    fontWeight: 'bold'
                  }}>
                    Sauvegarder
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ScrollView>
          </Animated.View>
        </ThemedView>
      )}
    </ScrollView>
  );
};

export default ThemeSwitcher;

