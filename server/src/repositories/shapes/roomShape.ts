import { Prisma } from "../../generated/prisma";

export const publicRoomSelect = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  activeBoardStateId: true,
} satisfies Prisma.RoomSelect;

export type PublicRoomRow = Prisma.RoomGetPayload<{ select: typeof publicRoomSelect }>;

export const mapRoomRowToPublic = (r: PublicRoomRow) => ({
  id: r.id,
  name: r.name === "" ? `Room${r.id}` : r.name,
  createdAt: r.createdAt.getTime(),
  updatedAt: r.updatedAt.getTime(),
  activeBoardStateId: r.activeBoardStateId,
});
