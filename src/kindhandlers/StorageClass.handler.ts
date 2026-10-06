import {disabledClusterOperations} from '@src/kindhandlers/common/disabledClusterOperations';


import navSectionNames from '@constants/navSectionNames';


import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const StorageClassHandler: ResourceKindHandler = {
  kind: 'StorageClass',
  apiVersionMatcher: '**',
  isNamespaced: false,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.STORAGE, 'StorageClasses'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.storage.v1',
  isCustom: false,
  ...disabledClusterOperations,
  
  
  helpLink: 'https://kubernetes.io/docs/concepts/storage/storage-classes/',
};

export default StorageClassHandler;
