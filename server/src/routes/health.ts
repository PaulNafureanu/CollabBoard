import { Router } from "express";
import { ensurePg } from "../db/pg";

export const health = Router();

health.get("/health", async (req, res) => {
  try {
    await ensurePg();

    res.json({
      ok: true,
      service: "server",
      db: "connected",
      // redis: pong == "PONG" ? "connected" : "unknown",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: (e as Error).message });
  }
});
