import { startEditor } from "./start-editor";
import { test, expect } from "@playwright/test";
test("palette edits, sticky handles, and undo", async ({ page }) => {
  await startEditor(page);
  await page
    .getByRole("button", { name: "Add Generic Client", exact: true })
    .click();
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue(
    "Generic Client",
  );
  await page.getByLabel("Technology", { exact: true }).fill("Custom");
  await page.getByLabel("Technology", { exact: true }).blur();
  await expect(
    page.locator(".component-copy").filter({ hasText: "Custom" }),
  ).toBeVisible();
  await page.getByLabel("Technology", { exact: true }).fill("");
  await page.getByLabel("Technology", { exact: true }).press("Delete");
  await page.getByLabel("Technology", { exact: true }).blur();
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue(
    "Generic Client",
  );
  await page
    .getByRole("button", { name: "Add Sticky note", exact: true })
    .click();
  await expect(
    page.locator(".react-flow__node.selected .react-flow__handle"),
  ).toHaveCount(4);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".sticky-node")).toHaveCount(1);
  await page.getByRole("button", { name: "Add Text", exact: true }).click();
  await expect(page.locator(".react-flow__node.selected .react-flow__handle")).toHaveCount(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.screenshot({
    path: "/tmp/canvas-task5-editor.png",
    fullPage: true,
  });
});

const nodeFor = (page: import("@playwright/test").Page, text: string) =>
  page
    .locator(".react-flow__node")
    .filter({ has: page.locator(".component-copy strong", { hasText: text }) });
async function drag(
  page: import("@playwright/test").Page,
  locator: import("@playwright/test").Locator,
  dx: number,
  dy: number,
) {
  const box = await locator.boundingBox();
  if (!box) throw Error("Missing drag target");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + dx,
    box.y + box.height / 2 + dy,
    { steps: 12 },
  );
  await page.mouse.up();
}

test("drop placement, handle connections, parallel edges and self loops", async ({
  page,
}) => {
  await startEditor(page);
  const canvas = await page.locator(".canvas").boundingBox();
  if (!canvas) throw Error("Missing canvas");
  const transfer = await page.evaluateHandle(() => new DataTransfer());
  await transfer.evaluate((dt) =>
    dt.setData("application/system-canvas", "generic-server"),
  );
  await page.locator(".canvas").dispatchEvent("drop", {
    dataTransfer: transfer,
    clientX: canvas.x + 100,
    clientY: canvas.y + 100,
  });
  await expect(nodeFor(page, "Generic Server")).toHaveCount(1);
  const browser = nodeFor(page, "Browser");
  const api = nodeFor(page, "Notes API");
  const source = browser.locator('[data-handleid="right"]');
  const target = api.locator('[data-handleid="left"]');
  async function connect(
    from: import("@playwright/test").Locator,
    to: import("@playwright/test").Locator,
  ) {
    const s = await from.boundingBox();
    const t = await to.boundingBox();
    if (!s || !t) throw Error("Missing handles");
    await page.mouse.move(s.x + s.width / 2, s.y + s.height / 2);
    await page.mouse.down();
    await page.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 12 });
    await page.mouse.up();
  }
  await connect(source, target);
  await expect(page.getByLabel("Label", { exact: true })).toBeVisible();
  await page.getByLabel("Label", { exact: true }).fill("second route");
  await page.getByLabel("Label", { exact: true }).blur();
  await expect(page.getByText("second route", { exact: true })).toBeVisible();
  await connect(
    api.locator('[data-handleid="right"]'),
    api.locator('[data-handleid="top"]'),
  );
  await expect(page.locator(".react-flow__edge-path")).toHaveCount(4);
  const paths = await page
    .locator(".react-flow__edge-path")
    .evaluateAll((elements) => elements.map((el) => el.getAttribute("d")));
  expect(new Set(paths).size).toBe(4);
});

test("drag transaction can undo and redo and container delete restores membership", async ({
  page,
}) => {
  await startEditor(page);
  const api = nodeFor(page, "Notes API");
  const before = await api.evaluate(
    (el) => (el as HTMLElement).style.transform,
  );
  await drag(page, api, 75, 30);
  await expect
    .poll(() => api.evaluate((el) => (el as HTMLElement).style.transform))
    .not.toBe(before);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect
    .poll(() => api.evaluate((el) => (el as HTMLElement).style.transform))
    .toBe(before);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect
    .poll(() => api.evaluate((el) => (el as HTMLElement).style.transform))
    .not.toBe(before);
  await page.locator(".container-node > span").click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.locator(".container-node")).toHaveCount(0);
  await expect(page.locator(".component-card")).toHaveCount(3);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".container-node")).toHaveCount(1);
  await page.keyboard.press("ControlOrMeta+a");
  await page.getByRole("button", { name: "Duplicate", exact: true }).click();
  await expect(page.locator(".component-card")).toHaveCount(6);
  await expect(page.locator(".container-node")).toHaveCount(2);
  await page.screenshot({ path: "/tmp/canvas-task5.png", fullPage: true });
});

test("textarea and contenteditable retain normal delete and undo shortcuts", async ({
  page,
}) => {
  await startEditor(page);
  await nodeFor(page, "Notes API").click();
  await page.getByLabel("Notes", { exact: true }).fill("keep node");
  await page.getByLabel("Notes", { exact: true }).press("Delete");
  await expect(page.locator(".component-card")).toHaveCount(3);
  await page.evaluate(() => {
    const div = document.createElement("div");
    div.contentEditable = "true";
    div.id = "editable-test";
    div.innerText = "editable";
    document.body.append(div);
    div.focus();
  });
  await page.keyboard.press("Delete");
  await page.keyboard.press("ControlOrMeta+a");
  await expect(page.locator(".component-card")).toHaveCount(3);
});

test("membership follows drop and drag-out; selected parent and child move once", async ({
  page,
}) => {
  await startEditor(page);
  const boundary = page.locator(".react-flow__node-container");
  const api = nodeFor(page, "Notes API");
  await boundary.locator(".container-node > span").click();
  await api.click({ modifiers: ["Shift"] });
  const parentBefore = await boundary.boundingBox();
  const childBefore = await api.boundingBox();
  if (!parentBefore || !childBefore) throw Error("Missing bounds");
  await drag(page, boundary.locator(".container-node > span"), 35, 30);
  const parentAfter = await boundary.boundingBox();
  const childAfter = await api.boundingBox();
  if (!parentAfter || !childAfter) throw Error("Missing bounds");
  expect(childAfter.x - childBefore.x).toBeCloseTo(
    parentAfter.x - parentBefore.x,
    0,
  );
  expect(childAfter.y - childBefore.y).toBeCloseTo(
    parentAfter.y - parentBefore.y,
    0,
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  // Move the member beyond the boundary, then move the boundary independently.
  await page.keyboard.press("Escape");
  await api.click();
  await drag(page, api, -180, 0);
  const detached = await api.boundingBox();
  await boundary.locator(".container-node > span").click();
  await drag(page, boundary.locator(".container-node > span"), 30, 30);
  const after = await api.boundingBox();
  expect(after?.x).toBeCloseTo(detached!.x, 0);
  expect(after?.y).toBeCloseTo(detached!.y, 0);
});

test("container resize is undoable and clamps around members", async ({
  page,
}) => {
  await startEditor(page);
  const boundary = page.locator(".react-flow__node-container");
  await boundary.locator(".container-node > span").click();
  const before = await boundary.evaluate(
    (el) => (el as HTMLElement).style.width,
  );
  await drag(
    page,
    boundary.locator(".react-flow__resize-control.bottom.right"),
    60,
    40,
  );
  await expect
    .poll(() => boundary.evaluate((el) => (el as HTMLElement).style.width))
    .not.toBe(before);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect
    .poll(() => boundary.evaluate((el) => (el as HTMLElement).style.width))
    .toBe(before);
  const member = nodeFor(page, "Notes API");
  const memberBefore = await member.boundingBox();
  await drag(
    page,
    boundary.locator(".react-flow__resize-control.top.left"),
    -30,
    -30,
  );
  const memberAfter = await member.boundingBox();
  expect(memberAfter!.x).toBeCloseTo(memberBefore!.x, 0);
  expect(memberAfter!.y).toBeCloseTo(memberBefore!.y, 0);
  await drag(
    page,
    boundary.locator(".react-flow__resize-control.bottom.right"),
    -220,
    -120,
  );
  const shrunk = await boundary.boundingBox();
  const scale = memberBefore!.width / 200;
  for (const component of [member, nodeFor(page, "PostgreSQL")]) {
    const bounds = (await component.boundingBox())!;
    expect(
      shrunk!.x + shrunk!.width - bounds.x - bounds.width,
    ).toBeGreaterThanOrEqual(24 * scale - 1);
    expect(
      shrunk!.y + shrunk!.height - bounds.y - bounds.height,
    ).toBeGreaterThanOrEqual(24 * scale - 1);
  }
});

test("top-left shrinking contains members with padding and one undo restores all geometry", async ({
  page,
}) => {
  await startEditor(page);
  const boundary = page.locator(".react-flow__node-container");
  const api = nodeFor(page, "Notes API");
  const database = nodeFor(page, "PostgreSQL");
  await boundary.locator(".container-node > span").click();
  const geometry = async () => ({
    parent: await boundary.boundingBox(),
    api: await api.boundingBox(),
    database: await database.boundingBox(),
  });
  const before = await geometry();
  await drag(
    page,
    boundary.locator(".react-flow__resize-control.top.left"),
    210,
    140,
  );
  const after = await geometry();
  expect(after.parent!.x + after.parent!.width).toBeCloseTo(
    before.parent!.x + before.parent!.width,
    0,
  );
  expect(after.parent!.y + after.parent!.height).toBeCloseTo(
    before.parent!.y + before.parent!.height,
    0,
  );
  const scale = before.api!.width / 200;
  const padding = 24 * scale;
  for (const member of [after.api!, after.database!]) {
    expect(member.x - after.parent!.x).toBeGreaterThanOrEqual(padding - 1);
    expect(member.y - after.parent!.y).toBeGreaterThanOrEqual(padding - 1);
    expect(
      after.parent!.x + after.parent!.width - member.x - member.width,
    ).toBeGreaterThanOrEqual(padding - 1);
    expect(
      after.parent!.y + after.parent!.height - member.y - member.height,
    ).toBeGreaterThanOrEqual(padding - 1);
  }
  expect(after.api!.x).toBeCloseTo(before.api!.x, 0);
  expect(after.api!.y).toBeCloseTo(before.api!.y, 0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await geometry()).toEqual(before);
});

test("toolbar disables unavailable delete and duplicate actions", async ({
  page,
}) => {
  await startEditor(page);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Delete", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Duplicate", exact: true }),
  ).toBeDisabled();
  await nodeFor(page, "Notes API").click();
  await expect(
    page.getByRole("button", { name: "Delete", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Duplicate", exact: true }),
  ).toBeEnabled();
  await page.keyboard.press("Escape");
  await page.locator(".react-flow__edge").first().focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Label", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Delete", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Duplicate", exact: true }),
  ).toBeDisabled();
});

test("selected parent moves when drag starts on its child with one undo and redo", async ({ page }) => {
  await startEditor(page);
  const parent = page.locator(".react-flow__node-container");
  const child = nodeFor(page, "Notes API");
  await parent.locator(".container-node > span").click();
  await child.click({ modifiers: ["Shift"] });
  const pathsBefore = await page.locator(".react-flow__edge-path").evaluateAll(els => els.map(el => el.getAttribute("d")));
  const before = { parent: await parent.boundingBox(), child: await child.boundingBox() };
  await drag(page, child, 75, 40);
  const after = { parent: await parent.boundingBox(), child: await child.boundingBox() };
  const pathsAfter = await page.locator(".react-flow__edge-path").evaluateAll(els => els.map(el => el.getAttribute("d")));
  expect(pathsAfter).not.toEqual(pathsBefore);
  expect(after.parent!.x - before.parent!.x).toBeGreaterThan(60);
  expect(after.child!.x - before.child!.x).toBeCloseTo(after.parent!.x - before.parent!.x, 0);
  expect(after.child!.y - before.child!.y).toBeCloseTo(after.parent!.y - before.parent!.y, 0);
  expect(after.parent!.y - before.parent!.y).toBeGreaterThan(30);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await parent.boundingBox()).toEqual(before.parent);
  expect(await child.boundingBox()).toEqual(before.child);
  await expect.poll(() => page.locator(".react-flow__edge-path").evaluateAll(els => els.map(el => el.getAttribute("d")))).toEqual(pathsBefore);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  expect(await parent.boundingBox()).toEqual(after.parent);
  expect(await child.boundingBox()).toEqual(after.child);
});

test("drag auto-pan persists the visible viewport through export and reopen", async ({ page }) => {
  await startEditor(page);
  const api = nodeFor(page, "Notes API");
  const box = (await api.boundingBox())!;
  const canvas = (await page.locator(".canvas").boundingBox())!;
  const visible = () => page.locator(".react-flow__viewport").evaluate(el => {
    const matrix = new DOMMatrix(getComputedStyle(el).transform);
    return { x: matrix.e, y: matrix.f, zoom: matrix.a };
  });
  const before = await visible();
  const geometryBefore = await api.evaluate(el => (el as HTMLElement).style.transform);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(canvas.x + canvas.width - 4, box.y + box.height / 2, { steps: 15 });
  await page.waitForTimeout(500);
  await page.mouse.up();
  await expect(page.getByRole("status")).toHaveText("Saved locally");
  const after = await visible();
  const geometryAfter = await api.evaluate(el => (el as HTMLElement).style.transform);
  expect(geometryAfter).not.toBe(geometryBefore);
  expect(Math.abs(after.x - before.x)).toBeGreaterThan(20);
  const download = page.waitForEvent("download");
  await page.getByRole('button', { name: 'Diagram actions' }).click();
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  const path = await (await download).path();
  const { readFile } = await import("node:fs/promises");
  const exported = JSON.parse(await readFile(path!, "utf8"));
  expect(exported.viewport.x).toBeCloseTo(after.x, 2);
  expect(exported.viewport.y).toBeCloseTo(after.y, 2);
  expect(exported.viewport.zoom).toBeCloseTo(after.zoom, 4);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect.poll(() => api.evaluate(el => (el as HTMLElement).style.transform)).toBe(geometryBefore);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect.poll(() => api.evaluate(el => (el as HTMLElement).style.transform)).toBe(geometryAfter);
  await expect(page.getByRole("status")).toHaveText("Saved locally");
  await page.reload();
  await page.getByRole("button", { name: "Open Note-Taking App", exact: true }).click();
  await expect.poll(async () => (await visible()).x).toBeCloseTo(after.x, 2);
});

for (const target of ["standalone", "container member"] as const) {
  for (const destination of ["center", "edge"] as const) {
    test(`${target} stays visible throughout slow ${destination} drag and held pointer`, async ({ page }) => {
      await startEditor(page);
      if (target === "standalone") {
        await page.getByRole("button", { name: "Add Generic Client", exact: true }).click();
      }
      const node = nodeFor(page, target === "standalone" ? "Generic Client" : "Notes API");
      await expect(page.getByRole("status")).toHaveText("Saved locally");
      await expect(node).toBeVisible();
      // Let initial layout/measurement settle before observing the interaction.
      await page.waitForTimeout(500);
      const probe = await node.evaluateHandle(el => {
        const hidden: string[] = [];
        const observer = new MutationObserver(records => {
          for (const record of records) {
            // oldValue catches a hide/show pair even when both happen before this callback.
            for (const style of [record.oldValue, el.getAttribute("style")]) {
              if (/visibility:\s*hidden/.test(style ?? "")) hidden.push(style!);
            }
          }
        });
        observer.observe(el, { attributes: true, attributeFilter: ["style"], attributeOldValue: true });
        return { hidden, observer };
      });
      const box = (await node.boundingBox())!;
      const canvas = (await page.locator(".canvas").boundingBox())!;
      const viewportX = () => page.locator(".react-flow__viewport").evaluate(el => new DOMMatrix(getComputedStyle(el).transform).e);
      const beforePan = await viewportX();
      const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      const end = { x: destination === "edge" ? canvas.x + canvas.width - 4 : start.x + 60, y: start.y + 30 };
      await page.mouse.move(start.x, start.y);
      await page.mouse.down();
      try {
        for (let step = 1; step <= 30; step++) {
          await page.mouse.move(start.x + (end.x - start.x) * step / 30, start.y + (end.y - start.y) * step / 30);
          await page.waitForTimeout(40);
        }
        if (destination === "edge") {
          await expect.poll(async () => Math.abs(await viewportX() - beforePan)).toBeGreaterThan(20);
          const heldPan = await viewportX();
          await page.waitForTimeout(1500);
          expect(Math.abs(await viewportX() - heldPan)).toBeGreaterThan(20);
        } else {
          // Autosave starts 400 ms after the last move; keep the pointer down through completion.
          await page.waitForTimeout(1000);
          await expect(page.getByRole("status")).toHaveText("Saved locally");
        }
      } finally {
        await page.mouse.up();
      }
      await expect(node).toBeVisible();
      const hidden = await probe.evaluate(({ hidden, observer }) => {
        observer.disconnect();
        return hidden;
      });
      await probe.dispose();
      expect(hidden, "No transient visibility:hidden styles during drag, autosave or auto-pan").toEqual([]);
    });
  }
}
