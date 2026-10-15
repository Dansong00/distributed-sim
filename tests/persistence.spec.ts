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
