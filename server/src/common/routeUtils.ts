import { JSONType } from "zod/v4/core/util.cjs";
import { inTx } from "../db/inTx";
import { Prisma, PrismaClient } from "../generated/prisma";
import {
  DefaultBoardStatePayload,
  PublicBoard,
  PublicBoardState,
} from "./publicShapes";

// Create a state AND sets it as active in the room
const createBoardState = async (
  roomId: number,
  boardId: number,
  version: number,
  payload: Prisma.InputJsonValue,
  tx?: Prisma.TransactionClient,
) => {
  return await inTx(tx, async (db) => {
    const state = await db.boardState.create({
      data: {
        boardId,
        payload: payload ?? {},
        version,
      },
      select: PublicBoardState,
    });

    // Make the board and the new board state, the active ones in this room
    await db.room.update({
      where: { id: roomId },
      data: { activeBoardId: boardId, activeBoardStateId: state.id },
    });

    return state;
  });
};

export const createBoard = async (
  roomId: number,
  tx?: Prisma.TransactionClient,
) => {
  return await inTx(tx, async (db) => {
    const board = await db.board.create({
      data: { roomId },
      select: PublicBoard,
    });

    await createBoardState(roomId, board.id, 1, DefaultBoardStatePayload, db);
    return board;
  });
};
