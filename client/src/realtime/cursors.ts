import type { CursorMoveSchema } from "@collabboard/shared";
import { getSocket } from "./socket";

export function onCursorMove(handler: (p: CursorMoveSchema) => void) {
  const socket = getSocket();
  socket.on("cursor_move", handler);
  return () => socket.off("cursor_move", handler);
}

let rafId: number | null = null;
let lastPayload: Omit<CursorMoveSchema, "at"> | null = null;

export function emitCursorMove(
  roomId: number,
  userId: number,
  x: number,
  y: number,
) {
  lastPayload = { roomId, userId, x, y };
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = null;
    if (!lastPayload) return;
    getSocket().emit("cursor_move", { ...lastPayload, at: Date.now() });
    lastPayload = null;
  });
}
