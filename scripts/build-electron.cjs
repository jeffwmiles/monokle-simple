const fs = require('node:fs');
const {spawn} = require('node:child_process');
const {builtinModules, createRequire} = require('node:module');
const path = require('node:path');

const esbuild = require('esbuild');

const nativeModules = new Set([...builtinModules, ...builtinModules.map(name => `node:${name}`), 'electron']);
const commonjsInterop = {
  name: 'external-commonjs-interop',
  setup(build) {
    build.onResolve({filter: /^[^./]/}, args => {
      if (args.namespace === 'external-commonjs') return {path: args.path, external: true};
      if (nativeModules.has(args.path)) return;
      let resolved;
      try {
        resolved = createRequire(path.join(args.resolveDir || process.cwd(), 'package.json')).resolve(args.path);
      } catch {
        return;
      }
      if (resolved.endsWith('.mjs')) return;
      if (!resolved.endsWith('.cjs')) {
        let directory = path.dirname(resolved);
        while (directory !== path.dirname(directory)) {
          const manifestPath = path.join(directory, 'package.json');
          if (fs.existsSync(manifestPath)) {
            if (JSON.parse(fs.readFileSync(manifestPath, 'utf8')).type === 'module') return;
            break;
          }
          directory = path.dirname(directory);
        }
      }
      return {path: args.path, namespace: 'external-commonjs'};
    });
    build.onLoad({filter: /.*/, namespace: 'external-commonjs'}, args => ({
      contents: `module.exports = require(${JSON.stringify(args.path)});`,
      loader: 'js',
    }));
    build.onResolve({filter: /.*/, namespace: 'external-commonjs'}, args => ({path: args.path, external: true}));
  },
};

const watch = process.argv.includes('--watch');
const run = process.argv.includes('--run');
let electronProcess;

process.on('exit', () => electronProcess?.kill());

const restartElectron = {
  name: 'restart-electron',
  setup(build) {
    build.onEnd(async result => {
      if (!run || result.errors.length) return;
      const waitOn = require('wait-on');
      await waitOn({resources: [`tcp:127.0.0.1:${process.env.MONOKLE_DEV_PORT || 5173}`], timeout:30000});
      electronProcess?.kill();
      const environment = {...process.env, NODE_ENV: 'development'};
      delete environment.ELECTRON_RUN_AS_NODE;
      const args = process.argv.includes('--debug') ? ['--remote-debugging-port=9223', '.'] : ['.'];
      electronProcess = spawn(require('electron'), args, {stdio: 'inherit', env: environment});
    });
  },
};
const options = {
  entryPoints: ['electron/main.ts'],
  outfile: 'build/electron/main.mjs',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  packages: 'external',
  plugins: [commonjsInterop, restartElectron],
  sourcemap: true,
  tsconfig: 'electron/tsconfig.json',
  banner: {js: "import {createRequire as createNodeRequire} from 'node:module'; import {fileURLToPath as nodeFileURLToPath} from 'node:url'; import {dirname as nodeDirname} from 'node:path'; const require = createNodeRequire(import.meta.url); const __dirname = nodeDirname(nodeFileURLToPath(import.meta.url));"},
};

async function build() {
  await esbuild.build({
    entryPoints: ['electron/preload.ts'], outfile: 'build/electron/preload.cjs', bundle: true,
    platform: 'node', format: 'cjs', target: 'node22', external: ['electron'],
  });
  if (watch) {
    const context = await esbuild.context(options);
    await context.watch();
  } else {
    await esbuild.build(options);
  }
}

build().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
