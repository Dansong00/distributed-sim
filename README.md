# System Canvas

A local architecture sketchpad: components, connections, sticky notes, text and single-level containers. Start blank or use the Web application and Note-taking app examples. Technology choices change labels and icons only.

Feature status and deferred work are tracked in [the product backlog](docs/BACKLOG.md).

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

## GitHub Pages hosting

The Pages site is https://Dansong00.github.io/distributed-sim/. In the GitHub repository, open **Settings → Pages → Build and deployment** and select **GitHub Actions** as the **Source**. This is a one-time repository setting, not a Git command. No personal access token or custom deployment secret is needed; the workflow uses GitHub's built-in deployment credentials.

The workflow in `.github/workflows/pages.yml` installs locked dependencies, runs unit tests, and builds the app (including TypeScript checking). Pull requests only validate the build. Pushes to `main` also upload `dist/` and deploy it through the `github-pages` environment. Once this workflow is merged and Pages is enabled, watch **Actions → Build and deploy GitHub Pages** for the deployment result. To deploy again manually, select **Run workflow** on `main`. Environment approval rules, if configured, can pause deployment for review.

Vite's **base** is the URL prefix used for built assets. On this repository's Pages site, an asset must load from `/distributed-sim/assets/...`, rather than `/assets/...`. The workflow passes `--base /distributed-sim/` only to the hosted build, so ordinary local development still works at `http://localhost:5173/`.

To test the hosted paths locally:

```sh
npm run build -- --base /distributed-sim/
npm exec -- vite preview --host 0.0.0.0 --port 4173 --strictPort --base /distributed-sim/
```

Open `http://localhost:4173/distributed-sim/`. If the repository name or hosting path changes (for example, to a custom domain's root), update the workflow's base path accordingly. Hosting does not sync browser data: export diagrams from localhost and import them on the Pages site.

Click a palette item or drag it onto the canvas. Select an element to edit its properties. At widths of 900px and below, Components and Properties buttons open side drawers. Shift selects multiple elements; Space or the Pan tool pans; Ctrl/Cmd Z undoes; Ctrl/Cmd Shift Z or Ctrl Y redoes; Ctrl/Cmd D duplicates; Delete removes selected elements. Shortcuts preserve ordinary input editing. History holds 100 transactions for the currently open diagram and resets on opening another diagram or reloading.

Connectors start with a solid stroke and elbow path. Select a connector to change **Stroke style** (solid, dashed, dotted) or **Path shape** (straight, curved, elbow). Selected connector lines highlight; Shift-click selects several. Styling applies to all selected connectors, shows **Mixed** for differing values, and undoes in one step. When components are selected too, use the **Connections (N)** controls. Aligned facing handles use a straight elbow segment; self-connections stay visible as loops. Routing is automatic, with no manual bend editing or obstacle avoidance.

Sticky notes grow vertically to contain their title and text. Select a note and drag its corner or edge handles to resize it; shrinking stops at the height needed for its text. Extra space you add stays until you shrink it manually. Dimensions are saved, and each resize is one undo/redo step. The 10,000-character body limit remains. Extremely tall content scrolls inside the note at the canvas size ceiling.

Diagrams autosave to IndexedDB in this browser and origin on this device. There is no account, backend, cloud sync, simulation or analysis. Clearing browser/site data, changing origins, or private browsing can remove or isolate diagrams. Export JSON regularly for portable backups; import creates a new diagram and never overwrites one. Another tab changing or deleting a diagram causes a conflict: keep edits with Save as copy or Export JSON, or explicitly reload/discard. A save notice reports success only after the storage transaction completes. Storage failure keeps edits in memory, so export them before leaving.

The editor rejects an entire edit before applying it if it would exceed 500 elements, 1,000 connections, or the 5 MiB portable JSON limit, preserving existing work and history. Imports accept schema version 1 and are limited to 5 MiB, 500 elements and 1,000 connections. Names, technology strings and connection labels allow 200 characters; notes/descriptions allow 10,000. Coordinates must be finite and within ±1,000,000; nesting containers is unsupported. Unknown technologies use category icons. All icons are bundled locally; seven technology marks come from [Simple Icons](https://simpleicons.org/) 16.35.0 under CC0 (see `src/assets/technology/LICENSE.txt`); other icons use lucide-react. Brand names and marks belong to their respective owners.

Validation covers Chromium keyboard workflows, modal focus, responsive panels, inert imported text, editing, persistence and revision conflicts. It is not a complete accessibility audit, cross-browser certification or performance benchmark. Touch/mobile editing has not been validated.
