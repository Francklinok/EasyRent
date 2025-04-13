
// import React from 'react';
// import { Stack } from "expo-router";
// import Header from '@/components/ui/header';
// import { useThemeColors } from '@/components/contexts/theme/themehook';

// export default function ChatLayout() {
//     const colors = useThemeColors()
//   return (
//     <Stack
//       screenOptions={{
//         headerShown: true,
//         header: () => <Header />,
//         headerStyle: {
//           backgroundColor: colors.background,
//         },
//       }}
//     />
//   );
// }
import React from 'react';
import { Stack } from "expo-router";
import Header from '@/components/ui/header';
import { useThemeColors } from '@/components/contexts/theme/themehook';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

export default function ChatLayout() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  // Hauteur estimée de l'entête personnalisé
  const headerHeight = 60 + insets.top; // adapte selon ton Header

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: () => <Header />,
        headerStyle: {
          backgroundColor: colors.background,
          height: headerHeight, // réserve bien l’espace
        },
        contentStyle: {
          paddingTop: Platform.OS === 'android' ? 0 : headerHeight, // évite le collage
        },
      }}
    />
  );
}
