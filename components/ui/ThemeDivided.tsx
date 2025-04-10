
// Divider (Séparateur) thématique
type ThemedDividerProps = ViewProps & {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  opacity?: number;
};

export const ThemedDivider: React.FC<ThemedDividerProps> = ({
  style,
  orientation = 'horizontal',
  thickness = 1,
  opacity = 1,
  ...props
}) => {
  const { theme } = useTheme();
  const { getTransitionStyle } = useThemeTransition();
  
  return (
    <View
      style={[
        {
          backgroundColor: theme.divider,
          opacity: opacity,
          ...(orientation === 'horizontal' 
            ? { height: thickness, width: '100%', marginVertical: 8 }
            : { width: thickness, height: '100%', marginHorizontal: 8 }),
        },
        getTransitionStyle(),
        style,
      ]}
      {...props}
    />
  );
};
