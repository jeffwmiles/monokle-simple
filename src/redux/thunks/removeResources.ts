import {createAsyncThunk, createNextState} from '@reduxjs/toolkit';

import log from 'loglevel';

import {clearSelectionReducer} from '@redux/reducers/main/selectionReducers';
import {deleteResource, isResourceSelected, removeResourceFromFile} from '@redux/services/resource';


import {AppState} from '@shared/models/appState';
import {ResourceIdentifier, isLocalResourceMeta} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';
import {isEqual} from '@shared/utils/isEqual';

export const removeResources = createAsyncThunk<
  {nextMainState: AppState; affectedResourceIdentifiers?: ResourceIdentifier[]; error?: Error},
  ResourceIdentifier[],
  {state: Pick<RootState, 'main'>}
>('main/removeResources', async (resourceIdentifiers, thunkAPI) => {
  const state = thunkAPI.getState();
  if (resourceIdentifiers.some(identifier => identifier.storage === 'cluster')) {
    const error = new Error('Cluster operations are unavailable in this local Helm-only application');
    log.error(error);
    return {nextMainState: state.main, affectedResourceIdentifiers: resourceIdentifiers, error};
  }

  const nextMainState = createNextState(state.main, mainState => {
    let deletedCheckedResourcesIdentifiers: ResourceIdentifier[] = [];

    for (const resourceIdentifier of resourceIdentifiers) {
      const resourceMeta = mainState.resourceMetaMapByStorage[resourceIdentifier.storage][resourceIdentifier.id];
      if (!resourceMeta) {
        continue;
      }

      if (mainState.checkedResourceIdentifiers.some(identifier => isEqual(identifier, resourceIdentifier))) {
        deletedCheckedResourcesIdentifiers.push(resourceIdentifier);
      }

      if (mainState.selection?.type === 'resource' && isResourceSelected(resourceIdentifier, mainState.selection)) {
        clearSelectionReducer(mainState);
      }

      if (resourceMeta.storage === 'transient') {
        deleteResource(resourceMeta, {
          resourceMetaMap: mainState.resourceMetaMapByStorage.transient,
          resourceContentMap: mainState.resourceContentMapByStorage.transient,
        });
        continue;
      }

      if (isLocalResourceMeta(resourceMeta)) {
        removeResourceFromFile(resourceMeta, mainState.fileMap, {
          resourceMetaMap: mainState.resourceMetaMapByStorage.local,
          resourceContentMap: mainState.resourceContentMapByStorage.local,
        });
        continue;
      }

    }

    mainState.checkedResourceIdentifiers = mainState.checkedResourceIdentifiers.filter(
      id => !deletedCheckedResourcesIdentifiers.find(identifier => isEqual(identifier, id))
    );
  });

  return {nextMainState, affectedResourceIdentifiers: resourceIdentifiers};
});
