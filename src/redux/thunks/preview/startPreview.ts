import {createAsyncThunk} from '@reduxjs/toolkit';

import {clearPreviewAndSelectionHistory} from '@redux/reducers/main';

import {AppDispatch} from '@shared/models/appDispatch';
import {AnyPreview} from '@shared/models/preview';

import {runPreviewConfiguration} from '../runPreviewConfiguration';
import {previewHelmValuesFile} from './previewHelmValuesFile';

export const startPreview = createAsyncThunk<void, AnyPreview, {dispatch: AppDispatch}>(
  'main/startPreview',
  async (preview, thunkAPI) => {
    if (preview.type !== 'helm' && preview.type !== 'helm-config') {
      throw new Error('Only Helm template previews are supported in this build.');
    }
    thunkAPI.dispatch(clearPreviewAndSelectionHistory());

    if (preview.type === 'helm') {
      await thunkAPI.dispatch(previewHelmValuesFile(preview.valuesFileId)).unwrap();
    }
    if (preview.type === 'helm-config') {
      await thunkAPI.dispatch(runPreviewConfiguration({helmConfigId: preview.configId})).unwrap();
    }
  }
);
