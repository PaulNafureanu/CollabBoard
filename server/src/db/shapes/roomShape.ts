import { Prisma } from "../generated/prisma";

export const roomPublicSelect = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  activeBoardStateId: true,
} satisfies Prisma.RoomSelect;

export type RoomPublicRow = Prisma.RoomGetPayload<{ select: typeof roomPublicSelect }>;
