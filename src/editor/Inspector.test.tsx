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
