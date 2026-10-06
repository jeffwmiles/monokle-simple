import {disabledClusterOperations} from '@src/kindhandlers/common/disabledClusterOperations';


import navSectionNames from '@constants/navSectionNames';


import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const EventHandler: ResourceKindHandler = {
  kind: 'Event',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.CONFIGURATION, 'Events'],
  clusterApiVersion: 'events.k8s.io/v1',
  validationSchemaPrefix: 'io.k8s.api.events.v1beta1',
  isCustom: false,
  ...disabledClusterOperations,
  
  
  helpLink: 'https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/',
};

export default EventHandler;
