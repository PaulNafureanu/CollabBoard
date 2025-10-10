import { Router } from "express";
import { prisma } from "../db/prisma";
import { CreateBody, UpdateBody } from "../validators/rooms";
import { IdParam } from "../validators/common";

export const rooms = Router();

const PublicRoom = {
  id: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
  activeBoardId: true,
};

rooms.get("/:id", async (req, res, next) => {
  try {
    const { id } = IdParam.parse(req.params);
    const room = await prisma.room.findUniqueOrThrow({
      where: { id },
      select: PublicRoom,
    });
    res.status(200).json(room);
  } catch (err) {
    next(err);
  }
});

// TODO: includes board states init

rooms.post("/", async (req, res, next) => {});

rooms.patch("/:id", async (req, res, next) => {
  try {
    const { id } = IdParam.parse(req.params);
    const { slug, activeBoardId } = UpdateBody.parse(req.body);
    const data: any = {};
    if (slug !== undefined) data.slug = slug;
    if (activeBoardId !== undefined) data.activeBoardId = activeBoardId;

    const room = await prisma.room.update({
      where: { id },
      data,
      select: PublicRoom,
    });
    res.status(200).json(room);
  } catch (err) {
    next(err);
  }
});

rooms.delete("/:id", async (req, res, next) => {
  try {
    const { id } = IdParam.parse(req.params);
    await prisma.room.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
