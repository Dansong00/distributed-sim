import { layoutDiagram } from './diagram-layout';
import type { Diagram } from '../../domain/model';

self.onmessage = async ({ data }: MessageEvent<{ jobId: number; document: Diagram }>) => {
  const { jobId, document } = data;
  try {
    const candidate = await layoutDiagram(document);
    self.postMessage({ jobId, candidate });
  } catch (error) {
    self.postMessage({ jobId, error: error instanceof Error ? error.message : 'Layout calculation failed.' });
  }
};
