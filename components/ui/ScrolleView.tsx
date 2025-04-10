import { ScrollViewProps } from "react-native";
import { useTheme } from "../../../autre/info/Theme";
import { useThemeTransition } from "../contexts/theme/themehook";
import { ScrollView } from "react-native-reanimated/lib/typescript/Animated";

// Scrollview thématique
type ThemedScrollViewProps = ScrollViewProps & {
  contentPadding?: number;
};

export const ThemedScrollView: React.FC<ThemedScrollViewProps> = ({
  style,
  contentContainerStyle,
  contentPadding = 16,
  children,
  ...props
}) => {
  const { theme } = useTheme();
  const { getTransitionStyle } = useThemeTransition();
  
  return (
    <ScrollView
      style={[
        { backgroundColor: theme.background[0] },
        getTransitionStyle(),
        style,
      ]}
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
