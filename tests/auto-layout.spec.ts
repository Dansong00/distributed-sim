import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import type { Diagram, StoredDiagram } from '../src/domain/model';
import { readFileSync } from 'node:fs';
const fixture: Diagram = JSON.parse(readFileSync(new URL('./fixtures/auto-layout.json', import.meta.url), 'utf8'));

const sample = () => structuredClone(fixture);
function canonical(doc: Diagram): Diagram {
  const ids = new Map(doc.nodes.map((n, i) => [n.id, String(i)]));
  return { ...doc, nodes: doc.nodes.map(n => ({ ...n, id: ids.get(n.id)!, ...(n.parentId ? { parentId: ids.get(n.parentId) } : {}) })), edges: doc.edges.map((e, i) => ({ ...e, id: String(i), source: ids.get(e.source)!, target: ids.get(e.target)! })) };
}
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const saved = (page: Page) => expect(page.locator('.save-status')).toHaveText('Saved locally');
async function open(page: Page, document = sample()) {
  await page.goto('/');
  await page.locator('input[type=file]').setInputFiles({ name: 'layout.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(document)) });
  await expect(page.locator('.react-flow__node')).toHaveCount(document.nodes.length);
  await saved(page);
}
async function exported(page: Page): Promise<Diagram> {
  const pending = page.waitForEvent('download');
  await page.getByRole('banner').getByRole('button', { name: 'Export JSON', exact: true }).click();
  return JSON.parse(await readFile((await (await pending).path())!, 'utf8'));
}
// Read the real store independently of the editor's memory/preview state.
async function records(page: Page): Promise<StoredDiagram[]> {
  return page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('distributed-sim', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const get = db.transaction('diagrams').objectStore('diagrams').getAll();
      get.onsuccess = () => { resolve(get.result); db.close(); };
      get.onerror = () => { reject(get.error); db.close(); };
    };
  }));
}
const geometry = (doc: Diagram) => ({ nodes: doc.nodes.map(({ id, position, width, height }) => ({ id, position, width, height })), edges: doc.edges.map(({ id, sourceHandle, targetHandle }) => ({ id, sourceHandle, targetHandle })) });
async function rendered(page: Page) {
  return page.locator('.react-flow__node').evaluateAll(elements => elements.map(el => ({ id: el.getAttribute('data-id'), style: el.getAttribute('style') })));
}
async function preview(page: Page) {
  await button(page, 'Clean up').click();
  await expect(page.getByText('Preview cleanup', { exact: true })).toBeVisible({ timeout: 60_000 });
}
function semantics(doc: Diagram) {
  return { nodes: doc.nodes.map(({ position: _p, width, height, ...n }) => ({ ...n, ...(n.kind === 'container' ? {} : { width, height }) })), edges: doc.edges.map(({ sourceHandle: _s, targetHandle: _t, ...e }) => e) };
}

test('preview isolates storage, blocks edits/export, and Cancel/Escape restore geometry and viewport', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('system-canvas:connector-preferences', JSON.stringify({ stroke: 'dotted', path: 'curved', direction: 'both' })));
  await open(page);
  await page.locator('.canvas').click({ position: { x: 15, y: 20 } });
  await page.keyboard.press('Control+a');
  const before = await exported(page), stored = await records(page), nodes = await rendered(page);
  const viewport = await page.locator('.react-flow__viewport').getAttribute('style');
  for (const cancel of ['Cancel', 'Escape']) {
    await preview(page);
    expect(await rendered(page)).not.toEqual(nodes);
    for (const name of ['Export JSON', 'Diagrams', 'New diagram', 'Import JSON', 'Undo', 'Redo', 'Duplicate', 'Delete']) await expect(button(page, name)).toBeDisabled();
    await expect(page.locator('.palette')).toHaveAttribute('inert', '');
    await expect(page.locator('.inspector')).toHaveAttribute('inert', '');
    await expect(page.locator('.react-flow__resize-control')).toHaveCount(0);
    for (const key of ['Control+d', 'Delete', 'Control+z', 'Control+y', 'Control+a']) await page.keyboard.press(key);
    const transfer = await page.evaluateHandle(() => { const value = new DataTransfer(); value.setData('application/system-canvas', 'sticky'); return value; });
    await page.locator('.canvas').dispatchEvent('drop', { dataTransfer: transfer, clientX: 600, clientY: 400 });
    await button(page, 'Zoom Out').click();
    await page.waitForTimeout(700); // Past the 400 ms autosave interval, including inspection viewport events.
    expect(await records(page)).toEqual(stored);
    await expect(page.locator('.react-flow__node')).toHaveCount(before.nodes.length);
    if (cancel === 'Escape') await page.keyboard.press('Escape'); else await button(page, 'Cancel').click();
    await expect(button(page, 'Clean up')).toBeFocused();
    expect(await rendered(page)).toEqual(nodes);
    await expect(page.locator('.react-flow__viewport')).toHaveAttribute('style', viewport!);
    expect(geometry(await exported(page))).toEqual(geometry(before));
    await expect(button(page, 'Undo')).toBeDisabled();
  }
  expect(await page.evaluate(() => localStorage.getItem('system-canvas:connector-preferences'))).toBe(JSON.stringify({ stroke: 'dotted', path: 'curved', direction: 'both' }));
});

test('real layout is readable, preserves semantics, applies in one undo, and survives reopen and JSON round trip', async ({ page }) => {
  await open(page);
  const before = await exported(page);
  await preview(page);
  const boxes = await page.locator('.react-flow__node').evaluateAll(elements => elements.map(el => {
    const r = el.getBoundingClientRect(); return { id: el.getAttribute('data-id')!, x: r.x, y: r.y, width: r.width, height: r.height };
  }));
  for (let i = 0; i < boxes.length; i++) for (const b of boxes.slice(i + 1)) {
    const a = boxes[i], na = before.nodes.find(n => n.id === a.id)!, nb = before.nodes.find(n => n.id === b.id)!;
    if (na.parentId === b.id || nb.parentId === a.id) continue;
    expect(Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > .5 && Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > .5, `${a.id} overlaps ${b.id}`).toBe(false);
  }
  for (const child of before.nodes.filter(n => n.parentId)) {
    const c = boxes.find(b => b.id === child.id)!, p = boxes.find(b => b.id === child.parentId)!;
    expect(c.x).toBeGreaterThan(p.x); expect(c.y).toBeGreaterThan(p.y);
    expect(c.x + c.width).toBeLessThan(p.x + p.width); expect(c.y + c.height).toBeLessThan(p.y + p.height);
  }
  const paths = await page.locator('.react-flow__edge-path').evaluateAll(elements => elements.map(el => ({ d: el.getAttribute('d'), length: (el as SVGPathElement).getTotalLength() })));
  expect(paths).toHaveLength(before.edges.length);
  for (const path of paths) { expect(path.d).not.toMatch(/NaN|Infinity/); expect(path.length).toBeGreaterThan(5); }
  await expect(page.locator('.edge-label')).toHaveCount(before.edges.length);
  expect(await page.locator(`[data-id="${before.nodes.find(n => n.name === 'Long operational note')!.id}"] .sticky-node`).evaluate(el => el.scrollHeight <= el.clientHeight + 1)).toBe(true);
  await page.screenshot({ path: '/tmp/auto-layout-preview.png', fullPage: true });
  const api = boxes.find(b => b.id === before.nodes.find(n => n.name === 'API service')!.id)!;
  await page.mouse.move(api.x + api.width / 2, api.y + api.height / 2);
  await page.mouse.wheel(0, -500);
  await page.waitForTimeout(400);
  await page.screenshot({ path: '/tmp/auto-layout-detail.png', fullPage: true });
  await button(page, 'Apply').click();
  await saved(page);
  const applied = await exported(page);
  expect(geometry(applied)).not.toEqual(geometry(before));
  expect(semantics(applied)).toEqual(semantics(before));
  expect((await records(page))[0].document).toEqual({ ...applied, updatedAt: expect.any(String) });
  await button(page, 'Undo').click();
  expect(geometry(await exported(page))).toEqual(geometry(before));
  await expect(button(page, 'Undo')).toBeDisabled();
  await button(page, 'Redo').click();
  expect(geometry(await exported(page))).toEqual(geometry(applied));
  await saved(page);
  await page.reload();
  await button(page, `Open ${applied.name}`).click();
  expect(geometry(await exported(page))).toEqual(geometry(applied));
  await page.locator('input[type=file]').setInputFiles({ name: 'roundtrip.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(applied)) });
  await saved(page);
  const imported = await exported(page);
  expect(imported.id).not.toBe(applied.id);
  expect(geometry(canonical(imported))).toEqual(geometry(canonical(applied)));
  expect(semantics(canonical(imported))).toEqual(semantics(canonical(applied)));
});

for (const remote of ['change', 'delete']) test(`clean tab preview detects another tab's ${remote} on Apply without overwriting storage`, async ({ page, context }) => {
  await open(page);
  const before = await exported(page);
  const other = await context.newPage();
  await other.goto('/');
  await button(other, `Open ${before.name}`).click();
  await preview(page);
  if (remote === 'change') {
    await button(other, 'Rename diagram').click();
    await other.getByLabel('Diagram name', { exact: true }).fill('Remote revision');
    await button(other, 'Save name').click();
    await saved(other);
  } else {
    await button(other, 'Delete diagram').click();
    await button(other, 'Delete permanently').click();
    await expect(other.getByRole('heading', { name: 'Create a diagram' })).toBeVisible();
  }
  const remoteRecords = await records(other);
  await button(page, 'Apply').click();
  await expect(page.locator('.save-status')).toHaveText('Conflict — edits kept');
  await expect(page.getByRole('alert')).toContainText(remote === 'change' ? 'changed in another tab' : 'deleted');
  await expect(page.getByText('Preview cleanup', { exact: true })).toHaveCount(0);
  await expect(button(page, 'Save as copy')).toBeEnabled();
  expect(await records(page)).toEqual(remoteRecords);
  expect(geometry(await exported(page))).toEqual(geometry(before));
  await other.close();
});

test('500 elements/1000 connections calculate in a worker and allow responsive cancellation', async ({ page }, info) => {
  test.setTimeout(120_000);
  const document = sample(), node = document.nodes[0], edge = document.edges[0];
  document.name = 'Limit layout';
  document.nodes = Array.from({ length: 500 }, (_, i) => ({ ...node, id: `n-${i}`, name: `Node ${i}`, position: { x: (i % 20) * 240, y: Math.floor(i / 20) * 140 } }));
  document.edges = Array.from({ length: 1000 }, (_, i) => ({ ...edge, id: `e-${i}`, source: `n-${i % 500}`, target: `n-${(i % 500 + (i < 500 ? 20 : 21)) % 500}`, label: '' }));
  await open(page, document);
  const original = await records(page);
  await button(page, 'Clean up').click();
  await expect(page.getByText('Arranging…', { exact: true })).toBeVisible();
  const cancelStart = Date.now();
  await button(page, 'Cancel').click();
  await expect(button(page, 'Clean up')).toBeEnabled();
  const cancelMs = Date.now() - cancelStart;
  expect(cancelMs).toBeLessThan(2000);
  expect(await records(page)).toEqual(original);
  await page.evaluate(() => {
    const state = { ticks: 0, maxGapMs: 0, last: performance.now(), timer: 0 };
    state.timer = window.setInterval(() => { const now = performance.now(); state.ticks++; state.maxGapMs = Math.max(state.maxGapMs, now - state.last); state.last = now; }, 10);
    Object.assign(window, { layoutTiming: state });
  });
  const start = Date.now();
  await preview(page);
  const elapsedMs = Date.now() - start;
  const interaction = await page.evaluate(() => {
    const state = (window as unknown as { layoutTiming: { timer: number; ticks: number; maxGapMs: number } }).layoutTiming;
    clearInterval(state.timer); return { ticks: state.ticks, maxGapMs: Math.round(state.maxGapMs) };
  });
  expect(interaction.ticks).toBeGreaterThan(5);
  await expect(page.locator('.react-flow__node')).toHaveCount(500);
  await expect(page.locator('.react-flow__edge')).toHaveCount(1000);
  await button(page, 'Cancel').click();
  await expect(button(page, 'Clean up')).toBeFocused();
  expect(await records(page)).toEqual(original);
  info.annotations.push({ type: 'measurement', description: JSON.stringify({ nodes: 500, edges: 1000, elapsedMs, cancelMs, ...interaction }) });
  console.log('AUTO_LAYOUT_MEASUREMENT', JSON.stringify({ nodes: 500, edges: 1000, elapsedMs, cancelMs, ...interaction }));
});

test('oversized real worker output reports a useful error without modifying the input', async ({ page }) => {
  const document = sample(), node = document.nodes[0], edge = document.edges[0];
  document.nodes = Array.from({ length: 12 }, (_, i) => ({ ...node, id: `wide-${i}`, width: 100_000, position: { x: i * 5, y: 5 } }));
  document.edges = Array.from({ length: 11 }, (_, i) => ({ ...edge, id: `wide-edge-${i}`, source: `wide-${i}`, target: `wide-${i + 1}` }));
  await open(page, document);
  const original = await exported(page), stored = await records(page);
  await button(page, 'Clean up').click();
  await expect(page.getByRole('alert')).toContainText(/position|coordinate|range/i, { timeout: 60_000 });
  await expect(button(page, 'Clean up')).toBeFocused();
  expect(geometry(await exported(page))).toEqual(geometry(original));
  expect(await records(page)).toEqual(stored);
  await expect(button(page, 'Undo')).toBeDisabled();
});
