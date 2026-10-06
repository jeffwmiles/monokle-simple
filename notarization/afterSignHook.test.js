jest.mock('fs', () => ({existsSync: jest.fn(() => false)}));
jest.mock('loglevel', () => ({info: jest.fn()}));
jest.mock('@electron/notarize', () => ({notarize: jest.fn()}));

const fs = require('fs');
const {notarize} = require('@electron/notarize');
const afterSign = require('./afterSignHook');

const params = {appOutDir: 'out', packager: {appInfo: {id: 'test.app', productFilename: 'Monokle'}}};
const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
const originalEnv = process.env;

beforeEach(() => {
  jest.clearAllMocks();
  fs.existsSync.mockReturnValue(true);
  Object.defineProperty(process, 'platform', {configurable: true, value: 'darwin'});
  process.env = {...originalEnv, NOTARIZE: '1', APPLE_TEAM_ID: 'team', APPLE_ID: 'user', APPLE_APP_SPECIFIC_PASSWORD: 'test'};
});

afterEach(() => {
  Object.defineProperty(process, 'platform', originalPlatform);
  process.env = originalEnv;
});

test('skips notarization on Windows', async () => {
  Object.defineProperty(process, 'platform', {configurable: true, value: 'win32'});
  await afterSign(params);
  expect(notarize).not.toHaveBeenCalled();
});

test('passes current notarytool options to the named API', async () => {
  await afterSign(params);
  expect(notarize).toHaveBeenCalledWith({
    teamId: 'team', appPath: require('path').join('out', 'Monokle.app'), appleId: 'user', appleIdPassword: 'test',
  });
});

test('rejects missing credentials before contacting Apple', async () => {
  delete process.env.APPLE_TEAM_ID;
  await expect(afterSign(params)).rejects.toThrow('Notarization requires');
  expect(notarize).not.toHaveBeenCalled();
});

test('propagates notarization failures to the packaging process', async () => {
  notarize.mockRejectedValueOnce(new Error('notarization failed'));
  await expect(afterSign(params)).rejects.toThrow('notarization failed');
});
