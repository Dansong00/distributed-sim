import { test, expect, type Page } from '@playwright/test';
import { createDiagram } from '../src/domain/templates';

async function open(page: Page) {
  const diagram = createDiagram('web', 'Auto mode');
  diagram.nodes = diagram.nodes.filter(n => n.kind === 'component' && n.componentType === 'server');
  diagram.nodes[0].position = { x: 220, y: 160 };
  diagram.edges = [];
  diagram.viewport = { x: 0, y: 0, zoom: 1 };
  await page.goto('/');
  await page.locator('input[type=file]').setInputFiles({ name: 'auto.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(diagram)) });
  await expect(page.getByRole('status')).toHaveText('Saved locally');
}
async function drag(page: Page, x: number, y: number, dx: number, dy: number) {
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 10 });
  await page.mouse.up();
}

test('Auto pans empty canvas and selects/moves components; manual tools and Space still work', async ({ page }) => {
  await open(page);
  const mode = (name: string) => page.getByRole('button', { name, exact: true });
  await expect(mode('Auto')).toHaveAttribute('aria-pressed', 'true');
  const viewport = page.locator('.react-flow__viewport');
  const node = page.locator('.react-flow__node');
  const pane = (await page.locator('.react-flow__pane').boundingBox())!;
  const originalNode = await node.evaluate(el => getComputedStyle(el).transform);
  const originalViewport = await viewport.getAttribute('style');
  await drag(page, pane.x + 30, pane.y + 30, 70, 50);
  await expect(viewport).not.toHaveAttribute('style', originalViewport!);
  await expect(node).toHaveCSS('transform', originalNode);
  await node.click();
  await expect(node).toHaveClass(/selected/);
  const beforeMove = await viewport.getAttribute('style');
  const box = (await node.boundingBox())!;
  await drag(page, box.x + box.width / 2, box.y + box.height / 2, 55, 35);
  await expect(node).not.toHaveCSS('transform', originalNode);
  await expect(viewport).toHaveAttribute('style', beforeMove!);
  await mode('Undo').click();
  await expect(node).toHaveCSS('transform', originalNode);

  await mode('Select').click();
  await page.mouse.click(pane.x + 15, pane.y + 15);
  const selectBox = (await node.boundingBox())!;
  await drag(page, selectBox.x - 20, selectBox.y - 20, selectBox.width + 40, selectBox.height + 40);
  await expect(node).toHaveClass(/selected/);
  await expect(viewport).toHaveAttribute('style', beforeMove!);

  await mode('Pan').click();
  const panBox = (await node.boundingBox())!;
  await drag(page, panBox.x + panBox.width / 2, panBox.y + panBox.height / 2, 40, 30);
  await expect(node).toHaveCSS('transform', originalNode);
  await drag(page, pane.x + 30, pane.y + 30, 40, 30);
  await expect(viewport).not.toHaveAttribute('style', beforeMove!);

  await mode('Select').click();
  await mode('Select').blur();
  const beforeSpace = await viewport.getAttribute('style');
  await page.keyboard.down('Space');
  await drag(page, pane.x + 100, pane.y + 90, -40, -30);
  await page.keyboard.up('Space');
  await expect(node).toHaveCSS('transform', originalNode);
  await expect(viewport).not.toHaveAttribute('style', beforeSpace!);
  await expect(mode('Select')).toHaveAttribute('aria-pressed', 'true');
  await mode('Auto').click();
  await expect(mode('Auto')).toHaveAttribute('aria-pressed', 'true');
  await page.screenshot({ path: '/tmp/auto-mode-desktop.png' });
  await page.setViewportSize({ width: 390, height: 700 });
  for (const name of ['Auto', 'Select', 'Pan']) await expect(mode(name)).toBeInViewport();
  await page.screenshot({ path: '/tmp/auto-mode-mobile.png' });
});
