import { Prisma } from "../generated/prisma";

export const boardStatePublicSelect = {
  id: true,
  boardId: true,
  version: true,
  payload: true,
  createdAt: true,
} satisfies Prisma.BoardStateSelect;

export type BoardStatePublicRow = Prisma.BoardStateGetPayload<{ select: typeof boardStatePublicSelect }>;
