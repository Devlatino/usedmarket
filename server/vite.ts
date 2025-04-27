/* ────────────────────────────────────────────────────────────
   server/vite.ts
   - Vite middleware per lo sviluppo
   - Servizio di file statici per la produzione
   - Helper di logging
   Compatibile con Node ESM e con il bundle generato da esbuild.
   ──────────────────────────────────────────────────────────── */

   import { dirname, resolve } from "path";
   import { fileURLToPath } from "url";
   import type { Express, Request, Response } from "express";
   import { createServer as createViteServer, ViteDevServer } from "vite";
   
   /* ──────────── Helper di logging ──────────── */
   export function log(message: string) {
     // eslint-disable-next-line no-console
     console.log(`[server] ${message}`);
   }
   
   /* __dirname portabile in ESM */
   const __dirname = dirname(fileURLToPath(import.meta.url));
   
   /* ╔══════ 1. VITE DEV SERVER (npm run dev) ══════╗ */
   export async function setupVite(app: Express) {
     const vite: ViteDevServer = await createViteServer({
       root: resolve(__dirname, "..", "client"),
       server: { middlewareMode: "html" },
       appType: "custom",
     });
   
     app.use(vite.middlewares);
   
     /* Wildcard → Express 5 richiede "(.*)" o "/*" */
     app.use("(.*)", async (req: Request, res: Response) => {
       try {
         const url = req.originalUrl;
         const templatePath = resolve(__dirname, "..", "client", "index.html");
         const html = await vite.transformIndexHtml(url, templatePath);
         res.status(200).set({ "Content-Type": "text/html" }).end(html);
       } catch (err) {
         vite.ssrFixStacktrace(err as Error);
         console.error(err);
         res.status(500).end(err instanceof Error ? err.message : "error");
       }
     });
   
     log("Vite dev server attached");
   }
   
   /* ╔══════ 2. STATIC SERVE (npm start / prod) ══════╗ */
   export async function serveStatic(app: Express) {
     // Import dinamico per evitare peso inutile nel bundle client
     const express = await import("express");
     const distPath  = resolve(__dirname, "public");
     const indexHtml = resolve(distPath, "index.html");
   
     // Asset statici pre-buildati
     app.use("/", express.static(distPath));
   
     // Fallback SPA (wildcard compatibile Express 5)
     app.get("(.*)", (_req: Request, res: Response) => {
       res.sendFile(indexHtml);
     });
   
     log("Static files served from /public");
   }
   