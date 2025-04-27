/* ────────────────────────────────────────────────────────────
   server/vite.ts – versione compatibile Express 5 + esbuild
   ──────────────────────────────────────────────────────────── */

   import { dirname, resolve } from "path";
   import { fileURLToPath } from "url";
   import type { Express, Request, Response } from "express";
   import { createServer as createViteServer, ViteDevServer } from "vite";
   
   /* Log utility */
   export function log(message: string) {
     console.log(`[server] ${message}`);
   }
   
   /* __dirname in ESM */
   const __dirname = dirname(fileURLToPath(import.meta.url));
   
   /* ───── 1. Vite dev middleware ───── */
   export async function setupVite(app: Express) {
     const vite: ViteDevServer = await createViteServer({
       root: resolve(__dirname, "..", "client"),
       server: { middlewareMode: "html" },
       appType: "custom",
     });
   
     app.use(vite.middlewares);
   
     // Wildcard DEV → deve iniziare con "/"
     app.use("/(.*)", async (req: Request, res: Response) => {
       const url = req.originalUrl;
       const tplPath = resolve(__dirname, "..", "client", "index.html");
       const html = await vite.transformIndexHtml(url, tplPath);
       res.status(200).set({ "Content-Type": "text/html" }).end(html);
     });
   
     log("Vite dev server attached");
   }
   
   /* ───── 2. Static serve (prod) ───── */
   export async function serveStatic(app: Express) {
     const express = await import("express");   // dynamic import
   
     const distPath  = resolve(__dirname, "public");
     const indexHtml = resolve(distPath, "index.html");
   
     app.use("/", express.static(distPath));
   
     // Wildcard PROD → "/(.*)"
     app.get("/(.*)", (_req: Request, res: Response) => {
       res.sendFile(indexHtml);
     });
   
     log("Static files served from /public");
   }
   