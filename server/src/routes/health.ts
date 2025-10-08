import { Router } from "express";

export const health = Router();

health.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "server",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
