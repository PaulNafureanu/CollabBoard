import type {
  JoinRoom,
  RoomMetadataChange,
  RoomState,
} from "@collabboard/shared";
import { getSocket } from "./socket";

export function onRoomMetadataChange(handler: (p: RoomMetadataChange) => void) {
  const socket = getSocket();
  socket.on("room_metadata_change", handler);
  return () => socket.off("room_metadata_change", handler);
}

export function emitJoinRoom(roomId: number) {
  const payload: JoinRoom = { roomId };
  getSocket().emit("join_room", payload);
}

export function onRoomState(handler: (p: RoomState) => void) {
  const socket = getSocket();
  socket.on("room_state", handler);
  return () => socket.off("room_state", handler);
}
