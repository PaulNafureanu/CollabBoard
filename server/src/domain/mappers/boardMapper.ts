import type { BoardPublicRow } from "../../db";

export const toBoardPublic = (b: BoardPublicRow) => ({
  id: b.id,
  roomId: b.roomId,
  name: b.name === "" ? `Board${b.id}` : b.name,
  createdAt: b.createdAt.getTime(),
  updatedAt: b.updatedAt.getTime(),
  lastState: b.lastState,
});
