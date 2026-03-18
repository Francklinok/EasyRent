import { Stack } from 'expo-router';

export default function InvestLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      {/* SPV — Tokenisation throught society */}
      <Stack.Screen name="spv/index" />
      <Stack.Screen name="spv/[spvId]" />
      <Stack.Screen name="spv/subscribe" />
      <Stack.Screen name="spv/portfolio" />
      {/* RST — Revenue Share Token */}
      <Stack.Screen name="rst/index" />
      <Stack.Screen name="rst/[projectId]" />
      <Stack.Screen name="rst/subscribe" />
      <Stack.Screen name="rst/portfolio" />
    </Stack>
  );
}
