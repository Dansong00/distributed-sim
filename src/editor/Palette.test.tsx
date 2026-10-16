// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Palette } from "./Palette";
import { createComponent } from "../domain/catalog";
import { createDiagram } from "../domain/templates";
import { validateDiagram } from "../domain/serialization";

afterEach(cleanup);

it("finds specialized databases by capability and adds a portable component", () => {
  const add = vi.fn();
  render(<Palette onAdd={add} />);
  fireEvent.change(screen.getByLabelText("Search components"), { target: { value: "vector" } });
  fireEvent.click(screen.getByRole("button", { name: "Add Qdrant" }));
  expect(add).toHaveBeenCalledWith("qdrant");
  const node = createComponent(add.mock.calls[0][0], { x: 10, y: 20 });
  const doc = createDiagram("blank", "AI system");
  doc.nodes = [node];
  expect(validateDiagram(JSON.parse(JSON.stringify(doc))).nodes[0]).toMatchObject({
    name: "Qdrant", category: "Databases", componentType: "vector-database",
  });
  fireEvent.change(screen.getByLabelText("Search components"), { target: { value: "vector-database" } });
  expect(screen.getByRole("button", { name: "Add Qdrant" })).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Search components"), { target: { value: "geospatial" } });
  expect(screen.getByRole("button", { name: "Add PostGIS" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Add Qdrant" })).toBeNull();
});

it("finds lakehouse storage and AI pipeline building blocks", () => {
  render(<Palette onAdd={() => {}} />);
  const search = screen.getByLabelText("Search components");
  fireEvent.change(search, { target: { value: "lakehouse" } });
  expect(screen.getByRole("button", { name: "Add Generic Lakehouse" })).toBeTruthy();
  fireEvent.change(search, { target: { value: "embedding" } });
  expect(screen.getByRole("button", { name: "Add Generic Embedding Service" })).toBeTruthy();
  fireEvent.change(search, { target: { value: "model registry" } });
  expect(screen.getByRole("button", { name: "Add MLflow" })).toBeTruthy();
});
