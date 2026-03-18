import { Stack } from 'expo-router';
export default function FundLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[portfolioId]" />
      <Stack.Screen name="proposals" />
      <Stack.Screen name="invest" />
    </Stack>
  );
}
