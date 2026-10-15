import { describe, expect, it } from 'vitest';
import { createDiagram } from './templates';
describe('starter diagrams', () => {
  it('createsIndependentTemplates', () => {
    const a = createDiagram('notes', 'A'); const b = createDiagram('notes', 'B');
    expect(a.id).not.toBe(b.id);
    expect(a.nodes.every(n => !b.nodes.some(other => other.id === n.id))).toBe(true);
    for (const template of ['blank', 'web', 'notes'] as const) {
      const doc = createDiagram(template, template);
      const ids = new Set(doc.nodes.map(n => n.id));
      expect(doc.edges.every(e => ids.has(e.source) && ids.has(e.target))).toBe(true);
      expect(doc.nodes.every(n => !n.parentId || ids.has(n.parentId))).toBe(true);
    }
    expect(createDiagram('blank', 'Blank').nodes).toHaveLength(0);
    const container = a.nodes.find(n => n.kind === 'container')!;
    expect(a.nodes.filter(n => n.parentId === container.id).map(n => n.name)).toEqual(['Notes API', 'PostgreSQL']);
    expect(a.nodes.find(n => n.name === 'Web Browser')?.parentId).toBeUndefined();
  });
});

it('keeps parents before children in rendering without changing document order', async () => {
  const { toFlowNodes } = await import('../editor/flow-adapter');
  const document = createDiagram('notes', 'Notes');
  document.nodes.reverse();
  const original = document.nodes.map(n => n.id);
  const flow = toFlowNodes(document);
  for (const node of flow) {
    if (node.parentId) expect(flow.findIndex(n => n.id === node.parentId)).toBeLessThan(flow.indexOf(node));
  }
  expect(document.nodes.map(n => n.id)).toEqual(original);
});

it('creates independent component positions and exposes all catalog categories', async () => {
  const { categories, presets, createComponent } = await import('./catalog');
  expect(categories).toHaveLength(7);
  expect(presets).toHaveLength(27);
  expect(new Set(presets.map(p => p.id)).size).toBe(27);
  const position = { x: 12, y: 34 };
  const component = createComponent('postgresql', position);
  position.x = 99;
  expect(component.position).toEqual({ x: 12, y: 34 });
  expect(component).toMatchObject({ componentType: 'database', technology: 'PostgreSQL', width: 200, height: 88 });
});
