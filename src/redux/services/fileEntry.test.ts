import fs from 'fs';
import {tmpdir} from 'os';
import path from 'path';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {FileMapType} from '@shared/models/appState';

import {readFiles} from './fileEntry';

jest.mock('@constants/constants', () => ({
  HELM_CHART_ENTRY_FILE: 'Chart.yaml',
  SUPPORTED_TEXT_EXTENSIONS: ['.yaml'],
  ADDITIONAL_SUPPORTED_FILES: [],
}));
jest.mock('@redux/reducers/main/selectionReducers', () => ({}));
jest.mock('@redux/services/selection', () => ({}));
jest.mock('@utils/git', () => ({filterGitFolder: (files: string[]) => files.filter(file => file !== '.git')}));
jest.mock('@utils/yaml', () => ({}));
jest.mock('@monokle/validation', () => ({}));
jest.mock('./resource', () => ({}));
jest.mock('@utils/files', () => {
  const filesystem = jest.requireActual('fs');
  return {
    getFileStats: (filePath: string) => filesystem.statSync(filePath),
    getFileTimestamp: (filePath: string) => filesystem.statSync(filePath).mtimeMs,
  };
});

describe('folder import metadata reuse', () => {
  let folder: string;

  beforeEach(() => {
    folder = fs.mkdtempSync(path.join(tmpdir(), 'monokle-import-'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fs.rmSync(folder, {recursive: true, force: true});
  });

  function importFolder() {
    const fileMap: FileMapType = {};
    const state = {
      projectConfig: {folderReadsMaxDepth: 10},
      fileMap,
      resourceMetaMap: {},
      resourceContentMap: {},
      helmChartMap: {},
      helmValuesMap: {},
      helmTemplatesMap: {},
    };
    readFiles(folder, state);
    return state;
  }

  it('uses one stat per ordinary file while preserving timestamps', () => {
    fs.writeFileSync(path.join(folder, 'first.txt'), 'first');
    fs.writeFileSync(path.join(folder, 'second.txt'), 'second');
    const stat = jest.spyOn(fs, 'statSync');
    const state = importFolder();
    expect(stat).toHaveBeenCalledTimes(2);
    const files = Object.values(state.fileMap).filter(entry => entry.name !== ROOT_FILE_ENTRY);
    expect(files).toHaveLength(2);
    expect(files.every(entry => typeof entry.timestamp === 'number')).toBe(true);
  });

  it('uses one stat per directory or file when importing many Helm charts', () => {
    for (let index = 0; index < 100; index += 1) {
      const chartFolder = path.join(folder, `chart-${index}`);
      fs.mkdirSync(chartFolder);
      fs.writeFileSync(path.join(chartFolder, 'Chart.yaml'), `apiVersion: v2\nname: chart-${index}\nversion: 0.1.0\n`);
      fs.writeFileSync(path.join(chartFolder, 'notes.txt'), 'notes');
    }
    const stat = jest.spyOn(fs, 'statSync');
    const state = importFolder();
    expect(Object.keys(state.helmChartMap)).toHaveLength(100);
    expect(Object.keys(state.fileMap)).toHaveLength(301);
    expect(stat).toHaveBeenCalledTimes(300);
  });
});
