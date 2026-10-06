import {disabledClusterOperations} from './disabledClusterOperations';

describe('local Helm-only kind handlers', () => {
  it.each(Object.keys(disabledClusterOperations))('rejects %s instead of contacting a cluster', async operation => {
    const handler = disabledClusterOperations[operation as keyof typeof disabledClusterOperations];
    await expect(handler(undefined as never, undefined as never)).rejects.toThrow('local Helm-only');
  });
});
