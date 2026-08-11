import { Stack } from 'expo-router';

export default function RentalGuaranteeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="subscribe" />
      <Stack.Screen name="[guaranteeId]" />
    </Stack>
  );
}
