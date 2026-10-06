import fs from 'fs';
import path from 'path';

import {getMainProcessEnv} from './env';
import {getStaticResourcePath, loadBinaryResource} from './resource';

jest.mock('./env', () => ({getMainProcessEnv: jest.fn()}));

describe('static resources across Electron build layouts', () => {
  const originalResourcesPath = Object.getOwnPropertyDescriptor(process, 'resourcesPath');

  beforeEach(() => {
    Object.defineProperty(process, 'resourcesPath', {configurable: true, value: path.resolve('electron-resources')});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    if (originalResourcesPath) Object.defineProperty(process, 'resourcesPath', originalResourcesPath);
    else Reflect.deleteProperty(process, 'resourcesPath');
  });

  it('loads local production resources from the actual application directory', () => {
    const appPath = path.resolve('local-app');
    jest.mocked(getMainProcessEnv).mockReturnValue({NODE_ENV: 'production', MONOKLE_APP_PATH: appPath, MONOKLE_APP_IS_PACKAGED: 'false'});
    expect(getStaticResourcePath('schemas/objectmetadata.json')).toBe(path.join(appPath, 'resources', 'schemas', 'objectmetadata.json'));
  });

  it('loads packaged resources from the Electron resource directory', () => {
    jest.mocked(getMainProcessEnv).mockReturnValue({NODE_ENV: 'production', MONOKLE_APP_IS_PACKAGED: 'true'});
    expect(getStaticResourcePath('schemas/objectmetadata.json')).toBe(path.resolve('electron-resources', 'resources', 'schemas', 'objectmetadata.json'));
  });

  it('preserves test fixture paths', () => {
    jest.mocked(getMainProcessEnv).mockReturnValue({NODE_ENV: 'test'});
    expect(getStaticResourcePath('schemas/objectmetadata.json')).toBe(path.join('resources', 'schemas', 'objectmetadata.json'));
  });

  it('returns an ArrayBuffer containing only the binary resource bytes', () => {
    jest.mocked(getMainProcessEnv).mockReturnValue({NODE_ENV: 'test'});
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    const readFile = jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from([99, 1, 2, 3, 99]).subarray(1, 4));

    const resource = loadBinaryResource('policies/test.wasm');

    expect(resource).toBeInstanceOf(ArrayBuffer);
    expect(Array.from(new Uint8Array(resource!))).toEqual([1, 2, 3]);
    expect(readFile).toHaveBeenCalledWith(path.join('resources', 'policies', 'test.wasm'));
  });

  it('returns undefined for a missing binary resource', () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    const readFile = jest.spyOn(fs, 'readFileSync');

    expect(loadBinaryResource('policies/missing.wasm')).toBeUndefined();
    expect(readFile).not.toHaveBeenCalled();
  });
});
