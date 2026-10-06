import {isK8sObject} from './k8s';
import {isPluginPackageJson, validatePluginPackageJson} from './plugin';
import {isGitRepository} from './repository';
import {isVanillaTemplate, validateVanillaTemplate} from './template';

test('validates Kubernetes object structure without rejecting extension fields', () => {
  expect(isK8sObject({apiVersion: 'v1', kind: 'ConfigMap', metadata: {name: 'test'}, data: {key: 'value'}})).toBe(true);
  expect(isK8sObject({apiVersion: 'v1', kind: 'ConfigMap', metadata: {}})).toBe(false);
});

test('validates repository metadata without executing Git', () => {
  expect(isGitRepository({owner: 'owner', name: 'repo', branch: 'main'})).toBe(true);
  expect(isGitRepository({owner: 'owner', name: 'repo'})).toBe(false);
});

test('keeps extra package fields while validating plugin modules', () => {
  const plugin = {
    name: 'templates', author: 'author', version: '1.0.0', repository: 'https://example.test/repo',
    license: 'MIT', monoklePlugin: {id: 'templates', modules: [{type: 'template', path: 'templates'}]},
  };
  expect(isPluginPackageJson(plugin)).toBe(true);
  expect(validatePluginPackageJson(plugin)).toEqual(plugin);
  expect(isPluginPackageJson({...plugin, monoklePlugin: {id: 'templates', modules: [{type: 'invalid'}]}})).toBe(false);
});

test('preserves extended template validators and optional fields', () => {
  const template = {
    name: 'template', id: 'template', author: 'author', version: '1.0.0', description: 'Template',
    type: 'vanilla', forms: [], manifests: [{filePath: 'manifest.yaml'}],
  };
  expect(isVanillaTemplate(template)).toBe(true);
  expect(validateVanillaTemplate(template)).toEqual(template);
  expect(isVanillaTemplate({...template, manifests: [{}]})).toBe(false);
});
