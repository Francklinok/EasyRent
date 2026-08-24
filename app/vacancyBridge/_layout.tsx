import { Stack } from 'expo-router';

export default function VacancyBridgeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="my-occupancies" />
      <Stack.Screen name="create" />
      <Stack.Screen name="request" />
      <Stack.Screen name="[occupancyId]" />
    </Stack>
  );
}
