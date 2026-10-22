import { createComponent } from '../../domain/catalog';
import type { Diagram, DiagramNode } from '../../domain/model';

export function layoutFixture(): Diagram {
  const node = (id: string, kind: DiagramNode['kind'] = 'component', parentId?: string): DiagramNode => ({
    ...(kind === 'component' ? createComponent('api-server', { x: 5, y: 5 }) : { position: {x:5,y:5}, name:id, notes:'',description:'' }), id, kind, ...(parentId ? { parentId } : {}),
    width: kind === 'container' ? 480 : 220, height: kind === 'container' ? 320 : 100,
  });
  const nodes = [node('client'), node('api', 'component', 'services'), node('database', 'component', 'services'),
    node('queue'), node('worker-a'), node('worker-b'), node('cache'), node('storage'),
    node('services', 'container'), node('empty', 'container'), node('shared-note', 'sticky', 'services'),
    node('note-chain', 'sticky'), node('isolated-a', 'sticky'), node('isolated-b', 'sticky'),
    { ...node('long-note', 'sticky', 'services'), width: 720, height: 900, notes: 'Long note\n'.repeat(100) },
    { ...node('text', 'text'), width: 640, height: 280 }];
  const links = [['client','api'], ['api','database'], ['api','queue'], ['queue','worker-a'], ['queue','worker-b'],
    ['worker-a','cache'], ['worker-b','storage'], ['worker-a','api'], ['api','client'], ['client','api'],
    ['api','api'], ['api','shared-note'], ['database','shared-note'], ['shared-note','note-chain'], ['isolated-a','isolated-b']];
  return { schemaVersion: 1, id: 'layout', name: 'Representative architecture', createdAt: '2026-10-18T00:00:00.000Z',
    updatedAt: '2026-10-18T00:00:00.000Z', viewport: { x: 55, y: -20, zoom: .8 }, nodes,
    edges: links.map(([source,target], i) => ({ id: `edge-${i}`, source, target, sourceHandle: 'right', targetHandle: 'left',
      label: `Relation ${i}`, direction: i % 2 ? 'both' : 'one-way', path: ['straight','curved','elbow'][i % 3] as 'straight', stroke: 'dashed' })) };
}
