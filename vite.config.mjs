import {builtinModules, createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import react from '@vitejs/plugin-react';
import {build as bundleNativeRuntime} from 'esbuild';
import {defineConfig} from 'vite';

const require = createRequire(import.meta.url);
const root = path.dirname(fileURLToPath(import.meta.url));
const paths = require('./tsconfig.paths.json').compilerOptions.paths;
const nativeModules = new Set([...builtinModules, ...builtinModules.map(name => `node:${name}`), 'electron', 'execa', 'electron-store']);
const nativeRuntimePackages = new Set(['execa', 'electron-store']);

function electronNativeModules() {
  let serveMode = false;
  return {
    name: 'electron-native-modules',
    enforce: 'pre',
    configResolved(configuration) {serveMode = configuration.command === 'serve';},
    async buildStart() {
      for (const name of nativeRuntimePackages) {
        const result = await bundleNativeRuntime({
          entryPoints: [name], bundle: true, platform: 'node', format: 'cjs', target: 'node22', write: false,
          external: ['electron'],
          define: {'import.meta.url': '__native_module_url', 'import.meta.dirname': '__dirname', 'import.meta.filename': '__filename'},
          banner: {js: 'const __native_module_url = require("node:url").pathToFileURL(__filename).href;'},
        });
        if (serveMode) {
          fs.mkdirSync(path.join(root, 'build', 'native'), {recursive: true});
          fs.writeFileSync(path.join(root, 'build', 'native', `${name}.cjs`), result.outputFiles[0].text);
        } else {
          this.emitFile({type: 'asset', fileName: `native/${name}.cjs`, source: result.outputFiles[0].text});
        }
      }
    },
    resolveId(source) {
      if (nativeModules.has(source)) return `\0electron-native:${source}.cjs`;
    },
    load(id) {
      if (!id.startsWith('\0electron-native:')) return;
      const source = id.slice('\0electron-native:'.length, -'.cjs'.length);
      if (nativeRuntimePackages.has(source)) {
        return `module.exports = globalThis.__MONOKLE_NATIVE_MODULES[${JSON.stringify(source)}];`;
      }
      return `module.exports = window.require(${JSON.stringify(source)});`;
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [electronNativeModules(), react()],
  resolve: {
    conditions: ['module', 'browser', 'development|production'],
    alias: [
      {find: 'monaco-worker-manager/worker', replacement: path.resolve(root, 'src/editor/yamlWorkerBootstrap.ts')},
      {find: 'monaco-worker-manager', replacement: path.resolve(root, 'src/editor/yamlWorkerManager.ts')},
      ...Object.entries(paths).map(([name, targets]) => ({
      find: name.replace(/\/\*$/, ''),
      replacement: path.resolve(root, targets[0].replace(/\/\*$/, '')),
    }))],
  },
  define: {
    'process.env': 'globalThis.process.env',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  server: {host: '127.0.0.1', port: Number(process.env.MONOKLE_DEV_PORT || 5173), strictPort: true},
  build: {outDir: 'build', target: 'es2022', sourcemap: false},
  css: {preprocessorOptions: {less: {javascriptEnabled: true}}},
});
