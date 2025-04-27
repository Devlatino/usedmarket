import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import type { Express, Request, Response } from "express";
import { createServer as createViteServer, ViteDevServer } from "vite";

/* Logger */
export function log(msg: string) {
  console.log(`[server] ${msg}`);
}

/* __dirname compatibile ESM */
const __dirname = dirname(fileURLToPath(import.meta.url));

/* 1. Vite dev middleware ----------------------------------- */
export async function setupVite(app: Express) {
  const vite: ViteDevServer = await createViteServer({
    root: resolve(__dirname, "..", "client"),
    server: { middlewareMode: "html" },
    appType: "custom",
  });

  app.use(vite.middlewares);

  /* Wildcard DEV -> "/:path*"  */
  app.use("/:path*", async (req: Request, res: Response) => {
    const url     = req.originalUrl;
    const tplPath = resolve(__dirname, "..", "client", "index.html");
    const html    = await vite.transformIndexHtml(url, tplPath);
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  });

  log("Vite dev server attached");
}

/* 2. Static serve (production) ----------------------------- */
export async function serveStatic(app: Express) {
  const express   = await import("express");
  const distPath  = resolve(__dirname, "public");
  const indexHtml = resolve(distPath, "index.html");

  app.use("/", express.static(distPath));

  /* Wildcard PROD -> "/:path*" */
  app.get("/:path*", (_req: Request, res: Response) => {
    res.sendFile(indexHtml);
  });

  log("Static files served from /public");
}
