import { test, expect } from "@playwright/test";
import { startEditor } from "./start-editor";

for (const viewport of [{ width: 1280, height: 900 }, { width: 985, height: 543 }, { width: 390, height: 700 }]) {
  test(`caching stack preserves the canvas and stays usable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await startEditor(page);
    await page.getByLabel("Search components").fill("Redis");
    await page.getByRole("button", { name: "Add Redis", exact: true }).click();
    await page.locator(".react-flow__node").filter({ hasText: "Redis" }).last().click();
    const name = page.getByLabel("Name", { exact: true });
    await name.fill("Product details");
    await name.press("Tab");
    const count = await page.locator(".react-flow__node").count();
    await page.setViewportSize(viewport);
    if (viewport.width <= 900) await page.getByRole("button", { name: "Properties panel", exact: true }).click();
    const transform = await page.locator(".react-flow__viewport").getAttribute("style");
    const opener = page.getByRole("button", { name: "Learn about Caching Fundamentals", exact: true });
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Caching Fundamentals", exact: true });
    await expect(dialog.getByRole("button", { name: "Previous slide" })).toBeDisabled();
    for (let slide = 1; slide <= 8; slide++) {
      await expect(dialog.getByText(`${slide} of 8`, { exact: true })).toBeVisible();
      const content = dialog.locator(".lesson-body");
      expect(await content.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      await expect(dialog.getByRole("button", { name: "Next slide" })).toBeInViewport();
      if (slide === 2 || slide === 4) await expect(dialog.getByRole("figure")).toBeVisible();
      const source = dialog.getByRole("link", { name: "Source reference", exact: true });
      await expect(source).toHaveAttribute("href", /^https:\/\//);
      await page.screenshot({ path: `/tmp/caching-${viewport.width}-${slide}.png` });
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
    await opener.click();
    await expect(dialog.getByText("1 of 8", { exact: true })).toBeVisible();
    await dialog.getByRole("button", { name: "Close lesson" }).click();
    await expect(name).toHaveValue("Product details");
    await expect(page.locator(".react-flow__node")).toHaveCount(count);
    await expect(page.locator(".react-flow__node.selected")).toHaveCount(1);
    await expect(page.locator(".react-flow__viewport")).toHaveAttribute("style", transform ?? "");
  });
}

for (const product of ["Generic Cache", "Memcached"]) {
  test(`${product} opens the shared caching stack`, async ({ page }) => {
    await startEditor(page);
    await page.getByLabel("Search components").fill(product);
    await page.getByRole("button", { name: `Add ${product}`, exact: true }).click();
    await page.locator(".react-flow__node").filter({ hasText: product }).last().click();
    await page.getByRole("button", { name: "Learn about Caching Fundamentals", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Caching Fundamentals", exact: true }).getByText("1 of 8", { exact: true })).toBeVisible();
  });
}
