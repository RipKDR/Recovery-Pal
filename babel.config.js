// Ensure critical polyfills (e.g., localStorage shim) are loaded before Metro parses the app.
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require(join(__dirname, 'polyfills.cjs'));

/** @param {import('@babel/core').ConfigAPI} api */
export default function (api) {
  api.cache.forever();
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      'babel-plugin-transform-import-meta',
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};

