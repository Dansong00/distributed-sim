import { useCallback, useEffect, useRef, useState } from 'react';
import type { CleanupSnapshot, Diagram } from '../domain/model';
import { startLayout } from './layout/layout-job';

type LayoutState = {
  phase: 'idle' | 'calculating' | 'preview';
  candidate: Diagram | null;
  error: string | null;
  snapshot: CleanupSnapshot | null;
};
const idle: LayoutState = { phase: 'idle', candidate: null, error: null, snapshot: null };

/** Candidate and captured session identity never enter document history or storage. */
export function useAutoLayout() {
  const [state, setState] = useState<LayoutState>(idle);
  const active = useRef<ReturnType<typeof startLayout> | null>(null);
  const release = useCallback(() => {
    const job = active.current;
    active.current = null;
    job?.cancel();
  }, []);
  useEffect(() => release, [release]);
  const cancel = useCallback(() => { release(); setState(idle); }, [release]);
  const start = useCallback((snapshot: CleanupSnapshot) => {
    release();
    // Own the captured values even if the caller later changes its document object.
    const captured = structuredClone(snapshot);
    const job = startLayout(captured.document);
    active.current = job;
    setState({ phase: 'calculating', candidate: null, error: null, snapshot: captured });
    void job.result.then(candidate => {
      if (active.current !== job) return;
      active.current = null;
      setState({ phase: 'preview', candidate, error: null, snapshot: captured });
    }, error => {
      if (active.current !== job) return;
      active.current = null;
      setState({ ...idle, error: error instanceof Error ? error.message : 'Layout calculation failed.' });
    });
  }, [release]);
  return { ...state, start, cancel };
}
