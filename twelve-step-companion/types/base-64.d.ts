declare module 'base-64' {
  export function encode(input: string): string;
  export function decode(input: string): string;

  const _default: {
    encode: typeof encode;
    decode: typeof decode;
  };

  export default _default;
}

