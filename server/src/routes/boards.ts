import { Router } from "express";
import { prisma } from "../db/prisma";
import { IdParam, PageQuery } from "../validators/common";
import { BoardQuery, CreateBody, UpdateBody } from "../validators/boards";
import {
  getPageData,
  PublicBoard,
  PublicBoardState,
} from "../common/publicShapes";
import { createBoard } from "../common/routeUtils";

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

boards.get("/:id/boardstates", async (req, res, next) => {
  try {
    const { id: boardId } = IdParam.parse(req.params);
    const { page, size } = PageQuery.parse(req.query);

    const [totalItems, items] = await prisma.$transaction([
      prisma.boardState.count({ where: { boardId } }),
      prisma.boardState.findMany({
        where: { boardId },
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        skip: page * size,
        take: size,
        select: PublicBoardState,
      }),
    ]);

    res.status(200).json(getPageData(items, page, size, totalItems));
  } catch (err) {
    next(err);
  }
});

boards.post("/", async (req, res, next) => {
  try {
    const { roomId } = CreateBody.parse(req.body);
    const board = await createBoard(roomId);
    res.status(201).location(`/boards/${board.id}`).json(board);
  } catch (err) {
    next(err);
  }
});

// This will act as a copy/move a board from one room (sender) to another (receiver)
boards.patch("/:id", async (req, res, next) => {
  try {
    const { id } = IdParam.parse(req.params);
    const { roomId } = UpdateBody.parse(req.body);
    const { copy } = BoardQuery.parse(req.query);

    /**
     * Move from sender room to receiver room:
     * update board's roomID
     * room sender will have the last board (or a new board) with last (or new) state activated
     * the room receiver will have the active state the last state of this board
     *
     * Copy from sender room to reveiver room:
     * create a new board
     * create all board states with the same payloads as the original board state
     * the room receiver will have the active state the last state of this new board
     */

    const board = await prisma.board.findUniqueOrThrow({
      where: { id },
      select: PublicBoard,
    });

    if (copy) {
    } else {
      // Move:

      // const SenderRoom = await prisma.room.findUniqueOrThrow(where:{id:})

      const senderRoomBoards = await prisma.board.findMany({
        where: { roomId: board.roomId, id: { not: board.id } },
        take: 1,
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        select: { ...PublicBoard },
      });

      if (senderRoomBoards.length > 0) {
        await prisma.room.update({
          where: { id: board.roomId },
          data: { activeBoardStateId: 0 },
        });
      }
    }

    // const base = await prisma.board.findUniqueOrThrow({
    //   where: { id },
    //   select: PublicBoard,
    // });

    // await prisma.room.update({
    //   where: { id: base.id },
    //   data: {},
    // });

    // const board = await prisma.board.update({
    //   where: { id },
    //   data: { roomId },
    //   select: PublicBoard,
    // });

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
