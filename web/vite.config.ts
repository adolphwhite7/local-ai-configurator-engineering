import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const downloadPath = "/local-models/design-brief/download";
const documentPath = fileURLToPath(new URL("./content/local-model-design-brief.md", import.meta.url));
const documentBody = () => readFileSync(documentPath, "utf8").replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();

// One canonical Markdown source also produces the anonymous download.
function publicDocument(): Plugin {
  const middleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.url?.split("?")[0] !== downloadPath) return next();
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="local-model-guide-design-brief.md"');
    res.end(documentBody());
  };
  return {
    name: "public-design-brief",
    configureServer(server) { server.middlewares.use(middleware); },
    configurePreviewServer(server) { server.middlewares.use(middleware); },
    generateBundle() { this.emitFile({ type: "asset", fileName: downloadPath.slice(1), source: documentBody() }); },
  };
}

export default defineConfig({
  cacheDir: ".vite-cache",
  plugins: [react(), publicDocument()],
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  server: { host: "127.0.0.1", open: false, watch: { usePolling: true } },
  preview: { host: "127.0.0.1", open: false },
  build: { sourcemap: false },
});
