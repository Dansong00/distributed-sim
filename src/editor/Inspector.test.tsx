// @vitest-environment jsdom
import { useReducer } from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { Inspector } from "./Inspector";
import { createDiagram } from "../domain/templates";
import { createHistory, historyReducer } from "../domain/history";
import type { Selection } from "../domain/model";
afterEach(cleanup);
function setup(mixedNodes = false) {
  const d = createDiagram("web", "Styles");
  d.edges[0] = { ...d.edges[0], stroke: "dashed", path: "straight" };
  d.edges[1] = { ...d.edges[1], stroke: "dotted", path: "curved" };
  const selection: Selection = { nodeIds: mixedNodes ? [d.nodes[0].id] : [], edgeIds: d.edges.map(e => e.id) };
  function Harness() {
    const [state, dispatch] = useReducer(historyReducer, d, createHistory);
    return <><Inspector document={state.present} selection={selection} dispatch={dispatch} /><button onClick={() => dispatch({ type: "undo" })}>Undo test</button><output data-testid="document">{JSON.stringify(state.present)}</output><output data-testid="history">{state.past.length}</output></>;
  }
  render(<Harness />);
  return d;
}
it.each([false, true])("batch connector changes preserve other properties and nodes, with one undo (mixed nodes %s)", mixedNodes => {
  const original = setup(mixedNodes);
  expect(screen.getByRole("heading", { name: "Connections (2)" })).toBeTruthy();
  const stroke = screen.getByLabelText("Stroke style");
  const path = screen.getByLabelText("Path shape");
  expect((stroke as HTMLSelectElement).selectedOptions[0].textContent).toBe("Mixed");
  expect((path as HTMLSelectElement).selectedOptions[0].textContent).toBe("Mixed");
  if (mixedNodes) expect(screen.getByLabelText("Name")).toBeTruthy();
  fireEvent.change(stroke, { target: { value: "solid" } });
  const changed = JSON.parse(screen.getByTestId("document").textContent!);
  expect(changed.nodes).toEqual(original.nodes);
  expect(changed.edges.map((e: {stroke:string}) => e.stroke)).toEqual(["solid", "solid"]);
  expect(changed.edges.map((e: {path:string}) => e.path)).toEqual(["straight", "curved"]);
  expect(screen.getByTestId("history").textContent).toBe("1");
  fireEvent.click(screen.getByText("Undo test"));
  expect(JSON.parse(screen.getByTestId("document").textContent!)).toEqual(original);
  fireEvent.change(path, { target: { value: "elbow" } });
  const paths = JSON.parse(screen.getByTestId("document").textContent!);
  expect(paths.edges.map((e: {path:string}) => e.path)).toEqual(["elbow", "elbow"]);
  expect(paths.edges.map((e: {stroke:string}) => e.stroke)).toEqual(["dashed", "dotted"]);
});
it("explains straight self-loop fallback while retaining single-edge label and direction", () => {
  const d = createDiagram("web", "Loop");
  d.edges[0] = { ...d.edges[0], target: d.edges[0].source, path: "straight" };
  render(<Inspector document={d} selection={{ nodeIds: [], edgeIds: [d.edges[0].id] }} dispatch={() => {}} />);
  expect(screen.getByText(/Straight self-connections use a rectangular loop/)).toBeTruthy();
  expect(screen.getByLabelText("Label")).toBeTruthy();
  expect(screen.getByLabelText("Direction")).toBeTruthy();
});

it('remembers only explicit setting edits, including just the changed Mixed property', () => {
  const d = createDiagram('web', 'Preferences');
  d.edges[0].path = 'curved'; d.edges[1].path = 'elbow';
  const patches: unknown[] = [];
  const props = { document: d, dispatch: () => {}, onConnectorSetting: (patch: unknown) => patches.push(patch) };
  const view = render(<Inspector {...props} selection={{ nodeIds: [], edgeIds: d.edges.map(e => e.id) }} />);
  expect(patches).toEqual([]);
  fireEvent.change(screen.getByLabelText('Stroke style'), { target: { value: 'dotted' } });
  expect(patches).toEqual([{ stroke: 'dotted' }]);
  view.rerender(<Inspector {...props} selection={{ nodeIds: [], edgeIds: [d.edges[0].id] }} />);
  expect(patches).toHaveLength(1);
  fireEvent.change(screen.getByLabelText('Direction'), { target: { value: 'both' } });
  fireEvent.change(screen.getByLabelText('Path shape'), { target: { value: 'straight' } });
  expect(patches).toEqual([{ stroke: 'dotted' }, { direction: 'both' }, { path: 'straight' }]);
});

it('edits only the selected connector comments in one undoable text transaction', () => {
  const original = createDiagram('web', 'Comments');
  function Harness() {
    const [state, dispatch] = useReducer(historyReducer, original, createHistory);
    return <>
      <Inspector document={state.present} selection={{ nodeIds: [], edgeIds: [original.edges[0].id] }} dispatch={dispatch} />
      <button onClick={() => dispatch({ type: 'undo' })}>Undo test</button>
      <button onClick={() => dispatch({ type: 'redo' })}>Redo test</button>
      <output data-testid="document">{JSON.stringify(state.present)}</output>
      <output data-testid="history">{state.past.length}</output>
    </>;
  }
  render(<Harness />);
  const comments = screen.getByRole('textbox', { name: 'Comments' });
  expect(comments.getAttribute('maxlength')).toBe('10000');
  fireEvent.focus(comments);
  fireEvent.change(comments, { target: { value: 'Retry' } });
  fireEvent.change(comments, { target: { value: 'Retry on failure.\nUse exponential backoff.' } });
  expect(screen.getByTestId('history').textContent).toBe('0');
  fireEvent.blur(comments);
  expect(screen.getByTestId('history').textContent).toBe('1');
  const changed = JSON.parse(screen.getByTestId('document').textContent!);
  expect(changed.edges).toEqual([{ ...original.edges[0], comments: 'Retry on failure.\nUse exponential backoff.' }, original.edges[1]]);
  expect(changed.nodes).toEqual(original.nodes);
  fireEvent.click(screen.getByText('Undo test'));
  expect(JSON.parse(screen.getByTestId('document').textContent!)).toEqual(original);
  fireEvent.click(screen.getByText('Redo test'));
  expect(JSON.parse(screen.getByTestId('document').textContent!)).toEqual(changed);
  fireEvent.focus(comments);
  fireEvent.change(comments, { target: { value: '' } });
  fireEvent.blur(comments);
  expect(JSON.parse(screen.getByTestId('document').textContent!).edges[0].comments).toBe('');
});
