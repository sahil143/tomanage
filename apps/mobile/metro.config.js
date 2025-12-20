// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Support for monorepo with workspace packages
config.watchFolders = [
  path.resolve(__dirname, 'packages'),
];

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, 'packages'),
];

module.exports = {
  ...config,
  resolver: {
    ...config.resolver,
    unstable_conditionNames: ['browser', 'require', 'react-native'],
  },
};
