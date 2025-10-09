import { Router } from "express";
import { prisma } from "../db/prisma";

export const user = Router();

user.get("/:id", (req, res) => {
  const userId = Number(req.params.id);
  const user = prisma.user.findFirstOrThrow({ where: { id: userId } });
  res.json(user);
});

user.post("/", (req, res) => {});

user.delete("/:id", (req, res) => {});

user.put("/:id", (req, res) => {});
