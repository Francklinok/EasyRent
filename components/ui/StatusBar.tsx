import { StatusBar, StatusBarProps } from 'react-native';
import { useTheme } from '../contexts/theme/themehook';

export const ThemedStatusBar: React.FC<StatusBarProps> = (props) => {
  const { theme } = useTheme();
  
  return (
    <StatusBar
      barStyle={theme.statusBar}
      backgroundColor="transparent"
      translucent
      {...props}
    />
  );
};
