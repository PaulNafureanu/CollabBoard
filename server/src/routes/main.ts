import { Router } from "express";

export const main = Router();

main.get("/", (req, res) => {
  res.json({ ok: true, message: "Hello from API CollabBoard" });
});
