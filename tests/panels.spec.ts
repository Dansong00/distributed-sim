import { test, expect, type Page } from "@playwright/test";
import { startEditor } from "./start-editor";

const componentsButton = (page: Page) => page.getByRole("button", { name: "Components panel", exact: true });
const propertiesButton = (page: Page) => page.getByRole("button", { name: "Properties panel", exact: true });
const canvasWidth = (page: Page) => page.locator(".canvas").evaluate(el => el.getBoundingClientRect().width);

for (const viewport of [{ width: 1280, height: 800 }, { width: 985, height: 543 }]) {
  test(`desktop panels independently release canvas width at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await startEditor(page);
    const components = componentsButton(page);
    const properties = propertiesButton(page);
    await expect(components).toBeVisible();
    await expect(properties).toBeVisible();
    await expect(components).toHaveAttribute("aria-expanded", "true");
    await expect(properties).toHaveAttribute("aria-expanded", "true");
    const initial = await canvasWidth(page);
    const leftWidth = await page.locator(".palette").evaluate(el => el.getBoundingClientRect().width);
    const rightWidth = await page.locator(".inspector").evaluate(el => el.getBoundingClientRect().width);

    await components.focus();
    await page.keyboard.press("Enter");
    await expect(components).toBeFocused();
    await expect(components).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(".palette")).toBeHidden();
    await expect(page.locator(".inspector")).toBeVisible();
    await expect.poll(() => canvasWidth(page)).toBeCloseTo(initial + leftWidth, 0);

    await properties.click();
    await expect(properties).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(".inspector")).toBeHidden();
    await expect.poll(() => canvasWidth(page)).toBeCloseTo(initial + leftWidth + rightWidth, 0);
    await page.screenshot({ path: `/tmp/panels-${viewport.width}-collapsed.png` });

    await components.click();
    await expect(page.locator(".palette")).toBeVisible();
    await expect(page.locator(".inspector")).toBeHidden();
    await expect.poll(() => canvasWidth(page)).toBeCloseTo(initial + rightWidth, 0);
    await properties.focus();
    await page.keyboard.press("Space");
    await expect(properties).toBeFocused();
    await expect(properties).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(".inspector")).toBeVisible();
    await expect.poll(() => canvasWidth(page)).toBeCloseTo(initial, 0);
    await page.screenshot({ path: `/tmp/panels-${viewport.width}-reopened.png` });
  });
}

for (const width of [900, 390]) {
  test(`compact drawers remain mutually exclusive and reopen by keyboard at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await startEditor(page);
    const components = componentsButton(page);
    const properties = propertiesButton(page);
    const initial = await canvasWidth(page);
    await expect(components).toHaveAttribute("aria-expanded", "false");
    await expect(properties).toHaveAttribute("aria-expanded", "false");
    await components.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".palette")).toBeVisible();
    await properties.focus();
    await page.keyboard.press("Space");
    await expect(page.locator(".palette")).toBeHidden();
    await expect(components).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(".inspector")).toBeVisible();
    await page.keyboard.press("Space");
    await expect(page.locator(".inspector")).toBeHidden();
    await page.screenshot({ path: `/tmp/panels-${width}-collapsed.png` });
    await page.keyboard.press("Enter");
    await expect(page.locator(".inspector")).toBeVisible();
    await expect.poll(() => canvasWidth(page)).toBe(initial);
    await page.screenshot({ path: `/tmp/panels-${width}-reopened.png` });
  });
}

test("resizing preserves desktop choices and reports the active drawer", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await startEditor(page);
  await componentsButton(page).click();
  await page.setViewportSize({ width: 900, height: 800 });
  await expect(componentsButton(page)).toHaveAttribute("aria-expanded", "false");
  await expect(propertiesButton(page)).toHaveAttribute("aria-expanded", "false");
  await componentsButton(page).click();
  await page.setViewportSize({ width: 985, height: 543 });
  await expect(page.locator(".palette")).toBeHidden();
  await expect(page.locator(".inspector")).toBeVisible();
  await expect(componentsButton(page)).toHaveAttribute("aria-expanded", "false");
  await expect(propertiesButton(page)).toHaveAttribute("aria-expanded", "true");
  await page.setViewportSize({ width: 900, height: 800 });
  await expect(page.locator(".palette")).toBeVisible();
  await expect(page.locator(".inspector")).toBeHidden();
  await expect(componentsButton(page)).toHaveAttribute("aria-expanded", "true");
  await expect(propertiesButton(page)).toHaveAttribute("aria-expanded", "false");
});

test("panel toggles preserve selection, edits, viewport and undo history", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await startEditor(page);
  await page.locator(".component-copy strong", { hasText: "Notes API" }).click();
  const name = page.getByLabel("Name", { exact: true });
  await name.fill("Edited API");
  await name.press("Tab");
  const nodes = page.locator(".react-flow__node");
  const geometry = await nodes.evaluateAll(elements => elements.map(el => el.getAttribute("style")));
  const transform = await page.locator(".react-flow__viewport").getAttribute("style");
  await componentsButton(page).click();
  await propertiesButton(page).click();
  await propertiesButton(page).click();
  await componentsButton(page).click();
  await expect(name).toHaveValue("Edited API");
  await expect(page.locator(".react-flow__node.selected")).toHaveCount(1);
  expect(await nodes.evaluateAll(elements => elements.map(el => el.getAttribute("style")))).toEqual(geometry);
  await expect(page.locator(".react-flow__viewport")).toHaveAttribute("style", transform!);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(name).toHaveValue("Notes API");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(name).toHaveValue("Edited API");
});
