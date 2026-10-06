jest.mock('electron', () => ({app: {getAppPath: () => 'local-app', isPackaged: false}}));
jest.mock('electron-log', () => ({initialize: jest.fn()}));
jest.mock('electron-updater', () => ({
  AppImageUpdater: jest.fn(() => ({})),
  MacUpdater: jest.fn(() => ({})),
  NsisUpdater: jest.fn(() => ({})),
}));
jest.mock('./env.json', () => ({STARTUP_TEST: 'configured'}));
jest.mock('./app', () => ({
  environmentAtImport: {
    appPath: process.env.MONOKLE_APP_PATH,
    isPackaged: process.env.MONOKLE_APP_IS_PACKAGED,
    configured: process.env.STARTUP_TEST,
    loggerInitialized: jest.requireMock('electron-log').initialize.mock.calls.length,
  },
}));

test('sets resource environment and initializes logging before importing the app', async () => {
  const originalEnv = {...process.env};
  try {
    await import('./main');
    await Promise.resolve();
    expect(jest.requireMock('./app').environmentAtImport).toEqual({
      appPath: 'local-app', isPackaged: 'false', configured: 'configured', loggerInitialized: 1,
    });
  } finally {
    process.env = originalEnv;
  }
});

test('resolves development updater configuration from the app path in the ESM bundle', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'development';
    jest.isolateModules(() => {
      const updater = require('./app/autoUpdater').default;
      expect(updater.updateConfigPath).toBe(require('path').join('local-app', 'dev-app-update.yml'));
    });
  } finally {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  }
});
