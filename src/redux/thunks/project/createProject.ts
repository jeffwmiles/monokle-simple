import {createAsyncThunk} from '@reduxjs/toolkit';

import {createProject} from '@redux/appConfig';

import {Project} from '@shared/models/config';
import {trackEvent} from '@shared/utils/telemetry';

import {setOpenProject} from './openProject';

export const setCreateProject = createAsyncThunk('config/setCreateProject', async (project: Project, thunkAPI: any) => {
  thunkAPI.dispatch(createProject({...project, isGitRepo: false}));
  thunkAPI.dispatch(setOpenProject(project.rootFolder));
  trackEvent('app_start/create_project', {from: 'folder'});
});
