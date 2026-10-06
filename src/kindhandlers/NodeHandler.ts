import {disabledClusterOperations} from '@src/kindhandlers/common/disabledClusterOperations';


import log from 'loglevel';

import navSectionNames from '@constants/navSectionNames';


import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const NodeHandler: ResourceKindHandler = {
  kind: 'Node',
  apiVersionMatcher: '**',
  isNamespaced: false,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.CONFIGURATION, 'Nodes'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.core.v1',
  isCustom: false,
  ...disabledClusterOperations,
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  
  helpLink: 'https://kubernetes.io/docs/concepts/architecture/nodes/',
};

export default NodeHandler;
