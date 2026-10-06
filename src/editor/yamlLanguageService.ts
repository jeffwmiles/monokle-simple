import log from 'loglevel';
import * as monaco from 'monaco-editor';
import {configureMonacoYaml} from 'monaco-yaml';
import type {MonacoYaml, MonacoYamlOptions} from 'monaco-yaml';

let service: MonacoYaml | undefined;

export function updateYamlLanguageService(options: MonacoYamlOptions): void {
  if (!service) {
    service = configureMonacoYaml(monaco, options);
    return;
  }
  void service.update(options).catch(error => log.error('Failed to update YAML language service', error));
}
