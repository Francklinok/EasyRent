// import {
//   TouchableOpacity,
//   View,
//   ActivityIndicator,
//   GestureResponderEvent,
//   ViewStyle,
//   TextStyle,
//   TouchableOpacityProps,
//   Animated,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useTheme, useThemeTransition } from '../contexts/theme/themehook';
// import { ThemedText } from './ThemedText';

// type ThemedComponentProps = {
//   variant?: 'primary' | 'secondary' | 'accent' | 'default';
//   intensity?: 'light' | 'normal' | 'strong';
// };

// // Type complet des props pour le bouton thématique
// export type ThemedButtonProps = TouchableOpacityProps & ThemedComponentProps & {
//   title?: string;
//   icon?: React.ReactNode;
//   withGradient?: boolean;
//   size?: 'small' | 'medium' | 'large';
//   rounded?: boolean;
//   outlined?: boolean;
//   loading?: boolean;
//   backgroundColor?: string;  // Couleur personnalisée qui ignore le variant
//   textColor?: string;        // Couleur du texte personnalisée
//   buttonStyle?: ViewStyle;   // Style supplémentaire pour le bouton
//   textStyle?: TextStyle;     // Style supplémentaire pour le texte
//   indicatorPosition?: number; // Position de l'indicateur de chargement
//   children?: React.ReactNode; // Permet d'utiliser des enfants personnalisés à la place du titre
// };

// export const ThemedButton: React.FC<ThemedButtonProps> = ({
//   title,
//   icon,
//   style,
//   variant = 'primary',
//   intensity = 'normal',
//   withGradient = false,
//   size = 'medium',
//   rounded = false,
//   outlined = false,
//   loading = false,
//   backgroundColor,
//   textColor,
//   buttonStyle,
//   textStyle,
//   indicatorPosition,
//   children,
//   onPress,
//   onLongPress,
//   ...props
// }) => {
//   const { theme } = useTheme();
//   const { getTransitionStyle } = useThemeTransition();
  
//   // Déterminer le style du bouton selon la taille
//   const getSizeStyle = () => {
//     switch (size) {
//       case 'small': return { paddingVertical: 6, paddingHorizontal: 12 };
//       case 'large': return { paddingVertical: 14, paddingHorizontal: 24 };
//       default: return { paddingVertical: 10, paddingHorizontal: 16 };
//     }
//   };
  
//   // Déterminer la couleur du bouton selon le variant ou la couleur personnalisée
//   const getButtonColor = () => {
//     if (backgroundColor) return backgroundColor;
    
//     switch (variant) {
//       case 'primary': return theme.primary;
//       case 'secondary': return theme.secondary;
//       case 'accent': return theme.accent;
//       default: return theme.surface;
//     }
//   };
  
//   // Déterminer le style du bouton selon le variant et si outline
//   const getVariantStyle = () => {
//     // Pour les boutons outlined, on inverse les couleurs
//     if (outlined) {
//       return {
//         backgroundColor: 'transparent',
//         borderWidth: 1,
//         borderColor: getButtonColor(),
//       };
//     }
    
//     return {
//       backgroundColor: getButtonColor(),
//     };
//   };
  
//   // Déterminer la couleur du texte (ou personnalisée)
//   const getTextColor = () => {
//     if (textColor) return textColor;
    
//     if (outlined) {
//       return getButtonColor();
//     }
    
//     switch (variant) {
//       case 'primary':
//       case 'secondary':
//       case 'accent': 
//         return '#ffffff';
//       default: 
//         return theme.text;
//     }
//   };
  
//   // Le contenu du bouton (utilise children s'il est fourni, sinon construit le contenu standard)
//   const buttonContent = children || (
//     <>
//       {loading ? (
//         <ActivityIndicator 
//           size="small" 
//           color={getTextColor()} 
//           style={{ 
//             marginRight: title ? 8 : 0,
//             ...(indicatorPosition ? { left: indicatorPosition } : {})
//           }} 
//         />
//       ) : icon ? (
//         <View style={{ marginRight: title ? 8 : 0 }}>{icon}</View>
//       ) : null}
      
//       {title && (
//         <ThemedText
//           style={[
//             {
//               color: getTextColor(),
//               fontSize: size === 'small' ? 12 : size === 'large' ? 16 : 14,
//               fontWeight: '600',
//             },
//             textStyle
//           ]}
//         >
//           {title}
//         </ThemedText>
//       )}
//     </>
//   );
  
//   // Conteneur avec ou sans dégradé
//   const Container = withGradient ? LinearGradient : Animated.View;
//   const containerProps = withGradient ? {
//     colors: Array.isArray(theme.buttonGradient) ? theme.buttonGradient : [theme.primary, theme.secondary],
//     start: { x: 0, y: 0 },
//     end: { x: 1, y: 1 },
//   } : {};
  
//   return (
//     <TouchableOpacity
//       activeOpacity={0.7}
//       disabled={loading || props.disabled}
//       onPress={onPress}
//       onLongPress={onLongPress}
//       {...props}
//     >
//       <Container
//         {...containerProps}
//         style={[
//           getSizeStyle(),
//           getVariantStyle(),
//           {
//             borderRadius: rounded ? 50 : 8,
//             flexDirection: 'row',
//             alignItems: 'center',
//             justifyContent: 'center',
//             opacity: (loading || props.disabled) ? 0.7 : 1,
//             position: 'relative',
//           },
//           getTransitionStyle(),
//           style,
//           buttonStyle,
//         ]}
//       >
//         {buttonContent}
//       </Container>
//     </TouchableOpacity>
//   );
// };



// import React from "react";
// // import {
// //   TouchableOpacity,
// //   GestureResponderEvent,
// //   ViewStyle,
// //   TextStyle,
// //   TouchableOpacityProps,
// // } from "react-native";


// // type CustomButtonProps = TouchableOpacityProps & {
// //   onPress?: (event: GestureResponderEvent) => void;
// //   onLongPress?: (event: GestureResponderEvent) => void;
// //   backgroundColor?: string;
// //   textColor?: string;
// //   isLoading?: boolean;
// //   disabled?: boolean;
// //   className?: string;
// //   buttonStyle?: ViewStyle;
// //   textStyle?: TextStyle;
// //   indicatorPosition?: number;
// //   children: React.ReactNode;
// // };
// // export const ThemedButton = ({
// //   onPress,
// //   onLongPress,
// //   backgroundColor = "",
// //   isLoading = false,
// //   disabled = false,
// //   className,
// //   buttonStyle,
// //   textStyle,
// //   indicatorPosition,
// //   children,
// //   ...props
// // }: CustomButtonProps) => {
// //   return (
// //     <TouchableOpacity
// //       style={[
// //         {
// //           backgroundColor: backgroundColor || "#FFFFFF0",
// //           position: "relative",
// //         },
// //         buttonStyle,
// //       ]}
// //       onPress={onPress}
// //       onLongPress={onLongPress}
// //       disabled={disabled || isLoading}
// //       activeOpacity={0.8}
// //       {...props}
// //     >
// //       {children}
// //     </TouchableOpacity>
// //   );
// // };

import React from 'react';
import {
  TouchableOpacity,
  View,
  ActivityIndicator,
  // GestureResponderEvent, // Pas directement utilisé
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  Animated,
  StyleSheet, // Importer StyleSheet
  StyleProp,  // Importer StyleProp
} from 'react-native';
// Assure-toi que LinearGradient et LinearGradientPoint sont correctement importés depuis expo
import { LinearGradient, LinearGradientPoint } from 'expo-linear-gradient';
import { useTheme /*, useThemeTransition */ } from '../contexts/theme/themehook'; // getTransitionStyle non utilisé pour l'instant
import { ThemedText } from './ThemedText';

type ThemedComponentProps = {
  variant?: 'primary' | 'secondary' | 'accent' | 'default';
  intensity?: 'light' | 'normal' | 'strong'; // Non utilisé dans la logique actuelle
};

// Type complet des props pour le bouton thématique
export type ThemedButtonProps = TouchableOpacityProps & ThemedComponentProps & {
  title?: string;
  icon?: React.ReactNode;
  withGradient?: boolean;
  size?: 'small' | 'medium' | 'large';
  rounded?: boolean;
  outlined?: boolean;
  loading?: boolean;
  backgroundColor?: string;
  textColor?: string;
  // Utiliser StyleProp pour plus de flexibilité (accepte objet, tableau, ID)
  buttonStyle?: StyleProp<ViewStyle>; // Style pour le conteneur interne (View/Gradient)
  textStyle?: StyleProp<TextStyle>;   // Style pour le texte interne
  indicatorPosition?: number; // Attention: positionnement peut être complexe
  children?: React.ReactNode;
  // `style` s'appliquera au TouchableOpacity externe
};

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  icon,
  style, // Style pour TouchableOpacity (ex: margin)
  variant = 'primary',
  intensity = 'normal',
  withGradient = false,
  size = 'medium',
  rounded = false,
  outlined = false,
  loading = false,
  backgroundColor,
  textColor,
  buttonStyle, // Style spécifique pour le conteneur interne
  textStyle,
  indicatorPosition,
  children,
  onPress,
  onLongPress,
  disabled, // Récupérer 'disabled' des props
  ...props // Autres props pour TouchableOpacity
}) => {
  const { theme } = useTheme();
  // const { getTransitionStyle } = useThemeTransition(); // À rajouter si besoin

  const isDisabled = loading || disabled; // État désactivé combiné

  // --- Fonctions Helper (avec types de retour explicites) ---

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small': return { paddingVertical: 6, paddingHorizontal: 12 };
      case 'large': return { paddingVertical: 14, paddingHorizontal: 24 };
      default: return { paddingVertical: 10, paddingHorizontal: 16 }; // medium
    }
  };

  const getButtonColor = (): string => {
    if (backgroundColor) return backgroundColor;
    // Fournir des fallbacks si les couleurs du thème ne sont pas définies
    switch (variant) {
      case 'primary': return theme.primary || '#6200ee';
      case 'secondary': return theme.secondary || '#03dac4';
      case 'accent': return theme.accent || '#018786';
      default: return theme.surface || '#ffffff'; // 'default' ou autre
    }
  };

   const getTextColor = (): string => {
    if (textColor) return textColor;
    // Si outlined, le texte prend la couleur de base du bouton
    if (outlined) {
      return getButtonColor();
    }
    // Sinon, déterminer la couleur de texte contrastée (utiliser onPrimary, etc. si défini dans le thème)
    switch (variant) {
      case 'primary': return theme?.primary || '#ffffff';
      case 'secondary': return theme.secondary || '#000000'; // Souvent noir sur couleurs secondaires claires
      case 'accent': return theme.accent || '#ffffff';
      default: return theme.onSurface || theme.text || '#000000'; // Couleur sur 'surface' ou texte par défaut
    }
  };

  const getVariantStyle = (): ViewStyle => {
    const baseColor = getButtonColor();
    if (outlined) {
      return {
        backgroundColor: 'transparent', // Fond transparent pour outlined
        borderWidth: 1,
        borderColor: baseColor,
      };
    }
    // Si le bouton utilise un gradient, on ne met pas de couleur de fond ici
    // car le gradient la fournira. On s'assure qu'il n'y a pas de bordure non plus.
    if (withGradient) {
        return {
            backgroundColor: 'transparent',
            borderWidth: 0,
        };
    }
    // Cas standard (non-outlined, non-gradient)
    return {
      backgroundColor: baseColor,
      borderWidth: 0, // Pas de bordure par défaut
    };
  };

  // --- Contenu du bouton ---
  const buttonContent = children || (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
          style={{ marginRight: title ? 8 : 0 }}
          // indicatorPosition est complexe à gérer ici sans position absolue
        />
      ) : icon ? (
        <View style={{ marginRight: title ? 8 : 0 }}>{icon}</View>
      ) : null}

      {title && (
        <ThemedText
          // Utiliser StyleSheet.flatten pour les styles de texte aussi
          style={StyleSheet.flatten([
            {
              color: getTextColor(),
              fontSize: size === 'small' ? 12 : size === 'large' ? 16 : 14,
              fontWeight: '600',
              textAlign: 'center', // Assurer le centrage
            },
            textStyle, // Styles de texte personnalisés
          ])}
        >
          {title}
        </ThemedText>
      )}
    </>
  );

  // --- Assemblage et Aplatissement des Styles du Conteneur Interne ---
  // C'est le style qui sera appliqué soit à LinearGradient soit à Animated.View
  const containerStyle = StyleSheet.flatten([
    getSizeStyle(),
    getVariantStyle(),
    {
      borderRadius: rounded ? 50 : 8, // Style arrondi
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: isDisabled ? 0.6 : 1, // Réduire l'opacité si désactivé
      overflow: 'hidden', // Important pour que le contenu (gradient) respecte le borderRadius
    }as const,
    // getTransitionStyle(), // Ajouter si l'animation de thème est nécessaire
    buttonStyle, // Styles personnalisés passés via props pour le conteneur
  ]);

  // --- Props spécifiques pour LinearGradient ---
  // --- Props spécifiques pour LinearGradient ---
  const gradientProps = {
    // Déterminer le tableau de couleurs et assurer le type correct
    colors: (
      // Condition pour utiliser le gradient du thème ou le fallback
      (Array.isArray(theme.buttonGradient) && theme.buttonGradient.length >= 2)
        ? theme.buttonGradient
        // Utiliser 'as const' sur le fallback pour aider TS à l'inférer comme tuple readonly [string, string]
        : [theme.primary || '#6200ee', theme.secondary || '#03dac4'] as const
    // Asserter explicitement le résultat final au type tuple attendu par LinearGradient
    ) as readonly [string, string, ...string[]], // <--- TYPE ASSERTION ICI

    start: { x: 0, y: 0 } as LinearGradientPoint,
    end: { x: 1, y: 1 } as LinearGradientPoint,
  };

  // const gradientProps = {
  //   // Vérifier que theme.buttonGradient est un tableau valide d'au moins 2 couleurs
  //   colors: (Array.isArray(theme.buttonGradient) && theme.buttonGradient.length >= 2)
  //             ? theme.buttonGradient
  //             : [theme.primary || '#6200ee', theme.secondary || '#03dac4'], // Fallback gradient
  //   start: { x: 0, y: 0 } as LinearGradientPoint, // Cast en Point pour typer explicitement
  //   end: { x: 1, y: 1 } as LinearGradientPoint,
  // };

  // --- Rendu Final ---
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isDisabled}
      onPress={onPress}
      onLongPress={onLongPress}
      style={style} // Appliquer le style externe (ex: margins) ici
      {...props}   // Passer les autres props (accessibilityLabel, etc.)
    >
      {/* Utiliser le rendu conditionnel ici */}
      {withGradient && !outlined ? ( // Le gradient ne s'applique que si withGradient ET non outlined
        <LinearGradient
          {...gradientProps}
          style={containerStyle} // Appliquer les styles aplatis
        >
          {buttonContent}
        </LinearGradient>
      ) : (
        // Utiliser Animated.View si des animations sont prévues, sinon View simple suffit
        <Animated.View
          style={containerStyle} // Appliquer les styles aplatis
        >
          {buttonContent}
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};