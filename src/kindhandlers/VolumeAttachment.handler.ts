import {disabledClusterOperations} from '@src/kindhandlers/common/disabledClusterOperations';


import navSectionNames from '@constants/navSectionNames';


import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const VolumeAttachmentHandler: ResourceKindHandler = {
  kind: 'VolumeAttachment',
  apiVersionMatcher: '**',
  isNamespaced: false,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.STORAGE, 'VolumeAttachments'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.storage.v1',
  isCustom: false,
  ...disabledClusterOperations,
  
  
  helpLink: 'https://kubernetes.io/docs/concepts/storage/volumes/',
};

export default VolumeAttachmentHandler;
