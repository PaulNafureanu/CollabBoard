import { Prisma } from "../generated/prisma";

export const boardPublicSelect = {
  id: true,
  roomId: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  lastState: true,
} satisfies Prisma.BoardSelect;

export type BoardPublicRow = Prisma.BoardGetPayload<{ select: typeof boardPublicSelect }>;
