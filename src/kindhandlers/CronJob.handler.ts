import {disabledClusterOperations} from '@src/kindhandlers/common/disabledClusterOperations';


import navSectionNames from '@constants/navSectionNames';


import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const CronJobHandler: ResourceKindHandler = {
  kind: 'CronJob',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.WORKLOADS, 'CronJobs'],
  clusterApiVersion: 'batch/v1',
  validationSchemaPrefix: 'io.k8s.api.batch.v1',
  isCustom: false,
  ...disabledClusterOperations,
  
  
  helpLink: 'https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/',
};

export default CronJobHandler;
