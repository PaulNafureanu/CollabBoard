import { inTx } from "../db/inTx";
import { Prisma } from "../generated/prisma";
import {
  DefaultBoardStatePayload,
  PublicBoard,
  PublicBoardState,
  PublicRoom,
} from "./publicShapes";

// Create a state AND sets it as active in the room
export const createBoardState = async (
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
        payload: payload ?? DefaultBoardStatePayload,
        version,
      },
      select: PublicBoardState,
    });

    // Make the new board state, the active ones in this room
    await db.room.update({
      where: { id: roomId },
      data: { activeBoardStateId: state.id },
    });

    // refresh for stale
    return await db.boardState.findUniqueOrThrow({
      where: { id: state.id },
      select: PublicBoardState,
    });
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

    const state = await createBoardState(
      roomId,
      board.id,
      1,
      DefaultBoardStatePayload,
      db,
    );

    return await db.board.update({
      where: { id: board.id },
      data: { lastState: state.id },
      select: PublicBoard,
    });
  });
};

export const activatePreBoardState = async (
  roomId: number,
  boardId: number,
  tx?: Prisma.TransactionClient,
) => {
  return await inTx(tx, async (db) => {
    const lastBoard = await db.board.findFirstOrThrow({
      where: { roomId, id: { not: boardId } },
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      take: 1,
    });

    await db.room.update({
      where: { id: roomId },
      data: { activeBoardStateId: lastBoard.lastState },
    });
  });
};

export const getActivatedRoom = async (
  roomId: number,
  boardId: number,
  lastState: number | null,
  tx?: Prisma.TransactionClient,
) => {
  return await inTx(tx, async (db) => {
    const { activeBoardStateId } = await db.room.findUniqueOrThrow({
      where: { id: roomId },
      select: PublicRoom,
    });

    if (activeBoardStateId === lastState) {
      const countBoards = await db.board.count({
        where: { roomId },
      });
      if (countBoards === 1) await createBoard(roomId, db);
      else if (countBoards > 1)
        await activatePreBoardState(roomId, boardId, db);
    }

    return await db.room.findUniqueOrThrow({
      where: { id: roomId },
      select: PublicRoom,
    });
  });
};
