import {CommandOptions, KubectlApplyArgs, KubectlEnv} from '@shared/models/commands';

export function createKubectlApplyCommand(
  {context, namespace, input}: KubectlApplyArgs,
  env?: KubectlEnv
): CommandOptions {
  const args = ['--context', JSON.stringify(context), 'apply', '-f', '-'];

  if (namespace) {
    args.unshift('--namespace', namespace);
  }

  return {
    commandId: globalThis.crypto.randomUUID(),
    cmd: 'kubectl',
    args,
    input,
    env,
  };
}
