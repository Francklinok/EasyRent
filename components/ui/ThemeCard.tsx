

import React from "react";
import { useTheme } from "../../../autre/info/Theme";
// import { useThemeTransition } from "../contexts/theme/themehook"; // Semble inutilisé ici
import LinearGradient from "react-native-linear-gradient";
import { ViewProps, Animated, View, StyleSheet, StyleProp, ViewStyle } from "react-native"; // Import StyleSheet

// Dans themedTypes.ts
export type ThemedComponentProps = {
  variant?: 'primary' | 'secondary' | 'accent' | 'default';
  intensity?: 'light' | 'normal' | 'strong'; // Note: intensity n'est pas utilisé dans la logique actuelle
};

// Card thématique
type ThemedCardProps = ViewProps & ThemedComponentProps & {
  withGradient?: boolean;
  withShadow?: boolean;
  withBorder?: boolean;
};

export const ThemedCard: React.FC<ThemedCardProps> = ({
  style,
  children,
  withGradient = false,
  withShadow = true,
  withBorder = true,
  variant = 'default',
  intensity = 'normal', // Paramètre non utilisé
  ...props
}) => {
  const { theme } = useTheme();
  // const { isAnimatingTheme } = useThemeTransition(); // Paramètre non utilisé

  // Define common styles as an array
  // On peut typer plus précisément le contenu potentiel du tableau
  const commonStylesArray: (StyleProp<ViewStyle> | false)[] = [
    {
      backgroundColor: variant === 'default' ? theme.surface : theme[variant],
      borderRadius: 12,
      padding: 16,
      borderWidth: withBorder ? 1 : 0,
      borderColor: theme.outline,
      overflow: 'hidden', // Important pour que le borderRadius masque le gradient/ombre
    },
    // Style conditionnel pour l'ombre
    withShadow && {
      shadowColor: theme.shadow.color,
      shadowOpacity: theme.shadow.opacity,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 5, // Important pour l'ombre sur Android
    },
    // Styles additionnels passés via les props
    style,
  ];

  // Flatten the array of styles into a single style object
  // C'est cette étape qui résout l'erreur TypeScript
  const flattenedStyles = StyleSheet.flatten(commonStylesArray);

  // Render with gradient
  if (withGradient) {
    // Assure-toi que theme.cardGradient est bien un tableau de couleurs valide, ex: ['#FF0000', '#0000FF']
    if (!theme.cardGradient || theme.cardGradient.length < 2) {
       console.warn("ThemedCard: theme.cardGradient is not a valid array of colors for LinearGradient.");
       // Fallback ou retour d'erreur si nécessaire
    }

    return (
      <LinearGradient
        // colors doit être un tableau de strings de couleurs
        colors={theme.cardGradient || [theme.surface, theme.surface]} // Fournir un fallback au cas où
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={flattenedStyles} // Utiliser les styles aplatis
        {...props}
      >
        {children}
      </LinearGradient>
    );
  }

  // Render with Animated.View (ou View si l'animation n'est pas nécessaire)
  // Il est bon d'utiliser aussi les styles aplatis ici pour la cohérence
  return (
    <Animated.View
      style={flattenedStyles} // Utiliser les styles aplatis
      {...props}
    >
      {children}
    </Animated.View>
  );
};