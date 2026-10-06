import {CLUSTER_DISABLED_MESSAGE} from '@shared/constants/capabilities';

import {handleIpc} from '../../utils/ipc';

const disabled = () => {
  throw new Error(CLUSTER_DISABLED_MESSAGE);
};

handleIpc('cluster:setup', disabled);
handleIpc('cluster:debug-proxy', disabled);
handleIpc('cluster:get-proxy-port', disabled);
handleIpc('kubeconfig:get', disabled);
handleIpc('kubeconfig:get:env', () => []);
handleIpc('kubeconfig:watch', disabled);
handleIpc('kubeconfig:watch:stop', () => undefined);
