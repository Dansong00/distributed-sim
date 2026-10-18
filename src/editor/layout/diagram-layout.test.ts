import { describe, expect, it } from 'vitest';
import type { Diagram } from '../../domain/model';
import { exportDiagram } from '../../domain/serialization';
import { layoutDiagram } from './diagram-layout';
import { layoutFixture } from './diagram-layout.fixture';

const geometry = (d: Diagram) => [...d.nodes].sort((a,b) => a.id.localeCompare(b.id)).map(({id,position,width,height}) => ({id,position,width,height}));

function assertBoxes(d: Diagram) {
  for (const a of d.nodes) {
    if (a.parentId) {
      const parent = d.nodes.find(n => n.id === a.parentId)!;
      expect(a.position.x).toBeGreaterThanOrEqual(24);
      expect(a.position.y).toBeGreaterThanOrEqual(24);
      expect(a.position.x + a.width + 24).toBeLessThanOrEqual(parent.width);
      expect(a.position.y + a.height + 24).toBeLessThanOrEqual(parent.height);
    }
    for (const b of d.nodes) if (a.id < b.id && a.parentId === b.parentId) {
      expect(a.position.x + a.width <= b.position.x || b.position.x + b.width <= a.position.x ||
        a.position.y + a.height <= b.position.y || b.position.y + b.height <= a.position.y, `${a.id} overlaps ${b.id}`).toBe(true);
    }
  }
}

describe('layoutDiagram', () => {
  it('preserves all meaning and sizes while laying out nested boxes and real note dimensions', async () => {
    const input = layoutFixture(), saved = structuredClone(input), result = await layoutDiagram(input);
    expect(input).toEqual(saved);
    expect(result).not.toBe(input);
    expect(result.viewport).toEqual(input.viewport);
    for (const n of input.nodes) {
      const output = result.nodes.find(o => o.id === n.id)!;
      expect({ ...output, position: n.position, ...(n.kind === 'container' ? {width:n.width,height:n.height} : {}) }).toEqual(n);
      if (n.kind === 'container') { expect(output.width).toBeGreaterThanOrEqual(n.width); expect(output.height).toBeGreaterThanOrEqual(n.height); }
    }
    for (const e of input.edges) {
      const output = result.edges.find(o => o.id === e.id)!;
      expect({...output, sourceHandle:e.sourceHandle,targetHandle:e.targetHandle}).toEqual(e);
      expect(['top','right','bottom','left']).toContain(output.sourceHandle);
      expect(['top','right','bottom','left']).toContain(output.targetHandle);
      if(e.source === e.target) expect(output).toEqual(e);
    }
    assertBoxes(result);
    expect(() => exportDiagram(result)).not.toThrow();
    const long = result.nodes.find(n => n.id === 'long-note')!;
    const siblings = result.nodes.filter(n => n.parentId === long.parentId && n.id !== long.id);
    expect(long.position.y).toBeGreaterThanOrEqual(Math.max(...siblings.map(n => n.position.y+n.height)) + 48);
  });
  it('is deterministic, ignores input positions/order, and does not drift', async () => {
    const input = layoutFixture(), first = await layoutDiagram(input);
    expect(await layoutDiagram(input)).toEqual(first);
    expect(await layoutDiagram(first)).toEqual(first);
    const reordered = {...input, nodes: [...input.nodes].reverse().map(n => ({...n,position:{x:900,y:-40}})), edges:[...input.edges].reverse()};
    const result = await layoutDiagram(reordered);
    expect(geometry(result)).toEqual(geometry(first));
    expect([...result.edges].sort((a,b)=>a.id.localeCompare(b.id))).toEqual([...first.edges].sort((a,b)=>a.id.localeCompare(b.id)));
  });
  it('keeps an empty document unchanged', async () => {
    const input = {...layoutFixture(), nodes:[],edges:[]};
    expect(await layoutDiagram(input)).toEqual(input);
  });
  it('rejects invalid input without mutation', async () => {
    const input = layoutFixture(); input.nodes[0].width = Infinity;
    const saved = structuredClone(input);
    await expect(layoutDiagram(input)).rejects.toThrow(); expect(input).toEqual(saved);
  });
  it('rejects layouts that require over-limit container growth', async () => {
    const input = layoutFixture(); input.nodes.find(n => n.id === 'long-note')!.width = 100_000;
    const saved = structuredClone(input);
    await expect(layoutDiagram(input)).rejects.toThrow(); expect(input).toEqual(saved);
  });
  it('handles note-only scopes, isolated components and containers with large saved minimums', async () => {
    const input = layoutFixture();
    input.edges = input.edges.filter(e => e.source === 'isolated-a' && e.target === 'isolated-b');
    input.nodes.find(n => n.id === 'empty')!.width = 2500;
    input.nodes.find(n => n.id === 'services')!.height = 3000;
    const result = await layoutDiagram(input);
    assertBoxes(result);
    expect(await layoutDiagram(result)).toEqual(result);
  });
  it('rejects valid input whose laid-out positions exceed coordinate bounds', async () => {
    const input = layoutFixture();
    input.nodes = Array.from({length:12}, (_, i) => ({...input.nodes[0], id:`wide-${i}`,width:100_000}));
    input.edges = input.nodes.slice(1).map((n,i) => ({...input.edges[0],id:`chain-${i}`,source:input.nodes[i].id,target:n.id}));
    const saved = structuredClone(input);
    await expect(layoutDiagram(input)).rejects.toThrow(/position/);
    expect(input).toEqual(saved);
  });
  it('enforces element, connection and portable byte limits before calculating', async () => {
    const input = layoutFixture();
    await expect(layoutDiagram({...input,nodes:Array.from({length:501},(_,i)=>({...input.nodes[0],id:`n-${i}`})),edges:[]})).rejects.toThrow(/500/);
    await expect(layoutDiagram({...input,edges:Array.from({length:1001},(_,i)=>({...input.edges[0],id:`e-${i}`}))})).rejects.toThrow(/1000/);
    const large = {...input, nodes:Array.from({length:270},(_,i)=>({...input.nodes[0],id:`n-${i}`,notes:'x'.repeat(10_000),description:'x'.repeat(10_000)})),edges:[]};
    await expect(layoutDiagram(large)).rejects.toThrow(/5 MiB/);
  });

  it('accepts endpoint IDs that match internal graph labels', async () => {
    const input = layoutFixture();
    input.nodes = [{...input.nodes[0], id:'root'}, {...input.nodes[0],id:'notes'}, {...input.nodes[0],id:'other'}];
    input.edges = [{...input.edges[0],source:'root',target:'notes'}];
    assertBoxes(await layoutDiagram(input));
  });

});
