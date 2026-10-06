import type {ResourceKindHandler} from '@shared/models/resourceKindHandler';

async function rejectClusterOperation(): Promise<never> {
  throw new Error('Cluster operations are unavailable in this local Helm-only application');
}

export const disabledClusterOperations: Pick<
  ResourceKindHandler,
  'getResourceFromCluster' | 'listResourcesInCluster' | 'deleteResourceInCluster'
> = {
  getResourceFromCluster: rejectClusterOperation,
  listResourcesInCluster: rejectClusterOperation,
  deleteResourceInCluster: rejectClusterOperation,
};
