import ElectronStore from 'electron-store';

import {electronStoreDefaults, electronStoreSchema} from '../constants/electronStore';
import type {ElectronStoreData} from '../constants/electronStore';

const electronStore = new ElectronStore<ElectronStoreData>({
  schema: electronStoreSchema,
  defaults: electronStoreDefaults,
});

export default electronStore;
