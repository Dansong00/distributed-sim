import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  // Worker-only imports are discovered after startup; prebundle to avoid a
  // first-cleanup optimizer reload that would close the active document.
  optimizeDeps: { include: ["elkjs/lib/elk.bundled.js"] },
  worker: { format: "es" }, // The module worker imports ELK after its initialization shim.
  test: { include: ["src/**/*.test.{ts,tsx}"] },
});
