import type { JoinRoomSchema, RoomStateSchema } from "@collabboard/shared";
import { getSocket } from "./socket";

export function emitJoinRoom(roomId: number) {
  const payload: JoinRoomSchema = { roomId };
  getSocket().emit("join_room", payload);
}

export function onRoomState(handler: (p: RoomStateSchema) => void) {
  const socket = getSocket();
  socket.on("room_state", handler);
  return () => socket.off("room_state", handler);
}
