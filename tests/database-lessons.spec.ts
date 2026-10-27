import { test, expect } from "@playwright/test";
import { startEditor } from "./start-editor";

for (const product of ["PostgreSQL", "SQLite", "MySQL"]) {
for (const viewport of [{ width: 1280, height: 900 }, { width: 985, height: 543 }, { width: 390, height: 700 }]) {
  test(`${product} decks remain independent and usable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await startEditor(page);
    await page.getByLabel("Search components").fill(product);
    await page.getByRole("button", { name: `Add ${product}`, exact: true }).click();
    await page.locator(".react-flow__node").filter({ hasText: product }).last().click();
    const name = page.getByLabel("Name", { exact: true });
    await name.fill("Order store");
    await name.press("Tab");
    await expect(page.locator(".inspector-learn button")).toHaveText(["Database Overview", "CAP Theorem", product]);
    const nodeCount = await page.locator(".react-flow__node").count();
    const transform = await page.locator(".react-flow__viewport").getAttribute("style");
    await page.setViewportSize(viewport);
    if (viewport.width <= 900) await page.getByRole("button", { name: "Properties panel", exact: true }).click();

    for (const title of ["Database Overview", "CAP Theorem", product]) {
      const slideCount = title === "SQLite" || title === "MySQL" || title === "CAP Theorem" ? 9 : 8;
      const opener = page.getByRole("button", { name: `Learn about ${title}`, exact: true });
      await opener.click();
      const dialog = page.getByRole("dialog", { name: title, exact: true });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("button", { name: "Previous slide" })).toBeDisabled();
      for (let slide = 1; slide <= slideCount; slide++) {
        await expect(dialog.getByText(`${slide} of ${slideCount}`, { exact: true })).toBeVisible();
        const content = dialog.locator(".lesson-body");
        expect(await content.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
        await expect(dialog.getByRole("button", { name: "Next slide" })).toBeInViewport();
        if (title === "PostgreSQL" && slide === 3) {
          await expect(dialog.getByText("A · Atomicity", { exact: true })).toBeVisible();
          await expect(dialog.getByText("C · Consistency", { exact: true })).toBeVisible();
          await expect(dialog.getByText("I · Isolation", { exact: true })).toBeVisible();
          await expect(dialog.getByText("D · Durability", { exact: true })).toBeVisible();
        }
        if ((title === "SQLite" || title === "MySQL") && slide === 4) {
          for (const concept of ["Atomicity", "Consistency", "Isolation", "Durability"]) {
            await expect(content.locator("strong").filter({ hasText: `${concept}:` })).toHaveCount(1);
          }
        }
        await page.screenshot({ path: `/tmp/${title === "Database Overview" ? "databases" : title.toLowerCase().replaceAll(" ", "-")}-${viewport.width}-${slide}.png` });
        if (slide < slideCount) {
          const source = dialog.getByRole("link", { name: "Source reference", exact: true });
          await source.focus();
          await page.keyboard.press("ArrowRight");
          await page.keyboard.press("Delete");
          await expect(dialog).toBeVisible();
        }
      }
      await expect(dialog.getByRole("button", { name: "Next slide" })).toBeDisabled();
      await page.keyboard.press("Escape");
      await expect(opener).toBeFocused();
      await opener.click();
      await expect(dialog.getByText(`1 of ${slideCount}`, { exact: true })).toBeVisible();
      await dialog.getByRole("button", { name: "Close lesson" }).click();
    }
    await expect(name).toHaveValue("Order store");
    await expect(page.locator(".react-flow__node")).toHaveCount(nodeCount);
    await expect(page.locator(".react-flow__node.selected")).toHaveCount(1);
    await expect(page.locator(".react-flow__viewport")).toHaveAttribute("style", transform!);
    await page.getByLabel("Technology", { exact: true }).fill("MongoDB");
    await page.getByLabel("Technology", { exact: true }).press("Tab");
    await expect(page.locator(".inspector-learn button")).toHaveText(["Database Overview", "CAP Theorem"]);
  });
}
}
