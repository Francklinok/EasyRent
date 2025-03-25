import { ReactNode } from "react";
import { TouchableOpacity, View, ViewStyle } from "react-native";
import { BackButton } from "./BackButton";

export type AppHeaderProps = {
  leftElement?: ReactNode;
  mainElement?: ReactNode;
  rightElement?: ReactNode;
  hasBackButton?: boolean;
  style?: ViewStyle;
};

export function AppHeader({
  leftElement,
  mainElement,
  rightElement,
  hasBackButton = true,
  style = {},
}: AppHeaderProps) {
  return (
    <>
      <View
        style={{
          paddingVertical: 12,
          paddingHorizontal: 16,
        }}
        className={"flex-row items-center justify-between"}
        {...style}
      >
        {leftElement ? (
          <TouchableOpacity>{leftElement}</TouchableOpacity>
        ) : hasBackButton ? (
          <BackButton />
        ) : null}
        {mainElement ? mainElement : null}

        {rightElement ? (
          <TouchableOpacity>{rightElement}</TouchableOpacity>
        ) : null}
      </View>
    </>
  );
}