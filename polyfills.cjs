// @ts-nocheck
// Minimal polyfills for build/SSR contexts where web APIs may be missing.
// CommonJS shim for Node consumers (e.g., Babel/Metro config time).

const isNodeRuntime =
  typeof process !== 'undefined' &&
  !!(process.versions && process.versions.node);

// Avoid importing react-native shims when running in plain Node (SSR/static export),
// because react-native's Flow syntax ("import typeof") is not parsed by Node.
if (!isNodeRuntime) {
  require('react-native-get-random-values');
  require('expo-standard-web-crypto');
} else {
  // Node ≥22 balks at the TS entrypoints shipped by expo-standard-web-crypto / expo-modules-core.
  // Skip that dependency during tooling execution and lean on Node's built-in webcrypto when present.
  if (typeof globalThis.crypto === 'undefined') {
    try {
      const nodeCrypto = require('crypto').webcrypto;
      if (nodeCrypto) {
        globalThis.crypto = nodeCrypto;
      }
    } catch {
      // leave crypto unset; a stub is added below
    }
  }
}
const { decode: atobPolyfill, encode: btoaPolyfill } = require('base-64');

// Force a predictable in-memory localStorage to avoid CLI-provided incomplete shims.
/** @type {Map<string, string>} */
const memoryStore = new Map();

/** @type {Storage} */
const localStorageShim = {
  /** @param {string} key */
  getItem(key) {
    return memoryStore.get(key) ?? null;
  },
  /** 
   * @param {string} key 
   * @param {string} value 
   */
  setItem(key, value) {
    memoryStore.set(key, String(value));
  },
  /** @param {string} key */
  removeItem(key) {
    memoryStore.delete(key);
  },
  clear() {
    memoryStore.clear();
  },
  /** @param {number} index */
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