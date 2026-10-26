import { test, expect } from "@playwright/test";
import { startEditor } from "./start-editor";

test("API Server has ordered independent decks and returns focus to its own entry", async ({ page }) => {
  await startEditor(page);
  await page.locator('.react-flow__node').filter({ hasText: 'API Server' }).first().click();
  const entries = page.locator('.inspector-learn button');
  await expect(entries).toHaveText(['Client / Server Model', 'API Server']);
  const api = page.getByRole('button', { name: 'Learn about API Server', exact: true });
  await api.click();
  const dialog = page.getByRole('dialog', { name: 'API Server', exact: true });
  for (let index = 1; index <= 5; index++) {
    await expect(dialog.getByText(`${index} of 5`)).toBeVisible();
    await page.screenshot({ path: `/tmp/api-server-slide-${index}.png` });
    if (index < 5) await dialog.getByRole('button', { name: 'Next slide' }).click();
  }
  await page.keyboard.press('Escape');
  await expect(api).toBeFocused();
  await page.getByRole('button', { name: 'Learn about client/server', exact: true }).click();
  await expect(page.getByRole('dialog').getByText('1 of 5')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'The client asks. The server responds.' })).toBeVisible();
  await page.keyboard.press('Escape');
  await api.click();
  await expect(dialog.getByText('1 of 5')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 700 });
  await expect(dialog.getByRole('button', { name: 'Next slide' })).toBeInViewport();
  await page.screenshot({ path: '/tmp/api-server-narrow.png' });
});

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
