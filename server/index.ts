/* server/index.ts ─ bootstrap backend */

import "dotenv/config";
import express from "express";
import cors from "cors";
import { setupVite, serveStatic, log } from "./vite.js";
import apiRouter from "./routes.js";

const app  = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(cors());
app.use("/api", apiRouter);

/* health endpoint per Railway */
app.get("/healthz", (_req, res) => res.send("ok"));

(async () => {
  if (process.env.NODE_ENV !== "production") {
    await setupVite(app);
  } else {
    await serveStatic(app);
  }

  app.listen(PORT, () => log(`serving on port ${PORT}`));
})();
