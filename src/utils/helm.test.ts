import {spawnSync} from 'child_process';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'fs';
import {tmpdir} from 'os';
import path from 'path';

import {localHelmArgs} from '@shared/utils/helmOnly';

import {buildHelmConfigCommand, createHelmTemplateCommand} from './helm';

jest.mock('@utils/cluster', () => ({getHelmClusterArgs: jest.fn(() => ['--kube-context=production'])}));

const chart = {id: 'chart', name: 'example', filePath: 'example/Chart.yaml', valueFileIds: [], templateIds: []};

describe('local Helm preview commands', () => {
  it('converts saved install previews to template without cluster arguments', () => {
    const command = buildHelmConfigCommand(chart, ['example/values.yaml'], 'install', {}, 'C:\\My Charts');
    expect(command.slice(0, 2)).toEqual(['helm', 'template']);
    expect(command).not.toContain('--dry-run');
    expect(command.some(argument => argument.startsWith('--kube-context'))).toBe(false);
    expect(command).toContain('-f');
  });

  it('rejects deployment requests', () => {
    expect(() => buildHelmConfigCommand(chart, [], 'install', {}, 'charts', true)).toThrow('deployment is disabled');
  });

  it('creates values-file previews without requiring a kubeconfig', () => {
    const command = createHelmTemplateCommand({
      chart: 'example',
      name: 'charts/example',
      values: 'charts/example/values.yaml',
    });
    expect(command.cmd).toBe('helm');
    expect(command.args[0]).toBe('template');
    expect(command.env).toBeUndefined();
  });
});

const helmAvailable = spawnSync('helm', ['version', '--short']).status === 0;

(helmAvailable ? it : it.skip)('renders a chart with values overrides and no kubeconfig', () => {
  const folder = mkdtempSync(path.join(tmpdir(), 'monokle-helm-'));
  try {
    mkdirSync(path.join(folder, 'templates'));
    writeFileSync(path.join(folder, 'Chart.yaml'), 'apiVersion: v2\nname: offline-preview\nversion: 0.1.0\n');
    writeFileSync(path.join(folder, 'values.yaml'), 'greeting: default\n');
    writeFileSync(path.join(folder, 'overrides.yaml'), 'greeting: rendered-locally\n');
    writeFileSync(
      path.join(folder, 'templates', 'configmap.yaml'),
      'apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: {{ .Release.Name }}\ndata:\n  greeting: {{ .Values.greeting | quote }}\n'
    );
    const command = createHelmTemplateCommand({
      chart: 'offline-preview',
      name: folder,
      values: path.join(folder, 'overrides.yaml'),
    });
    const result = spawnSync(command.cmd, localHelmArgs(command), {
      env: {...process.env, KUBECONFIG: path.join(folder, 'missing-kubeconfig')},
      encoding: 'utf8',
      timeout: 10000,
    });
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('kind: ConfigMap');
    expect(result.stdout).toContain('rendered-locally');
  } finally {
    rmSync(folder, {recursive: true, force: true});
  }
});
