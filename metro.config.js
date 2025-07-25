// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const crypto = require('crypto');

// Configuration de base d'Expo
const config = getDefaultConfig(__dirname);

// Configuration pour le support multi-plateforme
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.platformExtensions = ['web.js', 'web.ts', 'web.tsx', 'js', 'ts', 'tsx'];

// Alias pour exclure certains modules du web
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  // Remplacer react-native-maps par un mock sur web
  ...(process.env.EXPO_PLATFORM === 'web' && {
    'react-native-maps': require.resolve('./src/mocks/react-native-maps.web.js'),
  }),
};

// Configuration globale pour crypto (si nécessaire)
global.crypto = crypto;

// Export avec NativeWind
module.exports = withNativeWind(config, { input: './global.css' });