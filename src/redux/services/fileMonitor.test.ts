import {watch} from 'chokidar';

import {monitorRootFolder} from './fileMonitor';

const mockWatcher = {on: jest.fn().mockReturnThis(), close: jest.fn()};

jest.mock('chokidar', () => ({watch: jest.fn(() => mockWatcher)}));
jest.mock('@redux/reducers/main', () => ({
  multiplePathsRemoved: (paths: string[]) => ({type: 'removed', payload: paths}),
}));
jest.mock('@redux/thunks/multiplePathsAdded', () => ({
  multiplePathsAdded: (paths: string[]) => ({type: 'added', payload: paths}),
}));
jest.mock('@redux/thunks/multiplePathsChanged', () => ({
  multiplePathsChanged: (paths: string[]) => ({type: 'changed', payload: paths}),
}));
jest.mock('@shared/utils/watch', () => ({debounceWithPreviousArgs: (callback: Function) => callback}));

describe('Git-free local folder watching', () => {
  const dispatch = jest.fn();
  const getState = jest.fn(() => {
    throw new Error('File monitoring must not query Git state');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    monitorRootFolder('charts', {dispatch, getState});
  });

  it('ignores Git metadata on Windows and Unix without ignoring chart files', () => {
    const ignored = jest.mocked(watch).mock.calls[0][1]?.ignored as RegExp;
    expect(ignored.test('C:\\charts\\.git\\objects\\file')).toBe(true);
    expect(ignored.test('/charts/.git/HEAD')).toBe(true);
    expect(ignored.test('/charts/.git')).toBe(true);
    expect(ignored.test('/charts/.gitignore')).toBe(false);
    expect(ignored.test('/charts/chart/values.yaml')).toBe(false);
  });

  it.each([
    ['add', 'added'],
    ['addDir', 'added'],
    ['change', 'changed'],
    ['unlink', 'removed'],
    ['unlinkDir', 'removed'],
  ])('dispatches %s without Git status checks', (event, type) => {
    const handler = mockWatcher.on.mock.calls.find(call => call[0] === event)?.[1];
    handler([['charts/chart/values.yaml']]);
    expect(dispatch).toHaveBeenCalledWith({type, payload: ['charts/chart/values.yaml']});
    expect(getState).not.toHaveBeenCalled();
  });
});
