import {FSWatcher, watch} from 'chokidar';
import log from 'loglevel';

import {multiplePathsRemoved} from '@redux/reducers/main';
import {multiplePathsAdded} from '@redux/thunks/multiplePathsAdded';
import {multiplePathsChanged} from '@redux/thunks/multiplePathsChanged';

import {debounceWithPreviousArgs} from '@shared/utils/watch';

let watcher: FSWatcher;

/**
 * Creates a monitor for the specified folder and dispatches folder events using the specified dispatch
 */

export function monitorRootFolder(folder: string, thunkAPI: {getState: Function; dispatch: Function}) {
  if (watcher) {
    watcher.close();
  }

  watcher = watch(folder, {
    ignoreInitial: true,
    persistent: true,
    usePolling: true,
    interval: 1000,
    ignored: /(^|[/\\])\.git([/\\]|$)/,
  });

  watcher
    .on(
      'add',
      debounceWithPreviousArgs((args: any[]) => {
        const paths: Array<string> = args.map(arg => arg[0]);
        thunkAPI.dispatch(multiplePathsAdded(paths));
      }, 1000)
    )
    .on(
      'addDir',
      debounceWithPreviousArgs((args: any[]) => {
        const paths: Array<string> = args.map(arg => arg[0]);
        thunkAPI.dispatch(multiplePathsAdded(paths));
      }, 1000)
    )
    .on(
      'change',
      debounceWithPreviousArgs((args: any[]) => {
        const paths: Array<string> = args.map(arg => arg[0]);
        thunkAPI.dispatch(multiplePathsChanged(paths));
      }, 1000)
    )
    .on(
      'unlink',
      debounceWithPreviousArgs((args: any[]) => {
        const paths: Array<string> = args.map(arg => arg[0]);
        thunkAPI.dispatch(multiplePathsRemoved(paths));
      }, 1000)
    )
    .on(
      'unlinkDir',
      debounceWithPreviousArgs((args: any[]) => {
        const paths: Array<string> = args.map(arg => arg[0]);
        thunkAPI.dispatch(multiplePathsRemoved(paths));
      }, 1000)
    );

  watcher.on('error', error => log.error(`Watcher error: ${error}`));
}
