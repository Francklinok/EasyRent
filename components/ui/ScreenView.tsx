import {
    ScrollView,
    View,
    type ViewProps,
    StyleSheet,
    useColorScheme,
  } from "react-native";
  import { SafeAreaView } from "react-native-safe-area-context";
  import { StatusBar, StatusBarProps } from "expo-status-bar";
  
  export type ScreenViewProps = ViewProps & {
    backgroundColor?: string;
    canScroll?: boolean;
    safeAreaEdges?: ("top" | "bottom" | "left" | "right")[];
    statusBarStyle?: StatusBarProps;
  };
  
  export function ScreenView({
    style,
    backgroundColor = "",
    canScroll = true,
    safeAreaEdges = ["top", "bottom"],
    statusBarStyle = {
      style: "auto",
      translucent: true,
    },
    children,
    ...rest
  }: ScreenViewProps) {
    // Get system theme
    const _theme = useColorScheme();
    const Container = canScroll ? ScrollView : View;
  
    return (
      <SafeAreaView
        edges={safeAreaEdges}
        style={[
          styles.safeArea,
          {
            backgroundColor: backgroundColor ? backgroundColor : "",
          },
        ]}
      >
        <StatusBar
          // style={_theme === "dark" ? "light" : "dark"}
          // backgroundColor={_theme === "dark" ? "#000" : "#FFF"}
          {...statusBarStyle}
        />
        <Container
          className="flex flex-1 flex-grow"
          contentContainerStyle={[styles.container, style]}
          {...rest}
        >
          {children}
        </Container>
      </SafeAreaView>
    );
  }
  
  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      width: "100%",
      height: "100%",
    },
    container: {
      flexGrow: 1,
    },
  });