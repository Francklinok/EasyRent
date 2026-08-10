import { Stack } from 'expo-router';

export default function ClimateRiskLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[propertyId]" />
      <Stack.Screen name="add/[propertyId]" />
    </Stack>
  );
}
