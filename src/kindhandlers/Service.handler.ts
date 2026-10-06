import {disabledClusterOperations} from '@src/kindhandlers/common/disabledClusterOperations';


import navSectionNames from '@constants/navSectionNames';


import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const ServiceHandler: ResourceKindHandler = {
  kind: 'Service',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.NETWORK, 'Services'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.core.v1',
  isCustom: false,
  ...disabledClusterOperations,
  
  
  helpLink: 'https://kubernetes.io/docs/concepts/services-networking/service/',
};

export default ServiceHandler;
