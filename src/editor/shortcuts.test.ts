// @vitest-environment jsdom
import { it, expect } from "vitest";
import { isEditing } from "./shortcuts";
it("guards input, textarea, select and descendants of editable content", () => {
  for (const tag of ["input", "textarea", "select"])
    expect(isEditing(document.createElement(tag))).toBe(true);
  const host = document.createElement("div");
  host.contentEditable = "true";
  host.setAttribute("contenteditable", "true");
  const child = document.createElement("span");
  host.append(child);
  expect(isEditing(child)).toBe(true);
  expect(isEditing(document.createElement("button"))).toBe(false);
  expect(isEditing(null)).toBe(false);
});
