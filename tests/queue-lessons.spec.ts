import { test, expect } from "@playwright/test";
import { startEditor } from "./start-editor";

const title = "Message Queues and Background Workers";

for (const viewport of [{ width: 1280, height: 900 }, { width: 985, height: 543 }, { width: 390, height: 700 }]) {
  test(`queue stack preserves the canvas at ${viewport.width}x${viewport.height}`, async ({ page }, testInfo) => {
    await startEditor(page);
    await page.getByLabel("Search components").fill("Generic Queue");
    await page.getByRole("button", { name: "Add Generic Queue", exact: true }).click();
    await page.locator(".react-flow__node").filter({ hasText: "Generic Queue" }).last().click();
    const name = page.getByLabel("Name", { exact: true });
    await name.fill("Receipt jobs");
    await name.press("Tab");
    const count = await page.locator(".react-flow__node").count();
    await page.setViewportSize(viewport);
    if (viewport.width <= 900) await page.getByRole("button", { name: "Properties panel", exact: true }).click();
    const transform = await page.locator(".react-flow__viewport").getAttribute("style");
    const opener = page.getByRole("button", { name: `Learn about ${title}`, exact: true });
    await opener.click();
    const dialog = page.getByRole("dialog", { name: title, exact: true });
    await expect(dialog.getByRole("button", { name: "Previous slide" })).toBeDisabled();
    for (let slide = 1; slide <= 8; slide++) {
      await expect(dialog.getByText(`${slide} of 8`, { exact: true })).toBeVisible();
      const content = dialog.locator(".lesson-body");
      expect(await content.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      await expect(dialog.getByRole("button", { name: "Next slide" })).toBeInViewport();
      if (slide === 2 || slide === 7) await expect(dialog.getByRole("figure")).toBeVisible();
      const source = dialog.getByRole("link", { name: "Source reference", exact: true });
      await expect(source).toHaveAttribute("href", /^https:\/\//);
      await page.screenshot({ path: testInfo.outputPath(`slide-${slide}.png`) });
      await source.scrollIntoViewIfNeeded();
      await expect(source).toBeInViewport();
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
    await expect(name).toHaveValue("Receipt jobs");
    await expect(page.locator(".react-flow__node")).toHaveCount(count);
    await expect(page.locator(".react-flow__node.selected")).toHaveCount(1);
    await expect(page.locator(".react-flow__viewport")).toHaveAttribute("style", transform ?? "");
  });
}

for (const product of ["Kafka", "RabbitMQ", "SQS", "Worker"]) {
  test(`${product} opens the queue stack with the correct deck order`, async ({ page }) => {
    await startEditor(page);
    await page.getByLabel("Search components").fill(product);
    await page.getByRole("button", { name: `Add ${product}`, exact: true }).click();
    await page.locator(".react-flow__node").filter({ hasText: product }).last().click();
    await expect(page.getByRole("button", { name: /^Learn about / })).toHaveText(
      product === "Worker" ? ["Client / Server Model", title] : [title],
    );
    await page.getByRole("button", { name: `Learn about ${title}`, exact: true }).click();
    await expect(page.getByRole("dialog", { name: title, exact: true }).getByText("1 of 8", { exact: true })).toBeVisible();
  });
}
