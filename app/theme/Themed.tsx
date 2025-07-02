import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Text, Switch, Animated } from 'react-native';
import { useTheme, useThemeControls, useCustomThemes, useThemeConfig, useThemeTransition } from '@/components/contexts/theme/themehook';
import { ChevronRight, Check, Plus, Trash2, Sun, Moon, Monitor, PaintBucket, Settings, RefreshCw } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import {ThemeColors} from'@/components/contexts/theme/themeTypes'

type SectionKey = 'appearance' | 'themes' | 'settings' | 'customThemes';
type ThemeName = string;

const ThemeSwitcher = () => {
  const { themes, currentTheme, theme } = useTheme();
  const { toggleTheme, setTheme } = useThemeControls();
  const { customThemes, addCustomTheme, removeCustomTheme, updateCustomTheme, allThemes } = useCustomThemes();
  const { themeConfig, setThemeConfig, enableSystemTheme, disableSystemTheme } = useThemeConfig();
  const { getTransitionStyle } = useThemeTransition();
  
  const [isExpanded, setIsExpanded] = useState<Record<SectionKey, boolean>>({
    appearance: true,
    themes: false,
    settings: false,
    customThemes: false
  });
  
  const [animatedBg] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.timing(animatedBg, {
      toValue: 1,
      duration: themeConfig.animationDuration,
      useNativeDriver: false
    }).start(() => {
      animatedBg.setValue(0);
    });
  }, [currentTheme]);
  
  const backgroundStyle = {
    backgroundColor: theme.surface,
    ...getTransitionStyle()
  };
  
  const textStyle = {
    color: theme.text,
    ...getTransitionStyle()
  };
  
  const toggleSection = (section:SectionKey) => {
    setIsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const renderThemePreview = (themeName:ThemeName, themeColors:ThemeColors) => {
    const isActive = currentTheme === themeName;
    
    return (
      <TouchableOpacity 
        key={themeName}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          marginVertical: 4,
          borderRadius: 8,
          backgroundColor: isActive ? theme.states.hover : 'transparent',
          borderWidth: 1,
          borderColor: isActive ? theme.primary : theme.outline
        }}
        onPress={() => setTheme(themeName)}
      >
        <ThemedView 
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            marginRight: 12,
            overflow: 'hidden'
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
            <ThemedView style={{ flex: 1, backgroundColor: themeColors.primary }} />
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{ ...textStyle, fontWeight: isActive ? 'bold' : 'normal' }}>
            {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
          </ThemedText>
          {isActive && (
            <ThemedText style={{ color: theme.primary, fontSize: 12 }}>
              Thème actif
            </ThemedText>
          )}
        </ThemedView>
        
        {isActive && <Check size={20} color={theme.primary} />}
      </TouchableOpacity>
    );
  };
  
  return (
    <ScrollView className="h-full" style={{ backgroundColor: theme.background[0], ...getTransitionStyle() }}>
      <Animated.View 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.primary,
          opacity: animatedBg.interpolate({
            inputRange: [0, 0.1, 1],
            outputRange: [0, 0.1, 0]
          })
        }}
      />
      
      <ThemedView style={{ padding: 16 }}>
        <ThemedText style={{ ...textStyle, fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
          Paramètres d'apparence
        </ThemedText>
        
        {/* Section Apparence */}
        <TouchableOpacity 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            backgroundColor: theme.surface,
            borderRadius: 8,
            marginBottom: 8
          }}
          onPress={() => toggleSection('appearance')}
        >
          <PaintBucket size={24} color={theme.primary} style={{ marginRight: 12 }} />
          <ThemedText style={{ ...textStyle, flex: 1, fontWeight: 'bold' }}>Apparence</ThemedText>
          <ChevronRight 
            size={20} 
            color={theme.text} 
            style={{ 
              transform: [{ rotate: isExpanded.appearance ? '90deg' : '0deg' }],
              ...getTransitionStyle()
            }} 
          />
        </TouchableOpacity>
        
        {isExpanded.appearance && (
          <ThemedView style={{ 
            backgroundColor: theme.surfaceVariant,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16
          }}>
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: 'center',
                  padding: 12,
                  backgroundColor: currentTheme === 'light' ? theme.primary : theme.surface,
                  borderRadius: 8,
                  marginRight: 8
                }}
                onPress={() => setTheme('light')}
              >
                <Sun size={24} color={currentTheme === 'light' ? theme.onSurface : theme.text} />
                <ThemedText style={{ 
                  color: currentTheme === 'light' ? theme.onSurface : theme.text,
                  marginTop: 8,
                  fontWeight: currentTheme === 'light' ? 'bold' : 'normal'
                }}>
                  Clair
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: 'center',
                  padding: 12,
                  backgroundColor: currentTheme === 'dark' ? theme.primary : theme.surface,
                  borderRadius: 8,
                  marginHorizontal: 4
                }}
                onPress={() => setTheme('dark')}
              >
                <Moon size={24} color={currentTheme === 'dark' ? theme.onSurface : theme.text} />
                <ThemedText style={{ 
                  color: currentTheme === 'dark' ? theme.onSurface : theme.text,
                  marginTop: 8,
                  fontWeight: currentTheme === 'dark' ? 'bold' : 'normal'
                }}>
                  Sombre
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: 'center',
                  padding: 12,
                  backgroundColor: themeConfig.useSystemTheme ? theme.primary : theme.surface,
                  borderRadius: 8,
                  marginLeft: 8
                }}
                onPress={() => {
                  if (themeConfig.useSystemTheme) {
                    disableSystemTheme();
                  } else {
                    enableSystemTheme();
                  }
                }}
              >
                <Monitor size={24} color={themeConfig.useSystemTheme ? theme.onSurface : theme.text} />
                <ThemedText style={{ 
                  color: themeConfig.useSystemTheme ? theme.onSurface : theme.text,
                  marginTop: 8,
                  fontWeight: themeConfig.useSystemTheme ? 'bold' : 'normal'
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
                borderRadius: 8,
                padding: 12
              }}
              onPress={toggleTheme}
            >
              <RefreshCw size={20} color={theme.primary} style={{ marginRight: 12 }} />
              <ThemedText style={{ ...textStyle, flex: 1 }}>Basculer le thème</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
        
        {/* Section Thèmes */}
        <TouchableOpacity 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            backgroundColor: theme.surface,
            borderRadius: 8,
            marginBottom: 8
          }}
          onPress={() => toggleSection('themes')}
        >
          <PaintBucket size={24} color={theme.secondary} style={{ marginRight: 12 }} />
          <ThemedText style={{ ...textStyle, flex: 1, fontWeight: 'bold' }}>Thèmes disponibles</ThemedText>
          <ChevronRight 
            size={20} 
            color={theme.text} 
            style={{ 
              transform: [{ rotate: isExpanded.themes ? '90deg' : '0deg' }],
              ...getTransitionStyle()
            }} 
          />
        </TouchableOpacity>
        
        {isExpanded.themes && (
          <ThemedView style={{ 
            backgroundColor: theme.surfaceVariant,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16
          }}>
            {Object.entries(themes).map(([name, colors]) => 
              renderThemePreview(name, colors)
            )}
          </ThemedView>
        )}
        
        {/* Section Thèmes Personnalisés */}
        <TouchableOpacity 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            backgroundColor: theme.surface,
            borderRadius: 8,
            marginBottom: 8
          }}
          onPress={() => toggleSection('customThemes')}
        >
          <PaintBucket size={24} color={theme.accent} style={{ marginRight: 12 }} />
          <ThemedText style={{ ...textStyle, flex: 1, fontWeight: 'bold' }}>Thèmes personnalisés</ThemedText>
          <ChevronRight 
            size={20} 
            color={theme.text} 
            style={{ 
              transform: [{ rotate: isExpanded.customThemes ? '90deg' : '0deg' }],
              ...getTransitionStyle()
            }} 
          />
        </TouchableOpacity>
        
        {isExpanded.customThemes && (
          <ThemedView style={{ 
            backgroundColor: theme.surfaceVariant,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16
          }}>
            {Object.entries(customThemes).length > 0 ? (
              Object.entries(customThemes).map(([name, colors]) => (
                <ThemedView key={name} style={{ marginBottom: 8 }}>
                  {renderThemePreview(name, colors)}
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 8,
                      backgroundColor: theme.error,
                      borderRadius: 4,
                      marginTop: 4
                    }}
                    onPress={() => removeCustomTheme(name)}
                  >
                    <Trash2 size={16} color="#fff" style={{ marginRight: 8 }} />
                    <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Supprimer</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              ))
            ) : (
              <ThemedText style={{ ...textStyle, textAlign: 'center', padding: 16 }}>
                Vous n'avez pas encore de thèmes personnalisés
              </ThemedText>
            )}
            
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 12,
                backgroundColor: theme.primary,
                borderRadius: 8,
                marginTop: 8
              }}
              onPress={() => {
                // Exemple d'ajout d'un thème personnalisé
                const newThemeName = `custom${Object.keys(customThemes).length + 1}`;
                addCustomTheme(newThemeName, {
                  ...theme, // Copie le thème actuel comme base
                  primary: '#FF5500',
                  accent: '#FF9900',
                  background: ['#333333', '#444444']
                });
              }}
            >
              <Plus size={20} color="#fff" style={{ marginRight: 8 }} />
              <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Ajouter un thème</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
        
        {/* Section Configuration */}
        <TouchableOpacity 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            backgroundColor: theme.surface,
            borderRadius: 8,
            marginBottom: 8
          }}
          onPress={() => toggleSection('settings')}
        >
          <Settings size={24} color={theme.info} style={{ marginRight: 12 }} />
          <ThemedText style={{ ...textStyle, flex: 1, fontWeight: 'bold' }}>Configuration du thème</ThemedText>
          <ChevronRight 
            size={20} 
            color={theme.text} 
            style={{ 
              transform: [{ rotate: isExpanded.settings ? '90deg' : '0deg' }],
              ...getTransitionStyle()
            }} 
          />
        </TouchableOpacity>
        
        {isExpanded.settings && (
          <ThemedView style={{ 
            backgroundColor: theme.surfaceVariant,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16
          }}>
            <ThemedView style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16
            }}>
              <ThemedText style={textStyle}>Utiliser le thème système</ThemedText>
              <Switch
                value={themeConfig.useSystemTheme}
                onValueChange={(value) => 
                  value ? enableSystemTheme() : disableSystemTheme()
                }
                trackColor={{ false: theme.outline, true: theme.primary }}
                thumbColor={theme.surface}
              />
            </ThemedView>
            
            <ThemedView style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16
            }}>
              <ThemedText style={textStyle}>Préférer le thème sombre</ThemedText>
              <Switch
                value={themeConfig.preferDarkTheme}
                onValueChange={(value) => 
                  setThemeConfig({ preferDarkTheme: value })
                }
                trackColor={{ false: theme.outline, true: theme.primary }}
                thumbColor={theme.surface}
              />
            </ThemedView>
            
            <ThemedText style={{ ...textStyle, marginBottom: 8 }}>
              Durée d'animation: {themeConfig.animationDuration}ms
            </ThemedText>
            <Slider
              value={themeConfig.animationDuration}
              minimumValue={0}
              maximumValue={1000}
              step={50}
              onValueChange={(value) => 
                setThemeConfig({ animationDuration: value })
              }
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.outline}
              thumbTintColor={theme.secondary}
            />
            
            <ThemedText style={{ ...textStyle, fontSize: 12, marginTop: 8, color: theme.subtext }}>
              Réglez sur 0 pour désactiver les animations
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
      
      {/* Aperçu du thème actuel */}
      <ThemedView style={{
        margin: 16,
        padding: 16,
        backgroundColor: theme.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.outline
      }}>
        <ThemedText style={{ ...textStyle, fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
          Aperçu du thème actuel
        </ThemedText>
        
        <ThemedView style={{
          flexDirection: 'row',
          marginBottom: 12,
          flexWrap: 'wrap'
        }}>
          {['primary', 'secondary', 'accent', 'error', 'success', 'warning', 'info'].map(colorKey => (
            <ThemedView key={colorKey} style={{ marginRight: 8, marginBottom: 8, alignItems: 'center' }}>
              <ThemedView style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: theme[colorKey] as string,
                marginBottom: 4
              }} />
              <ThemedText style={{ ...textStyle, fontSize: 10 }}>{colorKey}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
        
        <ThemedView style={{
          padding: 12,
          backgroundColor: theme.surfaceVariant,
          borderRadius: 4,
          marginBottom: 12
        }}>
          <ThemedText style={textStyle}>Surface Variant</ThemedText>
        </ThemedView>
        
        <ThemedView style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 12
        }}>
          <TouchableOpacity style={{
            padding: 10,
            backgroundColor: theme.primary,
            borderRadius: 4
          }}>
            <ThemedText style={{ color: theme.onSurface }}>Bouton Primaire</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={{
            padding: 10,
            backgroundColor: theme.secondary,
            borderRadius: 4
          }}>
            <ThemedText style={{ color: theme.onSurface }}>Bouton Secondaire</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        <ThemedView style={{
          padding: 10,
          borderWidth: 1,
          borderColor: theme.outline,
          borderRadius: 4,
          backgroundColor: theme.input.background
        }}>
          <ThemedText style={{ color: theme.input.placeholder }}>Champ de saisie</ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
};

export default ThemeSwitcher;