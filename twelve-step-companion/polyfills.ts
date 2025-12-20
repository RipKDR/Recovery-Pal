// Polyfills for environments where certain web APIs are missing (e.g., SSR during expo-router web builds)
// Ensure crypto/base64/localStorage shims load before any app code.

import 'react-native-get-random-values';
import 'expo-standard-web-crypto';
import { decode as atobPolyfill, encode as btoaPolyfill } from 'base-64';

if (
  typeof globalThis.localStorage === 'undefined' ||
  typeof (globalThis.localStorage as any)?.getItem !== 'function'
  // #region agent log
  // Note: instrumentation intentionally omitted here to keep polyfill tiny and safe.
  // #endregion
) {
  const memoryStore = new Map<string, string>();
  const localStorageShim = {
    getItem(key: string) {
      return memoryStore.has(key) ? memoryStore.get(key)! : null;
    },
    setItem(key: string, value: string) {
      memoryStore.set(key, String(value));
    },
    removeItem(key: string) {
      memoryStore.delete(key);
    },
    clear() {
      memoryStore.clear();
    },
    key(index: number) {
      return Array.from(memoryStore.keys())[index] ?? null;
    },
    get length() {
      return memoryStore.size;
    },
  };
  (globalThis as any).localStorage = localStorageShim;
}

// Base64 helpers for native/Hermes where atob/btoa are absent
if (typeof globalThis.atob !== 'function') {
  (globalThis as any).atob = atobPolyfill;
}
if (typeof globalThis.btoa !== 'function') {
  (globalThis as any).btoa = btoaPolyfill;
}

// Ensure crypto.subtle exists (expo-standard-web-crypto attaches it)
if (typeof globalThis.crypto === 'undefined' || !(globalThis.crypto as any).subtle) {
  // expo-standard-web-crypto should install a subtle polyfill; if it failed, surface a clear hint.
  (globalThis as any).crypto = globalThis.crypto ?? {};
}

