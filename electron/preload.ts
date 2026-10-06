import path from 'node:path';

const modules = Object.freeze({
  execa: require(path.join(__dirname, '..', 'native', 'execa.cjs')),
  'electron-store': require(path.join(__dirname, '..', 'native', 'electron-store.cjs')),
});

Object.defineProperty(globalThis, '__MONOKLE_NATIVE_MODULES', {value: modules});
