// const { getDefaultConfig } = require("expo/metro-config");
// const { withNativeWind } = require('nativewind/metro');

// const config = getDefaultConfig(__dirname)

// module.exports = withNativeWind(config, { input: './global.css' })

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const crypto = require('crypto');

const config = getDefaultConfig(__dirname)

module.exports = withNativeWind(config, { input: './global.css' })

global.crypto = crypto;

// // const { getDefaultConfig } = require("expo/metro-config");
// // const { withNativeWind } = require("nativewind/metro");

// // const config = getDefaultConfig(__dirname);

// // // Ajoute l'extension pour CSS (si tu utilises un fichier global.css)
// // config.resolver.assetExts.push("css");

// // module.exports = withNativeWind(config);



// const { getDefaultConfig } = require("expo/metro-config");
// const { withNativeWind } = require('nativewind/metro');

// const config = getDefaultConfig(__dirname)

// module.exports = withNativeWind(config, { input: './global.css' })