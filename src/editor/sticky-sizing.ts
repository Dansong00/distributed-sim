import type { Diagram, DiagramNode, Point } from '../domain/model';

export const STICKY_MIN_WIDTH = 80;
export const STICKY_MAX_SIZE = 100_000;

// Use the same typography and box model as the rendered note, outside Flow's
// zoom transform. Layout runs synchronously so text and growth share history.
export function stickyContentHeight(node: DiagramNode, width = node.width): number {
  const probe = document.createElement('div');
  probe.className = 'sticky-node';
  Object.assign(probe.style, {
    position: 'absolute', visibility: 'hidden', pointerEvents: 'none',
    left: '-200000px', top: '0', width: `${width}px`, height: 'auto',
    overflow: 'visible',
  });
  const title = document.createElement('strong');
  title.textContent = node.name;
  const body = document.createElement('p');
  body.textContent = node.notes;
  probe.append(title, body);
  document.body.append(probe);
  const height = Math.ceil(probe.getBoundingClientRect().height);
  probe.remove();
  return Math.min(STICKY_MAX_SIZE, height);
}

export function growStickyNotes(diagram: Diagram, previous?: Diagram): Diagram {
  let changed = false;
  const nodes = diagram.nodes.map(node => {
    if (node.kind !== 'sticky') return node;
    const old = previous?.nodes.find(candidate => candidate.id === node.id);
    if (old && old.name === node.name && old.notes === node.notes && old.width === node.width && old.height === node.height) return node;
    const width = Math.max(STICKY_MIN_WIDTH, node.width);
    const height = Math.max(node.height, stickyContentHeight(node, width));
    if (height === node.height && width === node.width) return node;
    changed = true;
    return { ...node, width, height };
  });
  return changed ? { ...diagram, nodes } : diagram;
}

export function resizeSticky(node: DiagramNode, size: { width: number; height: number; position?: Point }, anchor?: { right?: number; bottom?: number }): DiagramNode {
  const width = Math.min(STICKY_MAX_SIZE, Math.max(STICKY_MIN_WIDTH, size.width));
  const height = Math.min(STICKY_MAX_SIZE, Math.max(size.height, stickyContentHeight(node, width)));
  const proposed = size.position ?? node.position;
  // Anchor the original opposite edges for the whole gesture, including a
  // horizontal top-corner drag whose width change alone requires more height.
  return { ...node, width, height, position: {
    x: anchor?.right !== undefined ? anchor.right - width : proposed.x,
    y: anchor?.bottom !== undefined ? anchor.bottom - height : proposed.y,
  } };
}
