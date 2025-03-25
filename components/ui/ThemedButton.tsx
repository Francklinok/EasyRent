import React from "react";
import {
  TouchableOpacity,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from "react-native";

type CustomButtonProps = TouchableOpacityProps & {
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  backgroundColor?: string;
  textColor?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  indicatorPosition?: number;
  children: React.ReactNode;
};

export const ThemedButton = ({
  onPress,
  onLongPress,
  backgroundColor = "",
  isLoading = false,
  disabled = false,
  className,
  buttonStyle,
  textStyle,
  indicatorPosition,
  children,
  ...props
}: CustomButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: backgroundColor || "#FFFFFF0",
          position: "relative",
        },
        buttonStyle,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};