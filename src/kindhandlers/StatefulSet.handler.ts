import {disabledClusterOperations} from '@src/kindhandlers/common/disabledClusterOperations';


import navSectionNames from '@constants/navSectionNames';


import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const StatefulSetHandler: ResourceKindHandler = {
  kind: 'StatefulSet',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.WORKLOADS, 'StatefulSets'],
  clusterApiVersion: 'apps/v1',
  validationSchemaPrefix: 'io.k8s.api.apps.v1',
  isCustom: false,
  ...disabledClusterOperations,
  
  
  helpLink: 'https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/',
};

export default StatefulSetHandler;
