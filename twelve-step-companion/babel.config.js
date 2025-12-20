// Ensure critical polyfills (e.g., localStorage shim) are loaded before Metro parses the app.
const path = require('path');
require(path.join(__dirname, 'polyfills.cjs'));

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};

