// Minimal polyfills for build/SSR contexts where web APIs may be missing.
// ES module variant used by the app/runtime (Metro/Expo bundler).

import 'react-native-get-random-values';
import 'expo-standard-web-crypto';
import { decode as atobPolyfill, encode as btoaPolyfill } from 'base-64';

// Force a predictable in-memory localStorage to avoid CLI-provided incomplete shims.
const memoryStore = new Map();
const localStorageShim = {
  getItem(key) {
    return memoryStore.has(key) ? memoryStore.get(key) : null;
  },
  setItem(key, value) {
    memoryStore.set(key, String(value));
  },
  removeItem(key) {
    memoryStore.delete(key);
  },
  clear() {
    memoryStore.clear();
  },
  key(index) {
    return Array.from(memoryStore.keys())[index] ?? null;
  },
  get length() {
    return memoryStore.size;
  },
};

globalThis.localStorage = localStorageShim;

if (typeof globalThis.atob !== 'function') {
  globalThis.atob = atobPolyfill;
}
if (typeof globalThis.btoa !== 'function') {
  globalThis.btoa = btoaPolyfill;
}

if (typeof globalThis.crypto === 'undefined' || !(globalThis.crypto || {}).subtle) {
  globalThis.crypto = globalThis.crypto || {};
}

