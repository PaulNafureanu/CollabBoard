import { Router } from "express";
import { prisma } from "../db/prisma";

export const rooms = Router();

rooms.get("/:id", (req, res) => {
  const roomId = Number(req.params.id);
  const room = prisma.room.findFirstOrThrow({ where: { id: roomId } });
  res.json(room);
});

rooms.post("/", (req, res) => {});

rooms.delete("/:id", (req, res) => {});

rooms.put("/:id", (req, res) => {});
