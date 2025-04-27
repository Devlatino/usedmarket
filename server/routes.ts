/* server/routes.ts --------------------------------------------------------- */
/* Esempio router con wildcard compatibile Express 5 */

import { Router } from "express";
const router = Router();

router.get("/:path*", (_req, res) => {
  res.json({ ok: true });
});

router.post("/:path*", (_req, res) => {
  res.status(201).json({ created: true });
});

export default router;
