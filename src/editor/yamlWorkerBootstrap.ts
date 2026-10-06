import {start} from 'monaco-editor/editor/editor.worker.start';

export function initialize(factory: (context: unknown, configuration: unknown) => object) {
  const configure = (event: MessageEvent) => {
    if (event.data?.type !== 'monokle-yaml-configuration') return;
    self.removeEventListener('message', configure);
    start(context => factory(context, event.data.configuration));
  };
  self.addEventListener('message', configure);
}
