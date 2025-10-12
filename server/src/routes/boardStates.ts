import { Router } from "express";
import { prisma } from "../db/prisma";
import { IdParam } from "../validators/common";
import { CreateBody } from "../validators/boardStates";
import { PublicBoardState } from "../common/publicShapes";

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

    const state = await prisma.boardState.create({
      data: { boardId, payload: payload ?? {}, version: version + 1 },
      select: PublicBoardState,
    });

    // TODO: if active board, make this state the active state in the room
    res.status(201).location(`/boardstates/${state.id}`).json(state);
  } catch (err) {
    next(err);
  }
});

boardStates.delete("/:id", async (req, res, next) => {
  try {
    const { id } = IdParam.parse(req.params);
    const state = await prisma.boardState.findUniqueOrThrow({
      where: { id },
      select: PublicBoardState,
    });

    // Delete all boardstates equal or higher in version number within the same board.
    await prisma.boardState.deleteMany({
      where: { boardId: state.boardId, version: { gte: state.version } },
    });

    // TODO: If one of the deleted states is the active state, make the state.version - 1 the active one, or create a new blank state for the current room
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
