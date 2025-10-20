import { Router } from "express";
import { prisma } from "../db/prisma";
import { IdParam, PageQuery } from "../validators/common";
import { BoardQuery, CreateBody, UpdateBody } from "../validators/boards";
import {
  DefaultBoardStatePayload,
  getPageData,
  PublicBoard,
  PublicBoardState,
  PublicRoom,
} from "../common/publicShapes";
import {
  activatePreBoardState,
  createBoard,
  getActivatedRoom,
} from "../common/routeUtils";

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
     * create all board states with the same payloads as the original board states
     * the room receiver will have the active state the last state of this new board
     */

    const updatedBoard = await prisma.$transaction(async (tx) => {
      const board = await tx.board.findUniqueOrThrow({
        where: { id },
        select: PublicBoard,
      });

      if (copy) {
        // Copy:

        // Get all states from sender board
        const states = await tx.boardState.findMany({
          where: { boardId: board.id },
          select: PublicBoardState,
        });

        // Create a new board
        const newBoard = await tx.board.create({
          data: { roomId },
          select: PublicBoard,
        });

        // Copy (create) board states to the new board
        await tx.boardState.createMany({
          data: states.map((state) => {
            return {
              boardId: newBoard.id,
              payload: state.payload ?? DefaultBoardStatePayload,
              version: state.version,
            };
          }),
        });

        // Get the last board state by version
        const { id: lastState } = await tx.boardState.findFirstOrThrow({
          where: { boardId: newBoard.id },
          orderBy: [{ version: "desc", id: "desc" }],
          take: 1,
        });

        // Set the room active state to that board state
        await tx.room.update({
          where: { id: roomId },
          data: { activeBoardStateId: lastState },
        });

        // Return the new board with the updated last state version
        return await tx.board.update({
          where: { id: newBoard.id },
          data: { lastState },
          select: PublicBoard,
        });
      } else {
        // Move:

        await getActivatedRoom(board.roomId, board.id, board.lastState, tx);
        await tx.board.update({ where: { id: board.id }, data: { roomId } });
        await tx.room.update({
          where: { id: roomId },
          data: { activeBoardStateId: board.lastState },
        });
      }

      return await tx.board.findUniqueOrThrow({
        where: { id },
        select: PublicBoard,
      });
    });

    res.status(200).json(updatedBoard);
  } catch (err) {
    next(err);
  }
});

boards.delete("/:id", async (req, res, next) => {
  try {
    const { id } = IdParam.parse(req.params);
    await prisma.$transaction(async (tx) => {
      const board = await tx.board.findUniqueOrThrow({
        where: { id },
        select: PublicBoard,
      });

      await getActivatedRoom(board.roomId, board.id, board.lastState, tx);

      await tx.board.delete({ where: { id } });
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
