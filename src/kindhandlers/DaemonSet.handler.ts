import {disabledClusterOperations} from '@src/kindhandlers/common/disabledClusterOperations';


import navSectionNames from '@constants/navSectionNames';


import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const DaemonSetHandler: ResourceKindHandler = {
  kind: 'DaemonSet',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.WORKLOADS, 'DaemonSets'],
  clusterApiVersion: 'apps/v1',
  validationSchemaPrefix: 'io.k8s.api.apps.v1',
  isCustom: false,
  ...disabledClusterOperations,
  
  
  helpLink: 'https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/',
};

export default DaemonSetHandler;
