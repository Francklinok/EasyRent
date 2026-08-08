import { Stack } from 'expo-router';

export default function DormantLandLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="my-listings" />
      <Stack.Screen name="listings/create" />
      <Stack.Screen name="listings/[listingId]" />
      <Stack.Screen name="bookings/[bookingId]" />
    </Stack>
  );
}
