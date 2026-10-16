import { test, expect, type Page, type Locator } from '@playwright/test';

async function create(page: Page) {
  await page.goto('/');
  await page.getByLabel('Diagram name', { exact: true }).fill('Sticky sizing');
  await page.getByRole('button', { name: 'Create diagram', exact: true }).click();
  await page.getByRole('button', { name: 'Add Sticky note', exact: true }).click();
  return page.locator('.react-flow__node-sticky').first();
}
async function contained(node: Locator) {
  await expect.poll(() => node.locator('.sticky-node').evaluate(el => {
    const outer = el.getBoundingClientRect();
    return [...el.querySelectorAll('strong,p')].every(child => {
      const rect = child.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(child);
      return [rect, ...range.getClientRects()].every(r =>
        r.left >= outer.left - 1 && r.right <= outer.right + 1 && r.bottom <= outer.bottom + 1);

    });
  })).toBe(true);
}
async function geometry(node: Locator) {
  return node.evaluate(el => ({ width: (el as HTMLElement).style.width, height: (el as HTMLElement).style.height, position: (el as HTMLElement).style.transform }));
}
async function drag(page: Page, handle: Locator, dx: number, dy: number) {
  let b = (await handle.boundingBox())!;
  // Side midpoints now contain connection handles. Resize along the edge away
  // from the midpoint; the four corner resize grips keep their usual centers.
  const line = await handle.evaluate(el => el.classList.contains('line'));
  const positionAt = () => ({ x: b.width * (line && b.width > b.height ? .25 : .5), y: b.height * (line && b.height > b.width ? .25 : .5) });
  await handle.click({ trial: true, position: positionAt() });
  b = (await handle.boundingBox())!;
  const position = positionAt();
  await page.mouse.move(b.x + position.x, b.y + position.y);
  await page.mouse.down();
  await page.mouse.move(b.x + position.x + dx, b.y + position.y + dy, { steps: 12 });
  await page.mouse.up();
}
test('sticky text grows its background and text plus growth undo together', async ({ page }) => {
  const node = await create(page);
  const before = await geometry(node);
  const body = 'A paragraph about a distributed system. '.repeat(30) + '\n' + 'W'.repeat(180) + '\nLast line';
  await page.getByLabel('Notes', { exact: true }).fill(body);
  await page.getByLabel('Notes', { exact: true }).blur();
  await contained(node);
  const after = await geometry(node);
  expect(parseFloat(after.height)).toBeGreaterThan(parseFloat(before.height));
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  expect(await geometry(node)).toEqual(before);
  await expect(page.getByLabel('Notes', { exact: true })).toHaveValue('');
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  expect(await geometry(node)).toEqual(after);
  await contained(node);
});
test('selected sticky exposes resize handles', async ({ page }) => {
  const node = await create(page);
  await expect(node.locator('.react-flow__resize-control.handle')).toHaveCount(4);
  await drag(page, node.locator('.react-flow__resize-control.bottom.right'), 80, 70);
  expect(parseFloat((await geometry(node)).width)).toBeGreaterThan(240);
});

for (const corner of ['top.left', 'top.right', 'bottom.left', 'bottom.right']) {
  test(`${corner} resize preserves the opposite edges and one undo restores geometry`, async ({ page }) => {
    const node = await create(page);
    await page.getByLabel('Notes', { exact: true }).fill('Wrap this text across lines. '.repeat(12));
    await page.getByLabel('Notes', { exact: true }).blur();
    const left = corner.includes('left');
    const top = corner.includes('top');
    const handle = node.locator(`.react-flow__resize-control.${corner}`);
    // First enlarge, then narrow and shorten far enough to hit the content floor.
    for (const shrinking of [false, true]) {
      const before = await geometry(node);
      const bounds = (await node.boundingBox())!;
      const sign = shrinking ? -1 : 1;
      await drag(page, handle, (left ? -1 : 1) * (shrinking ? 160 : 80) * sign, (top ? -1 : 1) * (shrinking ? 120 : 50) * sign);
      await contained(node);
      const after = await geometry(node);
      const next = (await node.boundingBox())!;
      expect(after).not.toEqual(before);
      expect(left ? next.x + next.width : next.x).toBeCloseTo(left ? bounds.x + bounds.width : bounds.x, 0);
      expect(top ? next.y + next.height : next.y).toBeCloseTo(top ? bounds.y + bounds.height : bounds.y, 0);
      await page.getByRole('button', { name: 'Undo', exact: true }).click();
      expect(await geometry(node)).toEqual(before);
      await page.getByRole('button', { name: 'Redo', exact: true }).click();
      expect(await geometry(node)).toEqual(after);
    }
  });
}

async function exported(page: Page) {
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON', exact: true }).click();
  const path = await (await download).path();
  const { readFile } = await import('node:fs/promises');
  return JSON.parse(await readFile(path!, 'utf8'));
}
async function importData(page: Page, data: unknown) {
  await page.locator('input[type=file]').setInputFiles({ name: 'sticky.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) });
  await expect(page.getByRole('status')).toHaveText('Saved locally');
}

test('long title, words and newlines persist with dimensions through reopen, duplicate and import', async ({ page }) => {
  const node = await create(page);
  const title = ('Long title without spaces: ' + 'W'.repeat(200)).slice(0, 200);
  const body = 'First line\n\n' + 'W'.repeat(180) + '\nLast line\n';
  await page.getByLabel('Name', { exact: true }).fill(title);
  await page.getByLabel('Notes', { exact: true }).fill(body);
  await page.getByLabel('Notes', { exact: true }).blur();
  await contained(node);
  await drag(page, node.locator('.react-flow__resize-control.bottom.right'), 70, 80);
  await contained(node);
  const original = await exported(page);
  await page.getByRole('button', { name: 'Duplicate', exact: true }).click();
  const copies = (await exported(page)).nodes;
  expect(copies).toHaveLength(2);
  for (const copy of copies) expect({ width: copy.width, height: copy.height, name: copy.name, notes: copy.notes }).toEqual({ width: original.nodes[0].width, height: original.nodes[0].height, name: title, notes: body });
  await expect(page.getByRole('status')).toHaveText('Saved locally');
  await page.reload();
  await page.getByRole('button', { name: 'Open Sticky sizing', exact: true }).click();
  expect((await exported(page)).nodes).toEqual(copies);
  await importData(page, original);
  const imported = (await exported(page)).nodes[0];
  expect(imported.id).not.toBe(original.nodes[0].id);
  expect({ ...imported, id: original.nodes[0].id }).toEqual(original.nodes[0]);
  await contained(node);
  await node.locator('strong').click();
  await page.getByRole('button', { name: /fit view/i }).click();
  await node.locator('.react-flow__resize-control.bottom.right').click({ trial: true });
  await page.screenshot({ path: '/tmp/sticky-sizing.png', fullPage: true });
});

test('narrowing grows height and deleting text preserves whitespace until manually shrunk', async ({ page }) => {
  const node = await create(page);
  await page.getByLabel('Notes', { exact: true }).fill('Text that wraps repeatedly. '.repeat(15));
  await page.getByLabel('Notes', { exact: true }).blur();
  const before = await geometry(node);
  await drag(page, node.locator('.react-flow__resize-control.line.right'), -200, 0);
  await contained(node);
  const narrow = await geometry(node);
  expect(parseFloat(narrow.width)).toBeLessThan(parseFloat(before.width));
  expect(parseFloat(narrow.height)).toBeGreaterThan(parseFloat(before.height));
  await page.getByLabel('Notes', { exact: true }).fill('Short');
  await page.getByLabel('Notes', { exact: true }).blur();
  expect((await geometry(node)).height).toBe(narrow.height);
  // The bottom handle may be below the canvas, so fit before dragging it.
  await page.getByRole('button', { name: /fit view/i }).click();
  await drag(page, node.locator('.react-flow__resize-control.line.bottom'), 0, -80);
  expect(parseFloat((await geometry(node)).height)).toBeLessThan(parseFloat(narrow.height));
  await contained(node);
});

test('legacy overflow is repaired, while extreme newlines stay bounded and text remains scrollable', async ({ page }) => {
  const node = await create(page);
  const legacy = await exported(page);
  legacy.nodes[0].notes = 'Legacy text '.repeat(100);
  await importData(page, legacy);
  await contained(node);
  const repaired = await exported(page);
  expect(repaired.nodes[0].height).toBeGreaterThan(160);
  await node.locator('strong').click();
  const body = 'Normal text '.repeat(1000).slice(0, 10000);
  await page.getByLabel('Notes', { exact: true }).fill(body);
  await page.getByLabel('Notes', { exact: true }).press('End');
  await page.getByLabel('Notes', { exact: true }).press('a');
  await expect(page.getByLabel('Notes', { exact: true })).toHaveValue(body);
  await page.getByLabel('Notes', { exact: true }).blur();
  expect((await exported(page)).nodes[0].notes).toHaveLength(10000);
  // Bulk newline insertion is pathologically slow even in a bare Chromium
  // textarea. Import exercises the same layout limit without that native path.
  const extremeInput = await exported(page);
  extremeInput.name = 'Extreme sticky';
  extremeInput.nodes[0].notes = '\n'.repeat(9999) + 'x';
  await importData(page, extremeInput);
  const extreme = await exported(page);
  expect(extreme.nodes[0].height).toBe(100000);
  expect(extreme.nodes[0].notes).toHaveLength(10000);
  const scroll = await node.locator('.sticky-node').evaluate(el => { el.scrollTop = el.scrollHeight; return { scroll: el.scrollTop, overflow: getComputedStyle(el).overflowY }; });
  expect(scroll.scroll).toBeGreaterThan(0);
  expect(scroll.overflow).toBe('auto');
  await expect(page.getByRole('status')).toHaveText('Saved locally');
  await page.reload();
  await page.getByRole('button', { name: 'Open Extreme sticky', exact: true }).click();
  expect((await exported(page)).nodes[0].notes).toHaveLength(10000);
  expect((await exported(page)).nodes[0].height).toBe(100000);
});

test('tiny imported notes grow to usable width without losing long titles', async ({ page }) => {
  const node = await create(page);
  const data = await exported(page);
  data.nodes[0].width = 1;
  data.nodes[0].height = 1;
  data.nodes[0].name = 'W'.repeat(200);
  data.nodes[0].notes = 'Long_unbroken_body'.repeat(12);
  await importData(page, data);
  await contained(node);
  expect((await exported(page)).nodes[0].width).toBeGreaterThanOrEqual(80);
});

test('resizing a container member keeps membership and world geometry through undo', async ({ page }) => {
  const node = await create(page);
  const data = await exported(page);
  const container = { ...data.nodes[0], id: 'boundary', kind: 'container', name: 'Boundary', notes: '', position: { x: 180, y: 180 }, width: 500, height: 400 };
  data.nodes[0] = { ...data.nodes[0], parentId: container.id, position: { x: 40, y: 60 }, notes: 'Member text '.repeat(20) };
  data.nodes.push(container);
  data.viewport = { x: 0, y: 0, zoom: 1 };
  await importData(page, data);
  await node.locator('strong').click();
  const before = (await exported(page)).nodes;
  const bounds = (await node.boundingBox())!;
  await drag(page, node.locator('.react-flow__resize-control.top.left'), -90, -50);
  const after = (await exported(page)).nodes;
  const next = (await node.boundingBox())!;
  expect(next.x + next.width).toBeCloseTo(bounds.x + bounds.width, 0);
  expect(next.y + next.height).toBeCloseTo(bounds.y + bounds.height, 0);
  const memberBefore = before.find((n: { kind: string }) => n.kind === 'sticky');
  const memberAfter = after.find((n: { kind: string }) => n.kind === 'sticky');
  expect(memberAfter.parentId).toBe(memberBefore.parentId);
  expect(memberAfter.position.x).toBeLessThan(0);
  expect(after.find((n: { kind: string }) => n.kind === 'container')).toEqual(before.find((n: { kind: string }) => n.kind === 'container'));
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  expect((await exported(page)).nodes).toEqual(before);
  expect(await node.boundingBox()).toEqual(bounds);
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  expect((await exported(page)).nodes).toEqual(after);
  await contained(node);
});

test('opening an old stored overflow repairs and autosaves geometry without an undo entry', async ({ page }) => {
  const node = await create(page);
  const original = await exported(page);
  await page.getByRole('button', { name: 'Diagrams', exact: true }).click();
  await page.evaluate(async id => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('distributed-sim', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('diagrams', 'readwrite');
      const store = tx.objectStore('diagrams');
      const request = store.get(id);
      request.onsuccess = () => {
        const record = request.result;
        record.document.nodes[0].notes = 'Old overflowing note '.repeat(60);
        record.document.nodes[0].height = 160;
        record.revision++;
        store.put(record);
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }, original.id);
  await page.getByRole('button', { name: 'Open Sticky sizing', exact: true }).click();
  await contained(node);
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeDisabled();
  const repaired = (await exported(page)).nodes[0];
  expect(repaired.height).toBeGreaterThan(160);
  await expect(page.getByRole('status')).toHaveText('Saved locally');
  await page.reload();
  await page.getByRole('button', { name: 'Open Sticky sizing', exact: true }).click();
  expect((await exported(page)).nodes[0]).toEqual(repaired);
});

for (const corner of ['top.left', 'top.right']) {
  test(`${corner} horizontal narrowing anchors the bottom even without vertical pointer movement`, async ({ page }) => {
    const node = await create(page);
    await page.getByLabel('Notes', { exact: true }).fill('Text that wraps repeatedly. '.repeat(12));
    await page.getByLabel('Notes', { exact: true }).blur();
    const before = await geometry(node);
    const bounds = (await node.boundingBox())!;
    await drag(page, node.locator(`.react-flow__resize-control.${corner}`), corner.includes('left') ? 180 : -180, 0);
    const next = (await node.boundingBox())!;
    expect(next.height).toBeGreaterThan(bounds.height);
    expect(next.y + next.height).toBeCloseTo(bounds.y + bounds.height, 0);
    await contained(node);
    const after = await geometry(node);
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    expect(await geometry(node)).toEqual(before);
    await page.getByRole('button', { name: 'Redo', exact: true }).click();
    expect(await geometry(node)).toEqual(after);
  });
}
