import {extractRepositoryOwnerAndNameFromUrl} from './utils';

jest.mock('electron', () => ({dialog: {}}));
jest.mock('electron-log', () => ({}));
jest.mock('@shared/utils/electronStore', () => ({}));
jest.mock('@shared/utils/resource', () => ({}));
jest.mock('@shared/utils/segment', () => ({}));

describe('HTTPS extension links without Git URL dependencies', () => {
  it('defaults repository downloads to main', () => {
    expect(extractRepositoryOwnerAndNameFromUrl('https://github.com/example/templates.git')).toEqual({
      repositoryOwner: 'example',
      repositoryName: 'templates',
      repositoryBranch: 'main',
    });
  });

  it('preserves branch paths', () => {
    expect(extractRepositoryOwnerAndNameFromUrl('https://github.com/example/templates/tree/feature/helm')).toEqual({
      repositoryOwner: 'example',
      repositoryName: 'templates',
      repositoryBranch: 'feature/helm',
    });
  });

  it.each([
    'git@github.com:example/templates',
    'http://github.com/example/templates',
    'https://github.com/example/templates/blob/main/file.yaml',
  ])('rejects unsupported link %s', url => expect(() => extractRepositoryOwnerAndNameFromUrl(url)).toThrow());
});
