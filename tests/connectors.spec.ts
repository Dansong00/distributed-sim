import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Diagram } from "../src/domain/model";
const diagram: Diagram = JSON.parse(readFileSync(new URL("./fixtures/connectors.json", import.meta.url), "utf8"));

const node = (page: Page, index: number) => page.locator(".react-flow__node-component").nth(index);
async function connect(page: Page, from: number, to: number, throughSave = false) {
  const source = node(page, from).locator('[data-handleid="right"]');
  const target = node(page, to).locator('[data-handleid="left"]');
  const s = (await source.boundingBox())!;
  const t = (await target.boundingBox())!;
  // At the saved zoom these handles are only about five screen pixels wide.
  for (const handle of [source, target]) {
    expect(await handle.evaluate(el => {
      const b = el.getBoundingClientRect();
      return document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2) === el;
    }), "Handle center must receive the pointer, without node/edge overlap").toBe(true);
  }
  await page.mouse.move(s.x + s.width / 2, s.y + s.height / 2);
  await page.mouse.down();
  if (throughSave) {
    await page.mouse.move(s.x + s.width / 2 + 30, s.y + s.height / 2 + 10);
    await expect(page.locator('.react-flow__connection-path')).toHaveCount(1);
    await expect(page.getByRole('status')).toHaveText('Saved locally');
    await expect(page.locator('.react-flow__connection-path')).toHaveCount(1);
  }
  await page.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 15 });
  await page.mouse.up();
}

async function open(page: Page) {
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles({ name: 'connectors.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(diagram)) });
  await expect(page.locator('.react-flow__edge-path')).toHaveCount(diagram.edges.length);
  await expect(page.getByRole('status')).toHaveText('Saved locally');
  await expect.poll(() => page.locator('.react-flow__viewport').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).a)).toBeCloseTo(diagram.viewport.zoom, 5);
}

test('imported connectors stay mounted through gestures, pan and autosave at saved zoom', async ({ page }) => {
  await open(page);
  const probe = await page.locator('.react-flow__edges').evaluateHandle(el => {
    const removed: string[] = [];
    const observer = new MutationObserver(records => {
      for (const record of records) for (const item of record.removedNodes) {
        if (item instanceof Element && (item.matches('.react-flow__edge-path') || item.querySelector('.react-flow__edge-path'))) removed.push(item.querySelector(".react-flow__edge-path")?.id ?? item.id);
      }
    });
    observer.observe(el, { childList: true, subtree: true });
    return { removed, observer };
  });
  for (const [from, to] of [[0, 2], [3, 6], [0, 4], [4, 6]]) {
    const count = await page.locator('.react-flow__edge-path').count();
    await connect(page, from, to);
    await expect(page.locator('.react-flow__edge-path')).toHaveCount(count + 1);
    await expect(page.getByRole('status')).toHaveText('Saved locally');
    await page.keyboard.press('Escape');
    // Pan rerenders the controlled graph and autosaves its viewport.
    const box = (await page.locator('.canvas').boundingBox())!;
    await page.mouse.move(box.x + 70, box.y + box.height - 80);
    await page.mouse.down({ button: 'middle' });
    await page.mouse.move(box.x + 80, box.y + box.height - 75, { steps: 5 });
    await page.mouse.up({ button: 'middle' });
    await expect(page.getByRole('status')).toHaveText('Saving…');
    await connect(page, from, to, true);
    await expect(page.locator('.react-flow__edge-path')).toHaveCount(count + 2);
    await expect(page.getByRole('status')).toHaveText('Saved locally');
  }
  // Moving an attached node must keep the existing paths mounted while their
  // endpoints update, including the save that completes with the pointer held.
  const moving = node(page, 2);
  const before = (await moving.boundingBox())!;
  const oldPaths = await page.locator('.react-flow__edge-path').evaluateAll(els => els.map(el => el.getAttribute('d')));
  await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
  await page.mouse.down();
  await page.mouse.move(before.x + before.width / 2 + 20, before.y + before.height / 2 + 12, { steps: 12 });
  await expect(page.getByRole('status')).toHaveText('Saving…');
  await expect(page.getByRole('status')).toHaveText('Saved locally');
  expect(await page.locator('.react-flow__edge-path').evaluateAll(els => els.map(el => el.getAttribute('d')))).not.toEqual(oldPaths);
  await page.mouse.up();
  await expect(page.getByRole('status')).toHaveText('Saved locally');
  expect(await probe.evaluate(({ removed, observer }) => { observer.disconnect(); return removed; }), 'Existing edge paths never unmount during interaction or saving').toEqual([]);
});

test('connection start survives selection while the next DOM measurement is pending', async ({ page }) => {
  await page.addInitScript(() => {
    const NativeObserver = window.ResizeObserver;
    let held = false;
    const pending: (() => void)[] = [];
    window.ResizeObserver = class extends NativeObserver {
      constructor(callback: ResizeObserverCallback) {
        super((entries, observer) => {
          if (held) pending.push(() => callback(entries, observer));
          else callback(entries, observer);
        });
      }
    };
    (window as unknown as { holdMeasurements: (value: boolean) => void }).holdMeasurements = value => {
      held = value;
      if (!held) for (const deliver of pending.splice(0)) deliver();
    };
  });
  await open(page);
  // Reproduce the interval before the browser delivers the next measurement,
  // without a timing-dependent race or a sleep. All pointer events are real.
  await page.evaluate(() => (window as unknown as { holdMeasurements: (value: boolean) => void }).holdMeasurements(true));
  try {
    await node(page, 3).click();
    await expect(node(page, 3)).toHaveClass(/selected/);
    const source = (await node(page, 0).locator('[data-handleid="right"]').boundingBox())!;
    await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
    await page.mouse.down();
    await page.mouse.move(source.x + source.width / 2 + 30, source.y + source.height / 2 + 10);
    await expect(page.locator('.react-flow__connection-path')).toHaveCount(1);
  } finally {
    await page.evaluate(() => (window as unknown as { holdMeasurements: (value: boolean) => void }).holdMeasurements(false));
  }
  const target = (await node(page, 2).locator('[data-handleid="left"]').boundingBox())!;
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 15 });
  await page.mouse.up();
  await expect(page.locator('.react-flow__edge-path')).toHaveCount(diagram.edges.length + 1);
});
