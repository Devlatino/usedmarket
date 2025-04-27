/* server/routes.ts ─ esempio API router */

import { Router } from "express";
const router = Router();

router.get("/items", (_req, res) => {
  res.json({ items: [] });
});

/* wildcard compatibile Express 5 */
router.get("/:path*", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default router;
