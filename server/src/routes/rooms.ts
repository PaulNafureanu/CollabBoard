import { Router } from "express";
import {
  getPageData,
  PublicBoard,
  PublicMembership,
  PublicMessage,
  PublicRoom,
} from "../common/publicShapes";
import { createBoard } from "../common/routeUtils";
import { prisma } from "../db/prisma";
import { Rooms, Common } from "@collabboard/shared";
const { CreateBody, UpdateBody } = Rooms.default;
const { IdParam, PageQuery } = Common.default;

export const rooms = Router();

// GET resources with pagination
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

rooms.get("/:id/memberships", async (req, res, next) => {
  try {
    const { id: roomId } = IdParam.parse(req.params);
    const { page, size } = PageQuery.parse(req.query);

    const [totalItems, items] = await prisma.$transaction([
      prisma.membership.count({ where: { roomId } }),
      prisma.membership.findMany({
        where: { roomId },
        orderBy: [{ joinedAt: "desc" }, { id: "desc" }],
        skip: page * size,
        take: size,
        select: PublicMembership,
      }),
    ]);

    res.status(200).json(getPageData(items, page, size, totalItems));
  } catch (err) {
    next(err);
  }
});

rooms.get("/:id/messages", async (req, res, next) => {
  try {
    const { id: roomId } = IdParam.parse(req.params);
    const { page, size } = PageQuery.parse(req.query);

    const [totalItems, items] = await prisma.$transaction([
      prisma.message.count({ where: { roomId } }),
      prisma.message.findMany({
        where: { roomId },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: page * size,
        take: size,
        select: PublicMessage,
      }),
    ]);

    res.status(200).json(getPageData(items, page, size, totalItems));
  } catch (err) {
    next(err);
  }
});

rooms.get("/:id/boards", async (req, res, next) => {
  try {
    const { id: roomId } = IdParam.parse(req.params);
    const { page, size } = PageQuery.parse(req.query);

    const [totalItems, items] = await prisma.$transaction([
      prisma.board.count({ where: { roomId } }),
      prisma.board.findMany({
        where: { roomId },
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        skip: page * size,
        take: size,
        select: PublicBoard,
      }),
    ]);

    res.status(200).json(getPageData(items, page, size, totalItems));
  } catch (err) {
    next(err);
  }
});

// Add/Modify/remove resources in DB
rooms.post("/", async (req, res, next) => {
  try {
    const { name } = CreateBody.parse(req.body);

    const room = await prisma.$transaction(async (tx) => {
      let roomTx;

      if (name !== undefined) {
        roomTx = await tx.room.create({
          data: { name },
          select: PublicRoom,
        });
      } else {
        const base = await tx.room.create({
          data: { name: "" },
          select: { id: true },
        });

        roomTx = await tx.room.update({
          where: { id: base.id },
          data: { name: `Room${base.id}` },
          select: PublicRoom,
        });
      }

      // Create board & boardstate and switch the new state as active for this new room
      await createBoard(roomTx.id, undefined, tx);
      // referesh to return the updated room with the active field
      return await tx.room.findUniqueOrThrow({
        where: { id: roomTx.id },
        select: PublicRoom,
      });
    });
    res.status(201).location(`/rooms/${room.id}`).json(room);
  } catch (err) {
    next(err);
  }
});

rooms.patch("/:id", async (req, res, next) => {
  try {
    const { id } = IdParam.parse(req.params);
    const { name, activeBoardStateId } = UpdateBody.parse(req.body);
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (activeBoardStateId !== undefined)
      data.activeBoardStateId = activeBoardStateId;

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
