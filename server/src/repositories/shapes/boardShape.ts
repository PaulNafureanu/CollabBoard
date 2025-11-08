import { Prisma } from "../../generated/prisma";

export const publicBoardSelect = {
  id: true,
  roomId: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  lastState: true,
} satisfies Prisma.BoardSelect;

export type PublicBoardRow = Prisma.BoardGetPayload<{ select: typeof publicBoardSelect }>;

export const mapBoardRowToPublic = (b: PublicBoardRow) => ({
  id: b.id,
  roomId: b.roomId,
  name: b.name === "" ? `Board${b.id}` : b.name,
  createdAt: b.createdAt.getTime(),
  updatedAt: b.updatedAt.getTime(),
  lastState: b.lastState,
});
