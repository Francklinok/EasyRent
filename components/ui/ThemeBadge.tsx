import { ThemedText } from "./ThemedText";
import { useTheme } from "../contexts/theme/themehook";
import { useThemeTransition } from "../contexts/theme/themehook";
import LinearGradient from "react-native-linear-gradient";
import { ViewProps,View } from "react-native";

// Dans themedTypes.ts
export type ThemedComponentProps = {
  variant?: 'primary' | 'secondary' | 'accent' | 'default';
  intensity?: 'light' | 'normal' | 'strong';
};

// Badge thématique
type ThemedBadgeProps = ViewProps & ThemedComponentProps & {
  label?: string;
  dot?: boolean;
  size?: 'small' | 'medium' | 'large';
  withGradient?: boolean;
};

export const ThemedBadge: React.FC<ThemedBadgeProps> = ({
  style,
  children,
  label,
  dot = false,
  size = 'medium',
  variant = 'primary',
  withGradient = false,
  ...props
}) => {
  const { theme } = useTheme();
  const { getTransitionStyle } = useThemeTransition();
  
  // Taille du badge
  const getSize = () => {
    if (dot) {
      switch (size) {
        case 'small': return { width: 8, height: 8, borderRadius: 4 };
        case 'large': return { width: 16, height: 16, borderRadius: 8 };
        default: return { width: 12, height: 12, borderRadius: 6 };
      }
    }
    
    switch (size) {
      case 'small': return { paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4 };
      case 'large': return { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 };
      default: return { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 };
    }
  };
  
  // Couleur selon le variant
  const getColor = () => {
    switch (variant) {
      case 'primary': return theme.primary;
      case 'secondary': return theme.secondary;
      case 'accent': return theme.accent;
      default: return theme.surface;
    }
  };
  
  // Conteneur avec ou sans dégradé
  const Container = withGradient ? LinearGradient : View;
  const containerProps = withGradient ? {
    colors: variant === 'primary' 
      ? theme.buttonGradient 
      : [getColor(), getColor()],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  } : {};
  
  return (
    <Container
      {...containerProps}
      style={[
        getSize(),
        {
          backgroundColor: getColor(),
          alignItems: 'center',
          justifyContent: 'center',
        },
        getTransitionStyle(),
        style,
      ]}
      {...props}
    >
      {!dot && label && (
        <ThemedText
          style={{
            color: '#ffffff',
            fontSize: size === 'small' ? 10 : size === 'large' ? 14 : 12,
            fontWeight: '600',
          }}
        >
          {label}
        </ThemedText>
      )}
      {children}
    </Container>
  );
};
