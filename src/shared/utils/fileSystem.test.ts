import {mkdtemp, readFile, rm, stat} from 'fs/promises';
import {tmpdir} from 'os';
import {join} from 'path';

import {downloadFile} from './fileSystem';

let directory: string;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'monokle-download-'));
});

afterEach(async () => {
  jest.restoreAllMocks();
  await rm(directory, {recursive: true, force: true});
});

test('downloads a native fetch response to disk', async () => {
  jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('chart contents'));
  const destination = join(directory, 'chart.tgz');
  await downloadFile('https://example.test/chart', destination);
  expect(await readFile(destination, 'utf8')).toBe('chart contents');
});

test('rejects HTTP failures without creating a file', async () => {
  jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('missing', {status: 404}));
  const destination = join(directory, 'chart.tgz');
  await expect(downloadFile('https://example.test/chart', destination)).rejects.toThrow('404');
  await expect(stat(destination)).rejects.toMatchObject({code: 'ENOENT'});
});

test('removes a partial file if the response stream fails', async () => {
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('partial'));
    },
    pull(controller) {
      controller.error(new Error('download interrupted'));
    },
  });
  jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(body));
  const destination = join(directory, 'chart.tgz');
  await expect(downloadFile('https://example.test/chart', destination)).rejects.toThrow('download interrupted');
  await expect(stat(destination)).rejects.toMatchObject({code: 'ENOENT'});
});

test('propagates destination stream errors', async () => {
  jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('chart contents'));
  await expect(downloadFile('https://example.test/chart', join(directory, 'missing', 'chart.tgz'))).rejects.toMatchObject({
    code: 'ENOENT',
  });
});
