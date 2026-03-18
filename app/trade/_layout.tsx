import { Stack } from 'expo-router';
export default function TradeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[poolId]" />
      <Stack.Screen name="swap" />
      <Stack.Screen name="liquidity" />
    </Stack>
  );
}
