import { X_AXIS_PADDING } from "@/constants";
import {
  ScrollView,
  View,
  type ViewProps,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from "react-native";

export type ScreenViewProps = ViewProps & {
  canScroll?: boolean;
  hasSafeArea?: boolean;
};

export function ScreenContentView({
  style,
  canScroll = true,
  hasSafeArea = true,
  children,
  ...rest
}: ScreenViewProps) {
  const { width } = useWindowDimensions();

  // Allow disabling scrolling
  const Container = canScroll ? ScrollView : View;

  return (
    <Container
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.container, style]}
      style={{
        paddingHorizontal: width * X_AXIS_PADDING,
        paddingBottom: Platform.OS === "ios" ? (hasSafeArea ? 52 : 20) : 20,
        paddingTop: 10,
        flex: 1,
      }}
      {...rest}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
  },
});