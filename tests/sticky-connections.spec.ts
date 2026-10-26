import { expect, test, type Page, type Locator } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createDiagram } from '../src/domain/templates';
import type { Diagram } from '../src/domain/model';

async function open(page: Page) {
  const doc = createDiagram('web', 'Connected notes');
  doc.edges = [];
  doc.nodes.forEach((n, i) => { n.position = { x: 40 + i * 310, y: 160 }; });
  doc.nodes[0].kind = 'sticky'; doc.nodes[1].kind = 'sticky';
  await page.goto('/');
  await page.locator('input[type=file]').setInputFiles({ name: 'notes.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(doc)) });
  await expect(page.locator('.react-flow__node')).toHaveCount(3);
}
async function connect(page: Page, from: Locator, to: Locator, preview?: (line: Locator) => Promise<void>) {
  const a = (await from.boundingBox())!, b = (await to.boundingBox())!;
  await page.mouse.move(a.x+a.width/2, a.y+a.height/2); await page.mouse.down();
  await page.mouse.move(b.x+b.width/2, b.y+b.height/2, { steps: 12 });
  const line = page.locator('.react-flow__connection-path');
  await expect(line).toHaveCount(1);
  if (preview) await preview(line);
  const route = await line.getAttribute('d');
  await page.mouse.up();
  await expect(page.locator('.react-flow__edge-path').last()).toHaveAttribute('d', route!);
}
async function exported(page: Page): Promise<Diagram> {
  const pending = page.waitForEvent('download'); await page.getByRole('button', { name: 'Diagram actions' }).click();
  await page.getByRole('button', { name: 'Export JSON', exact: true }).click();
  return JSON.parse(await readFile((await (await pending).path())!, 'utf8'));
}

test('sticky connections attach after movement, resize and text growth, and survive undo, reload, duplication and import', async ({ page }) => {
  await open(page);
  const notes = page.locator('.react-flow__node-sticky'), component = page.locator('.react-flow__node-component');
  const handle = (n: Locator, side: string) => n.locator(`[data-handleid="${side}"]`);
  await expect(notes.first().locator('.react-flow__handle')).toHaveCount(4);
  // Selecting a note shows resize controls; its connection handle still wins the pointer hit test.
  await notes.first().click();
  await connect(page, handle(notes.first(), 'right'), handle(notes.nth(1), 'left'));
  await connect(page, handle(notes.nth(1), 'right'), handle(component, 'left'));
  await connect(page, handle(component, 'bottom'), handle(notes.first(), 'bottom'));
  await expect(page.locator('.react-flow__edge')).toHaveCount(3);
  await page.screenshot({ path: '/tmp/sticky-connections.png', fullPage: true });
  const path = page.locator('.react-flow__edge-path').first();
  const attached = async () => {
    const tip = await path.evaluate(el => { const p = el as SVGPathElement, a = p.getPointAtLength(0); const s = new DOMPoint(a.x,a.y).matrixTransform(p.getScreenCTM()!); return { x:s.x,y:s.y }; });
    const h = (await handle(notes.first(),'right').boundingBox())!;
    expect(tip.x).toBeCloseTo(h.x+h.width, 0); expect(tip.y).toBeCloseTo(h.y+h.height/2, 0);
  };
  const b = (await notes.first().boundingBox())!;
  await page.mouse.move(b.x+35,b.y+30); await page.mouse.down(); await page.mouse.move(b.x+65,b.y+90,{steps:8}); await page.mouse.up();
  await attached();
  const grip = (await notes.first().locator('.react-flow__resize-control.bottom.right').boundingBox())!;
  await page.mouse.move(grip.x+grip.width/2,grip.y+grip.height/2); await page.mouse.down(); await page.mouse.move(grip.x+65,grip.y+50,{steps:8}); await page.mouse.up();
  await expect(page.locator('.react-flow__edge')).toHaveCount(3); await attached();
  await page.getByLabel('Notes', { exact:true }).fill('Architecture considerations and requirements. '.repeat(30));
  await page.getByLabel('Notes', { exact:true }).blur(); await attached();
  const saved = await exported(page);
  await page.getByRole('button',{name:'Delete',exact:true}).click();
  await expect(page.locator('.react-flow__edge')).toHaveCount(1);
  await page.getByRole('button',{name:'Undo',exact:true}).click(); await expect(page.locator('.react-flow__edge')).toHaveCount(3);
  await expect(page.getByRole('status')).toHaveText('Saved locally');
  await page.reload(); await page.getByRole('button',{name:'Open Connected notes',exact:true}).click();
  expect((await exported(page)).edges).toEqual(saved.edges);
  await page.locator('input[type=file]').setInputFiles({name:'roundtrip.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(saved))});
  await expect(page.locator('.react-flow__edge')).toHaveCount(3);
  await page.locator('.canvas').click({position:{x:20,y:20}}); await page.keyboard.press('Control+a'); await page.keyboard.press('Control+d');
  await expect(page.locator('.react-flow__edge')).toHaveCount(6);
});

test('explicit connector settings persist across reloads and diagrams and style the drawing preview', async ({ page }) => {
  await open(page);
  const nodes = page.locator('.react-flow__node');
  const h = (i:number,side:string) => nodes.nth(i).locator(`[data-handleid="${side}"]`);
  await connect(page,h(0,'right'),h(1,'left'));
  await expect(page.getByLabel('Path shape')).toHaveValue('straight');
  await page.getByLabel('Stroke style').selectOption('dotted');
  await page.getByLabel('Path shape').selectOption('curved');
  await page.getByLabel('Direction',{exact:true}).selectOption('both');
  await expect(page.getByRole('status')).toHaveText('Saved locally');
  await page.reload(); await page.getByRole('button',{name:'Open Connected notes',exact:true}).click();
  await connect(page,h(1,'right'),h(2,'left'),async line => {
    await expect(line).toHaveAttribute('d',/Q/); await expect(line).toHaveAttribute('stroke-dasharray','1 6');
    await expect(line).toHaveAttribute('marker-start',/url/); await expect(line).toHaveAttribute('marker-end',/url/);
  });
  expect((await exported(page)).edges[1]).toMatchObject({path:'curved',stroke:'dotted',direction:'both'});
  const other = createDiagram('web','Another diagram');
  await page.locator('input[type=file]').setInputFiles({name:'other.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(other))});
  await expect(page.locator('.document-title')).toHaveValue('Another diagram');
  await expect(page.locator('.react-flow__edge')).toHaveCount(2);
  await expect(page.getByRole('status')).toHaveText('Saved locally');
  await connect(page,h(0,'bottom'),h(1,'bottom'));
  expect((await exported(page)).edges[2]).toMatchObject({path:'curved',stroke:'dotted',direction:'both'});
});
