import { Stack } from 'expo-router';

export default function LandLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="titles/register" />
      <Stack.Screen name="titles/[tokenId]" />
      <Stack.Screen name="successions/[successionId]" />
      <Stack.Screen name="clt/eligibility" />
      <Stack.Screen name="clt/my-memberships" />
      <Stack.Screen name="clt/[membershipId]" />
      <Stack.Screen name="consolidation/create" />
      <Stack.Screen name="consolidation/my-projects" />
      <Stack.Screen name="consolidation/[projectId]" />
      <Stack.Screen name="informal/start" />
      <Stack.Screen name="informal/my-formalizations" />
      <Stack.Screen name="informal/[formalizationId]" />
    </Stack>
  );
}
