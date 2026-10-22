import type { Diagram } from '../../domain/model';

self.onmessage = async ({ data }: MessageEvent<{ jobId: number; document: Diagram }>) => {
  const { jobId, document } = data;
  try {
    // ELK's bundled entry mistakes an outer browser worker for its own worker
    // script when document is absent. During module/constructor initialization
    // only, select its in-process shim; computation stays in this one worker.
    Object.defineProperty(globalThis, 'document', { value: {}, configurable: true });
    let result: Promise<Diagram>;
    try {
      const { layoutDiagram } = await import('./diagram-layout');
      // The bundled shim is initialized lazily by ELK's synchronous constructor.
      result = layoutDiagram(document);
    } finally {
      Reflect.deleteProperty(globalThis, 'document');
    }
    const candidate = await result;
    self.postMessage({ jobId, candidate });
  } catch (error) {
    self.postMessage({ jobId, error: error instanceof Error ? error.message : 'Layout calculation failed.' });
  }
};
