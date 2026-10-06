import {disabledClusterOperations} from '@src/kindhandlers/common/disabledClusterOperations';


import navSectionNames from '@constants/navSectionNames';


import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const PersistentVolumeHandler: ResourceKindHandler = {
  kind: 'PersistentVolume',
  apiVersionMatcher: '**',
  isNamespaced: false,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.STORAGE, 'PersistentVolumes'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.core.v1',
  isCustom: false,
  ...disabledClusterOperations,
  
  
  helpLink: 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/',
};

export default PersistentVolumeHandler;
