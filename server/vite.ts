/* ────────────────────────────────────────────────────────────
   server/vite.ts
   Configura:
   1. Vite in modalità middleware per lo sviluppo
   2. Serving statico della SPA già buildata in produzione
   Funziona con Node ESM (import.meta.url) e con il bundle esbuild.
   ──────────────────────────────────────────────────────────── */

   import { dirname, resolve } from "path";
   import { fileURLToPath } from "url";
   import type { Express, Request, Response } from "express";
   import { createServer as createViteServer, ViteDevServer } from "vite";
   
   /* __dirname compatibile con ESM ------------------------------------------------
      In un modulo ECMAScript (come dist/index.js) non esistono __dirname/__filename.
      Li ricaviamo da import.meta.url in modo portabile. */
   const __dirname = dirname(fileURLToPath(import.meta.url));
   
   /* ╔══════════════════════════════════════════════════════════════════════╗
      ║  1. VITE DEV SERVER (usato solo in `npm run dev`)                    ║
      ╚══════════════════════════════════════════════════════════════════════╝ */
   export async function setupVite(app: Express) {
     // Root del progetto React (folder client)
     const vite: ViteDevServer = await createViteServer({
       root: resolve(__dirname, "..", "client"),
       server: { middlewareMode: "html" },
       appType: "custom", // disattiva il fallback automatico di Vite
     });
   
     // Integra i middleware di Vite (HMR, trasformazioni, ecc.)
     app.use(vite.middlewares);
   
     // Qualsiasi rotta → ritorna index.html trasformato da Vite
     app.use("*", async (req: Request, res: Response) => {
       try {
         const url = req.originalUrl;
         const templatePath = resolve(__dirname, "..", "client", "index.html");
         let template = await vite.transformIndexHtml(url, templatePath);
         res.status(200).set({ "Content-Type": "text/html" }).end(template);
       } catch (err) {
         vite.ssrFixStacktrace(err as Error);
         console.error(err);
         res.status(500).end(err instanceof Error ? err.message : "error");
       }
     });
   }
   
   /* ╔══════════════════════════════════════════════════════════════════════╗
      ║ 2. SERVE STATIC (usato in produzione)                               ║
      ╚══════════════════════════════════════════════════════════════════════╝ */
   export async function serveStatic(app: Express) {
     // Import dinamico per caricare Express solo quando serveStatic viene invocato
     const express = await import("express");
   
     // Gli asset buildati da Vite finiscono in dist/public/
     const distPath  = resolve(__dirname, "public");
     const indexHtml = resolve(distPath, "index.html");
   
     // Files statici (JS, CSS, immagini…)
     app.use("/", express.static(distPath));
   
     // Fallback SPA (qualsiasi rotta côté client)
     app.get("*", (_req: Request, res: Response) => {
       res.sendFile(indexHtml);
     });
   }
   