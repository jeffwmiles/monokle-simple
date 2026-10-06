import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';
import type {Action} from '@reduxjs/toolkit';

import initialState from '@redux/initialState';

import {AlertEnum, AlertState, AlertType} from '@shared/models/alert';

export function hasAlertPayload(action: Action): action is PayloadAction<{alert: AlertType}> {
  if (!('payload' in action) || !action.payload || typeof action.payload !== 'object') return false;
  if (!('alert' in action.payload) || !action.payload.alert || typeof action.payload.alert !== 'object') return false;
  const alert = action.payload.alert;
  return 'title' in alert && typeof alert.title === 'string' &&
    'message' in alert && typeof alert.message === 'string' &&
    'type' in alert && [AlertEnum.Success, AlertEnum.Info, AlertEnum.Warning, AlertEnum.Error].some(type => type === alert.type);
}

export const alertSlice = createSlice({
  name: 'alert',
  initialState: initialState.alert,
  reducers: {
    setAlert: (state: Draft<AlertState>, action: PayloadAction<AlertType>) => {
      state.alert = action.payload;
    },
    clearAlert: (state: Draft<AlertState>) => {
      state.alert = undefined;
    },
  },
  extraReducers: builder => {
    builder.addMatcher(
      hasAlertPayload,
      (state, action) => {
        if (action.payload?.alert) {
          state.alert = action.payload.alert;
        }
      }
    );
  },
});

export const {setAlert, clearAlert} = alertSlice.actions;
export default alertSlice.reducer;
