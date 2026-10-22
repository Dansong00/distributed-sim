import type { Diagram } from '../../domain/model';
import { exportDiagram, validateDiagram } from '../../domain/serialization';

let nextJobId = 0;

/** One disposable worker per calculation; no layout engine runs on the UI thread. */
export function startLayout(document: Diagram): { result: Promise<Diagram>; cancel(): void } {
  const jobId = ++nextJobId;
  let worker: Worker | undefined;
  let settled = false;
  let rejectResult!: (reason: unknown) => void;
  const finish = () => {
    settled = true;
    if (worker) {
      worker.onmessage = null;
      worker.onerror = null;
      worker.onmessageerror = null;
      worker.terminate();
    }
  };
  const result = new Promise<Diagram>((resolve, reject) => {
    rejectResult = reject;
    const fail = (error: unknown) => { if (!settled) { finish(); reject(error); } };
    try {
      const input = validateDiagram(document);
      exportDiagram(input);
      worker = new Worker(new URL('./layout.worker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = ({ data }: MessageEvent<unknown>) => {
        if (settled) return;
        if (!data || typeof data !== 'object' || !('jobId' in data)) {
          fail(new Error('Invalid layout worker response.')); return;
        }
        if (data.jobId !== jobId) return;
        try {
          if ('error' in data) throw new Error(typeof data.error === 'string' ? data.error : 'Layout calculation failed.');
          const candidate = validateDiagram('candidate' in data ? data.candidate : undefined);
          exportDiagram(candidate);
          if (candidate.id !== input.id) throw new Error('Layout result belongs to a different diagram.');
          finish(); resolve(candidate);
        } catch (error) { fail(error); }
      };
      worker.onerror = event => fail(new Error(event.message || 'Layout worker failed.'));
      worker.onmessageerror = () => fail(new Error('Unable to read layout worker response.'));
      worker.postMessage({ jobId, document: input });
    } catch (error) { fail(error); }
  });
  return { result, cancel() {
    if (settled) return;
    finish(); rejectResult(new DOMException('Layout calculation canceled.', 'AbortError'));
  } };
}
