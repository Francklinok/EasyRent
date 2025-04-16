// // This is a shim for web and Android where the tab bar is generally opaque.
// export default undefined;

// export function useBottomTabOverflow() {
//   return 0;
// }
// dans components/ui/TabBarBackground.tsx

import React from 'react';
import { View, Platform } from 'react-native';

export default function TabBarBackground() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.9)' : 'white',
      }}
    />
  );
}
