// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { useAutoLayout } from './useAutoLayout';
import { layoutFixture } from './layout/diagram-layout.fixture';
import { ControlledWorker } from './layout/layout-worker.fixture';
const snapshot = () => ({ document: layoutFixture(), installation: 1, generation: 2, revision: 3 });
beforeEach(() => { ControlledWorker.instances = []; vi.stubGlobal('Worker', ControlledWorker); });
afterEach(() => vi.unstubAllGlobals());
test('success enters temporary preview and preserves snapshot and input', async () => {
  const { result } = renderHook(() => useAutoLayout()), input = snapshot(), before = structuredClone(input);
  act(() => result.current.start(input));
  expect(result.current.phase).toBe('calculating'); expect(result.current.candidate).toBeNull();
  const candidate = layoutFixture(); candidate.nodes[0].position.x = 999;
  await act(async () => ControlledWorker.instances[0].respond(candidate));
  expect(result.current.phase).toBe('preview'); expect(result.current.candidate).toEqual(candidate);
  expect(result.current.snapshot).toEqual(before); expect(input).toEqual(before);
  act(() => result.current.cancel());
  expect(result.current.phase).toBe('idle'); expect(result.current.snapshot).toBeNull(); expect(result.current.candidate).toBeNull();
});
test('worker failures are readable and a new request clears error', async () => {
  const { result } = renderHook(() => useAutoLayout());
  act(() => result.current.start(snapshot()));
  await act(async () => ControlledWorker.instances[0].fail('Unable to arrange diagram'));
  expect(result.current.error).toBe('Unable to arrange diagram'); expect(result.current.phase).toBe('idle');
  expect(result.current.snapshot).toBeNull();
  act(() => result.current.start(snapshot())); expect(result.current.error).toBeNull();
  act(() => result.current.cancel());
});
test('cancel and immediate restart ignore late old responses', async () => {
  const { result } = renderHook(() => useAutoLayout());
  act(() => result.current.start(snapshot()));
  const old = ControlledWorker.instances[0], late = old.onmessage;
  act(() => { result.current.cancel(); result.current.start(snapshot()); });
  await act(async () => late?.({ data: { jobId: old.request.jobId, candidate: layoutFixture() } } as MessageEvent));
  expect(result.current.phase).toBe('calculating'); expect(result.current.candidate).toBeNull();
  await act(async () => ControlledWorker.instances[1].respond(layoutFixture()));
  expect(result.current.phase).toBe('preview'); expect(old.terminate).toHaveBeenCalledTimes(1);
});
test('replacing a request releases it and unmount releases active worker', async () => {
  const { result, unmount } = renderHook(() => useAutoLayout());
  act(() => result.current.start(snapshot()));
  act(() => result.current.start(snapshot()));
  expect(ControlledWorker.instances[0].terminate).toHaveBeenCalledTimes(1);
  unmount(); await act(async () => {});
  expect(ControlledWorker.instances[1].terminate).toHaveBeenCalledTimes(1);
});
test('cancel and restart ignore an already-resolved result awaiting its microtask', async () => {
  const { result } = renderHook(() => useAutoLayout());
  act(() => result.current.start(snapshot()));
  act(() => {
    ControlledWorker.instances[0].respond(layoutFixture());
    result.current.cancel();
    result.current.start(snapshot());
  });
  await act(async () => {});
  expect(result.current.phase).toBe('calculating'); expect(result.current.candidate).toBeNull();
  await act(async () => ControlledWorker.instances[1].respond(layoutFixture()));
  expect(result.current.phase).toBe('preview');
});
