import type {KubeConfig} from '@kubernetes/client-node';

import {CLUSTER_DISABLED_MESSAGE} from '@shared/constants/capabilities';

export function createKubeClient(_path?: string, _context?: string, _proxy?: number): KubeConfig {
  throw new Error(CLUSTER_DISABLED_MESSAGE);
}
