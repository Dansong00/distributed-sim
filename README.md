# System Canvas

A local architecture sketchpad: components, connections, sticky notes, text and single-level containers. Start blank or use the Web application and Note-taking app examples. Technology choices change labels and icons only.

Run all commands from this repository directory. Node.js 22.12+ (or 24+) and npm are required.

```sh
npm ci --cache /tmp/npm-cache
npm run dev -- --host 0.0.0.0
```

Open http://localhost:5173. The development server uses port 5173 with strict port selection.

```sh
npm test
npm run typecheck
npm run build
# Browser prerequisites: install Chromium and its OS dependencies once.
npx playwright install --with-deps chromium
npm run test:e2e
```

In environments with system Chromium, skip the browser download and run:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

To serve the production build:

```sh
npm run build
npm exec -- vite preview --host 0.0.0.0 --port 4173 --strictPort
```

Click a palette item or drag it onto the canvas. Select an element to edit its properties. At widths of 900px and below, Components and Properties buttons open side drawers. Shift selects multiple elements; Space or the Pan tool pans; Ctrl/Cmd Z undoes; Ctrl/Cmd Shift Z or Ctrl Y redoes; Ctrl/Cmd D duplicates; Delete removes selected elements. Shortcuts preserve ordinary input editing. History holds 100 transactions for the currently open diagram and resets on opening another diagram or reloading.

Diagrams autosave to IndexedDB in this browser and origin on this device. There is no account, backend, cloud sync, simulation or analysis. Clearing browser/site data, changing origins, or private browsing can remove or isolate diagrams. Export JSON regularly for portable backups; import creates a new diagram and never overwrites one. Another tab changing or deleting a diagram causes a conflict: keep edits with Save as copy or Export JSON, or explicitly reload/discard. A save notice reports success only after the storage transaction completes. Storage failure keeps edits in memory, so export them before leaving.

Imports accept schema version 1 and are limited to 5 MiB, 500 elements and 1,000 connections. Names, technology strings and connection labels allow 200 characters; notes/descriptions allow 10,000. Coordinates must be finite and within ±1,000,000; nesting containers is unsupported. Unknown technologies use category icons. All icons are bundled locally; seven technology marks come from [Simple Icons](https://simpleicons.org/) 16.35.0 under CC0 (see `src/assets/technology/LICENSE.txt`); other icons use lucide-react. Brand names and marks belong to their respective owners.

Validation covers Chromium keyboard workflows, modal focus, responsive panels, inert imported text, editing, persistence and revision conflicts. It is not a complete accessibility audit, cross-browser certification or performance benchmark. Touch/mobile editing has not been validated.
