import type { Diagram, Viewport } from './model';

export type HistoryState = { past: Diagram[]; present: Diagram; future: Diagram[]; transaction: Diagram | null };
export type HistoryAction =
  | { type: 'begin' | 'commit' | 'cancel' | 'undo' | 'redo' }
  | { type: 'preview' | 'replace'; document: Diagram }
  | { type: 'viewport'; viewport: Viewport };

export const createHistory = (document: Diagram): HistoryState => ({ past: [], present: document, future: [], transaction: null });
const withViewport = (document: Diagram, current: Diagram): Diagram => ({ ...document, viewport: current.viewport });
const content = (document: Diagram) => JSON.stringify({ ...document, viewport: undefined });

export function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'replace': return createHistory(action.document);
    case 'viewport': return { ...state, present: { ...state.present, viewport: action.viewport } };
    case 'begin': return state.transaction ? state : { ...state, transaction: state.present };
    case 'preview': return { ...state, transaction: state.transaction ?? state.present, present: action.document };
    case 'commit': {
      if (!state.transaction) return state;
      const changed = content(state.transaction) !== content(state.present);
      return { ...state, transaction: null, past: changed ? [...state.past, state.transaction].slice(-100) : state.past,
        future: changed ? [] : state.future };
    }
    case 'cancel': return state.transaction ? { ...state, present: withViewport(state.transaction, state.present), transaction: null } : state;
    case 'undo': {
      if (state.transaction) return historyReducer(historyReducer(state, { type: 'cancel' }), action);
      const previous = state.past.at(-1);
      return previous ? { past: state.past.slice(0, -1), present: withViewport(previous, state.present), future: [state.present, ...state.future], transaction: null } : state;
    }
    case 'redo': {
      if (state.transaction) return historyReducer(historyReducer(state, { type: 'cancel' }), action);
      const next = state.future[0];
      return next ? { past: [...state.past, state.present].slice(-100), present: withViewport(next, state.present), future: state.future.slice(1), transaction: null } : state;
    }
  }
}
