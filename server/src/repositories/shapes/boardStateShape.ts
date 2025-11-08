import { Prisma } from "../../generated/prisma";

export const publicBoardStateSelect = {
  id: true,
  boardId: true,
  version: true,
  payload: true,
  createdAt: true,
} satisfies Prisma.BoardStateSelect;

export type PublicBoardStateRow = Prisma.BoardStateGetPayload<{ select: typeof publicBoardStateSelect }>;
export const DefaultBoardStatePayload: Prisma.InputJsonValue = {};

export const mapBoardStateRowToPublic = (s: PublicBoardStateRow) => ({
  id: s.id,
  boardId: s.boardId,
  version: s.version,
  payload: s.payload ?? DefaultBoardStatePayload,
  createdAt: s.createdAt.getTime(),
});
