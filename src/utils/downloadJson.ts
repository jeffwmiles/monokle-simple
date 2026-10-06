import {ipcRenderer} from 'electron';

import fs from 'fs';
import log from 'loglevel';

export async function downloadJson(jsonData: object) {
  try {
    const filePath = await ipcRenderer.invoke('save-file', {
      acceptedFileExtensions: ['json'],
    });

    if (filePath) {
      log.info(`Saving JSON to ${filePath}`);
      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
    }
  } catch (error: any) {
    log.warn(error);
  }
}
