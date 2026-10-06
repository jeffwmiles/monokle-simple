import type {AppState} from '@shared/models/appState';
import type {ResourceIdentifier, ResourceMeta} from '@shared/models/k8sResource';

import initialState from '@redux/initialState';

import {removeResources} from './removeResources';

jest.mock('@shared/utils/electronStore', () => ({
  __esModule: true,
  default: {get: jest.fn((_key: string, fallback?: unknown) => fallback)},
}));
jest.mock('@constants/constants', () => ({DEFAULT_PANE_CONFIGURATION: {leftPane: 0.25, navPane: 0.25, editPane: 0, bottomPaneHeight: 250}}));
jest.mock('loglevel', () => ({error: jest.fn()}));
jest.mock('@redux/reducers/main/selectionReducers', () => ({
  clearSelectionReducer: (state: AppState) => {state.selection = undefined;},
}));
jest.mock('@redux/services/resource', () => ({
  deleteResource: (resource: ResourceMeta, maps: {resourceMetaMap: Record<string, ResourceMeta>; resourceContentMap: Record<string, unknown>}) => {
    delete maps.resourceMetaMap[resource.id];
    delete maps.resourceContentMap[resource.id];
  },
  removeResourceFromFile: (resource: ResourceMeta, _files: unknown, maps: {resourceMetaMap: Record<string, ResourceMeta>; resourceContentMap: Record<string, unknown>}) => {
    delete maps.resourceMetaMap[resource.id];
    delete maps.resourceContentMap[resource.id];
  },
  isResourceSelected: (identifier: ResourceIdentifier, selection: {resourceIdentifier: ResourceIdentifier}) =>
    identifier.id === selection.resourceIdentifier.id && identifier.storage === selection.resourceIdentifier.storage,
}));

function localResource(id: string): ResourceMeta<'local'> {
  return {id, storage: 'local', origin: {filePath: '/resources.yaml', fileOffset: 0}, name: id,
    kind: 'ConfigMap', apiVersion: 'v1', isClusterScoped: false};
}

describe('removeResources', () => {
  it('removes every local resource, skips missing IDs, and clears checked selection', async () => {
    const first = localResource('first');
    const second = localResource('second');
    const state = structuredClone(initialState.main);
    state.resourceMetaMapByStorage.local = {first, second};
    state.checkedResourceIdentifiers = [first, second];
    state.selection = {type: 'resource', resourceIdentifier: first};

    const action = await removeResources([{id: 'missing', storage: 'local'}, first, second])(
      jest.fn(), () => ({main: state}), undefined
    );
    expect(removeResources.fulfilled.match(action)).toBe(true);
    if (!removeResources.fulfilled.match(action)) throw new Error('Resource removal rejected');
    expect(action.payload.nextMainState.resourceMetaMapByStorage.local).toEqual({});
    expect(action.payload.nextMainState.checkedResourceIdentifiers).toEqual([]);
    expect(action.payload.nextMainState.selection).toBeUndefined();
    expect(state.resourceMetaMapByStorage.local).toEqual({first, second});
  });

  it('rejects a mixed cluster selection before mutating any local state', async () => {
    const first = localResource('first');
    const state = structuredClone(initialState.main);
    state.resourceMetaMapByStorage.local = {first};
    const action = await removeResources([first, {id: 'cluster', storage: 'cluster'}])(
      jest.fn(), () => ({main: state}), undefined
    );
    if (!removeResources.fulfilled.match(action)) throw new Error('Resource removal rejected');
    expect(action.payload.nextMainState).toBe(state);
    expect(action.payload.error?.message).toContain('local Helm-only');
    expect(state.resourceMetaMapByStorage.local).toEqual({first});
  });
});
