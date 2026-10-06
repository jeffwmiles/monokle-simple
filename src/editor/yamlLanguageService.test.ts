jest.mock('monaco-editor', () => ({}), {virtual: true});
jest.mock('monaco-yaml', () => ({configureMonacoYaml: jest.fn()}), {virtual: true});
jest.mock('loglevel', () => ({error: jest.fn()}));

describe('YAML language service', () => {
  const update = jest.fn();
  let updateYamlLanguageService: typeof import('./yamlLanguageService').updateYamlLanguageService;
  let configureMonacoYaml: jest.Mock;
  let logError: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    update.mockReset().mockResolvedValue(undefined);
    configureMonacoYaml = require('monaco-yaml').configureMonacoYaml;
    configureMonacoYaml.mockReturnValue({update});
    logError = require('loglevel').error;
    updateYamlLanguageService = require('./yamlLanguageService').updateYamlLanguageService;
  });

  it('configures one instance and updates it for subsequent selections', () => {
    const initial = {validate: true, format: {enable: true}};
    const next = {validate: false, schemas: []};
    updateYamlLanguageService(initial);
    updateYamlLanguageService(next);
    expect(configureMonacoYaml).toHaveBeenCalledTimes(1);
    expect(configureMonacoYaml).toHaveBeenCalledWith(expect.anything(), initial);
    expect(update).toHaveBeenCalledWith(next);
  });

  it('reports rejected configuration updates', async () => {
    const error = new Error('worker unavailable');
    update.mockRejectedValueOnce(error);
    updateYamlLanguageService({validate: true});
    updateYamlLanguageService({validate: false});
    await Promise.resolve();
    expect(logError).toHaveBeenCalledWith('Failed to update YAML language service', error);
  });
});
