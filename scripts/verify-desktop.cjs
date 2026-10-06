const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {_electron} = require('playwright');

async function verify() {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'monokle-verification-'));
  const environment = {...process.env, NODE_ENV: 'production'};
  delete environment.ELECTRON_RUN_AS_NODE;
  let application;
  try {
    application = await _electron.launch({
      executablePath: path.resolve('node_modules/electron/dist/electron.exe'),
      args: ['.', `--user-data-dir=${temporary}`],
      env: environment,
      timeout: 30000,
    });
    await application.firstWindow();
    const page = application.windows().find(window => window.url().includes('index.html'));
    if (!page) throw new Error('The application window was not created.');
    await page.waitForLoadState('load');

    if (process.argv.includes('--probe-preload')) {
      const filename = path.join(temporary, 'probe.cjs');
      const directory = path.resolve('build/native');
      fs.writeFileSync(filename, `globalThis.__nativeProbe = {};\nfor (const name of ['execa', 'electron-store']) {\ntry { require(${JSON.stringify(directory)} + '/' + name + '.cjs'); globalThis.__nativeProbe[name] = {ok: true}; } catch(error) {globalThis.__nativeProbe[name] = {error: error.stack};}\n}`);
      await application.evaluate(({BrowserWindow}, filePath) => {
        const window = BrowserWindow.getAllWindows().find(window => window.webContents.getURL().includes('index.html'));
        window.webContents.session.registerPreloadScript({type: 'frame', filePath});
      }, filename);
      await page.reload();
      console.log('Native preload probe:', await page.evaluate(() => globalThis.__nativeProbe));
      return;
    }

    const errors = (await page.pageErrors()).map(error => error.stack || error.message);
    if (errors.length) throw new Error(errors.join('\n'));
    await page.waitForFunction(() => document.querySelector('#root')?.childElementCount > 0, {}, {timeout: 20000});
    console.log('Desktop GUI mounted without renderer exceptions.');
    console.log((await page.locator('#root').innerText()).slice(0, 500));

    if (process.argv.includes('--workflow')) {
      const charts = path.join(temporary, 'charts');
      fs.mkdirSync(charts);
      for (let index = 0; index < 20; index += 1) {
        const folder = path.join(charts, `chart-${String(index).padStart(2, '0')}`);
        fs.mkdirSync(path.join(folder, 'templates'), {recursive: true});
        fs.writeFileSync(path.join(folder, 'Chart.yaml'), `apiVersion: v2\nname: chart-${index}\nversion: 0.1.0\n`);
        fs.writeFileSync(path.join(folder, 'values.yaml'), 'greeting: local\n');
        fs.writeFileSync(path.join(folder, 'templates', 'configmap.yaml'), 'apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: {{ .Release.Name }}\ndata:\n  greeting: {{ .Values.greeting | quote }}\n');
      }
      await page.waitForFunction(() => typeof window.debug_state === 'function');
      const snapshot = () => page.evaluate(() => {
        const log = console.log;
        let state;
        console.log = value => {state = value;};
        try {window.debug_state();} finally {console.log = log;}
        return {
          charts: Object.keys(state.main.helmChartMap).length,
          values: Object.keys(state.main.helmValuesMap).length,
          preview: state.main.preview?.type,
          previewResources: Object.keys(state.main.resourceMetaMapByStorage.preview).length,
          git: Boolean(state.git.repo),
        };
      });
      const started = Date.now();
      await application.evaluate(({BrowserWindow}, folder) => {
        const window = BrowserWindow.getAllWindows().find(window => window.webContents.getURL().includes('index.html'));
        window.webContents.send('executed-from', {path: folder});
      }, charts);
      await page.waitForFunction(() => {
        const log = console.log;
        let state;
        console.log = value => {state = value;};
        try {window.debug_state();} finally {console.log = log;}
        return Object.keys(state.main.helmChartMap).length === 20;
      }, {}, {timeout: 30000});
      console.log('Imported 20 Helm charts in', Date.now() - started, 'ms:', await snapshot());
      const welcomeClose = page.locator('.welcome-modal .ant-modal-close');
      if (await welcomeClose.isVisible()) await welcomeClose.click();
      const values = page.getByText('values.yaml', {exact: true});
      await values.last().click();
      await page.waitForFunction(() => {
        const log = console.log;
        let state;
        console.log = value => {state = value;};
        try {window.debug_state();} finally {console.log = log;}
        return state.main.preview?.type === 'helm' && Object.keys(state.main.resourceMetaMapByStorage.preview).length > 0;
      }, {}, {timeout: 30000});
      console.log('GUI Helm dry-run:', await snapshot());
      const exitDryRun = page.locator('[aria-label="close"]').last();
      if (await exitDryRun.isVisible()) await exitDryRun.click();
      await application.evaluate(({BrowserWindow}, filePath) => {
        const window = BrowserWindow.getAllWindows().find(window => window.webContents.getURL().includes('index.html'));
        window.webContents.send('redux-dispatch', {type: 'main/selectFile', payload: {filePath}});
      }, path.join(path.sep, 'chart-00', 'values.yaml'));
      fs.mkdirSync('.toolchain/verification', {recursive: true});
      await page.screenshot({path: '.toolchain/verification/editor-layout.png', fullPage: true});
      console.log('Editor layout:', await page.locator('#monokle-monaco').evaluate(element => {
        const result = [];
        for (let node = element, depth = 0; node && depth < 6; node = node.parentElement, depth += 1) {
          const bounds = node.getBoundingClientRect();
          result.push({className: node.className, width: bounds.width, height: bounds.height, top: bounds.top});
        }
        return result;
      }));
      const editorSurface = page.locator('#monokle-monaco .view-lines').first();
      await editorSurface.click({position: {x: 20, y: 10}});
      await page.keyboard.press('Control+A');
      await page.keyboard.insertText('greeting: "\\q"\n');
      console.log('Edited temporary YAML:', (await editorSurface.innerText()).slice(0, 200));
      console.log('Language service errors:', (await page.consoleMessages()).filter(message => message.type() === 'error').map(message => message.text()).slice(-5));
      await page.locator('.squiggly-error').first().waitFor({state: 'attached', timeout: 20000});
      console.log('YAML worker reports syntax diagnostics in the editor.');
      fs.mkdirSync('.toolchain/verification', {recursive: true});
      await page.screenshot({path: '.toolchain/verification/modernized-desktop.png', fullPage: true});
      const workflowErrors = (await page.pageErrors()).map(error => error.stack || error.message);
      if (workflowErrors.length) throw new Error(workflowErrors.join('\n'));
    }
  } finally {
    if (application) await application.close();
    fs.rmSync(temporary, {recursive: true, force: true});
  }
}

verify().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
