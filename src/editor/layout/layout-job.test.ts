import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { startLayout } from './layout-job';
import { layoutFixture } from './diagram-layout.fixture';
import { ControlledWorker } from './layout-worker.fixture';
beforeEach(() => { ControlledWorker.instances = []; vi.stubGlobal('Worker', ControlledWorker); });
afterEach(() => vi.unstubAllGlobals());
test('returns a validated candidate without touching input and releases worker', async () => {
  const document = layoutFixture(), before = structuredClone(document);
  const job = startLayout(document), worker = ControlledWorker.instances[0];
  const candidate = structuredClone(document); candidate.nodes[0].position.x = 999;
  worker.respond(candidate, -1);
  worker.respond(candidate);
  await expect(job.result).resolves.toEqual(candidate);
  expect(document).toEqual(before); expect(worker.terminate).toHaveBeenCalledTimes(1);
  job.cancel(); expect(worker.terminate).toHaveBeenCalledTimes(1);
});
test('cancel rejects with AbortError and terminates once', async () => {
  const job = startLayout(layoutFixture()), worker = ControlledWorker.instances[0];
  const assertion = expect(job.result).rejects.toMatchObject({ name: 'AbortError' });
  job.cancel(); job.cancel(); worker.respond(layoutFixture()); await assertion;
  expect(worker.terminate).toHaveBeenCalledTimes(1);
});
test.each(['error', 'messageerror', 'response'] as const)('rejects %s failures and releases worker', async kind => {
  const job = startLayout(layoutFixture()), worker = ControlledWorker.instances[0];
  const assertion = expect(job.result).rejects.toThrow();
  if (kind === 'error') worker.onerror?.({ message: 'Layout crashed' } as ErrorEvent);
  if (kind === 'messageerror') worker.onmessageerror?.();
  if (kind === 'response') worker.fail('Layout failed');
  await assertion; expect(worker.terminate).toHaveBeenCalledTimes(1);
});
test.each([{}, { ...layoutFixture(), id: 'wrong' }, { ...layoutFixture(), viewport: { x: Infinity, y: 0, zoom: 1 } }])('rejects malformed or wrong-identity worker output', async candidate => {
  const job = startLayout(layoutFixture()); ControlledWorker.instances[0].respond(candidate);
  await expect(job.result).rejects.toThrow(); expect(ControlledWorker.instances[0].terminate).toHaveBeenCalledTimes(1);
});
test('rejects startup failures', async () => {
  vi.stubGlobal('Worker', class { constructor() { throw new Error('Worker unavailable'); } });
  await expect(startLayout(layoutFixture()).result).rejects.toThrow('Worker unavailable');
});
test('rejects postMessage failures and releases created worker', async () => {
  vi.spyOn(ControlledWorker.prototype, 'postMessage').mockImplementationOnce(() => { throw new Error('Cannot clone'); });
  await expect(startLayout(layoutFixture()).result).rejects.toThrow('Cannot clone');
  expect(ControlledWorker.instances[0].terminate).toHaveBeenCalledTimes(1);
});
test('rejects a structurally valid result exceeding the portable file limit', async () => {
  const job = startLayout(layoutFixture()), candidate = layoutFixture();
  const template = candidate.nodes.find(node => node.kind === 'component')!;
  candidate.nodes = Array.from({ length: 300 }, (_, index) => ({ ...template, id: `node-${index}`, notes: 'x'.repeat(10000), description: 'x'.repeat(10000) }));
  candidate.edges = [];
  ControlledWorker.instances[0].respond(candidate);
  await expect(job.result).rejects.toThrow('5 MiB');
  expect(ControlledWorker.instances[0].terminate).toHaveBeenCalledTimes(1);
});
test('rejects a malformed message envelope', async () => {
  const job = startLayout(layoutFixture());
  ControlledWorker.instances[0].onmessage?.({ data: null } as MessageEvent);
  await expect(job.result).rejects.toThrow('Invalid layout worker response');
});
