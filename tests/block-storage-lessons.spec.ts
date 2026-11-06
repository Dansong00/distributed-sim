import { test, expect } from "@playwright/test";
import { startEditor } from "./start-editor";

for (const viewport of [{ width: 1280, height: 900 }, { width: 985, height: 543 }, { width: 390, height: 700 }]) {
  test(`block storage stack remains readable at ${viewport.width}x${viewport.height}`, async ({ page }, testInfo) => {
    await startEditor(page);
    await page.getByLabel("Search components").fill("Amazon EBS");
    await page.getByRole("button", { name: "Add Amazon EBS", exact: true }).click();
    const node = page.locator(".react-flow__node").filter({ hasText: "Amazon EBS" }).last();
    await node.click();
    await page.getByLabel("Name", { exact: true }).fill("Database volume");
    await page.getByLabel("Name", { exact: true }).press("Tab");
    const count = await page.locator(".react-flow__node").count();
    await page.setViewportSize(viewport);
    if (viewport.width <= 900) await page.getByRole("button", { name: "Properties panel", exact: true }).click();
    const transform = await page.locator(".react-flow__viewport").getAttribute("style");
    const opener = page.getByRole("button", { name: "Learn about Block Storage", exact: true });
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Block Storage", exact: true });
    await expect(dialog.getByRole("button", { name: "Previous slide" })).toBeDisabled();
    for (let slide = 1; slide <= 8; slide++) {
      await expect(dialog.getByText(`${slide} of 8`, { exact: true })).toBeVisible();
      expect(await dialog.locator(".lesson-body").evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      await expect(dialog.getByRole("button", { name: "Next slide" })).toBeInViewport();
      if (slide === 1 || slide === 5) await expect(dialog.getByRole("figure")).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath(`slide-${slide}.png`) });
      const source = dialog.getByRole("link", { name: "Source reference", exact: true });
      await expect(source).toHaveAttribute("href", /^https:\/\//);
      await source.scrollIntoViewIfNeeded();
      await expect(source).toBeInViewport();
      await page.screenshot({ path: testInfo.outputPath(`slide-${slide}-end.png`) });
      if (slide < 8) {
        await source.focus();
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("Delete");
      }
    }
    await expect(dialog.getByRole("button", { name: "Next slide" })).toBeDisabled();
    await page.keyboard.press("ArrowLeft");
    await expect(dialog.getByText("7 of 8", { exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(opener).toBeFocused();
    await expect(page.getByLabel("Name", { exact: true })).toHaveValue("Database volume");
    await expect(page.locator(".react-flow__node")).toHaveCount(count);
    await expect(page.locator(".react-flow__node.selected")).toHaveCount(1);
    await expect(page.locator(".react-flow__viewport")).toHaveAttribute("style", transform ?? "");
    await opener.click();
    await expect(dialog.getByText("1 of 8", { exact: true })).toBeVisible();
    await dialog.getByRole("button", { name: "Close lesson" }).click();
  });
}

test("Generic Block Storage exposes the block-storage foundation", async ({ page }) => {
  await startEditor(page);
  await page.getByLabel("Search components").fill("Generic Block Storage");
  await page.getByRole("button", { name: "Add Generic Block Storage", exact: true }).click();
  await page.locator(".react-flow__node").filter({ hasText: "Generic Block Storage" }).last().click();
  await expect(page.locator(".inspector-learn button")).toHaveText(["Block Storage"]);
  await page.getByRole("button", { name: "Learn about Block Storage", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Block Storage", exact: true }).getByText("1 of 8", { exact: true })).toBeVisible();
});
