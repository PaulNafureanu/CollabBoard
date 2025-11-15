import type { BoardStatePublicRow } from "../../db";

export const DefaultBoardStatePayload = {} as const;

export const toBoardStatePublic = (s: BoardStatePublicRow) => ({
  id: s.id,
  boardId: s.boardId,
  version: s.version,
  payload: s.payload ?? DefaultBoardStatePayload,
  createdAt: s.createdAt.getTime(),
});
