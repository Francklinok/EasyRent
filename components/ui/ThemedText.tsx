import { Text, type TextProps, useWindowDimensions } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedTextProps = TextProps & {
  color?: string;
  type?: "default" | "title" | "normal" | "subtitle" | "link";
  fontFamily?: string;
  scaleFactor?: number;
  size?: number; // default font size
};

export function ThemedText({
  style,
  color,
  type = "default",
  fontFamily = "Poppins_400Regular",
  scaleFactor = 0.0002,
  size = 0,
  ...rest
}: ThemedTextProps) {
  // const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
  const { width } = useWindowDimensions();

  // Adaptive font scaling
  const getAdaptiveSize = (baseSize: number) =>
    Math.round(baseSize + width * scaleFactor);

  return (
    <Text
      style={[
        { color, fontFamily },
        type === "default"
          ? {
              fontSize: getAdaptiveSize(size || 16),
              lineHeight: getAdaptiveSize(24),
            }
          : undefined,
        type === "normal"
          ? {
              fontSize: getAdaptiveSize(size || 18),
              lineHeight: getAdaptiveSize(28),
            }
          : undefined,
        type === "title"
          ? {
              fontSize: getAdaptiveSize(size || 32),
              lineHeight: getAdaptiveSize(32),
            }
          : undefined,
        type === "subtitle"
          ? {
              fontSize: getAdaptiveSize(size || 22),
              lineHeight: getAdaptiveSize(29),
            }
          : undefined,
        type === "link"
          ? {
              fontSize: getAdaptiveSize(size || 16),
              color: "#0a7ea4",
              lineHeight: getAdaptiveSize(30),
            }
          : undefined,
        style,
      ]}
      {...rest}
    />
  );
}