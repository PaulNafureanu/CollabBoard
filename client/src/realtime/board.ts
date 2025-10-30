import type {
  BoardPatchType,
  JsonPathType,
  JsonType,
  ReSyncBoardStateType,
} from "@collabboard/shared";
import { getSocket } from "./socket";

export function emitBoardPatch(
  roomId: number,
  boardStateId: number,
  baseVersion: number,
  path: JsonPathType,
  value: JsonType,
) {
  const payload: BoardPatchType = {
    roomId,
    boardStateId,
    baseVersion,
    patch: { path, value },
    at: Date.now(),
  };
  getSocket().emit("board_patch", payload);
}

export function onBoardPatch(handler: (p: BoardPatchType) => void) {
  const socket = getSocket();
  socket.on("board_patch", handler);
  return () => socket.off("board_patch", handler);
}

export function onReSyncBoardState(handler: (p: ReSyncBoardStateType) => void) {
  const socket = getSocket();
  socket.on("resync_board_state", handler);
  return () => socket.off("resync_board_state", handler);
}
