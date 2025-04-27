/* server/index.ts ---------------------------------------------------------- */
import "dotenv/config";                     // carica subito le env
import express from "express";
import { setupVite, serveStatic, log } from "./vite";
import apiRouter from "./routes.js";        // se usi routes

const app = express();
const PORT = Number(process.env.PORT) || 8080;

/* API routes (facoltative) */
app.use("/api", apiRouter);

(async () => {
  if (process.env.NODE_ENV !== "production") {
    await setupVite(app);
  } else {
    await serveStatic(app);
  }

  app.listen(PORT, () => log(`serving on port ${PORT}`));
})();
