import { createComponent } from './catalog';
import type { Diagram, DiagramEdge, DiagramNode } from './model';
export { createComponent } from './catalog';
export function createDiagram(template: 'blank' | 'web' | 'notes', name: string): Diagram {
  const now = new Date().toISOString();
  const document: Diagram = { schemaVersion: 1, id: crypto.randomUUID(), name, createdAt: now, updatedAt: now, nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } };
  if (template === 'blank') return document;
  const browser = createComponent('web-browser', { x: 80, y: 210 });
  const api = createComponent('api-server', { x: 400, y: 210 });
  const database = createComponent(template === 'notes' ? 'postgresql' : 'generic-database', { x: 720, y: 210 });
  document.nodes = [browser, api, database];
  const connect = (source: DiagramNode, target: DiagramNode, label: string): DiagramEdge => ({
    id: crypto.randomUUID(), source: source.id, target: target.id, sourceHandle: 'right', targetHandle: 'left', label, direction: 'one-way',
  });
  document.edges = [connect(browser, api, 'HTTPS requests'), connect(api, database, template === 'notes' ? 'Read / write notes' : 'Read / write data')];
  if (template === 'notes') {
    const container: DiagramNode = { id: crypto.randomUUID(), kind: 'container', position: { x: 360, y: 100 }, width: 640, height: 400, name: 'Application', notes: '', description: '' };
    api.name = 'Notes API';
    api.parentId = container.id; api.position = { x: 40, y: 110 };
    database.parentId = container.id; database.position = { x: 360, y: 110 };
    document.nodes = [container, browser, api, database, {
      id: crypto.randomUUID(), kind: 'sticky', position: { x: 80, y: 390 }, width: 240, height: 160,
      name: 'A starting point', notes: 'A modest, single-region notes app. One API service and one database; availability, backups, and scaling are decisions to explore.', description: '', color: 'yellow',
    }];
  }
  return document;
}
