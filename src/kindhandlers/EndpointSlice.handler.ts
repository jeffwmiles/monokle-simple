import {disabledClusterOperations} from '@src/kindhandlers/common/disabledClusterOperations';


import navSectionNames from '@constants/navSectionNames';


import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const EndpointSliceHandler: ResourceKindHandler = {
  kind: 'EndpointSlice',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.NETWORK, 'EndpointSlice'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.discovery.v1',
  isCustom: false,
  ...disabledClusterOperations,
  
  
  helpLink: 'https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#endpointslice-v1-discovery-k8s-io',
};

export default EndpointSliceHandler;
