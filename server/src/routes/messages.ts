import { Router } from "express";
import { PublicMessage, PublicUser } from "../common/publicShapes";
import { prisma } from "../db/prisma";
import { IdParam } from "../validators/common";
import { CreateBody, UpdateBody } from "../validators/messages";

export const messages = Router();

messages.get("/:id", async (req, res, next) => {
  try {
    const { id } = IdParam.parse(req.params);
    const message = await prisma.message.findUniqueOrThrow({
      where: { id },
      select: PublicMessage,
    });
    res.status(200).json(message);
  } catch (err) {
    next(err);
  }
});

messages.post("/", async (req, res, next) => {
  try {
    const { roomId, userId, text } = CreateBody.parse(req.body);

    const message = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirstOrThrow({
        where: { id: userId },
        select: PublicUser,
      });

      return await tx.message.create({
        data: {
          roomId,
          userId,
          text,
          author: user.username ?? `User${userId}`,
        },
        select: PublicMessage,
      });
    });

    res.status(201).location(`/messages/${message.id}`).json(message);
  } catch (err) {
    next(err);
  }
});

messages.patch("/:id", async (req, res, next) => {
  try {
    const { id } = IdParam.parse(req.params);
    const { text } = UpdateBody.parse(req.body);

    const message = await prisma.message.update({
      where: { id },
      data: { text },
      select: PublicMessage,
    });

    res.status(200).json(message);
  } catch (err) {
    next(err);
  }
});

messages.delete("/:id", async (req, res, next) => {
  try {
    const { id } = IdParam.parse(req.params);
    await prisma.message.delete({ where: { id } });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
