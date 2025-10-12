import { Router } from "express";
import { prisma } from "../db/prisma";
import { IdParam } from "../validators/common";
import { CreateBody, UpdateBody } from "../validators/boards";
import { PublicBoard } from "../common/publicShapes";

export const boards = Router();

boards.get("/:id", async (req, res, next) => {
  try {
    const { id } = IdParam.parse(req.params);
    const board = await prisma.board.findUniqueOrThrow({
      where: { id },
      select: PublicBoard,
    });

    res.status(200).json(board);
  } catch (err) {
    next(err);
  }
});

boards.post("/", async (req, res, next) => {
  try {
    const { roomId } = CreateBody.parse(req.body);
    const board = await prisma.board.create({
      data: { roomId },
      select: PublicBoard,
    });
    res.status(201).location(`/boards/${board.id}`);

    //TODO: make it also active for the room
    //TODO: make a copy op from one room to another
  } catch (err) {
    next(err);
  }
});

boards.patch("/:id", async (req, res, next) => {
  try {
    const { id } = IdParam.parse(req.params);
    const { roomId } = UpdateBody.parse(req.body);
    // This acts as a move board from one room to another
    const board = await prisma.board.update({
      where: { id },
      data: { roomId },
      select: PublicBoard,
    });
    res.status(200).json(board);

    //TODO: if this board was the active board in a room, make a board the active board in that room
  } catch (err) {
    next(err);
  }
});

boards.delete("/:id", async (req, res, next) => {
  try {
    const { id } = IdParam.parse(req.params);
    await prisma.board.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
