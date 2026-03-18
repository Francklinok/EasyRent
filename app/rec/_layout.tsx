import { Stack } from 'expo-router';
export default function RECLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[vaultId]" />
      <Stack.Screen name="open" />
    </Stack>
  );
}
