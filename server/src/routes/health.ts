import { Router } from "express";
import { ensurePg } from "../db/pg";
import { redis } from "../db/redis";

export const health = Router();

health.get("/health", async (req, res) => {
  try {
    await ensurePg();
    const pong = await redis.ping();

    res.json({
      ok: true,
      service: "server",
      db: "connected",
      redis: pong == "PONG" ? "connected" : "unknown",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: (e as Error).message });
  }
});
