import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/themehook';
import { testGraphQLAuth } from '@/components/utils/testGraphQLAuth';
import { debugAuthState } from '@/components/utils/authDebug';

/**
 * Debug component to test GraphQL authentication
 * Add this to your settings page or any screen to test auth
 *
 * Usage:
 * import GraphQLAuthTest from '@/components/debug/GraphQLAuthTest';
 *
 * <GraphQLAuthTest />
 */
export default function GraphQLAuthTest() {
  const { theme } = useTheme();
  const [testing, setTesting] = useState(false);
  const [lastResult, setLastResult] = useState<string>('');

  const runTest = async () => {
    setTesting(true);
    setLastResult('Running tests...');

    try {
      // First check auth state
      console.log('\n=== Starting GraphQL Auth Test ===\n');
      await debugAuthState();

      // Then run the full test
      const result = await testGraphQLAuth();

      if (result.success) {
        setLastResult('✅ Authentication working!');
        Alert.alert(
          'Test Passed',
          'GraphQL authentication is working correctly!',
          [{ text: 'OK' }]
        );
      } else {
        setLastResult(`❌ Authentication failed: ${result.error}`);
        Alert.alert(
          'Test Failed',
          `GraphQL authentication failed:\n\n${result.error}\n\nCheck the console logs for details.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setLastResult(`❌ Test error: ${errorMsg}`);
      Alert.alert('Test Error', errorMsg);
    } finally {
      setTesting(false);
    }
  };

  return (
    <ThemedView style={{
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.outline + '30',
    }}>
      <ThemedText style={{
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
        color: theme.onSurface
      }}>
        🔐 GraphQL Auth Test
      </ThemedText>

      <ThemedText style={{
        fontSize: 13,
        color: theme.onSurface + 'CC',
        marginBottom: 12
      }}>
        Test if GraphQL authentication is working correctly
      </ThemedText>

      {lastResult ? (
        <ThemedView style={{
          padding: 12,
          borderRadius: 8,
          backgroundColor: lastResult.includes('✅')
            ? '#10b98140'
            : '#ef444440',
          marginBottom: 12
        }}>
          <ThemedText style={{
            fontSize: 12,
            fontFamily: 'monospace',
            color: theme.onSurface
          }}>
            {lastResult}
          </ThemedText>
        </ThemedView>
      ) : null}

      <TouchableOpacity
        onPress={runTest}
        disabled={testing}
        style={{
          backgroundColor: testing ? theme.surfaceVariant : theme.primary,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 8,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8
        }}
      >
        {testing && <ActivityIndicator size="small" color="white" />}
        <ThemedText style={{
          color: 'white',
          fontWeight: '600',
          fontSize: 14
        }}>
          {testing ? 'Testing...' : 'Run Test'}
        </ThemedText>
      </TouchableOpacity>

      <ThemedText style={{
        fontSize: 11,
        color: theme.onSurface + '80',
        marginTop: 8,
        textAlign: 'center'
      }}>
        Check the console for detailed logs
      </ThemedText>
    </ThemedView>
  );
}
