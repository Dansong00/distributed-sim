import { openDB, type DBSchema } from 'idb';
import type { Diagram, StoredDiagram } from '../domain/model';
import { validateDiagram } from '../domain/serialization';

export class DiagramConflictError extends Error {
  constructor(public readonly id: string, public readonly expectedRevision: number | null, public readonly actualRevision: number | null) {
    super(actualRevision === null ? 'This diagram was deleted or does not exist.' : 'This diagram changed in another tab.');
    this.name = 'DiagramConflictError';
  }
}
export class CorruptDiagramError extends Error {
  constructor(public readonly id: string, public readonly cause: unknown) {
    super(`Saved diagram ${id} is invalid and could not be opened.`);
    this.name = 'CorruptDiagramError';
  }
}
export interface DiagramStore {
  /** Corrupt entries from the latest completed list call. Valid entries remain available. */
  readonly diagnostics: readonly CorruptDiagramError[];
  list(): Promise<StoredDiagram[]>;
  get(id: string): Promise<StoredDiagram | undefined>;
  save(document: Diagram, expectedRevision: number | null): Promise<StoredDiagram>;
  remove(id: string, expectedRevision: number): Promise<void>;
}
interface DiagramDatabase extends DBSchema {
  diagrams: { key: string; value: StoredDiagram };
}
function readRecord(value: unknown, id: string): StoredDiagram {
  try {
    const record = value as StoredDiagram;
    if (!record || !Number.isSafeInteger(record.revision) || record.revision < 1) throw new Error('Invalid revision.');
    const document = validateDiagram(record.document);
    if (document.id !== id) throw new Error('Record ID does not match document ID.');
    return { document, revision: record.revision };
  } catch (error) { throw new CorruptDiagramError(id, error); }
}
/** Database name override supports isolated tests; production uses distributed-sim. */
export function createDiagramStore(databaseName = 'distributed-sim'): DiagramStore {
  // Open lazily so an unavailable IndexedDB becomes a rejected operation, not an import failure.
  const database = () => openDB<DiagramDatabase>(databaseName, 1, {
    upgrade(db) { db.createObjectStore('diagrams', { keyPath: 'document.id' }); },
    blocking(_currentVersion, _blockedVersion, event) { (event.target as IDBDatabase).close(); },
  });
  let diagnostics: CorruptDiagramError[] = [];
  async function mutate(id: string, expectedRevision: number | null, document?: Diagram): Promise<StoredDiagram | undefined> {
    const db = await database();
    try {
      const tx = db.transaction('diagrams', 'readwrite');
      try {
        const raw = await tx.store.get(id);
        const current = raw === undefined ? undefined : readRecord(raw, id);
        const actualRevision = current?.revision ?? null;
        if (expectedRevision !== actualRevision || (document === undefined && current === undefined)) {
          throw new DiagramConflictError(id, expectedRevision, actualRevision);
        }
        const result = document ? { document, revision: (actualRevision ?? 0) + 1 } : undefined;
        if (result) {
          if (!Number.isSafeInteger(result.revision)) throw new Error('Diagram revision limit reached.');
          await tx.store.put(result);
        } else await tx.store.delete(id);
        await tx.done;
        return result;
      } catch (error) {
        try { tx.abort(); } catch { /* Transaction may already have aborted. */ }
        await tx.done.catch(() => undefined);
        throw error;
      }
    } finally { db.close(); }
  }
  return {
    get diagnostics() { return diagnostics; },
    async list() {
      const db = await database();
      try {
        const tx = db.transaction('diagrams');
        const [keys, values] = await Promise.all([tx.store.getAllKeys(), tx.store.getAll()]);
        await tx.done;
        const valid: StoredDiagram[] = [];
        const corrupt: CorruptDiagramError[] = [];
        values.forEach((value, index) => {
          try { valid.push(readRecord(value, keys[index])); }
          catch (error) { corrupt.push(error as CorruptDiagramError); }
        });
        diagnostics = corrupt;
        return valid.sort((a, b) => Date.parse(b.document.updatedAt) - Date.parse(a.document.updatedAt));
      } finally { db.close(); }
    },
    async get(id) {
      const db = await database();
      try {
        const value = await db.get('diagrams', id);
        return value === undefined ? undefined : readRecord(value, id);
      } finally { db.close(); }
    },
    async save(document, expectedRevision) {
      return (await mutate(document.id, expectedRevision, validateDiagram(document)))!;
    },
    async remove(id, expectedRevision) { await mutate(id, expectedRevision); },
  };
}
