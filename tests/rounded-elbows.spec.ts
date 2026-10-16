import { expect, test } from "@playwright/test";
import { createComponent, createDiagram } from "../src/domain/templates";

test('rounded elbows stay compact, labels touch the rendered route, and hovered previews match completion', async ({ page }) => {
  const doc = createDiagram('blank', 'Rounded elbow routes');
  const lb = createComponent('load-balancer', { x: 100, y: 70 });
  const api = createComponent('api-server', { x: 460, y: 310 });
  const db = createComponent('postgresql', { x: 300, y: 650 });
  const service = createComponent('api-server', { x: 820, y: 310 });
  lb.name = 'Load balancer'; api.name = 'API'; db.name = 'Database'; service.name = 'Worker';
  doc.nodes = [lb, api, db, service];
  doc.edges = [
    { id: 'inbound', source: lb.id, target: api.id, sourceHandle: 'bottom', targetHandle: 'left', label: 'Requests', direction: 'one-way' },
    { id: 'storage', source: api.id, target: db.id, sourceHandle: 'left', targetHandle: 'top', label: 'Store', direction: 'one-way' },
    { id: 'self', source: api.id, target: api.id, sourceHandle: 'top', targetHandle: 'right', label: 'Retry', direction: 'one-way' },
    { id: 'aligned', source: api.id, target: service.id, sourceHandle: 'right', targetHandle: 'left', label: 'Jobs', direction: 'one-way' },
  ];
  await page.addInitScript(() => localStorage.setItem('system-canvas:connector-preferences', JSON.stringify({ path: 'elbow', stroke: 'solid', direction: 'one-way' })));
  await page.goto('/');
  await page.locator('input[type=file]').setInputFiles({ name: 'rounded.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(doc)) });
  await expect(page.locator('.react-flow__edge')).toHaveCount(4);
  await page.locator('.react-flow__controls-fitview').click();
  const paths = page.locator('.react-flow__edge-path');
  expect((await paths.nth(0).getAttribute('d'))!.match(/Q/g)).toHaveLength(1);
  expect((await paths.nth(1).getAttribute('d'))!.match(/Q/g)).toHaveLength(1);
  expect((await paths.nth(2).getAttribute('d'))!.match(/Q/g)).toHaveLength(3);
  expect(await paths.nth(3).getAttribute('d')).not.toContain('Q');
  for (let i = 0; i < 4; i++) {
    const label = await page.locator('.edge-label').nth(i).boundingBox();
    const distance = await paths.nth(i).evaluate((el, label) => {
      const path = el as SVGPathElement, length = path.getTotalLength();
      let closest = Infinity;
      for (let n = 0; n <= 1000; n++) {
        const p = path.getPointAtLength(length*n/1000), screen = new DOMPoint(p.x,p.y).matrixTransform(path.getScreenCTM()!);
        closest = Math.min(closest, Math.hypot(screen.x-label!.x-label!.width/2, screen.y-label!.y-label!.height/2));
      }
      return closest;
    }, label);
    expect(distance).toBeLessThan(1);
  }
  await page.screenshot({ path: '/tmp/rounded-elbows.png', fullPage: true });
  const source = (await page.locator('.react-flow__node-component').nth(0).locator('[data-handleid="bottom"]').boundingBox())!;
  const target = (await page.locator('.react-flow__node-component').nth(1).locator('[data-handleid="left"]').boundingBox())!;
  await page.mouse.move(source.x+source.width/2, source.y+source.height/2);
  await page.mouse.down();
  await page.mouse.move(target.x+target.width/2, target.y+target.height/2, { steps: 12 });
  const preview = await page.locator('.react-flow__connection-path').getAttribute('d');
  expect(preview).toContain('Q');
  await page.mouse.up();
  await expect(paths).toHaveCount(5);
  await expect(paths.last()).toHaveAttribute('d', preview!);
});
