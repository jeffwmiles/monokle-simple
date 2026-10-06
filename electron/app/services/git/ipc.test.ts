import {handleIpc} from '../../utils/ipc';
import './ipc';

jest.mock('../../utils/ipc', () => ({handleIpc: jest.fn()}));

const registrations = jest.mocked(handleIpc).mock.calls;
const probes = new Set(['git:isFolderGitRepo', 'git:isGitInstalled']);

describe('disabled Git integration', () => {
  it('keeps explicit responses for every legacy Git channel', () => {
    expect(registrations).toHaveLength(21);
  });

  it.each(registrations.filter(([channel]) => !probes.has(channel)))('rejects %s', (channel, handler) => {
    expect(() => handler(undefined, {rendererId: 0})).toThrow('Git integration is disabled');
  });

  it.each(registrations.filter(([channel]) => probes.has(channel)))('reports %s unavailable', (channel, handler) => {
    expect(handler(undefined, {rendererId: 0})).toBe(false);
  });
});
