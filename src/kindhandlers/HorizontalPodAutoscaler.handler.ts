import {disabledClusterOperations} from '@src/kindhandlers/common/disabledClusterOperations';


import navSectionNames from '@constants/navSectionNames';


import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const HorizontalPodAutoscalerHandler: ResourceKindHandler = {
  kind: 'HorizontalPodAutoscaler',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.CONFIGURATION, 'HPAs'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.autoscaling.v1',
  isCustom: false,
  ...disabledClusterOperations,
  
  
  helpLink: 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/',
};

export default HorizontalPodAutoscalerHandler;
