import { Router } from "express";
import {
  DefaultBoardStatePayload,
  PublicBoard,
  PublicBoardState,
} from "../common/publicShapes";
import { createBoardState } from "../common/routeUtils";
import { prisma } from "../db/prisma";
import { CreateBody } from "../validators/boardStates";
import { IdParam } from "../validators/common";

export const boardStates = Router();

boardStates.get("/:id", async (req, res, next) => {
  try {
    const { id } = IdParam.parse(req.params);
    const state = await prisma.boardState.findUniqueOrThrow({
      where: { id },
      select: PublicBoardState,
    });
    res.status(200).json(state);
  } catch (err) {
    next(err);
  }
});

// No update, just create a new board state everytime to keep history (undo / redo features)
boardStates.post("/", async (req, res, next) => {
  try {
    const { boardId, version, payload } = CreateBody.parse(req.body);

    const state = await prisma.$transaction(async (tx) => {
      const board = await tx.board.findUniqueOrThrow({
        where: { id: boardId },
        select: PublicBoard,
      });

      return await createBoardState(
        board.roomId,
        boardId,
        version, // the client sends the (new) version counter
        payload ?? DefaultBoardStatePayload,
        tx,
      );
    });

    res.status(201).location(`/boardstates/${state.id}`).json(state);
  } catch (err) {
    next(err);
  }
});

boardStates.delete("/:id", async (req, res, next) => {
  try {
    const { id } = IdParam.parse(req.params);

    await prisma.$transaction(async (tx) => {
      const state = await tx.boardState.findUniqueOrThrow({
        where: { id },
        select: PublicBoardState,
      });

      const board = await tx.board.findUniqueOrThrow({
        where: { id: state.boardId },
        select: PublicBoard,
      });

      await tx.boardState.deleteMany({
        where: { boardId: state.boardId, version: { gte: state.version } },
      });

      let prevState = await tx.boardState.findFirst({
        where: { boardId: board.id },
        orderBy: [{ version: "desc" }, { id: "desc" }],
        select: PublicBoardState,
      });

      if (!prevState)
        prevState = await tx.boardState.create({
          data: {
            boardId: board.id,
            payload: DefaultBoardStatePayload,
            version: 1,
          },
        });

      await tx.board.update({
        where: { id: board.id },
        data: { lastState: prevState.id },
      });

      await tx.room.update({
        where: { id: board.roomId },
        data: { activeBoardStateId: prevState.id },
      });
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
