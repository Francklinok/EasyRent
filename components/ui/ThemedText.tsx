import React, { useRef, useEffect } from 'react';
import { 
  Text, 
  Animated, 
  TextProps, 
  useWindowDimensions,
  Easing
} from 'react-native';
import { useTheme, useThemeTransition } from '../contexts/theme/themehook';

// Type pour les props de base des composants thématiques
type ThemedComponentProps = {
  variant?: 'primary' | 'secondary' | 'accent' | 'default';
  intensity?: 'light' | 'normal' | 'strong';
};

// Type complet des props pour le texte thématique
export type ThemedTextProps = TextProps & ThemedComponentProps & {
  type?: 'heading' | 'body' | 'caption' | 'title' | 'subtitle' | 'link' | 'normal' | 'default';
  fontFamily?: string;
  scaleFactor?: number;
  size?: number; // Taille de police personnalisée
  color?: string; // Couleur personnalisée qui ignore le variant si spécifiée
};

export const ThemedText: React.FC<ThemedTextProps> = ({
  style,
  children,
  variant = 'default',
  intensity = 'normal',
  type = 'caption',
  fontFamily = 'Poppins_400Regular',
  scaleFactor = 0.0002,
  size,
  color: customColor,
  ...props
}) => {
  const { theme } = useTheme();
  const { isAnimatingTheme, animationDuration } = useThemeTransition();
  const { width } = useWindowDimensions();
  
  // Create an animated value for smooth color transitions
  const colorAnimation = useRef(new Animated.Value(0)).current;
  
  // Update animation when theme changes
  useEffect(() => {
    if (isAnimatingTheme) {
      Animated.timing(colorAnimation, {
        toValue: 1,
        duration: animationDuration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false // Color animations can't use native driver
      }).start(() => {
        // Reset animation value after completion for next animation
        colorAnimation.setValue(0);
      });
    }
  }, [isAnimatingTheme, theme, animationDuration]);
  
  // Fonction pour calculer la taille adaptative en fonction de la largeur de l'écran
  const getAdaptiveSize = (baseSize: number) => Math.round(baseSize + width * scaleFactor);

  // Déterminer la couleur du texte selon le variant ou utiliser une couleur personnalisée
  const getTextColor = () => {
    if (customColor) return customColor;
    
    switch (variant) {
      case 'primary': return theme.primary;
      case 'secondary': return theme.secondary;
      case 'accent': return theme.accent;
      case 'default':
        switch (type) {
          case 'heading': return theme.typography?.heading || theme.text;
          case 'caption': return theme.typography?.caption || theme.text;
          case 'link': return '#0a7ea4'; // Couleur par défaut pour les liens
          default: return theme.typography?.body || theme.text;
        }
      default: return theme.text;
    }
  };
  
  // Déterminer le style de texte selon le type
  const getTextStyle = () => {
    let baseSize = size || 16; // Valeur par défaut si aucune taille n'est définie
    let lineHeight;
    let fontWeightValue = '400'; // Valeur par défaut de poids de police
    
    switch (type) {
      case 'heading':
        baseSize = size || 20;
        lineHeight = getAdaptiveSize(baseSize * 1.3);
        fontWeightValue = '700';
        break;
      case 'title':
        baseSize = size || 22;
        lineHeight = getAdaptiveSize(baseSize * 1.2);
        fontWeightValue = '600';
        break;
      case 'subtitle':
        baseSize = size || 18;
        lineHeight = getAdaptiveSize(baseSize * 1.3);
        fontWeightValue = '600';
        break;
      case 'caption':
        baseSize = size || 12;
        lineHeight = getAdaptiveSize(baseSize * 1.5);
        break;
      case 'normal':
        baseSize = size || 14;
        lineHeight = getAdaptiveSize(baseSize * 1.5);
        break;
      case 'link':
        baseSize = size || 12;
        lineHeight = getAdaptiveSize(baseSize * 1.5);
        break;
      case 'default':
      case 'body':
      default:
        baseSize = size || 14;
        lineHeight = getAdaptiveSize(baseSize * 1.5);
        break;
    }

    return { 
      fontSize: getAdaptiveSize(baseSize),
      lineHeight,
      fontWeight: fontWeightValue as '400' | '500' | '600' | '700' | undefined,
    };
  };
  
  // Modifier l'intensité
  const getIntensity = () => {
    switch (intensity) {
      case 'light': return { opacity: 0.7 };
      case 'strong': return { fontWeight: '700' as const };
      default: return {};
    }
  };
  
  return (
    <Animated.Text
      style={[
        getTextStyle(),
        {
          color: getTextColor(),
          fontFamily,
        },
        getIntensity(),
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.Text>
  );
};