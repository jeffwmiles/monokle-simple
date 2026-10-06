import electron from 'electron';

import {CLUSTER_DISABLED_MESSAGE} from '@shared/constants/capabilities';

import {execute, runCommandInMainThread} from './commands/execute';
import {createKubeClient} from './kubeclient';

jest.mock('electron', () => ({ipcRenderer: {on: jest.fn(), off: jest.fn(), send: jest.fn()}}));
jest.mock('./electronStore', () => ({get: jest.fn(() => ({helm: 'local-helm'}))}));
jest.mock('./thread', () => ({ensureRendererThread: jest.fn()}));

beforeEach(() => jest.clearAllMocks());

test('cluster access always fails before loading a kubeconfig or SDK', () => {
  expect(() => createKubeClient()).toThrow(CLUSTER_DISABLED_MESSAGE);
  expect(() => createKubeClient('config', 'context', 8001)).toThrow(CLUSTER_DISABLED_MESSAGE);
});

test('cluster commands reject before contacting command IPC', async () => {
  const options = {commandId: 'disabled', cmd: 'kubectl', args: []};
  await expect(runCommandInMainThread(options)).rejects.toThrow('Only local Helm commands');
  await expect(execute(options)).rejects.toThrow('Only local Helm commands');
  expect(electron.ipcRenderer.send).not.toHaveBeenCalled();
});

test('local Helm IPC uses the configured executable without mutating the caller', async () => {
  const options = {commandId: 'local', cmd: 'helm', args: ['template', 'chart']};
  const result = {commandId: 'local', exitCode: 0, signal: null, stdout: 'manifest'};
  jest.mocked(electron.ipcRenderer.send).mockImplementation(() => {
    const callback = jest.mocked(electron.ipcRenderer.on).mock.calls[0][1];
    callback({} as Electron.IpcRendererEvent, result);
  });
  await expect(runCommandInMainThread(options)).resolves.toEqual(result);
  expect(electron.ipcRenderer.send).toHaveBeenCalledWith('run-command', {...options, cmd: 'local-helm'});
  expect(electron.ipcRenderer.off).toHaveBeenCalled();
  expect(options.cmd).toBe('helm');
});
