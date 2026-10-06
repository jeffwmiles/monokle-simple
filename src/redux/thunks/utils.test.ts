import {KubeConfig} from '@kubernetes/client-node';

import {createNamespace, getNamespace, removeNamespaceFromCluster} from './utils';

jest.mock('@kubernetes/client-node', () => ({KubeConfig: class {makeApiClient = jest.fn();}}));
jest.mock('@redux/cluster/service/kube-client', () => ({createKubeClientWithSetup: jest.fn()}));
jest.mock('@src/kindhandlers', () => ({getResourceKindHandler: jest.fn()}));
jest.mock('@constants/constants', () => ({YAML_DOCUMENT_DELIMITER_NEW_LINE: '---\n'}));

describe('disabled namespace helpers', () => {
  it('rejects all namespace operations without creating an API client', async () => {
    const client = new KubeConfig();
    const makeApiClient = jest.spyOn(client, 'makeApiClient');
    await expect(getNamespace(client, 'default')).rejects.toThrow('local Helm-only');
    await expect(createNamespace(client, 'default')).rejects.toThrow('local Helm-only');
    await expect(removeNamespaceFromCluster('default', undefined, 'context')).rejects.toThrow('local Helm-only');
    expect(makeApiClient).not.toHaveBeenCalled();
  });
});
