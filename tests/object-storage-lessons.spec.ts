import { test, expect } from "@playwright/test";
import { startEditor } from "./start-editor";

for (const viewport of [{ width: 1280, height: 900 }, { width: 985, height: 543 }, { width: 390, height: 700 }]) {
  test(`object storage stack remains readable at ${viewport.width}x${viewport.height}`, async ({ page }, testInfo) => {
    await startEditor(page);
    await page.getByLabel("Search components").fill("S3");
    await page.getByRole("button", { name: "Add S3", exact: true }).click();
    const node = page.locator(".react-flow__node").filter({ hasText: "S3" }).last();
    await node.click();
    await page.getByLabel("Name", { exact: true }).fill("Note files");
    await page.getByLabel("Name", { exact: true }).press("Tab");
    const count = await page.locator(".react-flow__node").count();
    await page.setViewportSize(viewport);
    if (viewport.width <= 900) await page.getByRole("button", { name: "Properties panel", exact: true }).click();
    const opener = page.getByRole("button", { name: "Learn about Object Storage", exact: true });
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Object Storage", exact: true });
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
      if (slide === 4 || slide === 6) await page.screenshot({ path: testInfo.outputPath(`slide-${slide}-end.png`) });
      if (slide < 8) await dialog.getByRole("button", { name: "Next slide" }).click();
    }
    await expect(dialog.getByRole("button", { name: "Next slide" })).toBeDisabled();
    await page.keyboard.press("ArrowLeft");
    await expect(dialog.getByText("7 of 8", { exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(opener).toBeFocused();
    await expect(page.getByLabel("Name", { exact: true })).toHaveValue("Note files");
    await expect(page.locator(".react-flow__node")).toHaveCount(count);
    await expect(page.locator(".react-flow__node.selected")).toHaveCount(1);
    await opener.click();
    await expect(dialog.getByText("1 of 8", { exact: true })).toBeVisible();
    await dialog.getByRole("button", { name: "Close lesson" }).click();
  });
}
