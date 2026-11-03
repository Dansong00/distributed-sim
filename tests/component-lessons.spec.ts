import { test, expect } from "@playwright/test";
import { startEditor } from "./start-editor";

for (const viewport of [{ width: 1280, height: 900 }, { width: 985, height: 543 }, { width: 390, height: 700 }]) {
  test(`Client/server and API decks remain independent at ${viewport.width}x${viewport.height}`, async ({ page }, testInfo) => {
    await startEditor(page);
    await page.locator(".react-flow__node").filter({ hasText: "API Server" }).first().click();
    await expect(page.locator(".inspector-learn button")).toHaveText(["Client / Server Model", "API Server"]);
    const count = await page.locator(".react-flow__node").count();
    await page.setViewportSize(viewport);
    if (viewport.width <= 900) await page.getByRole("button", { name: "Properties panel", exact: true }).click();
    for (const [title, label] of [["Client / Server Model", "Learn about client/server"], ["API Server", "Learn about API Server"]]) {
      const opener = page.getByRole("button", { name: label, exact: true });
      await opener.click();
      const dialog = page.getByRole("dialog", { name: title, exact: true });
      await expect(dialog.getByRole("button", { name: "Previous slide" })).toBeDisabled();
      for (let slide = 1; slide <= 5; slide++) {
        await expect(dialog.getByText(`${slide} of 5`, { exact: true })).toBeVisible();
        expect(await dialog.locator(".lesson-body").evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
        await expect(dialog.getByRole("button", { name: "Next slide" })).toBeInViewport();
        await page.screenshot({ path: testInfo.outputPath(`${title === "API Server" ? "api" : "client"}-${slide}.png`) });
        const source = dialog.getByRole("link", { name: "Source reference", exact: true });
        await expect(source).toHaveAttribute("href", /^https:\/\//);
        await source.scrollIntoViewIfNeeded();
        await expect(source).toBeInViewport();
        await page.screenshot({ path: testInfo.outputPath(`${title === "API Server" ? "api" : "client"}-${slide}-end.png`) });
        if (slide < 5) await dialog.getByRole("button", { name: "Next slide" }).click();
      }
      await expect(dialog.getByRole("button", { name: "Next slide" })).toBeDisabled();
      await page.keyboard.press("Escape");
      await expect(opener).toBeFocused();
      await opener.click();
      await expect(dialog.getByText("1 of 5", { exact: true })).toBeVisible();
      await dialog.getByRole("button", { name: "Close lesson" }).click();
    }
    await expect(page.getByLabel("Name", { exact: true })).toHaveValue("Notes API");
    await expect(page.locator(".react-flow__node")).toHaveCount(count);
    await expect(page.locator(".react-flow__node.selected")).toHaveCount(1);
  });
}

test("lesson navigation and dismissal preserve the selected component", async ({ page }) => {
  await startEditor(page);
  await page.locator('.react-flow__node').filter({ hasText: 'API Server' }).first().click();
  const opener = page.getByRole('button', { name: 'Learn about client/server' });
  await opener.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('1 of 5')).toBeVisible();
  await dialog.getByRole('link', { name: 'Source reference' }).focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Delete');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await expect(dialog.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
  await dialog.getByRole('button', { name: 'Next slide' }).click();
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByText('3 of 5')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  await opener.click();
  await expect(dialog.getByText('1 of 5')).toBeVisible();
  await page.screenshot({ path: '/tmp/component-lesson-desktop.png' });
  for (let slide = 1; slide <= 5; slide++) {
    await expect(dialog.getByText(`${slide} of 5`)).toBeVisible();
    if (slide === 4) {
      await expect(dialog.getByRole('heading', { name: 'What do you gain, and what do you give up?' })).toBeVisible();
      await expect(dialog.getByText('On the client', { exact: true })).toBeVisible();
      await expect(dialog.getByText('On the server', { exact: true })).toBeVisible();
      await expect(dialog.getByText('Reply lost', { exact: true })).toHaveCount(0);
    }
    await page.screenshot({ path: `/tmp/lesson-revised-${slide}.png` });
    if (slide < 5) await dialog.getByRole('button', { name: 'Next slide' }).click();
  }
  await expect(dialog.getByRole('button', { name: 'Next slide' })).toBeDisabled();
  for (let slide = 5; slide > 1; slide--) await dialog.getByRole('button', { name: 'Previous slide' }).click();
  await page.setViewportSize({ width: 390, height: 700 });
  await page.screenshot({ path: '/tmp/component-lesson-mobile.png' });
  await expect(dialog.getByRole('button', { name: 'Next slide' })).toBeInViewport();
  for (let slide = 1; slide <= 5; slide++) {
    await expect(dialog.getByText(`${slide} of 5`)).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Close lesson' })).toBeInViewport();
    await page.screenshot({ path: `/tmp/lesson-narrow-${slide}.png` });
    if (slide < 5) await dialog.getByRole('button', { name: 'Next slide' }).click();
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await dialog.getByRole('button', { name: 'Close lesson' }).click();
  await opener.click();
  await page.mouse.click(2, 2);
  await expect(dialog).toHaveCount(0);
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Notes API');
});
