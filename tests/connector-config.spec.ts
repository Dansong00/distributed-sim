import { expect, test, type Page, type Locator } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createDiagram } from "../src/domain/templates";
import type { Diagram } from "../src/domain/model";

async function open(page: Page, configured = false) {
  const doc = createDiagram("web", "Connector settings");
  doc.nodes.forEach((n, i) => { n.position = { x: 40 + i * 290, y: 210 }; });
  if (configured) {
    doc.edges[0] = { ...doc.edges[0], stroke: "dashed", path: "curved", direction: "both" };
    doc.edges[1] = { ...doc.edges[1], stroke: "dotted", path: "straight" };
  }
  await page.goto("/");
  await page.locator('input[type=file]').setInputFiles({ name: 'styles.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(doc)) });
  await expect(page.locator('.react-flow__edge')).toHaveCount(2);
  await expect(page.getByRole('status')).toHaveText('Saved locally');
}
async function selectEdge(page: Page, index = 0) {
  const p = await page.locator('.react-flow__edge-path').nth(index).evaluate(el => {
    const path = el as SVGPathElement, p = path.getPointAtLength(path.getTotalLength() * .35);
    const screen = new DOMPoint(p.x, p.y).matrixTransform(path.getScreenCTM()!);
    return { x: screen.x, y: screen.y };
  });
  await page.mouse.click(p.x, p.y);
  await expect(page.locator('.react-flow__edge').nth(index)).toHaveClass(/selected/);
}
async function exported(page: Page): Promise<Diagram> {
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON', exact: true }).click();
  return JSON.parse(await readFile((await (await pending).path())!, 'utf8'));
}
async function appearance(path: Locator) {
  return path.evaluate(el => { const s = getComputedStyle(el); return { stroke: s.stroke, width: Number(s.strokeWidth.replace('px','')), dash: s.strokeDasharray }; });
}

test('all stroke/path combinations visibly select the line and retain solid hit targets and arrowheads', async ({ page }) => {
  await open(page);
  await selectEdge(page);
  const line = page.locator('.react-flow__edge-path').first();
  for (const shape of ['straight', 'curved', 'elbow']) for (const stroke of ['solid', 'dashed', 'dotted']) {
    await page.getByLabel('Path shape').selectOption(shape);
    await page.getByLabel('Stroke style').selectOption(stroke);
    const selected = await appearance(line);
    expect(selected.width).toBeGreaterThan(1.5);
    expect(selected.dash === 'none').toBe(stroke === 'solid');
    const target = page.locator('.react-flow__edge-interaction').first();
    expect(await target.evaluate(el => getComputedStyle(el).strokeDasharray)).toBe('none');
    await expect(line).toHaveAttribute('marker-end', /url/);
    await page.keyboard.press('Escape');
    const idle = await appearance(line);
    expect(idle.width).toBeLessThan(selected.width);
    expect(idle.stroke).not.toBe(selected.stroke);
    await selectEdge(page);
  }
  await page.getByLabel('Direction', { exact: true }).selectOption('both');
  await expect(line).toHaveAttribute('marker-start', /url/);
  await page.getByLabel('Label', { exact: true }).fill('Edited connection');
  await page.getByLabel('Label', { exact: true }).blur();
  await expect(page.locator('.edge-label').first()).toHaveText('Edited connection');
});

test('mixed component and connector selection batches only the edited setting with one undo', async ({ page }) => {
  await open(page, true);
  const before = await exported(page);
  await selectEdge(page, 0);
  await page.keyboard.down('Shift');
  await selectEdge(page, 1);
  await page.keyboard.up('Shift');
  await expect(page.getByRole('heading', { name: 'Connections (2)' })).toBeVisible();
  await expect(page.getByLabel('Name', { exact: true })).toHaveCount(0);
  await expect(page.locator('.react-flow__edge.selected')).toHaveCount(2);
  for (const line of await page.locator('.react-flow__edge-path').all()) expect((await appearance(line)).width).toBeGreaterThan(1.5);
  await page.locator('.canvas').click({ position: { x: 40, y: 80 } });
  await page.keyboard.press('Control+a');
  await expect(page.getByRole('heading', { name: 'Connections (2)' })).toBeVisible();
  await expect(page.getByLabel('Name', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Stroke style')).toHaveValue('mixed');
  await expect(page.getByLabel('Path shape')).toHaveValue('mixed');
  await page.getByLabel('Stroke style').selectOption('solid');
  const changed = await exported(page);
  expect(changed.nodes).toEqual(before.nodes);
  expect(changed.edges.map(e => e.path)).toEqual(['curved','straight']);
  expect(changed.edges.map(e => e.stroke)).toEqual(['solid','solid']);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  expect((await exported(page)).edges).toEqual(before.edges);
  await page.getByLabel('Path shape').selectOption('elbow');
  const paths = await exported(page);
  expect(paths.edges.map(e => e.stroke)).toEqual(['dashed','dotted']);
  expect(paths.edges.map(e => e.path)).toEqual(['elbow','elbow']);
  await page.screenshot({ path: '/tmp/connector-styles.png' });
});

test('new connectors and their preview reset to solid elbow and settings survive local reopen, duplication and import', async ({ page }) => {
  await open(page, true);
  const source = (await page.locator('.react-flow__node-component').first().locator('[data-handleid="bottom"]').boundingBox())!;
  const target = (await page.locator('.react-flow__node-component').nth(1).locator('[data-handleid="bottom"]').boundingBox())!;
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(source.x + 50, source.y + 70);
  const preview = page.locator('.react-flow__connection-path');
  await expect(preview).toHaveCount(1);
  expect((await appearance(preview)).dash).toBe('none');
  await expect(preview).toHaveAttribute('d', /Q/);
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 12 });
  const hoveredPreview = await preview.getAttribute('d');
  await page.mouse.up();
  await expect(page.locator('.react-flow__edge')).toHaveCount(3);
  await expect(page.locator('.react-flow__edge-path').last()).toHaveAttribute('d', hoveredPreview!);
  await expect(page.getByLabel('Stroke style')).toHaveValue('solid');
  await expect(page.getByLabel('Path shape')).toHaveValue('elbow');
  const saved = await exported(page);
  expect(saved.edges[2]).toMatchObject({ stroke: 'solid', path: 'elbow' });
  await expect(page.getByRole('status')).toHaveText('Saved locally');
  await page.reload();
  await page.getByRole('button', { name: 'Open Connector settings', exact: true }).click();
  expect((await exported(page)).edges).toEqual(saved.edges);
  await page.getByRole('button', { name: 'Duplicate diagram', exact: true }).click();
  const copy = await exported(page);
  expect(copy.edges.map(({stroke,path,direction}) => ({stroke,path,direction}))).toEqual(saved.edges.map(({stroke,path,direction}) => ({stroke,path,direction})));
  await page.locator('input[type=file]').setInputFiles({ name: 'roundtrip.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(copy)) });
  const imported = await exported(page);
  expect(imported.id).not.toBe(copy.id);
  expect(imported.edges.map(({stroke,path,direction}) => ({stroke,path,direction}))).toEqual(copy.edges.map(({stroke,path,direction}) => ({stroke,path,direction})));
  await page.locator('.canvas').click({ position: { x: 40, y: 80 } });
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Control+d');
  await expect(page.locator('.react-flow__edge')).toHaveCount(6);
  const duplicated = await exported(page);
  expect(duplicated.edges.slice(3).map(({stroke,path,direction}) => ({stroke,path,direction}))).toEqual(copy.edges.map(({stroke,path,direction}) => ({stroke,path,direction})));
});

test('nonaligned paths and a same-handle self-loop remain visible and selectable', async ({ page }) => {
  const doc = createDiagram('web', 'Visible styles');
  const sample = doc.nodes[0], sampleEdge = doc.edges[0];
  doc.nodes = Array.from({ length: 6 }, (_, i) => ({ ...sample, id: `node-${i}`, name: i % 2 ? 'API server' : 'Client', position: { x: i % 2 ? 500 : 40, y: 90 + Math.floor(i / 2) * 210 + (i % 2 ? 55 : 0) } }));
  doc.edges = (['elbow', 'curved', 'straight'] as const).map((path, i) => ({ ...sampleEdge, id: `edge-${i}`, source: `node-${i * 2}`, target: `node-${i * 2 + 1}`, label: '', path, stroke: (['solid', 'dashed', 'dotted'] as const)[i] }));
  doc.edges.push({ ...doc.edges[2], id: 'loop', source: 'node-2', target: 'node-2', sourceHandle: 'left', targetHandle: 'left' });
  await page.goto('/');
  await page.locator('input[type=file]').setInputFiles({ name: 'visible-styles.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(doc)) });
  await expect(page.locator('.react-flow__edge')).toHaveCount(4);
  await expect(page.getByRole('status')).toHaveText('Saved locally');
  await selectEdge(page, 3);
  await expect(page.getByText('Straight self-connections use a rectangular loop so they stay visible.')).toBeVisible();
  await expect(page.locator('.react-flow__edge-path').nth(3)).toHaveAttribute('d', / L /);
  await page.getByLabel('Path shape').selectOption('curved');
  await expect(page.locator('.react-flow__edge-path').nth(3)).toHaveAttribute('d', /Q/);
  await page.getByLabel('Path shape').selectOption('elbow');
  await page.locator('.canvas').click({ position: { x: 420, y: 50 } });
  await page.keyboard.press('Control+a');
  await expect(page.locator('.react-flow__edge.selected')).toHaveCount(4);
  await page.screenshot({ path: '/tmp/connector-styles-lines.png' });
});
