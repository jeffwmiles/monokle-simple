import EditorWorker from 'monaco-editor/editor/editor.worker.js?worker';
import JsonWorker from 'monaco-editor/languages/features/json/json.worker.js?worker';
import YamlWorker from 'monaco-yaml/yaml.worker.js?worker';

window.MonacoEnvironment = {
  getWorker(_moduleId, label) {
    switch (label) {
      case 'json':
        return new JsonWorker();
      case 'yaml':
        return new YamlWorker();
      default:
        return new EditorWorker();
    }
  },
};
