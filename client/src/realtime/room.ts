import type {
  JoinRoomSchema,
  ReSyncRoomStateSchema,
  RoomClosedSchema,
  RoomStateSchema,
} from "@collabboard/shared";
import { getSocket } from "./socket";

export function emitJoinRoom(roomId: number) {
  const payload: JoinRoomSchema = { roomId };
  getSocket().emit("join_room", payload);
}

export function emitReSyncRoomState(roomId: number) {
  const payload: ReSyncRoomStateSchema = { roomId };
  getSocket().emit("resync_room_state", payload);
}

export function onRoomState(handler: (p: RoomStateSchema) => void) {
  const socket = getSocket();
  socket.on("room_state", handler);
  return () => socket.off("room_state", handler);
}

export function onRoomClosed(handler: (p: RoomClosedSchema) => void) {
  const socket = getSocket();
  socket.on("room_closed", handler);
  return () => socket.off("room_closed", handler);
}
