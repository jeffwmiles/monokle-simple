/* eslint-disable import/first */
/* eslint-disable import/order */
import {app} from 'electron';
import log from 'electron-log';

import additionalEnvironmentVariables from './env.json';

Object.entries(additionalEnvironmentVariables).forEach(([key, value]) => {
  if (typeof value !== 'string') {
    throw new Error(`Environment variable ${key} must be a string.`);
  }
  process.env[key] = value;
});

process.env.MONOKLE_APP_PATH = app.getAppPath();
process.env.MONOKLE_APP_IS_PACKAGED = String(app.isPackaged);
log.initialize();

import('./app').catch(error => {
  console.error(error);
  process.exitCode = 1;
});
