import {disabledClusterOperations} from '@src/kindhandlers/common/disabledClusterOperations';


import navSectionNames from '@constants/navSectionNames';


import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const ValidatingAdmissionPolicyHandler: ResourceKindHandler = {
  kind: 'ValidatingAdmissionPolicy',
  apiVersionMatcher: '**',
  isNamespaced: false,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.CONFIGURATION, 'ValidatingAdmissionPolicies'],
  clusterApiVersion: 'admissionregistration.k8s.io/v1beta1',
  validationSchemaPrefix: 'io.k8s.api.admissionregistration.v1beta1',
  isCustom: false,
  ...disabledClusterOperations,
  
  
  helpLink: 'https://kubernetes.io/docs/reference/access-authn-authz/validating-admission-policy/',
};

export default ValidatingAdmissionPolicyHandler;
