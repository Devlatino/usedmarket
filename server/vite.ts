import path, { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import type { Express, Request, Response } from "express";
import { createServer as createViteServer, ViteDevServer } from "vite";

// ────────────────────────────────────────────────────────────
// Utility: ricava __dirname in un modulo ESM
// (import.meta.dirname non esiste in Node → undefined)
const __dirname = dirname(fileURLToPath(import.meta.url));
// ────────────────────────────────────────────────────────────

/** Avvia Vite in modalità middleware per lo sviluppo */
export async function setupVite(app: Express) {
  const vite: ViteDevServer = await createViteServer({
    root: path.resolve(__dirname, "..", "client"),
    server: { middlewareMode: "html" },
    appType: "custom",
  });

  // In dev Vite gestisce direttamente gli asset React
  app.use(vite.middlewares);

  // Catch-all per le route React (SPA)
  app.use("*", async (req: Request, res: Response) => {
    try {
      const url = req.originalUrl;
      const templatePath = resolve(
        __dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await vite.transformIndexHtml(url, templatePath);
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (err) {
      vite.ssrFixStacktrace(err as Error);
      console.error(err);
      res.status(500).end(err instanceof Error ? err.message : "error");
    }
  });
}

/** Serve i file statici già buildati (modalità produzione) */
export function serveStatic(app: Express) {
  // In produzione Vite ha copiato gli asset in dist/public
  const distPath = resolve(__dirname, "public");
  const indexHtml = resolve(distPath, "index.html");

  // Static assets (JS/CSS/img/font…)
  app.use("/", (await import("express")).static(distPath));

  // Catch-all SPA fallback
  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(indexHtml);
  });
}

