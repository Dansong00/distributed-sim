import { test, expect, type Page } from "@playwright/test";
async function create(page: Page, template: string, name: string) {
  await page.getByLabel("Starter").selectOption(template);
  await page.getByLabel("Diagram name", { exact: true }).fill(name);
  await page
    .getByRole("button", { name: "Create diagram", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Saved locally");
}
test("all starters, rename, duplicate, switch, viewport and reload", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Create a diagram" }),
  ).toBeVisible();
  await expect(page.getByLabel("Starter")).toHaveValue("blank");
  await create(page, "blank", "Blank one");
  await expect(page.locator(".component-card")).toHaveCount(0);
  await page.getByRole("button", { name: "New diagram", exact: true }).click();
  await create(page, "web", "Web one");
  await expect(page.locator(".component-card")).toHaveCount(3);
  await page.getByRole("button", { name: "New diagram", exact: true }).click();
  await create(page, "notes", "Notes one");
  await expect(page.locator(".sticky-node")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Rename diagram", exact: true })
    .click();
  await page.getByLabel("Diagram name", { exact: true }).fill("Renamed");
  await page.getByRole("button", { name: "Save name", exact: true }).click();
  await page
    .getByRole("button", { name: "Duplicate diagram", exact: true })
    .click();
  await expect(page.locator(".document-title")).toHaveText("Renamed copy");
  await page.getByRole("button", { name: "Diagrams", exact: true }).click();
  await page.getByRole("button", { name: "Open Web one", exact: true }).click();
  await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Saving…");
  await expect(page.getByRole("status")).toHaveText("Saved locally");
  const transform = await page
    .locator(".react-flow__viewport")
    .getAttribute("style");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your diagrams" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open Web one", exact: true }).click();
  await expect(page.locator(".react-flow__viewport")).toHaveAttribute(
    "style",
    transform!,
  );
  await page.screenshot({
    path: "/tmp/canvas-task6-editor.png",
    fullPage: true,
  });
});
test("export/import makes a new diagram; malformed import preserves work; delete cancel and last deletion", async ({
  page,
}) => {
  await page.goto("/");
  await create(page, "web", "Portable");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  const download = await downloadPromise;
  const path = await download.path();
  await page.locator("input[type=file]").setInputFiles(path!);
  await expect(page.locator(".document-title")).toHaveText("Portable");
  await page.getByRole("button", { name: "Diagrams", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Open Portable", exact: true }),
  ).toHaveCount(2);
  await page
    .getByRole("button", { name: "Open Portable", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Import JSON", exact: true }),
  ).toBeEnabled();
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from("{bad"),
    });
  await expect(page.getByRole("alert")).toContainText("not valid JSON");
  await expect(page.locator(".component-card")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Delete diagram", exact: true })
    .click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator(".component-card")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Delete diagram", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Delete permanently", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your diagrams" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Open Portable", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Delete diagram", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Delete permanently", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Create a diagram" }),
  ).toBeVisible();
});
test("another tab causes a conflict; local edits survive as a copy", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await create(page, "blank", "Shared");
  const other = await context.newPage();
  await other.goto("/");
  await other.getByRole("button", { name: "Open Shared", exact: true }).click();
  await page
    .getByRole("button", { name: "Rename diagram", exact: true })
    .click();
  await page.getByLabel("Diagram name", { exact: true }).fill("Stored change");
  await page.getByRole("button", { name: "Save name", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Saved locally");
  await other
    .getByRole("button", { name: "Rename diagram", exact: true })
    .click();
  await other.getByLabel("Diagram name", { exact: true }).fill("Local change");
  await other.getByRole("button", { name: "Save name", exact: true }).click();
  await expect(other.getByRole("status")).toHaveText("Conflict — edits kept");
  await expect(other.locator(".document-title")).toHaveText("Local change");
  await other
    .getByRole("button", { name: "Save as copy", exact: true })
    .click();
  await expect(other.locator(".document-title")).toHaveText(
    "Local change copy",
  );
  await expect(other.getByRole("status")).toHaveText("Saved locally");
  await other.getByRole("button", { name: "Diagrams", exact: true }).click();
  await expect(
    other.getByRole("button", { name: "Open Stored change", exact: true }),
  ).toBeVisible();
  await expect(
    other.getByRole("button", { name: "Open Local change copy", exact: true }),
  ).toBeVisible();
});

test("conflict reload restores stored viewport and preserves it through the next edit", async ({ page, context }) => {
  await page.goto("/");
  await create(page, "blank", "Shared viewport");
  const other = await context.newPage();
  await other.goto("/");
  await other.getByRole("button", { name: "Open Shared viewport", exact: true }).click();
  await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Saving…");
  await expect(page.getByRole("status")).toHaveText("Saved locally");
  const storedTransform = await page.locator(".react-flow__viewport").getAttribute("style");
  await other.getByRole("button", { name: "Rename diagram", exact: true }).click();
  await other.getByLabel("Diagram name", { exact: true }).fill("Discarded name");
  await other.getByRole("button", { name: "Save name", exact: true }).click();
  await expect(other.getByRole("status")).toHaveText("Conflict — edits kept");
  await other.getByRole("button", { name: "Reload stored version", exact: true }).click();
  await other.getByRole("button", { name: "Discard and reload", exact: true }).click();
  await expect(other.getByRole("status")).toHaveText("Saved locally");
  await expect(other.locator(".react-flow__viewport")).toHaveAttribute("style", storedTransform!);
  await expect(other.locator(".document-title")).toHaveText("Shared viewport");
  await other.getByRole("button", { name: "Rename diagram", exact: true }).click();
  await other.getByLabel("Diagram name", { exact: true }).fill("After reload");
  await other.getByRole("button", { name: "Save name", exact: true }).click();
  await expect(other.getByRole("status")).toHaveText("Saved locally");
  await other.reload();
  await other.getByRole("button", { name: "Open After reload", exact: true }).click();
  await expect(other.locator(".react-flow__viewport")).toHaveAttribute("style", storedTransform!);
});

test("exact editor limits reject add, duplicate and connect atomically and preserve export", async ({ page }) => {
  const { createDiagram } = await import("../src/domain/templates");
  const doc = createDiagram("notes", "Limits");
  const component = doc.nodes.find(n => n.kind === "component")!;
  doc.nodes = Array.from({ length: 499 }, (_, i) => ({ ...component, id: `limit-${i}`, name: `Limit ${i}`, parentId: undefined, position: { x: i < 2 ? 80 + i * 320 : 2000 + i * 5, y: 180 } }));
  doc.edges = Array.from({ length: 999 }, (_, i) => ({ ...doc.edges[0], id: `route-${i}`, source: "limit-0", target: "limit-1" }));
  doc.viewport = { x: 0, y: 0, zoom: 1 };
  await page.goto("/");
  await page.locator("input[type=file]").setInputFiles({ name: "limits.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(doc)) });
  await expect(page.getByRole("status")).toHaveText("Saved locally");
  await page.getByRole("button", { name: "Add Generic Client", exact: true }).click();
  await expect(page.locator(".react-flow__node")).toHaveCount(500);
  await expect(page.getByRole("status")).toHaveText("Saved locally");
  const selection = await page.locator(".react-flow__node.selected").getAttribute("data-id");
  await page.getByRole("button", { name: "Add Generic Client", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Edit not applied");
  await page.getByRole("button", { name: "Duplicate", exact: true }).click();
  await expect(page.locator(".react-flow__node")).toHaveCount(500);
  await expect(page.locator(".react-flow__node.selected")).toHaveAttribute("data-id", selection!);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".react-flow__node")).toHaveCount(499);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(page.locator(".react-flow__node")).toHaveCount(500);
  const node = (name: string) => page.locator(".react-flow__node").filter({ has: page.locator("strong", { hasText: new RegExp(`^${name}$`) }) });
  async function connect() {
    const from = (await node("Limit 0").locator('[data-handleid="right"]').boundingBox())!;
    const to = (await node("Limit 1").locator('[data-handleid="left"]').boundingBox())!;
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 10 });
    await page.mouse.up();
  }
  await connect();
  await expect(page.locator(".react-flow__edge")).toHaveCount(1000);
  await expect(page.getByRole("status")).toHaveText("Saved locally");
  await connect();
  await expect(page.getByRole("alert")).toContainText("at most 1000");
  await expect(page.locator(".react-flow__edge")).toHaveCount(1000);
  await expect(page.getByRole("status")).toHaveText("Saved locally");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  const path = await (await download).path();
  await page.locator("input[type=file]").setInputFiles(path!);
  await expect(page.getByRole("status")).toHaveText("Saved locally");
  await expect(page.locator(".react-flow__node")).toHaveCount(500);
  await expect(page.locator(".react-flow__edge")).toHaveCount(1000);
});
