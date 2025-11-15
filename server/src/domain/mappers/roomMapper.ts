import type { RoomPublic } from "@collabboard/shared";
import type { RoomPublicRow } from "../../db";

export const toRoomPublic = (r: RoomPublicRow): RoomPublic => ({
  id: r.id,
  name: r.name === "" ? `Room${r.id}` : r.name,
  createdAt: r.createdAt.getTime(),
  updatedAt: r.updatedAt.getTime(),
  activeBoardStateId: r.activeBoardStateId,
});
