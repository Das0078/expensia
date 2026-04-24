const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");
const path = require("node:path");
 
/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
config.resolver.extraNodeModules = {
    ...(config.resolver.extraNodeModules || {}),
    dequal: path.resolve(__dirname, "node_modules/dequal"),
    "@tanstack/query-core": path.resolve(__dirname, "node_modules/@tanstack/query-core"),
    "react-native": path.resolve(__dirname, "node_modules/react-native"),
};
 
module.exports = withNativewind(config);
