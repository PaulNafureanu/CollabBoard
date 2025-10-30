import type {
  BoardPatchSchema,
  ReSyncBoardStateSchema,
} from "@collabboard/shared";
import { getSocket } from "./socket";
import type z from "zod";

export function emitBoardPatch(
  roomId: number,
  boardStateId: number,
  path: unknown,
  value: z.core.util.JSONType,
) {
  const payload: BoardPatchSchema = {
    roomId,
    boardStateId,
    version: 0, // server-only field
    patch: { path, value },
    at: Date.now(),
  };
  getSocket().emit("board_patch", payload);
}

export function onBoardPatch(handler: (p: BoardPatchSchema) => void) {
  const socket = getSocket();
  socket.on("board_patch", handler);
  return () => socket.off("board_patch", handler);
}

export function onReSyncBoardState(
  handler: (p: ReSyncBoardStateSchema) => void,
) {
  const socket = getSocket();
  socket.on("resync_board_state", handler);
  return () => socket.off("resync_board_state", handler);
}
