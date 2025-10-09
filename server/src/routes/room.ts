import { Router } from "express";
import { prisma } from "../db/prisma";

export const room = Router();

room.get("/:id", (req, res) => {
  const roomId = Number(req.params.id);
  const room = prisma.room.findFirstOrThrow({ where: { id: roomId } });
  res.json(room);
});

room.post("/", (req, res) => {});

room.delete("/:id", (req, res) => {});

room.put("/:id", (req, res) => {});
