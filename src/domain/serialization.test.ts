import { describe, expect, it } from 'vitest';
import { createDiagram } from './templates';
import { DocumentValidationError, exportDiagram, importDiagram, validateDiagram } from './serialization';
import type { Diagram } from './model';
const fixture = () => createDiagram('notes', 'Example');
describe('portable documents', () => {
  it('round trips starters without changing identity or retaining extra state', () => {
    for (const template of ['blank', 'web', 'notes'] as const) {
      const doc = createDiagram(template, 'Example');
      expect(validateDiagram(JSON.parse(exportDiagram({ ...doc, selected: true } as Diagram)))).toEqual(doc);
      expect(exportDiagram({ ...doc, selected: true } as Diagram)).not.toContain('selected');
    }
  });
  it('imports independent identities and remaps all references while preserving inert text', () => {
    const doc = fixture(); doc.createdAt = doc.updatedAt = '2020-01-01T00:00:00.000Z';
    doc.nodes[1].notes = '<img src=x onerror=alert(1)>';
    const imported = importDiagram(exportDiagram(doc));
    expect(imported.id).not.toBe(doc.id); expect(imported.createdAt).not.toBe(doc.createdAt);
    expect(imported.nodes[1].notes).toBe(doc.nodes[1].notes);
    expect(imported.nodes.every(n => !doc.nodes.some(old => old.id === n.id))).toBe(true);
    expect(imported.edges.every(e => !doc.edges.some(old => old.id === e.id))).toBe(true);
    expect(imported.nodes[2].parentId).toBe(imported.nodes[0].id);
    expect(imported.edges[0].source).toBe(imported.nodes[1].id);
    expect(imported.edges[0].target).toBe(imported.nodes[2].id);
  });
  const bad: [string, (d: Diagram) => void][] = [
    ['schema', d => { (d as unknown as {schemaVersion:number}).schemaVersion = 2; }],
    ['duplicate node', d => { d.nodes[1].id = d.nodes[0].id; }],
    ['duplicate edge', d => { d.edges[1].id = d.edges[0].id; }],
    ['infinite', d => { d.nodes[0].position.x = Infinity; }],
    ['coordinate', d => { d.nodes[0].position.x = 1_000_001; }],
    ['dimension', d => { d.nodes[0].width = 100_001; }],
    ['zero dimension', d => { d.nodes[0].height = 0; }],
    ['zoom low', d => { d.viewport.zoom = .19; }], ['zoom high', d => { d.viewport.zoom = 2.01; }],
    ['endpoint', d => { d.edges[0].source = 'missing'; }],
    ['text endpoint', d => { d.nodes[4].kind = 'text'; d.edges[0].source = d.nodes[4].id; }],
    ['container endpoint', d => { d.edges[0].source = d.nodes[0].id; }],
    ['handle', d => { d.edges[0].sourceHandle = 'invalid'; }],
    ['parent', d => { d.nodes[2].parentId = 'missing'; }],
    ['nested container', d => { d.nodes[0].parentId = d.nodes[0].id; }],
    ['name length', d => { d.name = 'x'.repeat(201); }],
    ['notes length', d => { d.nodes[0].notes = 'x'.repeat(10001); }],
    ['description length', d => { d.nodes[0].description = 'x'.repeat(10001); }],
    ['technology length', d => { d.nodes[1].technology = 'x'.repeat(201); }],
    ['label length', d => { d.edges[0].label = 'x'.repeat(201); }],
    ['timestamp', d => { d.updatedAt = 'yesterday'; }],
    ['impossible date', d => { d.updatedAt = '2026-02-30T00:00:00.000Z'; }],
    ['component type', d => { d.nodes[1].componentType = 'unknown'; }],
    ['category', d => { d.nodes[1].category = 'unknown'; }],
    ['node count', d => { d.nodes = Array.from({length:501}, (_,i) => ({...d.nodes[1], id:String(i)})); }],
    ['edge count', d => { d.edges = Array.from({length:1001}, (_,i) => ({...d.edges[0], id:String(i)})); }],
  ];
  it.each(bad)('rejects invalid %s', (_, mutate) => { const doc = fixture(); mutate(doc); expect(() => validateDiagram(doc)).toThrow(DocumentValidationError); });
  it('accepts exact graph, geometry and string limits and custom technology', () => {
    const d = createDiagram('web', 'x'.repeat(200));
    d.nodes = Array.from({length:500}, (_,i) => ({...d.nodes[0], id:`n${i}`, position:{x:1_000_000,y:-1_000_000},width:100_000,height:100_000,notes:'x'.repeat(10000),description:'x'.repeat(10000),technology:'x'.repeat(200)}));
    d.edges = Array.from({length:1000}, (_,i) => ({...d.edges[0],id:`e${i}`,source:'n0',target:'n1',label:'x'.repeat(200)}));
    d.viewport = {x:1_000_000,y:-1_000_000,zoom:.2}; expect(validateDiagram(d)).toEqual(d);
    d.viewport.zoom = 2; expect(validateDiagram(d)).toEqual(d);
  });
  it('ignores unknown keys recursively', () => {
    const d = fixture(); const raw = { ...structuredClone(d), history: [] };
    Object.assign(raw.nodes[0], { selected: true }); Object.assign(raw.nodes[0].position, { extra: true }); Object.assign(raw.edges[0], { animated: true });
    expect(validateDiagram(raw)).toEqual(d);
  });
  it('measures UTF-8 bytes and accepts the exact file size', () => {
    const json = exportDiagram(createDiagram('blank', 'é'));
    const size = new TextEncoder().encode(json).length;
    expect(importDiagram(json + ' '.repeat(5*1024*1024-size))).toBeDefined();
    expect(() => importDiagram(json + ' '.repeat(5*1024*1024-size+1))).toThrow(/5 MiB/);
  });
  it('reports malformed JSON', () => { expect(() => importDiagram('{')).toThrow(DocumentValidationError); });
});

it('accepts exactly 5 MiB of portable JSON and rejects one additional byte', () => {
  const doc = createDiagram('notes', 'Byte boundary');
  const component = doc.nodes.find(n => n.kind === 'component')!;
  doc.nodes = Array.from({ length: 500 }, () => ({ ...component, id: crypto.randomUUID(), parentId: undefined, notes: 'x'.repeat(10000), description: '' }));
  doc.edges = [];
  const currentBytes = new TextEncoder().encode(JSON.stringify(validateDiagram(doc), null, 2)).byteLength;
  let remaining = 5 * 1024 * 1024 - currentBytes;
  for (const node of doc.nodes) {
    const length = Math.min(10000, remaining);
    node.description = 'x'.repeat(length);
    remaining -= length;
  }
  expect(remaining).toBe(0);
  const text = exportDiagram(doc);
  expect(new TextEncoder().encode(text).byteLength).toBe(5 * 1024 * 1024);
  expect(() => importDiagram(text)).not.toThrow();
  doc.nodes.at(-1)!.description += 'x';
  expect(() => exportDiagram(doc)).toThrow('5 MiB');
});


it("preserves every connector setting through export, import and legacy validation", () => {
  const d = fixture();
  for (const stroke of ["solid", "dashed", "dotted"] as const) for (const path of ["straight", "curved", "elbow"] as const) {
    Object.assign(d.edges[0], { stroke, path });
    expect(importDiagram(exportDiagram(d)).edges[0]).toMatchObject({ stroke, path });
  }
  delete d.edges[0].stroke; delete d.edges[0].path;
  expect(validateDiagram(d).edges[0].stroke ?? "solid").toBe("solid");
  expect(validateDiagram(d).edges[0].path ?? "elbow").toBe("elbow");
});
it.each(["stroke", "path"])("rejects explicit invalid connector %s instead of silently defaulting", key => {
  for (const value of [null, "", "unknown", 1]) {
    const d = fixture(); Object.assign(d.edges[0], { [key]: value });
    expect(() => validateDiagram(d)).toThrow(/Connection/);
  }
});

it('round trips sticky-to-component and sticky-to-sticky connections with remapped endpoints', () => {
  const d = createDiagram('web', 'Connected notes');
  d.nodes[0].kind = 'sticky'; d.nodes[1].kind = 'sticky';
  const imported = importDiagram(exportDiagram(d));
  expect(imported.edges[0].source).toBe(imported.nodes[0].id);
  expect(imported.edges[0].target).toBe(imported.nodes[1].id);
  expect(imported.edges[1].source).toBe(imported.nodes[1].id);
  expect(imported.edges[1].target).toBe(imported.nodes[2].id);
});

it.each(['', 'Retry on failure.\n<img src=x onerror=alert(1)>', 'x'.repeat(10000)])('preserves connector comments through portable documents (%#)', comments => {
  const doc = fixture();
  Object.assign(doc.edges[0], { comments });
  expect(validateDiagram(doc).edges[0]).toMatchObject({ comments });
  expect(importDiagram(exportDiagram(doc)).edges[0]).toMatchObject({ comments });
});

it.each([null, 42, 'x'.repeat(10001)])('rejects invalid connector comments (%#)', comments => {
  const doc = fixture();
  Object.assign(doc.edges[0], { comments });
  expect(() => validateDiagram(doc)).toThrow(/Connection comments/);
});
