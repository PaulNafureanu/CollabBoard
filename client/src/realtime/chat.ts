import type { ChatMessage, Typing } from "@collabboard/shared";
import { getSocket } from "./socket";

export function emitTyping(roomId: number, isTyping: boolean) {
  const payload: Typing = { roomId, isTyping, at: Date.now() };
  getSocket().emit("typing", payload);
}

export function onTyping(handler: (p: Typing) => void) {
  const socket = getSocket();
  socket.on("typing", handler);
  return () => socket.off("typing", handler);
}

export function onChatMessage(handler: (p: ChatMessage) => void) {
  const socket = getSocket();
  socket.on("chat_message", handler);
  return () => socket.off("chat_message", handler);
}
