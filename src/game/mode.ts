declare global {
  var __ENGLISH_ONLY__: boolean | undefined;
}

export const ENGLISH_ONLY = globalThis.__ENGLISH_ONLY__ === true ||
  (typeof process !== 'undefined' && process.env.ENGLISH_ONLY === '1');
