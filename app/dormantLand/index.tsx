/**
 * app/dormantLand/index.tsx — direct-navigation entry point (e.g. from the
 * owner dashboard's "Foncier dormant" link). The home header's "Foncier"
 * tab instead mounts DormantLandListScreen inline under RenHouseAcceuil
 * with disableSafeArea, so the tab bar stays visible — this wrapper is only
 * for standalone access, where a full SafeAreaView is correct.
 */
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/themehook';
import DormantLandListScreen from '@/components/dormantLand/DormantLandListScreen';

export default function DormantLandMarketplaceScreen() {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      <DormantLandListScreen />
    </SafeAreaView>
  );
}
