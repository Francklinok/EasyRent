import React from "react";
import { ScrollView, ScrollViewProps } from "react-native";
import { useTheme } from "../../hooks/themehook";
import { useThemeTransition } from "../../hooks/themehook";

// Scrollview thématique
type ThemedScrollViewProps = ScrollViewProps & {
  contentPadding?: number;
};

export const ThemedScrollView: React.FC<ThemedScrollViewProps> = ({
  style,
  contentContainerStyle,
  contentPadding = 0,
  children,
  ...props
}) => {
  const { theme } = useTheme();
  const { getTransitionStyle } = useThemeTransition();

  return (
    <ScrollView
      style={[style, getTransitionStyle(theme)]}
      contentContainerStyle={[
        { padding: contentPadding },
        contentContainerStyle,
      ]}
      {...props}
    >
      {children}
    </ScrollView>
  );
};

