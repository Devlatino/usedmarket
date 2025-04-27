/* server/vite.ts ─ Vite middleware (dev) + static serve (prod) */

import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import type { Express, Request, Response } from "express";
import { createServer as createViteServer, ViteDevServer } from "vite";

/* log helper strutturato */
export function log(msg: string, lvl = "info") {
  console.log(JSON.stringify({ t: Date.now(), lvl, msg }));
}

const __dirname = dirname(fileURLToPath(import.meta.url));

/* ───────────── Vite DEV ───────────── */
export async function setupVite(app: Express) {
  const vite: ViteDevServer = await createViteServer({
    root: resolve(__dirname, "..", "client"),
    server: { middlewareMode: "html" },
    appType: "custom"
  });

  app.use(vite.middlewares);

  /* catch-all dev (Express 5) */
  app.use("/:path*", async (req: Request, res: Response) => {
    const tpl = resolve(__dirname, "..", "client", "index.html");
    const html = await vite.transformIndexHtml(req.originalUrl, tpl);
    res.status(200).type("html").end(html);
  });

  log("Vite dev server attached");
}

/* ───────────── STATIC PRODUCTION ───────────── */
export async function serveStatic(app: Express) {
  const express = await import("express");
  const dist    = resolve(__dirname, "public");
  const index   = resolve(dist, "index.html");

  app.use("/", express.static(dist));

  /* catch-all prod */
  app.get("/:path*", (_req, res) => res.sendFile(index));

  log("Static files served from /public");
}
