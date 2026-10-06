import type {Schema} from 'electron-store';

import type {AppState} from '../models/appState';
import {Languages, TextSizes, Themes} from '../models/config';
import type {AppConfig, Settings} from '../models/config';
import type {TerminalSettingsType} from '../models/terminal';
import type {PaneConfiguration, UiState} from '../models/ui';
import type {ValidationState} from '../models/validation';

import {PREDEFINED_K8S_VERSION} from './k8s';

export type ElectronStoreData = {
  main: Partial<Pick<AppState, 'deviceID' | 'resourceRefsProcessingOptions'>> & {
    firstTimeRunTimestamp?: number;
    filtersPresets: AppState['filtersPresets'];
  };
  appConfig: Partial<Pick<AppConfig,
    'projects' | 'projectsRootPath' | 'favoriteTemplates' | 'disableEventTracking' | 'disableErrorReporting'
  >> & Pick<AppConfig,
    'scanExcludes' | 'fileIncludes' | 'loadLastProjectOnStartup' | 'fileExplorerSortOrder' |
    'k8sVersion' | 'kubeConfigContextsColors'
  > & {
    settings: Settings & {disableClusterValidation?: boolean};
    binaryPaths?: {helm?: string; kubectl?: string} | null;
    userApiKeys: Partial<AppConfig['userApiKeys']>;
    lastNamespaceLoaded: string;
    recentFolders?: string[];
    newVersion: AppConfig['newVersion']['code'];
    useKubectlProxy: boolean;
    hasDeletedDefaultTemplatesPlugin: boolean;
    lastSeenReleaseNotesVersion?: string;
    lastSessionVersion?: string;
    folderReadsMaxDepth?: number;
    kubeConfig?: string;
  };
  ui: {
    isSettingsOpen: boolean;
    isNewResourceWizardOpen: boolean;
    showOpenProjectPopup: boolean;
    showOpenProjectAlert?: boolean;
    leftMenu: Pick<UiState['leftMenu'], 'selection' | 'isActive'> & {
      bottomSelection: UiState['leftMenu']['bottomSelection'] | null;
    };
    rightMenu: {selection: UiState['rightMenu']['selection'] | ''; isActive: boolean};
    paneConfiguration: PaneConfiguration;
    zoomFactor: number;
  };
  kubeConfig: {
    namespaces: {namespaceName: string; clusterName: string}[];
    contextsWithRemovedNamespace: string[];
    currentContext?: string;
    proxyOptions?: {appendServerPath?: boolean};
  };
  terminal: {settings: TerminalSettingsType};
  validation?: {config?: ValidationState['config']};
  uiCoach?: {hasUserPerformedClickOnClusterIcon?: boolean};
};

export const electronStoreSchema: Schema<ElectronStoreData> = {
  main: {
    type: 'object',
    properties: {
      resourceRefsProcessingOptions: {
        type: 'object',
        properties: {
          shouldIgnoreOptionalUnsatisfiedRefs: {
            type: 'boolean',
          },
        },
      },
      deviceID: {
        type: 'string',
      },
      firstTimeRunTimestamp: {
        type: 'number',
      },
      filtersPresets: {
        type: 'object',
      },
    },
  },
  appConfig: {
    type: 'object',
    properties: {
      binaryPaths: {
        type: ['object', 'null'],
        properties: {
          kubectl: {
            type: 'string',
          },
          helm: {
            type: 'string',
          },
        },
      },
      userApiKeys: {
        type: 'object',
        properties: {
          OPENAI: {
            type: 'string',
          },
        },
      },
      kubeConfigContextsColors: {
        type: 'object',
      },
      lastNamespaceLoaded: {
        type: 'string',
      },
      hasDeletedDefaultTemplatesPlugin: {
        type: 'boolean',
      },
      lastSeenReleaseNotesVersion: {
        type: 'string',
      },
      lastSessionVersion: {
        type: 'string',
      },
      useKubectlProxy: {
        type: 'boolean',
      },
      loadLastProjectOnStartup: {
        type: 'boolean',
      },
      fileExplorerSortOrder: {
        type: 'string',
      },
      scanExcludes: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      fileIncludes: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      settings: {
        type: 'object',
        properties: {
          theme: {
            type: 'string',
          },
          textSize: {
            type: 'string',
          },
          language: {
            type: 'string',
          },
          helmPreviewMode: {
            type: 'string',
          },
          kustomizeCommand: {
            type: 'string',
          },
          hideExcludedFilesInFileExplorer: {
            type: 'boolean',
          },
          hideUnsupportedFilesInFileExplorer: {
            type: 'boolean',
          },
          enableHelmWithKustomize: {
            type: 'boolean',
          },
          createDefaultObjects: {
            type: 'boolean',
          },
          setDefaultPrimitiveValues: {
            type: 'boolean',
          },
          allowEditInClusterMode: {
            type: 'boolean',
          },
          disableClusterValidation: {
            type: 'boolean',
          },
        },
      },
      recentFolders: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      newVersion: {
        type: 'number',
      },
      k8sVersion: {
        type: 'string',
      },
      projects: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            rootFolder: {
              type: 'string',
            },
            k8sVersion: {
              type: 'string',
            },
            lastOpened: {
              type: 'string',
            },
          },
        },
      },
      projectsRootFolder: {
        type: 'string',
      },
      favoriteTemplates: {
        type: 'array',
      },
      disableEventTracking: {
        type: 'boolean',
      },
      disableErrorReporting: {
        type: 'boolean',
      },
    },
  },
  ui: {
    type: 'object',
    properties: {
      isSettingsOpen: {
        type: 'boolean',
      },
      isNotificationsOpen: {
        type: 'boolean',
      },
      isNewResourceWizardOpen: {
        type: 'boolean',
      },
      isFolderLoading: {
        type: 'boolean',
      },
      showOpenProjectPopup: {
        type: 'boolean',
      },
      leftMenu: {
        type: 'object',
        properties: {
          bottomSelection: {
            type: ['string', 'null'],
          },
          selection: {
            type: 'string',
          },
          isActive: {
            type: 'boolean',
          },
        },
      },
      rightMenu: {
        type: 'object',
        properties: {
          selection: {
            type: 'string',
          },
          isActive: {
            type: 'boolean',
          },
        },
      },
      paneConfiguration: {
        type: 'object',
        properties: {
          leftPane: {type: 'number'},
          navPane: {type: 'number'},
          editPane: {type: 'number'},
          bottomPaneHeight: {type: 'number'},
          leftWidth: {
            type: 'number',
          },
          navWidth: {
            type: 'number',
          },
          editWidth: {
            type: 'number',
          },
          rightWidth: {
            type: 'number',
          },
        },
      },
      zoomFactor: {
        type: 'number',
      },
    },
  },
  validation: {
    type: 'object',
    properties: {
      config: {
        type: 'object',
      },
      rules: {
        type: 'object',
      },
      settings: {
        type: 'object',
      },
    },
  },
  uiCoach: {
    type: 'object',
    properties: {
      hasUserPerformedClickOnClusterIcon: {
        type: 'boolean',
      },
    },
  },
  kubeConfig: {
    type: 'object',
    properties: {
      namespaces: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            namespaceName: {
              type: 'string',
            },
            clusterName: {
              type: 'string',
            },
          },
        },
      },
      contextsWithRemovedNamespace: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      proxyOptions: {
        type: 'object',
        properties: {
          appendServerPath: {
            type: 'boolean',
            default: true,
          },
        },
      },
    },
  },
  terminal: {
    type: 'object',
    properties: {
      settings: {
        type: 'object',
        properties: {
          defaultShell: {
            type: 'string',
          },
          fontSize: {
            type: 'number',
          },
        },
      },
    },
  },
};

export const electronStoreDefaults: ElectronStoreData = {
  main: {
    filtersPresets: {},
  },
  appConfig: {
    userApiKeys: {},
    kubeConfigContextsColors: {},
    lastNamespaceLoaded: 'default',
    useKubectlProxy: false,
    loadLastProjectOnStartup: false,
    fileExplorerSortOrder: 'folders',
    scanExcludes: ['**/node_modules', '**/.git', '**/pkg/mod/**', '**/.kube', '**/*.swp'],
    fileIncludes: ['*.yaml', '*.yml'],
    settings: {
      theme: Themes.Dark,
      textSize: TextSizes.Medium,
      language: Languages.English,
      helmPreviewMode: 'template',
      createDefaultObjects: false,
      setDefaultPrimitiveValues: true,
      allowEditInClusterMode: true,
      disableClusterValidation: false,
      enableHelmWithKustomize: true,
    },
    recentFolders: [],
    newVersion: 0,
    k8sVersion: PREDEFINED_K8S_VERSION,
    hasDeletedDefaultTemplatesPlugin: false,
  },
  ui: {
    isSettingsOpen: false,
    isNewResourceWizardOpen: false,
    showOpenProjectPopup: true,
    leftMenu: {
      bottomSelection: null,
      selection: 'explorer',
      isActive: true,
    },
    rightMenu: {
      selection: '',
      isActive: false,
    },
    paneConfiguration: {
      leftPane: 0.25,
      navPane: 0.25,
      editPane: 0,
      bottomPaneHeight: 250,
    },
    zoomFactor: 1,
  },
  kubeConfig: {
    namespaces: [],
    contextsWithRemovedNamespace: [],
  },
  terminal: {
    settings: {
      defaultShell: '',
      fontSize: 14,
    },
  },
};
