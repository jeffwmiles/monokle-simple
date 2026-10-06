import {getMainProcessEnv, setMainProcessEnv, shellEnvSync} from './env';

jest.mock('execa', () => ({execaSync: jest.fn()}));
jest.mock('strip-ansi', () => (value: string) => value);

const {execaSync} = jest.requireMock<{execaSync: jest.Mock<{stdout: string}, unknown[]>}>('execa');
const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');

afterEach(() => {
  Object.defineProperty(process, 'platform', originalPlatform!);
  jest.clearAllMocks();
});

test('Windows uses process environment without executing a shell', () => {
  Object.defineProperty(process, 'platform', {configurable: true, value: 'win32'});
  expect(shellEnvSync()).toBe(process.env);
  expect(execaSync).not.toHaveBeenCalled();
});

test('the named synchronous API preserves environment values containing equals signs', () => {
  Object.defineProperty(process, 'platform', {configurable: true, value: 'darwin'});
  jest.mocked(execaSync).mockReturnValue({stdout: '_SHELL_ENV_DELIMITER_\nPATH=/bin\nVALUE=a=b\n_SHELL_ENV_DELIMITER_'});
  expect(shellEnvSync()).toEqual({PATH: '/bin', VALUE: 'a=b'});
  expect(execaSync).toHaveBeenCalledWith(expect.any(String), expect.any(Array), {
    extendEnv: true, env: {DISABLE_AUTO_UPDATE: 'true'},
  });
});

test('rejects malformed shell output', () => {
  Object.defineProperty(process, 'platform', {configurable: true, value: 'darwin'});
  jest.mocked(execaSync).mockReturnValue({stdout: 'unexpected prompt'});
  expect(() => shellEnvSync()).toThrow('missing its delimiter');
});

test('renderer environment updates replace the cached main environment', () => {
  const environment = {MONOKLE_APP_PATH: 'local-app', MONOKLE_APP_IS_PACKAGED: 'false'};
  setMainProcessEnv(environment);
  expect(getMainProcessEnv()).toBe(environment);
  expect(execaSync).not.toHaveBeenCalled();
});
