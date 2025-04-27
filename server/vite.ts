/* ────────────────────────────────────────────────────────────
   server/vite.ts – Vite middleware (dev) + static serve (prod)
   Compatibile con Express 5, path-to-regexp v6, esbuild ESM.
   ──────────────────────────────────────────────────────────── */

   import { dirname, resolve } from "path";
   import { fileURLToPath } from "url";
   import type { Express, Request, Response } from "express";
   import { createServer as createViteServer, ViteDevServer } from "vite";
   
   /* Helper di logging */
   export function log(msg: string) {
     // eslint-disable-next-line no-console
     console.log(`[server] ${msg}`);
   }
   
   /* __dirname portabile in ESM */
   const __dirname = dirname(fileURLToPath(import.meta.url));
   
   /* ────────────── 1. Vite dev middleware ───────────── */
   export async function setupVite(app: Express) {
     const vite: ViteDevServer = await createViteServer({
       root: resolve(__dirname, "..", "client"),
       server: { middlewareMode: "html" },
       appType: "custom",
     });
   
     app.use(vite.middlewares);
   
     /* Wildcard DEV (Express 5) */
     app.use("/:path*", async (req: Request, res: Response) => {
       const tpl = resolve(__dirname, "..", "client", "index.html");
       const html = await vite.transformIndexHtml(req.originalUrl, tpl);
       res.status(200).type("html").end(html);
     });
   
     log("Vite dev server attached");
   }
   
   /* ───────────── 2. Static serve (production) ───────────── */
   export async function serveStatic(app: Express) {
     const express = await import("express");
   
     const dist  = resolve(__dirname, "public");
     const index = resolve(dist, "index.html");
   
     app.use("/", express.static(dist));
   
     /* Wildcard PROD (Express 5) */
     app.get("/:path*", (_req: Request, res: Response) => {
       res.sendFile(index);
     });
   
     log("Static files served from /public");
   }
   