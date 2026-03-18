import { getGraphQLService } from '@/services/api/graphqlService';
import { debugAuthState, getActiveAuthToken } from './authDebug';

/**
 * Test GraphQL authentication
 * This will help diagnose authentication issues with GraphQL
 */
export const testGraphQLAuth = async () => {
  console.log('\n=== 🧪 TESTING GRAPHQL AUTHENTICATION ===\n');

  // Step 1: Check auth state
  console.log('Step 1: Checking authentication state...');
  const authState = await debugAuthState();

  if (!authState?.hasRestToken && !authState?.hasGraphqlToken) {
    console.error('❌ No auth token found. User is not logged in.');
    return {
      success: false,
      error: 'No auth token found'
    };
  }

  // Step 2: Get active token
  console.log('\nStep 2: Getting active auth token...');
  const token = await getActiveAuthToken();
  console.log('Token found:', token ? '✅ YES' : '❌ NO');

  // Step 3: Test a simple GraphQL query (me/currentUser)
  console.log('\nStep 3: Testing GraphQL query with authentication...');

  try {
    const graphqlService = getGraphQLService();

    // Try to fetch current user (this should work if authentication is set up correctly)
    const query = `
      query Me {
        me {
          id
          email
          firstName
          lastName
        }
      }
    `;

    console.log('Executing test query...');
    const result = await graphqlService.query(query);

    console.log('✅ GraphQL authentication successful!');
    console.log('User data:', result);

    console.log('\n=== ✅ TEST PASSED ===\n');
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('❌ GraphQL authentication failed!');
    console.error('Error:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('Authentication required') || errorMessage.includes('Unauthorized')) {
      console.error('\n⚠️ DIAGNOSIS: The token is not being accepted by the GraphQL backend.');
      console.error('Possible causes:');
      console.error('1. The backend GraphQL server expects a different token format');
      console.error('2. The token has expired');
      console.error('3. The backend GraphQL authentication middleware is not configured to accept tokens from REST auth');
      console.error('4. The backend expects additional headers or different authentication method');
    }

    console.log('\n=== ❌ TEST FAILED ===\n');
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Run this test from your React component to diagnose authentication issues
 * Example:
 *
 * import { testGraphQLAuth } from '@/utils/testGraphQLAuth';
 *
 * // In your component
 * const handleTest = async () => {
 *   await testGraphQLAuth();
 * };
 */
