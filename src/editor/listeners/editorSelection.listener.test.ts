import {editorResourceIdentifierSelector} from '@redux/selectors/resourceSelectors';
import {getSelectedHelmValuesFilePath} from '@redux/selectors/helmGetters';
import {selectedFilePathSelector} from '@redux/selectors';

import {getEditor} from '@editor/editor.instance';
import {updateYamlLanguageService} from '@editor/yamlLanguageService';

import {editorSelectionListener} from './editorSelection.listener';

jest.mock('fs/promises', () => ({readFile: jest.fn().mockResolvedValue('greeting: local\n')}));
jest.mock('@redux/dashboard', () => ({setDashboardSelectedResourceId: {match: () => false}}));
jest.mock('@redux/reducers/main', () => ({selectFile: {match: () => false}, selectHelmValuesFile: {match: () => false}, selectResource: {match: () => false}}));
jest.mock('@redux/selectors', () => ({selectedFilePathSelector: jest.fn()}));
jest.mock('@redux/selectors/helmGetters', () => ({getSelectedHelmValuesFilePath: jest.fn()}));
jest.mock('@redux/selectors/resourceGetters', () => ({getResourceMetaFromState: jest.fn(), getResourceContentFromState: jest.fn()}));
jest.mock('@redux/selectors/resourceSelectors', () => ({editorResourceIdentifierSelector: jest.fn()}));
jest.mock('@redux/services/kustomize', () => ({isKustomizationPatch: () => false}));
jest.mock('@redux/services/resource', () => ({isSupportedResource: () => true}));
jest.mock('@redux/services/schema', () => ({getResourceSchema: jest.fn(), getSchemaForPath: () => undefined}));
jest.mock('@editor/editor.constants', () => ({MONACO_YAML_BASE_DIAGNOSTICS_OPTIONS: {validate: true}}));
jest.mock('@editor/editor.instance', () => ({getEditor: jest.fn(), getEditorType: () => 'local', recreateEditorModel: jest.fn()}));
jest.mock('@editor/editor.slice', () => ({editorMounted: {match: () => false}}));
jest.mock('@editor/yamlLanguageService', () => ({updateYamlLanguageService: jest.fn()}));
jest.mock('@editor/enhancers', () => ({applyResourceEnhancers: jest.fn()}));
jest.mock('@editor/enhancers/helm/templates', () => ({helmTemplateFileEnhancer: jest.fn()}));
jest.mock('@editor/enhancers/helm/valuesFile', () => ({helmValuesFileEnhancer: jest.fn()}));

describe('local file editing after a Helm preview', () => {
  const updateOptions = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getEditor).mockReturnValue({updateOptions} as unknown as ReturnType<typeof getEditor>);
    jest.mocked(editorResourceIdentifierSelector).mockReturnValue(undefined);
    jest.mocked(getSelectedHelmValuesFilePath).mockReturnValue(undefined);
  });

  async function selectFile(filePath: string) {
    jest.mocked(selectedFilePathSelector).mockReturnValue(filePath);
    const listen = jest.fn();
    editorSelectionListener(listen as unknown as Parameters<typeof editorSelectionListener>[0]);
    await listen.mock.calls[0][0].effect({}, {
      cancelActiveListeners: jest.fn(), delay: async () => {}, dispatch: jest.fn(),
      getState: () => ({main: {fileMap: {'<root>': {filePath: 'charts'}}}, config: {k8sVersion: '1.28.0'}}),
    });
  }

  it('restores editing and syntax validation for a local values file without a schema', async () => {
    await selectFile('/chart/values.yaml');
    expect(updateOptions).toHaveBeenCalledWith({readOnly: false});
    expect(updateYamlLanguageService).toHaveBeenCalledWith(expect.objectContaining({validate: true}));
  });

  it('does not validate raw Helm template expressions as plain YAML', async () => {
    await selectFile('/chart/templates/configmap.yaml');
    expect(updateOptions).toHaveBeenCalledWith({readOnly: false});
    expect(updateYamlLanguageService).toHaveBeenCalledWith(expect.objectContaining({validate: false}));
  });
});
