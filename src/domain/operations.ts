import type { Diagram, DiagramNode, Point, Selection } from './model';

export function worldPosition(node: DiagramNode, nodes: DiagramNode[]): Point {
  const parent = nodes.find(candidate => candidate.id === node.parentId);
  return parent ? { x: parent.position.x + node.position.x, y: parent.position.y + node.position.y } : { ...node.position };
}

export function deleteSelection(doc: Diagram, selection: Selection): Diagram {
  const deleted = new Set(selection.nodeIds);
  return {
    ...doc,
    nodes: doc.nodes.filter(node => !deleted.has(node.id)).map(node => {
      if (!node.parentId || !deleted.has(node.parentId)) return node;
      return { ...node, parentId: undefined, position: worldPosition(node, doc.nodes) };
    }),
    edges: doc.edges.filter(edge => !selection.edgeIds.includes(edge.id) && !deleted.has(edge.source) && !deleted.has(edge.target)),
  };
}

export function moveSelection(doc: Diagram, selection: Selection, delta: Point): Diagram {
  const selected = new Set(selection.nodeIds);
  return { ...doc, nodes: doc.nodes.map(node => selected.has(node.id) && !selected.has(node.parentId ?? '')
    ? { ...node, position: { x: node.position.x + delta.x, y: node.position.y + delta.y } } : node) };
}

export function reparentMoved(doc: Diagram, nodeIds: string[]): Diagram {
  const containers = doc.nodes.filter(node => node.kind === 'container');
  return { ...doc, nodes: doc.nodes.map(node => {
    if (!nodeIds.includes(node.id) || node.kind === 'container') return node;
    const position = worldPosition(node, doc.nodes);
    const center = { x: position.x + node.width / 2, y: position.y + node.height / 2 };
    const parent = containers.filter(container => center.x >= container.position.x && center.x <= container.position.x + container.width
      && center.y >= container.position.y && center.y <= container.position.y + container.height)
      .sort((a, b) => a.width * a.height - b.width * b.height || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))[0];
    return { ...node, parentId: parent?.id, position: parent ? { x: position.x - parent.position.x, y: position.y - parent.position.y } : position };
  }) };
}

export function resizeContainer(
  doc: Diagram,
  id: string,
  size: { width: number; height: number; position?: Point },
): Diagram {
  const container = doc.nodes.find(
    (node) => node.id === id && node.kind === "container",
  );
  if (!container) return doc;
  const members = doc.nodes
    .filter((node) => node.parentId === id)
    .map((node) => ({ node, world: worldPosition(node, doc.nodes) }));
  const proposed = size.position ?? container.position;
  const left = Math.min(
    proposed.x,
    ...members.map(({ world }) => world.x - 24),
  );
  const top = Math.min(proposed.y, ...members.map(({ world }) => world.y - 24));
  const right = Math.max(
    proposed.x + size.width,
    left + 48,
    ...members.map(({ node, world }) => world.x + node.width + 24),
  );
  const bottom = Math.max(
    proposed.y + size.height,
    top + 48,
    ...members.map(({ node, world }) => world.y + node.height + 24),
  );
  return {
    ...doc,
    nodes: doc.nodes.map((node) => {
      if (node.id === id)
        return {
          ...node,
          position: { x: left, y: top },
          width: right - left,
          height: bottom - top,
        };
      const member = members.find((member) => member.node.id === node.id);
      return member
        ? {
            ...node,
            position: { x: member.world.x - left, y: member.world.y - top },
          }
        : node;
    }),
  };
}

export function duplicateSelection(doc: Diagram, selection: Selection): { document: Diagram; selection: Selection } {
  const selected = new Set(selection.nodeIds);
  const originals = doc.nodes.filter(node => selected.has(node.id) || (node.parentId && selected.has(node.parentId)));
  const ids = new Map(originals.map(node => [node.id, crypto.randomUUID()]));
  const copies = originals.map(node => {
    const parentCopy = node.parentId ? ids.get(node.parentId) : undefined;
    if (parentCopy) return { ...node, id: ids.get(node.id)!, parentId: parentCopy, position: { ...node.position } };
    const parent = doc.nodes.find(candidate => candidate.id === node.parentId);
    const offset = { x: node.position.x + 32, y: node.position.y + 32 };
    const fits = parent && offset.x >= 0 && offset.y >= 0 && offset.x + node.width <= parent.width && offset.y + node.height <= parent.height;
    const world = worldPosition(node, doc.nodes);
    return { ...node, id: ids.get(node.id)!, parentId: fits ? parent.id : undefined,
      position: fits ? offset : { x: world.x + 32, y: world.y + 32 } };
  });
  const edges = doc.edges.filter(edge => ids.has(edge.source) && ids.has(edge.target)).map(edge => ({
    ...edge, id: crypto.randomUUID(), source: ids.get(edge.source)!, target: ids.get(edge.target)!,
  }));
  return { document: { ...doc, nodes: [...doc.nodes, ...copies], edges: [...doc.edges, ...edges] },
    selection: { nodeIds: copies.map(node => node.id), edgeIds: edges.map(edge => edge.id) } };
}
