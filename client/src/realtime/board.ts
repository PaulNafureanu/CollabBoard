import type { BoardPatch } from "@collabboard/shared";
import { getSocket } from "./socket";

export function emitBoardPatch(
  roomId: number,
  boardId: number,
  path: unknown,
  value: unknown,
) {
  const payload: BoardPatch = {
    roomId,
    boardId,
    patch: { path, value },
    at: Date.now(),
  };
  getSocket().emit("board_patch", payload);
}

export function onBoardPatch(handler: (p: BoardPatch) => void) {
  const socket = getSocket();
  socket.on("board_patch", handler);
  return () => socket.off("board_patch", handler);
}
