import { test, expect } from "@playwright/test";
import { startEditor } from "./start-editor";

for (const viewport of [{ width: 1280, height: 900 }, { width: 985, height: 543 }, { width: 390, height: 700 }]) {
  test(`key-value access stays usable and preserves the canvas at ${viewport.width}x${viewport.height}`, async ({ page }, testInfo) => {
    await startEditor(page);
    await page.getByLabel("Search components").fill("DynamoDB");
    await page.getByRole("button", { name: "Add DynamoDB", exact: true }).click();
    await page.locator(".react-flow__node").filter({ hasText: "DynamoDB" }).last().click();
    const name = page.getByLabel("Name", { exact: true });
    await name.fill("Account preferences");
    await name.press("Tab");
    await expect(page.locator(".inspector-learn button")).toHaveText(["Database Overview", "CAP Theorem", "Replication", "Key-Value Data Access"]);
    const count = await page.locator(".react-flow__node").count();
    await page.setViewportSize(viewport);
    if (viewport.width <= 900) await page.getByRole("button", { name: "Properties panel", exact: true }).click();
    const transform = await page.locator(".react-flow__viewport").getAttribute("style");
    const opener = page.getByRole("button", { name: "Learn about Key-Value Data Access", exact: true });
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Key-Value Data Access", exact: true });
    await expect(dialog.getByRole("button", { name: "Previous slide" })).toBeDisabled();
    for (let slide = 1; slide <= 9; slide++) {
      await expect(dialog.getByText(`${slide} of 9`, { exact: true })).toBeVisible();
      expect(await dialog.locator(".lesson-body").evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      await expect(dialog.getByRole("button", { name: "Next slide" })).toBeInViewport();
      if (slide === 3 || slide === 5) await expect(dialog.getByRole("figure")).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath(`card-${slide}.png`) });
      const source = dialog.getByRole("link", { name: "Source reference", exact: true });
      await expect(source).toHaveAttribute("href", /^https:\/\//);
      await source.scrollIntoViewIfNeeded();
      await expect(source).toBeInViewport();
      await page.screenshot({ path: testInfo.outputPath(`card-${slide}-end.png`) });
      if (slide < 9) {
        await source.focus();
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("Delete");
      }
    }
    await expect(dialog.getByRole("button", { name: "Next slide" })).toBeDisabled();
    await page.keyboard.press("ArrowLeft");
    await expect(dialog.getByText("8 of 9", { exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(opener).toBeFocused();
    await opener.click();
    await expect(dialog.getByText("1 of 9", { exact: true })).toBeVisible();
    await dialog.getByRole("button", { name: "Close lesson" }).click();
    await expect(name).toHaveValue("Account preferences");
    await expect(page.locator(".react-flow__node")).toHaveCount(count);
    await expect(page.locator(".react-flow__node.selected")).toHaveCount(1);
    await expect(page.locator(".react-flow__viewport")).toHaveAttribute("style", transform ?? "");
    await page.getByLabel("Technology", { exact: true }).fill("MongoDB");
    await page.getByLabel("Technology", { exact: true }).press("Tab");
    await expect(opener).toHaveCount(0);
    await expect(page.locator(".inspector-learn button")).toHaveText(["Database Overview", "CAP Theorem", "Replication"]);
  });
}

for (const product of ["Generic Database", "Generic Cache", "Redis", "Memcached"]) {
  test(`${product} offers key-value access alongside its existing foundations`, async ({ page }) => {
    await startEditor(page);
    await page.getByLabel("Search components").fill(product);
    await page.getByRole("button", { name: `Add ${product}`, exact: true }).click();
    await page.locator(".react-flow__node").filter({ hasText: product }).last().click();
    await expect(page.locator(".inspector-learn button")).toHaveText(product === "Generic Database"
      ? ["Database Overview", "CAP Theorem", "Replication", "Key-Value Data Access"]
      : ["Caching Fundamentals", "Key-Value Data Access"]);
    await page.getByRole("button", { name: "Learn about Key-Value Data Access", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Key-Value Data Access", exact: true }).getByText("1 of 9", { exact: true })).toBeVisible();
  });
}
