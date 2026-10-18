import { vi } from 'vitest';

/** Controlled browser boundary; production job and hook remain real. */
export class ControlledWorker {
  static instances: ControlledWorker[] = [];
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessageerror: (() => void) | null = null;
  request!: { jobId: number; document: unknown };
  terminate = vi.fn();
  constructor() { ControlledWorker.instances.push(this); }
  postMessage(request: typeof this.request) { this.request = structuredClone(request); }
  respond(candidate: unknown, jobId = this.request.jobId) { this.onmessage?.({ data: { jobId, candidate } } as MessageEvent); }
  fail(message: string) { this.onmessage?.({ data: { jobId: this.request.jobId, error: message } } as MessageEvent); }
}
