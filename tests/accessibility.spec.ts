import { test, expect } from "@playwright/test";
import { startEditor } from "./start-editor";

test("dialog traps focus, Escape closes and restores the trigger", async ({
  page,
}) => {
  await startEditor(page);
  await page.locator(".component-copy strong", { hasText: "Notes API" }).click();
  const trigger = page.getByRole("button", {
    name: "Diagram actions",
    exact: true,
  });
  await trigger.click();
  await page.getByRole("button", { name: "Delete diagram", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Delete this diagram?" });
  await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Delete permanently", exact: true })).toBeFocused();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    expect(
      await dialog.evaluate((el) => el.contains(document.activeElement)),
    ).toBe(true);
  }
  await page.getByRole("button", { name: "Cancel", exact: true }).focus();
  await page.keyboard.press("Delete");
  await expect(page.locator(".component-card")).toHaveCount(3);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("900px drawers expose components and properties using keyboard", async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 800 });
  await startEditor(page);
  const components = page.getByRole("button", {
    name: "Components panel",
    exact: true,
  });
  await components.focus();
  await page.keyboard.press("Enter");
  const add = page.getByRole("button", {
    name: "Add Generic Client",
    exact: true,
  });
  await add.focus();
  await page.keyboard.press("Enter");
  await page
    .getByRole("button", { name: "Properties panel", exact: true })
    .click();
  const name = page.getByLabel("Name", { exact: true });
  await name.focus();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.type("Keyboard client");
  await page.keyboard.press("Delete");
  await page.keyboard.press("Tab");
  await expect(
    page.locator(".component-copy strong", { hasText: "Keyboard client" }),
  ).toHaveCount(1);
  await expect(page.locator(".component-card")).toHaveCount(4);
  await page.screenshot({
    path: "/tmp/canvas-task7-narrow.png",
    fullPage: true,
  });
});

test("imported markup stays inert and unknown technology has a generic icon", async ({
  page,
}) => {
  await page.goto("/");
  const text = "<img src=x onerror=alert(1)>";
  const document = {
    schemaVersion: 1,
    id: "safe",
    name: text,
    createdAt: "2026-10-15T00:00:00Z",
    updatedAt: "2026-10-15T00:00:00Z",
    viewport: { x: 20, y: 20, zoom: 1 },
    nodes: [
      {
        id: "n",
        kind: "component",
        name: text,
        notes: text,
        description: text,
        technology: "Unknown",
        componentType: "server",
        category: "Compute",
        position: { x: 50, y: 50 },
        width: 200,
        height: 88,
      },
    ],
    edges: [],
  };
  await page.locator("input[type=file]").setInputFiles({
    name: "safe.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(document)),
  });
  await expect(page.locator(".component-copy strong")).toHaveText(text);
  await expect(page.locator(".component-card img")).toHaveCount(0);
  await expect(page.locator(".component-icon svg")).toHaveCount(1);
});
