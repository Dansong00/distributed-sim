import { describe, expect, it } from 'vitest';
import type { Diagram, DiagramNode } from './model';
import { deleteSelection, duplicateSelection, moveSelection, reparentMoved, resizeContainer, worldPosition } from './operations';
const node = (id: string, x = 0, y = 0, parentId?: string, kind: DiagramNode['kind'] = 'component'): DiagramNode => ({ id, kind, position:{x,y}, width:20,height:20,parentId,name:id,notes:'',description:'' });
const box = (id = 'box', x = 100, y = 100, width = 200, height = 200): DiagramNode => ({...node(id,x,y,undefined,'container'),width,height});
const doc = (nodes: DiagramNode[]): Diagram => ({schemaVersion:1,id:'doc',name:'test',createdAt:'',updatedAt:'',nodes,edges:[{id:'edge',source:'a',target:'b',sourceHandle:'right',targetHandle:'left',label:'',direction:'one-way'}],viewport:{x:0,y:0,zoom:1}});
const sel = (...nodeIds: string[]) => ({nodeIds,edgeIds:[]});
describe('document operations', () => {
 it('deletes containers without moving their surviving members', () => {
  const original = doc([box(),node('a',20,30,'box'),node('b')]);
  const result = deleteSelection(original,sel('box'));
  expect(result.nodes[0]).toMatchObject({id:'a',position:{x:120,y:130},parentId:undefined});
  expect(original.nodes[1].parentId).toBe('box');
  expect(deleteSelection(original,sel('box','a')).nodes.map(n=>n.id)).toEqual(['b']);
 });
 it('removes incident and explicitly selected edges', () => { expect(deleteSelection(doc([node('a'),node('b')]),sel('a')).edges).toEqual([]); expect(deleteSelection(doc([]),{nodeIds:[],edgeIds:['edge']}).edges).toEqual([]); });
 it('moves a parent and selected member exactly once', () => {
  const result=moveSelection(doc([box(),node('a',20,30,'box')]),sel('box','a'),{x:10,y:15});
  expect(worldPosition(result.nodes[1],result.nodes)).toEqual({x:130,y:145});
  expect(result.nodes[1].position).toEqual({x:20,y:30});
 });
 it('assigns by center using smallest area then stable ID and excludes containers', () => {
  const result=reparentMoved(doc([box('z',0,0),box('b',0,0,100,100),box('a',0,0,100,100),node('n',90,40)]),['n','z']);
  expect(result.nodes[3]).toMatchObject({parentId:'a',position:{x:90,y:40}});
  expect(result.nodes[0].parentId).toBeUndefined();
 });
 it('detaches moved members preserving world position', () => {
  const original=doc([box(),node('a',250,30,'box')]);
  expect(reparentMoved(original,['a']).nodes[1]).toMatchObject({position:{x:350,y:130},parentId:undefined});
 });
 it('duplicates members once and remaps only internal edges', () => {
  const original=doc([box(),node('a',20,30,'box'),node('b',60,30,'box'),node('outside')]);
  original.edges.push({...original.edges[0],id:'external',target:'outside'});
  const result=duplicateSelection(original,sel('box','a'));
  expect(result.document.nodes).toHaveLength(7);
  expect(result.document.edges).toHaveLength(3);
  const copies=result.document.nodes.slice(4), parent=copies.find(n=>n.kind==='container')!;
  expect(copies.filter(n=>n.parentId===parent.id)).toHaveLength(2);
  expect(worldPosition(copies.find(n=>n.name==='a')!,result.document.nodes)).toEqual({x:152,y:162});
  expect(result.selection.nodeIds).toHaveLength(3);
  expect(result.document.edges[2].source).not.toBe('a');
 });
 it('retains duplicated member parent only when offset bounds fit', () => {
  const result=duplicateSelection(doc([box(),node('a',20,30,'box'),node('b',170,30,'box')]),sel('a','b'));
  expect(result.document.nodes[3].parentId).toBe('box');
  expect(result.document.nodes[4]).toMatchObject({parentId:undefined,position:{x:302,y:162}});
 });
 it('clamps resize to member bounds plus padding without adopting stationary nodes', () => {
  const result=resizeContainer(doc([box(),node('a',120,130,'box'),node('b',110,110)]),'box',{width:10,height:10});
  expect(result.nodes[0]).toMatchObject({width:164,height:174});
  expect(result.nodes[2].parentId).toBeUndefined();
 });
});

it("clamps top/left resize origins around member world rectangles and preserves member positions", () => {
  const original = doc([
    box(),
    node("a", 20, 30, "box"),
    node("b", 100, 120, "box"),
  ]);
  const result = resizeContainer(original, "box", {
    width: 50,
    height: 50,
    position: { x: 250, y: 250 },
  });
  const boundary = result.nodes[0];
  expect(boundary.position).toEqual({ x: 96, y: 106 });
  expect(boundary.width).toBe(204);
  expect(boundary.height).toBe(194);
  expect(worldPosition(result.nodes[1], result.nodes)).toEqual({
    x: 120,
    y: 130,
  });
  expect(worldPosition(result.nodes[2], result.nodes)).toEqual({
    x: 200,
    y: 220,
  });
  expect(result.nodes[1].position).toEqual({ x: 24, y: 24 });
});
it("clamps bottom/right shrink with padding while preserving the proposed top/left expansion", () => {
  const original = doc([box(), node("a", 120, 130, "box")]);
  const result = resizeContainer(original, "box", {
    width: 20,
    height: 20,
    position: { x: 80, y: 70 },
  });
  expect(result.nodes[0]).toMatchObject({
    position: { x: 80, y: 70 },
    width: 184,
    height: 204,
  });
  expect(worldPosition(result.nodes[1], result.nodes)).toEqual({
    x: 220,
    y: 230,
  });
});
