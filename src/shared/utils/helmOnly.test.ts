import {localHelmArgs} from './helmOnly';

describe('Helm-only command execution', () => {
  it('preserves local templating and unquotes paths for shell-free execution', () => {
    expect(localHelmArgs({commandId: 'test', cmd: 'helm', args: ['template', 'release', '"C:\\My Charts"']})).toEqual([
      'template',
      'release',
      'C:\\My Charts',
    ]);
  });

  it.each(['kubectl', 'powershell', 'helm template chart && kubectl get pods'])('rejects executable %s', cmd => {
    expect(() => localHelmArgs({commandId: 'test', cmd, args: ['template']})).toThrow();
  });

  it.each(['install', 'upgrade', 'list', 'get', 'uninstall', 'rollback', 'test'])('rejects Helm %s', command => {
    expect(() => localHelmArgs({commandId: 'test', cmd: 'helm', args: [command]})).toThrow();
  });

  it.each(['--validate', '--kube-context=prod', '--kubeconfig', '--dry-run=server', '--post-renderer', '--enable-dns'])(
    'rejects cluster-aware option %s',
    option => {
      expect(() => localHelmArgs({commandId: 'test', cmd: 'helm', args: ['template', 'chart', option]})).toThrow();
    }
  );

  it('allows simulated Kubernetes capabilities and client dry runs', () => {
    const args = ['template', 'chart', '--kube-version', '1.28.0', '--api-versions', 'example/v1', '--dry-run=client'];
    expect(localHelmArgs({commandId: 'test', cmd: 'helm', args})).toEqual(args);
  });

  it('rejects server dry runs with a separate value', () => {
    expect(() =>
      localHelmArgs({commandId: 'test', cmd: 'helm', args: ['template', 'chart', '--dry-run', 'server']})
    ).toThrow();
  });

  it('supports the configured Helm executable without interpreting shell syntax', () => {
    const executable = 'C:\\Program Files\\Helm\\helm.exe';
    const args = ['template', 'chart', '--set', 'name=$(kubectl get pods)'];
    expect(localHelmArgs({commandId: 'test', cmd: executable, args}, executable)).toEqual(args);
  });
});
