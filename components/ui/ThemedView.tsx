import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { useTheme, useThemeTransition } from "../contexts/theme/themehook";

// Type for themed component base props
type ThemedComponentProps = {
  variant?: 'primary' | 'secondary' | 'accent' | 'default' | 'surface' | 'surfaceVariant';
  bordered?: boolean;
  elevated?: 'small' | 'medium' | 'large' | boolean;
  intensity?: 'light' | 'normal' | 'strong';
};

// Complete type for themed view
export type ThemedViewProps = ViewProps & ThemedComponentProps & {
  backgroundColor?: string; // Custom background color that overrides variant
};

export const ThemedView: React.FC<ThemedViewProps> = ({
  style,
  children,
  variant = 'default',
  bordered = false,
  elevated = false,
  intensity = 'normal',
  backgroundColor: customBackgroundColor,
  ...props
}) => {
  const { theme } = useTheme();
  const { isAnimatingTheme, getTransitionStyle } = useThemeTransition();

  // Determine background color based on variant
  const getBackgroundColor = () => {
    if (customBackgroundColor) return customBackgroundColor;
    
    switch (variant) {
      case 'primary': return theme.primary;
      case 'secondary': return theme.secondary;
      case 'accent': return theme.accent;
      case 'surface': return theme.surface;
      case 'surfaceVariant': return theme.surfaceVariant;
      case 'default':
      default:
        // Use the first background color if it's an array
        return Array.isArray(theme.background) ? theme.background[0] : theme.background;
    }
  };

  // Apply elevation shadow if needed
  const getElevation = () => {
    if (!elevated) return {};

    let shadowColor = theme.shadow?.color || '#000000';
    let shadowOpacity = theme.shadow?.opacity || 0.1;
    let elevationLevel: 'small' | 'medium' | 'large' = 'small';

    if (typeof elevated === 'string') {
      elevationLevel = elevated;
    }

    const shadowValue = theme.elevation?.[elevationLevel] || 
      (elevationLevel === 'small' ? 'rgba(0, 0, 0, 0.1)' : 
       elevationLevel === 'medium' ? 'rgba(0, 0, 0, 0.15)' : 
       'rgba(0, 0, 0, 0.2)');
    
    return {
      shadowColor,
      shadowOffset: { width: 0, height: elevationLevel === 'small' ? 1 : elevationLevel === 'medium' ? 2 : 4 },
      shadowOpacity,
      shadowRadius: elevationLevel === 'small' ? 2 : elevationLevel === 'medium' ? 4 : 8,
      elevation: elevationLevel === 'small' ? 2 : elevationLevel === 'medium' ? 4 : 8,
      backgroundColor: shadowValue // This is needed for Android elevation
    };
  };

  // Apply border if needed
  const getBorder = () => {
    if (!bordered) return {};

    return {
      borderWidth: 1,
      borderColor: theme.outline || '#e2e8f0',
    };
  };

  // Apply intensity modifications
  const getIntensity = () => {
    switch (intensity) {
      case 'light': return { opacity: 0.7 };
      case 'strong': return { opacity: 1 };
      default: return {};
    }
  };

  return (
    <View
      style={[
        { backgroundColor: getBackgroundColor() },
        getBorder(),
        getElevation(),
        getIntensity(),
        isAnimatingTheme && getTransitionStyle(),
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};
// import { View, type ViewProps } from "react-native";
// import { useThemeColor } from "@/hooks/useThemeColor";

// export type ThemedViewProps = ViewProps & {
//   lightColor?: string;
//   darkColor?: string;
// };

// export function ThemedView({
//   style,
//   lightColor,
//   darkColor,
//   ...otherProps
// }: ThemedViewProps) {
//   const backgroundColor =
//     lightColor && darkColor
//       ? useThemeColor({ light: lightColor, dark: darkColor }, "background")
//       : "";

//   return (
//     <View
//       style={[backgroundColor ? { backgroundColor } : "", style]}
//       {...otherProps}
//     />
//   );
// }



// import React, { useRef, useEffect } from 'react';
// import { 
//   View, 
//   ViewProps, 
//   Animated, 
//   useWindowDimensions,
//   Easing
// } from 'react-native';
// import { useTheme, useThemeTransition } from '../contexts/theme/themehook';

// // Type for base themed component props
// type ThemedComponentProps = {
//   variant?: 'primary' | 'secondary' | 'accent' | 'default';
//   intensity?: 'light' | 'normal' | 'strong';
// };

// // Complete props type for the themed view
// export type ThemedViewProps = ViewProps & ThemedComponentProps & {
//   type?: 'card' | 'surface' | 'container' | 'default';
//   backgroundColor?: string; // Custom background color that overrides the theme if specified
//   borderColor?: string; // Custom border color
//   elevated?: boolean; // Whether to apply elevation/shadow
//   elevationLevel?: 1 | 2 | 3 | 4 | 5; // Level of elevation
//   rounded?: boolean | 'full' | 'none' | 'sm' | 'md' | 'lg' | 'xl'; // Border radius options
// };

// export const ThemedView: React.FC<ThemedViewProps> = ({
//   style,
//   children,
//   variant = 'default',
//   intensity = 'normal',
//   type = 'default',
//   backgroundColor: customBackgroundColor,
//   borderColor: customBorderColor,
//   elevated = false,
//   elevationLevel = 1,
//   rounded = false,
//   ...props
// }) => {
//   const { theme } = useTheme();
//   const { isAnimatingTheme, animationDuration } = useThemeTransition();
//   const { width } = useWindowDimensions();
  
//   // Create an animated value for smooth background color transitions
//   const backgroundAnimation = useRef(new Animated.Value(0)).current;
  
//   // Update animation when theme changes
//   useEffect(() => {
//     if (isAnimatingTheme) {
//       Animated.timing(backgroundAnimation, {
//         toValue: 1,
//         duration: animationDuration,
//         easing: Easing.inOut(Easing.ease),
//         useNativeDriver: false // Color animations can't use native driver
//       }).start(() => {
//         // Reset animation value after completion for next animation
//         backgroundAnimation.setValue(0);
//       });
//     }
//   }, [isAnimatingTheme, theme, animationDuration]);
  
//   // Determine background color based on variant and type
//   const getBackgroundColor = () => {
//     if (customBackgroundColor) return customBackgroundColor;
    
//     switch (variant) {
//       case 'primary': return theme.primary;
//       case 'secondary': return theme.secondary;
//       case 'accent': return theme.accent;
//       case 'default':
//         switch (type) {
//           case 'card': return theme.surface;
//           case 'surface': return theme.surface;
//           case 'container': return Array.isArray(theme.background) ? theme.background[0] : theme.background;
//           default: return undefined; // Default to transparent
//         }
//       default: return undefined;
//     }
//   };
  
//   // Determine border color
//   const getBorderColor = () => {
//     if (customBorderColor) return customBorderColor;
    
//     // Default border colors based on theme
//     return theme.border || (theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)');
//   };
  
//   // Apply elevation/shadow if requested
//   const getElevation = () => {
//     if (!elevated) return {};
    
//     const shadowOpacity = theme.isDark ? 0.4 : 0.2;
//     const shadowColor = theme.isDark ? '#000' : '#000';
    
//     const elevationValues = {
//       1: { shadowOffset: { width: 0, height: 1 }, shadowRadius: 2, elevation: 1 },
//       2: { shadowOffset: { width: 0, height: 2 }, shadowRadius: 3, elevation: 2 },
//       3: { shadowOffset: { width: 0, height: 3 }, shadowRadius: 4, elevation: 3 },
//       4: { shadowOffset: { width: 0, height: 4 }, shadowRadius: 6, elevation: 4 },
//       5: { shadowOffset: { width: 0, height: 5 }, shadowRadius: 8, elevation: 5 },
//     };
    
//     return {
//       shadowColor,
//       shadowOpacity,
//       ...elevationValues[elevationLevel],
//     };
//   };
  
//   // Determine border radius based on the rounded prop
//   const getBorderRadius = () => {
//     if (rounded === false || rounded === 'none') return 0;
//     if (rounded === true) return 8; // Default rounded corners
    
//     switch (rounded) {
//       case 'sm': return 4;
//       case 'md': return 8;
//       case 'lg': return 12;
//       case 'xl': return 16;
//       case 'full': return 9999;
//       default: return 8;
//     }
//   };
  
//   // Apply intensity modifiers
//   const getIntensity = () => {
//     switch (intensity) {
//       case 'light': return { opacity: 0.7 };
//       case 'strong': return { borderWidth: 2 };
//       default: return {};
//     }
//   };
  
//   return (
//     <Animated.View
//       style={[
//         getBackgroundColor() ? { backgroundColor: getBackgroundColor() } : {},
//         { borderColor: getBorderColor() },
//         { borderRadius: getBorderRadius() },
//         getElevation(),
//         getIntensity(),
//         style,
//       ]}
//       {...props}
//     >
//       {children}
//     </Animated.View>
//   );
// };