import type * as Monaco from 'monaco-editor';

type Options = {createData?: unknown; label: string; moduleId?: string; interval?: number; stopWhenIdleFor?: number};

export function createWorkerManager<Client extends object>(monaco: typeof Monaco, options: Options) {
  let client: Monaco.editor.MonacoWebWorker<Client> | undefined;
  let idleTimer: ReturnType<typeof setTimeout> | undefined;
  let configuration = options.createData;
  let disposed = false;

  const release = () => {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = undefined;
    client?.dispose();
    client = undefined;
  };

  return {
    dispose() {disposed = true; release();},
    updateCreateData(next: unknown) {configuration = next; release();},
    async getWorker(...resources: Monaco.Uri[]): Promise<Client> {
      if (disposed) throw new Error('YAML worker manager is disposed');
      if (idleTimer) clearTimeout(idleTimer);
      if (!client) {
        const factory = globalThis.MonacoEnvironment?.getWorker;
        if (!factory) throw new Error('Monaco worker factory is unavailable');
        const worker = await factory(options.moduleId || '', options.label);
        worker.postMessage({type: 'monokle-yaml-configuration', configuration});
        client = monaco.editor.createWebWorker<Client>({worker});
      }
      idleTimer = setTimeout(release, options.stopWhenIdleFor || 120000);
      return client.withSyncedResources(resources);
    },
  };
}
