import type {CommandOptions} from '@shared/models/commands';

const LOCAL_HELM_COMMANDS = new Set(['template', 'lint', 'show', 'dependency', 'repo', 'search', 'pull', 'version']);

export function localHelmArgs(options: CommandOptions, executable = 'helm'): string[] {
  if (options.cmd !== executable || !LOCAL_HELM_COMMANDS.has(options.args[0])) {
    throw new Error('Only local Helm commands are supported in this build.');
  }

  return options.args.flatMap((argument, index) => {
    const value = argument.startsWith('"') && argument.endsWith('"') ? argument.slice(1, -1) : argument;
    if (
      (/^--(?:kube.*|kubernetes.*|context|server|validate|enable-dns|post-renderer.*)(?:=|$)/.test(value) &&
        !/^--kube-version(?:=|$)/.test(value)) ||
      (value.startsWith('--dry-run') && value !== '--dry-run' && value !== '--dry-run=client') ||
      (value === '--dry-run' && options.args[index + 1] === 'server')
    ) {
      throw new Error(`Cluster-aware Helm option is disabled: ${value}`);
    }
    return value === '-o json' ? ['-o', 'json'] : [value];
  });
}
