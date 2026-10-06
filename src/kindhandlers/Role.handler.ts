import {disabledClusterOperations} from '@src/kindhandlers/common/disabledClusterOperations';


import navSectionNames from '@constants/navSectionNames';


import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const RoleHandler: ResourceKindHandler = {
  kind: 'Role',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.ACCESS_CONTROL, 'Roles'],
  clusterApiVersion: 'rbac.authorization.k8s.io/v1',
  validationSchemaPrefix: 'io.k8s.api.rbac.v1',
  isCustom: false,
  ...disabledClusterOperations,
  
  
  helpLink: 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-and-clusterrole',
};

export default RoleHandler;
