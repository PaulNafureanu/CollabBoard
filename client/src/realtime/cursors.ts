import type { CursorMove } from "@collabboard/shared";
import { getSocket } from "./socket";

export function onCursorMove(handler: (p: CursorMove) => void) {
  const socket = getSocket();
  socket.on("cursor_move", handler);
  return () => socket.off("cursor_move", handler);
}

let rafId: number | null = null;
let lastPayload: { roomId: number; x: number; y: number } | null = null;

export function emitCursorMove(roomId: number, x: number, y: number) {
  lastPayload = { roomId, x, y };
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = null;
    if (!lastPayload) return;
    getSocket().emit("cursor_move", { ...lastPayload, at: Date.now() });
    lastPayload = null;
  });
}
