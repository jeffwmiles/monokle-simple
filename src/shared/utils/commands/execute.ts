import electron from 'electron';

import {ERROR_MSG_FALLBACK} from '@shared/constants/constants';
import {CommandOptions, CommandResult} from '@shared/models/commands';
import {isDefined} from '@shared/utils/filter';
import {localHelmArgs} from '@shared/utils/helmOnly';
import {ensureRendererThread} from '@shared/utils/thread';

import electronStore from '../electronStore';

export async function runCommandInMainThread(options: CommandOptions): Promise<CommandResult> {
  const executable = electronStore.get('appConfig.binaryPaths')?.helm || 'helm';
  const command = options.cmd === 'helm' ? {...options, cmd: executable} : options;
  localHelmArgs(command, executable);
  ensureRendererThread();

  return new Promise<CommandResult>(resolve => {
    const callback = (_event: unknown, result: CommandResult) => {
      if (result.commandId !== command.commandId) return;
      electron.ipcRenderer.off('command-result', callback);
      resolve(result);
    };
    electron.ipcRenderer.on('command-result', callback);
    electron.ipcRenderer.send('run-command', command);
  });
}

export async function execute(options: CommandOptions): Promise<string> {
  const result = await runCommandInMainThread(options);

  if (hasCommandFailed(result) || !isDefined(result.stdout)) {
    const msg = result.error ?? result.stderr ?? ERROR_MSG_FALLBACK;
    throw new Error(msg);
  }

  return result.stdout;
}

export function hasCommandFailed({exitCode, error, stderr}: CommandResult): boolean {
  return exitCode !== 0 || error !== undefined || stderr !== undefined;
}
